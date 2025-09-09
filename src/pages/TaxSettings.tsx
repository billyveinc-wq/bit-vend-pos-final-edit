import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const TaxSettings: React.FC = () => {
  const { toast } = useToast();
  useSEO('Tax Settings | Bit Vend POS', 'Define tax rates and behavior.', '/tax-settings');

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
              <Input id="tax" type="number" step="0.01" placeholder="15" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => toast({ title: 'Saved', description: 'Tax settings updated.' })}>
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
