import * as Sentry from '@sentry/react';

const dsn = (import.meta as any).env?.VITE_SENTRY_DSN as string | undefined;

if (dsn) {
  Sentry.init({
    dsn,
    environment: (import.meta as any).env?.MODE,
    release: (import.meta as any).env?.VITE_APP_VERSION,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    integrations: (integrations) => {
      const base = integrations ?? [];
      const extra = [] as any[];
      try { extra.push(Sentry.browserTracingIntegration()); } catch {}
      try { extra.push(Sentry.replayIntegration()); } catch {}
      return [...base, ...extra];
    },
  });

  // One-time automatic diagnostics to verify connectivity
  try {
    const KEY = 'sentry_diag_sent';
    const sent = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : '1';
    if (!sent) {
      Sentry.captureMessage('Sentry diagnostics: auto test message', 'info');
      try {
        throw new Error('Sentry diagnostics: auto test error');
      } catch (e) {
        Sentry.captureException(e);
      }
      if (typeof window !== 'undefined') window.localStorage.setItem(KEY, new Date().toISOString());
    }
  } catch {}
}

export { Sentry };
