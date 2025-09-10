import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

    const checkDbAdmin = async () => {
      if (mounted) setIsChecking(true);
      let admin = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          // Company-level owner/admin implies admin access
          const { data: compRole } = await supabase
            .from('company_users')
            .select('role')
            .eq('user_id', user.id)
            .in('role', ['owner', 'admin'])
            .maybeSingle();
          if (compRole?.role === 'owner' || compRole?.role === 'admin') {
            admin = true;
          } else {
            // Role-based admin via roles/user_roles
            const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
            const adminRoleId = adminRole?.id as number | undefined;
            if (adminRoleId) {
              const { data: hasRole } = await supabase
                .from('user_roles')
                .select('user_id, role_id')
                .eq('user_id', user.id)
                .eq('role_id', adminRoleId)
                .maybeSingle();
              admin = !!hasRole;
            }
          }
        }
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
      if (!isLocalAdmin) await checkDbAdmin();
    };

    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      const isLocalAdmin = checkLocalAdmin();
      if (!isLocalAdmin) checkDbAdmin();
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-session') {
        const isLocalAdmin = checkLocalAdmin();
        if (!isLocalAdmin) checkDbAdmin();
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
