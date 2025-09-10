import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const GeneralSettings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();
  useSEO('General Settings | Bit Vend POS', 'Configure general application settings.', '/settings/general');

  const [company, setCompany] = useState('');
  const [currency, setCurrency] = useState(settings.currency);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('companies').select('id, name').order('id').limit(1).maybeSingle();
        if (data?.name) setCompany(data.name);
      } catch {}
      const saved = localStorage.getItem('pos-company-name');
      if (saved && !company) setCompany(saved);
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      updateSetting('currency', currency as any);
      localStorage.setItem('pos-company-name', company);
      try {
        const existing = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        if (existing.data?.id) {
          await supabase.from('companies').update({ name: company }).eq('id', existing.data.id);
        } else {
          await supabase.from('companies').insert({ name: company });
        }
      } catch {}
      toast({ title: 'Saved', description: 'Settings updated.' });
      navigate('/dashboard/settings');
    } catch (e) {
      toast({ title: 'Failed', description: 'Could not save settings', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/settings');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header>
        <h1 className="text-3xl font-bold text-foreground">General Settings</h1>
        <p className="text-muted-foreground mt-1">Brand and localization</p>
      </header>
      <main>
        <Card className="animate-slideInLeft">
          <CardHeader>
            <CardTitle>Brand</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Your company" value={company} onChange={(e)=>setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="e.g., USD" value={currency} onChange={(e)=>setCurrency(e.target.value)} />
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

export default GeneralSettings;
