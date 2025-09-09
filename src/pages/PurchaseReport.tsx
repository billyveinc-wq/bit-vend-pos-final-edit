import React, { useState } from 'react';
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
  Package,
  Truck,
  Eye,
  Archive,
  Search,
  Filter
} from 'lucide-react';

const PurchaseReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [purchaseData] = useState([]);

  const filteredData = purchaseData.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.items.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = supplierFilter === 'all' || item.supplier === supplierFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesSupplier && matchesStatus;
  });

  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);

  const handleExportPDF = () => {
    console.log('Exporting Purchase Report as PDF...');
  };

  const handleExportXLS = () => {
    console.log('Exporting Purchase Report as XLS...');
  };

  const handleExportAllZIP = () => {
    console.log('Exporting all reports as ZIP...');
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Reports & Analytics</h1>
            <p className="text-muted-foreground">Analyze purchase orders and supplier performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportAllZIP}
            className="transition-all duration-200 hover:scale-105"
          >
            <Archive className="w-4 h-4 mr-2" />
            Export All ZIP
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{filteredData.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalQuantity}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{filteredData.filter(p => p.status === 'delivered').length}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-slideInLeft">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, suppliers, or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 transition-all duration-200 focus:scale-105"
                />
              </div>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="current-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="Apple Inc.">Apple Inc.</SelectItem>
                <SelectItem value="Samsung Electronics">Samsung</SelectItem>
                <SelectItem value="Dell Technologies">Dell</SelectItem>
                <SelectItem value="Microsoft Corp">Microsoft</SelectItem>
                <SelectItem value="HP Inc.">HP Inc.</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Purchase Report - Detailed View</DialogTitle>
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
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow 
                          key={item.id}
                          className="hover:shadow-md transition-all duration-200 animate-fadeInUp"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>{item.items}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              item.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              item.status === 'shipped' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {item.paymentStatus}
                            </span>
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

      {/* Purchase Report Table */}
      <Card className="animate-slideInLeft">
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow 
                    key={item.id}
                    className="hover:shadow-md transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.items}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        item.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        item.status === 'shipped' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseReport;