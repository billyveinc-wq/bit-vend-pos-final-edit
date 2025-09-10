import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  QrCode,
  Printer,
  Download,
  Package,
  Search
} from 'lucide-react';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';

// Minimal Code39 renderer (same as Product Add)
const CODE39_MAP: Record<string, string> = {
  '0':'nnnwwnwnw','1':'wnnwnnnnw','2':'nnwwnnnnw','3':'wnwwnnnnn','4':'nnnwwnnnw','5':'wnnwwnnnn','6':'nnwwwnnnn','7':'nnnwnnwnw','8':'wnnwnnwnn','9':'nnwwnnwnn',
  'A':'wnnnnwnnw','B':'nnwnnwnnw','C':'wnwnnwnnn','D':'nnnnwwnnw','E':'wnnnwwnnn','F':'nnwnwwnnn','G':'nnnnnwwnw','H':'wnnnnwwnn','I':'nnwnnwwnn','J':'nnnnwwwnn',
  'K':'wnnnnnnww','L':'nnwnnnnww','M':'wnwnnnnwn','N':'nnnnwnnww','O':'wnnnwnnwn','P':'nnwnwnnwn','Q':'nnnnnnwww','R':'wnnnnnwwn','S':'nnwnnnwwn','T':'nnnnwnwwn',
  'U':'wwnnnnnnw','V':'nwwnnnnnw','W':'wwwnnnnnn','X':'nwnnwnnnw','Y':'wwnnwnnnn','Z':'nwwnwnnnn','-':'nwnnnnwnw','.':'wwnnnnwnn',' ':'nwwnnnwnn',
  '$':'nwnwnwnnn','/':'nwnwnnnwn','+':'nwnnnwnwn','%':'nnnwnwnwn','*':'nwnnwnwnn'
};

const Code39Barcode: React.FC<{ value: string; height?: number; unit?: number; className?: string }> = ({ value, height = 64, unit = 2, className }) => {
  const text = `*${(value || '').toUpperCase().replace(/[^0-9A-Z\-\. \$/\+%]/g, '-') }*`;
  let totalUnits = 0;
  const seq: { isBar: boolean; w: number }[] = [];
  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci];
    const pat = CODE39_MAP[ch];
    if (!pat) continue;
    for (let i = 0; i < pat.length; i++) {
      const isBar = i % 2 === 0;
      const w = pat[i] === 'w' ? 3 : 1;
      seq.push({ isBar, w });
      totalUnits += w;
    }
    seq.push({ isBar: false, w: 1 });
    totalUnits += 1;
  }
  const width = totalUnits * unit;
  let x = 0;
  return (
    <div className={className}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Barcode ${value}`}>
        {seq.map((seg, idx) => {
          const segWidth = seg.w * unit;
          const rect = seg.isBar ? (
            <rect key={idx} x={x} y={0} width={segWidth} height={height} fill="currentColor" />
          ) : null;
          x += segWidth;
          return rect;
        })}
      </svg>
      <div className="text-center text-xs font-mono mt-2 text-muted-foreground">{value}</div>
    </div>
  );
};

const Barcode = () => {
  const { products, updateProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [printQuantity, setPrintQuantity] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct);

  const handlePrintBarcode = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    
    // Simulate printing process
    setTimeout(() => {
      toast.success(`Successfully printed ${printQuantity} barcode(s) for ${selectedProductData?.name}`);
    }, 1000);
    toast.info(`Sending ${printQuantity} barcode(s) to printer...`);
  };

  const handleDownloadBarcode = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    
    // Create a simple barcode file download simulation
    const element = document.createElement('a');
    const file = new Blob([`Barcode for ${selectedProductData?.name}\nSKU: ${selectedProductData?.sku}\nBarcode: ${selectedProductData?.barcode || 'Generated'}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `barcode-${selectedProductData?.sku || selectedProductData?.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`Barcode downloaded for ${selectedProductData?.name}`);
  };

  const generateBarcode = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    const randomBarcode = `BC-${Math.random().toString().substr(2, 10)}`;
    const idNum = Number(selectedProduct);
    if (!Number.isFinite(idNum)) { toast.error('Invalid product'); return; }
    updateProduct(idNum, { barcode: randomBarcode });
    toast.success(`Assigned barcode: ${randomBarcode}`);
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Barcode Management</h1>
          <p className="text-muted-foreground">Generate and print barcodes for your products</p>
        </div>
        <Button className="gap-2" onClick={generateBarcode}>
          <QrCode size={16} />
          Generate Random Barcode
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barcode Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode size={20} />
              Barcode Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Search */}
            <div>
              <Label htmlFor="productSearch">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="productSearch"
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <Label htmlFor="product">Select Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.sku || 'No SKU'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barcode Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcodeType">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128</SelectItem>
                    <SelectItem value="CODE39">CODE39</SelectItem>
                    <SelectItem value="EAN13">EAN13</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Print Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handlePrintBarcode} className="flex-1 gap-2">
                <Printer size={16} />
                Print Barcode
              </Button>
              <Button variant="outline" onClick={handleDownloadBarcode} className="flex-1 gap-2">
                <Download size={16} />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Barcode Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Barcode Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProductData ? (
              <div className="text-center space-y-4">
                <div className="p-8 bg-white border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-16 bg-black/10 flex items-center justify-center text-xs text-muted-foreground">
                      Barcode Preview
                    </div>
                    <p className="text-sm font-mono">{selectedProductData.barcode || selectedProductData.sku || 'No barcode'}</p>
                  </div>
                </div>
                <div className="text-left space-y-1">
                  <p className="font-medium">{selectedProductData.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProductData.sku || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Price: ${selectedProductData.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Type: {barcodeType}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a product to preview barcode</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Products Available for Barcode Generation ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
              <p className="text-sm">Add products to generate barcodes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(product.id.toString())}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Barcode: {product.barcode || 'Not set'}</p>
                      <p className="text-sm font-semibold text-green-600">${product.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Barcode;
