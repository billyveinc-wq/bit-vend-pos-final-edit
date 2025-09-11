import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentSettings from './PaymentSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { countries } from '@/data/countries';
import { showSaveToast, showUploadToast } from '@/components/SettingsToast';
import SystemUsersReferrals from '@/components/SystemUsersReferrals';
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  MapPin,
  Receipt,
  Monitor,
  Eye,
  Mail,
  Printer,
  QrCode,
  DollarSign,
  Palette,
  Bell,
  Shield,
  Users,
  Database,
  Save,
  Upload as SettingsUpload,
  X,
  Plus,
  Edit,
  Trash2,
  FileText,
  Crown,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { businesses, currentBusiness, addBusiness, updateBusiness, deleteBusiness } = useBusiness();
  const { subscription, canUseFeature } = useSubscription();
  const { isAdmin } = useAdminAuth();
  
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

  const uniqueCountries = useMemo(() => {
    const seen = new Set<string>();
    return countries.filter(c => { if (seen.has(c.code)) return false; seen.add(c.code); return true; });
  }, []);

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true }
  });

  const [locations, setLocations] = useState([
    { id: '1', code: 'MAIN', name: 'Main Store', manager: '', phone: '', email: '', address: '', city: '', state: '', postalCode: '', country: 'US', currency: 'USD', taxRegion: '', isActive: true, isMain: true, notes: '', companyId: 'unassigned' }
  ]);

  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const loadCompanies = async () => {
      let loaded: { id: string; name: string }[] = [];
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data, error } = await mod.supabase.from('companies').select('id, name').order('id');
        if (!error && data) {
          loaded = (data as any[]).map((c) => ({ id: String(c.id), name: c.name }));
        }
      } catch {
        // ignore network/auth errors; fall back to local
      }
      if (!loaded.length) {
        const local = localStorage.getItem('pos-companies');
        if (local) {
          try { loaded = JSON.parse(local); } catch {}
        }
      }
      if (!loaded.length) {
        loaded = [{ id: 'unassigned', name: 'Unassigned' }];
      }
      setCompanies(loaded);
    };
    loadCompanies();
  }, []);
  useEffect(() => {
    if (companies.length) localStorage.setItem('pos-companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    const loadLocations = async () => {
      let loaded: any[] = [];
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data, error } = await mod.supabase
          .from('locations')
          .select('id, code, name, manager, phone, email, address, city, state, postal_code, country, currency, tax_region, is_active, is_main, notes, company_id')
          .order('created_at');
        if (!error && data) {
          loaded = data.map((d: any) => ({
            id: String(d.id),
            code: d.code || '',
            name: d.name || '',
            manager: d.manager || '',
            phone: d.phone || '',
            email: d.email || '',
            address: d.address || '',
            city: d.city || '',
            state: d.state || '',
            postalCode: d.postal_code || '',
            country: d.country || 'US',
            currency: d.currency || 'USD',
            taxRegion: d.tax_region || '',
            isActive: d.is_active ?? true,
            isMain: d.is_main ?? false,
            notes: d.notes || '',
            companyId: d.company_id ? String(d.company_id) : 'unassigned',
          }));
        }
      } catch {}
      if (!loaded.length) {
        const local = localStorage.getItem('pos-locations');
        if (local) {
          try { loaded = JSON.parse(local); } catch {}
        }
      }
      if (loaded.length) setLocations(loaded);
    };
    loadLocations();
  }, []);

  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Load business data when editing
  useEffect(() => {
    if (editId && subsection === 'business-info') {
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
        setIsEditingBusiness(true);
      }
    } else if (mode === 'add' && subsection === 'business-info') {
      // Reset form for new business
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
      setIsEditingBusiness(true);
    } else {
      setIsEditingBusiness(false);
    }
  }, [editId, mode, subsection, businesses]);

  const handleSaveBusiness = async () => {
    if (!businessForm.businessName) {
      toast.error('Business name is required');
      return;
    }

    const businessData = {
      ...businessForm,
      operatingHours
    };

    // Persist to local context for UI responsiveness
    if (editId) {
      updateBusiness(editId, businessData);
    } else {
      addBusiness(businessData);
    }

    // Persist to Supabase companies (with extended columns)
    try {
      const mod = await import('@/integrations/supabase/client');
      const { data: existing } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
      const payload: any = {
        name: businessForm.businessName,
        plan_id: null,
        business_type: businessForm.businessType || null,
        tax_id: businessForm.taxId || null,
        business_license: businessForm.businessLicense || null,
        phone: businessForm.phone || null,
        email: businessForm.email || null,
        logo_url: businessForm.logoUrl || null,
        address: businessForm.address || null,
        city: businessForm.city || null,
        state: businessForm.state || null,
        postal_code: businessForm.postalCode || null,
        country: businessForm.country || null,
      };
      if (existing?.id) {
        await mod.supabase.from('companies').update(payload).eq('id', existing.id);
      } else {
        await mod.supabase.from('companies').insert(payload);
      }
      toast.success('Business saved');
    } catch (e) {
      // Non-blocking: DB may be unavailable
    }

    // Navigate back to business list
    setSearchParams({ section: 'business', subsection: 'business-info' });
    setIsEditingBusiness(false);
  };

  const handleDeleteBusiness = () => {
    if (!editId) return;
    
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      try {
        deleteBusiness(editId);
        toast.success('Business deleted successfully!');
        setSearchParams({ section: 'business', subsection: 'business-info' });
        setIsEditingBusiness(false);
      } catch (error) {
        toast.error('Cannot delete the last business');
      }
    }
  };

  const handleCancelEdit = () => {
    setSearchParams({ section: 'business', subsection: 'business-info' });
    setIsEditingBusiness(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBusinessForm(prev => ({ ...prev, logoUrl: result }));
        showUploadToast();
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSearchParams = (newSection: string, newSubsection?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('section', newSection);
    if (newSubsection) {
      params.set('subsection', newSubsection);
    }
    // Clear edit and mode params when navigating
    params.delete('edit');
    params.delete('mode');
    setSearchParams(params);
  };

  const sidebarItems = [
    {
      section: 'business',
      title: 'Business',
      icon: Building2,
      items: [
        { id: 'business-info', label: 'Business Information', icon: Building2 },
        { id: 'business-operating-hours', label: 'Operating Hours', icon: Clock },
        { id: 'business-locations', label: 'Locations & Branches', icon: MapPin },
        { id: 'subscription', label: 'Subscription & Billing', icon: Crown }
      ]
    },
    {
      section: 'pos-terminal',
      title: 'POS Terminal',
      icon: Receipt,
      items: [
        { id: 'receipt-settings', label: 'Receipt Settings', icon: Receipt },
        { id: 'terminal-behavior', label: 'Terminal Behavior', icon: Monitor },
        { id: 'display-settings', label: 'Display Settings', icon: Eye }
      ]
    },
    ...(isAdmin ? [{
      section: 'system',
      title: 'System',
      icon: SettingsIcon,
      items: [
        { id: 'payment-settings', label: 'Payment Settings', icon: CreditCard },
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'email-templates', label: 'Email Templates', icon: Mail },
        { id: 'backup', label: 'Backup', icon: Database }
      ]
    }] : []),
    {
      section: 'hardware',
      title: 'Hardware',
      icon: Printer,
      items: [
        { id: 'receipt-printer', label: 'Receipt Printer', icon: Printer },
        { id: 'barcode-scanner', label: 'Barcode Scanner', icon: QrCode },
        { id: 'cash-drawer', label: 'Cash Drawer', icon: DollarSign }
      ]
    },
    {
      section: 'app',
      title: 'App Settings',
      icon: Palette,
      items: [
        { id: 'invoice-templates', label: 'Invoice Templates', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme', icon: Palette }
      ]
    },
    ...(isAdmin ? [{
      section: 'security',
      title: 'Security',
      icon: Shield,
      items: [
        { id: 'general', label: 'Security Settings', icon: Shield },
        { id: 'sessions', label: 'Session Management', icon: Clock },
        { id: 'audit', label: 'Audit & Logs', icon: FileText }
      ]
    }] : []),
    ...(isAdmin ? [{
      section: 'users',
      title: 'Users & Referrals',
      icon: Users,
      items: [
        { id: 'management', label: 'User Management', icon: Users }
      ]
    }] : [])
  ];

  const renderBusinessInfo = () => {
    if (isEditingBusiness) {
      const editingBusiness = editId ? businesses.find(b => b.id === editId) : null;
      const isInactive = editingBusiness && !editingBusiness.isActive;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editId ? 'Edit Business' : 'Add New Business'}</span>
              <div className="flex gap-2">
                {editId && isInactive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteBusiness}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Business
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                  {businessForm.logoUrl ? (
                    <img src={businessForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <SettingsUpload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mb-2 h-9 w-auto max-w-xs text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground"
                  />
                  {businessForm.logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBusinessForm(prev => ({ ...prev, logoUrl: '' }))}
                      className="gap-1"
                    >
                      <X size={14} />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select value={businessForm.businessType} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, businessType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="grocery">Grocery</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessForm.email}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
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

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={businessForm.state}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={businessForm.postalCode}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={businessForm.country} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto">
                    {uniqueCountries.map((country) => (
                      <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveBusiness} className="bg-save hover:bg-save-hover text-save-foreground">
                <Save className="h-4 w-4 mr-2" />
                Save Business
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Business list view
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Business Information</h2>
          <Button 
            onClick={() => setSearchParams({ section: 'business', subsection: 'business-info', mode: 'add' })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Business
          </Button>
        </div>
        
        <div className="grid gap-4">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {business.logoUrl ? (
                        <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{business.businessName}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{business.businessType}</p>
                      <p className="text-sm text-muted-foreground">{business.email}</p>
                      <p className="text-sm text-muted-foreground">{business.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentBusiness?.id === business.id && (
                      <Badge variant="default">Current</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchParams({ section: 'business', subsection: 'business-info', edit: business.id })}
                      className="gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
                {business.address && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {business.address}, {business.city}, {business.state} {business.postalCode}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // POS Terminal settings state
  const [receiptSettings, setReceiptSettings] = useState({
    template: 'classic',
    showTax: true,
    showTotals: true,
    paperSize: '80mm',
    showCustomerInfo: true,
    showBarcode: false,
    showQRCode: false,
    includeCashierName: true,
    includeRegisterId: true,
    showChangeDue: true,
    businessHeader: '',
    businessFooter: ''
  });
  const [terminalBehavior, setTerminalBehavior] = useState({
    autoPrint: false,
    playSoundOnAdd: true,
    promptForReceipt: true,
    quickCashDenoms: '50,100,200,500,1000',
    requireManagerOverrideThreshold: 20,
    allowPriceEdit: true,
    allowNegativeStock: false,
    roundToNearest: 1
  });
  const [displaySettings, setDisplaySettings] = useState({
    fontScale: 100,
    compactMode: false,
    kioskMode: false,
    showCustomerDisplay: false,
    numberPadPosition: 'right',
    highContrast: false
  });

  // System settings state
  const [systemGeneral, setSystemGeneral] = useState({
    appName: 'Bit Vend POS',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    currency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: '1,234.56',
    taxMode: 'exclusive',
    fiscalYearStartMonth: 'January'
  });
  const [emailTemplates, setEmailTemplates] = useState([
    { id: 'order-confirmation', name: 'Order Confirmation', subject: 'Your order has been received', body: 'Thank you for your order.' },
    { id: 'low-stock', name: 'Low Stock Alert', subject: 'Product low stock', body: 'A product is running low on stock.' },
  ]);

  // Hardware settings state
  const [printerSettings, setPrinterSettings] = useState({
    paperWidth: 80,
    printLogo: true,
    connectionType: 'usb',
    deviceName: '',
    ipAddress: '',
    cutPaper: true,
    kickDrawerAfterPrint: true,
    printDensity: 100
  });
  const [barcodeSettings, setBarcodeSettings] = useState({
    testInput: '',
    scannerType: 'keyboard_wedge',
    prefix: '',
    suffix: '',
    autoSubmit: true
  });
  const [cashDrawerSettings, setCashDrawerSettings] = useState({
    openCode: '27,112,0,25,250',
    openOn: 'cash_only',
    port: '',
    pulseOnOpen: true
  });

  // App settings state
  const [invoiceTemplates, setInvoiceTemplates] = useState({
    style: 'standard',
    headerLogoUrl: '',
    terms: ''
  });
  const [notifications, setNotifications] = useState({
    salesSummaryEmail: true,
    lowStockPush: true,
    smsAlerts: false,
    inAppAlerts: true
  });
  const [appTheme, setAppTheme] = useState({
    theme: localStorage.getItem('pos-theme') === 'dark' ? 'dark' : 'light',
    accentColor: localStorage.getItem('pos-accent-color') || '#3b82f6'
  });

  // Security settings state
  const [securityGeneral, setSecurityGeneral] = useState({
    requireStrongPasswords: true,
    twoFactorAuth: false,
    minPasswordLength: 8,
    lockoutAfterFailedAttempts: 5,
    sessionTimeoutMinutes: 60,
    restrictByIP: false,
    allowedIPs: '',
    requireDevicePIN: false
  });
  const [auditLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('pos-audit-log');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist helpers
  const saveLocal = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));
  const saveAppSetting = async (key: string, value: any) => {
    try {
      const mod = await import('@/integrations/supabase/client');
      const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
      if (comp?.id) {
        await mod.supabase.from('app_settings').upsert({ company_id: comp.id, key, value }, { onConflict: 'company_id,key' });
      }
    } catch {}
  };

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const mod = await import('@/integrations/supabase/client');
        const { data: comp } = await mod.supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        const companyId = comp?.id;
        if (!companyId) return;
        const keys = ['receipt_settings','terminal_behavior','display_settings','system_general','printer_settings','barcode_settings','cash_drawer','invoice_templates','notifications','app_theme','security'];
        const { data } = await mod.supabase.from('app_settings').select('key, value').eq('company_id', companyId).in('key', keys);
        const map = new Map((data || []).map((r: any) => [r.key, r.value]));
        if (map.has('receipt_settings')) setReceiptSettings((p)=>({ ...p, ...(map.get('receipt_settings')||{}) }));
        if (map.has('terminal_behavior')) setTerminalBehavior((p)=>({ ...p, ...(map.get('terminal_behavior')||{}) }));
        if (map.has('display_settings')) setDisplaySettings((p)=>({ ...p, ...(map.get('display_settings')||{}) }));
        if (map.has('system_general')) setSystemGeneral((p)=>({ ...p, ...(map.get('system_general')||{}) }));
        if (map.has('printer_settings')) setPrinterSettings((p)=>({ ...p, ...(map.get('printer_settings')||{}) }));
        if (map.has('barcode_settings')) setBarcodeSettings((p)=>({ ...p, ...(map.get('barcode_settings')||{}) }));
        if (map.has('cash_drawer')) setCashDrawerSettings((p)=>({ ...p, ...(map.get('cash_drawer')||{}) }));
        if (map.has('invoice_templates')) setInvoiceTemplates((p)=>({ ...p, ...(map.get('invoice_templates')||{}) }));
        if (map.has('notifications')) setNotifications((p)=>({ ...p, ...(map.get('notifications')||{}) }));
        if (map.has('app_theme')) setAppTheme((p)=>({ ...p, ...(map.get('app_theme')||{}) } as any));
        if (map.has('security')) setSecurityGeneral((p)=>({ ...p, ...(map.get('security')||{}) }));
      } catch {}
    };
    loadAllSettings();
  }, []);

  const renderContent = () => {
    if (section === 'system' && subsection === 'payment-settings') {
      return <PaymentSettings />;
    }
    if (section === 'business') {
      switch (subsection) {
        case 'business-info':
          return renderBusinessInfo();
        case 'business-operating-hours':
          return (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Locations & Branches</CardTitle>
                  <Button
                    onClick={() => {
                      const newLocation = {
                        id: Date.now().toString(),
                        name: `Location ${locations.length + 1}`,
                        address: '',
                        isActive: true
                      };
                      setLocations(prev => [...prev, newLocation]);
                      toast.success('New location added');
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) =>
                        setOperatingHours(prev => ({
                          ...prev,
                          [day]: { ...prev[day], closed: !checked }
                        }))
                      }
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setOperatingHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], open: e.target.value }
                            }))
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setOperatingHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], close: e.target.value }
                            }))
                          }
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </div>
                ))}
                {locations.map((location, index) => (
                  <div key={location.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Location Name</Label>
                        <Input
                          value={location.name}
                          onChange={(e) => {
                            const newLocations = [...locations];
                            newLocations[index] = { ...location, name: e.target.value };
                            setLocations(newLocations);
                          }}
                          placeholder="Location name"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={location.address}
                          onChange={(e) => {
                            const newLocations = [...locations];
                            newLocations[index] = { ...location, address: e.target.value };
                            setLocations(newLocations);
                          }}
                          placeholder="Location address"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={location.isActive}
                        onCheckedChange={(checked) => {
                          const newLocations = [...locations];
                          newLocations[index] = { ...location, isActive: checked };
                          setLocations(newLocations);
                        }}
                      />
                      <Label>Active</Label>
                      {locations.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try { const mod = await import('@/integrations/supabase/client'); await mod.supabase.from('locations').delete().eq('id', location.id); } catch {}
                            setLocations(prev => prev.filter(l => l.id !== location.id));
                            toast.success('Location removed');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button onClick={async () => { try { const mod = await import('@/integrations/supabase/client'); await mod.supabase.from('locations').upsert(locations.map(l=>({ id:l.id, code:(l as any).code || null, name:l.name, manager:(l as any).manager || null, phone:(l as any).phone || null, email:(l as any).email || null, address:l.address, city:(l as any).city || null, state:(l as any).state || null, postal_code:(l as any).postalCode || null, country:(l as any).country || null, currency:(l as any).currency || null, tax_region:(l as any).taxRegion || null, is_active:l.isActive, is_main:(l as any).isMain || false, notes:(l as any).notes || null, company_id: (l as any).companyId && (l as any).companyId !== 'unassigned' ? Number((l as any).companyId) : null })), { onConflict: 'id' }); } catch {} saveLocal('pos-locations', locations); showSaveToast(); }} className="bg-save hover:bg-save-hover text-save-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Locations
                </Button>
              </CardContent>
            </Card>
          );
        case 'business-locations':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Locations & Branches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Create and manage your store locations/branches. Mark your primary branch, set contact details, and choose currency/tax region per branch.</p>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => {
                      const newLoc = { id: Date.now().toString(), code: '', name: '', manager: '', phone: '', email: '', address: '', city: '', state: '', postalCode: '', country: 'US', currency: 'USD', taxRegion: '', isActive: true, isMain: false, notes: '', companyId: companies[0]?.id || 'unassigned' };
                      setLocations(prev => [...prev, newLoc]);
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Branch
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => { try { const mod = await import('@/integrations/supabase/client'); await mod.supabase.from('locations').upsert(locations.map(l=>({ id:l.id, code:l.code, name:l.name, manager:l.manager, phone:l.phone, email:l.email, address:l.address, city:l.city, state:l.state, postal_code:l.postalCode, country:l.country, currency:l.currency, tax_region:l.taxRegion, is_active:l.isActive, is_main:l.isMain, notes:l.notes, company_id: l.companyId && l.companyId !== 'unassigned' ? Number(l.companyId) : null })), { onConflict: 'id' }); } catch {} saveLocal('pos-locations', locations); showSaveToast(); }}>Save Branches</Button>
                </div>

                {locations.map((loc, index) => (
                  <div key={loc.id} className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Branch Code</Label>
                        <Input value={loc.code} onChange={(e)=>{
                          const next=[...locations]; next[index]={...loc, code:e.target.value}; setLocations(next);
                        }} placeholder="e.g., MAIN" />
                      </div>
                      <div>
                        <Label>Branch Name</Label>
                        <Input value={loc.name} onChange={(e)=>{
                          const next=[...locations]; next[index]={...loc, name:e.target.value}; setLocations(next);
                        }} placeholder="Main Store" />
                      </div>
                      <div className="flex items-center gap-2 mt-6 md:mt-0">
                        <Switch checked={!!loc.isMain} onCheckedChange={(c)=>{
                          const next=locations.map(l=>({ ...l, isMain: false }));
                          next[index].isMain=c; setLocations(next as any);
                        }} />
                        <Label>Primary Branch</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Company</Label>
                        <Select value={loc.companyId || 'unassigned'} onValueChange={(v)=>{ const next=[...locations]; next[index]={...loc, companyId:v}; setLocations(next); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                          <SelectContent>
                            {(companies.length ? companies : [{ id: 'unassigned', name: 'Unassigned' }]).map((c)=> (
                              <SelectItem key={c.id} value={c.id}>{c.name || 'Unassigned'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Manager</Label>
                        <Input value={loc.manager} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, manager:e.target.value}; setLocations(next); }} placeholder="Manager name" />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={loc.phone} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, phone:e.target.value}; setLocations(next); }} placeholder="+1 555 000 000" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={loc.email} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, email:e.target.value}; setLocations(next); }} placeholder="store@example.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Address</Label>
                        <Input value={loc.address} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, address:e.target.value}; setLocations(next); }} placeholder="123 Main St" />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input value={loc.city} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, city:e.target.value}; setLocations(next); }} placeholder="New York" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input value={loc.state} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, state:e.target.value}; setLocations(next); }} placeholder="NY" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Postal Code</Label>
                        <Input value={loc.postalCode} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, postalCode:e.target.value}; setLocations(next); }} placeholder="10001" />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Select value={loc.country} onValueChange={(v)=>{ const next=[...locations]; next[index]={...loc, country:v}; setLocations(next); }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueCountries.map((c)=>(<SelectItem key={`${c.code}-${c.name}`} value={c.code}>{c.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={!!loc.isActive} onCheckedChange={(c)=>{ const next=[...locations]; next[index]={...loc, isActive:c}; setLocations(next); }} />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Input value={loc.currency} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, currency:e.target.value}; setLocations(next); }} placeholder="USD" />
                      </div>
                      <div>
                        <Label>Tax Region</Label>
                        <Input value={loc.taxRegion} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, taxRegion:e.target.value}; setLocations(next); }} placeholder="e.g., NY-State" />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input value={loc.notes} onChange={(e)=>{ const next=[...locations]; next[index]={...loc, notes:e.target.value}; setLocations(next); }} placeholder="Internal notes" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={async ()=>{
                        try { const mod = await import('@/integrations/supabase/client'); await mod.supabase.from('locations').delete().eq('id', loc.id); } catch {}
                        setLocations(prev => prev.filter(l => l.id !== loc.id));
                        toast.success('Branch removed');
                      }}>Remove</Button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-locations', locations); showSaveToast(); }} className="bg-save hover:bg-save-hover text-save-foreground">
                    <Save className="h-4 w-4 mr-2" />
                    Save Branches
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'subscription':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Manage Your Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage your subscription plan, billing, and payment methods
                  </p>
                  <Button onClick={() => navigate('/dashboard/subscription')}>
                    Go to Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        default:
          return <div>Business settings content for {subsection}</div>;
      }
    }

    if (section === 'pos-terminal') {
      switch (subsection) {
        case 'receipt-settings':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Template</Label>
                    <Select value={receiptSettings.template} onValueChange={(v) => setReceiptSettings(prev => ({ ...prev, template: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <Switch checked={receiptSettings.showTax} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showTax:c}))} />
                    <Label>Show Tax</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={receiptSettings.showTotals} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showTotals:c}))} />
                    <Label>Show Totals</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Paper Size</Label>
                    <Select value={receiptSettings.paperSize} onValueChange={(v)=>setReceiptSettings(p=>({...p, paperSize:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm</SelectItem>
                        <SelectItem value="80mm">80mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <Switch checked={receiptSettings.showCustomerInfo} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showCustomerInfo:c}))} />
                    <Label>Show Customer Info</Label>
                  </div>
                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <Switch checked={receiptSettings.showChangeDue} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showChangeDue:c}))} />
                    <Label>Show Change Due</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={receiptSettings.showBarcode} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showBarcode:c}))} />
                    <Label>Show Barcode</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={receiptSettings.showQRCode} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, showQRCode:c}))} />
                    <Label>Show QR Code</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={receiptSettings.includeCashierName} onCheckedChange={(c)=>setReceiptSettings(p=>({...p, includeCashierName:c}))} />
                    <Label>Include Cashier Name</Label>
                  </div>
                </div>
                <div>
                  <Label>Header Text</Label>
                  <Textarea value={receiptSettings.businessHeader} onChange={(e)=>setReceiptSettings(p=>({...p, businessHeader:e.target.value}))} placeholder="Store name, address, VAT" />
                </div>
                <div>
                  <Label>Footer Text</Label>
                  <Textarea value={receiptSettings.businessFooter} onChange={(e)=>setReceiptSettings(p=>({...p, businessFooter:e.target.value}))} placeholder="Thank you for shopping!" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('receipt_settings', receiptSettings); saveLocal('pos-receipt-settings', receiptSettings); showSaveToast(); }}>Save</Button>
                  <Button variant="outline" onClick={()=>window.print()}>Test Print</Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'terminal-behavior':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Terminal Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={terminalBehavior.autoPrint} onCheckedChange={(c)=>setTerminalBehavior(p=>({...p, autoPrint:c}))} />
                  <Label>Auto-print after checkout</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={terminalBehavior.playSoundOnAdd} onCheckedChange={(c)=>setTerminalBehavior(p=>({...p, playSoundOnAdd:c}))} />
                  <Label>Play sound when item added</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={terminalBehavior.promptForReceipt} onCheckedChange={(c)=>setTerminalBehavior(p=>({...p, promptForReceipt:c}))} />
                  <Label>Prompt for receipt option</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Quick Cash Denominations (comma-separated)</Label>
                    <Input value={terminalBehavior.quickCashDenoms} onChange={(e)=>setTerminalBehavior(p=>({...p, quickCashDenoms:e.target.value}))} placeholder="50,100,200,500,1000" />
                  </div>
                  <div>
                    <Label>Manager Override Threshold (%)</Label>
                    <Input type="number" value={terminalBehavior.requireManagerOverrideThreshold} onChange={(e)=>setTerminalBehavior(p=>({...p, requireManagerOverrideThreshold:Number(e.target.value||0)}))} />
                  </div>
                  <div>
                    <Label>Round To Nearest</Label>
                    <Select value={String(terminalBehavior.roundToNearest)} onValueChange={(v)=>setTerminalBehavior(p=>({...p, roundToNearest:Number(v)}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.01">0.01</SelectItem>
                        <SelectItem value="0.05">0.05</SelectItem>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={terminalBehavior.allowPriceEdit} onCheckedChange={(c)=>setTerminalBehavior(p=>({...p, allowPriceEdit:c}))} />
                    <Label>Allow Price Edit</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={terminalBehavior.allowNegativeStock} onCheckedChange={(c)=>setTerminalBehavior(p=>({...p, allowNegativeStock:c}))} />
                    <Label>Allow Negative Stock</Label>
                  </div>
                </div>
                <Button onClick={async ()=>{ await saveAppSetting('terminal_behavior', terminalBehavior); saveLocal('pos-terminal-behavior', terminalBehavior); showSaveToast(); }}>Save</Button>
              </CardContent>
            </Card>
          );
        case 'display-settings':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Font Scale (%)</Label>
                    <Input type="number" value={displaySettings.fontScale} onChange={(e)=>setDisplaySettings(p=>({...p, fontScale: Number(e.target.value||100)}))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={displaySettings.compactMode} onCheckedChange={(c)=>setDisplaySettings(p=>({...p, compactMode:c}))} />
                    <Label>Compact Mode</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={displaySettings.kioskMode} onCheckedChange={(c)=>setDisplaySettings(p=>({...p, kioskMode:c}))} />
                    <Label>Kiosk Mode</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={displaySettings.showCustomerDisplay} onCheckedChange={(c)=>setDisplaySettings(p=>({...p, showCustomerDisplay:c}))} />
                    <Label>Customer Display</Label>
                  </div>
                  <div>
                    <Label>Number Pad Position</Label>
                    <Select value={displaySettings.numberPadPosition} onValueChange={(v)=>setDisplaySettings(p=>({...p, numberPadPosition:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={displaySettings.highContrast} onCheckedChange={(c)=>setDisplaySettings(p=>({...p, highContrast:c}))} />
                  <Label>High Contrast</Label>
                </div>
                <Button onClick={async ()=>{ await saveAppSetting('display_settings', displaySettings); saveLocal('pos-display-settings', displaySettings); showSaveToast(); }}>Save</Button>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }

    if (section === 'system') {
      switch (subsection) {
        case 'general':
          return (
            <Card>
              <CardHeader>
                <CardTitle>System General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>App Name</Label>
                    <Input value={systemGeneral.appName} onChange={(e)=>setSystemGeneral(p=>({...p, appName:e.target.value}))} />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Input value={systemGeneral.timezone} onChange={(e)=>setSystemGeneral(p=>({...p, timezone:e.target.value}))} />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select value={systemGeneral.language} onValueChange={(v)=>setSystemGeneral(p=>({...p, language:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Input value={systemGeneral.currency} onChange={(e)=>setSystemGeneral(p=>({...p, currency:e.target.value}))} placeholder="USD" />
                  </div>
                  <div>
                    <Label>Date Format</Label>
                    <Select value={systemGeneral.dateFormat} onValueChange={(v)=>setSystemGeneral(p=>({...p, dateFormat:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number Format</Label>
                    <Select value={systemGeneral.numberFormat} onValueChange={(v)=>setSystemGeneral(p=>({...p, numberFormat:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1,234.56">1,234.56</SelectItem>
                        <SelectItem value="1.234,56">1.234,56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tax Mode</Label>
                    <Select value={systemGeneral.taxMode} onValueChange={(v)=>setSystemGeneral(p=>({...p, taxMode:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusive">Inclusive</SelectItem>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fiscal Year Start</Label>
                    <Select value={systemGeneral.fiscalYearStartMonth} onValueChange={(v)=>setSystemGeneral(p=>({...p, fiscalYearStartMonth:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=> (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={async ()=>{ await saveAppSetting('system_general', systemGeneral); saveLocal('pos-system-general', systemGeneral); showSaveToast(); }}>Save</Button>
              </CardContent>
            </Card>
          );
        case 'email-templates':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emailTemplates.map((tpl, idx)=> (
                  <div key={tpl.id} className="border rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input value={tpl.name} onChange={(e)=>{
                          const next=[...emailTemplates]; next[idx]={...tpl, name:e.target.value}; setEmailTemplates(next);
                        }} />
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <Input value={tpl.subject} onChange={(e)=>{
                          const next=[...emailTemplates]; next[idx]={...tpl, subject:e.target.value}; setEmailTemplates(next);
                        }} />
                      </div>
                    </div>
                    <div>
                      <Label>Body</Label>
                      <Textarea value={tpl.body} onChange={(e)=>{
                        const next=[...emailTemplates]; next[idx]={...tpl, body:e.target.value}; setEmailTemplates(next);
                      }} />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('email_templates', emailTemplates); saveLocal('pos-email-templates', emailTemplates); showSaveToast(); }}>Save Templates</Button>
                  <Button variant="outline" onClick={()=>setEmailTemplates(prev=>[...prev, { id: `tpl-${Date.now()}`, name: 'New Template', subject: '', body: '' }])}>Add Template</Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'backup':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">Manage application backups and restores.</p>
                <div className="flex gap-2">
                  <Button onClick={()=> navigate('/dashboard/backup')}>Open Backup Page</Button>
                  <Button variant="outline" onClick={()=> toast.success('Backup started (simulated)')}>Run Quick Backup</Button>
                </div>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }

    if (section === 'hardware') {
      switch (subsection) {
        case 'receipt-printer':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Printer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Paper Width (mm)</Label>
                    <Input type="number" value={printerSettings.paperWidth} onChange={(e)=>setPrinterSettings(p=>({...p, paperWidth:Number(e.target.value||80)}))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={printerSettings.printLogo} onCheckedChange={(c)=>setPrinterSettings(p=>({...p, printLogo:c}))} />
                    <Label>Print Logo</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Connection Type</Label>
                    <Select value={printerSettings.connectionType} onValueChange={(v)=>setPrinterSettings(p=>({...p, connectionType:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="bluetooth">Bluetooth</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Device Name</Label>
                    <Input value={printerSettings.deviceName} onChange={(e)=>setPrinterSettings(p=>({...p, deviceName:e.target.value}))} placeholder="Printer name" />
                  </div>
                  <div>
                    <Label>IP Address (for network)</Label>
                    <Input value={printerSettings.ipAddress} onChange={(e)=>setPrinterSettings(p=>({...p, ipAddress:e.target.value}))} placeholder="192.168.1.100" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={printerSettings.cutPaper} onCheckedChange={(c)=>setPrinterSettings(p=>({...p, cutPaper:c}))} />
                    <Label>Cut Paper</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={printerSettings.kickDrawerAfterPrint} onCheckedChange={(c)=>setPrinterSettings(p=>({...p, kickDrawerAfterPrint:c}))} />
                    <Label>Kick Drawer After Print</Label>
                  </div>
                  <div>
                    <Label>Print Density (%)</Label>
                    <Input type="number" value={printerSettings.printDensity} onChange={(e)=>setPrinterSettings(p=>({...p, printDensity:Number(e.target.value||100)}))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('printer_settings', printerSettings); saveLocal('pos-printer-settings', printerSettings); showSaveToast(); }}>Save</Button>
                  <Button variant="outline" onClick={()=>window.print()}>Test Print</Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'barcode-scanner':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Barcode Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Input</Label>
                  <Input value={barcodeSettings.testInput} onChange={(e)=>setBarcodeSettings({ testInput: e.target.value })} placeholder="Focus here and scan..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Scanner Type</Label>
                    <Select value={barcodeSettings.scannerType} onValueChange={(v)=>setBarcodeSettings(p=>({...p, scannerType:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyboard_wedge">Keyboard Wedge</SelectItem>
                        <SelectItem value="usb_hid">USB HID</SelectItem>
                        <SelectItem value="serial">Serial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prefix</Label>
                    <Input value={barcodeSettings.prefix} onChange={(e)=>setBarcodeSettings(p=>({...p, prefix:e.target.value}))} placeholder="e.g., ^" />
                  </div>
                  <div>
                    <Label>Suffix</Label>
                    <Input value={barcodeSettings.suffix} onChange={(e)=>setBarcodeSettings(p=>({...p, suffix:e.target.value}))} placeholder="e.g., $" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={barcodeSettings.autoSubmit} onCheckedChange={(c)=>setBarcodeSettings(p=>({...p, autoSubmit:c}))} />
                  <Label>Auto Submit After Scan</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('barcode_settings', barcodeSettings); saveLocal('pos-barcode-settings', barcodeSettings); showSaveToast(); }}>Save</Button>
                  <Button variant="outline" onClick={()=> toast.success(`Scanned: ${barcodeSettings.testInput || '—'}`)}>Test Scan</Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'cash-drawer':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Cash Drawer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Open Code (ESC/POS)</Label>
                  <Input value={cashDrawerSettings.openCode} onChange={(e)=>setCashDrawerSettings({ openCode: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Open On</Label>
                    <Select value={cashDrawerSettings.openOn} onValueChange={(v)=>setCashDrawerSettings(p=>({...p, openOn:v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_only">Cash Only</SelectItem>
                        <SelectItem value="all_payments">All Payments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Port (optional)</Label>
                    <Input value={cashDrawerSettings.port} onChange={(e)=>setCashDrawerSettings(p=>({...p, port:e.target.value}))} placeholder="COM3 / /dev/ttyUSB0" />
                  </div>
                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <Switch checked={cashDrawerSettings.pulseOnOpen} onCheckedChange={(c)=>setCashDrawerSettings(p=>({...p, pulseOnOpen:c}))} />
                    <Label>Pulse On Open</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('cash_drawer', cashDrawerSettings); saveLocal('pos-cash-drawer', cashDrawerSettings); showSaveToast(); }}>Save</Button>
                  <Button variant="outline" onClick={()=> toast.success('Cash drawer signal sent (simulated)')}>Test Open</Button>
                </div>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }

    if (section === 'app') {
      switch (subsection) {
        case 'invoice-templates':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template Style</Label>
                  <Select value={invoiceTemplates.style} onValueChange={(v)=>setInvoiceTemplates({ style: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Header Logo URL</Label>
                    <Input value={invoiceTemplates.headerLogoUrl} onChange={(e)=>setInvoiceTemplates(p=>({...p, headerLogoUrl:e.target.value}))} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Terms & Notes</Label>
                    <Textarea value={invoiceTemplates.terms} onChange={(e)=>setInvoiceTemplates(p=>({...p, terms:e.target.value}))} placeholder="Payment terms, return policy" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={async ()=>{ await saveAppSetting('invoice_templates', invoiceTemplates); saveLocal('pos-invoice-template', invoiceTemplates); showSaveToast(); }}>Save</Button>
                  <Button variant="outline" onClick={()=> navigate('/dashboard/invoice-settings')}>Open Invoice Settings</Button>
                </div>
              </CardContent>
            </Card>
          );
        case 'notifications':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={notifications.salesSummaryEmail} onCheckedChange={(c)=>setNotifications(p=>({...p, salesSummaryEmail:c}))} />
                  <Label>Daily sales summary email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={notifications.lowStockPush} onCheckedChange={(c)=>setNotifications(p=>({...p, lowStockPush:c}))} />
                  <Label>Low stock push notification</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={notifications.smsAlerts} onCheckedChange={(c)=>setNotifications(p=>({...p, smsAlerts:c}))} />
                  <Label>SMS Alerts</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={notifications.inAppAlerts} onCheckedChange={(c)=>setNotifications(p=>({...p, inAppAlerts:c}))} />
                  <Label>In-app Alerts</Label>
                </div>
                <Button onClick={async ()=>{ await saveAppSetting('notifications', notifications); saveLocal('pos-notifications', notifications); showSaveToast(); }}>Save</Button>
              </CardContent>
            </Card>
          );
        case 'theme':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Appearance</Label>
                  <Select value={appTheme.theme} onValueChange={(v)=>{ setAppTheme({ theme:v }); localStorage.setItem('pos-theme', v); window.location.reload(); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4">
                  <Label>Accent Color</Label>
                  <Input type="color" value={appTheme.accentColor as string} onChange={(e)=>{ setAppTheme(p=>({ ...p, accentColor: e.target.value })); localStorage.setItem('pos-accent-color', e.target.value); }} />
                </div>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }

    if (section === 'security') {
      switch (subsection) {
        case 'general':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={securityGeneral.requireStrongPasswords} onCheckedChange={(c)=>setSecurityGeneral(p=>({...p, requireStrongPasswords:c}))} />
                  <Label>Require strong passwords</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={securityGeneral.twoFactorAuth} onCheckedChange={(c)=>setSecurityGeneral(p=>({...p, twoFactorAuth:c}))} />
                  <Label>Enable 2FA (simulated)</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Min Password Length</Label>
                    <Input type="number" value={securityGeneral.minPasswordLength} onChange={(e)=>setSecurityGeneral(p=>({...p, minPasswordLength:Number(e.target.value||8)}))} />
                  </div>
                  <div>
                    <Label>Lockout After Failed Attempts</Label>
                    <Input type="number" value={securityGeneral.lockoutAfterFailedAttempts} onChange={(e)=>setSecurityGeneral(p=>({...p, lockoutAfterFailedAttempts:Number(e.target.value||5)}))} />
                  </div>
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" value={securityGeneral.sessionTimeoutMinutes} onChange={(e)=>setSecurityGeneral(p=>({...p, sessionTimeoutMinutes:Number(e.target.value||60)}))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={securityGeneral.restrictByIP} onCheckedChange={(c)=>setSecurityGeneral(p=>({...p, restrictByIP:c}))} />
                  <Label>Restrict by IP</Label>
                </div>
                {securityGeneral.restrictByIP && (
                  <div>
                    <Label>Allowed IPs (one per line)</Label>
                    <Textarea value={securityGeneral.allowedIPs} onChange={(e)=>setSecurityGeneral(p=>({...p, allowedIPs:e.target.value}))} placeholder="123.45.67.89\n10.0.0.0/24" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch checked={securityGeneral.requireDevicePIN} onCheckedChange={(c)=>setSecurityGeneral(p=>({...p, requireDevicePIN:c}))} />
                  <Label>Require Device PIN</Label>
                </div>
                <Button onClick={async ()=>{ await saveAppSetting('security', securityGeneral); saveLocal('pos-security', securityGeneral); showSaveToast(); }}>Save</Button>
              </CardContent>
            </Card>
          );
        case 'sessions':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Active sessions:</p>
                <ul className="list-disc ml-6 text-sm">
                  <li>Browser: {navigator.userAgent}</li>
                  <li>Login: {new Date().toLocaleString()}</li>
                </ul>
                <Button variant="outline" onClick={()=> toast.success('Other sessions revoked (simulated)')}>Revoke Others</Button>
              </CardContent>
            </Card>
          );
        case 'audit':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Audit & Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No audit logs found.</p>
                ) : (
                  <ul className="list-disc ml-6 text-sm">
                    {auditLogs.map((l, i)=>(<li key={i}>{l}</li>))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }

    if (section === 'users') {
      return <SystemUsersReferrals />;
    }

    return null;
  };

  const getFirstSubsection = (sec: string) => {
    const group = sidebarItems.find((s) => s.section === sec);
    return group?.items?.[0]?.id || '';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your system</p>
      </div>

      {/* Top-level sections as tabs */}
      <Tabs
        value={section}
        onValueChange={(val) => updateSearchParams(val, getFirstSubsection(val))}
      >
        <TabsList className="flex flex-wrap">
          {sidebarItems.map((grp) => (
            <TabsTrigger key={grp.section} value={grp.section} className="capitalize">
              {grp.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {sidebarItems.map((grp) => {
          const activeSub = section === grp.section ? subsection : getFirstSubsection(grp.section);
          return (
            <TabsContent key={grp.section} value={grp.section} className="space-y-4">
              {/* Subsections for the active section */}
              {grp.items && grp.items.length > 0 && (
                <Tabs
                  value={activeSub}
                  onValueChange={(sub) => updateSearchParams(grp.section, sub)}
                >
                  <TabsList className="flex flex-wrap">
                    {grp.items.map((it) => (
                      <TabsTrigger key={it.id} value={it.id} className="capitalize">
                        {it.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {/* Render the detailed content for the current selection */}
              {section === grp.section && renderContent()}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Settings;
