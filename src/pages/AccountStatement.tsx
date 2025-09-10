import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Archive,
  Search,
  Filter
} from 'lucide-react';

const AccountStatement = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);

  const [accountStatementData, setAccountStatementData] = useState({
    accountInfo: {
      accountCode: '',
      accountName: '',
      openingBalance: 0,
      closingBalance: 0
    },
    transactions: []
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data, error } = await supabase.from('bank_accounts').select('id, account_name');
        if (!error && Array.isArray(data)) {
          setAccounts([{ id: 'all', name: 'All Accounts' }, ...data.map(d => ({ id: String(d.id), name: d.account_name }))]);
        } else {
          setAccounts([{ id: 'all', name: 'All Accounts' }]);
        }
      } catch {
        setAccounts([{ id: 'all', name: 'All Accounts' }]);
      }
    };
    loadAccounts();
  }, []);

  const getRange = (period: string) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    if (period === 'current-month') {
      start.setDate(1);
    } else if (period === 'last-month') {
      start.setMonth(now.getMonth() - 1, 1);
      end.setMonth(now.getMonth(), 0);
    } else if (period === 'current-quarter') {
      const q = Math.floor(now.getMonth() / 3);
      start.setMonth(q * 3, 1);
    } else if (period === 'last-quarter') {
      const q = Math.floor(now.getMonth() / 3) - 1;
      const month = ((q + 4) % 4) * 3;
      start.setMonth(month, 1);
      end.setMonth(month + 3, 0);
    } else if (period === 'current-year') {
      start.setMonth(0, 1);
    } else if (period === 'last-year') {
      start.setFullYear(now.getFullYear() - 1, 0, 1);
      end.setFullYear(now.getFullYear() - 1, 11, 31);
    }
    const s = start.toISOString().split('T')[0];
    const e = end.toISOString().split('T')[0];
    return { start: s, end: e };
  };

  useEffect(() => {
    const load = async () => {
      const { start, end } = getRange(selectedPeriod);
      try {
        const [salesRes, expensesRes, incomeRes] = await Promise.all([
          supabase.from('sales').select('invoice_no, total, date').gte('date', start).lte('date', end),
          supabase.from('expenses').select('description, amount, date').gte('date', start).lte('date', end),
          supabase.from('income').select('description, amount, date').gte('date', start).lte('date', end),
        ]);
        if (salesRes.error) throw salesRes.error;
        if (expensesRes.error) throw expensesRes.error;
        if (incomeRes.error) throw incomeRes.error;
        const tx: any[] = [];
        (salesRes.data || []).forEach((s: any) => tx.push({ id: `S-${s.invoice_no}`, date: s.date, description: 'Sale', reference: s.invoice_no, type: 'receipt', debit: Number(s.total)||0, credit: 0, balance: 0 }));
        (incomeRes.data || []).forEach((i: any) => tx.push({ id: `I-${i.date}-${i.description}` , date: i.date, description: i.description || 'Income', reference: 'INC', type: 'deposit', debit: Number(i.amount)||0, credit: 0, balance: 0 }));
        (expensesRes.data || []).forEach((e: any) => tx.push({ id: `E-${e.date}-${e.description}` , date: e.date, description: e.description || 'Expense', reference: 'EXP', type: 'payment', debit: 0, credit: Number(e.amount)||0, balance: 0 }));
        tx.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
        let running = 0;
        const withBal = tx.map(t => ({ ...t, balance: (running += (t.debit - t.credit)) }));
        const opening = 0;
        const closing = opening + withBal.reduce((s,t)=> s + (t.debit - t.credit), 0);
        setAccountStatementData({
          accountInfo: { accountCode: selectedAccount || 'ALL', accountName: (accounts.find(a=>a.id===selectedAccount)?.name) || 'All Accounts', openingBalance: opening, closingBalance: closing },
          transactions: withBal,
        });
      } catch {
        // Keep defaults
      }
    };
    load();
  }, [selectedPeriod, selectedAccount]);

  const filteredTransactions = accountStatementData.transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebits = filteredTransactions.reduce((sum, transaction) => sum + transaction.debit, 0);
  const totalCredits = filteredTransactions.reduce((sum, transaction) => sum + transaction.credit, 0);

  const getTransactionBadge = (type: string) => {
    const variants: { [key: string]: "default" | "destructive" | "outline" | "secondary" } = {
      receipt: 'default',
      payment: 'secondary',
      deposit: 'outline',
      withdrawal: 'destructive'
    };
    return variants[type] || 'default';
  };

  const handleExportPDF = () => {
    console.log('Exporting Account Statement as PDF...');
  };

  const handleExportXLS = () => {
    console.log('Exporting Account Statement as XLS...');
  };

  const handleExportAllZIP = () => {
    console.log('Exporting all reports as ZIP...');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Statement</h1>
          <p className="text-muted-foreground">View detailed account transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAllZIP}>
            <Archive className="w-4 h-4 mr-2" />
            Export All ZIP
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-foreground dark:text-white" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Account Statement - Detailed View</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportXLS}>
                      <FileText className="w-4 h-4 mr-1" />
                      XLS
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="font-medium">{transaction.reference}</TableCell>
                          <TableCell>
                            <Badge variant={getTransactionBadge(transaction.type)}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${transaction.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-xl font-bold">${accountStatementData.accountInfo.openingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debits</p>
                <p className="text-xl font-bold">${totalDebits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-xl font-bold">${totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closing Balance</p>
                <p className="text-xl font-bold">${accountStatementData.accountInfo.closingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statement Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {accountStatementData.accountInfo.accountCode ? 
              `${accountStatementData.accountInfo.accountCode} - ${accountStatementData.accountInfo.accountName}` :
              'Account Statement'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Account Statement Data</h3>
              <p>Select an account and add transactions to view account statement</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500 hover:bg-blue-500">
                  <TableHead className="text-white font-semibold">Date</TableHead>
                  <TableHead className="text-white font-semibold">Description</TableHead>
                  <TableHead className="text-white font-semibold">Reference</TableHead>
                  <TableHead className="text-white font-semibold">Type</TableHead>
                  <TableHead className="text-white font-semibold text-right">Debit</TableHead>
                  <TableHead className="text-white font-semibold text-right">Credit</TableHead>
                  <TableHead className="text-white font-semibold text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="font-medium">{transaction.reference}</TableCell>
                    <TableCell>
                      <Badge variant={getTransactionBadge(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStatement;
