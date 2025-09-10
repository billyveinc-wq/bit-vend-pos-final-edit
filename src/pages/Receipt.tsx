import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import ReceiptTemplate from '@/components/ReceiptTemplate';

const mapReceiptTemplate = (key: string) => {
  switch (key) {
    case 'classic':
      return 'classic-receipt';
    case 'modern':
      return 'modern-receipt';
    case 'compact':
      return 'minimal-receipt';
    case 'detailed':
      return 'detailed-receipt';
    case 'thermal':
      return 'thermal-receipt';
    default: {
      const allowed = [
        'classic-receipt',
        'modern-receipt',
        'minimal-receipt',
        'detailed-receipt',
        'thermal-receipt'
      ];
      return allowed.includes(key) ? key : 'classic-receipt';
    }
  }
};

const Receipt = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart, total, tax, subtotal, paymentMethod, receiptTemplate } = location.state || {};
  const [selectedTemplate, setSelectedTemplate] = useState('classic-receipt');

  useEffect(() => {
    if (receiptTemplate) {
      setSelectedTemplate(mapReceiptTemplate(receiptTemplate));
      return;
    }

    const loadTemplate = async () => {
      // Try Supabase app_settings -> receipt_settings.template
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data: comp } = await mod.supabase
          .from('companies')
          .select('id')
          .order('id')
          .limit(1)
          .maybeSingle();
        const companyId = comp?.id;
        if (companyId) {
          const { data } = await mod.supabase
            .from('app_settings')
            .select('value')
            .eq('company_id', companyId)
            .eq('key', 'receipt_settings')
            .maybeSingle();
          const tmplKey = (data as any)?.value?.template as string | undefined;
          if (tmplKey) {
            setSelectedTemplate(mapReceiptTemplate(tmplKey));
            return;
          }
        }
      } catch {}

      // Fallback to local receipt settings saved from Settings page
      try {
        const saved = localStorage.getItem('pos-receipt-settings');
        if (saved) {
          const rs = JSON.parse(saved);
          if (rs?.template) {
            setSelectedTemplate(mapReceiptTemplate(rs.template));
            return;
          }
        }
      } catch {}

      // Final fallback to legacy app settings
      try {
        const savedSettings = localStorage.getItem('pos-app-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings?.receiptTemplate) {
            setSelectedTemplate(mapReceiptTemplate(settings.receiptTemplate));
          }
        }
      } catch {}
    };

    loadTemplate();
  }, [receiptTemplate]);

  const handlePrint = () => {
    window.print();
  };

  if (!cart) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No receipt data found</p>
            <Button onClick={() => navigate('/dashboard/checkout')} className="mt-4">
              Back to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 print:p-0 print:max-w-full">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-print, #receipt-print * {
            visibility: visible !important;
          }
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.5in;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/checkout')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Checkout
        </Button>
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <div id="receipt-print" className="print:shadow-none">
        <ReceiptTemplate
          template={selectedTemplate}
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          paymentMethod={paymentMethod}
          receiptNumber={`${Date.now().toString().slice(-5)}`}
          cashier="System"
        />
      </div>
    </div>
  );
};

export default Receipt;
