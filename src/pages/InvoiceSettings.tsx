import React from 'react';
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

  const handleSave = () => {
    toast({ title: 'Saved', description: 'Invoice settings updated.' });
    navigate('/settings');
  };

  const handleCancel = () => {
    navigate('/settings');
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
              <Input id="prefix" placeholder="INV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">Next Number</Label>
              <Input id="next" type="number" placeholder="1001" />
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
