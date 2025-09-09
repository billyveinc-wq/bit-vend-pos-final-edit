/*
 * Simple Express admin server that exposes secure endpoints for administrative actions.
 * Requires environment variable SUPABASE_SERVICE_ROLE set to your Supabase Service Role key.
 * WARNING: Run this on a secure server (not client-side). Protect access (IP restriction, auth, etc.).
 */
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables. Exiting.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Middleware: simple token-based auth (expect ADMIN_API_KEY header). You should replace this with proper auth.
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change-me';
app.use((req, res, next) => {
  const key = req.headers['x-admin-key'] || req.headers['admin-api-key'];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Delete user endpoint: deletes auth user and related data
app.post('/admin/delete-user', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Delete related public tables first (so FK constraints don't block)
    await supabase.from('user_subscriptions').delete().eq('user_id', userId);
    await supabase.from('user_promotions').delete().eq('user_id', userId);
    await supabase.from('company_users').delete().eq('user_id', userId);
    await supabase.from('system_users').delete().eq('id', userId);

    // Delete auth user using Admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Failed deleting auth user:', error);
      return res.status(500).json({ error: 'Failed deleting auth user', details: error });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

// List users endpoint: returns auth.users (requires service role)
app.get('/admin/list-users', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error });
    return res.json({ users: data });
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

// Sync auth.users into public.system_users table (upsert)
app.post('/admin/sync-users', async (req, res) => {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Failed listing users for sync', error);
      return res.status(500).json({ error });
    }

    const payload = (users || []).map(u => ({
      id: u.id,
      email: u.email,
      user_metadata: u.user_metadata || null,
      created_at: u.created_at || null,
      last_sign_in_at: u.last_sign_in_at || null
    }));

    if (payload.length > 0) {
      const { error: upErr } = await supabase.from('system_users').upsert(payload, { onConflict: 'id' });
      if (upErr) {
        console.error('Upsert system_users error', upErr);
        return res.status(500).json({ error: upErr });
      }
    }

    return res.json({ ok: true, count: payload.length });
  } catch (err) {
    console.error('Sync users error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Admin server running on port ${port}`));
