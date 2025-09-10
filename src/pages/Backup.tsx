import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Backup: React.FC = () => {
  const { toast } = useToast();
  useSEO('Backup & Restore | Bit Vend POS', 'Create and restore application backups.', '/backup');

  const defaultTables = [
    'companies',
    'products', 'sales', 'sale_items',
    'expenses', 'expense_categories',
    'customers', 'suppliers',
    'purchases', 'purchase_items',
    'categories', 'brands', 'units', 'variants',
    'bank_accounts'
  ];
  const [tables, setTables] = useState<string[]>(defaultTables);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => Object.fromEntries(defaultTables.map(t => [t, true])));
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedTables = useMemo(() => tables.filter(t => selected[t]), [tables, selected]);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const result: Record<string, any[]> = {};
      for (const t of selectedTables) {
        try {
          const { data, error } = await supabase.from(t).select('*');
          if (!error && Array.isArray(data)) {
            result[t] = data as any[];
          }
        } catch {}
      }
      const payload = { exportedAt: new Date().toISOString(), tables: result };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitvend-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Backup created', description: `Exported ${Object.keys(result).length} tables.` });
    } catch (e) {
      toast({ title: 'Backup failed', description: 'Could not create backup.', variant: 'destructive' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFilePick = () => fileRef.current?.click();

  const handleRestore = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e && e.target.files && e.target.files[0]) {
        setIsRestoring(true);
        const file = e.target.files[0];
        const text = await file.text();
        const json = JSON.parse(text);
        const tablesData: Record<string, any[]> = json.tables || {};
        let restored = 0;
        for (const [t, rows] of Object.entries(tablesData)) {
          if (!Array.isArray(rows) || rows.length === 0) continue;
          try {
            const { error } = await supabase.from(t).upsert(rows as any[]);
            if (!error) restored += rows.length;
          } catch {}
        }
        toast({ title: 'Restore complete', description: `Restored ${restored} records across ${Object.keys(tablesData).length} tables.` });
        e.target.value = '';
      }
    } catch (err) {
      toast({ title: 'Restore failed', description: 'Invalid or incompatible backup file.', variant: 'destructive' });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Backup & Restore</h1>
        <p className="text-muted-foreground mt-1">Manage your data backups</p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tables.map(t => (
                <label key={t} className="flex items-center gap-2 border rounded px-2 py-1">
                  <input type="checkbox" checked={!!selected[t]} onChange={(e)=>setSelected(prev=>({ ...prev, [t]: e.target.checked }))} />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleBackup} disabled={isBackingUp}>
                {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
              </Button>
              <Input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleRestore} />
              <Button variant="outline" onClick={handleFilePick} disabled={isRestoring} className="bg-secondary hover:bg-secondary-hover text-secondary-foreground">
                {isRestoring ? 'Restoring...' : 'Restore from File'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Backup;
