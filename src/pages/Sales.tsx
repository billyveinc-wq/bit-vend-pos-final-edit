import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ShoppingCart, 
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Download
} from 'lucide-react';
import { useSEO } from '@/lib/seo';
import { useSales } from '@/contexts/SalesContext';

interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  saleDate: string;
  salesPerson: string;
}

const Sales = () => {
  useSEO('Sales List - Manage Sales Transactions', 'View and manage all sales transactions, track revenue and sales performance.');

  const [searchTerm, setSearchTerm] = useState('');

  const { sales } = useSales();

  const filteredSales = sales.filter(sale =>
    sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedSales = sales.filter(s => s.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
  const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales List</h1>
          <p className="text-muted-foreground">View and manage all sales transactions and revenue</p>
        </div>
        <Button className="gap-2">
          <Download size={16} />
          Export Sales
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales by invoice number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Sales Transactions ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Invoice</TableHead>
                <TableHead className="text-white font-semibold">Customer</TableHead>
                <TableHead className="text-white font-semibold">Items</TableHead>
                <TableHead className="text-white font-semibold">Amount</TableHead>
                <TableHead className="text-white font-semibold">Payment</TableHead>
                <TableHead className="text-white font-semibold">Sales Person</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.invoiceNo}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.customerName || 'Walk-in Customer'}</div>
                    <div className="text-xs text-muted-foreground">{sale.customerPhone || 'No contact'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sale.items[0]?.productName || 'No items'}{sale.items.length > 1 && ', ...'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${sale.total.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      Tax: ${sale.tax.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-foreground border border-border">
                      {sale.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{sale.salesPerson || 'System'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(sale.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(sale.date + 'T' + sale.time).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        sale.status === 'completed' ? 'default' : 
                        sale.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;