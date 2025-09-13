const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeName(s) {
  if (!s) return '';
  let name = String(s).trim();
  name = name.replace(/[\u2019`‘’]+/g, "'");
  name = name.replace(/[_.]+/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  // remove trailing words like "pos", "pos's", "company", "company's" (handle attached pos)
  name = name.replace(/(?:pos(?:'s|’s)?|(?:\bpos\b))\s*$/i, '').trim();
  name = name.replace(/\bcompany\b\s*$/i, '').trim();
  // remove trailing possessive if exists
  name = name.replace(/('s|’s)\s*$/i, '').trim();
  // remove trailing 'pos' again if still present
  name = name.replace(/pos\s*$/i, '').trim();
  name = name.replace(/\s+/g, ' ').trim();
  // title case
  name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return name;
}

(async () => {
  try {
    console.log('Fetching companies...');
    const { data: companies, error } = await supabase.from('companies').select('id, name, created_at');
    if (error) throw error;
    const mapped = (companies || []).map(c => ({ id: c.id, name: c.name || '', created_at: c.created_at }));

    const groups = {};
    for (const c of mapped) {
      const norm = normalizeName(c.name || '');
      if (!groups[norm]) groups[norm] = [];
      groups[norm].push(c);
    }

    const merged = [];

    for (const [norm, items] of Object.entries(groups)) {
      if (!norm) continue;
      if (items.length === 1) {
        const it = items[0];
        // update name if different
        if (it.name !== norm) {
          const { error: upErr } = await supabase.from('companies').update({ name: norm }).eq('id', it.id);
          if (upErr) console.warn('Failed to update name for', it.id, upErr.message);
          else merged.push({ kept: it.id, updatedName: norm, removed: [] });
        }
        continue;
      }

      // multiple items -> merge
      // sort by created_at ascending (keep earliest)
      items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const keeper = items[0];
      const duplicates = items.slice(1);

      // update keeper name to normalized
      try {
        await supabase.from('companies').update({ name: norm }).eq('id', keeper.id);
      } catch (e) {}

      const removedIds = [];

      for (const d of duplicates) {
        const dupId = d.id;
        // reassign company_users
        await supabase.from('company_users').update({ company_id: keeper.id }).eq('company_id', dupId);
        // reassign system_users
        await supabase.from('system_users').update({ company_id: keeper.id }).eq('company_id', dupId);
        // reassign app_settings
        await supabase.from('app_settings').update({ company_id: keeper.id }).eq('company_id', dupId);
        // delete duplicate company
        const { error: delErr } = await supabase.from('companies').delete().eq('id', dupId);
        if (delErr) console.warn('Failed to delete duplicate', dupId, delErr.message);
        else removedIds.push(dupId);
      }

      merged.push({ kept: keeper.id, normalized: norm, removed: removedIds });
    }

    console.log('Normalization and merge completed. Summary:');
    for (const m of merged) {
      console.log(m);
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error during normalize-and-merge:', err.message || err);
    process.exit(1);
  }
})();
