import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { cn } from '@/lib/utils';

const Inventory = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'in_stock') {
      matchesStatus = (product.stock || 0) > 10;
    } else if (statusFilter === 'low_stock') {
      matchesStatus = (product.stock || 0) > 0 && (product.stock || 0) <= 10;
    } else if (statusFilter === 'out_of_stock') {
      matchesStatus = (product.stock || 0) === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= 10) return 'low_stock';
    return 'in_stock';
  };

  const getStockBadge = (stock: number) => {
    const status = getStockStatus(stock);
    const baseClasses = "text-center justify-center text-xs px-2 py-1";
    
    if (status === 'out_of_stock') {
      return <Badge variant="destructive" className={baseClasses}>Out of Stock</Badge>;
    } else if (status === 'low_stock') {
      return <Badge variant="secondary" className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>Low Stock</Badge>;
    } else {
      return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>In Stock</Badge>;
    }
  };

  const getStockIcon = (stock: number) => {
    const status = getStockStatus(stock);
    switch (status) {
      case 'out_of_stock': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'low_stock': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'in_stock': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const inStockCount = products.filter(p => (p.stock || 0) > 10).length;
  const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and inventory status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Valuation: ${totalValue.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== 'all').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Inventory Overview ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">SKU</TableHead>
                <TableHead className="text-white font-semibold">Category</TableHead>
                <TableHead className="text-white font-semibold">Current Stock</TableHead>
                <TableHead className="text-white font-semibold">Min Stock</TableHead>
                <TableHead className="text-white font-semibold">Unit Price</TableHead>
                <TableHead className="text-white font-semibold">Stock Value</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No products found</p>
                      <p className="text-sm text-muted-foreground">Add products to manage inventory</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stock = product.stock || 0;
                  const minStock = product.minStock || 5;
                  const stockValue = product.price * stock;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{product.sku || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStockIcon(stock)}
                          <span className={cn(
                            "font-medium",
                            stock === 0 ? "text-red-600" :
                            stock <= minStock ? "text-orange-600" :
                            "text-green-600"
                          )}>
                            {stock} units
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{minStock} units</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${stockValue.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {getStockBadge(stock)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;