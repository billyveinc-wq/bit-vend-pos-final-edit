import React, { useEffect, useMemo, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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

  const { sales: localSales } = useSales();
  const [dbSales, setDbSales] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('id, invoice_number, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, created_at, sale_items ( quantity, unit_price, total_amount )')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((row: any) => ({
          id: String(row.id),
          invoiceNo: row.invoice_number || '-',
          customerName: '',
          customerPhone: '',
          items: (row.sale_items || []).map((it: any) => ({
            productName: '',
            quantity: it.quantity,
            price: Number(it.unit_price) || 0,
            total: Number(it.total_amount) || 0,
          })),
          subtotal: Number(row.subtotal) || 0,
          tax: Number(row.tax_amount) || 0,
          discount: Number(row.discount_amount) || 0,
          total: Number(row.total_amount) || 0,
          paymentMethod: (row.payment_method || 'cash'),
          status: (row.payment_status || 'completed'),
          salesPerson: '',
          date: new Date(row.created_at).toISOString().split('T')[0],
          time: new Date(row.created_at).toLocaleTimeString(),
        }));
        setDbSales(mapped);
      } catch (e) {
        console.warn('Failed to load sales');
      }
    };
    load();
  }, []);

  const allSales = useMemo(() => {
    const localMapped = (localSales || []).map((s: any) => ({
      id: s.id || s.invoiceNo,
      invoiceNo: s.invoiceNo,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      items: s.items,
      subtotal: s.subtotal,
      tax: s.tax,
      discount: s.discount,
      total: s.total,
      paymentMethod: s.paymentMethod,
      status: s.status,
      salesPerson: s.salesPerson,
      date: s.date,
      time: s.time,
    }));
    const byId = new Map<string, any>();
    [...dbSales, ...localMapped].forEach((s) => byId.set(String(s.id), s));
    return Array.from(byId.values());
  }, [dbSales, localSales]);

  const filteredSales = useMemo(() => allSales.filter((sale: any) =>
    String(sale.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(sale.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [allSales, searchTerm]);

  const completedSales = allSales.filter((s: any) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
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
            <div className="text-2xl font-bold">{allSales.length}</div>
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
                      {(Array.isArray(sale.items) ? sale.items.length : 0)} item{(Array.isArray(sale.items) ? sale.items.length : 0) > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(Array.isArray(sale.items) && sale.items[0]?.productName) || 'No items'}{(Array.isArray(sale.items) ? sale.items.length : 0) > 1 && ', ...'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${Number(sale.total || 0).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      Tax: ${Number(sale.tax || 0).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-foreground border border-border">
                      {String(sale.paymentMethod || 'cash').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{sale.salesPerson || 'System'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.date ? new Date(sale.date).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sale.date && sale.time ? new Date(`${sale.date}T${sale.time}`).toLocaleTimeString() : '-'}
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
