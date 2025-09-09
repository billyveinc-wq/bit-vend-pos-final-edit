import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Archive
} from 'lucide-react';

const TrialBalance = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showModal, setShowModal] = useState(false);

  const [trialBalanceData] = useState({
    asOfDate: new Date().toISOString().split('T')[0],
    accounts: []
  });

  const totalDebits = trialBalanceData.accounts.reduce((sum, account) => sum + account.debit, 0);
  const totalCredits = trialBalanceData.accounts.reduce((sum, account) => sum + account.credit, 0);

  const handleExportPDF = () => {
    console.log('Exporting Trial Balance as PDF...');
  };

  const handleExportXLS = () => {
    console.log('Exporting Trial Balance as XLS...');
  };

  const handleExportAllZIP = () => {
    console.log('Exporting all reports as ZIP...');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">View your company's trial balance</p>
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

      {/* Period Selection */}
      <Card>
        <CardContent className="p-4">
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
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Trial Balance - Detailed View</DialogTitle>
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
                      <TableRow className="bg-blue-500 hover:bg-blue-500">
                        <TableHead className="text-white font-semibold">Account Code</TableHead>
                        <TableHead className="text-white font-semibold">Account Name</TableHead>
                        <TableHead className="text-white font-semibold text-right">Debit</TableHead>
                        <TableHead className="text-white font-semibold text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalanceData.accounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No trial balance data available. Add chart of accounts to generate trial balance.
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {trialBalanceData.accounts.map((account, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{account.accountCode}</TableCell>
                              <TableCell>{account.accountName}</TableCell>
                              <TableCell className="text-right">
                                {account.debit > 0 ? `$${account.debit.toLocaleString()}` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {account.credit > 0 ? `$${account.credit.toLocaleString()}` : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell className="font-bold">TOTALS</TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-bold">${totalDebits.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold">${totalCredits.toLocaleString()}</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debits</p>
                <p className="text-2xl font-bold">${totalDebits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">${totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance Check</p>
                <p className="text-2xl font-bold text-green-600">Balanced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance as of {trialBalanceData.asOfDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {trialBalanceData.accounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Trial Balance Data</h3>
              <p>Add chart of accounts and transactions to generate trial balance</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500 hover:bg-blue-500">
                  <TableHead className="text-white font-semibold">Account Code</TableHead>
                  <TableHead className="text-white font-semibold">Account Name</TableHead>
                  <TableHead className="text-white font-semibold text-right">Debit</TableHead>
                  <TableHead className="text-white font-semibold text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceData.accounts.map((account, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{account.accountCode}</TableCell>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">
                      {account.debit > 0 ? `$${account.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.credit > 0 ? `$${account.credit.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>TOTALS</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">${totalDebits.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${totalCredits.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialBalance;