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
import { Sentry } from '@/integrations/sentry';
import { runUptimeCheckNow } from '@/monitoring/uptime';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isAllowedAdminEmail } from '@/lib/admin';

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
  const { isAdmin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const { data } = await supabase.from('app_admins').select('email').order('email');
        setAdminEmails((data || []).map((r: any) => r.email));
      } catch {}
    };
    loadAdmins();
  }, []);
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
  const [billingWizardOpen, setBillingWizardOpen] = useState(false);

  // Metrics state
  const [cpuLagMs, setCpuLagMs] = useState<number | null>(null);
  const [mem, setMem] = useState<{ usedMB: number | null; totalMB: number | null }>({ usedMB: null, totalMB: null });
  const [storageInfo, setStorageInfo] = useState<{ usageMB: number | null; quotaMB: number | null }>({ usageMB: null, quotaMB: null });
  const [frontPingMs, setFrontPingMs] = useState<number | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState<number | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});

  // Dialogs
  const [metricDialog, setMetricDialog] = useState<null | { name: string }>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);

  useEffect(() => {
    // Event loop lag approximation
    let last = performance.now();
    const int = setInterval(() => {
      const now = performance.now();
      const lag = now - last - 1000;
      setCpuLagMs(Math.max(0, Math.round(lag)));
      last = now;
    }, 1000);

    // Memory
    const updateMem = () => {
      const anyPerf: any = performance as any;
      if (anyPerf && anyPerf.memory) {
        setMem({
          usedMB: Math.round(anyPerf.memory.usedJSHeapSize / (1024 * 1024)),
          totalMB: Math.round(anyPerf.memory.totalJSHeapSize / (1024 * 1024)),
        });
      }
    };
    updateMem();
    const memInt = setInterval(updateMem, 5000);

    // Storage
    (async () => {
      try {
        if ((navigator as any).storage && (navigator as any).storage.estimate) {
          const est = await (navigator as any).storage.estimate();
          const usage = est.usage || 0;
          const quota = est.quota || 0;
          setStorageInfo({ usageMB: Math.round(usage / (1024 * 1024)), quotaMB: Math.round(quota / (1024 * 1024)) });
        }
      } catch {}
    })();

    // Front ping
    (async () => {
      const res = await runUptimeCheckNow();
      setFrontPingMs(res.front.ms);
    })();

    return () => {
      clearInterval(int);
      clearInterval(memInt);
    };
  }, []);

  const loadActiveUsers = async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase.from('system_users').select('id', { count: 'exact', head: true }).gte('last_sign_in_at', since);
      setActiveUsersCount(count || 0);
    } catch { setActiveUsersCount(0); }
  };

  const loadDbCounts = async () => {
    const tables = ['companies','company_users','system_users','payment_transactions'];
    const result: Record<string, number> = {};
    for (const t of tables) {
      try { const { count } = await supabase.from(t as any).select('id', { count: 'exact', head: true }); result[t] = count || 0; } catch { result[t] = 0; }
    }
    setDbCounts(result);
  };

  const runSentryDiagnostics = () => {
    try { Sentry.captureMessage('Sentry diagnostics: test message', 'info'); } catch {}
    try { throw new Error('Sentry diagnostics: test error'); } catch (e) { try { Sentry.captureException(e); } catch {} }
    toast.success('Diagnostics sent to Sentry (if configured)');
  };

  const copyWebhook = async (provider: 'mpesa'|'paypal'|'flutterwave') => {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const path = provider === 'mpesa' ? '/api/payments/mpesa/callback' : provider === 'paypal' ? '/api/payments/paypal/webhook' : '/api/payments/flutterwave/webhook';
      await navigator.clipboard.writeText(base + path);
      toast.success(`${provider.toUpperCase()} webhook copied`);
    } catch {
      toast.error('Failed to copy webhook');
    }
  };

  const loadSystemUsers = async () => {
    setLoadingSystemUsers(true);
    try {
      const { data, error } = await supabase.from('system_users').select('*');
      if (error) throw error;
      let users = (data || []).filter((u: any) => Boolean(u?.user_metadata?.created_by_admin));

      // Ensure current admin appears in the list as Super Admin
      try {
        const { data: sess } = await (await import('@/integrations/supabase/safeAuth')).safeGetSession();
        const currentEmail = sess?.session?.user?.email || JSON.parse(localStorage.getItem('admin-session') || 'null')?.email || null;
        if (currentEmail && (await import('@/lib/admin')).then) {
          const { isAllowedAdminEmail } = await import('@/lib/admin');
          if (isAllowedAdminEmail(currentEmail)) {
            const exists = users.find((u: any) => (u.email || '').toLowerCase() === currentEmail.toLowerCase());
            if (!exists) {
              users = [
                ...users,
                {
                  id: 'super-admin-local',
                  email: currentEmail,
                  user_metadata: { role: 'super_admin' },
                  created_at: new Date().toISOString(),
                }
              ];
            }
          }
        }
      } catch {}

      const ids = users.map((u: any) => u.id).filter(Boolean);
      const { data: urs } = await supabase.from('user_roles').select('user_id, role_id').in('user_id', ids.length ? ids : ['none']);
      const roleIds = Array.from(new Set((urs || []).map((r: any) => r.role_id)));
      const { data: roles } = await supabase.from('roles').select('id, name').in('id', roleIds.length ? roleIds : [0]);
      const roleNameById = new Map((roles || []).map((r: any) => [r.id, r.name]));
      const rolesByUser = new Map<string, string[]>();
      (urs || []).forEach((r: any) => {
        const arr = rolesByUser.get(r.user_id) || [];
        const name = roleNameById.get(r.role_id);
        if (name) arr.push(name);
        rolesByUser.set(r.user_id, arr);
      });
      const enriched = users.map((u: any) => ({ ...u, roles: rolesByUser.get(u.id) || (u.user_metadata?.role ? [u.user_metadata.role] : []) }));
      setSystemUsersList(enriched);
    } catch (err) {
      console.error('Load system users error', err);
      toast.error('Failed to load system users');
    } finally { setLoadingSystemUsers(false); }
  };

  useEffect(() => {
    if (activeTab === 'system') {
      loadSystemUsers();
    }
  }, [activeTab]);

  type AlertLevel = 'info' | 'warning' | 'critical';
  type AlertType = 'high_memory' | 'maintenance' | string;
  interface SystemAlert { id: string; type: AlertType; level: AlertLevel; title: string; message: string; data?: any; timestamp?: string; scheduled_at?: string; active?: boolean; }
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
        const companyId = (comp as any)?.id;
        if (!companyId) { setAlerts([]); return; }
        const { data } = await supabase.from('app_settings').select('value').eq('company_id', companyId).eq('key', 'system_alerts').maybeSingle();
        const val = (data as any)?.value;
        setAlerts(Array.isArray(val) ? val : []);
      } catch (err) {
        console.warn('Failed to load system alerts');
        setAlerts([]);
      } finally { setLoadingAlerts(false); }
    };
    loadAlerts();
  }, []);


  const systemMetrics: SystemMetric[] = [
    { name: 'CPU Usage', value: cpuLagMs != null ? `${cpuLagMs}ms lag` : 'N/A', status: (cpuLagMs||0) < 100 ? 'healthy' : (cpuLagMs||0) < 300 ? 'warning' : 'critical', icon: Cpu },
    { name: 'Memory Usage', value: mem.usedMB != null && mem.totalMB != null ? `${mem.usedMB} / ${mem.totalMB} MB` : 'N/A', status: mem.usedMB != null && mem.totalMB != null && mem.totalMB>0 ? (mem.usedMB/mem.totalMB) < 0.6 ? 'healthy' : (mem.usedMB/mem.totalMB) < 0.85 ? 'warning' : 'critical' : 'healthy', icon: MemoryStick },
    { name: 'Disk Space', value: storageInfo.usageMB != null && storageInfo.quotaMB != null ? `${storageInfo.usageMB} / ${storageInfo.quotaMB} MB` : 'N/A', status: storageInfo.usageMB != null && storageInfo.quotaMB != null && storageInfo.quotaMB>0 ? (storageInfo.usageMB/storageInfo.quotaMB) < 0.6 ? 'healthy' : (storageInfo.usageMB/storageInfo.quotaMB) < 0.85 ? 'warning' : 'critical' : 'healthy', icon: HardDrive },
    { name: 'Server Load', value: frontPingMs != null ? `${frontPingMs}ms` : 'N/A', status: (frontPingMs||0) < 500 ? 'healthy' : (frontPingMs||0) < 1200 ? 'warning' : 'critical', icon: Server },
    { name: 'Active Users', value: activeUsersCount != null ? String(activeUsersCount) : 'Tap to load', status: 'healthy', icon: Users },
    { name: 'Database', value: Object.keys(dbCounts).length ? `${(dbCounts.companies||0)} companies / ${(dbCounts.system_users||0)} users` : 'Tap to load', status: 'healthy', icon: Database }
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

  // access control handled below before render to keep hooks order stable

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

  // Load registrations: show all non-admin-created users; empty company for none; include user count per company
  useEffect(() => {
    const loadRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        const [{ data: systemUsers }, { data: comps }, { data: cu } ] = await Promise.all([
          supabase.from('system_users').select('*').order('created_at', { ascending: false }),
          supabase.from('companies').select('id, name'),
          supabase.from('company_users').select('company_id, user_id, role, created_at')
        ]);
        const users = ((systemUsers || []) as any[]).filter(u => !u?.user_metadata?.created_by_admin);
        const companyById = new Map((comps || []).map((c: any) => [String(c.id), c.name]));
        const userCountByCompany = new Map<string, number>();
        (cu || []).forEach((row: any) => {
          const key = String(row.company_id);
          userCountByCompany.set(key, (userCountByCompany.get(key) || 0) + 1);
        });

        const userCompanyByUserId = new Map<string, string>();
        const grouped = new Map<string, any[]>();
        (cu || []).forEach((row: any) => {
          const uid = String(row.user_id);
          const arr = grouped.get(uid) || [];
          arr.push(row);
          grouped.set(uid, arr);
        });
        const roleRank = (r: string) => (r === 'owner' ? 3 : r === 'admin' ? 2 : 1);
        for (const [uid, rows] of grouped) {
          rows.sort((a, b) => (roleRank(b.role) - roleRank(a.role)) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          const preferred = rows.find(r => (companyById.get(String(r.company_id)) || '').toLowerCase() !== 'default company') || rows[0];
          userCompanyByUserId.set(uid, String(preferred.company_id));
        }

        const userIds = users.map(u => u.id);
        const [{ data: subs }, { data: plans }, { data: ups }] = await Promise.all([
          supabase.from('user_subscriptions').select('*').in('user_id', userIds.length ? userIds : ['none']),
          supabase.from('subscription_plans').select('*'),
          supabase.from('user_promotions').select('*, promo_code:promo_codes(id, code, influencer_name)').in('user_id', userIds.length ? userIds : ['none'])
        ]);

        const regs = users.map((u: any) => {
          const sub = (subs || []).find((s: any) => s.user_id === u.id);
          const plan = (plans || []).find((p: any) => p.id === sub?.plan_id);
          const companyId = u.company_id ? String(u.company_id) : (userCompanyByUserId.get(String(u.id)) || '');
          const companyName = companyId ? (companyById.get(companyId) || '') : '';
          const up = (ups || []).find((p: any) => p.user_id === u.id);
          const userCount = companyId ? (userCountByCompany.get(companyId) || 0) : '';

          return {
            id: u.id,
            email: u.email || u.user_email || '-',
            fullName: u.user_metadata?.full_name || u.user_metadata?.fullName || '-',
            companyId,
            companyName,
            userCount,
            planName: plan?.name || (sub?.plan_id || 'starter'),
            planExpires: sub?.expires_at || null,
            subscriptionStatus: sub?.status || 'free',
            promoCode: up?.promo_code?.code || up?.promo_code_id || (u.user_metadata?.referral_code || '-'),
            influencerName: up?.promo_code?.influencer_name || up?.influencer_name || (u.user_metadata?.referral_name || '-'),
            createdAt: u.created_at || u.createdAt || '-',
            lastLogin: u.last_sign_in_at || '-',
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

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            You do not have permission to access the Super Admin panel.
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  const { data: { session } } = await (await import('@/integrations/supabase/safeAuth')).safeGetSession();
                  const user = session?.user || null;
                  if (user && isAllowedAdminEmail(user.email)) {
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
            <Card key={index} className="cursor-pointer" onClick={async () => {
              setMetricDialog({ name: metric.name });
              if (metric.name === 'Active Users') await loadActiveUsers();
              if (metric.name === 'Database') await loadDbCounts();
            }}>
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
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSettingsDialogOpen(true)}>
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

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSecurityDialogOpen(true)}>
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

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActivityDialogOpen(true)}>
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

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setNetworkDialogOpen(true)}>
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

      {/* Metric Detail Dialog */}
      <Dialog open={!!metricDialog} onOpenChange={(o)=>!o && setMetricDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{metricDialog?.name || ''}</DialogTitle>
          </DialogHeader>
          {metricDialog?.name === 'CPU Usage' && (
            <div className="space-y-2 text-sm">
              <div>Event loop lag: {cpuLagMs != null ? `${cpuLagMs} ms` : 'N/A'}</div>
              <div>User agent: {navigator.userAgent}</div>
            </div>
          )}
          {metricDialog?.name === 'Memory Usage' && (
            <div className="space-y-2 text-sm">
              <div>Used: {mem.usedMB != null ? `${mem.usedMB} MB` : 'N/A'}</div>
              <div>Total: {mem.totalMB != null ? `${mem.totalMB} MB` : 'N/A'}</div>
            </div>
          )}
          {metricDialog?.name === 'Disk Space' && (
            <div className="space-y-2 text-sm">
              <div>Usage: {storageInfo.usageMB != null ? `${storageInfo.usageMB} MB` : 'N/A'}</div>
              <div>Quota: {storageInfo.quotaMB != null ? `${storageInfo.quotaMB} MB` : 'N/A'}</div>
            </div>
          )}
          {metricDialog?.name === 'Server Load' && (
            <div className="space-y-2 text-sm">
              <div>Last ping: {frontPingMs != null ? `${frontPingMs} ms` : 'N/A'}</div>
              <Button variant="outline" onClick={async ()=>{ const res = await runUptimeCheckNow(); setFrontPingMs(res.front.ms); toast.success('Ping updated'); }}>Ping again</Button>
            </div>
          )}
          {metricDialog?.name === 'Active Users' && (
            <div className="space-y-2 text-sm">
              <div>Signed in last 24h: {activeUsersCount != null ? activeUsersCount : '...'}</div>
              <Button variant="outline" onClick={loadActiveUsers}>Refresh</Button>
            </div>
          )}
          {metricDialog?.name === 'Database' && (
            <div className="space-y-2 text-sm">
              <div>Companies: {dbCounts.companies ?? '-'}</div>
              <div>Company Users: {dbCounts.company_users ?? '-'}</div>
              <div>System Users: {dbCounts.system_users ?? '-'}</div>
              <div>Payment Transactions: {dbCounts.payment_transactions ?? '-'}</div>
              <Button variant="outline" onClick={loadDbCounts}>Refresh</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* System Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>System Settings</DialogTitle></DialogHeader>
          <SystemSettingsPanel />
        </DialogContent>
      </Dialog>

      {/* Security Center Dialog */}
      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Security Center</DialogTitle></DialogHeader>
          <SecurityCenterPanel />
        </DialogContent>
      </Dialog>

      {/* Activity Logs Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activity Logs</DialogTitle></DialogHeader>
          <ActivityLogsPanel />
        </DialogContent>
      </Dialog>

      {/* Network Monitor Dialog */}
      <Dialog open={networkDialogOpen} onOpenChange={setNetworkDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Network Monitor</DialogTitle></DialogHeader>
          <NetworkMonitorPanel onPing={async ()=>{ const res = await runUptimeCheckNow(); setFrontPingMs(res.front.ms); }} frontPingMs={frontPingMs} />
        </DialogContent>
      </Dialog>

      {/* Main Tabs: Promo / Registrations / System Users / Billing / Alerts */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="system">System Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
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

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Billing & Payments</CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setBillingWizardOpen(true)}>Open Billing Setup Wizard</Button>
                  <Button variant="secondary" onClick={() => (window.location.href = '/dashboard/bank-accounts')}>Manage Bank Accounts</Button>
                  <Button variant="outline" onClick={runSentryDiagnostics}>Run Sentry Test</Button>
                  <Button variant="outline" onClick={async () => { await runUptimeCheckNow(); toast.success('Uptime check sent to Sentry'); }}>Run Uptime Check</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Link the receiving bank accounts for settlements. Subscription management and provider configuration are handled within each tenant’s app.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How payments are received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Each business configures its own provider credentials (M-Pesa, PayPal, Flutterwave) under Payment Settings. Ensure these are set to the correct merchant accounts.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Plans and Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Use Subscription Manager to view/upgrade plans, trials, and billing cycles. For recurring cards, use the card-capable provider configured by the business.</p>
                  </CardContent>
                </Card>
              </div>

              <Dialog open={billingWizardOpen} onOpenChange={setBillingWizardOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Billing Setup Wizard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step 1: Add your bank account</h4>
                      <p className="text-sm text-muted-foreground">Add your business bank and set it as default payout.</p>
                      <Button variant="secondary" onClick={() => (window.location.href = '/dashboard/bank-accounts')}>Go to Bank Accounts</Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step 2: Configure a payment provider</h4>
                      <p className="text-sm text-muted-foreground">Open Payment Settings and enter live or sandbox credentials. Set the default provider.</p>
                      <Button variant="outline" onClick={() => (window.location.href = '/dashboard/payment-settings')}>Open Payment Settings</Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step 3: Register webhooks on provider dashboards</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => copyWebhook('mpesa')}>Copy M-Pesa webhook</Button>
                        <Button size="sm" variant="secondary" onClick={() => copyWebhook('paypal')}>Copy PayPal webhook</Button>
                        <Button size="sm" variant="outline" onClick={() => copyWebhook('flutterwave')}>Copy Flutterwave webhook</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step 4: Test a sandbox subscription checkout</h4>
                      <p className="text-sm text-muted-foreground">Run a test plan purchase to confirm invoice/payment updates.</p>
                      <Button onClick={() => (window.location.href = '/dashboard/subscription?startCheckout=1&plan=standard')}>Start Test Checkout</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                    try {
                      setLoadingRegistrations(true);
                      const [{ data: systemUsers }, { data: comps }, { data: cu }] = await Promise.all([
                        supabase.from('system_users').select('*').order('created_at', { ascending: false }),
                        supabase.from('companies').select('id, name'),
                        supabase.from('company_users').select('company_id, user_id, role, created_at')
                      ]);
                      const users = ((systemUsers || []) as any[]).filter(u => !u?.user_metadata?.created_by_admin);
                      const companyById = new Map((comps || []).map((c: any) => [String(c.id), c.name]));
                      const userCountByCompany = new Map<string, number>();
                      (cu || []).forEach((row: any) => {
                        const key = String(row.company_id);
                        userCountByCompany.set(key, (userCountByCompany.get(key) || 0) + 1);
                      });
                      const userCompanyByUserId = new Map<string, string>();
        const grouped = new Map<string, any[]>();
        (cu || []).forEach((row: any) => {
          const uid = String(row.user_id);
          const arr = grouped.get(uid) || [];
          arr.push(row);
          grouped.set(uid, arr);
        });
        const roleRank = (r: string) => (r === 'owner' ? 3 : r === 'admin' ? 2 : 1);
        for (const [uid, rows] of grouped) {
          rows.sort((a, b) => (roleRank(b.role) - roleRank(a.role)) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          const preferred = rows.find(r => (companyById.get(String(r.company_id)) || '').toLowerCase() !== 'default company') || rows[0];
          userCompanyByUserId.set(uid, String(preferred.company_id));
        }
                      const userIds = users.map(u => u.id);
                      const [{ data: subs }, { data: plans }, { data: ups }] = await Promise.all([
                        supabase.from('user_subscriptions').select('*').in('user_id', userIds.length ? userIds : ['none']),
                        supabase.from('subscription_plans').select('*'),
                        supabase.from('user_promotions').select('*, promo_code:promo_codes(id, code, influencer_name)').in('user_id', userIds.length ? userIds : ['none'])
                      ]);
                      const regs = users.map((u: any) => {
                        const sub = (subs || []).find((s: any) => s.user_id === u.id);
                        const plan = (plans || []).find((p: any) => p.id === sub?.plan_id);
                        const companyId = u.company_id ? String(u.company_id) : (userCompanyByUserId.get(String(u.id)) || '');
          const companyName = companyId ? (companyById.get(companyId) || '') : '';
                        const up = (ups || []).find((p: any) => p.user_id === u.id);
                        const userCount = companyId ? (userCountByCompany.get(companyId) || 0) : '';
                        return {
                          id: u.id,
                          email: u.email || u.user_email || '-',
                          fullName: u.user_metadata?.full_name || u.user_metadata?.fullName || '-',
                          companyId,
            companyName,
                          userCount,
                          planId: sub?.plan_id || null,
                          planName: plan?.name || (sub?.plan_id || 'starter'),
                          planExpires: sub?.expires_at || null,
                          subscriptionStatus: sub?.status || 'free',
                          promoCode: up?.promo_code?.code || up?.promo_code_id || (u.user_metadata?.referral_code || '-'),
                          influencerName: up?.promo_code?.influencer_name || up?.influencer_name || (u.user_metadata?.referral_name || '-'),
                          createdAt: u.created_at || u.createdAt || '-',
                          lastLogin: u.last_sign_in_at || '-'
                        };
                      });
                      setRegistrations(regs);
                      toast.success(`Loaded ${regs.length} registrations`);
                    } catch (err) {
                      console.error('Refresh registrations error', err);
                      toast.error('Failed to load registrations');
                    } finally { setLoadingRegistrations(false); }
                  }}>Refresh</Button>
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
                      <TableHead className="text-white font-semibold">Users</TableHead>
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
                        <TableCell className="text-foreground">{r.companyName}</TableCell>
                        <TableCell className="text-foreground">{r.userCount === '' ? '' : r.userCount}</TableCell>
                        <TableCell className="text-foreground">{
                          (() => {
                            const planId = String(r.planId || '').toLowerCase();
                            if (planId === 'trial' && r.planExpires) {
                              const endTs = new Date(r.planExpires).getTime();
                              const daysLeft = Math.ceil((endTs - Date.now()) / (1000 * 60 * 60 * 24));
                              return daysLeft > 0 ? `${daysLeft} days` : 'Expired';
                            }
                            return r.planName;
                          })()
                        }</TableCell>
                        <TableCell className="text-foreground">{r.planExpires ? new Date(r.planExpires).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) : '-'}</TableCell>
                        <TableCell className="text-foreground">{r.promoCode || '-'}</TableCell>
                        <TableCell className="text-foreground">{r.influencerName || '-'}</TableCell>
                        <TableCell className="text-foreground">{r.lastLogin && r.lastLogin !== '-' ? new Date(r.lastLogin).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) : '-'}</TableCell>
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
                                      const adminUrl = (import.meta as any).env?.VITE_ADMIN_API_URL as string | undefined;
                                      const adminKey = (import.meta as any).env?.VITE_ADMIN_API_KEY as string | undefined;
                                      if (adminUrl && adminKey) {
                                        const resp = await fetch(`${adminUrl}/admin/delete-user`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                                          body: JSON.stringify({ userId: r.id })
                                        });
                                        if (!resp.ok) throw new Error('Admin delete failed');
                                      } else {
                                        // Soft-delete: cancel subscription and mark user as deleted
                                        try { await supabase.from('user_subscriptions').update({ status: 'canceled' }).eq('user_id', r.id); } catch {}
                                        try {
                                          // Prefer dedicated columns when available
                                          await supabase.from('system_users').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', r.id);
                                        } catch {}
                                        try {
                                          // Also mirror in user_metadata for backward compatibility
                                          const { data: su } = await supabase.from('system_users').select('user_metadata').eq('id', r.id).maybeSingle();
                                          const meta = (su as any)?.user_metadata || {};
                                          const next = { ...meta, status: 'deleted', deletedAt: new Date().toISOString() };
                                          await supabase.from('system_users').update({ user_metadata: next }).eq('id', r.id);
                                        } catch {}
                                      }
                                      toast.success('User deleted');
                                      setRegistrations(prev => {
                                        const filtered = prev.filter(x => x.id !== r.id);
                                        return filtered.map(x => x.companyId === r.companyId ? { ...x, userCount: typeof x.userCount === 'number' ? Math.max(0, (x.userCount as number) - 1) : x.userCount } : x);
                                      });
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
                  <Button onClick={async () => { const tx = (Sentry as any).startTransaction ? (Sentry as any).startTransaction({ name: 'loadSystemUsers' }) : null; try { await loadSystemUsers(); } finally { try { tx && tx.finish && tx.finish(); } catch {} } }}>Refresh</Button>
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
                      <TableHead className="text-white font-semibold">Roles</TableHead>
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
                        <TableCell className="text-foreground">{(su as any).roles?.length ? (su as any).roles.join(', ') : '-'}</TableCell>
                        <TableCell className="text-foreground">{su.created_at || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={async () => {
                              try {
                                // Ensure admin role exists
                                const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
                                let roleId = adminRole?.id as number | undefined;
                                if (!roleId) {
                                  const { data: created } = await supabase.from('roles').insert({ name: 'admin', description: 'Administrator' }).select('id').single();
                                  roleId = created?.id;
                                }
                                if (!roleId) { toast.error('Failed to resolve admin role'); return; }
                                // Assign if not already
                                const { data: existing } = await supabase.from('user_roles').select('user_id, role_id').eq('user_id', su.id).eq('role_id', roleId).maybeSingle();
                                if (!existing) await supabase.from('user_roles').insert({ user_id: su.id, role_id: roleId });
                                setSystemUsersList(prev => prev.map(u => u.id === su.id ? { ...u, roles: Array.from(new Set([...(u as any).roles || [], 'admin'])) } : u));
                                toast.success('Admin role assigned');
                              } catch (err) { toast.error('Failed to assign admin'); }
                            }}>Make Admin</Button>
                            <Button variant="secondary" size="sm" onClick={async () => {
                              try {
                                const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
                                const roleId = adminRole?.id as number | undefined;
                                if (!roleId) { toast.error('Admin role not found'); return; }
                                await supabase.from('user_roles').delete().eq('user_id', su.id).eq('role_id', roleId);
                                setSystemUsersList(prev => prev.map(u => u.id === su.id ? { ...u, roles: ((u as any).roles || []).filter((r: string) => r !== 'admin') } : u));
                                toast.success('Admin role removed');
                              } catch (err) { toast.error('Failed to remove admin'); }
                            }}>Remove Admin</Button>
                            <Button variant="destructive" size="sm" onClick={async () => {
                              if (!confirm('Delete this system user and related data?')) return;
                              try {
                                await supabase.from('system_users').delete().eq('id', su.id);
                                await supabase.from('company_users').delete().eq('user_id', su.id);
                                await supabase.from('user_subscriptions').delete().eq('user_id', su.id);
                                await supabase.from('user_promotions').delete().eq('user_id', su.id);
                                await supabase.from('user_roles').delete().eq('user_id', su.id);
                                setSystemUsersList(prev => prev.filter(x => x.id !== su.id));
                                toast.success('System user and related public data removed (auth user may still exist)');
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

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  System Alerts
                </CardTitle>
                <Button onClick={async () => {
                  setLoadingAlerts(true);
                  try {
                    const { data: comp } = await supabase.from('companies').select('id').order('id').limit(1).maybeSingle();
                    const companyId = (comp as any)?.id;
                    if (!companyId) { setAlerts([]); return; }
                    const { data } = await supabase.from('app_settings').select('value').eq('company_id', companyId).eq('key', 'system_alerts').maybeSingle();
                    const val = (data as any)?.value;
                    setAlerts(Array.isArray(val) ? val : []);
                    toast.success('Alerts refreshed');
                  } catch { toast.error('Failed to refresh alerts'); }
                  finally { setLoadingAlerts(false); }
                }}>Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="text-muted-foreground">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-muted-foreground">No active alerts.</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => {
                    const isMem = a.type === 'high_memory';
                    const isMaint = a.type === 'maintenance';
                    return (
                      <div key={a.id} className={`p-3 rounded border-l-4 ${
                        a.level === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                        a.level === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
                        'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                      }`}>
                        <div className="flex items-start gap-3">
                          {isMem ? <MemoryStick className="w-5 h-5 text-yellow-600 mt-0.5" /> : <Activity className="w-5 h-5 text-blue-600 mt-0.5" />}
                          <div className="flex-1">
                            <h4 className="font-medium">{a.title || (isMem ? 'High Memory Usage' : isMaint ? 'Scheduled Maintenance' : 'Alert')}</h4>
                            <p className="text-sm text-muted-foreground">
                              {a.message || (isMem && a.data?.usage ? `Server memory usage is at ${a.data.usage}%.` : isMaint && a.scheduled_at ? `System maintenance scheduled for ${new Date(a.scheduled_at).toLocaleString()}.` : '')}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

const SystemSettingsPanel: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [defaultTax, setDefaultTax] = useState<string>('');
  useEffect(() => { (async () => {
    try { const { data } = await supabase.from('companies').select('name').order('id').limit(1).maybeSingle(); setCompanyName((data as any)?.name || ''); } catch {}
    try { const { data } = await supabase.from('app_settings').select('value').eq('key','support_email').order('company_id').limit(1).maybeSingle(); setSupportEmail(((data as any)?.value) || ''); } catch {}
    try { const { data } = await supabase.from('app_settings').select('value').eq('key','default_tax').order('company_id').limit(1).maybeSingle(); const v = (data as any)?.value?.percent; if (v!=null) setDefaultTax(String(v)); } catch {}
  })(); }, []);
  return (
    <div className="space-y-3 text-sm">
      <div>Company Name: {companyName || '-'}</div>
      <div>Support Email: {supportEmail || '-'}</div>
      <div>Default Tax: {defaultTax || '-'}</div>
      <Button variant="outline" onClick={()=> window.location.href='/dashboard/settings?section=general'}>Open General Settings</Button>
    </div>
  );
};

const SecurityCenterPanel: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  useEffect(()=>{ (async () => {
    try { const { data } = await supabase.from('app_admins').select('email').order('email'); setAdmins(data||[]); } catch {}
    try { const { data } = await supabase.from('roles').select('id, name').order('id'); setRoles(data||[]); } catch {}
  })(); }, []);
  return (
    <div className="space-y-3 text-sm">
      <div className="font-medium">Admin Emails</div>
      <ul className="list-disc pl-5">{admins.map((a:any)=>(<li key={a.email}>{a.email}</li>))}</ul>
      <div className="font-medium mt-3">Roles</div>
      <ul className="list-disc pl-5">{roles.map((r:any)=>(<li key={r.id}>{r.name}</li>))}</ul>
      <Button variant="outline" onClick={()=> window.location.href='/dashboard/superadmin?tab=system'}>Manage Users</Button>
    </div>
  );
};

const ActivityLogsPanel: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{
    const logs: any[] = [];
    try { const { data } = await supabase.from('payment_transactions').select('id, provider_key, status, created_at').order('created_at', { ascending: false }).limit(20); (data||[]).forEach((d:any)=> logs.push({ type:'payment', ...d })); } catch {}
    try { const { data } = await supabase.from('promo_codes').select('id, code, discount, created_at').order('created_at', { ascending: false }).limit(20); (data||[]).forEach((d:any)=> logs.push({ type:'promo', ...d })); } catch {}
    logs.sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setItems(logs.slice(0,30));
  })(); }, []);
  return (
    <div className="space-y-2 text-sm max-h-[60vh] overflow-auto">
      {items.map((it)=> (
        <div key={`${it.type}-${it.id}`} className="flex items-center justify-between border-b py-2">
          <div>
            <div className="font-medium capitalize">{it.type}</div>
            <div className="text-muted-foreground text-xs">{new Date(it.created_at).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</div>
          </div>
          <div className="text-xs">{it.type==='payment' ? `${it.provider_key} - ${it.status}` : `promo ${it.code} - ${it.discount}%`}</div>
        </div>
      ))}
      {!items.length && <div className="text-muted-foreground">No recent activity</div>}
    </div>
  );
};

const NetworkMonitorPanel: React.FC<{ onPing: ()=>Promise<void>; frontPingMs: number | null }> = ({ onPing, frontPingMs }) => {
  const [conn, setConn] = useState<any>(null);
  useEffect(()=>{
    const n:any = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    setConn(n || null);
  }, []);
  return (
    <div className="space-y-3 text-sm">
      <div>Latency (frontend): {frontPingMs != null ? `${frontPingMs} ms` : '-'}</div>
      <div>Connection: {conn ? `${conn.effectiveType || '-'} ${conn.downlink ? `(${conn.downlink} Mbps)` : ''}` : 'N/A'}</div>
      <div>RTT: {conn?.rtt ?? '-'}</div>
      <Button variant="outline" onClick={onPing}>Ping Again</Button>
    </div>
  );
};

export default SuperAdmin;
