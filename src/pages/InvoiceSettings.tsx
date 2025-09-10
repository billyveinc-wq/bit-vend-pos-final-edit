import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const InvoiceSettings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  useSEO('Invoice Settings | Bit Vend POS', 'Customize invoice numbering and formats.', '/settings/invoice');

  const [prefix, setPrefix] = useState('INV-');
  const [next, setNext] = useState('1001');

  useEffect(() => {
    const load = async () => {
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        if (comp?.id) {
          const { data } = await mod.supabase.from('app_settings').select('value').eq('company_id', comp.id).eq('key', 'invoice_settings').maybeSingle();
          const v = (data?.value || {}) as any;
          if (v.prefix) setPrefix(v.prefix);
          if (v.next) setNext(String(v.next));
        }
      } catch {}
      try {
        const saved = JSON.parse(localStorage.getItem('pos-invoice-settings') || '{}');
        if (saved.prefix) setPrefix(saved.prefix);
        if (saved.next) setNext(String(saved.next));
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    localStorage.setItem('pos-invoice-settings', JSON.stringify({ prefix, next: Number(next) || 1 }));
    try {
      const mod = await import('@/integrations/supabase/client');
      const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
      if (comp?.id) {
        await mod.supabase.from('app_settings').upsert({ company_id: comp.id, key: 'invoice_settings', value: { prefix, next: Number(next) || 1 } }, { onConflict: 'company_id,key' });
      }
    } catch {}
    toast({ title: 'Saved', description: 'Invoice settings updated.' });
    navigate('/dashboard/settings');
  };

  const handleCancel = () => {
    navigate('/dashboard/settings');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Invoice Settings</h1>
        <p className="text-muted-foreground mt-1">Numbering and formats</p>
      </header>
      <main>
        <Card className="animate-slideInLeft">
          <CardHeader>
            <CardTitle>Numbering</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Invoice Prefix</Label>
              <Input id="prefix" placeholder="INV-" value={prefix} onChange={(e)=>setPrefix(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">Next Number</Label>
              <Input id="next" type="number" placeholder="1001" value={next} onChange={(e)=>setNext(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSave} className="bg-save hover:bg-save-hover text-save-foreground">
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InvoiceSettings;
