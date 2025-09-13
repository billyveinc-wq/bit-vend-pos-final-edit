import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Shield,
  Users,
  Settings
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface Permission {
  id: string; // key (e.g., 'sales_view')
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string; // DB id as string
  name: string;
  description?: string;
  permissions: string[]; // permission keys
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true
  });

  const [roles, setRoles] = useState<Role[]>([]);

  // Available permissions
  const permissions: Permission[] = [
    // Sales permissions
    { id: 'sales_view', name: 'View Sales', description: 'View sales transactions and reports', category: 'Sales' },
    { id: 'sales_create', name: 'Create Sales', description: 'Process new sales transactions', category: 'Sales' },
    { id: 'sales_edit', name: 'Edit Sales', description: 'Modify existing sales transactions', category: 'Sales' },
    { id: 'sales_delete', name: 'Delete Sales', description: 'Delete sales transactions', category: 'Sales' },

    // Product permissions
    { id: 'products_view', name: 'View Products', description: 'View product catalog and inventory', category: 'Products' },
    { id: 'products_create', name: 'Create Products', description: 'Add new products to inventory', category: 'Products' },
    { id: 'products_edit', name: 'Edit Products', description: 'Modify product information', category: 'Products' },
    { id: 'products_delete', name: 'Delete Products', description: 'Remove products from inventory', category: 'Products' },

    // Customer permissions
    { id: 'customers_view', name: 'View Customers', description: 'View customer information', category: 'Customers' },
    { id: 'customers_create', name: 'Create Customers', description: 'Add new customers', category: 'Customers' },
    { id: 'customers_edit', name: 'Edit Customers', description: 'Modify customer information', category: 'Customers' },

    // Reports permissions
    { id: 'reports_view', name: 'View Reports', description: 'Access business reports', category: 'Reports' },
    { id: 'reports_export', name: 'Export Reports', description: 'Export reports to PDF/Excel', category: 'Reports' },

    // Settings permissions
    { id: 'settings_view', name: 'View Settings', description: 'Access system settings', category: 'Settings' },
    { id: 'settings_edit', name: 'Edit Settings', description: 'Modify system configuration', category: 'Settings' },

    // User management permissions
    { id: 'users_view', name: 'View Users', description: 'View user accounts', category: 'User Management' },
    { id: 'users_create', name: 'Create Users', description: 'Add new user accounts', category: 'User Management' },
    { id: 'users_edit', name: 'Edit Users', description: 'Modify user accounts', category: 'User Management' },
    { id: 'users_delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management' }
  ];

  const permissionCategories = [...new Set(permissions.map(p => p.category))];

  // Map permission key -> DB id
  const [permIdByKey, setPermIdByKey] = useState<Record<string, number>>({});

  useEffect(() => {
    const seedAndLoad = async () => {
      try {
        // Seed permissions
        await supabase.from('permissions').upsert(
          permissions.map(p => ({ key: p.id, name: p.name, description: p.description, category: p.category })),
          { onConflict: 'key' } as any
        );
      } catch {}
      try {
        // Ensure default admin role with full permissions
        let adminRoleId: number | undefined;
        const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').maybeSingle();
        if (!adminRole?.id) {
          const { data: created } = await supabase.from('roles').insert({ name: 'admin', description: 'Administrator' }).select('id').single();
          adminRoleId = created?.id;
        } else {
          adminRoleId = adminRole.id;
        }
        if (adminRoleId) {
          const { data: allPerms } = await supabase.from('permissions').select('id');
          await supabase.from('role_permissions').delete().eq('role_id', adminRoleId);
          const rows = (allPerms || []).map((p: any) => ({ role_id: adminRoleId as number, permission_id: p.id }));
          if (rows.length) await supabase.from('role_permissions').insert(rows);
        }
      } catch {}
      try {
        // Load permissions to build id map
        const { data: per } = await supabase.from('permissions').select('id, key');
        const map: Record<string, number> = {};
        (per || []).forEach((r: any) => { map[r.key] = r.id; });
        setPermIdByKey(map);
      } catch {}
      try {
        // Load roles and their permissions
        const { data: rolesData } = await supabase.from('roles').select('id, name, description, is_active, created_at').order('created_at', { ascending: false });
        const { data: rp } = await supabase.from('role_permissions').select('role_id, permission_id');
        const { data: allPerms } = await supabase.from('permissions').select('id, key');
        const keyById = new Map((allPerms || []).map((r: any) => [r.id, r.key]));
        const permsByRole = new Map<number, string[]>();
        (rp || []).forEach((row: any) => {
          const key = keyById.get(row.permission_id);
          if (!key) return;
          const arr = permsByRole.get(row.role_id) || [];
          arr.push(key);
          permsByRole.set(row.role_id, arr);
        });
        // Load user counts per role
        const { data: ur } = await supabase.from('user_roles').select('role_id, user_id');
        const countByRole = new Map<number, number>();
        (ur || []).forEach((row: any) => {
          countByRole.set(row.role_id, (countByRole.get(row.role_id) || 0) + 1);
        });
        const mapped: Role[] = (rolesData || []).map((r: any) => ({
          id: String(r.id),
          name: r.name,
          description: r.description || '',
          permissions: permsByRole.get(r.id) || [],
          userCount: countByRole.get(r.id) || 0,
          isActive: !!r.is_active,
          createdAt: r.created_at,
        }));
        setRoles(mapped);
      } catch {}
    };
    seedAndLoad();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a role name');
      return;
    }

    try {
      if (editingRole) {
        const { error } = await supabase.from('roles').update({ name: formData.name, description: formData.description || null, is_active: formData.isActive }).eq('id', Number(editingRole.id));
        if (error) { toast.error(error.message); return; }
        // Update permissions: replace all
        await supabase.from('role_permissions').delete().eq('role_id', Number(editingRole.id));
        const rows = (formData.permissions || []).map(k => ({ role_id: Number(editingRole.id), permission_id: permIdByKey[k] })).filter(r => r.permission_id);
        if (rows.length) await supabase.from('role_permissions').insert(rows);
        setRoles(prev => prev.map(role => role.id === editingRole.id ? { ...role, ...formData } : role));
        toast.success('Role updated successfully!');
      } else {
        const { data, error } = await supabase.from('roles').insert({ name: formData.name, description: formData.description || null, is_active: formData.isActive }).select('*').single();
        if (error) { toast.error(error.message); return; }
        const roleId = data.id as number;
        const rows = (formData.permissions || []).map(k => ({ role_id: roleId, permission_id: permIdByKey[k] })).filter(r => r.permission_id);
        if (rows.length) await supabase.from('role_permissions').insert(rows);
        const newRole: Role = { id: String(roleId), name: data.name, description: data.description || '', permissions: [...formData.permissions], userCount: 0, isActive: !!data.is_active, createdAt: data.created_at };
        setRoles(prev => [newRole, ...prev]);
        toast.success('Role created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save role');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
      isActive: role.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const { error } = await supabase.from('roles').delete().eq('id', Number(id));
        if (error) { toast.error(error.message); return; }
        setRoles(prev => prev.filter(role => role.id !== id));
        toast.success('Role deleted successfully!');
      } catch (e) {
        toast.error('Failed to delete role');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
    setEditingRole(null);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and access permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Manager, Cashier"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked === true }))}
                  />
                  <Label htmlFor="isActive">Active Role</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this role"
                  rows={3}
                />
              </div>

              {/* Permissions */}
              <div>
                <Label>Permissions</Label>
                <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {permissionCategories.map(category => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2 text-foreground">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.filter(p => p.category === category).map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selected {formData.permissions.length} of {permissions.length} permissions
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRole ? 'Update' : 'Create'} Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {roles.filter(r => r.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {roles.reduce((sum, role) => sum + role.userCount, 0)}
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
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck size={20} />
            Roles ({filteredRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Role Name</TableHead>
                <TableHead className="text-white font-semibold">Description</TableHead>
                <TableHead className="text-white font-semibold">Permissions</TableHead>
                <TableHead className="text-white font-semibold">Users</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Created</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No roles found</p>
                      <p className="text-sm text-muted-foreground">Create roles to manage user permissions</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{role.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions.length} permissions</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{role.userCount} users</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 size={14} />
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
    </div>
  );
};

export default Roles;
