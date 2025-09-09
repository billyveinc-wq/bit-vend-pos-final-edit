import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Tag, DollarSign, Archive, Calendar, User, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock product data (same as Products page)
const productData = [
  {
    id: 1,
    name: "Premium Espresso Blend",
    description: "Artisanal dark roast coffee beans sourced from the finest Colombian highlands. Perfect for espresso machines and moka pots.",
    category: "Coffee",
    stock: 150,
    sku: "ESP-001",
    status: "Active",
    supplier: "Colombian Coffee Co.",
    dateAdded: "2024-01-15",
    lastUpdated: "2024-02-20",
    buyingPrice: 17.49,
    sellingPrice: 24.99,
    weight: "500g",
    dimensions: "12cm x 8cm x 4cm",
    barcode: "1234567890123",
    image: "/lovable-uploads/coffee-blend.jpg"
  },
  {
    id: 2,
    name: "Organic Green Tea",
    description: "Hand-picked organic green tea leaves from certified organic farms in Japan. Rich in antioxidants.",
    category: "Tea",
    stock: 75,
    sku: "TEA-002",
    status: "Active",
    supplier: "Japanese Tea Gardens",
    dateAdded: "2024-01-10",
    lastUpdated: "2024-02-18",
    buyingPrice: 12.95,
    sellingPrice: 18.50,
    weight: "250g",
    dimensions: "10cm x 10cm x 5cm",
    barcode: "1234567890124",
    image: "/lovable-uploads/green-tea.jpg"
  },
  {
    id: 3,
    name: "Gourmet Chocolate Cake",
    description: "Decadent chocolate cake made with premium Belgian chocolate and fresh cream. Perfect for special occasions.",
    category: "Dessert",
    stock: 25,
    sku: "CAK-003",
    status: "Active",
    supplier: "Sweet Delights Bakery",
    dateAdded: "2024-01-20",
    lastUpdated: "2024-02-25",
    buyingPrice: 31.50,
    sellingPrice: 45.00,
    weight: "1.2kg",
    dimensions: "25cm x 25cm x 8cm",
    barcode: "1234567890125",
    image: "/lovable-uploads/chocolate-cake.jpg"
  },
  {
    id: 4,
    name: "Vintage Wine Selection",
    description: "Carefully curated selection of vintage wines from renowned vineyards. Aged to perfection.",
    category: "Beverages",
    stock: 12,
    sku: "WIN-004",
    status: "Active",
    supplier: "Premium Wine Collections",
    dateAdded: "2024-01-05",
    lastUpdated: "2024-02-15",
    buyingPrice: 62.99,
    sellingPrice: 89.99,
    weight: "750ml",
    dimensions: "8cm x 8cm x 30cm",
    barcode: "1234567890126",
    image: "/lovable-uploads/vintage-wine.jpg"
  },
  {
    id: 5,
    name: "Artisan Croissant",
    description: "Freshly baked croissants with layers of buttery goodness. Made using traditional French techniques.",
    category: "Pastry",
    stock: 0,
    sku: "CRO-005",
    status: "Out of Stock",
    supplier: "French Bakery Co.",
    dateAdded: "2024-01-25",
    lastUpdated: "2024-02-28",
    buyingPrice: 9.09,
    sellingPrice: 12.99,
    weight: "85g each",
    dimensions: "12cm x 6cm x 4cm",
    barcode: "1234567890127",
    image: "/lovable-uploads/croissant.jpg"
  },
  {
    id: 6,
    name: "Truffle Collection",
    description: "Hand-crafted luxury truffles made with the finest ingredients. A perfect gift for chocolate lovers.",
    category: "Confectionery",
    stock: 8,
    sku: "TRU-006",
    status: "Low Stock",
    supplier: "Artisan Chocolatiers",
    dateAdded: "2024-01-12",
    lastUpdated: "2024-02-22",
    buyingPrice: 45.50,
    sellingPrice: 65.00,
    weight: "300g",
    dimensions: "15cm x 15cm x 3cm",
    barcode: "1234567890128",
    image: "/lovable-uploads/truffle-collection.jpg"
  }
];

const getStatusBadge = (status: string, stock: number) => {
  const baseClasses = "w-24 text-center justify-center text-xs px-2 py-1";
  
  if (stock === 0) {
    return <Badge variant="destructive" className={baseClasses}>Out of Stock</Badge>;
  } else if (stock <= 10) {
    return <Badge variant="secondary" className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>Low Stock</Badge>;
  } else {
    return <Badge variant="default" className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Active</Badge>;
  }
};

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = parseInt(id || '1');
  
  const product = useMemo(() => {
    return productData.find(p => p.id === productId) || productData[0];
  }, [productId]);

  const handleGoBack = () => {
    navigate('/products');
  };

  const handleEditProduct = () => {
    navigate(`/products/edit/${productId}`);
  };

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Details</h1>
            <p className="text-muted-foreground mt-1">View detailed product information</p>
          </div>
        </div>
        <Button 
          onClick={handleEditProduct}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Package className="h-4 w-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="lg:col-span-3">
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-lg border-2 border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Camera className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.image ? 'Product image available' : 'No product image'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {product.category}
                    </Badge>
                    {getStatusBadge(product.status, product.stock)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                    <p className="text-lg font-semibold mt-1">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SKU</label>
                    <p className="font-mono text-sm mt-1 bg-muted px-2 py-1 rounded inline-block">{product.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="rounded-full">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                    <p className="font-mono text-sm mt-1">{product.barcode}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Buying Price</label>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ${product.buyingPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      ${product.sellingPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Profit Margin</label>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      ${(product.sellingPrice - product.buyingPrice).toFixed(2)} ({(((product.sellingPrice - product.buyingPrice) / product.buyingPrice) * 100).toFixed(1)}%)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stock Quantity</label>
                    <p className={cn(
                      "text-lg font-semibold mt-1",
                      product.stock === 0 ? "text-red-600 dark:text-red-400" :
                      product.stock <= 10 ? "text-orange-600 dark:text-orange-400" :
                      "text-green-600 dark:text-green-400"
                    )}>
                      {product.stock} units
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(product.status, product.stock)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                    <p className="mt-1">{product.supplier}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-2 text-sm leading-relaxed">{product.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Weight:</span>
                    <span className="text-sm">{product.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Dimensions:</span>
                    <span className="text-sm">{product.dimensions}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Date Added:</span>
                    <span className="text-sm">{new Date(product.dateAdded).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                    <span className="text-sm">{new Date(product.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Revenue Potential</span>
                </div>
                <span className="font-semibold">${(product.sellingPrice * product.stock).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Stock Value</span>
                </div>
                <span className="font-semibold">${(product.buyingPrice * product.stock).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary dark:text-white" />
                  <span className="text-sm">Days in Stock</span>
                </div>
                <span className="font-semibold">
                  {Math.floor((new Date().getTime() - new Date(product.dateAdded).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleEditProduct}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                <Package className="h-4 w-4" />
                Edit Product
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductView;