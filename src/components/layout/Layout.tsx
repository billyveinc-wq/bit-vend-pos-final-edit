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
    const [remainingMs, setRemainingMs] = useState<number | null>(null);
    const [expired, setExpired] = useState(false);
    const [visible, setVisible] = useState(false);

    const parseDateSafe = (val: any) => {
      if (!val) return null;
      try {
        const s = String(val);
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s)) return new Date(s + 'Z');
        return new Date(s);
      } catch {
        return null;
      }
    };

    useEffect(() => {
      let interval: any = null;
      const compute = async () => {
        try {
          const { data: { session } } = await safeGetSession();
          const uid = session?.session?.user?.id;
          if (!uid) return;
          const { data: subData } = await supabase.from('user_subscriptions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(1).maybeSingle();
          const userSub = subData || null;
          let end: Date | null = null;
          if (userSub) {
            if (userSub.trial_ends_at) end = parseDateSafe(userSub.trial_ends_at) || new Date(userSub.trial_ends_at);
            else if (userSub.expires_at) end = parseDateSafe(userSub.expires_at) || new Date(userSub.expires_at);
            else if (userSub.started_at) { const d = parseDateSafe(userSub.started_at) || new Date(userSub.started_at); d.setDate(d.getDate()+14); end = d; }
          } else {
            const { data } = await supabase.from('system_users').select('created_at').eq('id', uid).maybeSingle();
            const createdAt = (data as any)?.created_at;
            if (createdAt) { const d = parseDateSafe(createdAt) || new Date(createdAt); d.setDate(d.getDate()+14); end = d; }
          }

          if (!end) return;
          const update = () => {
            const ms = Math.max(0, end!.getTime() - Date.now());
            setRemainingMs(ms);
            setExpired(ms <= 0);
            // show banner if within last 4 days or expired
            const daysLeft = Math.ceil(ms / (1000*60*60*24));
            setVisible(daysLeft <= 4 || ms <= 0);
          };

          update();
          interval = setInterval(update, 1000);
        } catch (e) {
          console.warn('TrialBanner compute failed', e);
        }
      };
      compute();
      return () => { if (interval) clearInterval(interval); };
    }, []);

    if (!visible || remainingMs === null) return null;

    const formatRemaining = (ms: number) => {
      const sec = Math.floor(ms/1000)%60;
      const min = Math.floor(ms/1000/60)%60;
      const hrs = Math.floor(ms/1000/60/60)%24;
      const days = Math.floor(ms/1000/60/60/24);
      return `${days}d ${hrs}h ${min}m ${sec}s`;
    };

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`rounded-lg shadow-lg p-3 max-w-xl bg-background/90 border border-border` }>
          <div className="flex items-center justify-between gap-4">
            <div>
              {expired ? (
                <div className="text-sm font-medium text-foreground">Free trial period expired</div>
              ) : (
                <div className="text-sm font-medium text-foreground">Free trial active — ends in <span className="font-mono">{formatRemaining(remainingMs)}</span></div>
              )}
              <div className="text-xs text-muted-foreground mt-1">Your trial status is shown in your local time.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => window.location.href = '/dashboard/subscription'}>{expired ? 'Choose a Plan' : 'Manage Subscription'}</Button>
            </div>
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
