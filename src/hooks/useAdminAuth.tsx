import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState<any>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      const session = localStorage.getItem('admin-session');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          setAdminSession(parsedSession);
          setIsAdmin(true);
        } catch (error) {
          setIsAdmin(false);
          setAdminSession(null);
        }
      } else {
        setIsAdmin(false);
        setAdminSession(null);
      }
    };

    checkAdminAuth();

    // Listen for storage changes (in case admin logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-session') {
        checkAdminAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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