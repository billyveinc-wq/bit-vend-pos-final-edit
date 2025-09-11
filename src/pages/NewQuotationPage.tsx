import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const LOCAL_KEY = 'pos-quotations';
  const readLocal = (): any[] => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; } };
  const writeLocal = (q: any[]) => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(q)); } catch {} };

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
    const templateFieldPresets: Record<string, Record<string, string>> = {
      service: { scope: '', hours: '', rate: '' },
      product: { delivery_method: '', warranty: '' },
      wholesale: { moq: '', bulk_discount: '' },
      pro_forma: { company_address: '', payment_terms: '' },
      subscription: { billing_cycle: 'monthly', start_date: '', end_date: '' },
      maintenance: { plan_level: '', visits_per_year: '' },
      consulting: { hourly_rate: '', estimated_hours: '' },
      rental: { rental_period: '', deposit: '' },
      installation: { site_address: '', install_date: '' }
    };
    setExtraFields(templateFieldPresets[tpl] || {});
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
      let seq = 0;
      try {
        const { count } = await supabase.from('quotations').select('id', { count: 'exact', head: true }).like('quote_no', `Q-${dateStr}-%`);
        seq = (count || 0);
      } catch {
        seq = readLocal().filter(x => (x.quoteNo || '').startsWith(`Q-${dateStr}-`)).length;
      }
      const quoteNo = `Q-${dateStr}-${String(seq + 1).padStart(4, '0')}`;
      const detailsLines = Object.keys(extraFields).length
        ? ['\n--- Template Details ---', ...Object.entries(extraFields).map(([k,v]) => `${k}: ${v || '-'}`)].join('\n')
        : '';

      let created = false;
      try {
        const { error } = await supabase.from('quotations').insert({
          quote_no: quoteNo,
          customer: formData.customer,
          email: formData.email,
          phone: formData.phone || null,
          date: today.toISOString().split('T')[0],
          valid_until: formData.validUntil || null,
          notes: ((formData.notes || '') + detailsLines) || null,
          template: formData.template,
          status: 'draft',
          subtotal: 0,
          tax: 0,
          total: 0,
        });
        if (!error) created = true;
      } catch {}

      if (!created) {
        const local = readLocal();
        local.unshift({
          id: `local-${Date.now()}`,
          quoteNo,
          customer: formData.customer,
          customerEmail: formData.email,
          phone: formData.phone || undefined,
          date: today.toISOString().split('T')[0],
          validUntil: formData.validUntil || undefined,
          notes: ((formData.notes || '') + detailsLines) || undefined,
          template: formData.template,
          status: 'draft',
          subtotal: 0,
          tax: 0,
          total: 0,
          items: []
        });
        writeLocal(local);
        try { toast.message('Saved locally (DB unavailable).'); } catch {}
      }

      // Persist logo (if selected) into app_settings keyed by quote number
      try {
        const logo = (window as any)._quoteLogoDataUrl as string | undefined;
        if (logo) {
          const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
          const companyId = (comp as any)?.id;
          if (companyId) {
            await supabase.from('app_settings').upsert({ company_id: companyId, key: `quote_logo_${quoteNo}`, value: logo }, { onConflict: 'company_id,key' });
          }
          delete (window as any)._quoteLogoDataUrl;
        }
      } catch {}
      toast.success('Quotation created successfully!');
      navigate('/dashboard/quotation');
    } catch (e) {
      const local = readLocal();
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const quoteNo = `Q-${dateStr}-${String(local.length + 1).padStart(4, '0')}`;
      local.unshift({ id: `local-${Date.now()}`, quoteNo, customer: formData.customer, customerEmail: formData.email, date: today.toISOString().split('T')[0], status: 'draft', subtotal: 0, tax: 0, total: 0, items: [] });
      writeLocal(local);
      toast.success('Quotation saved locally');
      navigate('/dashboard/quotation');
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
            <div className="flex items-end gap-2">
              <Badge variant="outline" className="justify-center">Using: {formData.template}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Quotation Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                setExtraFields(prev => ({ ...prev })); // touch to trigger rerender
                (window as any)._quoteLogoDataUrl = reader.result as string;
              };
              reader.readAsDataURL(f);
            }} />
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

          {/* Template-specific details */}
          {Object.keys(extraFields).length > 0 && (
            <div className="border rounded-md p-4 space-y-3">
              <p className="text-sm font-medium">Template Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extraFields).map(([key, val]) => (
                  <div key={key}>
                    <Label htmlFor={`ef-${key}`}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Label>
                    <Input id={`ef-${key}`} value={val} onChange={(e) => setExtraFields(prev => ({ ...prev, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <Button onClick={handleSave} className="bg-save hover:bg-save-hover text-white dark:text-white">
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
