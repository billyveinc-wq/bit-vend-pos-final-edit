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
  ArrowLeftRight, 
  Plus, 
  Search, 
  Eye,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  Building2
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/integrations/supabase/client';

interface StockTransfer {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  requestedBy: string;
  approvedBy?: string;
  receivedBy?: string;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'rejected';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

const StockTransfer = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('stock_transfers').select('*').order('created_at', { ascending: false });
        const mapped: StockTransfer[] = (data || []).map((row: any) => ({
          id: String(row.id),
          productId: 0,
          productName: row.product_name,
          quantity: row.quantity,
          fromLocation: row.from_location,
          toLocation: row.to_location,
          transferDate: row.transfer_date,
          requestedBy: row.requested_by || 'System',
          approvedBy: row.approved_by || undefined,
          receivedBy: row.received_by || undefined,
          status: row.status || 'pending',
          trackingNumber: row.tracking_number || undefined,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));
        setStockTransfers(mapped);
      } catch (e) { console.warn('stock_transfers not available'); }
    };
    load();
  }, []);

  const locations = [
    'Main Warehouse',
    'Store Location A',
    'Store Location B',
    'Distribution Center',
    'Retail Outlet 1',
    'Retail Outlet 2'
  ];

  const filteredTransfers = stockTransfers.filter(transfer =>
    transfer.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transfer.trackingNumber && transfer.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generateTrackingNumber = () => {
    return `TRK-${Date.now().toString().slice(-8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.fromLocation || !formData.toLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.fromLocation === formData.toLocation) {
      toast.error('From and To locations cannot be the same');
      return;
    }

    const product = products.find(p => p.id.toString() === formData.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const newTransfer: StockTransfer = {
      id: Date.now().toString(),
      productId: parseInt(formData.productId),
      productName: product.name,
      quantity: parseInt(formData.quantity),
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      transferDate: formData.transferDate,
      requestedBy: 'Current User',
      status: 'pending',
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };
    
    setStockTransfers(prev => [...prev, newTransfer]);

    try {
      const { error } = await supabase.from('stock_transfers').insert({
        product_sku: product.sku || null,
        product_name: product.name,
        quantity: parseInt(formData.quantity),
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        transfer_date: formData.transferDate,
        requested_by: 'Current User',
        status: 'pending',
        notes: formData.notes || null,
      });
      if (error) console.warn('Failed to insert stock_transfer', error);
    } catch {}

    toast.success('Stock transfer request created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      fromLocation: '',
      toLocation: '',
      transferDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleApproveTransfer = async (id: string) => {
    const trackingNumber = generateTrackingNumber();
    setStockTransfers(prev => prev.map(transfer =>
      transfer.id === id ? {
        ...transfer,
        status: 'approved',
        approvedBy: 'Current User',
        trackingNumber
      } : transfer
    ));
    try { await supabase.from('stock_transfers').update({ status: 'approved', tracking_number: trackingNumber }).eq('id', Number(id)); } catch {}
    toast.success(`Transfer approved! Tracking: ${trackingNumber}`);
  };

  const handleStartTransit = async (id: string) => {
    setStockTransfers(prev => prev.map(transfer =>
      transfer.id === id ? { ...transfer, status: 'in_transit' } : transfer
    ));
    try { await supabase.from('stock_transfers').update({ status: 'in_transit' }).eq('id', Number(id)); } catch {}
    toast.success('Stock is now in transit!');
  };

  const handleReceiveTransfer = async (id: string) => {
    setStockTransfers(prev => prev.map(transfer =>
      transfer.id === id ? { ...transfer, status: 'received', receivedBy: 'Current User' } : transfer
    ));
    try { await supabase.from('stock_transfers').update({ status: 'received', received_by: 'Current User' }).eq('id', Number(id)); } catch {}
    toast.success('Stock transfer received successfully!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      approved: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      in_transit: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      received: 'bg-green-500/10 text-green-500 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalTransferred = stockTransfers.filter(t => t.status === 'received').reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Transfer Management</h1>
          <p className="text-muted-foreground">Transfer inventory between locations and branches</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
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
              
              <div>
                <Label htmlFor="quantity">Quantity to Transfer</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromLocation">From Location</Label>
                  <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toLocation">To Location</Label>
                  <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details about the transfer..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Transfer
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
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTransfers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Transferred</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTransferred}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stockTransfers.filter(t => t.status === 'in_transit').length}
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
              {stockTransfers.filter(t => t.status === 'pending').length}
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
              placeholder="Search stock transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight size={20} />
            Stock Transfers ({filteredTransfers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Quantity</TableHead>
                <TableHead className="text-white font-semibold">From</TableHead>
                <TableHead className="text-white font-semibold">To</TableHead>
                <TableHead className="text-white font-semibold">Transfer Date</TableHead>
                <TableHead className="text-white font-semibold">Tracking</TableHead>
                <TableHead className="text-white font-semibold">Requested By</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock transfers found</p>
                      <p className="text-sm text-muted-foreground">Create transfers to move inventory between locations</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{transfer.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{transfer.quantity} units</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{transfer.fromLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{transfer.toLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(transfer.transferDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transfer.trackingNumber ? (
                        <code className="text-sm bg-muted px-2 py-1 rounded">{transfer.trackingNumber}</code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{transfer.requestedBy}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(transfer.status)}>
                        {getStatusIcon(transfer.status)}
                        <span className="ml-1 capitalize">{transfer.status.replace('_', ' ')}</span>
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
                        {transfer.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveTransfer(transfer.id)}
                            className="text-green-600"
                          >
                            Approve
                          </Button>
                        )}
                        {transfer.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartTransit(transfer.id)}
                            className="text-blue-600"
                          >
                            Start Transit
                          </Button>
                        )}
                        {transfer.status === 'in_transit' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReceiveTransfer(transfer.id)}
                            className="text-purple-600"
                          >
                            Receive
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

export default StockTransfer;
