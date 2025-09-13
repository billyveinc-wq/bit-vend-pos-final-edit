#!/usr/bin/env node
// Usage: ADMIN_URL=http://localhost:8787 ADMIN_KEY=xxx node scripts/test-validate-subscriptions.js
const fetch = global.fetch || require('node-fetch');

const ADMIN_URL = process.env.ADMIN_URL || process.env.ADMIN_SERVER_URL || 'http://localhost:8787';
const ADMIN_KEY = process.env.ADMIN_KEY || process.env.ADMIN_API_KEY || 'change-me';

(async function(){
  try {
    const res = await fetch(`${ADMIN_URL.replace(/\/+$/, '')}/admin/validate-subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY }
    });
    const txt = await res.text();
    console.log('Status:', res.status);
    console.log(txt);
    process.exit(res.ok ? 0 : 1);
  } catch (e) {
    console.error('Error calling validate-subscriptions', e);
    process.exit(1);
  }
})();
