#!/usr/bin/env node
// Usage: node scripts/validate-deletion.js <userId> [--delete]
// This script checks common tables for records related to a userId. It does not modify data by default.

const fetch = global.fetch || require('node-fetch');
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const adminUrl = process.env.ADMIN_URL || process.env.SUPERADMIN_URL;
const adminKey = process.env.ADMIN_KEY || process.env.SUPERADMIN_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing SUPABASE URL or ANON KEY. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  process.exit(1);
}

const userId = process.argv[2];
const doDelete = process.argv.includes('--delete');

if (!userId) {
  console.error('Usage: node scripts/validate-deletion.js <userId> [--delete]');
  process.exit(1);
}

const tablesToCheck = [
  'system_users',
  'companies',
  'company_users',
  'user_subscriptions',
  'locations',
  'products',
  'sales',
  'expenses'
];

async function checkTable(table) {
  // Build a conservative OR query for common user columns
  const orParts = [`id.eq.${userId}`, `user_id.eq.${userId}`, `created_by.eq.${userId}`];
  const query = `?select=id&or=(${orParts.join(',')})`;
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json'
      }
    });
    if (!res.ok) {
      return { table, error: `${res.status} ${res.statusText}` };
    }
    const json = await res.json();
    return { table, count: Array.isArray(json) ? json.length : 0, sample: Array.isArray(json) ? json.slice(0,5) : [] };
  } catch (e) {
    return { table, error: String(e) };
  }
}

async function main(){
  console.log('Validating deletion for user:', userId);
  const results = [];
  for (const t of tablesToCheck) {
    const r = await checkTable(t);
    results.push(r);
  }
  console.table(results.map(r => ({ table: r.table, count: r.count ?? 0, error: r.error || '' })));

  if (doDelete) {
    if (!adminUrl || !adminKey) {
      console.error('Admin URL/KEY not provided. Set ADMIN_URL and ADMIN_KEY in env to enable admin deletion.');
      process.exit(1);
    }
    console.log('Calling admin delete endpoint...');
    try {
      const resp = await fetch(`${adminUrl.replace(/\/+$/, '')}/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ userId, immediate: true })
      });
      const body = await resp.text();
      if (!resp.ok) {
        console.error('Admin delete failed:', resp.status, body);
        process.exit(1);
      }
      console.log('Admin delete response:', body);
    } catch (e) {
      console.error('Failed to call admin delete:', String(e));
      process.exit(1);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
