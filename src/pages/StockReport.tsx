import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSEO } from '@/lib/seo';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Row { id: string; name: string; sku?: string; stock: number; status: string; }

const StockReport: React.FC = () => {
  useSEO('Stock Report | Bit Vend POS', 'View stock levels and item availability across inventory.', '/stock-report');

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, stock_quantity, is_active')
          .order('name', { ascending: true });
        if (error) throw error;
        const mapped: Row[] = (data || []).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          sku: p.sku || '',
          stock: Number(p.stock_quantity || 0),
          status: p.stock_quantity <= 0 ? 'out of stock' : p.stock_quantity <= 10 ? 'low' : (p.is_active === false ? 'inactive' : 'active')
        }));
        setRows(mapped);
      } catch (e) {
        console.warn('Failed to load stock report');
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || (r.sku || '').toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

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
          <Input placeholder="Search by name or SKU" value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9 transition-all duration-200 focus:scale-105" />
        </div>
      </header>

      <main>
        <Card className="animate-slideInLeft">
          <CardHeader>
            <CardTitle>Items ({filtered.length})</CardTitle>
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
                  {filtered.map((row, index) => (
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
