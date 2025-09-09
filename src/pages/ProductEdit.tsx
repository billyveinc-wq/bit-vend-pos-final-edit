import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Package, X, Camera, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock product data (same as ProductView)
const productData = [
  {
    id: 1,
    name: "Premium Espresso Blend",
    description: "Artisanal dark roast coffee beans sourced from the finest Colombian highlands. Perfect for espresso machines and moka pots.",
    price: 24.99,
    category: "Coffee",
    stock: 150,
    sku: "ESP-001",
    status: "Active",
    supplier: "Colombian Coffee Co.",
    dateAdded: "2024-01-15",
    lastUpdated: "2024-02-20",
    weight: "500g",
    dimensions: "12cm x 8cm x 4cm",
    barcode: "1234567890123",
    image: "/lovable-uploads/coffee-blend.jpg"
  },
  {
    id: 2,
    name: "Organic Green Tea",
    description: "Hand-picked organic green tea leaves from certified organic farms in Japan. Rich in antioxidants.",
    price: 18.50,
    category: "Tea",
    stock: 75,
    sku: "TEA-002",
    status: "Active",
    supplier: "Japanese Tea Gardens",
    dateAdded: "2024-01-10",
    lastUpdated: "2024-02-18",
    weight: "250g",
    dimensions: "10cm x 10cm x 5cm",
    barcode: "1234567890124",
    image: "/lovable-uploads/green-tea.jpg"
  },
  {
    id: 3,
    name: "Gourmet Chocolate Cake",
    description: "Decadent chocolate cake made with premium Belgian chocolate and fresh cream. Perfect for special occasions.",
    price: 45.00,
    category: "Dessert",
    stock: 25,
    sku: "CAK-003",
    status: "Active",
    supplier: "Sweet Delights Bakery",
    dateAdded: "2024-01-20",
    lastUpdated: "2024-02-25",
    weight: "1.2kg",
    dimensions: "25cm x 25cm x 8cm",
    barcode: "1234567890125",
    image: "/lovable-uploads/chocolate-cake.jpg"
  },
  {
    id: 4,
    name: "Vintage Wine Selection",
    description: "Carefully curated selection of vintage wines from renowned vineyards. Aged to perfection.",
    price: 89.99,
    category: "Beverages",
    stock: 12,
    sku: "WIN-004",
    status: "Active",
    supplier: "Premium Wine Collections",
    dateAdded: "2024-01-05",
    lastUpdated: "2024-02-15",
    weight: "750ml",
    dimensions: "8cm x 8cm x 30cm",
    barcode: "1234567890126",
    image: "/lovable-uploads/vintage-wine.jpg"
  },
  {
    id: 5,
    name: "Artisan Croissant",
    description: "Freshly baked croissants with layers of buttery goodness. Made using traditional French techniques.",
    price: 12.99,
    category: "Pastry",
    stock: 0,
    sku: "CRO-005",
    status: "Out of Stock",
    supplier: "French Bakery Co.",
    dateAdded: "2024-01-25",
    lastUpdated: "2024-02-28",
    weight: "85g each",
    dimensions: "12cm x 6cm x 4cm",
    barcode: "1234567890127",
    image: "/lovable-uploads/croissant.jpg"
  },
  {
    id: 6,
    name: "Truffle Collection",
    description: "Hand-crafted luxury truffles made with the finest ingredients. A perfect gift for chocolate lovers.",
    price: 65.00,
    category: "Confectionery",
    stock: 8,
    sku: "TRU-006",
    status: "Low Stock",
    supplier: "Artisan Chocolatiers",
    dateAdded: "2024-01-12",
    lastUpdated: "2024-02-22",
    weight: "300g",
    dimensions: "15cm x 15cm x 3cm",
    barcode: "1234567890128",
    image: "/lovable-uploads/truffle-collection.jpg"
  }
];

