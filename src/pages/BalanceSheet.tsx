import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const BalanceSheet = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showModal, setShowModal] = useState(false);

  const [balanceSheetData] = useState({
    asOfDate: new Date().toISOString().split('T')[0],
    assets: {
      currentAssets: [],
      fixedAssets: []
    },
    liabilities: {
      currentLiabilities: [],
      longTermLiabilities: []
    },
    equity: []
  });

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const totalCurrentAssets = calculateTotal(balanceSheetData.assets.currentAssets);
  const totalFixedAssets = calculateTotal(balanceSheetData.assets.fixedAssets);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = calculateTotal(balanceSheetData.liabilities.currentLiabilities);
  const totalLongTermLiabilities = calculateTotal(balanceSheetData.liabilities.longTermLiabilities);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = calculateTotal(balanceSheetData.equity);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const handleExportPDF = () => {
    // PDF export logic
    console.log('Exporting Balance Sheet as PDF...');
  };

  const handleExportXLS = () => {
    // XLS export logic
    console.log('Exporting Balance Sheet as XLS...');
  };

  const handleExportAllZIP = () => {
    // ZIP export logic
    console.log('Exporting all reports as ZIP...');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">View your company's financial position</p>
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
                  <DialogTitle>Balance Sheet - Detailed View</DialogTitle>
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
                        <TableHead className="text-white font-semibold">Account</TableHead>
                        <TableHead className="text-white font-semibold text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceSheetData.assets.currentAssets.length === 0 && 
                       balanceSheetData.assets.fixedAssets.length === 0 && 
                       balanceSheetData.liabilities.currentLiabilities.length === 0 && 
                       balanceSheetData.liabilities.longTermLiabilities.length === 0 && 
                       balanceSheetData.equity.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            No balance sheet data available. Add financial accounts to generate balance sheet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          <TableRow>
                            <TableCell className="font-bold">ASSETS</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Current Assets</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {balanceSheetData.assets.currentAssets.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-8">{item.account}</TableCell>
                              <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Total Current Assets</TableCell>
                            <TableCell className="text-right font-semibold">${totalCurrentAssets.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Fixed Assets</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {balanceSheetData.assets.fixedAssets.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-8">{item.account}</TableCell>
                              <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Total Fixed Assets</TableCell>
                            <TableCell className="text-right font-semibold">${totalFixedAssets.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">TOTAL ASSETS</TableCell>
                            <TableCell className="text-right font-bold">${totalAssets.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold pt-6">LIABILITIES & EQUITY</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Current Liabilities</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {balanceSheetData.liabilities.currentLiabilities.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-8">{item.account}</TableCell>
                              <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Total Current Liabilities</TableCell>
                            <TableCell className="text-right font-semibold">${totalCurrentLiabilities.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Long-term Liabilities</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {balanceSheetData.liabilities.longTermLiabilities.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-8">{item.account}</TableCell>
                              <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Total Long-term Liabilities</TableCell>
                            <TableCell className="text-right font-semibold">${totalLongTermLiabilities.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">TOTAL LIABILITIES</TableCell>
                            <TableCell className="text-right font-bold">${totalLiabilities.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold pl-4">Equity</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {balanceSheetData.equity.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-8">{item.account}</TableCell>
                              <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-bold">TOTAL EQUITY</TableCell>
                            <TableCell className="text-right font-bold">${totalEquity.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">TOTAL LIABILITIES & EQUITY</TableCell>
                            <TableCell className="text-right font-bold">${totalLiabilitiesAndEquity.toLocaleString()}</TableCell>
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
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">${totalAssets.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold">${totalLiabilities.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Owner's Equity</p>
                <p className="text-2xl font-bold">${totalEquity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {totalAssets === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No asset data available</p>
                <p className="text-sm">Add financial accounts to view assets</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Assets</h4>
                  {balanceSheetData.assets.currentAssets.map((asset, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm">{asset.account}</span>
                      <span className="text-sm font-medium">${asset.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t font-semibold">
                    <span>Total Current Assets</span>
                    <span>${totalCurrentAssets.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fixed Assets</h4>
                  {balanceSheetData.assets.fixedAssets.map((asset, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm">{asset.account}</span>
                      <span className="text-sm font-medium">${asset.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t font-semibold">
                    <span>Total Fixed Assets</span>
                    <span>${totalFixedAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalLiabilitiesAndEquity === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No liability or equity data available</p>
                <p className="text-sm">Add financial accounts to view liabilities and equity</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Liabilities</h4>
                  {balanceSheetData.liabilities.currentLiabilities.map((liability, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm">{liability.account}</span>
                      <span className="text-sm font-medium">${liability.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t font-semibold">
                    <span>Total Current Liabilities</span>
                    <span>${totalCurrentLiabilities.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Long-term Liabilities</h4>
                  {balanceSheetData.liabilities.longTermLiabilities.map((liability, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm">{liability.account}</span>
                      <span className="text-sm font-medium">${liability.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t font-semibold">
                    <span>Total Long-term Liabilities</span>
                    <span>${totalLongTermLiabilities.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Equity</h4>
                  {balanceSheetData.equity.map((equity, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm">{equity.account}</span>
                      <span className="text-sm font-medium">${equity.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t font-semibold">
                    <span>Total Equity</span>
                    <span>${totalEquity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheet;