import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const NewQuotationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    phone: '',
    validUntil: '',
    notes: '',
    template: 'standard'
  });
  const [notesTouched, setNotesTouched] = useState(false);

  useEffect(() => {
    const t = (location.state as any)?.template;
    if (t) setFormData((prev) => ({ ...prev, template: t }));
  }, [location.state]);

  useEffect(() => {
    if (notesTouched) return;
    const defaults: Record<string, string> = {
      standard: 'Thank you for considering our offer. Prices valid for 7 days.',
      detailed: 'Detailed quotation including terms and conditions. Payment due within 14 days of acceptance.',
      service: 'Service quotation. Scope of work as discussed. Timesheets will be provided on completion.',
      product: 'Product quotation. Delivery within 3-5 business days from payment confirmation.',
      wholesale: 'Wholesale quotation. MOQ applies. Bulk discount included as specified.'
    };
    const next = defaults[formData.template as keyof typeof defaults] || '';
    setFormData(prev => ({ ...prev, notes: next }));
  }, [formData.template, notesTouched]);

  const handleSave = async () => {
    if (!formData.customer || !formData.email) {
      toast.error('Please fill in customer name and email');
      return;
    }

    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const { count } = await supabase.from('quotations').select('id', { count: 'exact', head: true }).like('quote_no', `Q-${dateStr}-%`);
      const seq = (count || 0) + 1;
      const quoteNo = `Q-${dateStr}-${String(seq).padStart(4, '0')}`;
      const { error } = await supabase.from('quotations').insert({
        quote_no: quoteNo,
        customer: formData.customer,
        email: formData.email,
        phone: formData.phone || null,
        date: today.toISOString().split('T')[0],
        valid_until: formData.validUntil || null,
        notes: formData.notes || null,
        template: formData.template,
        status: 'draft',
        subtotal: 0,
        tax: 0,
        total: 0,
      });
      if (error) { toast.error(error.message); return; }
      toast.success('Quotation created successfully!');
      navigate('/dashboard/quotation');
    } catch (e) {
      toast.error('Failed to create quotation');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard/quotation')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotations
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Quotation</h1>
          <p className="text-muted-foreground">Create a new customer quotation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="customer@email.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 555-0123"
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => { setFormData({...formData, notes: e.target.value}); setNotesTouched(true); }}
              placeholder="Additional notes or terms..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Quotation
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/quotation')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewQuotationPage;
