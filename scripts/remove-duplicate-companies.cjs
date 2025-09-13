const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    console.log('Fetching companies...');
    const { data: companies, error } = await supabase.from('companies').select('id, name, created_at');
    if (error) throw error;
    const groups = companies.reduce((acc, c) => {
      const key = (c.name || '').trim().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

    const toDelete = [];

    for (const [name, items] of Object.entries(groups)) {
      if (items.length <= 1) continue;
      // sort by created_at ascending, keep the earliest
      items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const keeper = items[0];
      const duplicates = items.slice(1);
      console.log(`Found ${duplicates.length} duplicates for "${keeper.name}". Keeping id=${keeper.id}.`);

      for (const d of duplicates) {
        const dupId = d.id;
        // Reassign company_users
        await supabase.from('company_users').update({ company_id: keeper.id }).eq('company_id', dupId);
        // Reassign system_users
        await supabase.from('system_users').update({ company_id: keeper.id }).eq('company_id', dupId);
        // Reassign app_settings
        await supabase.from('app_settings').update({ company_id: keeper.id }).eq('company_id', dupId);
        // Delete duplicate company record
        const { error: delErr } = await supabase.from('companies').delete().eq('id', dupId);
        if (delErr) console.warn('Failed to delete duplicate company', dupId, delErr.message);
        else toDelete.push(dupId);
      }
    }

    console.log('Done. Deleted duplicates:', toDelete);
  } catch (err) {
    console.error('Error during dedupe:', err.message || err);
    process.exit(1);
  }
})();
