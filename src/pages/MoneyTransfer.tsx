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
  ArrowRightLeft, 
  Plus, 
  Search, 
  Eye,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface MoneyTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  transferDate: string;
  reference: string;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  transferFee?: number;
  exchangeRate?: number;
  createdAt: string;
}

const MoneyTransfer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    transferDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    transferFee: ''
  });

  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);
  const [bankAccounts, setBankAccounts] = useState<{ id: string; name: string; }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: accs } = await supabase.from('bank_accounts').select('id, account_name, bank_name');
        setBankAccounts((accs || []).map((a: any) => ({ id: String(a.id), name: `${a.account_name}` })));
      } catch {}
      try {
        const { data: txs } = await supabase.from('money_transfers').select('*').order('created_at', { ascending: false });
        setTransfers((txs || []).map((t: any) => ({
          id: String(t.id),
          fromAccount: String(t.from_account_id || ''),
          toAccount: String(t.to_account_id || ''),
          amount: Number(t.amount) || 0,
          transferDate: t.transfer_date,
          reference: t.reference,
          description: t.description || '',
          status: t.status || 'pending',
          transferFee: Number(t.transfer_fee) || 0,
          createdAt: t.created_at,
        })));
      } catch {}
    };
    load();
  }, []);

  const filteredTransfers = transfers.filter(transfer =>
    transfer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toAccount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReference = () => {
    const randomRef = `TXN-${Date.now().toString().slice(-8)}`;
    setFormData(prev => ({ ...prev, reference: randomRef }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.fromAccount === formData.toAccount) {
      toast.error('From and To accounts cannot be the same');
      return;
    }
    const fromAcc = bankAccounts.find(b => b.name === formData.fromAccount);
    const toAcc = bankAccounts.find(b => b.name === formData.toAccount);

    try {
      const { data, error } = await supabase.from('money_transfers').insert({
        from_account_id: fromAcc ? Number(fromAcc.id) : null,
        to_account_id: toAcc ? Number(toAcc.id) : null,
        amount: parseFloat(formData.amount),
        transfer_date: formData.transferDate,
        reference: formData.reference,
        description: formData.description || null,
        transfer_fee: parseFloat(formData.transferFee) || 0,
        status: 'pending',
      }).select('*').single();
      if (error) { toast.error(error.message); return; }

      // Update balances sequentially
      if (fromAcc) {
        const { data: fromRow } = await supabase.from('bank_accounts').select('balance').eq('id', Number(fromAcc.id)).maybeSingle();
        const fromBal = Number(fromRow?.balance || 0);
        await supabase.from('bank_accounts').update({ balance: fromBal - parseFloat(formData.amount) }).eq('id', Number(fromAcc.id));
      }
      if (toAcc) {
        const { data: toRow } = await supabase.from('bank_accounts').select('balance').eq('id', Number(toAcc.id)).maybeSingle();
        const toBal = Number(toRow?.balance || 0);
        await supabase.from('bank_accounts').update({ balance: toBal + parseFloat(formData.amount) }).eq('id', Number(toAcc.id));
      }
      await supabase.from('money_transfers').update({ status: 'completed' }).eq('id', data.id);

      const newTransfer: MoneyTransfer = {
        id: String(data.id),
        fromAccount: fromAcc ? fromAcc.id : '',
        toAccount: toAcc ? toAcc.id : '',
        amount: Number(data.amount) || 0,
        transferDate: data.transfer_date,
        reference: data.reference,
        description: data.description || '',
        status: 'completed',
        transferFee: Number(data.transfer_fee) || 0,
        createdAt: data.created_at,
      };
      setTransfers(prev => [newTransfer, ...prev]);
      toast.success('Money transfer completed!');
    } catch (err: any) {
      toast.error('Failed to create transfer');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fromAccount: '',
      toAccount: '',
      amount: '',
      transferDate: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      transferFee: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-500/10 text-green-500 border border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalTransferred = transfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Money Transfer</h1>
          <p className="text-muted-foreground">Transfer funds between your bank accounts</p>
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
              <DialogTitle>Create Money Transfer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromAccount">From Account</Label>
                  <Select value={formData.fromAccount} onValueChange={(value) => setFormData(prev => ({ ...prev, fromAccount: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toAccount">To Account</Label>
                  <Select value={formData.toAccount} onValueChange={(value) => setFormData(prev => ({ ...prev, toAccount: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Transfer Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transferFee">Transfer Fee</Label>
                  <Input
                    id="transferFee"
                    type="number"
                    step="0.01"
                    value={formData.transferFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, transferFee: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="reference">Reference Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="TXN-12345678"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateReference}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Purpose of transfer..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Initiate Transfer
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
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transfers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transfers.filter(t => t.status === 'completed').length}
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
              {transfers.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalTransferred.toLocaleString()}
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
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft size={20} />
            Money Transfers ({filteredTransfers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Reference</TableHead>
                <TableHead className="text-white font-semibold">From Account</TableHead>
                <TableHead className="text-white font-semibold">To Account</TableHead>
                <TableHead className="text-white font-semibold">Amount</TableHead>
                <TableHead className="text-white font-semibold">Fee</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No money transfers found</p>
                      <p className="text-sm text-muted-foreground">Create transfers to move funds between accounts</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{transfer.reference}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transfer.fromAccount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transfer.toAccount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${transfer.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">${(transfer.transferFee || 0).toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(transfer.transferDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(transfer.status)}>
                        {getStatusIcon(transfer.status)}
                        <span className="ml-1 capitalize">{transfer.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye size={14} />
                      </Button>
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

export default MoneyTransfer;
