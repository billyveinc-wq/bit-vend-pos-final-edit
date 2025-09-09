import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

const GeneralSettings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  useSEO('General Settings | Bit Vend POS', 'Configure general application settings.', '/settings/general');

  const handleSave = () => {
    toast({ title: 'Saved', description: 'Settings updated.' });
    navigate('/settings');
  };

  const handleCancel = () => {
    navigate('/settings');
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
              <Input id="company" placeholder="Your company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="e.g., USD" />
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
