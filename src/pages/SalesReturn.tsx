import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  RefreshCw, 
  FileText, 
  Calendar,
  DollarSign,
  Package,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SalesReturnItem {
  name: string;
  quantity: number;
  reason: string;
  returnPrice: number;
}

interface SalesReturn {
  id: string;
  customer: string;
  originalInvoice: string;
  status: string;
  totalAmount: number;
  returnDate: string;
  refundMethod: string;
  reason: string;
  items: SalesReturnItem[];
}

const SalesReturn = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [processOpen, setProcessOpen] = useState(false);
  const [processForm, setProcessForm] = useState({ customer: '', originalInvoice: '', refundMethod: 'cash', reason: '', amount: '', date: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('sales_returns')
          .select('id, return_number, total_amount, return_date, refund_method, status, reason, return_items:sales_return_items ( name, quantity, unit_price, total_amount )')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: SalesReturn[] = (data || []).map((row: any) => ({
          id: String(row.id),
          customer: '',
          originalInvoice: row.return_number || '-',
          status: row.status || 'pending',
          totalAmount: Number(row.total_amount) || 0,
          returnDate: row.return_date,
          refundMethod: row.refund_method || 'cash',
          reason: row.reason || '',
          items: (row.return_items || []).map((it: any) => ({
            name: it.name || '',
            quantity: it.quantity || 0,
            reason: row.reason || '',
            returnPrice: Number(it.unit_price) || 0,
          })),
        }));
        setSalesReturns(mapped);
      } catch (e) {
        console.warn('Failed to load sales returns');
      }
    };
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReturns = salesReturns.filter(returnItem => {
    const matchesSearch = (returnItem.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (returnItem.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (returnItem.originalInvoice || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const rows = filteredReturns.map(r => ({ id: r.id, return_number: r.originalInvoice, status: r.status, total_amount: r.totalAmount, return_date: r.returnDate, refund_method: r.refundMethod, reason: r.reason, items: r.items.length }));
    const header = Object.keys(rows[0] || { id: '', return_number: '', status: '', total_amount: '', return_date: '', refund_method: '', reason: '', items: '' });
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sales_returns.csv'; a.click(); URL.revokeObjectURL(url);
    toast.success('Exported sales returns to CSV');
  };

  const approveReturn = async (id: string) => {
    try { await supabase.from('sales_returns').update({ status: 'completed' }).eq('id', Number(id)); } catch {}
    setSalesReturns(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    toast.success('Return approved');
  };

  const rejectReturn = async (id: string) => {
    try { await supabase.from('sales_returns').update({ status: 'cancelled' }).eq('id', Number(id)); } catch {}
    setSalesReturns(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    toast.success('Return rejected');
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date();
      const dateStr = (processForm.date || today.toISOString().split('T')[0]).replace(/-/g, '');
      const { data: countData } = await supabase.from('sales_returns').select('id', { count: 'exact', head: true }).like('return_number', `R-${dateStr}-%`);
      const seq = ((countData as any)?.count || 0) + 1;
      const returnNo = `R-${dateStr}-${String(seq).padStart(4, '0')}`;
      const { error } = await supabase.from('sales_returns').insert({
        return_number: returnNo,
        total_amount: Number(processForm.amount || 0),
        return_date: processForm.date || today.toISOString().split('T')[0],
        refund_method: processForm.refundMethod,
        status: 'pending',
        reason: processForm.reason || null
      });
      if (error) { toast.error(error.message); return; }
      setProcessOpen(false);
      setProcessForm({ customer: '', originalInvoice: '', refundMethod: 'cash', reason: '', amount: '', date: '' });
      toast.success('Return created');
      const { data } = await supabase
        .from('sales_returns')
        .select('id, return_number, total_amount, return_date, refund_method, status, reason, return_items:sales_return_items ( name, quantity, unit_price, total_amount )')
        .order('created_at', { ascending: false });
      const mapped: SalesReturn[] = (data || []).map((row: any) => ({ id: String(row.id), customer: '', originalInvoice: row.return_number || '-', status: row.status || 'pending', totalAmount: Number(row.total_amount) || 0, returnDate: row.return_date, refundMethod: row.refund_method || 'cash', reason: row.reason || '', items: (row.return_items || []).map((it: any) => ({ name: it.name || '', quantity: it.quantity || 0, reason: row.reason || '', returnPrice: Number(it.unit_price) || 0 })) }));
      setSalesReturns(mapped);
    } catch {
      toast.error('Failed to create return');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Returns</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setProcessOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Process Return
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search returns, customers, or invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <div className="grid gap-4">
        {filteredReturns.map((returnItem) => (
          <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{returnItem.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Original: {returnItem.originalInvoice}
                    </p>
                  </div>
                  {getStatusBadge(returnItem.status)}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${returnItem.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{returnItem.returnDate}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{returnItem.customer}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{returnItem.items.length} item(s)</p>
                    <p className="text-xs text-muted-foreground">Returned</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">{returnItem.refundMethod.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">Refund Method</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{returnItem.reason}</p>
                    <p className="text-xs text-muted-foreground">Reason</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Returned Items:</h4>
                <div className="space-y-2">
                  {returnItem.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} • Reason: {item.reason}</p>
                      </div>
                      <p className="font-medium">${item.returnPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {returnItem.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => rejectReturn(returnItem.id)}>
                      Reject
                    </Button>
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approveReturn(returnItem.id)}>
                      Approve Return
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReturns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Returns Found</h3>
            <p className="text-muted-foreground">No returns match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesReturn;
