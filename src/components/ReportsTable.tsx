import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileBarChart,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Archive
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

const ReportsTable: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const reportTypes: ReportType[] = [
    // Business Overview
    { id: '1', category: 'Business Overview', name: 'Summary Report', description: 'Overall business performance summary', type: 'summary', filters: ['date', 'branch'], status: 'available' },
    { id: '2', category: 'Business Overview', name: 'Quarters Report', description: 'Quarterly performance analysis', type: 'chart', filters: ['year', 'quarter'], status: 'available' },
    { id: '3', category: 'Business Overview', name: 'Profit by Product Report', description: 'Product profitability analysis', type: 'table', filters: ['date', 'category'], status: 'available' },
    { id: '4', category: 'Business Overview', name: 'Profit & Loss', description: 'Financial P&L statement', type: 'summary', filters: ['date', 'branch'], status: 'available' },

    // Sales Reports
    { id: '5', category: 'Sales', name: 'Sales Summary', description: 'Comprehensive sales overview', type: 'summary', filters: ['date', 'cashier', 'payment'], status: 'available' },
    { id: '6', category: 'Sales', name: 'Sales by Product', description: 'Product-wise sales analysis', type: 'table', filters: ['date', 'category', 'product'], status: 'available' },
    { id: '7', category: 'Sales', name: 'Sales by Customer', description: 'Customer purchase patterns', type: 'table', filters: ['date', 'customer'], status: 'available' },
    { id: '8', category: 'Sales', name: 'Sales by Category', description: 'Category performance report', type: 'chart', filters: ['date', 'category'], status: 'available' },
    { id: '9', category: 'Sales', name: 'Sales by Employee', description: 'Staff performance tracking', type: 'table', filters: ['date', 'employee'], status: 'available' },
    { id: '10', category: 'Sales', name: 'Daily/Weekly/Monthly Trends', description: 'Sales trend analysis', type: 'chart', filters: ['period', 'comparison'], status: 'available' },
    { id: '11', category: 'Sales', name: 'Sales Returns Report', description: 'Returns and refunds tracking', type: 'table', filters: ['date', 'reason'], status: 'available' },

    // Purchases & Expenses
    { id: '12', category: 'Purchases & Expenses', name: 'Purchase Summary', description: 'Overall purchase analysis', type: 'summary', filters: ['date', 'vendor'], status: 'available' },
    { id: '13', category: 'Purchases & Expenses', name: 'Purchases by Vendor', description: 'Vendor-wise purchase tracking', type: 'table', filters: ['date', 'vendor'], status: 'available' },
    { id: '14', category: 'Purchases & Expenses', name: 'Purchases by Product', description: 'Product procurement analysis', type: 'table', filters: ['date', 'product', 'category'], status: 'available' },
    { id: '15', category: 'Purchases & Expenses', name: 'Expense Report', description: 'Operational expenses tracking', type: 'table', filters: ['date', 'expense_type'], status: 'available' },
    { id: '16', category: 'Purchases & Expenses', name: 'Vendor Payment Report', description: 'Payment status to vendors', type: 'table', filters: ['date', 'vendor', 'status'], status: 'available' },
    { id: '17', category: 'Purchases & Expenses', name: 'Outstanding Vendor Bills', description: 'Unpaid vendor invoices', type: 'table', filters: ['vendor', 'overdue'], status: 'available' },

    // Inventory Reports
    { id: '18', category: 'Inventory', name: 'Stock Summary', description: 'Current inventory levels', type: 'table', filters: ['category', 'status'], status: 'available' },
    { id: '19', category: 'Inventory', name: 'Stock Valuation Report', description: 'Inventory value analysis', type: 'summary', filters: ['date', 'category'], status: 'available' },
    { id: '20', category: 'Inventory', name: 'Low Stock Report', description: 'Items below minimum threshold', type: 'table', filters: ['threshold', 'category'], status: 'available' },
    { id: '21', category: 'Inventory', name: 'Expired/Expiring Items', description: 'Product expiration tracking', type: 'table', filters: ['expiry_range', 'category'], status: 'available' },
    { id: '22', category: 'Inventory', name: 'Inventory Adjustment Report', description: 'Stock adjustment history', type: 'table', filters: ['date', 'reason'], status: 'available' },
    { id: '23', category: 'Inventory', name: 'Stock Movement', description: 'In/Out stock transactions', type: 'table', filters: ['date', 'movement_type'], status: 'available' },

    // Tax Reports
    { id: '24', category: 'Tax Reports', name: 'Tax Summary', description: 'Overall tax collection summary', type: 'summary', filters: ['date', 'tax_type'], status: 'available' },
    { id: '25', category: 'Tax Reports', name: 'Tax Liability Report', description: 'Outstanding tax obligations', type: 'table', filters: ['date', 'tax_type'], status: 'available' },
    { id: '26', category: 'Tax Reports', name: 'Tax Paid Report', description: 'Tax payment history', type: 'table', filters: ['date', 'payment_method'], status: 'available' }
  ];

  const categories = ["All", "Business Overview", "Sales", "Purchases & Expenses", "Inventory", "Tax Reports"];
  const types = ["All", "table", "chart", "summary"];

  // Filter reports
  const filteredReports = useMemo(() => {
    let filtered = reportTypes;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(report => report.category === selectedCategory);
    }

    if (selectedType !== "All") {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate sample data for the selected report
  const generateSampleData = (report: ReportType) => {
    const baseData = [];

    // Filter columns based on report filters
    const columns = ['ID', ...report.filters.map(filter => filter.charAt(0).toUpperCase() + filter.slice(1)), 'Amount'];
    
    return {
      columns,
      data: baseData.map(row => {
        const filteredRow: any = { ID: row.id };
        report.filters.forEach(filter => {
          switch(filter) {
            case 'date': filteredRow.Date = row.date; break;
            case 'customer': filteredRow.Customer = row.customer; break;
            case 'cashier':
            case 'employee': filteredRow.Employee = row.employee; break;
            case 'category': filteredRow.Category = row.category; break;
            case 'payment': filteredRow.Payment = 'Card'; break;
            case 'status': filteredRow.Status = row.status; break;
            case 'product': filteredRow.Product = 'Sample Product'; break;
            case 'vendor': filteredRow.Vendor = 'Sample Vendor'; break;
            case 'branch': filteredRow.Branch = 'Main Branch'; break;
            default: filteredRow[filter.charAt(0).toUpperCase() + filter.slice(1)] = 'Sample Data';
          }
        });
        filteredRow.Amount = row.amount;
        return filteredRow;
      })
    };
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/report-view/${reportId}`);
  };

  const handleGenerateReport = (reportId: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    toast({
      title: "Report Generated",
      description: `${report?.name} has been generated successfully`,
    });
  };

  const handleExportPDF = (reportId: string, reportName?: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    if (!report) return;

    const sampleData = generateSampleData(report);
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(reportName || report.name, 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Category: ${report.category}`, 14, 40);
    
    // Prepare table data
    const tableData = sampleData.data.map(row => 
      sampleData.columns.map(col => row[col] || '')
    );
    
    // Add table
    autoTable(doc, {
      head: [sampleData.columns],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });
    
    const filename = `${(reportName || report.name).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast({
      title: "PDF Export",
      description: `${reportName || report.name} exported to ${filename}`,
    });

    return { filename, content: doc.output('blob') };
  };

  const handleExportExcel = (reportId: string, reportName?: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    if (!report) return;

    const sampleData = generateSampleData(report);
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
    
    const filename = `${(reportName || report.name).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Excel Export",
      description: `${reportName || report.name} exported to ${filename}`,
    });

    return { filename, content: XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) };
  };

  const handleExportAllZIP = async () => {
    const zip = new JSZip();
    const availableReports = reportTypes.filter(r => r.status === 'available');
    
    toast({
      title: "Generating ZIP Archive",
      description: `Preparing ${availableReports.length} reports for download...`,
    });

    // Generate all reports
    for (const report of availableReports) {
      const sampleData = generateSampleData(report);
      
      // Add CSV version
      const csvContent = [
        sampleData.columns.join(','),
        ...sampleData.data.map(row => 
          sampleData.columns.map(col => `"${row[col] || ''}"`).join(',')
        )
      ].join('\n');
      
      zip.file(`${report.name.replace(/\s+/g, '_')}.csv`, csvContent);
      
      // Add PDF version
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(report.name, 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      doc.text(`Category: ${report.category}`, 14, 40);
      
      const tableData = sampleData.data.map(row => 
        sampleData.columns.map(col => row[col] || '')
      );
      
      autoTable(doc, {
        head: [sampleData.columns],
        body: tableData,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      
      zip.file(`${report.name.replace(/\s+/g, '_')}.pdf`, doc.output('blob'));
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = `all_reports_${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(zipBlob, filename);
    
    toast({
      title: "ZIP Export Complete",
      description: `All ${availableReports.length} reports downloaded as ${filename}`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table': return <FileSpreadsheet className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'summary': return <FileBarChart className="h-4 w-4" />;
      default: return <FileDown className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Available</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" />Generating</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="animate-slideInLeft mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileBarChart className="h-5 w-5 mr-2" />
              Comprehensive Reports Center
            </div>
            <Button
              onClick={handleExportAllZIP}
              className="bg-purple-500 hover:bg-purple-600 text-white gap-2 transition-all duration-200 hover:scale-95 active:scale-90"
            >
              <Archive className="h-4 w-4" />
              Export All ZIP
            </Button>
          </CardTitle>
          <CardDescription>
            Generate, view, and export detailed business reports with advanced filtering
          </CardDescription>
        </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Type:</span>
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="rounded-full capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Report Name</TableHead>
                <TableHead className="text-white font-semibold">Category</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Description</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.map((report, index) => (
                <TableRow 
                  key={report.id}
                  className="animate-fadeInUp hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Filters: {report.filters.join(', ')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {report.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <span className="capitalize">{report.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {report.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                   <TableCell>
                     <div className="flex items-center space-x-2">
                       <div className="group relative">
                         <Eye 
                           className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors" 
                           onClick={() => handleViewReport(report.id)}
                         />
                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border z-50">
                           View Report
                         </div>
                       </div>
                       <div className="group relative">
                         <FileDown 
                           className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" 
                           onClick={() => handleExportPDF(report.id)}
                         />
                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border z-50">
                           Export PDF
                         </div>
                       </div>
                       <div className="group relative">
                         <FileSpreadsheet 
                           className="h-4 w-4 text-green-500 cursor-pointer hover:text-green-600 transition-colors" 
                           onClick={() => handleExportExcel(report.id)}
                         />
                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border z-50">
                           Export Excel
                         </div>
                       </div>
                     </div>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {paginatedReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports match your search criteria</p>
            </div>
          )}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
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
      </CardContent>
    </Card>
  );
};

export default ReportsTable;