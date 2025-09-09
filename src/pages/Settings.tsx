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
    { id: '1', name: 'Main Store', address: '', isActive: true }
  ]);

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
                <Button onClick={() => showSaveToast()} className="bg-save hover:bg-save-hover text-save-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Locations
                </Button>
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

    if (section === 'users') {
      return <SystemUsersReferrals />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings content for {section} - {subsection}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your system</p>
        </div>
        
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.section} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {item.title}
              </div>
              {item.items.map((subItem) => {
                const SubIcon = subItem.icon;
                const isActive = section === item.section && subsection === subItem.id;
                return (
                  <Button
                    key={subItem.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => updateSearchParams(item.section, subItem.id)}
                  >
                    <SubIcon className="h-4 w-4" />
                    {subItem.label}
                  </Button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
