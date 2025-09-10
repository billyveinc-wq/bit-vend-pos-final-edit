import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Package,
  Palette,
  Ruler
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/integrations/supabase/client';

interface ProductVariant {
  id: string;
  productId: number;
  productName: string;
  variantType: 'size' | 'color' | 'material' | 'style' | 'other';
  variantName: string;
  variantValue: string;
  sku?: string;
  price?: number;
  stock?: number;
  isActive: boolean;
  createdAt: string;
}

const Variants = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    variantType: 'size' as ProductVariant['variantType'],
    variantName: '',
    variantValue: '',
    sku: '',
    price: '',
    stock: '',
    isActive: true
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('product_variants')
          .select('id, product_id, variant_name, sku, selling_price, stock_quantity, is_active, created_at, products:product_id ( name )')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: ProductVariant[] = (data || []).map((row: any) => ({
          id: String(row.id),
          productId: row.product_id,
          productName: row.products?.name || '',
          variantType: 'other',
          variantName: row.variant_name,
          variantValue: row.variant_name,
          sku: row.sku || '',
          price: row.selling_price ? Number(row.selling_price) : undefined,
          stock: typeof row.stock_quantity === 'number' ? row.stock_quantity : undefined,
          isActive: !!row.is_active,
          createdAt: row.created_at,
        }));
        setVariants(mapped);
      } catch (e) {
        console.warn('Failed to load variants');
      }
    };
    load();
  }, []);

  const filteredVariants = variants.filter(variant =>
    variant.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.variantValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (variant.sku && variant.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.variantName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id.toString() === formData.productId);
    if (!product) { toast.error('Product not found'); return; }

    if (editingVariant) {
      const { error } = await supabase
        .from('product_variants')
        .update({
          product_id: parseInt(formData.productId),
          variant_name: formData.variantName,
          sku: formData.sku || null,
          selling_price: formData.price ? parseFloat(formData.price) : null,
          stock_quantity: formData.stock ? parseInt(formData.stock) : null,
          is_active: formData.isActive,
        })
        .eq('id', editingVariant.id);
      if (error) { toast.error(error.message); return; }
      setVariants(prev => prev.map(variant =>
        variant.id === editingVariant.id
          ? {
            ...variant,
            productId: parseInt(formData.productId),
            productName: product.name,
            variantName: formData.variantName,
            variantValue: formData.variantName,
            sku: formData.sku,
            price: formData.price ? parseFloat(formData.price) : undefined,
            stock: formData.stock ? parseInt(formData.stock) : undefined,
            isActive: formData.isActive,
          }
          : variant
      ));
      toast.success('Product variant updated successfully!');
    } else {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: parseInt(formData.productId),
          variant_name: formData.variantName,
          sku: formData.sku || null,
          selling_price: formData.price ? parseFloat(formData.price) : null,
          stock_quantity: formData.stock ? parseInt(formData.stock) : null,
          is_active: formData.isActive,
        })
        .select('id')
        .single();
      if (error) { toast.error(error.message); return; }
      const newVariant: ProductVariant = {
        id: String((data as any).id),
        productId: parseInt(formData.productId),
        productName: product.name,
        variantType: formData.variantType,
        variantName: formData.variantName,
        variantValue: formData.variantName,
        sku: formData.sku,
        price: formData.price ? parseFloat(formData.price) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
      };
      setVariants(prev => [newVariant, ...prev]);
      toast.success('Product variant created successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId.toString(),
      variantType: variant.variantType,
      variantName: variant.variantName,
      variantValue: variant.variantValue,
      sku: variant.sku || '',
      price: variant.price?.toString() || '',
      stock: variant.stock?.toString() || '',
      isActive: variant.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) { toast.error(error.message); return; }
      setVariants(prev => prev.filter(variant => variant.id !== id));
      toast.success('Product variant deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      variantType: 'size',
      variantName: '',
      variantValue: '',
      sku: '',
      price: '',
      stock: '',
      isActive: true
    });
    setEditingVariant(null);
  };

  const getVariantTypeIcon = (type: string) => {
    switch (type) {
      case 'size': return <Ruler className="h-4 w-4" />;
      case 'color': return <Palette className="h-4 w-4" />;
      case 'material': return <Package className="h-4 w-4" />;
      case 'style': return <ClipboardList className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getVariantTypeBadge = (type: string) => {
    const colors = {
      size: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      material: 'bg-green-500/10 text-green-500 border border-green-500/20',
      style: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
      other: 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Variants</h1>
          <p className="text-muted-foreground">Manage product variations like size, color, and style</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? 'Edit Product Variant' : 'Add New Product Variant'}
              </DialogTitle>
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
                        {product.name} - {product.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variantType">Variant Type</Label>
                  <Select value={formData.variantType} onValueChange={(value: ProductVariant['variantType']) => setFormData(prev => ({ ...prev, variantType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="style">Style</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="variantName">Variant Name</Label>
                  <Input
                    id="variantName"
                    value={formData.variantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, variantName: e.target.value }))}
                    placeholder="e.g., Size, Color"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="variantValue">Variant Value</Label>
                <Input
                  id="variantValue"
                  value={formData.variantValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, variantValue: e.target.value }))}
                  placeholder="e.g., Large, Red, Cotton"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="SKU-VAR-001"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price Override</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Variant</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVariant ? 'Update' : 'Create'} Variant
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
            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{variants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Variants</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {variants.filter(v => v.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products with Variants</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(variants.map(v => v.productId)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variant Types</CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(variants.map(v => v.variantType)).size}
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
              placeholder="Search variants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList size={20} />
            Product Variants ({filteredVariants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Variant Type</TableHead>
                <TableHead className="text-white font-semibold">Variant Name</TableHead>
                <TableHead className="text-white font-semibold">Value</TableHead>
                <TableHead className="text-white font-semibold">SKU</TableHead>
                <TableHead className="text-white font-semibold">Price</TableHead>
                <TableHead className="text-white font-semibold">Stock</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No product variants found</p>
                      <p className="text-sm text-muted-foreground">Add variants to track different product options</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{variant.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getVariantTypeBadge(variant.variantType)}>
                        {getVariantTypeIcon(variant.variantType)}
                        <span className="ml-1 capitalize">{variant.variantType}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{variant.variantName}</TableCell>
                    <TableCell>
                      <span className="font-medium">{variant.variantValue}</span>
                    </TableCell>
                    <TableCell>
                      {variant.sku ? (
                        <code className="text-sm bg-muted px-2 py-1 rounded">{variant.sku}</code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {variant.price ? (
                        <span className="font-medium text-green-600">${variant.price.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {variant.stock !== undefined ? (
                        <span className="font-medium">{variant.stock} units</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.isActive ? "default" : "secondary"}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(variant.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
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

export default Variants;
