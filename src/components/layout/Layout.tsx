import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeGetSession } from '@/integrations/supabase/safeAuth';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';

type LayoutProps = { children?: React.ReactNode };

const Layout: React.FC<LayoutProps> = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pos-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      localStorage.setItem('pos-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      localStorage.setItem('pos-theme', 'light');
    }
    
    // Add smooth transition classes to body
    document.body.style.transition = 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  }, [darkMode]);

  const toggleSidebar = () => setSidebarCollapsed((p) => !p);
  const toggleDarkMode = () => setDarkMode((p) => !p);

  // Check authentication but don't redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Allow local admin sessions stored in localStorage to bypass Supabase session check
      const adminSession = localStorage.getItem('admin-session');
      if (adminSession) return;

      try {
        const { data: { session } } = await safeGetSession();
        if (!session?.user) {
          // Only redirect to auth if user is not authenticated
          window.location.href = '/auth';
        }
      } catch (err) {
        console.warn('Error fetching supabase session:', err);
        window.location.href = '/auth';
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        const adminSession = localStorage.getItem('admin-session');
        // Only redirect if there's no local admin session
        if (!adminSession) {
          window.location.href = '/auth';
        }
      }
      // Don't redirect on SIGNED_IN to preserve current page
    });

    return () => subscription.unsubscribe();
  }, []);

  const TrialBanner: React.FC = () => {
    const { subscription } = useSubscription();
    const [show, setShow] = useState(false);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
      const exp = subscription?.expires_at ? new Date(subscription.expires_at) : null;
      if (!exp) return;
      const now = new Date();
      const msLeft = exp.getTime() - now.getTime();
      const dl = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      setDaysLeft(dl);

      // Reminder only for last 4 days
      if (dl > 0 && dl <= 4) {
        const key = `trial-reminder-shown-${now.toISOString().slice(0,10)}`;
        if (!localStorage.getItem(key)) {
          setShow(true);
          localStorage.setItem(key, '1');
        }
      } else {
        setShow(false);
      }

      // If expired, redirect to subscription/settings
      if (dl <= 0) {
        try {
          const url = '/dashboard/settings?section=business&subsection=subscription';
          if (!window.location.href.includes('settings')) window.location.href = url;
        } catch {}
      }
    }, [subscription?.expires_at]);

    if (!show || daysLeft === null || daysLeft <= 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-amber-100 text-amber-900 border border-amber-300 rounded-lg shadow-lg p-4 max-w-xs">
          <div className="font-semibold mb-1">Trial expires soon</div>
          <div className="text-sm">Your trial period expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}. Upgrade to keep access.</div>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>window.location.href='/dashboard/settings?section=business&subsection=subscription'} className="px-3 py-1 rounded bg-amber-600 text-white text-sm">Upgrade</button>
            <button onClick={()=>setShow(false)} className="px-3 py-1 rounded border text-sm">Dismiss</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <Topbar
          collapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <main className={cn('pos-content bg-background dark:bg-black transition-all duration-300 ease-in-out', sidebarCollapsed && 'collapsed')}>
          <div className="transition-all duration-300">
            <Outlet />
          </div>
        </main>
        <TrialBanner />
      </div>
    </SubscriptionProvider>
  );
};

export default Layout;
