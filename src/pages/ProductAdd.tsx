import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, RotateCcw, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { useProducts } from '@/contexts/ProductContext';

const categories = ["Electronics", "Beverages", "Food", "Clothing", "Books", "Health"];
const brands = ["Apple", "Samsung", "Nike", "Adidas", "Generic"];
const suppliers = ["Supplier A", "Supplier B", "Supplier C"];
const units = ["Piece", "Kg", "Liter", "Meter", "Box"];
const productTypes = ["Standard", "Variable", "Service"];
const statusOptions = ["Active", "Inactive", "Draft"];

const ProductAdd = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('general');
  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    // General
    name: '',
    category: '',
    addedBy: 'Admin',
    warranty: '',
    productType: 'Standard',
    sku: '',
    barcode: '',
    brand: '',
    supplier: '',
    batchLotNo: '',
    multipleBarcodes: '',
    image: null as File | null,
    
    // Pricing
    purchasePrice: '',
    sellingPrice: '',
    discount: '',
    discountType: '%',
    tax: '',
    profitMargin: '',
    taxable: true,
    
    // Inventory
    unit: 'Piece',
    stockQuantity: '',
    minStockAlert: '',
    reorderPoint: '',
    advancedInventory: false,
    
    // Extras
    description: '',
    featuredProduct: false,
    status: 'Active',
    tags: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const tabs = [
    { id: 'general', label: 'General', step: 1 },
    { id: 'pricing', label: 'Pricing', step: 2 },
    { id: 'inventory', label: 'Inventory', step: 3 },
    { id: 'extras', label: 'Extras', step: 4 },
  ];

  const currentStep = tabs.find(tab => tab.id === activeTab)?.step || 1;
  const progress = (currentStep / 4) * 100;

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const generateSKU = () => {
    const randomSKU = `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setFormData(prev => ({ ...prev, sku: randomSKU }));
  };

  const generateBarcode = () => {
    const randomBarcode = `BC-${Math.random().toString().substr(2, 10)}`;
    setFormData(prev => ({ ...prev, barcode: randomBarcode }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.category || !formData.sku) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Create product using context
    try {
      const productId = addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.sellingPrice) || 0,
        category: formData.category,
        sku: formData.sku,
        barcode: formData.barcode,
        stock: parseInt(formData.stockQuantity) || 0,
        minStock: parseInt(formData.minStockAlert) || 0,
        brand: formData.brand,
        supplier: formData.supplier,
        status: formData.status as 'active' | 'inactive' | 'draft'
      });
      
      toast.success("Product added successfully!");
      navigate('/products');
    } catch (error) {
      toast.error("Error adding product. Please try again.");
      console.error('Error adding product:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleReset = () => {
    setFormData({
      name: '', category: '', addedBy: 'Admin', warranty: '', productType: 'Standard',
      sku: '', barcode: '', brand: '', supplier: '', batchLotNo: '', multipleBarcodes: '',
      image: null, purchasePrice: '', sellingPrice: '', discount: '', discountType: '%', tax: '',
      profitMargin: '', taxable: true, unit: 'Piece', stockQuantity: '', minStockAlert: '',
      reorderPoint: '', advancedInventory: false, description: '', featuredProduct: false,
      status: 'Active', tags: '',
    });
    setImagePreview(null);
    setCreatedDate(new Date());
    setExpiryDate(undefined);
    setActiveTab('general');
  };

  // Calculate profit margin when pricing changes
  const calculateProfitMargin = (purchasePrice: string, sellingPrice: string) => {
    const purchase = parseFloat(purchasePrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    if (purchase > 0 && selling > 0) {
      const margin = ((selling - purchase) / selling * 100).toFixed(2);
      setFormData(prev => ({ ...prev, profitMargin: margin }));
    }
  };

  // Update profit margin when prices change
  React.useEffect(() => {
    calculateProfitMargin(formData.purchasePrice, formData.sellingPrice);
  }, [formData.purchasePrice, formData.sellingPrice]);

  return (
    <div className="space-y-6 p-6 bg-background dark:bg-settings-form min-h-screen animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between animate-slideInLeft">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">+</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          All fields marked * are required
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-between text-sm">
          <span className="text-foreground">Step {currentStep} of 4</span>
          <span className="text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <Card className="bg-card dark:bg-settings-form shadow-lg border border-border animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-12 bg-muted/50 rounded-none border-b animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex-1 h-10 text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-success to-success/80 text-success-foreground shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="p-6 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Apple iPhone 15"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                  <Label htmlFor="addedBy">Added By</Label>
                  <Select value={formData.addedBy} onValueChange={(value) => handleInputChange('addedBy', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                  <Label>Created Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal dark:bg-settings-form dark:text-white",
                          !createdDate && "text-muted-foreground"
                        )}
                        >
                          <Calendar className="mr-2 h-4 w-4 text-foreground dark:text-white" />
                          {createdDate ? format(createdDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark:bg-settings-form" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={createdDate}
                        onSelect={setCreatedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                  <Label htmlFor="warranty">Warranty (months)</Label>
                  <Input
                    id="warranty"
                    type="number"
                    placeholder="e.g. 12"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.1s' }}>
                  <Label htmlFor="sku">SKU / Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      placeholder="SKU-XXXXX"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="dark:bg-settings-form dark:text-white"
                    />
                    <Button type="button" variant="outline" onClick={generateSKU} className="dark:bg-settings-form dark:text-white">
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Click generate to create a unique SKU</p>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      placeholder="e.g. BC-20250829-1234"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="dark:bg-settings-form dark:text-white"
                    />
                    <Button type="button" variant="outline" onClick={generateBarcode} className="dark:bg-settings-form dark:text-white">
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Barcode auto-renders below when generated or typed</p>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.3s' }}>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Brand name"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.5s' }}>
                  <Label htmlFor="batchLotNo">Batch / Lot No.</Label>
                  <Input
                    id="batchLotNo"
                    placeholder="Batch or lot number"
                    value={formData.batchLotNo}
                    onChange={(e) => handleInputChange('batchLotNo', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.6s' }}>
                  <Label>Barcode Preview</Label>
                  <div className="h-10 bg-gray-100 dark:bg-settings-form rounded border flex items-center justify-center text-xs text-muted-foreground">
                    {formData.barcode || 'Generate barcode to preview'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.7s' }}>
                  <Label>Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal dark:bg-settings-form dark:text-white",
                          !expiryDate && "text-muted-foreground"
                        )}
                        >
                          <Calendar className="mr-2 h-4 w-4 text-foreground dark:text-white" />
                          {expiryDate ? format(expiryDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark:bg-settings-form" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.8s' }}>
                  <Label htmlFor="multipleBarcodes">Multiple Barcodes</Label>
                  <Input
                    id="multipleBarcodes"
                    placeholder="Comma-separated (optional)"
                    value={formData.multipleBarcodes}
                    onChange={(e) => handleInputChange('multipleBarcodes', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
              </div>

            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="p-6 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                  <Label htmlFor="discount">Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="number"
                      placeholder="0"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      className="dark:bg-settings-form dark:text-white"
                    />
                    <Select value={formData.discountType} onValueChange={(value) => handleInputChange('discountType', value)}>
                      <SelectTrigger className="w-20 dark:bg-settings-form dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-settings-form">
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    placeholder="0"
                    value={formData.tax}
                    onChange={(e) => handleInputChange('tax', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                  <Label htmlFor="profitMargin">Profit Margin</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.profitMargin}
                    onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-2 animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
                  <Switch
                    checked={formData.taxable}
                    onCheckedChange={(checked) => handleInputChange('taxable', checked)}
                  />
                  <Label>Taxable</Label>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="p-6 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                  <Label htmlFor="minStockAlert">Min Stock Alert</Label>
                  <Input
                    id="minStockAlert"
                    type="number"
                    placeholder="0"
                    value={formData.minStockAlert}
                    onChange={(e) => handleInputChange('minStockAlert', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    placeholder="0"
                    value={formData.reorderPoint}
                    onChange={(e) => handleInputChange('reorderPoint', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-settings-form rounded animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                <div>
                  <h3 className="font-medium">Advanced Inventory Settings</h3>
                  <p className="text-sm text-muted-foreground">Track serial numbers? lot/expiry? batch-level stock?</p>
                </div>
                <Switch
                  checked={formData.advancedInventory}
                  onCheckedChange={(checked) => handleInputChange('advancedInventory', checked)}
                />
              </div>
            </TabsContent>

            {/* Extras Tab */}
            <TabsContent value="extras" className="p-6 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById('extras-image-upload')?.click()}
                    >
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="mx-auto max-h-32 rounded object-contain"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('extras-image-upload')?.click();
                              }}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Change Image
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                              }}
                              className="text-red-600 hover:text-red-700 gap-2"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">Upload image</p>
                          <p className="text-xs text-muted-foreground">PNG/JPG, recommended 800×800</p>
                        </>
                      )}
                    </div>
                    <input
                      id="extras-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                    <Switch
                      checked={formData.featuredProduct}
                      onCheckedChange={(checked) => handleInputChange('featuredProduct', checked)}
                    />
                    <Label>Featured Product</Label>
                  </div>
                </div>

                <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.6s' }}>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Long product description, ingredients, usage instructions..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={8}
                      className="dark:bg-settings-form dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="dark:bg-settings-form dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-settings-form">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="comma, separated, tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="dark:bg-settings-form dark:text-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 p-6 border-t dark:border-gray-600 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="gap-2 transition-all duration-200 dark:bg-settings-form dark:text-white hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="gap-2 transition-all duration-200 border-cancel text-cancel hover:bg-cancel/10 dark:border-cancel dark:text-cancel dark:hover:bg-cancel/10 hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-save hover:bg-save-hover text-save-foreground gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Save className="h-4 w-4" />
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAdd;