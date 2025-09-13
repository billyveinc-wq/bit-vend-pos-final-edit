/*
 * Simple Express admin server that exposes secure endpoints for administrative actions.
 * Requires environment variable SUPABASE_SERVICE_ROLE set to your Supabase Service Role key.
 * WARNING: Run this on a secure server (not client-side). Protect access (IP restriction, auth, etc.).
 */
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
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

// Admin-only middleware applied to /admin routes
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change-me';
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.headers['admin-api-key'];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ===== Admin endpoints =====
const adminRouter = express.Router();

// Public endpoint for users to request deletion of their own account (soft delete by default).
// This route verifies the provided bearer token and uses the service role client to perform a safe soft delete.
app.post('/self-delete', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token' });
    const token = authHeader.replace(/^Bearer\s+/, '').trim();

    // Verify token and get user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' });
    const user = userData.user;

    // Confirm this user is the first user
    const { data: su } = await supabase.from('system_users').select('id, is_first_user, created_at').order('created_at').limit(1).maybeSingle();
    const isFirst = (su && ((su.is_first_user === true) || (su.id === user.id))) || false;
    if (!isFirst) return res.status(403).json({ error: 'Only the first (owner) user may request full account deletion via this endpoint' });

    const { immediate = false } = req.body || {};

    if (immediate) {
      // Hard delete the user's related records and auth entry
      await supabase.from('user_subscriptions').delete().eq('user_id', user.id);
      await supabase.from('user_promotions').delete().eq('user_id', user.id);
      await supabase.from('company_users').delete().eq('user_id', user.id);
      await supabase.from('system_users').delete().eq('id', user.id);

      const { error: delAuthErr } = await supabase.auth.admin.deleteUser(user.id);
      if (delAuthErr) return res.status(500).json({ error: 'Failed deleting auth user', details: delAuthErr });

      return res.json({ ok: true, type: 'immediate' });
    }

    // Soft delete using the database RPC (30-day retention)
    const { data, error } = await supabase.rpc('soft_delete_user_account', {
      target_user_id: user.id,
      target_email: user.email || null
    });

    if (error) {
      console.error('Soft delete RPC failed:', error);
      return res.status(500).json({ error: 'Soft delete failed', details: error });
    }

    return res.json({ ok: true, type: 'soft_delete', deletion_id: data, retention_days: 30 });
  } catch (err) {
    console.error('Self-delete error:', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});
