import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [systemUsers] = useState<SystemUser[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      toast.success('User updated successfully!');
    } else {
      toast.success('User created successfully!');
    }
    resetForm();
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

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
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

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Users</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Username</TableHead>
                <TableHead className="text-white font-semibold">Email</TableHead>
                <TableHead className="text-white font-semibold">Role</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Last Login</TableHead>
                <TableHead className="text-white font-semibold">Created</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                  <TableCell className="text-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadge(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{user.lastLogin}</TableCell>
                  <TableCell className="text-foreground">{user.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

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