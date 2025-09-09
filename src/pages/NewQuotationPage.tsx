import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const NewQuotationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    phone: '',
    validUntil: '',
    notes: '',
    template: 'standard'
  });

  const handleSave = () => {
    if (!formData.customer || !formData.email) {
      toast.error('Please fill in customer name and email');
      return;
    }

    toast.success('Quotation created successfully!');
    navigate('/dashboard/quotation');
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
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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