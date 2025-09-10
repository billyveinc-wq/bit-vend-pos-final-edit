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
  Layers, 
  Plus, 
  Search, 
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/integrations/supabase/client';

interface StockAdjustment {
  id: string;
  productId: number;
  productName: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
  adjustmentDate: string;
  adjustedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const StockAdjustment = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    adjustmentType: 'increase' as StockAdjustment['adjustmentType'],
    quantity: '',
    reason: '',
    notes: '',
    adjustmentDate: new Date().toISOString().split('T')[0]
  });

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('stock_adjustments').select('*').order('created_at', { ascending: false });
        const mapped: StockAdjustment[] = (data || []).map((row: any) => ({
          id: String(row.id),
          productId: 0,
          productName: row.product_name,
          adjustmentType: (row.adjustment_type || 'increase') as StockAdjustment['adjustmentType'],
          quantity: row.quantity,
          reason: row.reason || '',
          notes: row.notes || '',
          adjustmentDate: row.adjustment_date,
          adjustedBy: row.adjusted_by || 'System',
          status: row.status || 'pending',
          createdAt: row.created_at,
        }));
        setAdjustments(mapped);
      } catch (e) { console.warn('stock_adjustments not available'); }
    };
    load();
  }, []);

  const filteredAdjustments = adjustments.filter(adjustment =>
    adjustment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.adjustedBy.toLowerCase().includes(searchTerm.toLowerCase())
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
    const newAdjustment: StockAdjustment = {
      id: Date.now().toString(),
      productId: parseInt(formData.productId),
      productName: product.name,
      adjustmentType: formData.adjustmentType,
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      notes: formData.notes,
      adjustmentDate: formData.adjustmentDate,
      adjustedBy: 'Current User',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setAdjustments(prev => [...prev, newAdjustment]);

    try {
      const { error } = await supabase.from('stock_adjustments').insert({
        product_sku: product.sku || null,
        product_name: product.name,
        adjustment_type: formData.adjustmentType,
        quantity: parseInt(formData.quantity),
        reason: formData.reason || null,
        notes: formData.notes || null,
        adjustment_date: formData.adjustmentDate,
        adjusted_by: 'Current User',
        status: 'pending',
      });
      if (error) console.warn('Failed to insert stock_adjustment', error);
    } catch {}

    toast.success('Stock adjustment created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      adjustmentType: 'increase',
      quantity: '',
      reason: '',
      notes: '',
      adjustmentDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleApproveAdjustment = async (id: string) => {
    const adj = adjustments.find(a => a.id === id);
    setAdjustments(prev => prev.map(adj =>
      adj.id === id ? { ...adj, status: 'approved' } : adj
    ));
    try {
      await supabase.from('stock_adjustments').update({ status: 'approved' }).eq('id', Number(id));
      const product = products.find(p => p.name === adj?.productName);
      if (product?.sku && adj) {
        const { data: prodRow } = await supabase.from('products').select('stock').eq('sku', product.sku).maybeSingle();
        const current = Number(prodRow?.stock || 0);
        const delta = adj.adjustmentType === 'increase' ? adj.quantity : -adj.quantity;
        const next = Math.max(0, current + delta);
        await supabase.from('products').update({ stock: next }).eq('sku', product.sku);
        await supabase.from('inventory_movements').insert({ product_sku: product.sku, change: delta, reason: 'stock_adjustment' });
      }
    } catch (e) { console.warn('Approve adjustment failed', e); }
    toast.success('Stock adjustment approved!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-500 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getAdjustmentIcon = (type: string) => {
    return type === 'increase' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const totalIncreases = adjustments.filter(a => a.adjustmentType === 'increase' && a.status === 'approved').reduce((sum, a) => sum + a.quantity, 0);
  const totalDecreases = adjustments.filter(a => a.adjustmentType === 'decrease' && a.status === 'approved').reduce((sum, a) => sum + a.quantity, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Adjustment</h1>
          <p className="text-muted-foreground">Adjust inventory levels for damaged, lost, or found items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
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
                  <Label htmlFor="adjustmentType">Adjustment Type</Label>
                  <Select value={formData.adjustmentType} onValueChange={(value: StockAdjustment['adjustmentType']) => setFormData(prev => ({ ...prev, adjustmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase Stock</SelectItem>
                      <SelectItem value="decrease">Decrease Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Damaged">Damaged Items</SelectItem>
                      <SelectItem value="Lost">Lost Items</SelectItem>
                      <SelectItem value="Found">Found Items</SelectItem>
                      <SelectItem value="Expired">Expired Items</SelectItem>
                      <SelectItem value="Theft">Theft</SelectItem>
                      <SelectItem value="Recount">Physical Recount</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustmentDate">Adjustment Date</Label>
                  <Input
                    id="adjustmentDate"
                    type="date"
                    value={formData.adjustmentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustmentDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details about the adjustment..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Adjustment
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
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adjustments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Increases</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncreases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Decreases</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalDecreases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {adjustments.filter(a => a.status === 'pending').length}
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
              placeholder="Search adjustments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Adjustments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers size={20} />
            Stock Adjustments ({filteredAdjustments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Quantity</TableHead>
                <TableHead className="text-white font-semibold">Reason</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Adjusted By</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock adjustments found</p>
                      <p className="text-sm text-muted-foreground">Create adjustments to modify inventory levels</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{adjustment.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAdjustmentIcon(adjustment.adjustmentType)}
                        <span className="capitalize">{adjustment.adjustmentType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{adjustment.quantity} units</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{adjustment.reason}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(adjustment.adjustmentDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{adjustment.adjustedBy}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(adjustment.status)}>
                        {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
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
                        {adjustment.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveAdjustment(adjustment.id)}
                            className="text-green-600"
                          >
                            Approve
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

export default StockAdjustment;
