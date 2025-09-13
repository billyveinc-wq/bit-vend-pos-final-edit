import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeGetSession } from '@/integrations/supabase/safeAuth';

export const useCompany = () => {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: s } = await safeGetSession();
        const user = s?.session?.user;
        if (!user) return;

        // 1) Try company_users link
        try {
          const { data: cu } = await supabase
            .from('company_users')
            .select('company_id, role')
            .eq('user_id', user.id)
            .maybeSingle();
          if (cu?.company_id && active) { setCompanyId(Number(cu.company_id)); setRole(cu.role || null); return; }
        } catch {}

        // 2) Try system_users.company_id
        let su: any = null;
        try {
          const { data } = await supabase
            .from('system_users')
            .select('company_id, user_metadata')
            .eq('id', user.id)
            .maybeSingle();
          su = data;
          if (su?.company_id && active) { setCompanyId(Number(su.company_id)); setRole('owner'); return; }
        } catch {}

        // 3) Attach to first company or create a new one
        try {
          const { data: firstCompany } = await supabase.from('companies').select('id, name').order('id').limit(1).maybeSingle();
          let cid = firstCompany?.id as number | undefined;
          if (!cid) {
            const meta = (su as any)?.user_metadata || {};
            const fallbackName = meta.company_name || (user.email ? user.email.split('@')[0] + "'s Company" : 'My Company');
            const { data: created } = await supabase.from('companies').insert({ name: fallbackName }).select('id').single();
            cid = created?.id;
          }
          if (cid) {
            const { count } = await supabase.from('company_users').select('id', { count: 'exact', head: true }).eq('company_id', cid);
            const isFirst = (count || 0) === 0;
            await supabase.from('company_users').upsert({ company_id: cid, user_id: user.id, role: isFirst ? 'owner' : 'member' }, { onConflict: 'company_id,user_id' });
            await supabase.from('system_users').update({ company_id: cid }).eq('id', user.id);
            if (active) { setCompanyId(Number(cid)); setRole(isFirst ? 'owner' : 'member'); }
          }
        } catch {}
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  return { companyId, role };
};
