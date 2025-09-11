import { Sentry } from '@/integrations/sentry';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_INTERVAL_MS = 60_000;
const SLOW_THRESHOLD_MS = 2_000;
let started = false;

async function ping(url: string) {
  const t0 = performance.now();
  const res = await fetch(url, { cache: 'no-store' });
  const ms = Math.round(performance.now() - t0);
  return { ok: res.ok, status: res.status, ms };
}

async function checkFrontend(): Promise<{ ok: boolean; status: number; ms: number }> {
  try {
    const { ok, status, ms } = await ping(`${location.origin}/robots.txt?hb=${Date.now()}`);
    if (!ok) {
      try { Sentry.captureMessage('uptime: frontend heartbeat failed', 'error'); } catch {}
    } else if (ms > SLOW_THRESHOLD_MS) {
      try { Sentry.captureMessage('uptime: frontend slow response', 'warning'); } catch {}
    }
    return { ok, status, ms };
  } catch (e) {
    try { Sentry.captureException(e); } catch {}
    return { ok: false, status: 0, ms: 0 };
  }
}

async function checkSupabase(): Promise<{ ok: boolean; ms: number }> {
  const t0 = performance.now();
  try {
    const { error } = await supabase.from('companies').select('id').limit(1);
    const ms = Math.round(performance.now() - t0);
    if (error) {
      try { Sentry.captureMessage('uptime: supabase query failed', 'error'); } catch {}
      return { ok: false, ms };
    }
    if (ms > SLOW_THRESHOLD_MS) {
      try { Sentry.captureMessage('uptime: supabase slow response', 'warning'); } catch {}
    }
    return { ok: true, ms };
  } catch (e) {
    try { Sentry.captureException(e); } catch {}
    return { ok: false, ms: Math.round(performance.now() - t0) };
  }
}

export async function runUptimeCheckNow() {
  const front = await checkFrontend();
  const db = await checkSupabase();
  const summary = `uptime: check complete front ok=${front.ok} ${front.status} ${front.ms}ms, db ok=${db.ok} ${db.ms}ms`;
  try { Sentry.captureMessage(summary, 'info'); } catch {}
  return { front, db };
}

export function startUptimeMonitor() {
  if (started) return;
  started = true;
  // immediate check (non-blocking)
  runUptimeCheckNow();
  // schedule
  setInterval(() => { void runUptimeCheckNow(); }, HEARTBEAT_INTERVAL_MS);
}
