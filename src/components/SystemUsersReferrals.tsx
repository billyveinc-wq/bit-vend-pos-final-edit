import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Gift, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Crown,
  Calendar,
  DollarSign,
  Percent,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  phone: string;
  planId: string;
  planName: string;
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
  subscriptionExpiry: string;
  referralCode?: string;
  referralName?: string;
  discountApplied?: number;
  createdAt: string;
  lastLogin: string;
}

interface ReferralCode {
  id: string;
  code: string;
  referralName: string;
  firstName: string;
  lastName: string;
  discountPercent: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
  expiresAt?: string;
}

const SystemUsersReferrals = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddReferralDialog, setShowAddReferralDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  
  // Referral form state
  const [referralForm, setReferralForm] = useState({
    referralName: '',
    firstName: '',
    lastName: '',
    discountPercent: 30,
    maxUsage: '',
    expiresAt: ''
  });

  // Mock data - will be replaced with real database data
  const [systemUsers] = useState<SystemUser[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);

  const generateReferralCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PROMO${randomNum}`;
  };

  const handleCreateReferralCode = () => {
    if (!referralForm.referralName || !referralForm.firstName || !referralForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCode: ReferralCode = {
      id: Date.now().toString(),
      code: generateReferralCode(),
      referralName: referralForm.referralName,
      firstName: referralForm.firstName,
      lastName: referralForm.lastName,
      discountPercent: referralForm.discountPercent,
      isActive: true,
      usageCount: 0,
      maxUsage: referralForm.maxUsage ? parseInt(referralForm.maxUsage) : undefined,
      createdAt: new Date().toISOString(),
      expiresAt: referralForm.expiresAt || undefined
    };

    setReferralCodes(prev => [...prev, newCode]);
    
    // Reset form
    setReferralForm({
      referralName: '',
      firstName: '',
      lastName: '',
      discountPercent: 30,
      maxUsage: '',
      expiresAt: ''
    });
    
    setShowAddReferralDialog(false);
    toast.success(`Referral code ${newCode.code} created successfully!`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied to clipboard!');
  };

  const handleToggleReferralStatus = (id: string) => {
    setReferralCodes(prev => 
      prev.map(code => 
        code.id === id ? { ...code, isActive: !code.isActive } : code
      )
    );
    toast.success('Referral code status updated');
  };

  const handleDeleteReferralCode = (id: string) => {
    if (confirm('Are you sure you want to delete this referral code?')) {
      setReferralCodes(prev => prev.filter(code => code.id !== id));
      toast.success('Referral code deleted successfully');
    }
  };

  const handleViewUserDetails = (user: SystemUser) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = systemUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferralCodes = referralCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.referralName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${code.firstName} ${code.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users & Referral Management</h2>
          <p className="text-muted-foreground">Manage system users and referral codes</p>
        </div>
        {activeTab === 'referrals' && (
          <Dialog open={showAddReferralDialog} onOpenChange={setShowAddReferralDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Referral Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Referral Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referralName">Referral Name *</Label>
                  <Input
                    id="referralName"
                    placeholder="e.g., John's Referral Program"
                    value={referralForm.referralName}
                    onChange={(e) => setReferralForm({...referralForm, referralName: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={referralForm.firstName}
                      onChange={(e) => setReferralForm({...referralForm, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={referralForm.lastName}
                      onChange={(e) => setReferralForm({...referralForm, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Discount Percentage *</Label>
                  <Select 
                    value={referralForm.discountPercent.toString()} 
                    onValueChange={(value) => setReferralForm({...referralForm, discountPercent: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 25, 30, 35, 40, 45, 50].map(percent => (
                        <SelectItem key={percent} value={percent.toString()}>
                          {percent}% Off
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                    <Input
                      id="maxUsage"
                      type="number"
                      placeholder="Unlimited"
                      value={referralForm.maxUsage}
                      onChange={(e) => setReferralForm({...referralForm, maxUsage: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={referralForm.expiresAt}
                      onChange={(e) => setReferralForm({...referralForm, expiresAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateReferralCode} className="flex-1">
                    <Gift className="h-4 w-4 mr-2" />
                    Generate Code
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddReferralDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">System Users</TabsTrigger>
          <TabsTrigger value="referrals">Referral Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                System Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500">
                    <TableHead className="text-white font-semibold">User</TableHead>
                    <TableHead className="text-white font-semibold">Company</TableHead>
                    <TableHead className="text-white font-semibold">Plan</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Referral</TableHead>
                    <TableHead className="text-white font-semibold">Expires</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No users found</p>
                          <p className="text-sm text-muted-foreground">Users will appear here as they register</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.planName}</Badge>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionStatusBadge(user.subscriptionStatus)}
                        </TableCell>
                        <TableCell>
                          {user.referralCode ? (
                            <div>
                              <Badge variant="secondary" className="mb-1">{user.referralCode}</Badge>
                              {user.referralName && (
                                <p className="text-xs text-muted-foreground">{user.referralName}</p>
                              )}
                              {user.discountApplied && (
                                <p className="text-xs text-green-600">{user.discountApplied}% discount applied</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.subscriptionExpiry).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search referral codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Referral Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Codes ({filteredReferralCodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-500 hover:bg-purple-500">
                    <TableHead className="text-white font-semibold">Code</TableHead>
                    <TableHead className="text-white font-semibold">Referral Name</TableHead>
                    <TableHead className="text-white font-semibold">Contact Person</TableHead>
                    <TableHead className="text-white font-semibold">Discount</TableHead>
                    <TableHead className="text-white font-semibold">Usage</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Created</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferralCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Gift className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No referral codes found</p>
                          <p className="text-sm text-muted-foreground">Generate referral codes to track referrals</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReferralCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                              {code.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(code.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{code.referralName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{code.firstName} {code.lastName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <Percent className="w-3 h-3 mr-1" />
                            {code.discountPercent}% Off
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{code.usageCount}</span>
                            {code.maxUsage && <span className="text-muted-foreground"> / {code.maxUsage}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.isActive ? "default" : "secondary"}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(code.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleReferralStatus(code.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReferralCode(code.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
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
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                    <p className="font-medium">{selectedUser.companyName}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subscription Plan</Label>
                    <Badge variant="outline" className="mt-1">{selectedUser.planName}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getSubscriptionStatusBadge(selectedUser.subscriptionStatus)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expires</Label>
                    <p className="font-medium">{new Date(selectedUser.subscriptionExpiry).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Referral Code Used</Label>
                    {selectedUser.referralCode ? (
                      <div className="mt-1">
                        <Badge variant="secondary">{selectedUser.referralCode}</Badge>
                        {selectedUser.referralName && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedUser.referralName}</p>
                        )}
                        {selectedUser.discountApplied && (
                          <p className="text-sm text-green-600 mt-1">{selectedUser.discountApplied}% discount applied</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                  <p className="font-medium">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemUsersReferrals;