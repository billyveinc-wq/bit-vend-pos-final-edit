import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Search,
  Filter,
  ArrowLeft,
  FileDown,
  FileSpreadsheet,
  FileBarChart,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  Package,
  User,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportType {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'summary';
  filters: string[];
  lastGenerated?: string;
  status: 'available' | 'generating' | 'error';
}

const ReportView: React.FC = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const itemsPerPage = 15;

  const reportTypes: ReportType[] = [
    { id: '1', category: 'Business Overview', name: 'Summary Report', description: 'Overall business performance summary', type: 'summary', filters: ['date', 'branch'], status: 'available' },
    { id: '2', category: 'Business Overview', name: 'Quarters Report', description: 'Quarterly performance analysis', type: 'chart', filters: ['year', 'quarter'], status: 'available' },
    { id: '3', category: 'Business Overview', name: 'Profit by Product Report', description: 'Product profitability analysis', type: 'table', filters: ['date', 'category'], status: 'available' },
    { id: '4', category: 'Business Overview', name: 'Profit & Loss', description: 'Financial P&L statement', type: 'summary', filters: ['date', 'branch'], status: 'available' },
    { id: '5', category: 'Sales', name: 'Sales Summary', description: 'Comprehensive sales overview', type: 'summary', filters: ['date', 'cashier', 'payment'], status: 'available' },
    { id: '6', category: 'Sales', name: 'Sales by Product', description: 'Product-wise sales analysis', type: 'table', filters: ['date', 'category', 'product'], status: 'available' },
    { id: '7', category: 'Sales', name: 'Sales by Customer', description: 'Customer purchase patterns', type: 'table', filters: ['date', 'customer'], status: 'available' },
    { id: '8', category: 'Sales', name: 'Sales by Category', description: 'Category performance report', type: 'chart', filters: ['date', 'category'], status: 'available' },
    { id: '9', category: 'Sales', name: 'Sales by Employee', description: 'Staff performance tracking', type: 'table', filters: ['date', 'employee'], status: 'available' },
    { id: '10', category: 'Sales', name: 'Daily/Weekly/Monthly Trends', description: 'Sales trend analysis', type: 'chart', filters: ['period', 'comparison'], status: 'available' },
    { id: '11', category: 'Sales', name: 'Sales Returns Report', description: 'Returns and refunds tracking', type: 'table', filters: ['date', 'reason'], status: 'available' },
    { id: '12', category: 'Purchases & Expenses', name: 'Purchase Summary', description: 'Overall purchase analysis', type: 'summary', filters: ['date', 'vendor'], status: 'available' },
    { id: '13', category: 'Purchases & Expenses', name: 'Purchases by Vendor', description: 'Vendor-wise purchase tracking', type: 'table', filters: ['date', 'vendor'], status: 'available' },
    { id: '14', category: 'Purchases & Expenses', name: 'Purchases by Product', description: 'Product procurement analysis', type: 'table', filters: ['date', 'product', 'category'], status: 'available' },
    { id: '15', category: 'Purchases & Expenses', name: 'Expense Report', description: 'Operational expenses tracking', type: 'table', filters: ['date', 'expense_type'], status: 'available' },
    { id: '16', category: 'Purchases & Expenses', name: 'Vendor Payment Report', description: 'Payment status to vendors', type: 'table', filters: ['date', 'vendor', 'status'], status: 'available' },
    { id: '17', category: 'Purchases & Expenses', name: 'Outstanding Vendor Bills', description: 'Unpaid vendor invoices', type: 'table', filters: ['vendor', 'overdue'], status: 'available' },
    { id: '18', category: 'Inventory', name: 'Stock Summary', description: 'Current inventory levels', type: 'table', filters: ['category', 'status'], status: 'available' },
    { id: '19', category: 'Inventory', name: 'Stock Valuation Report', description: 'Inventory value analysis', type: 'summary', filters: ['date', 'category'], status: 'available' },
    { id: '20', category: 'Inventory', name: 'Low Stock Report', description: 'Items below minimum threshold', type: 'table', filters: ['threshold', 'category'], status: 'available' },
    { id: '21', category: 'Inventory', name: 'Expired/Expiring Items', description: 'Product expiration tracking', type: 'table', filters: ['expiry_range', 'category'], status: 'available' },
    { id: '22', category: 'Inventory', name: 'Inventory Adjustment Report', description: 'Stock adjustment history', type: 'table', filters: ['date', 'reason'], status: 'available' },
    { id: '23', category: 'Inventory', name: 'Stock Movement', description: 'In/Out stock transactions', type: 'table', filters: ['date', 'movement_type'], status: 'available' },
    { id: '24', category: 'Tax Reports', name: 'Tax Summary', description: 'Overall tax collection summary', type: 'summary', filters: ['date', 'tax_type'], status: 'available' },
    { id: '25', category: 'Tax Reports', name: 'Tax Liability Report', description: 'Outstanding tax obligations', type: 'table', filters: ['date', 'tax_type'], status: 'available' },
    { id: '26', category: 'Tax Reports', name: 'Tax Paid Report', description: 'Tax payment history', type: 'table', filters: ['date', 'payment_method'], status: 'available' }
  ];

  // Get current report
  const currentReport = reportTypes.find(r => r.id === reportId);

  // Generate comprehensive sample data with more variety
  const generateReportData = (report: ReportType) => {
    const baseData = [];

    // Define columns based on report type and filters
    let columns = ['ID'];
    if (report.filters.includes('date')) columns.push('Date');
    if (report.filters.includes('customer')) columns.push('Customer');
    if (report.filters.includes('product')) columns.push('Product');
    if (report.filters.includes('category')) columns.push('Category');
    if (report.filters.includes('employee') || report.filters.includes('cashier')) columns.push('Employee');
    if (report.filters.includes('payment')) columns.push('Payment');
    if (report.filters.includes('status')) columns.push('Status');
    if (report.filters.includes('vendor')) columns.push('Vendor');
    if (report.filters.includes('branch')) columns.push('Branch');
    columns.push('Amount');
    
    return {
      columns,
      data: baseData.map(row => {
        const filteredRow: any = { ID: row.id };
        report.filters.forEach(filter => {
          switch(filter) {
            case 'date': filteredRow.Date = row.date; break;
            case 'customer': filteredRow.Customer = row.customer; break;
            case 'product': filteredRow.Product = row.product; break;
            case 'category': filteredRow.Category = row.category; break;
            case 'employee':
            case 'cashier': filteredRow.Employee = row.employee; break;
            case 'payment': filteredRow.Payment = row.payment; break;
            case 'status': filteredRow.Status = row.status; break;
            case 'vendor': filteredRow.Vendor = row.vendor; break;
            case 'branch': filteredRow.Branch = row.branch; break;
          }
        });
        filteredRow.Amount = `$${row.amount}`;
        return filteredRow;
      })
    };
  };

  const reportData = currentReport ? generateReportData(currentReport) : { columns: [], data: [] };

  // Filter data based on applied filters
  const filteredData = useMemo(() => {
    if (!reportData.data) return [];
    
    return reportData.data.filter(row => {
      // Date filter
      if (row.Date) {
        const rowDate = new Date(row.Date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        if (rowDate < startDate || rowDate > endDate) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }
      
      // Product filter
      if (selectedProduct !== 'all' && row.Product && row.Product !== selectedProduct) return false;
      
      // Category filter
      if (selectedCategory !== 'all' && row.Category && row.Category !== selectedCategory) return false;
      
      // Employee filter
      if (selectedEmployee !== 'all' && row.Employee && row.Employee !== selectedEmployee) return false;
      
      // Payment method filter
      if (selectedPaymentMethod !== 'all' && row.Payment && row.Payment !== selectedPaymentMethod) return false;
      
      // Status filter
      if (selectedStatus !== 'all' && row.Status && row.Status !== selectedStatus) return false;
      
      return true;
    });
  }, [reportData.data, dateRange, searchTerm, selectedProduct, selectedCategory, selectedEmployee, selectedPaymentMethod, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, row) => {
      const amount = parseFloat(row.Amount?.replace('$', '') || '0');
      return sum + amount;
    }, 0);
    
    const averageAmount = filteredData.length > 0 ? totalAmount / filteredData.length : 0;
    
    return {
      totalRecords: filteredData.length,
      totalAmount,
      averageAmount
    };
  }, [filteredData]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table': return <FileSpreadsheet className="h-5 w-5" />;
      case 'chart': return <BarChart3 className="h-5 w-5" />;
      case 'summary': return <FileBarChart className="h-5 w-5" />;
      default: return <FileDown className="h-5 w-5" />;
    }
  };

  const handleExportPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(currentReport.name, 14, 22);
    
    // Add date and summary
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Category: ${currentReport.category}`, 14, 40);
    doc.text(`Total Records: ${summary.totalRecords}`, 14, 48);
    doc.text(`Total Amount: $${summary.totalAmount.toFixed(2)}`, 14, 56);
    
    // Prepare table data
    const tableData = filteredData.map(row => 
      reportData.columns.map(col => row[col] || '')
    );
    
    // Add table
    autoTable(doc, {
      head: [reportData.columns],
      body: tableData,
      startY: 65,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });
    
    const filename = `${currentReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast({
      title: "PDF Export",
      description: `Report exported to ${filename}`,
    });
  };

  const handleExportExcel = () => {
    if (!currentReport) return;
    
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
    
    const filename = `${currentReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Excel Export",
      description: `Report exported to ${filename}`,
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProduct("all");
    setSelectedCategory("all");
    setSelectedEmployee("all");
    setSelectedPaymentMethod("all");
    setSelectedStatus("all");
    setDateRange({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setCurrentPage(1);
  };

  if (!currentReport) {
    return (
      <div className="p-6 space-y-6 animate-fadeInUp">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Report Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested report could not be found.</p>
          <Button onClick={() => navigate('/sales-report')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/sales-report')}
            className="transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="p-2 bg-primary/10 rounded-lg">
            {getTypeIcon(currentReport.type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentReport.name}</h1>
            <p className="text-muted-foreground">{currentReport.description} • {currentReport.category}</p>
          </div>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileBarChart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{summary.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${summary.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Average Amount</p>
                <p className="text-2xl font-bold">${summary.averageAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{paginatedData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <span className="text-foreground font-medium">Export report</span>
        <div className="flex space-x-2">
        <Button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white gap-2"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </Button>
        <Button
          onClick={handleExportExcel}
          className="bg-green-500 hover:bg-green-600 text-white gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </CardTitle>
            <Button variant="outline" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            {/* Date Range */}
            <div className="space-y-2 lg:col-span-1">
              <Label className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-foreground dark:text-white" />
                Start Date
              </Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 lg:col-span-1">
              <Label className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-foreground dark:text-white" />
                End Date
              </Label>
              <Input
                type="date"
                className="min-w-[220px]"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>

            {/* Dynamic filters based on report type */}
            {currentReport.filters.includes('product') && (
              <div className="space-y-2 lg:col-span-1">
                <Label className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-foreground dark:text-white" />
                  Product
                </Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="min-w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="Premium Espresso Blend">Premium Espresso Blend</SelectItem>
                    <SelectItem value="Organic Green Tea">Organic Green Tea</SelectItem>
                    <SelectItem value="Gourmet Chocolate Cake">Gourmet Chocolate Cake</SelectItem>
                    <SelectItem value="Vintage Wine Selection">Vintage Wine Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentReport.filters.includes('category') && (
              <div className="space-y-2 lg:col-span-1">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="min-w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Computers">Computers</SelectItem>
                    <SelectItem value="Coffee">Coffee</SelectItem>
                    <SelectItem value="Tea">Tea</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(currentReport.filters.includes('employee') || currentReport.filters.includes('cashier')) && (
              <div className="space-y-2 lg:col-span-1">
                <Label className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-foreground dark:text-white" />
                  Employee
                </Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                    <SelectItem value="Bob Smith">Bob Smith</SelectItem>
                    <SelectItem value="Carol Wilson">Carol Wilson</SelectItem>
                    <SelectItem value="David Brown">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentReport.filters.includes('payment') && (
              <div className="space-y-2 lg:col-span-1">
                <Label>Payment Method</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentReport.filters.includes('status') && (
              <div className="space-y-2 lg:col-span-1">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mt-4">
            <Label>Search in Results</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search through report data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Report Data ({filteredData.length} records)</span>
            <Badge variant="outline" className="rounded-full">
              Page {currentPage} of {totalPages}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  {reportData.columns.map((column) => (
                    <TableHead key={column} className="text-primary-foreground font-semibold">{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 animate-fadeInUp" style={{ animationDelay: `${index * 0.02}s` }}>
                    {reportData.columns.map((column) => (
                      <TableCell key={column} className="text-foreground">
                        {column === 'Status' && row[column] ? (
                          <Badge 
                            variant={row[column] === 'Completed' ? 'default' : row[column] === 'Pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {row[column]}
                          </Badge>
                        ) : (
                          row[column]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={reportData.columns.length} className="text-center py-8 text-muted-foreground">
                      No data available for this report. Add business transactions to generate report data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredData.length === 0 && paginatedData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data found matching your filters.</p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportView;