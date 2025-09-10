import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Activity, 
  Globe,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SystemUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
}

const SuperAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'admin' as SystemUser['role'],
    status: 'active' as SystemUser['status']
  });
  const [managePassOpen, setManagePassOpen] = useState(false);
  const [managePassForm, setManagePassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showManageCurrent, setShowManageCurrent] = useState(false);
  const [showManageNew, setShowManageNew] = useState(false);
  const [showManageConfirm, setShowManageConfirm] = useState(false);

  const [systemUsers] = useState<SystemUser[]>([]);

  // Tabs and registrations state
  const [activeTab, setActiveTab] = useState<'promo' | 'registrations' | 'system'>('promo');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [systemUsersList, setSystemUsersList] = useState<any[]>([]);
  const [loadingSystemUsers, setLoadingSystemUsers] = useState(false);


  const systemMetrics: SystemMetric[] = [
    { name: 'CPU Usage', value: '23%', status: 'healthy', icon: Cpu },
    { name: 'Memory Usage', value: '67%', status: 'warning', icon: MemoryStick },
    { name: 'Disk Space', value: '45%', status: 'healthy', icon: HardDrive },
    { name: 'Server Load', value: '1.2', status: 'healthy', icon: Server },
    { name: 'Active Users', value: '1,234', status: 'healthy', icon: Users },
    { name: 'Database Size', value: '2.4 GB', status: 'healthy', icon: Database }
  ];

  const filteredUsers = useMemo(() => {
    return systemUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [systemUsers, searchTerm, roleFilter]);

  const getRoleBadge = (role: SystemUser['role']) => {
    const variants: { [key: string]: "default" | "destructive" | "outline" | "secondary" } = {
      super_admin: 'destructive',
      admin: 'default',
      moderator: 'secondary'
    };
    return variants[role];
  };

  const getStatusBadge = (status: SystemUser['status']) => {
    const variants: { [key: string]: "default" | "destructive" | "outline" | "secondary" } = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    };
    return variants[status];
  };

  const getMetricStatusColor = (status: SystemMetric['status']) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[status];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingUser) {
        toast.success('User created successfully!');
      } else {
        toast.success('User updated successfully!');
      }
    } catch (err) {
      console.error('handleSubmit error', err);
      toast.error('Unexpected error');
    } finally {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      role: 'admin',
      status: 'active'
    });
    setEditingUser(null);
    setShowAddDialog(false);
  };

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowAddDialog(true);
  };

  const handleDelete = (userId: number) => {
    toast.success('User deleted successfully!');
  };

  const [promoCodes, setPromoCodes] = useState<Array<{id: number; name: string; code: string; discount: number; created_at?: string}>>([]);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(10);
  const [promoInfluencer, setPromoInfluencer] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Load promo codes from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('promo_codes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('Failed to fetch promo codes from Supabase:', error);
          return;
        }
        if (data) setPromoCodes(data as any[]);
      } catch (err) {
        console.warn('Failed to load promo codes', err);
      }
    };
    load();
  }, []);

  // Load registrations (users + subscriptions + promotions)
  useEffect(() => {
    const loadRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        // First, attempt to call admin endpoint to list auth users (requires admin server and admin-api-key in localStorage)
        let users: any = null;
        try {
          const adminKey = localStorage.getItem('admin-api-key') || '';
          const resp = await fetch('/admin/list-users', { headers: { 'x-admin-key': adminKey } });
          if (resp.ok) {
            const json = await resp.json();
            users = json.users || [];
          }
        } catch (err) {
          // ignore and fallback
          console.warn('Admin list-users endpoint not available', err);
        }

        if (!users) {
          // Try to fetch users from auth.users via client (may be restricted depending on your Supabase RLS).
          const { data: udata, error: usersErr } = await supabase
            .from('users')
            .select('id, email, user_metadata, created_at, last_sign_in_at');

          if (usersErr) {
            console.warn('Could not fetch auth.users directly:', usersErr);
            // Fallback to system_users table if present
            const { data: systemUsers, error: suErr } = await supabase.from('system_users').select('*');
            if (suErr) {
              console.warn('Could not fetch system_users fallback:', suErr);
              users = [] as any;
            } else {
              users = systemUsers as any;
            }
          } else {
            users = udata as any;
          }
        }

        const userIds = (users || []).map((u: any) => u.id).filter(Boolean);

        const { data: subs } = await supabase.from('user_subscriptions').select('*').in('user_id', userIds || []);
        const { data: plans } = await supabase.from('subscription_plans').select('*');
        const { data: ups } = await supabase.from('user_promotions').select('*, promo_code:promo_codes(id, code, influencer_name)').in('user_id', userIds || []);

        const regs = (users || []).map((u: any) => {
          const sub = (subs || []).find((s: any) => s.user_id === u.id);
          const plan = (plans || []).find((p: any) => p.id === sub?.plan_id);
          const up = (ups || []).find((p: any) => p.user_id === u.id);

          return {
            id: u.id,
            email: u.email || u.user_email || '-',
            fullName: u.user_metadata?.full_name || u.user_metadata?.fullName || '-',
            companyName: u.user_metadata?.company_name || u.user_metadata?.company || '-',
            planName: plan?.name || (sub?.plan_id || 'starter'),
            planExpires: sub?.expires_at || null,
            subscriptionStatus: sub?.status || 'free',
            promoCode: up?.promo_code?.code || up?.promo_code_id || (u.user_metadata?.referral_code || '-') ,
            influencerName: up?.promo_code?.influencer_name || up?.influencer_name || (u.user_metadata?.referral_name || '-') ,
            createdAt: u.created_at || u.createdAt || '-',
            lastLogin: u.last_sign_in_at || u.lastLogin || '-',
          };
        });

        setRegistrations(regs);
      } catch (err) {
        console.error('Failed loading registrations', err);
        setRegistrations([]);
      } finally {
        setLoadingRegistrations(false);
      }
    };
    loadRegistrations();
  }, []);

  const generatePromoCode = async () => {
    for (let i = 0; i < 5; i++) {
      const num = Math.floor(Math.random() * 10000);
      const code = `PROMO${String(num).padStart(4, '0')}`;
      if (!promoCodes.find(p => p.code === code)) return code;
    }
    return `PROMO${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  };

  const handleCreatePromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoName) { toast.error('Please enter a name for this promo'); return; }
    if (![10,20,30,40,50].includes(promoDiscount)) { toast.error('Please select a valid discount'); return; }
    try {
      const code = promoCode || await generatePromoCode();
      const { data, error } = await supabase.from('promo_codes').insert({ name: promoName, code, discount: promoDiscount, influencer_name: promoInfluencer }).select().single();
      if (error) { console.error('Error inserting promo code:', error); toast.error('Failed to create promo code'); return; }
      setPromoCodes(prev => [data, ...prev]);
      toast.success(`Promo ${data.code} created (${data.discount}% off)`);
      setPromoDialogOpen(false);
      setPromoName(''); setPromoDiscount(10); setPromoInfluencer(''); setPromoCode('');
    } catch (err) {
      console.error('Create promo error', err); toast.error('Failed to create promo code');
    }
  };

  const handleDeletePromo = async (id: number) => {
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) {
        console.error('Error deleting promo', error);
        toast.error('Failed to delete promo');
        return;
      }
      const updated = promoCodes.filter(p => p.id !== id);
      setPromoCodes(updated);
      toast.success('Promo code deleted');
    } catch (err) {
      console.error('Delete promo error', err);
      toast.error('Failed to delete promo');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPromoDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Promo Code</Button>
          <Button onClick={() => setManagePassOpen(true)} className="bg-save hover:bg-save-hover text-save-foreground">Manage Password</Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-save hover:bg-save-hover text-save-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: SystemUser['role']) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: SystemUser['status']) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="bg-cancel hover:bg-cancel-hover text-cancel-foreground">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-save hover:bg-save-hover text-save-foreground">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAdminKeyDialog} onOpenChange={setShowAdminKeyDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Admin API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminKey">Admin API Key (stored in localStorage)</Label>
                  <Input id="adminKey" value={adminKeyInput} onChange={(e) => setAdminKeyInput(e.target.value)} placeholder="paste your ADMIN_API_KEY here" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setAdminKeyInput(''); saveAdminKey(''); }}>Clear</Button>
                  <Button onClick={() => saveAdminKey()}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={managePassOpen} onOpenChange={setManagePassOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Admin Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const { currentPassword, newPassword, confirmPassword } = managePassForm;
                if (!currentPassword || !newPassword || !confirmPassword) { toast.error('Fill all fields'); return; }
                if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
                if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  const user = session?.user || null;
                  if (user && user.email === 'admn.bitvend@gmail.com') {
                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                    if (error) {
                      console.error('Supabase password update failed', error);
                      // ensure local fallback so admin isn't locked out
                      localStorage.setItem('admin-password', newPassword);
                      toast.error('Failed to update Supabase password — stored locally as fallback');
                    } else {
                      localStorage.setItem('admin-password', newPassword);
                      toast.success('Password updated in Supabase');
                    }
                  } else {
                    localStorage.setItem('admin-password', newPassword);
                    toast.success('Local admin password updated');
                  }
                } catch (err) {
                  console.error('Manage password error', err);
                  toast.error('Failed to update password');
                } finally {
                  setManagePassOpen(false);
                  setManagePassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mp-current">Current Password</Label>
                  <div className="relative">
                    <Input id="mp-current" type={showManageCurrent ? "text" : "password"} value={managePassForm.currentPassword} onChange={(e) => setManagePassForm(prev => ({ ...prev, currentPassword: e.target.value }))} required />
                    <button type="button" onClick={() => setShowManageCurrent(!showManageCurrent)} className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors">{showManageCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mp-new">New Password</Label>
                  <div className="relative">
                    <Input id="mp-new" type={showManageNew ? "text" : "password"} value={managePassForm.newPassword} onChange={(e) => setManagePassForm(prev => ({ ...prev, newPassword: e.target.value }))} required />
                    <button type="button" onClick={() => setShowManageNew(!showManageNew)} className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors">{showManageNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mp-confirm">Confirm New Password</Label>
                  <div className="relative">
                    <Input id="mp-confirm" type={showManageConfirm ? "text" : "password"} value={managePassForm.confirmPassword} onChange={(e) => setManagePassForm(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
                    <button type="button" onClick={() => setShowManageConfirm(!showManageConfirm)} className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors">{showManageConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setManagePassOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-save hover:bg-save-hover text-save-foreground">Change Password</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Promo Code</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreatePromo(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promoName">Promo Name</Label>
                  <Input id="promoName" value={promoName} onChange={(e) => setPromoName(e.target.value)} placeholder="E.g. Summer Sale" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promoCodeInput">Promo Code</Label>
                    <div className="flex gap-2">
                      <Input id="promoCodeInput" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="PROMO0001" />
                      <Button type="button" onClick={async () => { const code = await generatePromoCode(); setPromoCode(code); }}>Generate</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoInfluencer">Influencer Name</Label>
                    <Input id="promoInfluencer" value={promoInfluencer} onChange={(e) => setPromoInfluencer(e.target.value)} placeholder="Influencer name (optional)" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promoDiscount">Discount</Label>
                  <Select value={String(promoDiscount)} onValueChange={(v) => setPromoDiscount(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-save hover:bg-save-hover text-save-foreground">Create Promo</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metric.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' :
                    metric.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <Icon className={`w-4 h-4 ${getMetricStatusColor(metric.status)}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground truncate">{metric.name}</p>
                    <p className={`font-bold ${getMetricStatusColor(metric.status)}`}>{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">System Settings</h3>
                <p className="text-sm text-muted-foreground">Configure system parameters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Security Center</h3>
                <p className="text-sm text-muted-foreground">Manage security policies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Activity Logs</h3>
                <p className="text-sm text-muted-foreground">View system activity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Network Monitor</h3>
                <p className="text-sm text-muted-foreground">Monitor network status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Promo / Registrations */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="system">System Users</TabsTrigger>
        </TabsList>

        <TabsContent value="promo">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Promo Codes</CardTitle>
                <div className="flex items-center gap-4">
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {promoCodes.length === 0 ? (
                <div className="text-muted-foreground">No promo codes created yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.code}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.discount}%</TableCell>
                        <TableCell>{(p as any).influencer_name || '-'}</TableCell>
                        <TableCell>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(p.code)}>
                              Copy
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePromo(p.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registrations & Companies</CardTitle>
                <div className="flex items-center gap-4">
                  <Input placeholder="Search registrations..." onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
                  <Button onClick={async () => {
                    const adminKey = localStorage.getItem('admin-api-key') || '';
                    if (!adminKey) { toast.error('Admin key not set — open Admin Key and paste your ADMIN_API_KEY'); return; }
                    try {
                      const resp = await fetch('/admin/sync-users', { method: 'POST', headers: { 'x-admin-key': adminKey } });
                      if (!resp.ok) throw new Error('Sync failed');
                      const j = await resp.json();
                      toast.success(`Synced ${j.count || 0} users to system_users`);
                      // reload registrations
                      window.location.reload();
                    } catch (err) {
                      console.error('Sync users error', err);
                      toast.error('Failed to sync users; ensure admin server is running and admin key is correct');
                    }
                  }}>Sync Users</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRegistrations ? (
                <div className="text-muted-foreground">Loading registrations...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-500 hover:bg-blue-500">
                      <TableHead className="text-white font-semibold">Email</TableHead>
                      <TableHead className="text-white font-semibold">Company</TableHead>
                      <TableHead className="text-white font-semibold">Plan</TableHead>
                      <TableHead className="text-white font-semibold">Expires</TableHead>
                      <TableHead className="text-white font-semibold">Promo Code</TableHead>
                      <TableHead className="text-white font-semibold">Influencer</TableHead>
                      <TableHead className="text-white font-semibold">Last Login</TableHead>
                      <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-foreground">{r.email}</TableCell>
                        <TableCell className="text-foreground">{r.companyName || '-'}</TableCell>
                        <TableCell className="text-foreground">{r.planName}</TableCell>
                        <TableCell className="text-foreground">{r.planExpires ? new Date(r.planExpires).toLocaleString() : '-'}</TableCell>
                        <TableCell className="text-foreground">{r.promoCode || '-'}</TableCell>
                        <TableCell className="text-foreground">{r.influencerName || '-'}</TableCell>
                        <TableCell className="text-foreground">{r.lastLogin || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete this user account? This will remove related subscriptions and promotions and attempt to delete the auth user via the secure admin endpoint.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    try {
                                      // Attempt to call admin server to fully delete auth user
                                      const adminKey = localStorage.getItem('admin-api-key') || '';
                                      const resp = await fetch('/admin/delete-user', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                                        body: JSON.stringify({ userId: r.id })
                                      });

                                      if (resp.ok) {
                                        toast.success('User fully deleted from Auth and related tables');
                                        setRegistrations(prev => prev.filter(x => x.id !== r.id));
                                        return;
                                      }

                                      // If admin endpoint failed or is not available, fallback to deleting public data
                                      await supabase.from('user_subscriptions').delete().eq('user_id', r.id);
                                      await supabase.from('user_promotions').delete().eq('user_id', r.id);
                                      await supabase.from('company_users').delete().eq('user_id', r.id);
                                      await supabase.from('system_users').delete().eq('id', r.id);
                                      toast.success('User related data removed. Admin endpoint unavailable or failed; auth user may still exist.');
                                      setRegistrations(prev => prev.filter(x => x.id !== r.id));
                                    } catch (err) {
                                      console.error('Delete registration error', err);
                                      toast.error('Failed to remove user data');
                                    }
                                  }}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Users</CardTitle>
                <div>
                  <Button onClick={async () => {
                    setLoadingSystemUsers(true);
                    try {
                      const { data, error } = await supabase.from('system_users').select('*');
                      if (error) throw error;
                      setSystemUsersList(data || []);
                      toast.success('System users loaded');
                    } catch (err) {
                      console.error('Load system users error', err);
                      toast.error('Failed to load system users');
                    } finally { setLoadingSystemUsers(false); }
                  }}>Refresh</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSystemUsers ? (
                <div className="text-muted-foreground">Loading system users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-500 hover:bg-blue-500">
                      <TableHead className="text-white font-semibold">ID</TableHead>
                      <TableHead className="text-white font-semibold">Email</TableHead>
                      <TableHead className="text-white font-semibold">Company ID</TableHead>
                      <TableHead className="text-white font-semibold">Created</TableHead>
                      <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemUsersList.map((su) => (
                      <TableRow key={su.id}>
                        <TableCell className="text-foreground">{su.id}</TableCell>
                        <TableCell className="text-foreground">{su.email}</TableCell>
                        <TableCell className="text-foreground">{su.company_id || '-'}</TableCell>
                        <TableCell className="text-foreground">{su.created_at || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (!confirm('Delete this system user and related data?')) return;
                              try {
                                const adminKey = localStorage.getItem('admin-api-key') || '';
                                const resp = await fetch('/admin/delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ userId: su.id }) });
                                if (resp.ok) {
                                  setSystemUsersList(prev => prev.filter(x => x.id !== su.id));
                                  toast.success('User deleted via admin endpoint');
                                } else {
                                  await supabase.from('system_users').delete().eq('id', su.id);
                                  setSystemUsersList(prev => prev.filter(x => x.id !== su.id));
                                  toast.success('System user removed (auth user may still exist)');
                                }
                              } catch (err) {
                                console.error('Delete system user error', err);
                                toast.error('Failed to delete system user');
                              }
                            }}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium">High Memory Usage</h4>
                  <p className="text-sm text-muted-foreground">Server memory usage is at 67%. Consider optimizing or upgrading.</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Scheduled Maintenance</h4>
                  <p className="text-sm text-muted-foreground">System maintenance scheduled for tonight at 2:00 AM UTC.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default SuperAdmin;
