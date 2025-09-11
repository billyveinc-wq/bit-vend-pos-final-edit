import './integrations/sentry';
import { startUptimeMonitor } from './monitoring/uptime';
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

startUptimeMonitor();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
