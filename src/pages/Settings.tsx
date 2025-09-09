import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useSettings } from '@/hooks/useSettings';
import { showSaveToast, showUploadToast } from '@/components/SettingsToast';
import { countries } from '@/data/countries';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  CreditCard, 
  Shield, 
  Bell,
  Save,
  Upload,
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Eye,
  EyeOff,
  Crown,
  UserPlus,
  Send,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  invitedAt: string;
  lastLogin?: string;
  permissions: string[];
}

interface UserInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
}

const Settings = () => {
  const { subscription, hasFeature } = useSubscription();
  const { currentBusiness, updateBusiness } = useBusiness();
  const { settings, updateSetting } = useSettings();
  
  // User Management State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    sendWelcomeEmail: true
  });

  // Available roles based on subscription plan
  const availableRoles = [
    { id: 'cashier', name: 'Cashier', description: 'Can process sales and view basic reports', requiredFeature: 'basic_sales_tracking' },
    { id: 'inventory_manager', name: 'Inventory Manager', description: 'Can manage products and inventory', requiredFeature: 'basic_inventory' },
    { id: 'sales_manager', name: 'Sales Manager', description: 'Can view sales reports and manage customers', requiredFeature: 'advanced_reports' },
    { id: 'branch_manager', name: 'Branch Manager', description: 'Can manage a specific branch location', requiredFeature: 'multi_branch_support' },
    { id: 'admin', name: 'Administrator', description: 'Full access to all features', requiredFeature: 'multi_user_accounts' }
  ].filter(role => hasFeature(role.requiredFeature as any));

  // Business Information State
  const [businessForm, setBusinessForm] = useState({
    businessName: currentBusiness?.businessName || '',
    businessType: currentBusiness?.businessType || '',
    phone: currentBusiness?.phone || '',
    email: currentBusiness?.email || '',
    address: currentBusiness?.address || '',
    city: currentBusiness?.city || '',
    state: currentBusiness?.state || '',
    postalCode: currentBusiness?.postalCode || '',
    country: currentBusiness?.country || 'US',
    taxId: currentBusiness?.taxId || '',
    businessLicense: currentBusiness?.businessLicense || ''
  });

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(currentBusiness?.logoUrl || null);

  const handleBusinessSave = () => {
    if (!businessForm.businessName || !businessForm.businessType) {
      toast.error('Please fill in business name and type');
      return;
    }

    if (currentBusiness) {
      updateBusiness(currentBusiness.id, {
        ...businessForm,
        logoUrl: logoPreview || undefined
      });
      showSaveToast('Business information saved successfully!');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        showUploadToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    toast.success('Logo removed');
  };

  // User Management Functions
  const handleInviteUser = () => {
    if (!hasFeature('multi_user_accounts')) {
      toast.error('User management requires Standard plan or higher');
      return;
    }

    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === inviteForm.email.toLowerCase());
    const existingInvite = invitations.find(i => i.email.toLowerCase() === inviteForm.email.toLowerCase() && i.status === 'pending');
    
    if (existingUser) {
      toast.error('A user with this email already exists');
      return;
    }
    
    if (existingInvite) {
      toast.error('An invitation has already been sent to this email');
      return;
    }

    // Create invitation
    const newInvitation: UserInvitation = {
      id: Date.now().toString(),
      email: inviteForm.email,
      role: inviteForm.role,
      invitedBy: 'Current User',
      invitedAt: new Date().toISOString(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    setInvitations(prev => [...prev, newInvitation]);

    if (inviteForm.sendWelcomeEmail) {
      // Simulate sending invitation email
      toast.success(`Invitation sent to ${inviteForm.email}! They will receive an email with setup instructions.`);
    } else {
      toast.success(`Invitation created for ${inviteForm.email}. Share the invitation link manually.`);
    }

    // Reset form
    setInviteForm({
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      sendWelcomeEmail: true
    });
    setIsInviteDialogOpen(false);
  };

  const handleResendInvitation = (invitationId: string) => {
    const invitation = invitations.find(i => i.id === invitationId);
    if (invitation) {
      // Update expiry date
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          : inv
      ));
      toast.success(`Invitation resent to ${invitation.email}`);
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.success('Invitation cancelled');
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User removed successfully');
    }
  };

  const copyInvitationLink = (invitationId: string) => {
    const inviteLink = `${window.location.origin}/auth?mode=signup&invite=${invitationId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (roleId: string) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const maxUsers = subscription?.plan_id === 'starter' ? 1 : 
                   subscription?.plan_id === 'standard' ? 5 : 
                   subscription?.plan_id === 'pro' ? 15 : 999;

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Business logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 200x200px, PNG or JPG, max 5MB
                    </p>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeLogo}
                        className="mt-2 gap-1"
                      >
                        <X size={14} />
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={businessForm.businessType} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
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

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={businessForm.phone}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 555-0123"
                    />
                  </div>

                  <div>
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

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Business Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={businessForm.city}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={businessForm.state}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={businessForm.postalCode}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="10001"
                      />
                    </div>
                    <div>
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
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={businessForm.taxId}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="123-45-6789"
                  />
                </div>
                <div>
                  <Label htmlFor="businessLicense">Business License</Label>
                  <Input
                    id="businessLicense"
                    value={businessForm.businessLicense}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, businessLicense: e.target.value }))}
                    placeholder="BL-123456"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleBusinessSave} className="bg-save hover:bg-save-hover text-save-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Business Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users" className="space-y-6">
          {!hasFeature('multi_user_accounts') ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-amber-800 dark:text-amber-200">
                    User Management Requires Upgrade
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  Multi-user accounts are available in Standard plan and above. Upgrade to invite team members and assign roles.
                </p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/subscription'}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* User Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                  <p className="text-muted-foreground">
                    Invite team members and manage their roles ({users.length + invitations.length}/{maxUsers} users)
                  </p>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gap-2"
                      disabled={users.length + invitations.length >= maxUsers}
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                          An invitation email will be sent with setup instructions and a temporary password.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={inviteForm.firstName}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={inviteForm.lastName}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@company.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-xs text-muted-foreground">{role.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={inviteForm.sendWelcomeEmail}
                          onCheckedChange={(checked) => setInviteForm(prev => ({ ...prev, sendWelcomeEmail: checked }))}
                        />
                        <Label>Send welcome email with login instructions</Label>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        <h4 className="font-medium mb-1">What happens next:</h4>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• User receives invitation email</li>
                          <li>• They create their password</li>
                          <li>• Account is activated automatically</li>
                          <li>• They can access assigned features</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleInviteUser} className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search Users */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Users ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-500 hover:bg-blue-500">
                        <TableHead className="text-white font-semibold">User</TableHead>
                        <TableHead className="text-white font-semibold">Email</TableHead>
                        <TableHead className="text-white font-semibold">Role</TableHead>
                        <TableHead className="text-white font-semibold">Status</TableHead>
                        <TableHead className="text-white font-semibold">Last Login</TableHead>
                        <TableHead className="text-white font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No users found</p>
                              <p className="text-sm text-muted-foreground">Invite team members to collaborate</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getRoleBadge(user.role)}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Pending Invitations ({invitations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-500 hover:bg-orange-500">
                          <TableHead className="text-white font-semibold">Email</TableHead>
                          <TableHead className="text-white font-semibold">Role</TableHead>
                          <TableHead className="text-white font-semibold">Invited By</TableHead>
                          <TableHead className="text-white font-semibold">Invited Date</TableHead>
                          <TableHead className="text-white font-semibold">Expires</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-white font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getRoleBadge(invitation.role)}</Badge>
                            </TableCell>
                            <TableCell>{invitation.invitedBy}</TableCell>
                            <TableCell>{new Date(invitation.invitedAt).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(invitation.expiresAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyInvitationLink(invitation.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleResendInvitation(invitation.id)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Manage Your Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  View and manage your subscription plan, billing, and payment methods
                </p>
                <Button onClick={() => window.location.href = '/dashboard/subscription'}>
                  Go to Subscription Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sales Reports</Label>
                    <p className="text-sm text-muted-foreground">Daily sales summary emails</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => showSaveToast('Notification preferences saved!')} className="bg-save hover:bg-save-hover text-save-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => showSaveToast('Security settings saved!')} className="bg-save hover:bg-save-hover text-save-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;