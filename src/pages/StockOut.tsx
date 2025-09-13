import React, { useState, useEffect } from 'react';
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
  Warehouse, 
  Plus, 
  Search, 
  Eye,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/integrations/supabase/client';

interface StockOutRecord {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  destination?: string;
  requestedBy: string;
  approvedBy?: string;
  outDate: string;
  status: 'pending' | 'approved' | 'dispatched' | 'rejected';
  notes?: string;
  createdAt: string;
}

const StockOut = () => {
  const { products, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    destination: '',
    outDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('stock_outs').select('*').order('created_at', { ascending: false });
        const mapped: StockOutRecord[] = (data || []).map((row: any) => ({
          id: String(row.id),
          productId: 0,
          productName: row.product_name,
          quantity: row.quantity,
          reason: row.reason || '',
          destination: row.destination || '',
          requestedBy: row.requested_by || 'System',
          approvedBy: row.approved_by || undefined,
          outDate: row.out_date,
          status: row.status || 'pending',
          notes: row.notes || '',
          createdAt: row.created_at,
        }));
        setStockOutRecords(mapped);
      } catch (e) { console.warn('stock_outs not available'); }
    };
    load();
  }, []);

  const outReasons = [
    'Sale',
    'Transfer to Branch',
    'Damaged/Defective',
    'Expired',
    'Promotional Giveaway',
    'Internal Use',
    'Return to Supplier',
    'Other'
  ];

  const filteredRecords = stockOutRecords.filter(record =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id.toString() === formData.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const requestedQuantity = parseInt(formData.quantity);
    const currentStock = product.stock || 0;

    if (requestedQuantity > currentStock) {
      toast.error(`Insufficient stock. Available: ${currentStock} units`);
      return;
    }

    const newRecord: StockOutRecord = {
      id: Date.now().toString(),
      productId: parseInt(formData.productId),
      productName: product.name,
      quantity: requestedQuantity,
      reason: formData.reason,
      destination: formData.destination,
      requestedBy: 'Current User',
      outDate: formData.outDate,
      status: 'pending',
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };
    
    setStockOutRecords(prev => [...prev, newRecord]);

    try {
      const { error } = await supabase.from('stock_outs').insert({
        product_sku: product.sku || null,
        product_name: product.name,
        quantity: requestedQuantity,
        reason: formData.reason || null,
        destination: formData.destination || null,
        requested_by: 'Current User',
        out_date: formData.outDate,
        status: 'pending',
        notes: formData.notes || null,
      });
      if (error) console.warn('Failed to insert stock_out', error);
    } catch {}

    toast.success('Stock out request created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      reason: '',
      destination: '',
      outDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleApproveRequest = (id: string) => {
    setStockOutRecords(prev => prev.map(record =>
      record.id === id ? { ...record, status: 'approved', approvedBy: 'Current User' } : record
    ));
    toast.success('Stock out request approved!');
  };

  const handleDispatchStock = async (id: string) => {
    const rec = stockOutRecords.find(r => r.id === id);
    setStockOutRecords(prev => prev.map(record =>
      record.id === id ? { ...record, status: 'dispatched' } : record
    ));
    try {
      await supabase.from('stock_outs').update({ status: 'dispatched' }).eq('id', Number(id));
      const product = products.find(p => p.name === rec?.productName);
      if (product?.sku && rec) {
        const { data: prodRow } = await supabase.from('products').select('stock').eq('sku', product.sku).maybeSingle();
        const current = Number(prodRow?.stock || product.stock || 0);
        const next = Math.max(0, current - rec.quantity);
        await supabase.from('products').update({ stock: next }).eq('sku', product.sku);
        await supabase.from('inventory_movements').insert({ product_sku: product.sku, change: -rec.quantity, reason: 'stock_out' });
        try { updateProduct(product.id, { stock: next }); } catch {}
      }
    } catch (e) { console.warn('Dispatch update failed', e); }
    toast.success('Stock dispatched successfully!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      approved: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      dispatched: 'bg-green-500/10 text-green-500 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalDispatched = stockOutRecords.filter(r => r.status === 'dispatched').reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Out Management</h1>
          <p className="text-muted-foreground">Manage outgoing inventory and stock dispatch</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Request Stock Out
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Stock Out</DialogTitle>
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
                        {product.name} - Available: {product.stock || 0} units
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
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
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {outReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Branch, Customer, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="outDate">Out Date</Label>
                  <Input
                    id="outDate"
                    type="date"
                    value={formData.outDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, outDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the stock out..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Request
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
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockOutRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Dispatched</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalDispatched}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stockOutRecords.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stockOutRecords.filter(r => r.status === 'approved').length}
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
              placeholder="Search stock out records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Out Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse size={20} />
            Stock Out Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Quantity</TableHead>
                <TableHead className="text-white font-semibold">Reason</TableHead>
                <TableHead className="text-white font-semibold">Destination</TableHead>
                <TableHead className="text-white font-semibold">Requested By</TableHead>
                <TableHead className="text-white font-semibold">Out Date</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Warehouse className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock out records found</p>
                      <p className="text-sm text-muted-foreground">Create requests to track outgoing inventory</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{record.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.quantity} units</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.reason}</Badge>
                    </TableCell>
                    <TableCell>{record.destination || '-'}</TableCell>
                    <TableCell>{record.requestedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(record.outDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
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
                        {record.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(record.id)}
                            className="text-green-600"
                          >
                            Approve
                          </Button>
                        )}
                        {record.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDispatchStock(record.id)}
                            className="text-blue-600"
                          >
                            Dispatch
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

export default StockOut;
