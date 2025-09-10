import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business' | 'credit';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

const BankAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    accountType: 'checking' as BankAccount['accountType'],
    balance: '',
    currency: 'USD',
    isActive: true
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('bank_accounts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: BankAccount[] = (data || []).map((row: any) => ({
          id: String(row.id),
          accountName: row.account_name,
          accountNumber: row.account_number,
          bankName: row.bank_name,
          accountType: row.account_type,
          balance: Number(row.balance) || 0,
          currency: row.currency || 'USD',
          isActive: !!row.is_active,
          createdAt: row.created_at,
        }));
        setBankAccounts(mapped);
      } catch (e) {
        console.warn('bank_accounts not available yet');
      }
    };
    load();
  }, []);

  const filteredAccounts = bankAccounts.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (editingAccount) {
      const { error } = await supabase.from('bank_accounts').update({
        account_name: formData.accountName,
        account_number: formData.accountNumber,
        bank_name: formData.bankName,
        account_type: formData.accountType,
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        is_active: formData.isActive,
      }).eq('id', Number(editingAccount.id));
      if (error) { toast.error(error.message); return; }
      setBankAccounts(prev => prev.map(account =>
        account.id === editingAccount.id
          ? { ...account, ...formData, balance: parseFloat(formData.balance) || 0 }
          : account
      ));
      toast.success('Bank account updated successfully!');
    } else {
      const { data, error } = await supabase.from('bank_accounts').insert({
        account_name: formData.accountName,
        account_number: formData.accountNumber,
        bank_name: formData.bankName,
        account_type: formData.accountType,
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        is_active: formData.isActive,
      }).select('*').single();
      if (error) { toast.error(error.message); return; }
      const newAccount: BankAccount = {
        id: String(data.id),
        accountName: data.account_name,
        accountNumber: data.account_number,
        bankName: data.bank_name,
        accountType: data.account_type,
        balance: Number(data.balance) || 0,
        currency: data.currency || 'USD',
        isActive: !!data.is_active,
        createdAt: data.created_at,
      };
      setBankAccounts(prev => [newAccount, ...prev]);
      toast.success('Bank account added successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountType: account.accountType,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      const { error } = await supabase.from('bank_accounts').delete().eq('id', Number(id));
      if (error) { toast.error(error.message); return; }
      setBankAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Bank account deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      accountNumber: '',
      bankName: '',
      accountType: 'checking',
      balance: '',
      currency: 'USD',
      isActive: true
    });
    setEditingAccount(null);
  };

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      checking: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      savings: 'bg-green-500/10 text-green-500 border border-green-500/20',
      business: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      credit: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    };
    return colors[type as keyof typeof colors] || colors.checking;
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your business bank accounts and balances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="Business Checking"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Chase Bank"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="****1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={formData.accountType} onValueChange={(value: BankAccount['accountType']) => setFormData(prev => ({ ...prev, accountType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="balance">Current Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? 'Update' : 'Add'} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Balance: ${totalBalance.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bank accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Bank Accounts ({filteredAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Account Name</TableHead>
                <TableHead className="text-white font-semibold">Bank</TableHead>
                <TableHead className="text-white font-semibold">Account Number</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Balance</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No bank accounts found</p>
                      <p className="text-sm text-muted-foreground">Add bank accounts to manage your finances</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.accountName}</TableCell>
                    <TableCell>{account.bankName}</TableCell>
                    <TableCell className="font-mono">****{account.accountNumber.slice(-4)}</TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeBadge(account.accountType)}>
                        {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {account.currency} {account.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
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

export default BankAccounts;
