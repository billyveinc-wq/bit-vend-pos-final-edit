import './integrations/sentry';
import { startUptimeMonitor } from './monitoring/uptime';
import { setupAutomaticCleanup } from './services/accountCleanupService';
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

startUptimeMonitor();

// Initialize automatic account cleanup (30-day retention)
try {
  setupAutomaticCleanup();
} catch (error) {
  console.warn('Failed to setup automatic account cleanup:', error);
}

// Suppress noisy ResizeObserver loop warnings caused by third-party UI libs
try {
  const resizeObserverErrs = new Set([
    'ResizeObserver loop completed with undelivered notifications.',
    'ResizeObserver loop limit exceeded'
  ]);
  window.addEventListener('error', (e) => {
    if (e.message && resizeObserverErrs.has(e.message)) {
      e.stopImmediatePropagation();
    }
  });
  window.addEventListener('unhandledrejection', (e: any) => {
    const msg = e?.reason?.message || e?.message;
    if (msg && resizeObserverErrs.has(msg)) {
      e.preventDefault();
    }
  });
} catch {}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