const categories = ["Coffee", "Tea", "Dessert", "Beverages", "Pastry", "Confectionery"];
const suppliers = [
  "Colombian Coffee Co.",
  "Japanese Tea Gardens", 
  "Sweet Delights Bakery",
  "Premium Wine Collections",
  "French Bakery Co.",
  "Artisan Chocolatiers"
];

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const productId = parseInt(id || '1');
  
  const originalProduct = useMemo(() => {
    return productData.find(p => p.id === productId) || productData[0];
  }, [productId]);

  const [formData, setFormData] = useState({
    name: originalProduct.name,
    description: originalProduct.description,
    buyingPrice: (originalProduct.price * 0.7).toFixed(2), // Assume 30% markup
    sellingPrice: originalProduct.price.toString(),
    category: originalProduct.category,
    stock: originalProduct.stock.toString(),
    sku: originalProduct.sku,
    supplier: originalProduct.supplier,
    weight: originalProduct.weight,
    dimensions: originalProduct.dimensions,
    barcode: originalProduct.barcode,
    image: originalProduct.image || ''
  });

  const [isModified, setIsModified] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    // Here you would typically send the data to your API
    console.log('Saving product:', formData);
    
    toast({
      title: "Product Updated",
      description: `${formData.name} has been successfully updated.`,
    });
    
    setIsModified(false);
    
    // Navigate back to products or view page
    navigate(`/products/view/${productId}`);
  };

  const handleCancel = () => {
    if (isModified) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/products');
  };

  const handleGoBack = () => {
    if (isModified) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate(`/products/view/${productId}`);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = () => {
    if (imagePreview) {
      // Update the form data with the preview image for immediate display
      handleInputChange('image', imagePreview);
      
      toast({
        title: "Image Preview Updated",
        description: "Product image preview updated. Remember to save your changes.",
      });
    }
    setIsImageDialogOpen(false);
    setImagePreview(null);
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
            Back to View
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground mt-1">Modify product information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isModified && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            variant="outline"
            onClick={handleCancel}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-save hover:bg-save-hover text-save-foreground gap-2"
            disabled={!isModified}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt={formData.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{formData.image ? 'Current Image' : 'No Image'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.image ? 'Click "Edit Image" to change' : 'Upload a product image to improve visibility'}
                  </p>
                  <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2 gap-2">
                        <Upload className="h-4 w-4" />
                        Edit Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Product Image</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : formData.image ? (
                              <img 
                                src={formData.image} 
                                alt="Current"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Camera className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <div className="w-full">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline"
                            className="bg-cancel hover:bg-cancel-hover text-cancel-foreground"
                            onClick={() => {
                              setIsImageDialogOpen(false);
                              setImagePreview(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleImageSave}
                            disabled={!imagePreview}
                            className="bg-save hover:bg-save-hover text-save-foreground"
                          >
                            Save Image
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Enter SKU"
                      className="mt-1 font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Enter barcode"
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="buyingPrice">Buying Price *</Label>
                    <Input
                      id="buyingPrice"
                      type="number"
                      step="0.01"
                      value={formData.buyingPrice}
                      onChange={(e) => handleInputChange('buyingPrice', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select 
                      value={formData.supplier} 
                      onValueChange={(value) => handleInputChange('supplier', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="e.g., 500g"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="e.g., 12cm x 8cm x 4cm"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${parseFloat(formData.sellingPrice || '0').toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  ${parseFloat(formData.buyingPrice || '0').toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Buying Price</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {parseInt(formData.stock || '0')} units
                </div>
                <div className="text-sm text-muted-foreground">Stock Quantity</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold">
                  ${((parseFloat(formData.sellingPrice || '0') - parseFloat(formData.buyingPrice || '0')) * parseInt(formData.stock || '0')).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Profit Potential</div>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card className="dark:bg-[#1c1c1c]">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSave}
                className="w-full bg-save hover:bg-save-hover text-save-foreground gap-2"
                disabled={!isModified}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 bg-cancel hover:bg-cancel-hover text-cancel-foreground"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full gap-2"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to View
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;