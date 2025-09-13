import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const TaxSettings: React.FC = () => {
  const { toast } = useToast();
  useSEO('Tax Settings | Bit Vend POS', 'Define tax rates and behavior.', '/tax-settings');

  const [tax, setTax] = useState('15');
  useEffect(() => {
    const load = async () => {
      let val: string | null = null;
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        if (comp?.id) {
          const { data } = await mod.supabase.from('app_settings').select('value').eq('company_id', comp.id).eq('key', 'default_tax').maybeSingle();
          if (data?.value?.percent) val = String((data.value as any).percent);
          else if (data?.value) val = String(data.value);
        }
      } catch {}
      if (!val) val = localStorage.getItem('pos-default-tax');
      if (val) setTax(val);
    };
    load();
  }, []);

  const save = async () => {
    localStorage.setItem('pos-default-tax', tax);
    try {
      const mod = await import('@/integrations/supabase/client');
      const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
      if (comp?.id) {
        await mod.supabase.from('app_settings').upsert({ company_id: comp.id, key: 'default_tax', value: { percent: Number(tax) } }, { onConflict: 'company_id,key' });
      }
    } catch {}
    toast({ title: 'Saved', description: 'Tax settings updated.' });
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
        <p className="text-muted-foreground mt-1">Tax configuration</p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Rates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Default Tax %</Label>
              <Input id="tax" type="number" step="0.01" placeholder="15" value={tax} onChange={(e)=>setTax(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={save}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TaxSettings;
