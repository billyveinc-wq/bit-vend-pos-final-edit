import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  UserCog, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    status: 'active' as User['status'],
    password: '',
    confirmPassword: ''
  });

  const AVAILABLE_PAGES = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/checkout', label: 'POS (Checkout)' },
    { path: '/dashboard/sales', label: 'Sales List' },
    { path: '/dashboard/purchases', label: 'Purchases' },
    { path: '/dashboard/products', label: 'Products' },
    { path: '/dashboard/categories', label: 'Categories' },
    { path: '/dashboard/brands', label: 'Brands' },
    { path: '/dashboard/units', label: 'Units' },
    { path: '/dashboard/variants', label: 'Variants' },
    { path: '/dashboard/stock-in', label: 'Stock In' },
    { path: '/dashboard/stock-out', label: 'Stock Out' },
    { path: '/dashboard/stock-transfer', label: 'Stock Transfer' },
    { path: '/dashboard/stock-return', label: 'Stock Return' },
    { path: '/dashboard/stock-adjustment', label: 'Stock Adjustment' },
    { path: '/dashboard/expenses', label: 'Expenses' },
    { path: '/dashboard/expense-category', label: 'Expense Category' },
    { path: '/dashboard/income', label: 'Income' },
    { path: '/dashboard/income-category', label: 'Income Category' },
    { path: '/dashboard/bank-accounts', label: 'Bank Accounts' },
    { path: '/dashboard/money-transfer', label: 'Money Transfer' },
    { path: '/dashboard/balance-sheet', label: 'Balance Sheet' },
    { path: '/dashboard/trial-balance', label: 'Trial Balance' },
    { path: '/dashboard/cash-flow', label: 'Cash Flow' },
    { path: '/dashboard/account-statement', label: 'Account Statement' },
    { path: '/dashboard/customers', label: 'Customers' },
    { path: '/dashboard/suppliers', label: 'Suppliers' },
    { path: '/dashboard/employees', label: 'Employees' },
    { path: '/dashboard/attendance', label: 'Attendance' },
    { path: '/dashboard/holidays', label: 'Holidays' },
    { path: '/dashboard/payroll', label: 'Payroll' },
    { path: '/dashboard/sales-report', label: 'Sales Report' },
    { path: '/dashboard/stock-report', label: 'Stock Report' },
    { path: '/dashboard/purchase-report', label: 'Purchase Report' },
    { path: '/dashboard/subscription', label: 'Subscription' },
    { path: '/dashboard/backup', label: 'Backup & Restore' },
    { path: '/dashboard/general-settings', label: 'General Settings' },
    { path: '/dashboard/invoice-settings', label: 'Invoice Settings' },
    { path: '/dashboard/tax-settings', label: 'Tax Settings' },
  ];

  const AVAILABLE_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'manage_settings'];

  const [restrictAccess, setRestrictAccess] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const roles = [
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
    { id: 'manager', name: 'Manager', permissions: ['sales', 'inventory', 'reports'] },
    { id: 'cashier', name: 'Cashier', permissions: ['sales'] },
    { id: 'inventory_clerk', name: 'Inventory Clerk', permissions: ['inventory'] }
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      const selectedRole = roles.find(r => r.id === formData.role);
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? {
            ...user,
            ...formData,
            permissions: selectedRole?.permissions || []
          }
          : user
      ));
      toast.success('User updated successfully!');
    } else {
      try {
        // Create user via Supabase Auth using a temporary random password
        const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
        const restrictions = restrictAccess ? { enabled: true, pages: selectedPages, actions: selectedActions } : { enabled: false };
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
          options: {
            data: {
              username: formData.username,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              role: formData.role,
              restrictions
            }
          }
        });
        if (error) { toast.error(error.message); return; }

        // Mirror to system_users for admin visibility
        const userId = data.user?.id;
        if (userId) {
          await supabase.from('system_users').upsert({
            id: userId,
            email: formData.email,
            user_metadata: { username: formData.username, first_name: formData.firstName, last_name: formData.lastName, phone: formData.phone, role: formData.role, restrictions: restrictAccess ? { enabled: true, pages: selectedPages, actions: selectedActions } : { enabled: false } },
            created_at: new Date().toISOString()
          });
        }

        // Send password reset email to force password change on first access (use default redirect to avoid invalid URL errors)
        {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(formData.email);
          if (resetErr) {
            console.warn('resetPasswordForEmail error:', resetErr);
            toast.error(resetErr.message);
          }
        }

        // Ensure admin stays logged in (sign out any accidental session switch)
        try { await supabase.auth.getSession().then(async ({ data }) => { if (data.session?.user?.email === formData.email) await supabase.auth.signOut(); }); } catch {}

        toast.success('User invited. Email sent with a link to set password and login.');
      } catch (err) {
        console.error('Create user error', err);
        toast.error('Failed to create user');
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('User deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: '',
      status: 'active',
      password: '',
      confirmPassword: ''
    });
    setEditingUser(null);
    setShowPassword(false);
    setRestrictAccess(false);
    setSelectedPages([]);
    setSelectedActions([]);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-500 border border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
      suspended: 'bg-red-500/10 text-red-500 border border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    const colors = {
      admin: 'bg-red-500/10 text-red-500 border border-red-500/20',
      manager: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      cashier: 'bg-green-500/10 text-green-500 border border-green-500/20',
      inventory_clerk: 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
    };
    return { name: role?.name || roleId, className: colors[roleId as keyof typeof colors] || colors.cashier };
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their access permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="johndoe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555-0123"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: User['status']) => setFormData(prev => ({ ...prev, status: value }))}>
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

              {!editingUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password"
                        required={false}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      required={!editingUser}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCog className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(users.map(u => u.role)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
            <UserCog size={20} />
            System Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">User</TableHead>
                <TableHead className="text-white font-semibold">Username</TableHead>
                <TableHead className="text-white font-semibold">Contact</TableHead>
                <TableHead className="text-white font-semibold">Role</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Last Login</TableHead>
                <TableHead className="text-white font-semibold">Created</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCog className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                      <p className="text-sm text-muted-foreground">Add users to manage system access</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{user.username}</code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-xs">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadge.className}>
                          <Shield className="h-3 w-3 mr-1" />
                          {roleBadge.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{new Date(user.lastLogin).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
