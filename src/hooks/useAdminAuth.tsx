import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAllowedAdminEmail } from '@/lib/admin';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminSession, setAdminSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const readLocalAdmin = () => {
      const raw = localStorage.getItem('admin-session');
      if (!raw) { setAdminSession(null); return null; }
      try {
        const parsed = JSON.parse(raw);
        if (!isAllowedAdminEmail(parsed?.email)) {
          setAdminSession(null);
          return null;
        }
        setAdminSession(parsed);
        return parsed;
      } catch {
        setAdminSession(null);
        return null;
      }
    };

    const computeAdmin = async () => {
      if (mounted) setIsChecking(true);
      try {
        const local = readLocalAdmin();
        const { data: { session } } = await supabase.auth.getSession();
        const supaEmail = session?.user?.email || null;
        let admin = false;
        if (supaEmail) {
          admin = isAllowedAdminEmail(supaEmail);
        } else if (local) {
          admin = isAllowedAdminEmail(local.email);
        } else {
          admin = false;
        }
        if (mounted) setIsAdmin(admin);
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

    computeAdmin();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      computeAdmin();
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-session') computeAdmin();
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
