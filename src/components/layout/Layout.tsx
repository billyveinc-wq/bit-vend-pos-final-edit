import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Only redirect to auth if user is not authenticated
        window.location.href = '/auth';
      }
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/auth';
      }
      // Don't redirect on SIGNED_IN to preserve current page
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <div className="animate-fadeInUp transition-all duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </SubscriptionProvider>
  );
};

export default Layout;
