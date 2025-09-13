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
    console.log('Fetching companies and grouping by normalized name...');
    const { data: companies } = await supabase.from('companies').select('id, name, created_at');
    const groups = companies.reduce((acc, c) => {
      const key = (c.name || '').trim().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

    for (const [norm, items] of Object.entries(groups)) {
      if (items.length > 1) {
        console.log(`Duplicate group: "${norm}" -> ${items.map(i=>i.id).join(', ')}`);
      }
    }

    console.log('\nCompanies with user counts:');
    const { data: rows } = await supabase.rpc('company_user_counts');
    if (rows) {
      rows.forEach(r => {
        console.log(`Company ${r.company_id} (${r.company_name}): ${r.user_count} users`);
      });
    } else {
      console.log('No RPC found for company_user_counts; falling back to query');
      const { data } = await supabase.from('companies').select('id, name');
      for (const c of data || []) {
        const { count } = await supabase.from('company_users').select('id', { count: 'exact', head: true }).eq('company_id', c.id);
        console.log(`Company ${c.id} (${c.name}): ${count || 0} users`);
      }
    }

    console.log('Audit complete');
  } catch (err) {
    console.error('Audit failed', err.message || err);
    process.exit(1);
  }
})();
