import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  Receipt, 
  DollarSign, 
  Database, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard, 
  Percent, 
  Calendar, 
  UserPlus, 
  Crown,
  Upload,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/data/countries';
import { useBusiness } from '@/contexts/BusinessContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Business {
  id: string;
  businessName: string;
  businessType: string;
  taxId: string;
  businessLicense: string;
  phone: string;
  email: string;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { 
    businesses, 
    addBusiness, 
    updateBusiness, 
    deleteBusiness, 
    currentBusiness, 
    switchBusiness 
  } = useBusiness();
  const { hasFeature } = useSubscription();

  // State management
  const [activeSection, setActiveSection] = useState('general');
  const [activeSubsection, setActiveSubsection] = useState('general');
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [fadeKey, setFadeKey] = useState(0);

  // Default business form
  const getDefaultBusinessForm = () => ({
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
    country: 'US',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    }
  });

  // Business form state
  const [businessForm, setBusinessForm] = useState(() => {
    if (editId) {
      const business = businesses.find(b => b.id === editId);
      return business ? {
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
        country: business.country,
        operatingHours: business.operatingHours || {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: true }
        }
      } : getDefaultBusinessForm();
    }
    return currentBusiness ? {
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
      country: currentBusiness.country,
      operatingHours: currentBusiness.operatingHours || {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true }
      }
    } : getDefaultBusinessForm();
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // Receipt settings state
  const [receiptSettings, setReceiptSettings] = useState({
    template: 'classic-receipt',
    showLogo: true,
    showTaxNumber: true,
    showAddress: true,
    footerText: 'Thank you for your business!',
    paperSize: 'A4',
    fontSize: 12,
    printCopies: 1
  });

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: 8,
    taxName: 'VAT',
    taxNumber: '',
    includeTaxInPrice: false,
    taxCalculationMethod: 'exclusive'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlerts: true,
    salesAlerts: false,
    systemAlerts: true
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    primaryColor: '#3b82f6',
    fontSize: 'medium',
    compactMode: false,
    animations: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    requirePasswordChange: false,
    twoFactorAuth: false,
    loginAttempts: 5,
    passwordMinLength: 8
  });

  // Update settings form when settings change
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Toast helpers
  const showUploadToast = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  // Section configuration
  const defaultSubsections = {
    general: 'general',
    business: 'business-info',
    invoice: 'invoice-general',
    tax: 'tax-rates',
    backup: 'backup-restore',
    security: 'security-general'
  };

  const settingsSections = [
    {
      key: 'general',
      title: 'General',
      icon: SettingsIcon,
      subsections: [
        { key: 'general', title: 'General Settings', icon: SettingsIcon },
        { key: 'appearance', title: 'Appearance', icon: Palette },
        { key: 'notifications', title: 'Notifications', icon: Bell },
        { key: 'language', title: 'Language & Region', icon: Globe }
      ]
    },
    {
      key: 'business',
      title: 'Business',
      icon: Building2,
      subsections: [
        { key: 'business-info', title: 'Business Information', icon: Building2 },
        { key: 'business-location', title: 'Location', icon: MapPin },
        { key: 'business-contact', title: 'Contact Information', icon: Phone },
        { key: 'business-operating-hours', title: 'Operating Hours', icon: Clock },
        { key: 'subscription', title: 'Subscription', icon: CreditCard }
      ]
    },
    {
      key: 'invoice',
      title: 'Invoice',
      icon: Receipt,
      subsections: [
        { key: 'invoice-general', title: 'General Settings', icon: Receipt },
        { key: 'invoice-template', title: 'Template', icon: FileText },
        { key: 'invoice-numbering', title: 'Numbering', icon: FileText }
      ]
    },
    {
      key: 'tax',
      title: 'Tax',
      icon: Percent,
      subsections: [
        { key: 'tax-rates', title: 'Tax Rates', icon: Percent },
        { key: 'tax-settings', title: 'Tax Settings', icon: DollarSign }
      ]
    },
    {
      key: 'backup',
      title: 'Backup & Restore',
      icon: Database,
      subsections: [
        { key: 'backup-restore', title: 'Backup & Restore', icon: Database }
      ]
    },
    {
      key: 'security',
      title: 'Security',
      icon: Shield,
      subsections: [
        { key: 'security-general', title: 'General Security', icon: Shield },
        { key: 'security-users', title: 'User Management', icon: Users }
      ]
    }
  ];

  // Handle section toggle
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  // Handle section change
  const handleSectionChange = (newSection: string) => {
    // Trigger fade out
    setFadeKey(prev => prev + 1);
    
    setActiveSection(newSection);
    setActiveSubsection(defaultSubsections[newSection as keyof typeof defaultSubsections] || 'general');
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setBusinessForm({...businessForm, logoUrl: result});
      };
      reader.readAsDataURL(file);
      
      showUploadToast('Logo uploaded successfully!');
    }
  };

  // Handle business form submission
  const handleBusinessSubmit = () => {
    if (editId) {
      updateBusiness(editId, businessForm);
      setEditId(null);
      showUploadToast('Business updated successfully!');
    } else {
      const newBusiness = {
        ...businessForm,
        id: Date.now().toString()
      };
      addBusiness(newBusiness);
      showUploadToast('Business added successfully!');
    }
    setBusinessForm(getDefaultBusinessForm());
    setActiveSubsection('business-list');
  };

  // Handle business edit
  const handleBusinessEdit = (business: Business) => {
    setEditId(business.id);
    setBusinessForm(business);
    setActiveSubsection('business-details');
  };

  // Handle business delete
  const handleBusinessDelete = (businessId: string) => {
    setBusinessToDelete(businessId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (businessToDelete) {
      deleteBusiness(businessToDelete);
      showUploadToast('Business deleted successfully!');
      setBusinessToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Handle settings save
  const handleSettingsSave = () => {
    updateSettings(settingsForm);
    showUploadToast('Settings saved successfully!');
  };

  // Handle receipt settings save
  const handleReceiptSettingsSave = () => {
    localStorage.setItem('receipt-settings', JSON.stringify(receiptSettings));
    showUploadToast('Receipt settings saved successfully!');
  };

  // Handle tax settings save
  const handleTaxSettingsSave = () => {
    localStorage.setItem('tax-settings', JSON.stringify(taxSettings));
    showUploadToast('Tax settings saved successfully!');
  };

  // Handle notification settings save
  const handleNotificationSettingsSave = () => {
    localStorage.setItem('notification-settings', JSON.stringify(notificationSettings));
    showUploadToast('Notification settings saved successfully!');
  };

  // Handle appearance settings save
  const handleAppearanceSettingsSave = () => {
    localStorage.setItem('appearance-settings', JSON.stringify(appearanceSettings));
    showUploadToast('Appearance settings saved successfully!');
  };

  // Handle security settings save
  const handleSecuritySettingsSave = () => {
    localStorage.setItem('security-settings', JSON.stringify(securitySettings));
    showUploadToast('Security settings saved successfully!');
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedReceipt = localStorage.getItem('receipt-settings');
        if (savedReceipt) setReceiptSettings(JSON.parse(savedReceipt));

        const savedTax = localStorage.getItem('tax-settings');
        if (savedTax) setTaxSettings(JSON.parse(savedTax));

        const savedNotifications = localStorage.getItem('notification-settings');
        if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));

        const savedAppearance = localStorage.getItem('appearance-settings');
        if (savedAppearance) setAppearanceSettings(JSON.parse(savedAppearance));

        const savedSecurity = localStorage.getItem('security-settings');
        if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border p-6 min-h-screen">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your application preferences</p>
          </div>

          <div className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.key);
              const isActiveSection = activeSection === section.key;

              return (
                <div key={section.key} className="space-y-1">
                  <Button
                    variant={isActiveSection ? "secondary" : "ghost"}
                    className="w-full justify-between h-auto p-3"
                    onClick={() => {
                      toggleSection(section.key);
                      handleSectionChange(section.key);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="ml-4 space-y-1 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                      {section.subsections?.map((subsection, subIndex) => {
                        const SubIcon = subsection.icon;
                        const isActiveSubsection = activeSubsection === subsection.key;

                        return (
                          <Button
                            key={subsection.key}
                            variant={isActiveSubsection ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start h-auto p-2 animate-fadeInUp"
                            style={{ animationDelay: `${subIndex * 0.05}s` }}
                            onClick={() => setActiveSubsection(subsection.key)}
                          >
                            <SubIcon className="h-3 w-3 mr-2" />
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

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div 
            key={fadeKey}
            className="settings-content-fade"
          >
          {/* General Settings */}
          {activeSection === 'general' && activeSubsection === 'general' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">General Settings</h1>
                <p className="text-muted-foreground">Configure your application preferences</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select 
                        value={settingsForm.currency} 
                        onValueChange={(value) => setSettingsForm({...settingsForm, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={settingsForm.dateFormat} 
                        onValueChange={(value) => setSettingsForm({...settingsForm, dateFormat: value})}
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoSave" 
                      checked={settingsForm.autoSave}
                      onCheckedChange={(checked) => setSettingsForm({...settingsForm, autoSave: checked})}
                    />
                    <Label htmlFor="autoSave">Enable auto-save</Label>
                  </div>
                  <Button onClick={handleSettingsSave}>Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Business Information */}
          {activeSection === 'business' && activeSubsection === 'business-info' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Business Information</h1>
                  <p className="text-muted-foreground">Configure your business details and branding</p>
                </div>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={businessForm.businessName}
                        onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select 
                        value={businessForm.businessType} 
                        onValueChange={(value) => setBusinessForm({...businessForm, businessType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={businessForm.taxId}
                        onChange={(e) => setBusinessForm({...businessForm, taxId: e.target.value})}
                        placeholder="Enter tax ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessLicense">Business License</Label>
                      <Input
                        id="businessLicense"
                        value={businessForm.businessLicense}
                        onChange={(e) => setBusinessForm({...businessForm, businessLicense: e.target.value})}
                        placeholder="Enter business license"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          id="logoUrl"
                          value={businessForm.logoUrl}
                          onChange={(e) => setBusinessForm({...businessForm, logoUrl: e.target.value})}
                          placeholder="https://example.com/logo.png or upload image"
                        />
                        {(logoPreview || businessForm.logoUrl) && (
                          <div className="flex items-center gap-2 p-2 border rounded">
                            <img 
                              src={logoPreview || businessForm.logoUrl} 
                              alt="Logo preview"
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-muted-foreground">Logo preview</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <Button onClick={handleBusinessSubmit}>
                    Save Business Information
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Operating Hours */}
          {activeSection === 'business' && activeSubsection === 'business-operating-hours' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Operating Hours</h1>
                <p className="text-muted-foreground">Set your business operating schedule</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Weekly Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(businessForm.operatingHours || {}).map(([day, hours], index) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24">
                        <Label className="capitalize">{day}</Label>
                      </div>
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => 
                          setBusinessForm({
                            ...businessForm,
                            operatingHours: {
                              ...(businessForm.operatingHours || {}),
                              [day]: { ...hours, closed: !checked }
                            }
                          })
                        }
                      />
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => 
                              setBusinessForm({
                                ...businessForm,
                                operatingHours: {
                                  ...(businessForm.operatingHours || {}),
                                  [day]: { ...hours, open: e.target.value }
                                }
                              })
                            }
                            className="w-32"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => 
                              setBusinessForm({
                                ...businessForm,
                                operatingHours: {
                                  ...(businessForm.operatingHours || {}),
                                  [day]: { ...hours, close: e.target.value }
                                }
                              })
                            }
                            className="w-32"
                          />
                        </>
                      )}
                      {hours.closed && (
                        <span className="text-muted-foreground">Closed</span>
                      )}
                    </div>
                  ))}
                  <Button onClick={handleBusinessSubmit}>Save Operating Hours</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other sections would go here... */}
          {/* Appearance Settings */}
          {activeSection === 'general' && activeSubsection === 'appearance' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Appearance Settings</h1>
                <p className="text-muted-foreground">Customize the look and feel of your application</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme & Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={appearanceSettings.theme} 
                      onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select 
                      value={appearanceSettings.fontSize} 
                      onValueChange={(value) => setAppearanceSettings({...appearanceSettings, fontSize: value})}
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
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="compactMode" 
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, compactMode: checked})}
                    />
                    <Label htmlFor="compactMode">Compact Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="animations" 
                      checked={appearanceSettings.animations}
                      onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, animations: checked})}
                    />
                    <Label htmlFor="animations">Enable Animations</Label>
                  </div>
                  <Button onClick={handleAppearanceSettingsSave}>Save Appearance Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'general' && activeSubsection === 'notifications' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
                <p className="text-muted-foreground">Configure how you receive notifications</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when products are low in stock</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sales Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about important sales events</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.salesAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, salesAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about system updates and maintenance</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                    />
                  </div>
                  <Button onClick={handleNotificationSettingsSave}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Language & Region Settings */}
          {activeSection === 'general' && activeSubsection === 'language' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Language & Region</h1>
                <p className="text-muted-foreground">Configure language and regional preferences</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settingsForm.language} 
                      onValueChange={(value) => setSettingsForm({...settingsForm, language: value})}
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
                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select 
                      value={settingsForm.timeFormat} 
                      onValueChange={(value) => setSettingsForm({...settingsForm, timeFormat: value as '12' | '24'})}
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
                  <Button onClick={handleSettingsSave}>Save Language Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Business Contact Information */}
          {activeSection === 'business' && activeSubsection === 'business-contact' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Contact Information</h1>
                <p className="text-muted-foreground">Manage business contact details</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})}
                        placeholder="+1 555-0123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={businessForm.email}
                        onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})}
                        placeholder="business@example.com"
                      />
                    </div>
                  </div>
                  <Button onClick={handleBusinessSubmit}>Save Contact Information</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Business Location */}
          {activeSection === 'business' && activeSubsection === 'business-location' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Business Location</h1>
                <p className="text-muted-foreground">Configure your business address and location</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                      placeholder="123 Business Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={businessForm.city}
                        onChange={(e) => setBusinessForm({...businessForm, city: e.target.value})}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={businessForm.state}
                        onChange={(e) => setBusinessForm({...businessForm, state: e.target.value})}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={businessForm.postalCode}
                        onChange={(e) => setBusinessForm({...businessForm, postalCode: e.target.value})}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={businessForm.country} 
                      onValueChange={(value) => setBusinessForm({...businessForm, country: value})}
                    >
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
                  <Button onClick={handleBusinessSubmit}>Save Location</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Receipt Settings */}
          {activeSection === 'invoice' && activeSubsection === 'invoice-general' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Receipt Settings</h1>
                <p className="text-muted-foreground">Configure receipt templates and printing options</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Receipt Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Receipt Template</Label>
                    <Select 
                      value={receiptSettings.template} 
                      onValueChange={(value) => setReceiptSettings({...receiptSettings, template: value})}
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
                  <div>
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      value={receiptSettings.footerText}
                      onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                      placeholder="Thank you for your business!"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paperSize">Paper Size</Label>
                      <Select 
                        value={receiptSettings.paperSize} 
                        onValueChange={(value) => setReceiptSettings({...receiptSettings, paperSize: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Thermal">Thermal (80mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Input
                        id="fontSize"
                        type="number"
                        min="8"
                        max="20"
                        value={receiptSettings.fontSize}
                        onChange={(e) => setReceiptSettings({...receiptSettings, fontSize: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="showLogo" 
                        checked={receiptSettings.showLogo}
                        onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showLogo: checked})}
                      />
                      <Label htmlFor="showLogo">Show Business Logo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="showTaxNumber" 
                        checked={receiptSettings.showTaxNumber}
                        onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showTaxNumber: checked})}
                      />
                      <Label htmlFor="showTaxNumber">Show Tax Number</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="showAddress" 
                        checked={receiptSettings.showAddress}
                        onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showAddress: checked})}
                      />
                      <Label htmlFor="showAddress">Show Business Address</Label>
                    </div>
                  </div>
                  <Button onClick={handleReceiptSettingsSave}>Save Receipt Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invoice Template */}
          {activeSection === 'invoice' && activeSubsection === 'invoice-template' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Invoice Template</h1>
                <p className="text-muted-foreground">Customize your invoice layout and design</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Template Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {['classic', 'modern', 'minimal'].map((template) => (
                      <div
                        key={template}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          receiptSettings.template === `${template}-receipt` 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        onClick={() => setReceiptSettings({...receiptSettings, template: `${template}-receipt`})}
                      >
                        <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium capitalize">{template}</h3>
                        <p className="text-xs text-muted-foreground">
                          {template === 'classic' && 'Traditional receipt layout'}
                          {template === 'modern' && 'Clean, contemporary design'}
                          {template === 'minimal' && 'Simple, compact format'}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleReceiptSettingsSave}>Save Template</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invoice Numbering */}
          {activeSection === 'invoice' && activeSubsection === 'invoice-numbering' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Invoice Numbering</h1>
                <p className="text-muted-foreground">Configure invoice numbering system</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Numbering System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        value="INV-"
                        placeholder="INV-"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextNumber">Next Invoice Number</Label>
                      <Input
                        id="nextNumber"
                        type="number"
                        value="1001"
                        placeholder="1001"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="numberFormat">Number Format</Label>
                    <Select defaultValue="sequential">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential (INV-1001, INV-1002...)</SelectItem>
                        <SelectItem value="date-based">Date Based (INV-20240101-001)</SelectItem>
                        <SelectItem value="random">Random (INV-ABC123)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleReceiptSettingsSave}>Save Numbering Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tax Rates */}
          {activeSection === 'tax' && activeSubsection === 'tax-rates' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tax Rates</h1>
                <p className="text-muted-foreground">Configure tax rates and calculations</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Tax Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                      <Input
                        id="defaultTaxRate"
                        type="number"
                        step="0.01"
                        value={taxSettings.defaultTaxRate}
                        onChange={(e) => setTaxSettings({...taxSettings, defaultTaxRate: parseFloat(e.target.value)})}
                        placeholder="8.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxName">Tax Name</Label>
                      <Input
                        id="taxName"
                        value={taxSettings.taxName}
                        onChange={(e) => setTaxSettings({...taxSettings, taxName: e.target.value})}
                        placeholder="VAT"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taxNumber">Tax Registration Number</Label>
                    <Input
                      id="taxNumber"
                      value={taxSettings.taxNumber}
                      onChange={(e) => setTaxSettings({...taxSettings, taxNumber: e.target.value})}
                      placeholder="Enter your tax registration number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxCalculation">Tax Calculation Method</Label>
                    <Select 
                      value={taxSettings.taxCalculationMethod} 
                      onValueChange={(value) => setTaxSettings({...taxSettings, taxCalculationMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exclusive">Tax Exclusive (add tax to price)</SelectItem>
                        <SelectItem value="inclusive">Tax Inclusive (tax included in price)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="includeTaxInPrice" 
                      checked={taxSettings.includeTaxInPrice}
                      onCheckedChange={(checked) => setTaxSettings({...taxSettings, includeTaxInPrice: checked})}
                    />
                    <Label htmlFor="includeTaxInPrice">Include tax in displayed prices</Label>
                  </div>
                  <Button onClick={handleTaxSettingsSave}>Save Tax Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tax Settings */}
          {activeSection === 'tax' && activeSubsection === 'tax-settings' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Advanced Tax Settings</h1>
                <p className="text-muted-foreground">Configure advanced tax options and compliance</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tax Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Tax Reporting</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="autoTaxReporting" />
                          <Label htmlFor="autoTaxReporting">Enable automatic tax reporting</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="quarterlyReports" />
                          <Label htmlFor="quarterlyReports">Generate quarterly tax reports</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Tax Categories</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Configure different tax rates for different product categories
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tax Category
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleTaxSettingsSave}>Save Advanced Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Backup & Restore */}
          {activeSection === 'backup' && activeSubsection === 'backup-restore' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Backup & Restore</h1>
                <p className="text-muted-foreground">Manage your data backups and restoration</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Create Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create a backup of all your business data including products, sales, customers, and settings.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="includeProducts" defaultChecked />
                        <Label htmlFor="includeProducts">Include Products</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="includeSales" defaultChecked />
                        <Label htmlFor="includeSales">Include Sales Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="includeCustomers" defaultChecked />
                        <Label htmlFor="includeCustomers">Include Customers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="includeSettings" defaultChecked />
                        <Label htmlFor="includeSettings">Include Settings</Label>
                      </div>
                    </div>
                    <Button className="w-full">
                      Create Backup Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
                  <CardHeader>
                    <CardTitle>Automatic Backups</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">Automatically backup data at scheduled intervals</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="retentionPeriod">Retention Period</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle>Recent Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backups available</p>
                    <p className="text-sm">Create your first backup to see it here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security General */}
          {activeSection === 'security' && activeSubsection === 'security-general' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
                <p className="text-muted-foreground">Configure security policies and access controls</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="requirePasswordChange" 
                        checked={securitySettings.requirePasswordChange}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requirePasswordChange: checked})}
                      />
                      <Label htmlFor="requirePasswordChange">Require periodic password changes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="twoFactorAuth" 
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                      />
                      <Label htmlFor="twoFactorAuth">Enable two-factor authentication</Label>
                    </div>
                  </div>
                  <Button onClick={handleSecuritySettingsSave}>Save Security Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management */}
          {activeSection === 'security' && activeSubsection === 'security-users' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">Manage user accounts and permissions</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Current User</h3>
                      <p className="text-sm text-muted-foreground">admin@bitvend.com</p>
                    </div>
                    <Badge variant="default">Admin</Badge>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Multi-user support available in Standard plan and above</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/dashboard/subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscription Settings */}
          {activeSection === 'business' && activeSubsection === 'subscription' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
                <p className="text-muted-foreground">Manage your subscription plan and billing</p>
              </div>

              <Card className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Starter Plan</h3>
                      <p className="text-sm text-muted-foreground">$9/month • Basic features</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/dashboard/subscription')}>
                      View All Plans
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/dashboard/subscription/manage')}>
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fallback for unimplemented sections */}
          {activeSection !== 'general' && activeSection !== 'business' && activeSection !== 'invoice' && activeSection !== 'tax' && activeSection !== 'backup' && activeSection !== 'security' && (
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Coming Soon</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this business? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;