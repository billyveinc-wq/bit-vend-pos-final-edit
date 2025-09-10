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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/contexts/BusinessContext';
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
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { businesses, currentBusiness, addBusiness, updateBusiness, deleteBusiness } = useBusiness();
  
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
    { id: '1', code: 'MAIN', name: 'Main Store', manager: '', phone: '', email: '', address: '', city: '', state: '', postalCode: '', country: 'US', currency: 'USD', taxRegion: '', isActive: true, isMain: true, notes: '', companyId: '' }
  ]);

  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const { data } = await supabase.from('companies').select('id, name').order('id');
        setCompanies((data || []).map((c: any) => ({ id: String(c.id), name: c.name })));
      } catch {}
      const local = localStorage.getItem('pos-companies');
      if (local && !companies.length) {
        try { setCompanies(JSON.parse(local)); } catch {}
      }
    };
    loadCompanies();
  }, []);
  useEffect(() => {
    if (companies.length) localStorage.setItem('pos-companies', JSON.stringify(companies));
  }, [companies]);
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

  const handleSaveBusiness = () => {
    if (!businessForm.businessName) {
      toast.error('Business name is required');
      return;
    }

    const businessData = {
      ...businessForm,
      operatingHours
    };

    if (editId) {
      updateBusiness(editId, businessData);
      toast.success('Business updated successfully!');
    } else {
      addBusiness(businessData);
      toast.success('Business created successfully!');
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
    {
      section: 'system',
      title: 'System',
      icon: SettingsIcon,
      items: [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'email-templates', label: 'Email Templates', icon: Mail },
        { id: 'backup', label: 'Backup', icon: Database }
      ]
    },
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
    {
      section: 'security',
      title: 'Security',
      icon: Shield,
      items: [
        { id: 'general', label: 'Security Settings', icon: Shield },
        { id: 'sessions', label: 'Session Management', icon: Clock },
        { id: 'audit', label: 'Audit & Logs', icon: FileText }
      ]
    },
    {
      section: 'users',
      title: 'Users & Referrals',
      icon: Users,
      items: [
        { id: 'management', label: 'User Management', icon: Users }
      ]
    }
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
                    className="mb-2"
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
                  <SelectContent>
                    {countries.slice(0, 20).map((country) => (
                      <SelectItem key={country.code} value={country.code}>
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
    businessFooter: ''
  });
  const [terminalBehavior, setTerminalBehavior] = useState({
    autoPrint: false,
    playSoundOnAdd: true,
    promptForReceipt: true
  });
  const [displaySettings, setDisplaySettings] = useState({
    fontScale: 100,
    compactMode: false
  });

  // System settings state
  const [systemGeneral, setSystemGeneral] = useState({
    appName: 'Bit Vend POS',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en'
  });
  const [emailTemplates, setEmailTemplates] = useState([
    { id: 'order-confirmation', name: 'Order Confirmation', subject: 'Your order has been received', body: 'Thank you for your order.' },
    { id: 'low-stock', name: 'Low Stock Alert', subject: 'Product low stock', body: 'A product is running low on stock.' },
  ]);

  // Hardware settings state
  const [printerSettings, setPrinterSettings] = useState({
    paperWidth: 80,
    printLogo: true
  });
  const [barcodeSettings, setBarcodeSettings] = useState({
    testInput: ''
  });
  const [cashDrawerSettings, setCashDrawerSettings] = useState({
    openCode: '27,112,0,25,250'
  });

  // App settings state
  const [invoiceTemplates, setInvoiceTemplates] = useState({
    style: 'standard'
  });
  const [notifications, setNotifications] = useState({
    salesSummaryEmail: true,
    lowStockPush: true
  });
  const [appTheme, setAppTheme] = useState({
    theme: localStorage.getItem('pos-theme') === 'dark' ? 'dark' : 'light'
  });

  // Security settings state
  const [securityGeneral, setSecurityGeneral] = useState({
    requireStrongPasswords: true,
    twoFactorAuth: false
  });
  const [auditLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('pos-audit-log');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist helpers
  const saveLocal = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));

  const renderContent = () => {
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
                          onClick={() => {
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
                <Button onClick={() => { saveLocal('pos-locations', locations); showSaveToast(); }} className="bg-save hover:bg-save-hover text-save-foreground">
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
                      const newLoc = { id: Date.now().toString(), code: '', name: '', manager: '', phone: '', email: '', address: '', city: '', state: '', postalCode: '', country: 'US', currency: 'USD', taxRegion: '', isActive: true, isMain: false, notes: '', companyId: companies[0]?.id || '' };
                      setLocations(prev => [...prev, newLoc]);
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Branch
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { saveLocal('pos-locations', locations); showSaveToast(); }}>Save Branches</Button>
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
                        <Select value={loc.companyId || ''} onValueChange={(v)=>{ const next=[...locations]; next[index]={...loc, companyId:v}; setLocations(next); }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(companies.length ? companies : [{ id: '', name: 'Unassigned' }]).map((c)=> (
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
                            {countries.slice(0, 20).map((c)=>(<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
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
                      <Button variant="outline" size="sm" onClick={()=>{
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
                <div>
                  <Label>Footer Text</Label>
                  <Textarea value={receiptSettings.businessFooter} onChange={(e)=>setReceiptSettings(p=>({...p, businessFooter:e.target.value}))} placeholder="Thank you for shopping!" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-receipt-settings', receiptSettings); showSaveToast(); }}>Save</Button>
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
                <Button onClick={()=>{ saveLocal('pos-terminal-behavior', terminalBehavior); showSaveToast(); }}>Save</Button>
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
                <Button onClick={()=>{ saveLocal('pos-display-settings', displaySettings); showSaveToast(); }}>Save</Button>
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
                <Button onClick={()=>{ saveLocal('pos-system-general', systemGeneral); showSaveToast(); }}>Save</Button>
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
                  <Button onClick={()=>{ saveLocal('pos-email-templates', emailTemplates); showSaveToast(); }}>Save Templates</Button>
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
                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-printer-settings', printerSettings); showSaveToast(); }}>Save</Button>
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
                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-barcode-settings', barcodeSettings); showSaveToast(); }}>Save</Button>
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
                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-cash-drawer', cashDrawerSettings); showSaveToast(); }}>Save</Button>
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
                <div className="flex gap-2">
                  <Button onClick={()=>{ saveLocal('pos-invoice-template', invoiceTemplates); showSaveToast(); }}>Save</Button>
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
                <Button onClick={()=>{ saveLocal('pos-notifications', notifications); showSaveToast(); }}>Save</Button>
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
                <Button onClick={()=>{ saveLocal('pos-security', securityGeneral); showSaveToast(); }}>Save</Button>
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
