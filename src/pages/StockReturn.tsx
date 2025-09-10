import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Eye,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/integrations/supabase/client';

interface StockReturn {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  condition: 'good' | 'damaged' | 'expired';
  supplier: string;
  returnDate: string;
  returnedBy: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  refundAmount?: number;
  notes?: string;
  createdAt: string;
}

const StockReturn = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    condition: 'good' as StockReturn['condition'],
    supplier: '',
    returnDate: new Date().toISOString().split('T')[0],
    refundAmount: '',
    notes: ''
  });

  const [stockReturns, setStockReturns] = useState<StockReturn[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('stock_returns').select('*').order('created_at', { ascending: false });
        const mapped: StockReturn[] = (data || []).map((row: any) => ({
          id: String(row.id),
          productId: 0,
          productName: row.product_name,
          quantity: row.quantity,
          reason: row.reason || '',
          condition: (row.condition || 'good') as StockReturn['condition'],
          supplier: row.supplier || '',
          returnDate: row.return_date,
          returnedBy: row.returned_by || 'System',
          status: row.status || 'pending',
          refundAmount: row.refund_amount ? Number(row.refund_amount) : undefined,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));
        setStockReturns(mapped);
      } catch (e) { console.warn('stock_returns not available'); }
    };
    load();
  }, []);

  const returnReasons = [
    'Defective/Damaged',
    'Wrong Item Received',
    'Expired Product',
    'Overstock',
    'Quality Issues',
    'Customer Return',
    'Supplier Recall',
    'Other'
  ];

  const suppliers = [
    'Supplier A Ltd',
    'Supplier B Corp',
    'Supplier C Inc',
    'Local Distributor',
    'Wholesale Partner'
  ];

  const filteredReturns = stockReturns.filter(returnRecord =>
    returnRecord.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnRecord.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnRecord.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!formData.productId || !formData.quantity || !formData.reason || !formData.supplier) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id.toString() === formData.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    const newReturn: StockReturn = {
      id: Date.now().toString(),
      productId: parseInt(formData.productId),
      productName: product.name,
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      condition: formData.condition,
      supplier: formData.supplier,
      returnDate: formData.returnDate,
      returnedBy: 'Current User',
      status: 'pending',
      refundAmount: parseFloat(formData.refundAmount) || undefined,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };
    
    setStockReturns(prev => [...prev, newReturn]);

    try {
      const { error } = await supabase.from('stock_returns').insert({
        product_sku: product.sku || null,
        product_name: product.name,
        quantity: parseInt(formData.quantity),
        reason: formData.reason || null,
        condition: formData.condition,
        supplier: formData.supplier,
        return_date: formData.returnDate,
        returned_by: 'Current User',
        status: 'pending',
        refund_amount: formData.refundAmount ? parseFloat(formData.refundAmount) : null,
        notes: formData.notes || null,
      });
      if (error) console.warn('Failed to insert stock_return', error);
    } catch {}

    toast.success('Stock return created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      reason: '',
      condition: 'good',
      supplier: '',
      returnDate: new Date().toISOString().split('T')[0],
      refundAmount: '',
      notes: ''
    });
  };

  const handleApproveReturn = async (id: string) => {
    setStockReturns(prev => prev.map(returnRecord =>
      returnRecord.id === id ? { ...returnRecord, status: 'approved' } : returnRecord
    ));
    try { await supabase.from('stock_returns').update({ status: 'approved' }).eq('id', Number(id)); } catch {}
    toast.success('Stock return approved!');
  };

  const handleProcessReturn = async (id: string) => {
    setStockReturns(prev => prev.map(returnRecord =>
      returnRecord.id === id ? { ...returnRecord, status: 'processed' } : returnRecord
    ));
    try { await supabase.from('stock_returns').update({ status: 'processed' }).eq('id', Number(id)); } catch {}
    toast.success('Stock return processed successfully!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      approved: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      processed: 'bg-green-500/10 text-green-500 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getConditionBadge = (condition: string) => {
    const colors = {
      good: 'bg-green-500/10 text-green-500 border border-green-500/20',
      damaged: 'bg-red-500/10 text-red-500 border border-red-500/20',
      expired: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    };
    return colors[condition as keyof typeof colors] || colors.good;
  };

  const totalReturned = stockReturns.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.quantity, 0);
  const totalRefunds = stockReturns.filter(r => r.status === 'processed').reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Return Management</h1>
          <p className="text-muted-foreground">Manage returns to suppliers and stock adjustments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              New Return
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Return</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productId">Product</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - Stock: {product.stock || 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity to Return</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Item Condition</Label>
                  <Select value={formData.condition} onValueChange={(value: StockReturn['condition']) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good Condition</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reason">Return Reason</Label>
                  <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Return to Supplier</Label>
                  <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="refundAmount">Expected Refund</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    value={formData.refundAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, refundAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details about the return..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Return
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockReturns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Returned</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalReturned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRefunds.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stockReturns.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stock returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck size={20} />
            Stock Returns ({filteredReturns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Quantity</TableHead>
                <TableHead className="text-white font-semibold">Reason</TableHead>
                <TableHead className="text-white font-semibold">Condition</TableHead>
                <TableHead className="text-white font-semibold">Supplier</TableHead>
                <TableHead className="text-white font-semibold">Return Date</TableHead>
                <TableHead className="text-white font-semibold">Refund</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock returns found</p>
                      <p className="text-sm text-muted-foreground">Create returns to track items sent back to suppliers</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((returnRecord) => (
                  <TableRow key={returnRecord.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{returnRecord.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{returnRecord.quantity} units</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{returnRecord.reason}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionBadge(returnRecord.condition)}>
                        {returnRecord.condition.charAt(0).toUpperCase() + returnRecord.condition.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{returnRecord.supplier}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(returnRecord.returnDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {returnRecord.refundAmount ? (
                        <span className="font-medium text-green-600">${returnRecord.refundAmount.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(returnRecord.status)}>
                        {getStatusIcon(returnRecord.status)}
                        <span className="ml-1 capitalize">{returnRecord.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye size={14} />
                        </Button>
                        {returnRecord.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveReturn(returnRecord.id)}
                            className="text-green-600"
                          >
                            Approve
                          </Button>
                        )}
                        {returnRecord.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcessReturn(returnRecord.id)}
                            className="text-blue-600"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReturn;
