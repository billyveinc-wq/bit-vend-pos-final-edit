import React from 'react';

interface ReceiptTemplateProps {
  template: string;
  cart: Array<{product: any, quantity: number}>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  receiptNumber?: string;
  cashier?: string;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ 
  template, 
  cart, 
  subtotal, 
  tax, 
  total, 
  paymentMethod,
  receiptNumber = '00001',
  cashier = 'System'
}) => {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const getBusinessInfo = () => {
    try {
      const saved = localStorage.getItem('companySettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error parsing company settings:', e);
    }
    return {
      companyName: 'BitVend POS',
      companyAddress: '123 Business Street, New York, NY 10001',
      companyPhone: '(555) 123-4567',
      companyEmail: 'info@bitvendpos.com'
    };
  };

  const businessInfo = getBusinessInfo();

  const renderClassicReceipt = () => (
    <div className="bg-background text-foreground p-4 text-xs border rounded shadow-sm min-h-[300px] max-w-[400px] mx-auto">
      <div className="text-center border-b border-border pb-2 mb-3">
        <h2 className="font-bold text-sm text-foreground">{businessInfo.companyName}</h2>
        <p className="text-xs text-muted-foreground">{businessInfo.companyAddress}</p>
        <p className="text-xs text-muted-foreground">Phone: {businessInfo.companyPhone}</p>
      </div>
      
      <div className="mb-3 text-foreground">
        <div className="flex justify-between">
          <span>Receipt #: {receiptNumber}</span>
          <span>Date: {currentDate}</span>
        </div>
        <div>Time: {currentTime}</div>
        <div>Cashier: {cashier}</div>
      </div>
      
      <div className="border-b border-border pb-2 mb-2">
        <div className="flex justify-between font-medium text-foreground">
          <span>Item</span>
          <span>Total</span>
        </div>
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between text-foreground">
            <span>{item.product.name} x{item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-1 text-foreground">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (8%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-border text-center text-foreground">
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
        <p className="text-xs text-muted-foreground mt-2">Thank you for your business!</p>
        <p className="text-xs text-muted-foreground">Please come again</p>
      </div>
    </div>
  );

  const renderModernReceipt = () => (
    <div className="bg-background text-foreground p-6 text-sm border rounded shadow-sm min-h-[300px] max-w-[400px] mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-bold text-xl text-primary">{businessInfo.companyName}</h2>
        <div className="h-px bg-primary w-16 mx-auto mt-2 mb-3"></div>
        <p className="text-muted-foreground">{businessInfo.companyAddress}</p>
        <p className="text-muted-foreground">{businessInfo.companyPhone}</p>
      </div>
      
      <div className="mb-4 bg-muted/50 p-3 rounded">
        <div className="grid grid-cols-2 gap-2 text-foreground">
          <div>Receipt: #{receiptNumber}</div>
          <div>Date: {currentDate}</div>
          <div>Time: {currentTime}</div>
          <div>Cashier: {cashier}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between font-semibold pb-2 border-b border-border text-foreground">
          <span>Item Description</span>
          <span>Amount</span>
        </div>
        <div className="space-y-2 mt-2 text-foreground">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.product.name} × {item.quantity}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-1 border-t border-border pt-2 text-foreground">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-foreground">
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
        <div className="text-center mt-6 pt-4 border-t border-primary">
          <p className="font-medium text-primary">Thank you for shopping with us!</p>
        </div>
      </div>
    </div>
  );

  const renderMinimalReceipt = () => (
    <div className="bg-background text-foreground p-4 text-sm border rounded shadow-sm min-h-[300px] max-w-[300px] mx-auto font-mono">
      <div className="text-center mb-4">
        <h2 className="font-bold text-foreground">{businessInfo.companyName.toUpperCase()}</h2>
        <p className="text-xs text-muted-foreground">{businessInfo.companyAddress}</p>
      </div>
      
      <div className="text-center mb-4 text-xs text-foreground">
        <p>Receipt: {receiptNumber} | {currentDate} {currentTime}</p>
        <p>Cashier: {cashier}</p>
      </div>
      
      <div className="mb-3 text-foreground">
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.product.name}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-dashed border-border pt-2 text-foreground">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <p className="font-bold flex justify-between">
          <span>TOTAL</span>
          <span>${total.toFixed(2)}</span>
        </p>
      </div>
      
      <div className="mt-4 text-center text-foreground">
        <p><strong>Payment:</strong> {paymentMethod}</p>
        <div className="text-center mt-4 pt-2 border-t border-dashed border-border text-xs text-muted-foreground">
          <p>THANK YOU</p>
        </div>
      </div>
    </div>
  );

  const renderDetailedReceipt = () => (
    <div className="bg-background text-foreground p-4 text-xs border rounded shadow-sm min-h-[300px] max-w-[450px] mx-auto">
      <div className="text-center border-b-2 border-border pb-2 mb-3">
        <h2 className="font-bold text-lg text-foreground">{businessInfo.companyName} System</h2>
        <p className="text-muted-foreground">{businessInfo.companyAddress}</p>
        <p className="text-muted-foreground">Phone: {businessInfo.companyPhone}</p>
        <p className="text-muted-foreground">Email: {businessInfo.companyEmail}</p>
      </div>
      
      <div className="mb-3 bg-muted/50 p-2 rounded">
        <div className="flex justify-between text-foreground">
          <span><strong>Receipt #:</strong> {receiptNumber}</span>
          <span><strong>Register:</strong> 01</span>
        </div>
        <div className="flex justify-between text-foreground">
          <span><strong>Date:</strong> {currentDate}</span>
          <span><strong>Time:</strong> {currentTime}</span>
        </div>
        <div className="text-foreground"><strong>Cashier:</strong> {cashier}</div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between font-bold border-b border-border text-foreground">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>
        {cart.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-foreground">
              <span>{item.product.name}</span>
              <span>{item.quantity}</span>
              <span>${item.product.price.toFixed(2)}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-1 border-t border-border pt-2 text-foreground">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax Rate (8%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-border pt-1">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-3 text-center border-t border-border pt-2 text-foreground">
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
        <p className="mt-2 text-muted-foreground">Thank you for your business!</p>
        <p className="text-muted-foreground">Visit us at {businessInfo.companyEmail}</p>
      </div>
    </div>
  );

  const renderThermalReceipt = () => (
    <div className="bg-background text-foreground p-3 text-xs border rounded shadow-sm min-h-[300px] max-w-[200px] mx-auto font-mono">
      <div className="text-center mb-2">
        <h2 className="font-bold text-foreground">{businessInfo.companyName.toUpperCase()}</h2>
        <p className="text-muted-foreground">{businessInfo.companyAddress.split(',')[0]}</p>
        <p className="text-muted-foreground">{businessInfo.companyPhone}</p>
      </div>
      
      <div className="text-center mb-2 border-t border-b border-dashed border-border py-1 text-foreground">
        <p>Receipt: {receiptNumber}</p>
        <p>{currentDate} {currentTime}</p>
        <p>Cashier: {cashier}</p>
      </div>
      
      <div className="mb-2 text-foreground">
        {cart.map((item, index) => (
          <div key={index}>
            <p>{item.product.name}</p>
            <p className="text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <div className="border-t border-dashed border-border pt-1 text-foreground">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-2 text-center text-foreground">
        <p><strong>Payment:</strong> {paymentMethod}</p>
        <div className="text-center mt-2 pt-1 border-t border-dashed border-border text-xs text-muted-foreground">
          <p>* THANK YOU *</p>
          <p>* PLEASE COME AGAIN *</p>
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case 'classic-receipt':
        return renderClassicReceipt();
      case 'modern-receipt':
        return renderModernReceipt();
      case 'minimal-receipt':
        return renderMinimalReceipt();
      case 'detailed-receipt':
        return renderDetailedReceipt();
      case 'thermal-receipt':
        return renderThermalReceipt();
      default:
        return renderClassicReceipt();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      {renderTemplate()}
    </div>
  );
};

export default ReceiptTemplate;