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

const CashFlow = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showModal, setShowModal] = useState(false);

  const [cashFlowData] = useState({
    period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    operatingActivities: [],
    investingActivities: [],
    financingActivities: []
  });

  const calculateTotal = (activities: any[]) => {
    return activities.reduce((sum, activity) => sum + activity.amount, 0);
  };

  const operatingCashFlow = calculateTotal(cashFlowData.operatingActivities);
  const investingCashFlow = calculateTotal(cashFlowData.investingActivities);
  const financingCashFlow = calculateTotal(cashFlowData.financingActivities);
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

  const handleExportPDF = () => {
    console.log('Exporting Cash Flow as PDF...');
  };

  const handleExportXLS = () => {
    console.log('Exporting Cash Flow as XLS...');
  };

  const handleExportAllZIP = () => {
    console.log('Exporting all reports as ZIP...');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
          <p className="text-muted-foreground">Track your company's cash inflows and outflows</p>
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
                  <DialogTitle>Cash Flow Statement - Detailed View</DialogTitle>
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
                        <TableHead className="text-white font-semibold">Description</TableHead>
                        <TableHead className="text-white font-semibold text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-bold">OPERATING ACTIVITIES</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.operatingActivities.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-semibold pl-4">Net Cash from Operating Activities</TableCell>
                        <TableCell className="text-right font-semibold">${operatingCashFlow.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold pt-4">INVESTING ACTIVITIES</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.investingActivities.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-semibold pl-4">Net Cash from Investing Activities</TableCell>
                        <TableCell className="text-right font-semibold">${investingCashFlow.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold pt-4">FINANCING ACTIVITIES</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.financingActivities.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-semibold pl-4">Net Cash from Financing Activities</TableCell>
                        <TableCell className="text-right font-semibold">${financingCashFlow.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">NET INCREASE IN CASH</TableCell>
                        <TableCell className="text-right font-bold">${netCashFlow.toLocaleString()}</TableCell>
                      </TableRow>
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
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operating</p>
                <p className="text-2xl font-bold">${operatingCashFlow.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investing</p>
                <p className="text-2xl font-bold">${investingCashFlow.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <TrendingDown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Financing</p>
                <p className="text-2xl font-bold">${financingCashFlow.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p className="text-2xl font-bold">${netCashFlow.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Overview */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Statement for {cashFlowData.period}</CardTitle>
          </CardHeader>
          <CardContent>
            {netCashFlow === 0 && cashFlowData.operatingActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cash flow data available</p>
                <p className="text-sm">Add financial transactions to generate cash flow statement</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Operating Activities</h4>
                  {cashFlowData.operatingActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>{activity.description}</span>
                      <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.amount >= 0 ? '+' : ''}${activity.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 border-t font-semibold">
                    <span>Net Cash from Operating Activities</span>
                    <span className={operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${operatingCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Investing Activities</h4>
                  {cashFlowData.investingActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>{activity.description}</span>
                      <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.amount >= 0 ? '+' : ''}${activity.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 border-t font-semibold">
                    <span>Net Cash from Investing Activities</span>
                    <span className={investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${investingCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Financing Activities</h4>
                  {cashFlowData.financingActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>{activity.description}</span>
                      <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.amount >= 0 ? '+' : ''}${activity.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 border-t font-semibold">
                    <span>Net Cash from Financing Activities</span>
                    <span className={financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${financingCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Net Increase in Cash</span>
                    <span className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netCashFlow.toLocaleString()}
                    </span>
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

export default CashFlow;