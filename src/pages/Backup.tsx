import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const Backup: React.FC = () => {
  const { toast } = useToast();
  useSEO('Backup & Restore | Bit Vend POS', 'Create and restore application backups.', '/backup');

  const handleBackup = () => toast({ title: 'Backup created', description: 'A new backup file was generated.' });
  const handleRestore = () => toast({ title: 'Restore started', description: 'This is a demo action.' });

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
          <CardContent className="flex gap-3">
            <Button onClick={handleBackup}>Create Backup</Button>
            <Button variant="outline" onClick={handleRestore} className="bg-secondary hover:bg-secondary-hover text-secondary-foreground">Restore</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Backup;