adminRouter.post('/delete-user', async (req, res) => {
  const { userId, email, immediate = false } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    if (immediate) {
      // Immediate hard delete (for emergency/admin use)
      await supabase.from('user_subscriptions').delete().eq('user_id', userId);
      await supabase.from('user_promotions').delete().eq('user_id', userId);
      await supabase.from('company_users').delete().eq('user_id', userId);
      await supabase.from('system_users').delete().eq('id', userId);

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error('Failed deleting auth user:', error);
        return res.status(500).json({ error: 'Failed deleting auth user', details: error });
      }

      return res.json({ ok: true, type: 'immediate' });
    } else {
      // Soft delete with 30-day retention
      const { data, error } = await supabase.rpc('soft_delete_user_account', {
        target_user_id: userId,
        target_email: email || null
      });

      if (error) {
        console.error('Failed soft deleting user:', error);
        return res.status(500).json({ error: 'Failed soft deleting user', details: error });
      }

      return res.json({
        ok: true,
        type: 'soft_delete',
        deletion_id: data,
        retention_days: 30,
        message: 'Account marked for deletion. Data will be permanently removed after 30 days.'
      });
    }
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

// New endpoint to check account deletion status
adminRouter.get('/deletion-status/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const { data, error } = await supabase.rpc('get_account_deletion_status', {
      target_user_id: userId
    });

    if (error) {
      console.error('Failed getting deletion status:', error);
      return res.status(500).json({ error: 'Failed getting deletion status', details: error });
    }

    return res.json({ status: data });
  } catch (err) {
    console.error('Get deletion status error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

// New endpoint to cleanup expired account deletions
adminRouter.post('/cleanup-expired-deletions', async (req, res) => {
  try {
    // First, run the database cleanup function
    const { data: cleanupCount, error: dbError } = await supabase.rpc('cleanup_expired_account_deletions');

    if (dbError) {
      console.error('Database cleanup error:', dbError);
      return res.status(500).json({ error: 'Database cleanup failed', details: dbError });
    }

    // Get all completed deletions that still need auth user cleanup
    const { data: completedDeletions, error: fetchError } = await supabase
      .from('account_deletions')
      .select('id, user_id, email')
      .eq('cleanup_completed', true)
      .is('cleanup_completed_at', null);

    if (fetchError) {
      console.error('Failed fetching completed deletions:', fetchError);
      return res.status(500).json({ error: 'Failed fetching completed deletions', details: fetchError });
    }

    let authCleanupCount = 0;
    const authCleanupErrors = [];

    // Clean up auth users for completed deletions
    for (const deletion of completedDeletions || []) {
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(deletion.user_id);
        if (authError) {
          console.error(`Failed deleting auth user ${deletion.user_id}:`, authError);
          authCleanupErrors.push({ user_id: deletion.user_id, error: authError.message });
        } else {
          // Mark auth cleanup as completed
          await supabase
            .from('account_deletions')
            .update({ cleanup_completed_at: new Date().toISOString() })
            .eq('id', deletion.id);
          authCleanupCount++;
        }
      } catch (err) {
        console.error(`Error processing auth cleanup for ${deletion.user_id}:`, err);
        authCleanupErrors.push({ user_id: deletion.user_id, error: err.message });
      }
    }

    return res.json({
      ok: true,
      database_cleanup_count: cleanupCount,
      auth_cleanup_count: authCleanupCount,
      auth_cleanup_errors: authCleanupErrors,
      total_processed: cleanupCount + authCleanupCount
    });
  } catch (err) {
    console.error('Cleanup expired deletions error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

// New endpoint to restore a soft-deleted account (within 30 days)
adminRouter.post('/restore-user', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Check if account is soft-deleted and within restoration period
    const { data: deletionStatus, error: statusError } = await supabase.rpc('get_account_deletion_status', {
      target_user_id: userId
    });

    if (statusError) {
      return res.status(500).json({ error: 'Failed checking deletion status', details: statusError });
    }

    if (!deletionStatus.is_deleted) {
      return res.status(400).json({ error: 'Account is not deleted' });
    }

    if (deletionStatus.cleanup_completed) {
      return res.status(400).json({ error: 'Account has been permanently deleted and cannot be restored' });
    }

    if (deletionStatus.days_remaining <= 0) {
      return res.status(400).json({ error: 'Restoration period has expired' });
    }

    // Restore the account by removing deletion markers
    const { error: restoreError } = await supabase.from('system_users')
      .update({ status: 'active', deleted_at: null })
      .eq('id', userId);

    if (restoreError) {
      return res.status(500).json({ error: 'Failed restoring system user', details: restoreError });
    }

    // Restore related data
    await supabase.from('user_subscriptions')
      .update({ deleted_at: null, deletion_id: null })
      .eq('user_id', userId);

    await supabase.from('user_promotions')
      .update({ deleted_at: null, deletion_id: null })
      .eq('user_id', userId);

    await supabase.from('company_users')
      .update({ deleted_at: null, deletion_id: null })
      .eq('user_id', userId);

    // Mark the deletion record as cancelled
    await supabase.from('account_deletions')
      .update({
        cleanup_completed: true,
        cleanup_completed_at: new Date().toISOString(),
        metadata: { ...deletionStatus.metadata, restoration_date: new Date().toISOString(), status: 'restored' }
      })
      .eq('id', deletionStatus.deletion_id);

    return res.json({
      ok: true,
      message: 'Account successfully restored',
      days_remaining_before_restore: deletionStatus.days_remaining
    });
  } catch (err) {
    console.error('Restore user error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

adminRouter.get('/list-users', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error });
    return res.json({ users: data });
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ error: 'Internal error', details: err });
  }
});

adminRouter.post('/sync-users', async (req, res) => {
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

// Admin endpoint to validate and repair subscription timestamps
adminRouter.post('/validate-subscriptions', async (req, res) => {
  try {
    const { data: subs, error } = await supabase.from('user_subscriptions').select('*');
    if (error) throw error;
    const report = [];
    for (const s of subs || []) {
      const id = s.id;
      const updates = {};
      const started = s.started_at ? new Date(s.started_at) : null;
      const trialEnd = s.trial_ends_at ? new Date(s.trial_ends_at) : null;
      const expires = s.expires_at ? new Date(s.expires_at) : null;

      // If status suggests trial but trial_ends_at missing, set trial_end = started + 14d
      if (started && (!trialEnd) && String(s.status || '').toLowerCase().includes('trial')) {
        const t = new Date(started);
        t.setDate(t.getDate() + 14);
        updates.trial_ends_at = t.toISOString();
      }

      // If expires_at is missing for active subscriptions, set expires = started + 1 month
      if (started && (!expires) && String(s.status || '').toLowerCase() === 'active') {
        const e = new Date(started);
        e.setMonth(e.getMonth() + 1);
        updates.expires_at = e.toISOString();
      }

      // Fix if expires_at is before started_at
      if (started && expires && expires.getTime() < started.getTime()) {
        const e = new Date(started);
        e.setMonth(e.getMonth() + 1);
        updates.expires_at = e.toISOString();
      }

      if (Object.keys(updates).length > 0) {
        const { error: upErr } = await supabase.from('user_subscriptions').update(updates).eq('id', id);
        report.push({ id, updates, error: upErr ? upErr.message : null });
      }
    }

    return res.json({ ok: true, count: report.length, report });
  } catch (err) {
    console.error('validate-subscriptions error', err);
    return res.status(500).json({ error: 'Internal error', details: String(err) });
  }
});

app.use('/admin', adminAuth, adminRouter);

// ===== Payments API & Webhooks =====

// Helpers
const formatTimestamp = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
};

const getCompanyProvider = async (companyId, providerKey) => {
  const { data, error } = await supabase
    .from('payment_provider_settings')
    .select('enabled, credentials, env, provider_key')
    .eq('company_id', companyId)
    .eq('provider_key', providerKey)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

// Simple test endpoints to validate credentials exist server-side
app.post('/api/payments/:provider/test', async (req, res) => {
  try {
    const { provider } = req.params;
    const { company_id } = req.body || {};
    if (!company_id) return res.status(400).json({ error: 'company_id required' });
    const settings = await getCompanyProvider(company_id, provider);
    const ok = !!(settings && settings.enabled && settings.credentials && Object.keys(settings.credentials || {}).length > 0);
    return res.json({ ok });
  } catch (err) {
    console.error('Test endpoint error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// M-Pesa STK Push initiation
app.post('/api/payments/mpesa/stk-push', async (req, res) => {
  try {
    const { company_id, phone, amount, currency, reference } = req.body || {};
    if (!company_id || !phone || !amount) {
      return res.status(400).send('company_id, phone, amount required');
    }
    const settings = await getCompanyProvider(company_id, 'mpesa');
    if (!settings || !settings.enabled) return res.status(400).send('M-Pesa not enabled');
    const creds = settings.credentials || {};
    const consumerKey = creds.consumerKey;
    const consumerSecret = creds.consumerSecret;
    const passkey = creds.passkey;
    const shortcode = creds.shortcode;
    const env = settings.env || 'sandbox';
    if (!consumerKey || !consumerSecret || !passkey || !shortcode) return res.status(400).send('Missing M-Pesa credentials');

    const baseUrl = env === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    const basic = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResp = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET', headers: { Authorization: `Basic ${basic}` }
    });
    if (!tokenResp.ok) {
      const t = await tokenResp.text();
      return res.status(502).send(`Token error: ${t}`);
    }
    const tokenJson = await tokenResp.json();
    const accessToken = tokenJson.access_token;

    const timestamp = formatTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/payments/mpesa/callback`;

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount)),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: reference || `BV-${Date.now()}`,
      TransactionDesc: 'POS payment'
    };

    const stkResp = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(stkPayload)
    });

    const stkJson = await stkResp.json().catch(() => ({}));
    if (!stkResp.ok) {
      return res.status(502).send(typeof stkJson === 'object' ? JSON.stringify(stkJson) : 'STK push error');
    }

    await supabase.from('payment_transactions').insert({
      company_id,
      provider_key: 'mpesa',
      external_id: stkJson.CheckoutRequestID || null,
      amount: Number(amount),
      currency: currency || 'KES',
      status: 'pending',
      metadata: { request: stkJson, reference }
    });

    return res.json({ ok: true, data: stkJson });
  } catch (err) {
    console.error('STK Push error', err);
    return res.status(500).send('Internal error');
  }
});

// Webhook raw body parsers
const rawBody = express.raw({ type: '*/*' });

// M-Pesa callback (Daraja)
app.post('/api/payments/mpesa/callback', rawBody, async (req, res) => {
  try {
    const text = req.body.toString('utf8');
    const body = JSON.parse(text);
    const cb = body?.Body?.stkCallback;
    if (!cb) { res.status(400).send('Invalid'); return; }
    const checkoutId = cb.CheckoutRequestID;
    const resultCode = cb.ResultCode;
    const resultDesc = cb.ResultDesc;
    const metaItems = cb.CallbackMetadata?.Item || [];
    const mpesaReceipt = (metaItems.find(i => i.Name === 'MpesaReceiptNumber') || {}).Value || null;

    await supabase.from('payment_transactions')
      .update({
        status: resultCode === 0 ? 'success' : 'failed',
        external_id: checkoutId,
        metadata: { ...(cb || {}), mpesaReceipt, resultDesc }
      })
      .eq('external_id', checkoutId)
      .eq('provider_key', 'mpesa');

    res.json({ ok: true });
  } catch (err) {
    console.error('M-Pesa callback error', err);
    res.status(200).json({ ok: true });
  }
});

// PayPal webhook (stores raw, verify via configurable webhookSecret if provided)
app.post('/api/payments/paypal/webhook', rawBody, async (req, res) => {
  try {
    const text = req.body.toString('utf8');
    const sigHeader = req.headers['x-webhook-signature'] || req.headers['paypal-transmission-sig'];
    const companyId = Number(req.query.company_id || 0) || null;
    let verified = false;
    if (companyId) {
      const settings = await getCompanyProvider(companyId, 'paypal');
      const secret = settings?.credentials?.webhookSecret;
      if (secret && sigHeader) {
        const hmac = crypto.createHmac('sha256', secret).update(text, 'utf8').digest('hex');
        verified = (hmac === sigHeader || `sha256=${hmac}` === sigHeader);
      }
      await supabase.from('payment_transactions').insert({
        company_id: companyId,
        provider_key: 'paypal',
        external_id: null,
        amount: 0,
        currency: 'USD',
        status: 'received',
        metadata: { headers: req.headers, verified },
      });
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('PayPal webhook error', err);
    res.status(200).send('OK');
  }
});

// Flutterwave webhook (stores raw, verify via secret-hash if provided)
app.post('/api/payments/flutterwave/webhook', rawBody, async (req, res) => {
  try {
    const text = req.body.toString('utf8');
    const sigHeader = req.headers['verif-hash'] || req.headers['x-webhook-signature'];
    const companyId = Number(req.query.company_id || 0) || null;
    let verified = false;
    if (companyId) {
      const settings = await getCompanyProvider(companyId, 'flutterwave');
      const secret = settings?.credentials?.secretHash || settings?.credentials?.webhookSecret;
      if (secret && sigHeader) {
        verified = secret === sigHeader;
      }
      await supabase.from('payment_transactions').insert({
        company_id: companyId,
        provider_key: 'flutterwave',
        external_id: null,
        amount: 0,
        currency: 'USD',
        status: 'received',
        metadata: { headers: req.headers, verified },
      });
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Flutterwave webhook error', err);
    res.status(200).send('OK');
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Admin & Payments server running on port ${port}`));
