import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) { if (mounted) setIsAdmin(false); return; }

        // Company-level owner/admin implies admin access
        const { data: compRole } = await supabase
          .from('company_users')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['owner', 'admin'])
          .maybeSingle();
        if (compRole?.role === 'owner' || compRole?.role === 'admin') { if (mounted) setIsAdmin(true); return; }

        // Role-based admin via roles/user_roles
        const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
        const adminRoleId = adminRole?.id as number | undefined;
        if (!adminRoleId) { if (mounted) setIsAdmin(false); return; }

        const { data: hasRole } = await supabase
          .from('user_roles')
          .select('user_id, role_id')
          .eq('user_id', user.id)
          .eq('role_id', adminRoleId)
          .maybeSingle();

        if (mounted) setIsAdmin(!!hasRole);
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };

    const init = async () => {
      const isLocalAdmin = checkLocalAdmin();
      if (!isLocalAdmin) await checkDbAdmin();
    };

    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      // Re-evaluate when auth state changes
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
    adminSession,
    logout
  };
};
