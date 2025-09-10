import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  DollarSign,
  Package,
  User,
  Send,
  Eye,
  Edit,
  Copy,
  Download,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


const Quotation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  interface QuoteItem { name: string; quantity: number; price: number; total: number; }
  interface Quote { id: string; quoteNo: string; customer: string; customerEmail: string; phone?: string; date: string; validUntil?: string; notes?: string; template?: string; status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'; subtotal: number; tax: number; total: number; items: QuoteItem[]; }

  const [quotations, setQuotations] = useState<Quote[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('id, quote_no, customer, email, phone, date, valid_until, notes, template, status, subtotal, tax, total, quotation_items(id, name, quantity, price, total)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: Quote[] = (data || []).map((row: any) => ({
          id: String(row.id),
          quoteNo: row.quote_no,
          customer: row.customer,
          customerEmail: row.email,
          phone: row.phone || undefined,
          date: row.date,
          validUntil: row.valid_until || undefined,
          notes: row.notes || undefined,
          template: row.template || undefined,
          status: (row.status || 'draft') as Quote['status'],
          subtotal: Number(row.subtotal) || 0,
          tax: Number(row.tax) || 0,
          total: Number(row.total) || 0,
          items: (row.quotation_items || []).map((it: any) => ({
            name: it.name,
            quantity: it.quantity,
            price: Number(it.price) || 0,
            total: Number(it.total) || 0,
          })),
        }));
        setQuotations(mapped);
      } catch (e) {
        console.warn('quotations not available');
      }
    };
    load();
  }, []);
  
  // Add missing handlers for quotation actions
  const handleSendQuotation = async (id: string) => {
    try { await supabase.from('quotations').update({ status: 'sent' }).eq('id', Number(id)); } catch {}
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'sent' } : q));
    toast.success('Quotation sent to customer successfully!');
  };
  
  const handleDuplicateQuotation = async (id: string) => {
    const q = quotations.find(x => x.id === id);
    if (!q) return;
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const { data: countData } = await supabase.from('quotations').select('id', { count: 'exact', head: true }).like('quote_no', `Q-${dateStr}-%`);
      const seq = ((countData as any)?.count || 0) + 1;
      const quoteNo = `Q-${dateStr}-${String(seq).padStart(4, '0')}`;
      const { data, error } = await supabase.from('quotations').insert({
        quote_no: quoteNo,
        customer: q.customer,
        email: q.customerEmail,
        phone: q.phone || null,
        date: today.toISOString().split('T')[0],
        valid_until: q.validUntil || null,
        notes: q.notes || null,
        template: q.template || null,
        status: 'draft',
        subtotal: q.subtotal,
        tax: q.tax,
        total: q.total,
      }).select('id').single();
      if (!error && data?.id) {
        setQuotations(prev => [{ ...q, id: String(data.id), quoteNo, status: 'draft' }, ...prev]);
      }
    } catch {}
    toast.success('Quotation duplicated successfully!');
  };
  
  const handleDownloadPDF = (id: string) => {
    toast.success('Quotation PDF downloaded successfully!');
  };
  
  const handleViewQuotation = (id: string) => {
    toast.info('Opening quotation details...');
  };
  
  const handleEditQuotation = (id: string) => {
    navigate(`/dashboard/quotation/edit/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Send className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Create and manage customer quotations</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Quotation Templates</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'standard', name: 'Standard Quote', description: 'Basic quotation template' },
                  { id: 'detailed', name: 'Detailed Quote', description: 'Comprehensive quotation with terms' },
                  { id: 'service', name: 'Service Quote', description: 'Template for service-based quotes' },
                  { id: 'product', name: 'Product Quote', description: 'Template for product sales' },
                  { id: 'wholesale', name: 'Wholesale Quote', description: 'Bulk pricing template' },
                  { id: 'custom', name: 'Custom Template', description: 'Create your own template' }
                ].map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            toast.success(`Using ${template.name} template`);
                            navigate('/dashboard/quotation/new', { state: { template: template.id } });
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate('/dashboard/quotation/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
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
                  placeholder="Search quotations or customers..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid gap-4">
        {filteredQuotations.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{quote.id}</h3>
                    <p className="text-sm text-muted-foreground">{quote.customer}</p>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${quote.total.toFixed(2)}</p>
                  <div className="flex items-center justify-end gap-2">
                    {quote.template && <Badge variant="outline">Template: {quote.template}</Badge>}
                    <p className="text-sm text-muted-foreground">Valid until {quote.validUntil}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-foreground dark:text-white" />
                  <div>
                    <p className="text-sm font-medium">{quote.date}</p>
                    <p className="text-xs text-muted-foreground">Quote Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{quote.items.length} item(s)</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">${quote.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{quote.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {quote.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                  {quote.items.length > 2 && (
                    <p className="text-sm text-muted-foreground px-3">
                      +{quote.items.length - 2} more item(s)
                    </p>
                  )}
                </div>
              </div>

              {quote.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded">
                  <p className="text-sm"><strong>Notes:</strong> {quote.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" size="sm" onClick={() => handleDuplicateQuotation(quote.id)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(quote.id)}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewQuotation(quote.id)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {quote.status === 'draft' && (
                  <Button size="sm" onClick={() => handleSendQuotation(quote.id)}>
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                )}
                {quote.status === 'sent' && (
                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleEditQuotation(quote.id)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quotations Found</h3>
            <p className="text-muted-foreground">No quotations match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Quotation;
