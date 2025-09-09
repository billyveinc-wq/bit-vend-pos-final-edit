import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import ReceiptTemplate from '@/components/ReceiptTemplate';

const Receipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cart, total, tax, subtotal, paymentMethod, receiptTemplate } = location.state || {};
  const [selectedTemplate, setSelectedTemplate] = useState('classic-receipt');

  useEffect(() => {
    // Load selected template from settings or use the one passed from checkout
    if (receiptTemplate) {
      setSelectedTemplate(receiptTemplate);
    } else {
      const savedSettings = localStorage.getItem('pos-app-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSelectedTemplate(settings.receiptTemplate || 'classic-receipt');
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
    }
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
            <Button onClick={() => navigate('/checkout')} className="mt-4">
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
          onClick={() => navigate('/checkout')}
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