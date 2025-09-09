import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSEO } from '@/lib/seo';
import { Search } from 'lucide-react';

const mock = [];

const StockReport: React.FC = () => {
  useSEO('Stock Report | Bit Vend POS', 'View stock levels and item availability across inventory.', '/stock-report');

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive current inventory levels overview</p>
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or SKU" className="pl-9 transition-all duration-200 focus:scale-105" />
        </div>
      </header>

      <main>
        <Card className="animate-slideInLeft">
          <CardHeader>
            <CardTitle>Items ({mock.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500">
                    <TableHead className="text-white font-semibold">Product</TableHead>
                    <TableHead className="text-white font-semibold">SKU</TableHead>
                    <TableHead className="text-white font-semibold">Stock</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mock.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      className="hover:shadow-md transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-sm">{row.sku}</TableCell>
                      <TableCell>{row.stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {row.status}
                        </Badge>
                      </TableCell>
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

export default StockReport;
