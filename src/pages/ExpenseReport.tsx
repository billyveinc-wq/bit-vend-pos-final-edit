import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useSEO } from '@/lib/seo';
import { Search } from 'lucide-react';

const data = [];

const ExpenseReport: React.FC = () => {
  useSEO('Expense Report | Bit Vend POS', 'Track expenses by category and date.', '/expense-report');

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive operational expenses overview</p>
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search expenses" className="pl-9 transition-all duration-200 focus:scale-105" />
        </div>
      </header>

      <main>
        <Card className="animate-slideInLeft">
          <CardHeader>
            <CardTitle>Expenses ({data.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500">
                    <TableHead className="text-white font-semibold">Date</TableHead>
                    <TableHead className="text-white font-semibold">Category</TableHead>
                    <TableHead className="text-white font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      className="hover:shadow-md transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>${row.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExpenseReport;
