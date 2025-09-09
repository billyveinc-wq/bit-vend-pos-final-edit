import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useBusiness } from '@/contexts/BusinessContext';
import { countries } from '@/data/countries';
import { showSaveToast, showUploadToast } from '@/components/SettingsToast';
import SystemUsersReferrals from '@/components/SystemUsersReferrals';
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  Monitor,
  Receipt,
  Printer,
  Scan,
  CreditCard,
  Mail,
  Shield,
  Database,
  Palette,
  Bell,
  Users,
  FileText,
  Upload as SettingsUpload,
  X,
  Save,
  Eye,
  EyeOff,
  Crown,
  Star,
  Zap,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Camera,
  Plus,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { businesses, currentBusiness, addBusiness, updateBusiness } = useBusiness();
  
  const section = searchParams.get('section') || 'business';
  const subsection = searchParams.get('subsection') || 'business-info';
  const editId = searchParams.get('edit');
  const mode = searchParams.get('mode');

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
    {
      id: '1',
      name: 'Main Store',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1 555-0123',
      isMain: true
    }
  ]);

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    isMain: false
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
    fontSize: 'medium',
    printCopies: 1,
    autoPrint: false
  });

  // Terminal behavior state
  const [terminalSettings, setTerminalSettings] = useState({
    autoLock: true,
    lockTimeout: 30,
    requirePinForVoid: true,
    requirePinForDiscount: true,
    allowNegativeInventory: false,
    showProductImages: true,
    enableQuickSale: true,
    defaultPaymentMethod: 'cash'
  });

  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    screenTimeout: 10,
    brightness: 80,
    showCustomerDisplay: false,
    customerDisplayMessage: 'Welcome to our store!',
    showClock: true,
    show24HourTime: false
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    enableLogging: true,
    logLevel: 'info',
    maxLogSize: 100,
    enableUpdates: true,
    updateChannel: 'stable'
  });

  // Email template state
  const [emailTemplates, setEmailTemplates] = useState({
    receiptEmail: {
      enabled: true,
      subject: 'Your Receipt from {business_name}',
      template: 'Thank you for your purchase!\n\nYour receipt is attached.\n\nBest regards,\n{business_name}'
    },
    lowStockAlert: {
      enabled: true,
      subject: 'Low Stock Alert - {product_name}',
      template: 'Product {product_name} is running low.\nCurrent stock: {current_stock}\nMinimum stock: {min_stock}'
    }
  });

  // Hardware settings state
  const [hardwareSettings, setHardwareSettings] = useState({
    receiptPrinter: {
      enabled: true,
      printerName: 'Default Printer',
      paperWidth: 80,
      charactersPerLine: 32,
      cutPaper: true
    },
    barcodeScanner: {
      enabled: true,
      scannerType: 'usb',
      autoEnter: true,
      scanPrefix: '',
      scanSuffix: ''
    },
    cashDrawer: {
      enabled: true,
      openOnSale: true,
      openOnRefund: false,
      kickCode: '27,112,0,25,250'
    }
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    theme: 'system',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    numberFormat: 'US',
    autoSave: true,
    confirmBeforeDelete: true,
    showTooltips: true
  });

  // Invoice template state
  const [invoiceTemplates, setInvoiceTemplates] = useState({
    defaultTemplate: 'professional',
    showLogo: true,
    showBusinessInfo: true,
    showCustomerInfo: true,
    showItemDetails: true,
    showTaxBreakdown: true,
    footerText: 'Thank you for your business!',
    termsAndConditions: 'Payment is due within 30 days.',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981'
    }
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlerts: true,
    salesAlerts: false,
    systemAlerts: true,
    marketingEmails: false
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPasswords: true,
    passwordMinLength: 8,
    requireTwoFactor: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    auditLogging: true,
    encryptData: true
  });

  // Session management state
  const [sessionSettings, setSessionSettings] = useState({
    maxConcurrentSessions: 3,
    sessionWarningTime: 5,
    rememberMe: true,
    autoLogout: true,
    logoutWarning: true
  });

  // Audit settings state
  const [auditSettings, setAuditSettings] = useState({
    enableAuditLog: true,
    logUserActions: true,
    logSystemEvents: true,
    logDataChanges: true,
    retentionPeriod: 90,
    exportFormat: 'json'
  });

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    currentPlan: 'starter',
    planName: 'Starter Plan',
    price: 9,
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    status: 'active',
    features: [
      'Basic inventory & sales tracking',
      'M-Pesa payments enabled',
      'Simple reports',
      'Email support'
    ]
  });

  // Load business data when editing
  useEffect(() => {
    if (editId && mode === 'edit') {
      const business = businesses.find(b => b.id === editId);
      if (business) {
        setBusinessForm({
          businessName: business.businessName,
          businessType: business.businessType,
          taxId: business.taxId,
          businessLicense: business.businessLicense,
          phone: business.phone,
          email: business.email,
          logoUrl: business.logoUrl || '',
          address: business.address,
          city: business.city,
          state: business.state,
          postalCode: business.postalCode,
          country: business.country
        });
        setOperatingHours(business.operatingHours);
      }
    } else if (currentBusiness && !editId) {
      // Load current business data for viewing/editing
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
  }, [editId, mode, currentBusiness, businesses]);

  // Reset form when switching to add mode
  useEffect(() => {
    if (mode === 'add') {
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
      setOperatingHours({
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true },
      });
    }
  }, [mode]);

  const handleSectionChange = (newSection: string, newSubsection?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('section', newSection);
    if (newSubsection) {
      params.set('subsection', newSubsection);
    } else {
      params.delete('subsection');
    }
    // Clear edit mode when changing sections
    params.delete('edit');
    params.delete('mode');
    setSearchParams(params);
  };

  const handleSubsectionChange = (newSubsection: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('subsection', newSubsection);
    // Clear edit mode when changing subsections
    params.delete('edit');
    params.delete('mode');
    setSearchParams(params);
  };

  const handleSaveBusinessInfo = () => {
    if (!businessForm.businessName || !businessForm.email) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (mode === 'add') {
        // Add new business
        const newBusinessId = addBusiness({
          ...businessForm,
          operatingHours
        });
        showSaveToast('New business created successfully!');
        
        // Clear add mode and edit the new business
        const params = new URLSearchParams(searchParams);
        params.delete('mode');
        params.set('edit', newBusinessId);
        setSearchParams(params);
      } else if (editId) {
        // Update existing business
        updateBusiness(editId, {
          ...businessForm,
          operatingHours
        });
        showSaveToast('Business information updated successfully!');
        
        // Clear edit mode
        const params = new URLSearchParams(searchParams);
        params.delete('edit');
        params.delete('mode');
        setSearchParams(params);
      } else if (currentBusiness) {
        // Update current business
        updateBusiness(currentBusiness.id, {
          ...businessForm,
          operatingHours
        });
        showSaveToast('Business information updated successfully!');
      }
    } catch (error) {
      toast.error('Error saving business information');
      console.error('Error saving business:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      // For now, we'll create a local URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setBusinessForm(prev => ({ ...prev, logoUrl }));
        showUploadToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setBusinessForm(prev => ({ ...prev, logoUrl: '' }));
    toast.success('Logo removed successfully!');
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      toast.error('Please fill in location name and address');
      return;
    }

    const location = {
      id: Date.now().toString(),
      ...newLocation
    };

    setLocations(prev => [...prev, location]);
    setNewLocation({
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      isMain: false
    });
    toast.success('Location added successfully!');
  };

  const handleDeleteLocation = (id: string) => {
    if (locations.find(l => l.id === id)?.isMain) {
      toast.error('Cannot delete main location');
      return;
    }
    setLocations(prev => prev.filter(l => l.id !== id));
    toast.success('Location deleted successfully!');
  };

  const handleSaveReceiptSettings = () => {
    // Save receipt settings to localStorage or API
    localStorage.setItem('pos-receipt-settings', JSON.stringify(receiptSettings));
    showSaveToast('Receipt settings saved successfully!');
  };

  const handleSaveTerminalSettings = () => {
    localStorage.setItem('pos-terminal-settings', JSON.stringify(terminalSettings));
    showSaveToast('Terminal settings saved successfully!');
  };

  const handleSaveDisplaySettings = () => {
    localStorage.setItem('pos-display-settings', JSON.stringify(displaySettings));
    showSaveToast('Display settings saved successfully!');
  };

  const handleSaveSystemSettings = () => {
    localStorage.setItem('pos-system-settings', JSON.stringify(systemSettings));
    showSaveToast('System settings saved successfully!');
  };

  const handleSaveEmailTemplates = () => {
    localStorage.setItem('pos-email-templates', JSON.stringify(emailTemplates));
    showSaveToast('Email templates saved successfully!');
  };

  const handleSaveHardwareSettings = () => {
    localStorage.setItem('pos-hardware-settings', JSON.stringify(hardwareSettings));
    showSaveToast('Hardware settings saved successfully!');
  };

  const handleSaveAppSettings = () => {
    localStorage.setItem('pos-app-settings', JSON.stringify(appSettings));
    showSaveToast('App settings saved successfully!');
  };

  const handleSaveInvoiceTemplates = () => {
    localStorage.setItem('pos-invoice-templates', JSON.stringify(invoiceTemplates));
    showSaveToast('Invoice templates saved successfully!');
  };

  const handleSaveNotificationSettings = () => {
    localStorage.setItem('pos-notification-settings', JSON.stringify(notificationSettings));
    showSaveToast('Notification settings saved successfully!');
  };

  const handleSaveSecuritySettings = () => {
    localStorage.setItem('pos-security-settings', JSON.stringify(securitySettings));
    showSaveToast('Security settings saved successfully!');
  };

  const handleSaveSessionSettings = () => {
    localStorage.setItem('pos-session-settings', JSON.stringify(sessionSettings));
    showSaveToast('Session settings saved successfully!');
  };

  const handleSaveAuditSettings = () => {
    localStorage.setItem('pos-audit-settings', JSON.stringify(auditSettings));
    showSaveToast('Audit settings saved successfully!');
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedReceiptSettings = localStorage.getItem('pos-receipt-settings');
        if (savedReceiptSettings) {
          setReceiptSettings(JSON.parse(savedReceiptSettings));
        }

        const savedTerminalSettings = localStorage.getItem('pos-terminal-settings');
        if (savedTerminalSettings) {
          setTerminalSettings(JSON.parse(savedTerminalSettings));
        }

        const savedDisplaySettings = localStorage.getItem('pos-display-settings');
        if (savedDisplaySettings) {
          setDisplaySettings(JSON.parse(savedDisplaySettings));
        }

        const savedSystemSettings = localStorage.getItem('pos-system-settings');
        if (savedSystemSettings) {
          setSystemSettings(JSON.parse(savedSystemSettings));
        }

        const savedEmailTemplates = localStorage.getItem('pos-email-templates');
        if (savedEmailTemplates) {
          setEmailTemplates(JSON.parse(savedEmailTemplates));
        }

        const savedHardwareSettings = localStorage.getItem('pos-hardware-settings');
        if (savedHardwareSettings) {
          setHardwareSettings(JSON.parse(savedHardwareSettings));
        }

        const savedAppSettings = localStorage.getItem('pos-app-settings');
        if (savedAppSettings) {
          setAppSettings(JSON.parse(savedAppSettings));
        }

        const savedInvoiceTemplates = localStorage.getItem('pos-invoice-templates');
        if (savedInvoiceTemplates) {
          setInvoiceTemplates(JSON.parse(savedInvoiceTemplates));
        }

        const savedNotificationSettings = localStorage.getItem('pos-notification-settings');
        if (savedNotificationSettings) {
          setNotificationSettings(JSON.parse(savedNotificationSettings));
        }

        const savedSecuritySettings = localStorage.getItem('pos-security-settings');
        if (savedSecuritySettings) {
          setSecuritySettings(JSON.parse(savedSecuritySettings));
        }

        const savedSessionSettings = localStorage.getItem('pos-session-settings');
        if (savedSessionSettings) {
          setSessionSettings(JSON.parse(savedSessionSettings));
        }

        const savedAuditSettings = localStorage.getItem('pos-audit-settings');
        if (savedAuditSettings) {
          setAuditSettings(JSON.parse(savedAuditSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const sidebarSections = [
    {
      id: 'business',
      label: 'Business',
      icon: Building2,
      subsections: [
        { id: 'business-info', label: 'Business Information', icon: Building2 },
        { id: 'business-operating-hours', label: 'Operating Hours', icon: Clock },
        { id: 'business-locations', label: 'Locations & Branches', icon: MapPin },
        { id: 'subscription', label: 'Subscription & Billing', icon: Crown }
      ]
    },
    {
      id: 'pos-terminal',
      label: 'POS Terminal',
      icon: Monitor,
      subsections: [
        { id: 'receipt-settings', label: 'Receipt Settings', icon: Receipt },
        { id: 'terminal-behavior', label: 'Terminal Behavior', icon: Monitor },
        { id: 'display-settings', label: 'Display Settings', icon: Monitor }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: SettingsIcon,
      subsections: [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'email-templates', label: 'Email Templates', icon: Mail },
        { id: 'backup', label: 'Backup & Recovery', icon: Database }
      ]
    },
    {
      id: 'hardware',
      label: 'Hardware',
      icon: Printer,
      subsections: [
        { id: 'receipt-printer', label: 'Receipt Printer', icon: Printer },
        { id: 'barcode-scanner', label: 'Barcode Scanner', icon: Scan },
        { id: 'cash-drawer', label: 'Cash Drawer', icon: CreditCard }
      ]
    },
    {
      id: 'app',
      label: 'App Settings',
      icon: Palette,
      subsections: [
        { id: 'invoice-templates', label: 'Invoice Templates', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme & Appearance', icon: Palette }
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      subsections: [
        { id: 'general', label: 'General Security', icon: Shield },
        { id: 'sessions', label: 'Session Management', icon: Users },
        { id: 'audit', label: 'Audit & Logging', icon: FileText }
      ]
    },
    {
      id: 'users',
      label: 'Users & Referrals',
      icon: Users,
      subsections: [
        { id: 'system-users', label: 'System Users', icon: Users },
        { id: 'referral-codes', label: 'Referral Management', icon: Users }
      ]
    }
  ];

  const getSelectedCountry = () => {
    return countries.find(c => c.code === businessForm.country);
  };

  const getSelectedState = () => {
    const country = getSelectedCountry();
    return country?.states.find(s => s.code === businessForm.state);
  };

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Business Information</h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'add' ? 'Add a new business location' : 'Manage your business details and branding'}
          </p>
        </div>
        {!mode && !editId && (
          <Button 
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('mode', 'add');
              setSearchParams(params);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Business
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {mode === 'add' ? 'New Business' : editId ? 'Edit Business' : 'Business Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Business Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                {businessForm.logoUrl ? (
                  <img 
                    src={businessForm.logoUrl} 
                    alt="Business Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="gap-2"
                  >
                    <SettingsUpload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  {businessForm.logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLogo}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 200x200px, PNG or JPG
                </p>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessForm.businessName}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select 
                value={businessForm.businessType} 
                onValueChange={(value) => setBusinessForm(prev => ({ ...prev, businessType: value }))}
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / Business Registration</Label>
              <Input
                id="taxId"
                value={businessForm.taxId}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="Tax identification number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License</Label>
              <Input
                id="businessLicense"
                value={businessForm.businessLicense}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, businessLicense: e.target.value }))}
                placeholder="Business license number"
              />
            </div>
          </div>

          {/* Contact Information */}
          <Separator />
          <h4 className="text-md font-semibold">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={businessForm.phone}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={businessForm.email}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="business@example.com"
              />
            </div>
          </div>

          {/* Address Information */}
          <Separator />
          <h4 className="text-md font-semibold">Business Address</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={businessForm.address}
                onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={businessForm.country} 
                  onValueChange={(value) => setBusinessForm(prev => ({ ...prev, country: value, state: '', city: '' }))}
                >
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
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Select 
                  value={businessForm.state} 
                  onValueChange={(value) => setBusinessForm(prev => ({ ...prev, state: value, city: '' }))}
                  disabled={!businessForm.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedCountry()?.states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={businessForm.city} 
                  onValueChange={(value) => setBusinessForm(prev => ({ ...prev, city: value }))}
                  disabled={!businessForm.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedState()?.cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={businessForm.postalCode}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {(mode === 'add' || editId) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('mode');
                  params.delete('edit');
                  setSearchParams(params);
                }}
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleSaveBusinessInfo} className="gap-2">
              <Save className="h-4 w-4" />
              {mode === 'add' ? 'Create Business' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Businesses List (only show when not in add/edit mode) */}
      {!mode && !editId && businesses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>All Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businesses.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {business.logoUrl ? (
                        <img src={business.logoUrl} alt={business.businessName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{business.businessName}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{business.businessType}</p>
                      <p className="text-xs text-muted-foreground">{business.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentBusiness?.id === business.id && (
                      <Badge variant="default">Current</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('edit', business.id);
                        params.set('mode', 'edit');
                        setSearchParams(params);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="capitalize font-medium">{day}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={!hours.closed}
                  onCheckedChange={(checked) => handleOperatingHoursChange(day, 'closed', !checked)}
                />
                <Label className="text-sm">Open</Label>
              </div>

              {!hours.closed && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">From:</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">To:</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </>
              )}

              {hours.closed && (
                <Badge variant="secondary" className="ml-auto">Closed</Badge>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSaveBusinessInfo} className="gap-2">
              <Save className="h-4 w-4" />
              Save Operating Hours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Locations & Branches</h3>
        <p className="text-sm text-muted-foreground">Manage your business locations and branches</p>
      </div>

      {/* Existing Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{location.name}</h4>
                      {location.isMain && <Badge variant="default">Main</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.postalCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{location.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!location.isMain && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Location */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Branch name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationPhone">Phone</Label>
              <Input
                id="locationPhone"
                value={newLocation.phone}
                onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationAddress">Address</Label>
            <Input
              id="locationAddress"
              value={newLocation.address}
              onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationCountry">Country</Label>
              <Select 
                value={newLocation.country} 
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, country: value, state: '', city: '' }))}
              >
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
            
            <div className="space-y-2">
              <Label htmlFor="locationState">State</Label>
              <Select 
                value={newLocation.state} 
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, state: value, city: '' }))}
                disabled={!newLocation.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {countries.find(c => c.code === newLocation.country)?.states.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationCity">City</Label>
              <Select 
                value={newLocation.city} 
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, city: value }))}
                disabled={!newLocation.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {countries.find(c => c.code === newLocation.country)?.states
                    .find(s => s.code === newLocation.state)?.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationPostalCode">Postal Code</Label>
              <Input
                id="locationPostalCode"
                value={newLocation.postalCode}
                onChange={(e) => setNewLocation(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddLocation} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Subscription & Billing</h3>
        <p className="text-sm text-muted-foreground">Manage your subscription plan and billing information</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">{subscriptionInfo.planName}</h4>
                <p className="text-sm text-muted-foreground">
                  ${subscriptionInfo.price}/{subscriptionInfo.billingCycle}
                </p>
                <Badge className="mt-1 bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {subscriptionInfo.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next billing</p>
              <p className="font-medium">{subscriptionInfo.nextBillingDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium">Plan Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscriptionInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard/subscription')} className="gap-2">
              <Crown className="h-4 w-4" />
              Manage Subscription
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/subscription/manage')}>
              View Billing History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Standard Plan',
                price: 19,
                icon: Zap,
                features: ['Multi-user accounts', 'Advanced reports', 'Priority support']
              },
              {
                name: 'Pro Plan',
                price: 39,
                icon: Crown,
                features: ['Multi-branch support', 'Custom receipts', 'API access']
              },
              {
                name: 'Enterprise Plan',
                price: 79,
                icon: Crown,
                features: ['Unlimited everything', 'Dedicated support', 'Custom features']
              }
            ].map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card key={plan.name} className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold">{plan.name}</h4>
                    <p className="text-2xl font-bold text-primary">${plan.price}/mo</p>
                    <div className="space-y-1 mt-3">
                      {plan.features.map((feature, index) => (
                        <p key={index} className="text-xs text-muted-foreground">{feature}</p>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-4" onClick={() => navigate('/dashboard/subscription')}>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template">Receipt Template</Label>
            <Select 
              value={receiptSettings.template} 
              onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, template: value }))}
            >
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Logo</Label>
                <Switch
                  checked={receiptSettings.showLogo}
                  onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showLogo: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Address</Label>
                <Switch
                  checked={receiptSettings.showAddress}
                  onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showAddress: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Phone</Label>
                <Switch
                  checked={receiptSettings.showPhone}
                  onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Email</Label>
                <Switch
                  checked={receiptSettings.showEmail}
                  onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Print</Label>
                <Switch
                  checked={receiptSettings.autoPrint}
                  onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, autoPrint: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerMessage">Footer Message</Label>
            <Textarea
              id="footerMessage"
              value={receiptSettings.footerMessage}
              onChange={(e) => setReceiptSettings(prev => ({ ...prev, footerMessage: e.target.value }))}
              placeholder="Thank you message"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select 
                value={receiptSettings.paperSize} 
                onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, paperSize: value }))}
              >
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
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select 
                value={receiptSettings.fontSize} 
                onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, fontSize: value }))}
              >
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
            <div className="space-y-2">
              <Label htmlFor="printCopies">Print Copies</Label>
              <Input
                id="printCopies"
                type="number"
                min="1"
                max="5"
                value={receiptSettings.printCopies}
                onChange={(e) => setReceiptSettings(prev => ({ ...prev, printCopies: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveReceiptSettings} className="gap-2">
              <Save className="h-4 w-4" />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Security & Locking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Lock Terminal</Label>
                <p className="text-sm text-muted-foreground">Automatically lock after inactivity</p>
              </div>
              <Switch
                checked={terminalSettings.autoLock}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, autoLock: checked }))}
              />
            </div>

            {terminalSettings.autoLock && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="lockTimeout">Lock Timeout (minutes)</Label>
                <Input
                  id="lockTimeout"
                  type="number"
                  min="1"
                  max="120"
                  value={terminalSettings.lockTimeout}
                  onChange={(e) => setTerminalSettings(prev => ({ ...prev, lockTimeout: parseInt(e.target.value) }))}
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
                <Label>Require PIN for Discount</Label>
                <p className="text-sm text-muted-foreground">Require manager PIN for discounts</p>
              </div>
              <Switch
                checked={terminalSettings.requirePinForDiscount}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, requirePinForDiscount: checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Inventory Behavior</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Negative Inventory</Label>
                <p className="text-sm text-muted-foreground">Allow sales when stock is zero</p>
              </div>
              <Switch
                checked={terminalSettings.allowNegativeInventory}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, allowNegativeInventory: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Product Images</Label>
                <p className="text-sm text-muted-foreground">Display product images in POS</p>
              </div>
              <Switch
                checked={terminalSettings.showProductImages}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, showProductImages: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Quick Sale</Label>
                <p className="text-sm text-muted-foreground">Allow quick sale without product selection</p>
              </div>
              <Switch
                checked={terminalSettings.enableQuickSale}
                onCheckedChange={(checked) => setTerminalSettings(prev => ({ ...prev, enableQuickSale: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
            <Select 
              value={terminalSettings.defaultPaymentMethod} 
              onValueChange={(value) => setTerminalSettings(prev => ({ ...prev, defaultPaymentMethod: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile">Mobile Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveTerminalSettings} className="gap-2">
              <Save className="h-4 w-4" />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Screen Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="screenTimeout">Screen Timeout (minutes)</Label>
              <Input
                id="screenTimeout"
                type="number"
                min="1"
                max="60"
                value={displaySettings.screenTimeout}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, screenTimeout: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brightness">Brightness (%)</Label>
              <Input
                id="brightness"
                type="number"
                min="10"
                max="100"
                value={displaySettings.brightness}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Customer Display</Label>
                <p className="text-sm text-muted-foreground">Enable customer-facing display</p>
              </div>
              <Switch
                checked={displaySettings.showCustomerDisplay}
                onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, showCustomerDisplay: checked }))}
              />
            </div>

            {displaySettings.showCustomerDisplay && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="customerDisplayMessage">Customer Display Message</Label>
                <Input
                  id="customerDisplayMessage"
                  value={displaySettings.customerDisplayMessage}
                  onChange={(e) => setDisplaySettings(prev => ({ ...prev, customerDisplayMessage: e.target.value }))}
                  placeholder="Welcome message"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Clock</Label>
                <p className="text-sm text-muted-foreground">Display current time</p>
              </div>
              <Switch
                checked={displaySettings.showClock}
                onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, showClock: checked }))}
              />
            </div>

            {displaySettings.showClock && (
              <div className="flex items-center justify-between ml-6">
                <Label>24-Hour Time Format</Label>
                <Switch
                  checked={displaySettings.show24HourTime}
                  onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, show24HourTime: checked }))}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveDisplaySettings} className="gap-2">
              <Save className="h-4 w-4" />
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
        <p className="text-sm text-muted-foreground">Core system configuration and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

            {systemSettings.autoBackup && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select 
                  value={systemSettings.backupFrequency} 
                  onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Logging</Label>
                <p className="text-sm text-muted-foreground">Log system events and errors</p>
              </div>
              <Switch
                checked={systemSettings.enableLogging}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableLogging: checked }))}
              />
            </div>

            {systemSettings.enableLogging && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select 
                    value={systemSettings.logLevel} 
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, logLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error Only</SelectItem>
                      <SelectItem value="warning">Warning & Error</SelectItem>
                      <SelectItem value="info">Info, Warning & Error</SelectItem>
                      <SelectItem value="debug">All (Debug Mode)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLogSize">Max Log Size (MB)</Label>
                  <Input
                    id="maxLogSize"
                    type="number"
                    min="10"
                    max="1000"
                    value={systemSettings.maxLogSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLogSize: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Auto Updates</Label>
                <p className="text-sm text-muted-foreground">Automatically install updates</p>
              </div>
              <Switch
                checked={systemSettings.enableUpdates}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableUpdates: checked }))}
              />
            </div>

            {systemSettings.enableUpdates && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="updateChannel">Update Channel</Label>
                <Select 
                  value={systemSettings.updateChannel} 
                  onValueChange={(value) => setSystemSettings(prev => ({ ...prev, updateChannel: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="alpha">Alpha (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSystemSettings} className="gap-2">
              <Save className="h-4 w-4" />
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
        <p className="text-sm text-muted-foreground">Configure automated email notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Receipt Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Receipt Emails</Label>
            <Switch
              checked={emailTemplates.receiptEmail.enabled}
              onCheckedChange={(checked) => setEmailTemplates(prev => ({
                ...prev,
                receiptEmail: { ...prev.receiptEmail, enabled: checked }
              }))}
            />
          </div>

          {emailTemplates.receiptEmail.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptSubject">Email Subject</Label>
                <Input
                  id="receiptSubject"
                  value={emailTemplates.receiptEmail.subject}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    receiptEmail: { ...prev.receiptEmail, subject: e.target.value }
                  }))}
                  placeholder="Email subject line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptTemplate">Email Template</Label>
                <Textarea
                  id="receiptTemplate"
                  value={emailTemplates.receiptEmail.template}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    receiptEmail: { ...prev.receiptEmail, template: e.target.value }
                  }))}
                  rows={6}
                  placeholder="Email template content"
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {'{business_name}'}, {'{customer_name}'}, {'{total_amount}'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Low Stock Alerts</Label>
            <Switch
              checked={emailTemplates.lowStockAlert.enabled}
              onCheckedChange={(checked) => setEmailTemplates(prev => ({
                ...prev,
                lowStockAlert: { ...prev.lowStockAlert, enabled: checked }
              }))}
            />
          </div>

          {emailTemplates.lowStockAlert.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lowStockSubject">Email Subject</Label>
                <Input
                  id="lowStockSubject"
                  value={emailTemplates.lowStockAlert.subject}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    lowStockAlert: { ...prev.lowStockAlert, subject: e.target.value }
                  }))}
                  placeholder="Low stock alert subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockTemplate">Email Template</Label>
                <Textarea
                  id="lowStockTemplate"
                  value={emailTemplates.lowStockAlert.template}
                  onChange={(e) => setEmailTemplates(prev => ({
                    ...prev,
                    lowStockAlert: { ...prev.lowStockAlert, template: e.target.value }
                  }))}
                  rows={4}
                  placeholder="Low stock alert template"
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {'{product_name}'}, {'{current_stock}'}, {'{min_stock}'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveEmailTemplates} className="gap-2">
          <Save className="h-4 w-4" />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">Enable scheduled backups</p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>

            {systemSettings.autoBackup && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select 
                  value={systemSettings.backupFrequency} 
                  onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                >
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
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Manual Backup</h4>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Create Backup Now
              </Button>
              <Button variant="outline" className="gap-2">
                <SettingsUpload className="h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSystemSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Backup Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReceiptPrinter = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Receipt Printer</h3>
        <p className="text-sm text-muted-foreground">Configure receipt printer settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Receipt Printer</Label>
              <p className="text-sm text-muted-foreground">Enable automatic receipt printing</p>
            </div>
            <Switch
              checked={hardwareSettings.receiptPrinter.enabled}
              onCheckedChange={(checked) => setHardwareSettings(prev => ({
                ...prev,
                receiptPrinter: { ...prev.receiptPrinter, enabled: checked }
              }))}
            />
          </div>

          {hardwareSettings.receiptPrinter.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printerName">Printer Name</Label>
                <Input
                  id="printerName"
                  value={hardwareSettings.receiptPrinter.printerName}
                  onChange={(e) => setHardwareSettings(prev => ({
                    ...prev,
                    receiptPrinter: { ...prev.receiptPrinter, printerName: e.target.value }
                  }))}
                  placeholder="Printer name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paperWidth">Paper Width (mm)</Label>
                  <Select 
                    value={hardwareSettings.receiptPrinter.paperWidth.toString()} 
                    onValueChange={(value) => setHardwareSettings(prev => ({
                      ...prev,
                      receiptPrinter: { ...prev.receiptPrinter, paperWidth: parseInt(value) }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58">58mm</SelectItem>
                      <SelectItem value="80">80mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="charactersPerLine">Characters Per Line</Label>
                  <Input
                    id="charactersPerLine"
                    type="number"
                    min="20"
                    max="50"
                    value={hardwareSettings.receiptPrinter.charactersPerLine}
                    onChange={(e) => setHardwareSettings(prev => ({
                      ...prev,
                      receiptPrinter: { ...prev.receiptPrinter, charactersPerLine: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto Cut Paper</Label>
                <Switch
                  checked={hardwareSettings.receiptPrinter.cutPaper}
                  onCheckedChange={(checked) => setHardwareSettings(prev => ({
                    ...prev,
                    receiptPrinter: { ...prev.receiptPrinter, cutPaper: checked }
                  }))}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveHardwareSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Printer Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBarcodeScanner = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Barcode Scanner</h3>
        <p className="text-sm text-muted-foreground">Configure barcode scanner settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Barcode Scanner</Label>
              <p className="text-sm text-muted-foreground">Enable barcode scanning functionality</p>
            </div>
            <Switch
              checked={hardwareSettings.barcodeScanner.enabled}
              onCheckedChange={(checked) => setHardwareSettings(prev => ({
                ...prev,
                barcodeScanner: { ...prev.barcodeScanner, enabled: checked }
              }))}
            />
          </div>

          {hardwareSettings.barcodeScanner.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scannerType">Scanner Type</Label>
                <Select 
                  value={hardwareSettings.barcodeScanner.scannerType} 
                  onValueChange={(value) => setHardwareSettings(prev => ({
                    ...prev,
                    barcodeScanner: { ...prev.barcodeScanner, scannerType: value }
                  }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usb">USB Scanner</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth Scanner</SelectItem>
                    <SelectItem value="camera">Camera Scanner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Enter After Scan</Label>
                  <p className="text-sm text-muted-foreground">Automatically press Enter after scanning</p>
                </div>
                <Switch
                  checked={hardwareSettings.barcodeScanner.autoEnter}
                  onCheckedChange={(checked) => setHardwareSettings(prev => ({
                    ...prev,
                    barcodeScanner: { ...prev.barcodeScanner, autoEnter: checked }
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scanPrefix">Scan Prefix</Label>
                  <Input
                    id="scanPrefix"
                    value={hardwareSettings.barcodeScanner.scanPrefix}
                    onChange={(e) => setHardwareSettings(prev => ({
                      ...prev,
                      barcodeScanner: { ...prev.barcodeScanner, scanPrefix: e.target.value }
                    }))}
                    placeholder="Optional prefix"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scanSuffix">Scan Suffix</Label>
                  <Input
                    id="scanSuffix"
                    value={hardwareSettings.barcodeScanner.scanSuffix}
                    onChange={(e) => setHardwareSettings(prev => ({
                      ...prev,
                      barcodeScanner: { ...prev.barcodeScanner, scanSuffix: e.target.value }
                    }))}
                    placeholder="Optional suffix"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveHardwareSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Scanner Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCashDrawer = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Cash Drawer</h3>
        <p className="text-sm text-muted-foreground">Configure cash drawer behavior</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Cash Drawer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Cash Drawer</Label>
              <p className="text-sm text-muted-foreground">Enable cash drawer functionality</p>
            </div>
            <Switch
              checked={hardwareSettings.cashDrawer.enabled}
              onCheckedChange={(checked) => setHardwareSettings(prev => ({
                ...prev,
                cashDrawer: { ...prev.cashDrawer, enabled: checked }
              }))}
            />
          </div>

          {hardwareSettings.cashDrawer.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Open on Sale</Label>
                  <p className="text-sm text-muted-foreground">Open drawer when sale is completed</p>
                </div>
                <Switch
                  checked={hardwareSettings.cashDrawer.openOnSale}
                  onCheckedChange={(checked) => setHardwareSettings(prev => ({
                    ...prev,
                    cashDrawer: { ...prev.cashDrawer, openOnSale: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Open on Refund</Label>
                  <p className="text-sm text-muted-foreground">Open drawer when processing refunds</p>
                </div>
                <Switch
                  checked={hardwareSettings.cashDrawer.openOnRefund}
                  onCheckedChange={(checked) => setHardwareSettings(prev => ({
                    ...prev,
                    cashDrawer: { ...prev.cashDrawer, openOnRefund: checked }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kickCode">Kick Code</Label>
                <Input
                  id="kickCode"
                  value={hardwareSettings.cashDrawer.kickCode}
                  onChange={(e) => setHardwareSettings(prev => ({
                    ...prev,
                    cashDrawer: { ...prev.cashDrawer, kickCode: e.target.value }
                  }))}
                  placeholder="ESC/POS kick code"
                />
                <p className="text-xs text-muted-foreground">
                  ESC/POS command to open cash drawer (default: 27,112,0,25,250)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveHardwareSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Cash Drawer Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInvoiceTemplates = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Invoice Templates</h3>
        <p className="text-sm text-muted-foreground">Customize invoice layouts and branding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultTemplate">Default Template</Label>
            <Select 
              value={invoiceTemplates.defaultTemplate} 
              onValueChange={(value) => setInvoiceTemplates(prev => ({ ...prev, defaultTemplate: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Display Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Logo</Label>
                  <Switch
                    checked={invoiceTemplates.showLogo}
                    onCheckedChange={(checked) => setInvoiceTemplates(prev => ({ ...prev, showLogo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Business Info</Label>
                  <Switch
                    checked={invoiceTemplates.showBusinessInfo}
                    onCheckedChange={(checked) => setInvoiceTemplates(prev => ({ ...prev, showBusinessInfo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Customer Info</Label>
                  <Switch
                    checked={invoiceTemplates.showCustomerInfo}
                    onCheckedChange={(checked) => setInvoiceTemplates(prev => ({ ...prev, showCustomerInfo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Item Details</Label>
                  <Switch
                    checked={invoiceTemplates.showItemDetails}
                    onCheckedChange={(checked) => setInvoiceTemplates(prev => ({ ...prev, showItemDetails: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Tax Breakdown</Label>
                  <Switch
                    checked={invoiceTemplates.showTaxBreakdown}
                    onCheckedChange={(checked) => setInvoiceTemplates(prev => ({ ...prev, showTaxBreakdown: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Template Colors</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={invoiceTemplates.colors.primary}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={invoiceTemplates.colors.primary}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={invoiceTemplates.colors.secondary}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={invoiceTemplates.colors.secondary}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={invoiceTemplates.colors.accent}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={invoiceTemplates.colors.accent}
                      onChange={(e) => setInvoiceTemplates(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={invoiceTemplates.footerText}
                onChange={(e) => setInvoiceTemplates(prev => ({ ...prev, footerText: e.target.value }))}
                placeholder="Thank you for your business!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                value={invoiceTemplates.termsAndConditions}
                onChange={(e) => setInvoiceTemplates(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                placeholder="Payment terms and conditions"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveInvoiceTemplates} className="gap-2">
              <Save className="h-4 w-4" />
              Save Invoice Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure notification preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Alert Types</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when items are low in stock</p>
              </div>
              <Switch
                checked={notificationSettings.lowStockAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sales Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about sales milestones</p>
              </div>
              <Switch
                checked={notificationSettings.salesAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, salesAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>System Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about system events</p>
              </div>
              <Switch
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
              </div>
              <Switch
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotificationSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Theme & Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize the look and feel of your application</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={appSettings.theme} 
              onValueChange={(value) => setAppSettings(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={appSettings.language} 
                onValueChange={(value) => setAppSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={appSettings.currency} 
                onValueChange={(value) => setAppSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                  <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={appSettings.dateFormat} 
                onValueChange={(value) => setAppSettings(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select 
                value={appSettings.timeFormat} 
                onValueChange={(value) => setAppSettings(prev => ({ ...prev, timeFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberFormat">Number Format</Label>
              <Select 
                value={appSettings.numberFormat} 
                onValueChange={(value) => setAppSettings(prev => ({ ...prev, numberFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">US (1,234.56)</SelectItem>
                  <SelectItem value="EU">EU (1.234,56)</SelectItem>
                  <SelectItem value="IN">IN (1,23,456.78)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save changes</p>
              </div>
              <Switch
                checked={appSettings.autoSave}
                onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, autoSave: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Confirm Before Delete</Label>
                <p className="text-sm text-muted-foreground">Show confirmation dialog before deleting</p>
              </div>
              <Switch
                checked={appSettings.confirmBeforeDelete}
                onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, confirmBeforeDelete: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Tooltips</Label>
                <p className="text-sm text-muted-foreground">Display helpful tooltips</p>
              </div>
              <Switch
                checked={appSettings.showTooltips}
                onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, showTooltips: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveAppSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Theme Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityGeneral = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">General Security</h3>
        <p className="text-sm text-muted-foreground">Configure security policies and password requirements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Strong Passwords</Label>
                <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPasswords}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="6"
                max="32"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Enable 2FA for all users</p>
              </div>
              <Switch
                checked={securitySettings.requireTwoFactor}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Login Security</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                min="5"
                max="60"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                className="w-32"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Data Security</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Log all user actions for security</p>
              </div>
              <Switch
                checked={securitySettings.auditLogging}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Encrypt Sensitive Data</Label>
                <p className="text-sm text-muted-foreground">Encrypt customer and payment data</p>
              </div>
              <Switch
                checked={securitySettings.encryptData}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, encryptData: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSecuritySettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSessionManagement = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Session Management</h3>
        <p className="text-sm text-muted-foreground">Configure user session behavior</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Session Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
              <Input
                id="maxConcurrentSessions"
                type="number"
                min="1"
                max="10"
                value={sessionSettings.maxConcurrentSessions}
                onChange={(e) => setSessionSettings(prev => ({ ...prev, maxConcurrentSessions: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionWarningTime">Session Warning (minutes)</Label>
              <Input
                id="sessionWarningTime"
                type="number"
                min="1"
                max="30"
                value={sessionSettings.sessionWarningTime}
                onChange={(e) => setSessionSettings(prev => ({ ...prev, sessionWarningTime: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Remember Me Option</Label>
                <p className="text-sm text-muted-foreground">Allow users to stay logged in</p>
              </div>
              <Switch
                checked={sessionSettings.rememberMe}
                onCheckedChange={(checked) => setSessionSettings(prev => ({ ...prev, rememberMe: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Logout</Label>
                <p className="text-sm text-muted-foreground">Automatically logout inactive users</p>
              </div>
              <Switch
                checked={sessionSettings.autoLogout}
                onCheckedChange={(checked) => setSessionSettings(prev => ({ ...prev, autoLogout: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Logout Warning</Label>
                <p className="text-sm text-muted-foreground">Warn users before auto logout</p>
              </div>
              <Switch
                checked={sessionSettings.logoutWarning}
                onCheckedChange={(checked) => setSessionSettings(prev => ({ ...prev, logoutWarning: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSessionSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Session Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Audit & Logging</h3>
        <p className="text-sm text-muted-foreground">Configure audit trails and system logging</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Audit Log</Label>
                <p className="text-sm text-muted-foreground">Track all system activities</p>
              </div>
              <Switch
                checked={auditSettings.enableAuditLog}
                onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, enableAuditLog: checked }))}
              />
            </div>

            {auditSettings.enableAuditLog && (
              <div className="space-y-4 ml-6">
                <div className="flex items-center justify-between">
                  <Label>Log User Actions</Label>
                  <Switch
                    checked={auditSettings.logUserActions}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, logUserActions: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log System Events</Label>
                  <Switch
                    checked={auditSettings.logSystemEvents}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, logSystemEvents: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Log Data Changes</Label>
                  <Switch
                    checked={auditSettings.logDataChanges}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, logDataChanges: checked }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
              <Input
                id="retentionPeriod"
                type="number"
                min="30"
                max="365"
                value={auditSettings.retentionPeriod}
                onChange={(e) => setAuditSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select 
                value={auditSettings.exportFormat} 
                onValueChange={(value) => setAuditSettings(prev => ({ ...prev, exportFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveAuditSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Audit Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemUsers = () => (
    <div className="space-y-6">
      <SystemUsersReferrals />
    </div>
  );

  const renderContent = () => {
    if (section === 'business') {
      switch (subsection) {
        case 'business-info':
          return renderBusinessInfo();
        case 'business-operating-hours':
          return renderOperatingHours();
        case 'business-locations':
          return renderLocations();
        case 'subscription':
          return renderSubscription();
        default:
          return renderBusinessInfo();
      }
    } else if (section === 'pos-terminal') {
      switch (subsection) {
        case 'receipt-settings':
          return renderReceiptSettings();
        case 'terminal-behavior':
          return renderTerminalBehavior();
        case 'display-settings':
          return renderDisplaySettings();
        default:
          return renderReceiptSettings();
      }
    } else if (section === 'system') {
      switch (subsection) {
        case 'general':
          return renderSystemGeneral();
        case 'email-templates':
          return renderEmailTemplates();
        case 'backup':
          return renderBackupSettings();
        default:
          return renderSystemGeneral();
      }
    } else if (section === 'hardware') {
      switch (subsection) {
        case 'receipt-printer':
          return renderReceiptPrinter();
        case 'barcode-scanner':
          return renderBarcodeScanner();
        case 'cash-drawer':
          return renderCashDrawer();
        default:
          return renderReceiptPrinter();
      }
    } else if (section === 'app') {
      switch (subsection) {
        case 'invoice-templates':
          return renderInvoiceTemplates();
        case 'notifications':
          return renderNotifications();
        case 'theme':
          return renderThemeSettings();
        default:
          return renderInvoiceTemplates();
      }
    } else if (section === 'security') {
      switch (subsection) {
        case 'general':
          return renderSecurityGeneral();
        case 'sessions':
          return renderSessionManagement();
        case 'audit':
          return renderAuditSettings();
        default:
          return renderSecurityGeneral();
      }
    } else if (section === 'users') {
      switch (subsection) {
        case 'system-users':
        case 'referral-codes':
          return renderSystemUsers();
        default:
          return renderSystemUsers();
      }
    }
    
    return renderBusinessInfo();
  };

  return (
    <div className="flex h-full bg-background dark:bg-black animate-fadeInUp">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card dark:bg-black p-6 overflow-y-auto settings-sidebar">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your system preferences</p>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
            <div className="space-y-4">
              {sidebarSections.map((sectionItem) => {
                const SectionIcon = sectionItem.icon;
                const isActive = section === sectionItem.id;
                
                return (
                  <div key={sectionItem.id} className="space-y-2">
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-auto p-3",
                        isActive && "bg-primary/10 text-primary border border-primary/20"
                      )}
                      onClick={() => handleSectionChange(sectionItem.id, sectionItem.subsections[0]?.id)}
                    >
                      <SectionIcon className="h-4 w-4" />
                      <span className="font-medium">{sectionItem.label}</span>
                      {isActive ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Button>
                    
                    {isActive && sectionItem.subsections && (
                      <div className="ml-6 space-y-1">
                        {sectionItem.subsections.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = subsection === sub.id;
                          
                          return (
                            <Button
                              key={sub.id}
                              variant={isSubActive ? "secondary" : "ghost"}
                              size="sm"
                              className={cn(
                                "w-full justify-start gap-2 h-auto p-2 text-sm",
                                isSubActive && "bg-secondary text-secondary-foreground"
                              )}
                              onClick={() => handleSubsectionChange(sub.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              {sub.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;