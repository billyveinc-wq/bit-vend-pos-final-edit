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
  TruckIcon, 
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

interface StockInRecord {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  batchNumber?: string;
  expiryDate?: string;
  receivedDate: string;
  receivedBy: string;
  status: 'pending' | 'received' | 'quality_check';
  notes?: string;
  createdAt: string;
}

const StockIn = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
    supplier: '',
    batchNumber: '',
    expiryDate: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>([]);

  const suppliers = [
    'Supplier A Ltd',
    'Supplier B Corp',
    'Supplier C Inc',
    'Local Distributor',
    'Wholesale Partner'
  ];

  const filteredRecords = stockInRecords.filter(record =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.batchNumber && record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.unitCost || !formData.supplier) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id.toString() === formData.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const unitCost = parseFloat(formData.unitCost);

    const newRecord: StockInRecord = {
      id: Date.now().toString(),
      productId: parseInt(formData.productId),
      productName: product.name,
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      supplier: formData.supplier,
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      receivedDate: formData.receivedDate,
      receivedBy: 'Current User',
      status: 'pending',
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };
    
    setStockInRecords(prev => [...prev, newRecord]);
    toast.success('Stock in record created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitCost: '',
      supplier: '',
      batchNumber: '',
      expiryDate: '',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleReceiveStock = (id: string) => {
    setStockInRecords(prev => prev.map(record =>
      record.id === id ? { ...record, status: 'received' } : record
    ));
    toast.success('Stock received successfully!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      received: 'bg-green-500/10 text-green-500 border border-green-500/20',
      quality_check: 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <CheckCircle className="h-4 w-4" />;
      case 'quality_check': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalReceived = stockInRecords.filter(r => r.status === 'received').reduce((sum, r) => sum + r.quantity, 0);
  const totalValue = stockInRecords.filter(r => r.status === 'received').reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock In Management</h1>
          <p className="text-muted-foreground">Receive and track incoming inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Receive Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Receive Stock</DialogTitle>
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
                        {product.name} - Current Stock: {product.stock || 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity Received</Label>
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
                  <Label htmlFor="unitCost">Unit Cost</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="BATCH-001"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receivedDate">Received Date</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the received stock..."
                  rows={3}
                />
              </div>

              {/* Cost Summary */}
              {formData.quantity && formData.unitCost && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cost Summary</h4>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">${(parseInt(formData.quantity || '0') * parseFloat(formData.unitCost || '0')).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Receive Stock
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
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockInRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Received</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalReceived}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TruckIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalValue.toLocaleString()}
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
              {stockInRecords.filter(r => r.status === 'pending').length}
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
              placeholder="Search stock receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock In Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon size={20} />
            Stock In Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Quantity</TableHead>
                <TableHead className="text-white font-semibold">Unit Cost</TableHead>
                <TableHead className="text-white font-semibold">Total Cost</TableHead>
                <TableHead className="text-white font-semibold">Supplier</TableHead>
                <TableHead className="text-white font-semibold">Batch</TableHead>
                <TableHead className="text-white font-semibold">Received Date</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <TruckIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock in records found</p>
                      <p className="text-sm text-muted-foreground">Receive stock to track incoming inventory</p>
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
                    <TableCell>${record.unitCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-medium">${record.totalCost.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{record.supplier}</TableCell>
                    <TableCell>
                      {record.batchNumber ? (
                        <code className="text-sm bg-muted px-2 py-1 rounded">{record.batchNumber}</code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(record.receivedDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status.replace('_', ' ')}</span>
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
                            onClick={() => handleReceiveStock(record.id)}
                            className="text-green-600"
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

export default StockIn;
