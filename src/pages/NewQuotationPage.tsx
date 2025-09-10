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
  const [validTouched, setValidTouched] = useState(false);

  const applyTemplateDefaults = (tpl: string) => {
    const noteDefaults: Record<string, string> = {
      standard: 'Thank you for considering our offer. Prices valid for 7 days.',
      detailed: 'Detailed quotation including terms and conditions. Payment due within 14 days of acceptance.',
      service: 'Service quotation. Scope of work as discussed. Timesheets will be provided on completion.',
      product: 'Product quotation. Delivery within 3-5 business days from payment confirmation.',
      wholesale: 'Wholesale quotation. MOQ applies. Bulk discount included as specified.',
      pro_forma: 'Pro forma invoice-style quote. Subject to final confirmation.',
      subscription: 'Recurring subscription quote. Billed monthly unless cancelled.',
      maintenance: 'Maintenance plan quotation. Includes scheduled visits and support.',
      consulting: 'Consulting services quotation. Time & materials basis unless otherwise agreed.',
      rental: 'Rental quotation. Items remain property of the company. Late fees may apply.',
      installation: 'Installation quotation. Includes setup, configuration, and basic training.'
    };
    const validityDays: Record<string, number> = {
      standard: 7,
      detailed: 14,
      service: 30,
      product: 10,
      wholesale: 15,
      pro_forma: 30,
      subscription: 30,
      maintenance: 60,
      consulting: 30,
      rental: 7,
      installation: 14
    };
    const days = validityDays[tpl] || 0;
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const formatted = days ? `${yyyy}-${mm}-${dd}` : '';
    setFormData(prev => ({ ...prev, template: tpl, notes: noteDefaults[tpl] || '', validUntil: formatted }));
    setNotesTouched(false);
    setValidTouched(false);
  };

  useEffect(() => {
    const t = (location.state as any)?.template;
    if (t) applyTemplateDefaults(t);
  }, [location.state]);



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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="template">Template</Label>
              <Select value={formData.template} onValueChange={(v) => applyTemplateDefaults(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="pro_forma">Pro Forma</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="w-full justify-center">Using: {formData.template}</Badge>
            </div>
          </div>
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
                onChange={(e) => { setFormData({...formData, validUntil: e.target.value}); setValidTouched(true); }}
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
