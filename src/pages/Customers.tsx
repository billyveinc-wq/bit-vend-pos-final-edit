import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Eye
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  customerType: 'individual' | 'business';
  totalPurchases: number;
  lastPurchase?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'US',
    customerType: 'individual' as Customer['customerType'],
    notes: '',
    isActive: true
  });

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          const mapped: Customer[] = data.map((row: any) => ({
            id: String(row.id),
            name: row.name,
            email: row.email || '',
            phone: row.phone || '',
            address: row.address || '',
            city: row.city || '',
            country: row.country || '',
            customerType: (row.customer_type || 'individual') as Customer['customerType'],
            totalPurchases: Number(row.total_purchases) || 0,
            lastPurchase: row.last_purchase || undefined,
            isActive: !!row.is_active,
            notes: row.notes || '',
            createdAt: row.created_at,
          }));
          setCustomers(mapped);
        }
      } catch (e) {
        console.warn('Failed to load customers');
      }
    };
    load();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a customer name');
      return;
    }

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
            customer_type: formData.customerType,
            notes: formData.notes || null,
            is_active: formData.isActive,
          })
          .eq('id', Number(editingCustomer.id));
        if (error) { toast.error(error.message); return; }
        setCustomers(prev => prev.map(customer =>
          customer.id === editingCustomer.id
            ? { ...customer, ...formData }
            : customer
        ));
        toast.success('Customer updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
            customer_type: formData.customerType,
            notes: formData.notes || null,
            is_active: formData.isActive,
          })
          .select('*')
          .single();
        if (error) { toast.error(error.message); return; }
        const newCustomer: Customer = {
          id: String(data.id),
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          customerType: (data.customer_type || 'individual') as Customer['customerType'],
          totalPurchases: Number(data.total_purchases) || 0,
          lastPurchase: data.last_purchase || undefined,
          isActive: !!data.is_active,
          notes: data.notes || '',
          createdAt: data.created_at,
        };
        setCustomers(prev => [newCustomer, ...prev]);
        toast.success('Customer created successfully!');
      }
    } catch (err) {
      toast.error('Failed to save customer');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'US',
      customerType: customer.customerType,
      notes: customer.notes || '',
      isActive: customer.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', Number(id));
        if (error) { toast.error(error.message); return; }
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        toast.success('Customer deleted successfully!');
      } catch (e) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'US',
      customerType: 'individual',
      notes: '',
      isActive: true
    });
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerType">Customer Type</Label>
                  <select
                    id="customerType"
                    value={formData.customerType}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value as Customer['customerType'] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555-0123"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="US"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional customer notes..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Customer</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'Update' : 'Create'} Customer
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.customerType === 'business').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${customers.reduce((sum, customer) => sum + customer.totalPurchases, 0).toLocaleString()}
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Customer</TableHead>
                <TableHead className="text-white font-semibold">Contact</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Location</TableHead>
                <TableHead className="text-white font-semibold">Purchases</TableHead>
                <TableHead className="text-white font-semibold">Last Purchase</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No customers found</p>
                      <p className="text-sm text-muted-foreground">Add customers to build your customer database</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{customer.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-xs">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {customer.customerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.city && customer.country ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.city}, {customer.country}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${customer.totalPurchases.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "default" : "secondary"}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
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

export default Customers;
