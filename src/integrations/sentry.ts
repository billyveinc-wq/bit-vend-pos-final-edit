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
}

export { Sentry };
