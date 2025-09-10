import { supabase } from './client';

export const safeGetSession = async () => {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { data: { session: null }, error: null } as any;
    }
    const res = await supabase.auth.getSession();
    return res as any;
  } catch (error) {
    return { data: { session: null }, error } as any;
  }
};

export const safeGetUser = async () => {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { data: { user: null }, error: null } as any;
    }
    const res = await supabase.auth.getUser();
    return res as any;
  } catch (error) {
    return { data: { user: null }, error } as any;
  }
};
