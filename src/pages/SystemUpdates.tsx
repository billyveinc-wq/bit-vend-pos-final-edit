import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface UpdateItem { title: string; body: string; date: string; }

const SystemUpdates: React.FC = () => {
  const { isAdmin } = useAdminAuth();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [form, setForm] = useState({ title: '', body: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        const companyId = (comp as any)?.id;
        if (!companyId) return;
        const { data } = await supabase.from('app_settings').select('value').eq('company_id', companyId).eq('key', 'system_updates').maybeSingle();
        const list = ((data as any)?.value || []) as UpdateItem[];
        setUpdates(Array.isArray(list) ? list : []);
      } catch {}
    };
    load();
  }, []);

  const addUpdate = async () => {
    if (!form.title || !form.body) return;
    const item: UpdateItem = { title: form.title, body: form.body, date: new Date().toISOString() };
    const next = [item, ...updates];
    setUpdates(next);
    setForm({ title: '', body: '' });
    try {
      const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
      const companyId = (comp as any)?.id;
      if (!companyId) return;
      await supabase.from('app_settings').upsert({ company_id: companyId, key: 'system_updates', value: next }, { onConflict: 'company_id,key' });
    } catch {}
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Updates</h1>
          <p className="text-muted-foreground">Latest product changes and announcements</p>
        </div>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Add Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="u-title">Title</Label>
              <Input id="u-title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="u-body">Details</Label>
              <Textarea id="u-body" value={form.body} onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))} />
            </div>
            <div className="flex justify-end">
              <Button onClick={addUpdate}>Publish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {updates.map((u, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{u.title}</span>
                <span className="text-sm text-muted-foreground">{new Date(u.date).toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-foreground">{u.body}</p>
            </CardContent>
          </Card>
        ))}
        {updates.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground">No updates yet.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemUpdates;
