import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Monitor, 
  Shield, 
  Palette, 
  Bell,
  Save,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Printer,
  Scan,
  DollarSign,
  Eye,
  EyeOff,
  Camera,
  Upload as SettingsUpload,
 FileText,
  X,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/contexts/BusinessContext';
import { countries } from '@/data/countries';
import { useSettings } from '@/hooks/useSettings';
import { showSaveToast, showUploadToast } from '@/components/SettingsToast';

const Settings = () => {
  const { businesses, currentBusiness, addBusiness, updateBusiness } = useBusiness();
  const { settings, updateSetting } = useSettings();
  const [activeSection, setActiveSection] = useState('business');
  const [activeSubsection, setActiveSubsection] = useState('business-info');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Business form state
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessType: 'retail',
    taxId: '',
    businessLicense: '',
    phone: '',
    email: '',
    logoUrl: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
  });

  // Location management state
  const [locations, setLocations] = useState([
    { id: '1', name: 'Main Store', address: '123 Main St', city: 'New York', state: 'NY', isActive: true }
  ]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    isActive: true
  });

  // Receipt settings state
  const [receiptSettings, setReceiptSettings] = useState({
    template: 'classic-receipt',
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showEmail: true,
    footerMessage: 'Thank you for your business!',
    paperSize: 'thermal-80mm',
    fontSize: 'medium'
  });

  // Terminal behavior state
  const [terminalSettings, setTerminalSettings] = useState({
    autoLock: true,
    lockTimeout: 30,
    requirePinForVoid: true,
    allowDiscounts: true,
    maxDiscountPercent: 50,
    requireManagerApproval: false,
    soundEnabled: true,
    animationsEnabled: true
  });

  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    screenTimeout: 10,
    brightness: 80,
    showCustomerDisplay: false,
    customerDisplayMessage: 'Welcome to our store!',
    showPromotions: true,
    rotatePromotions: true,
    promotionInterval: 5
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    enableLogging: true,
    logLevel: 'info',
    maintenanceMode: false,
    allowRemoteAccess: false,
    sessionTimeout: 60
  });

  // Email template state
  const [emailTemplates, setEmailTemplates] = useState({
    welcomeEmail: {
      subject: 'Welcome to {{business_name}}',
      body: 'Thank you for choosing us!'
    },
    receiptEmail: {
      subject: 'Your Receipt from {{business_name}}',
      body: 'Thank you for your purchase!'
    },
    lowStockAlert: {
      subject: 'Low Stock Alert - {{product_name}}',
      body: 'Product {{product_name}} is running low on stock.'
    }
  });

  // Hardware settings state
  const [hardwareSettings, setHardwareSettings] = useState({
    receiptPrinter: {
      enabled: true,
      printerName: 'Default Printer',
      paperWidth: 80,
      cutType: 'full',
      copies: 1
    },
    barcodeScanner: {
      enabled: true,
      scannerType: 'usb',
      autoEnter: true,
      soundEnabled: true,
      prefix: '',
      suffix: ''
    },
    cashDrawer: {
      enabled: true,
      openOnSale: true,
      openOnRefund: false,
      kickCode: '27,112,0,50,250'
    }
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    invoiceTemplate: 'modern',
    defaultTax: 8,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'en',
    notifications: {
      lowStock: true,
      newSale: false,
      dailyReport: true,
      systemUpdates: true
    },
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      darkMode: false
    }
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      expiryDays: 90
    },
    sessionManagement: {
      maxSessions: 3,
      sessionTimeout: 30,
      rememberMe: true,
      twoFactorAuth: false
    },
    auditSettings: {
      enableAuditLog: true,
      logUserActions: true,
      logSystemEvents: true,
      retentionDays: 365
    }
  });

  // Subscription state
  const [subscriptionInfo] = useState({
    currentPlan: 'starter',
    planName: 'Starter Plan',
    price: 9,
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    status: 'active',
    features: [
      'Basic inventory & sales tracking',
      'M-Pesa payments enabled',
      'Simple reports',
      'Email support'
    ]
  });

  // Load current business data when component mounts or business changes
  useEffect(() => {
    if (currentBusiness) {
      setBusinessForm({
        businessName: currentBusiness.businessName,
        businessType: currentBusiness.businessType,
        taxId: currentBusiness.taxId,
        businessLicense: currentBusiness.businessLicense,
        phone: currentBusiness.phone,
        email: currentBusiness.email,
        logoUrl: currentBusiness.logoUrl || '',
        address: currentBusiness.address,
        city: currentBusiness.city,
        state: currentBusiness.state,
        postalCode: currentBusiness.postalCode,
        country: currentBusiness.country
      });
      setOperatingHours(currentBusiness.operatingHours);
    }
  }, [currentBusiness]);

  // Handle URL parameters for navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const subsection = urlParams.get('subsection');
    const editId = urlParams.get('edit');
    const mode = urlParams.get('mode');

    if (section) setActiveSection(section);
    if (subsection) setActiveSubsection(subsection);
    
    if (editId && section === 'business' && subsection === 'business-info') {
      const businessToEdit = businesses.find(b => b.id === editId);
      if (businessToEdit) {
        setEditingBusinessId(editId);
        setIsEditMode(true);
        setBusinessForm({
          businessName: businessToEdit.businessName,
          businessType: businessToEdit.businessType,
          taxId: businessToEdit.taxId,
          businessLicense: businessToEdit.businessLicense,
          phone: businessToEdit.phone,
          email: businessToEdit.email,
          logoUrl: businessToEdit.logoUrl || '',
          address: businessToEdit.address,
          city: businessToEdit.city,
          state: businessToEdit.state,
          postalCode: businessToEdit.postalCode,
          country: businessToEdit.country
        });
      }
    }

    if (mode === 'add' && section === 'business' && subsection === 'business-info') {
      setIsEditMode(true);
      setEditingBusinessId(null);
      resetBusinessForm();
    }
  }, [businesses]);

  const resetBusinessForm = () => {
    setBusinessForm({
      businessName: '',
      businessType: 'retail',
      taxId: '',
      businessLicense: '',
      phone: '',
      email: '',
      logoUrl: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    });
    setLogoPreview(null);
  };

  const handleBusinessSave = () => {
    if (!businessForm.businessName) {
      toast.error('Business name is required');
      return;
    }

    try {
      if (editingBusinessId) {
        // Update existing business
        updateBusiness(editingBusinessId, {
          ...businessForm,
          operatingHours
        });
        showSaveToast('Business information updated successfully!');
      } else {
        // Add new business
        const newBusinessId = addBusiness({
          ...businessForm,
          operatingHours
        });
        showSaveToast('New business added successfully!');
        setEditingBusinessId(newBusinessId);
      }
      
      setIsEditMode(false);
      
      // Update URL to remove edit parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.toString());
      
    } catch (error) {
      toast.error('Error saving business information');
      console.error('Error saving business:', error);
    }
  };

  const handleBusinessCancel = () => {
    setIsEditMode(false);
    setEditingBusinessId(null);
    
    // Reset form to current business data
    if (currentBusiness) {
      setBusinessForm({
        businessName: currentBusiness.businessName,
        businessType: currentBusiness.businessType,
        taxId: currentBusiness.taxId,
        businessLicense: currentBusiness.businessLicense,
        phone: currentBusiness.phone,
        email: currentBusiness.email,
        logoUrl: currentBusiness.logoUrl || '',
        address: currentBusiness.address,
        city: currentBusiness.city,
        state: currentBusiness.state,
        postalCode: currentBusiness.postalCode,
        country: currentBusiness.country
      });
      setOperatingHours(currentBusiness.operatingHours);
    }
    
    // Update URL to remove edit parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());
    
    setLogoPreview(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setBusinessForm(prev => ({ ...prev, logoUrl: result }));
        showUploadToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    setBusinessForm(prev => ({ ...prev, logoUrl: '' }));
    setIsLogoDialogOpen(false);
    toast.success('Logo removed successfully!');
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleLocationSave = () => {
    if (!locationForm.name || !locationForm.address) {
      toast.error('Location name and address are required');
      return;
    }

    if (editingLocation) {
      setLocations(prev => prev.map(loc => 
        loc.id === editingLocation.id ? { ...loc, ...locationForm } : loc
      ));
      showSaveToast('Location updated successfully!');
    } else {
      const newLocation = {
        id: Date.now().toString(),
        ...locationForm
      };
      setLocations(prev => [...prev, newLocation]);
      showSaveToast('Location added successfully!');
    }
    
    setIsLocationDialogOpen(false);
    setEditingLocation(null);
    setLocationForm({
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      isActive: true
    });
  };

  const handleLocationEdit = (location: any) => {
    setEditingLocation(location);
    setLocationForm(location);
    setIsLocationDialogOpen(true);
  };

  const handleLocationDelete = (id: string) => {
    if (locations.length <= 1) {
      toast.error('Cannot delete the last location');
      return;
    }
    
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
      showSaveToast('Location deleted successfully!');
    }
  };

  const handleReceiptSettingsSave = () => {
    showSaveToast('Receipt settings saved successfully!');
  };

  const handleTerminalSettingsSave = () => {
    showSaveToast('Terminal settings saved successfully!');
  };

  const handleDisplaySettingsSave = () => {
    showSaveToast('Display settings saved successfully!');
  };

  const handleSystemSettingsSave = () => {
    showSaveToast('System settings saved successfully!');
  };

  const handleEmailTemplatesSave = () => {
    showSaveToast('Email templates saved successfully!');
  };

  const handleHardwareSettingsSave = () => {
    showSaveToast('Hardware settings saved successfully!');
  };

  const handleAppSettingsSave = () => {
    showSaveToast('App settings saved successfully!');
  };

  const handleSecuritySettingsSave = () => {
    showSaveToast('Security settings saved successfully!');
  };

  const getSelectedCountry = () => {
    return countries.find(c => c.code === businessForm.country);
  };

  const getSelectedStates = () => {
    const country = getSelectedCountry();
    return country?.states || [];
  };

  const getSelectedCities = () => {
    const states = getSelectedStates();
    const state = states.find(s => s.code === businessForm.state);
    return state?.cities || [];
  };

  const sections = [
    {
      id: 'business',
      title: 'Business',
      icon: Building2,
      subsections: [
        { id: 'business-info', title: 'Business Information', icon: Building2 },
        { id: 'business-operating-hours', title: 'Operating Hours', icon: Clock },
        { id: 'business-locations', title: 'Locations & Branches', icon: MapPin },
        { id: 'subscription', title: 'Subscription & Billing', icon: Crown }
      ]
    },
    {
      id: 'pos-terminal',
      title: 'POS Terminal',
      icon: Monitor,
      subsections: [
        { id: 'receipt-settings', title: 'Receipt Settings', icon: Printer },
        { id: 'terminal-behavior', title: 'Terminal Behavior', icon: Monitor },
        { id: 'display-settings', title: 'Display Settings', icon: Eye }
      ]
    },
    {
      id: 'system',
      title: 'System',
      icon: SettingsIcon,
      subsections: [
        { id: 'general', title: 'General', icon: SettingsIcon },
        { id: 'email-templates', title: 'Email Templates', icon: Mail },
        { id: 'backup', title: 'Backup & Recovery', icon: Save }
      ]
    },
    {
      id: 'hardware',
      title: 'Hardware',
      icon: Printer,
      subsections: [
        { id: 'receipt-printer', title: 'Receipt Printer', icon: Printer },
        { id: 'barcode-scanner', title: 'Barcode Scanner', icon: Scan },
        { id: 'cash-drawer', title: 'Cash Drawer', icon: DollarSign }
      ]
    },
    {
      id: 'app',
      title: 'App Settings',
      icon: Palette,
      subsections: [
        { id: 'invoice-templates', title: 'Invoice Templates', icon: FileText },
        { id: 'notifications', title: 'Notifications', icon: Bell },
        { id: 'theme', title: 'Theme & Appearance', icon: Palette }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      subsections: [
        { id: 'general', title: 'General Security', icon: Shield },
        { id: 'sessions', title: 'Session Management', icon: Clock },
        { id: 'audit', title: 'Audit & Logging', icon: Eye }
      ]
    }
  ];

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Business Information</h3>
          <p className="text-sm text-muted-foreground">Manage your business details and branding</p>
        </div>
        {!isEditMode ? (
          <Button onClick={() => setIsEditMode(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Business
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBusinessCancel}>
              Cancel
            </Button>
            <Button onClick={handleBusinessSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {isEditMode ? (
        <div className="space-y-6">
          {/* Business Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Business Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                  {logoPreview || businessForm.logoUrl ? (
                    <img 
                      src={logoPreview || businessForm.logoUrl} 
                      alt="Business Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{logoPreview || businessForm.logoUrl ? 'Current Logo' : 'No Logo'}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Recommended: 200x200px, PNG or JPG, max 2MB
                  </p>
                  <div className="flex gap-2">
                    <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <SettingsUpload className="h-4 w-4" />
                          {logoPreview || businessForm.logoUrl ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Business Logo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                              {logoPreview || businessForm.logoUrl ? (
                                <img 
                                  src={logoPreview || businessForm.logoUrl} 
                                  alt="Logo Preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Camera className="h-12 w-12 text-muted-foreground" />
                              )}
                            </div>
                            <div className="w-full">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                PNG, JPG up to 2MB. Recommended: 200x200px
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            {(logoPreview || businessForm.logoUrl) && (
                              <Button 
                                variant="outline"
                                onClick={handleLogoRemove}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove Logo
                              </Button>
                            )}
                            <Button onClick={() => setIsLogoDialogOpen(false)}>
                              Done
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessForm.businessName}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessForm.businessType} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="grocery">Grocery Store</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="electronics">Electronics Store</SelectItem>
                      <SelectItem value="clothing">Clothing Store</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxId">Tax ID / Business Registration</Label>
                  <Input
                    id="taxId"
                    value={businessForm.taxId}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="Tax identification number"
                  />
                </div>
                <div>
                  <Label htmlFor="businessLicense">Business License</Label>
                  <Input
                    id="businessLicense"
                    value={businessForm.businessLicense}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, businessLicense: e.target.value }))}
                    placeholder="Business license number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="business@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={businessForm.country} onValueChange={(value) => {
                    setBusinessForm(prev => ({ ...prev, country: value, state: '', city: '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Select value={businessForm.state} onValueChange={(value) => {
                    setBusinessForm(prev => ({ ...prev, state: value, city: '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedStates().map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Select value={businessForm.city} onValueChange={(value) => {
                    setBusinessForm(prev => ({ ...prev, city: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedCities().map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={businessForm.postalCode}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="12345"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // View mode
        <div className="space-y-6">
          {currentBusiness && (
            <>
              {/* Business Logo Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Business Logo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg border-2 border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                      {currentBusiness.logoUrl ? (
                        <img 
                          src={currentBusiness.logoUrl} 
                          alt="Business Logo"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{currentBusiness.logoUrl ? 'Business Logo' : 'No Logo Set'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentBusiness.logoUrl ? 'Logo is displayed on receipts and invoices' : 'Upload a logo to enhance your brand'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                      <p className="font-medium">{currentBusiness.businessName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                      <p className="font-medium capitalize">{currentBusiness.businessType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tax ID</Label>
                      <p className="font-medium">{currentBusiness.taxId || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Business License</Label>
                      <p className="font-medium">{currentBusiness.businessLicense || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-medium">{currentBusiness.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-medium">{currentBusiness.email || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="font-medium">
                      {[
                        currentBusiness.address,
                        currentBusiness.city,
                        currentBusiness.state,
                        currentBusiness.postalCode,
                        countries.find(c => c.code === currentBusiness.country)?.name
                      ].filter(Boolean).join(', ') || 'Not set'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderOperatingHours = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Operating Hours</h3>
        <p className="text-sm text-muted-foreground">Set your business operating schedule</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20">
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!hours.closed}
                      onCheckedChange={(checked) => handleOperatingHoursChange(day, 'closed', !checked)}
                    />
                    <span className="text-sm">Open</span>
                  </div>
                </div>
                
                {!hours.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
                
                {hours.closed && (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={() => showSaveToast('Operating hours saved successfully!')} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Hours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Locations & Branches</h3>
          <p className="text-sm text-muted-foreground">Manage your business locations</p>
        </div>
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="locationName">Location Name *</Label>
                  <Input
                    id="locationName"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Main Store"
                  />
                </div>
                <div>
                  <Label htmlFor="locationPhone">Phone</Label>
                  <Input
                    id="locationPhone"
                    value={locationForm.phone}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="locationAddress">Address *</Label>
                <Input
                  id="locationAddress"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="locationCountry">Country</Label>
                  <Select value={locationForm.country} onValueChange={(value) => {
                    setLocationForm(prev => ({ ...prev, country: value, state: '', city: '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.slice(0, 10).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="locationState">State</Label>
                  <Input
                    id="locationState"
                    value={locationForm.state}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="locationCity">City</Label>
                  <Input
                    id="locationCity"
                    value={locationForm.city}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="locationPostalCode">Postal Code</Label>
                <Input
                  id="locationPostalCode"
                  value={locationForm.postalCode}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="12345"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={locationForm.isActive}
                  onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, isActive: checked === true }))}
                />
                <Label>Active Location</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsLocationDialogOpen(false);
                  setEditingLocation(null);
                  setLocationForm({
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'US',
                    phone: '',
                    isActive: true
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleLocationSave} className="bg-save hover:bg-save-hover text-save-foreground">
                  {editingLocation ? 'Update' : 'Add'} Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{location.name}</h4>
                    <Badge variant={location.isActive ? "default" : "secondary"}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location.address}, {location.city}, {location.state}</span>
                  </div>
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleLocationEdit(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLocationDelete(location.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Subscription & Billing</h3>
        <p className="text-sm text-muted-foreground">Manage your subscription plan and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Current Plan: {subscriptionInfo.planName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ${subscriptionInfo.price}/month • Next billing: {subscriptionInfo.nextBilling}
              </p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20">
              {subscriptionInfo.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="space-y-2">
              {subscriptionInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button onClick={() => window.location.href = '/dashboard/subscription'}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/subscription/manage'}>
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReceiptSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Receipt Settings</h3>
        <p className="text-sm text-muted-foreground">Configure receipt templates and printing options</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Template Style</Label>
            <Select value={receiptSettings.template} onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, template: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic-receipt">Classic Receipt</SelectItem>
                <SelectItem value="modern-receipt">Modern Receipt</SelectItem>
                <SelectItem value="minimal-receipt">Minimal Receipt</SelectItem>
                <SelectItem value="detailed-receipt">Detailed Receipt</SelectItem>
                <SelectItem value="thermal-receipt">Thermal Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Paper Size</Label>
              <Select value={receiptSettings.paperSize} onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, paperSize: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal-80mm">Thermal 80mm</SelectItem>
                  <SelectItem value="thermal-58mm">Thermal 58mm</SelectItem>
                  <SelectItem value="a4">A4 Paper</SelectItem>
                  <SelectItem value="letter">Letter Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Size</Label>
              <Select value={receiptSettings.fontSize} onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, fontSize: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Receipt Elements</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'showLogo', label: 'Show Business Logo' },
                { key: 'showAddress', label: 'Show Address' },
                { key: 'showPhone', label: 'Show Phone Number' },
                { key: 'showEmail', label: 'Show Email Address' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={receiptSettings[key as keyof typeof receiptSettings] as boolean}
                    onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="footerMessage">Footer Message</Label>
            <Textarea
              id="footerMessage"
              value={receiptSettings.footerMessage}
              onChange={(e) => setReceiptSettings(prev => ({ ...prev, footerMessage: e.target.value }))}
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleReceiptSettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Receipt Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTerminalBehavior = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Terminal Behavior</h3>
        <p className="text-sm text-muted-foreground">Configure POS terminal behavior and security</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Lock Terminal</Label>
                <p className="text-sm text-muted-foreground">Automatically lock terminal after inactivity</p>
              </div>
              <Switch
                checked={terminalSettings.autoLock}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, autoLock: checked }))}
              />
            </div>

            {terminalSettings.autoLock && (
              <div>
                <Label>Lock Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={terminalSettings.lockTimeout}
                  onChange={(e) => setTerminalSettings(prev => ({ ...prev, lockTimeout: parseInt(e.target.value) || 30 }))}
                  className="w-32"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Require PIN for Void</Label>
                <p className="text-sm text-muted-foreground">Require manager PIN to void transactions</p>
              </div>
              <Switch
                checked={terminalSettings.requirePinForVoid}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, requirePinForVoid: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Discounts</Label>
                <p className="text-sm text-muted-foreground">Enable discount functionality</p>
              </div>
              <Switch
                checked={terminalSettings.allowDiscounts}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, allowDiscounts: checked }))}
              />
            </div>

            {terminalSettings.allowDiscounts && (
              <div>
                <Label>Maximum Discount (%)</Label>
                <Input
                  type="number"
                  value={terminalSettings.maxDiscountPercent}
                  onChange={(e) => setTerminalSettings(prev => ({ ...prev, maxDiscountPercent: parseInt(e.target.value) || 50 }))}
                  className="w-32"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Enable button sounds and alerts</p>
              </div>
              <Switch
                checked={terminalSettings.soundEnabled}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, soundEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
              </div>
              <Switch
                checked={terminalSettings.animationsEnabled}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, animationsEnabled: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleTerminalSettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Terminal Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Display Settings</h3>
        <p className="text-sm text-muted-foreground">Configure screen and display options</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Screen Timeout (minutes)</Label>
              <Input
                type="number"
                value={displaySettings.screenTimeout}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, screenTimeout: parseInt(e.target.value) || 10 }))}
                className="w-32"
              />
            </div>

            <div>
              <Label>Screen Brightness (%)</Label>
              <Input
                type="number"
                min="10"
                max="100"
                value={displaySettings.brightness}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, brightness: parseInt(e.target.value) || 80 }))}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Customer Display</Label>
                <p className="text-sm text-muted-foreground">Show customer-facing display</p>
              </div>
              <Switch
                checked={displaySettings.showCustomerDisplay}
                onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, showCustomerDisplay: checked }))}
              />
            </div>

            {displaySettings.showCustomerDisplay && (
              <div>
                <Label>Customer Display Message</Label>
                <Input
                  value={displaySettings.customerDisplayMessage}
                  onChange={(e) => setDisplaySettings(prev => ({ ...prev, customerDisplayMessage: e.target.value }))}
                  placeholder="Welcome message"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleDisplaySettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Display Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemGeneral = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">System General</h3>
        <p className="text-sm text-muted-foreground">Core system configuration</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup data</p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>

            <div>
              <Label>Backup Frequency</Label>
              <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Retention (days)</Label>
              <Input
                type="number"
                value={systemSettings.dataRetention}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 365 }))}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSystemSettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmailTemplates = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <p className="text-sm text-muted-foreground">Customize automated email templates</p>
      </div>

      <div className="space-y-4">
        {Object.entries(emailTemplates).map(([key, template]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input
                  value={template.subject}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    [key]: { ...prev[key as keyof typeof prev], subject: e.target.value }
                  }))}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={template.body}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    [key]: { ...prev[key as keyof typeof prev], body: e.target.value }
                  }))}
                  placeholder="Email content"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleEmailTemplatesSave} className="bg-save hover:bg-save-hover text-save-foreground">
          <Save className="h-4 w-4 mr-2" />
          Save Email Templates
        </Button>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Backup & Recovery</h3>
        <p className="text-sm text-muted-foreground">Manage data backup and recovery options</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup your data</p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>

            <div>
              <Label>Backup Schedule</Label>
              <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                Create Backup Now
              </Button>
              <Button variant="outline">
                Restore from Backup
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => showSaveToast('Backup settings saved successfully!')} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Backup Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHardwareSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Hardware Configuration</h3>
        <p className="text-sm text-muted-foreground">Configure connected hardware devices</p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="printer">
          <AccordionTrigger>Receipt Printer Settings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Receipt Printer</Label>
              <Switch
                checked={hardwareSettings.receiptPrinter.enabled}
                onCheckedChange={(checked) => setHardwareSettings(prev => ({
                  ...prev,
                  receiptPrinter: { ...prev.receiptPrinter, enabled: checked }
                }))}
              />
            </div>
            
            <div>
              <Label>Printer Name</Label>
              <Input
                value={hardwareSettings.receiptPrinter.printerName}
                onChange={(e) => setHardwareSettings(prev => ({
                  ...prev,
                  receiptPrinter: { ...prev.receiptPrinter, printerName: e.target.value }
                }))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="scanner">
          <AccordionTrigger>Barcode Scanner Settings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Barcode Scanner</Label>
              <Switch
                checked={hardwareSettings.barcodeScanner.enabled}
                onCheckedChange={(checked) => setHardwareSettings(prev => ({
                  ...prev,
                  barcodeScanner: { ...prev.barcodeScanner, enabled: checked }
                }))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="drawer">
          <AccordionTrigger>Cash Drawer Settings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Cash Drawer</Label>
              <Switch
                checked={hardwareSettings.cashDrawer.enabled}
                onCheckedChange={(checked) => setHardwareSettings(prev => ({
                  ...prev,
                  cashDrawer: { ...prev.cashDrawer, enabled: checked }
                }))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={handleHardwareSettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
          <Save className="h-4 w-4 mr-2" />
          Save Hardware Settings
        </Button>
      </div>
    </div>
  );

  const renderAppSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Application Settings</h3>
        <p className="text-sm text-muted-foreground">Configure app behavior and preferences</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Default Currency</Label>
              <Select value={appSettings.currency} onValueChange={(value) => setAppSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Format</Label>
              <Select value={appSettings.dateFormat} onValueChange={(value) => setAppSettings(prev => ({ ...prev, dateFormat: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Format</Label>
              <Select value={appSettings.timeFormat} onValueChange={(value) => setAppSettings(prev => ({ ...prev, timeFormat: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={appSettings.defaultTax}
                onChange={(e) => setAppSettings(prev => ({ ...prev, defaultTax: parseFloat(e.target.value) || 0 }))}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAppSettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save App Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Security Settings</h3>
        <p className="text-sm text-muted-foreground">Configure security policies and access controls</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Minimum Password Length</Label>
            <Input
              type="number"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) || 8 }
              }))}
              className="w-32"
            />
          </div>

          <div className="space-y-3">
            <Label>Password Requirements</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                { key: 'requireNumbers', label: 'Require Numbers' },
                { key: 'requireSymbols', label: 'Require Symbols' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={securitySettings.passwordPolicy[key as keyof typeof securitySettings.passwordPolicy] as boolean}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, [key]: checked }
                    }))}
                  />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSecuritySettingsSave} className="bg-save hover:bg-save-hover text-save-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    const key = `${activeSection}-${activeSubsection}`;
    
    switch (key) {
      case 'business-business-info':
        return renderBusinessInfo();
      case 'business-business-operating-hours':
        return renderOperatingHours();
      case 'business-business-locations':
        return renderLocations();
      case 'business-subscription':
        return renderSubscription();
      case 'pos-terminal-receipt-settings':
        return renderReceiptSettings();
      case 'pos-terminal-terminal-behavior':
        return renderTerminalBehavior();
      case 'pos-terminal-display-settings':
        return renderDisplaySettings();
      case 'system-general':
        return renderSystemGeneral();
      case 'system-email-templates':
        return renderEmailTemplates();
      case 'system-backup':
        return renderBackupSettings();
      case 'hardware-receipt-printer':
      case 'hardware-barcode-scanner':
      case 'hardware-cash-drawer':
        return renderHardwareSettings();
      case 'app-invoice-templates':
      case 'app-notifications':
      case 'app-theme':
        return renderAppSettings();
      case 'security-general':
      case 'security-sessions':
      case 'security-audit':
        return renderSecuritySettings();
      default:
        return renderBusinessInfo();
    }
  };

  return (
    <div className="flex h-full bg-background dark:bg-black">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card dark:bg-black p-6 overflow-y-auto settings-sidebar">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your POS system</p>
          </div>

          <div className="space-y-2">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isActiveSection = activeSection === section.id;
              
              return (
                <div key={section.id} className="space-y-1">
                  <Button
                    variant={isActiveSection ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isActiveSection && "bg-primary/10 text-primary"
                    )}
                    onClick={() => {
                      setActiveSection(section.id);
                      setActiveSubsection(section.subsections[0].id);
                    }}
                  >
                    <SectionIcon className="h-4 w-4" />
                    {section.title}
                  </Button>
                  
                  {isActiveSection && (
                    <div className="ml-6 space-y-1">
                      {section.subsections.map((subsection) => {
                        const SubsectionIcon = subsection.icon;
                        const isActiveSubsection = activeSubsection === subsection.id;
                        
                        return (
                          <Button
                            key={subsection.id}
                            variant={isActiveSubsection ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-2 h-8 text-sm",
                              isActiveSubsection && "bg-primary/10 text-primary"
                            )}
                            onClick={() => setActiveSubsection(subsection.id)}
                          >
                            <SubsectionIcon className="h-3 w-3" />
                            {subsection.title}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;