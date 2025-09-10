import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAllowedAdminEmail } from '@/lib/admin';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminSession, setAdminSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const checkLocalAdmin = () => {
      const session = localStorage.getItem('admin-session');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          setAdminSession(parsedSession);
          setIsAdmin(true);
          if (mounted) setIsChecking(false);
          return true;
        } catch {
          setIsAdmin(false);
          setAdminSession(null);
        }
      } else {
        setAdminSession(null);
      }
      return false;
    };

    const checkStrictAdmin = async () => {
      if (mounted) setIsChecking(true);
      let admin = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email || null;
        admin = isAllowedAdminEmail(email);
      } catch {
        admin = false;
      } finally {
        if (mounted) {
          setIsAdmin(admin);
          setIsChecking(false);
        }
      }
    };

    const init = async () => {
      const isLocalAdmin = checkLocalAdmin();
      if (!isLocalAdmin) await checkStrictAdmin();
    };

    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      const isLocalAdmin = checkLocalAdmin();
      if (!isLocalAdmin) checkStrictAdmin();
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-session') {
        const isLocalAdmin = checkLocalAdmin();
        if (!isLocalAdmin) checkStrictAdmin();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      authSub.subscription.unsubscribe();
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('admin-session');
    setIsAdmin(false);
    setAdminSession(null);
  };

  return {
    isAdmin,
    isChecking,
    adminSession,
    logout
  };
};
