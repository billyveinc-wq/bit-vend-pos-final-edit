import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit2, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  type: 'public' | 'company' | 'religious';
  createdAt: string;
}

const Holidays: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    isRecurring: false,
    type: 'company' as Holiday['type']
  });

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .order('date', { ascending: true });
        if (error) throw error;
        const mapped: Holiday[] = (data || []).map((row: any) => ({
          id: String(row.id),
          name: row.name,
          date: row.date,
          description: row.description || '',
          isRecurring: !!row.is_recurring,
          type: (row.type || 'company') as Holiday['type'],
          createdAt: row.created_at,
        }));
        setHolidays(mapped);
      } catch (e) {
        console.warn('holidays not available');
      }
    };
    load();
  }, []);

  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      toast.error('Please enter holiday name and date');
      return;
    }

    if (editingHoliday) {
      const { error } = await supabase
        .from('holidays')
        .update({
          name: formData.name,
          date: formData.date,
          description: formData.description || null,
          is_recurring: formData.isRecurring,
          type: formData.type,
        })
        .eq('id', editingHoliday.id);
      if (error) { toast.error(error.message); return; }
      setHolidays(prev => prev.map(holiday =>
        holiday.id === editingHoliday.id
          ? { ...holiday, ...formData }
          : holiday
      ));
      toast.success('Holiday updated successfully!');
    } else {
      const { data, error } = await supabase
        .from('holidays')
        .insert({
          name: formData.name,
          date: formData.date,
          description: formData.description || null,
          is_recurring: formData.isRecurring,
          type: formData.type,
        })
        .select('*')
        .single();
      if (error) { toast.error(error.message); return; }
      const newHoliday: Holiday = {
        id: String((data as any).id),
        name: (data as any).name,
        date: (data as any).date,
        description: (data as any).description || '',
        isRecurring: !!(data as any).is_recurring,
        type: ((data as any).type || 'company') as Holiday['type'],
        createdAt: (data as any).created_at,
      };
      setHolidays(prev => [newHoliday, ...prev]);
      toast.success('Holiday created successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || '',
      isRecurring: holiday.isRecurring,
      type: holiday.type
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) { toast.error(error.message); return; }
      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      toast.success('Holiday deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      isRecurring: false,
      type: 'company'
    });
    setEditingHoliday(null);
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      public: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      company: 'bg-green-500/10 text-green-500 border border-green-500/20',
      religious: 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
    };
    return colors[type as keyof typeof colors] || colors.company;
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Holiday Management</h1>
          <p className="text-muted-foreground">Manage company holidays and time off</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Holiday Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Christmas Day"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Holiday Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Holiday['type'] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="company">Company Holiday</option>
                    <option value="public">Public Holiday</option>
                    <option value="religious">Religious Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Holiday description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isRecurring">Recurring Holiday</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingHoliday ? 'Update' : 'Create'} Holiday
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
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holidays.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {holidays.filter(h => new Date(h.date).getFullYear() === new Date().getFullYear()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {holidays.filter(h => new Date(h.date) > new Date()).length}
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
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Holidays Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Holidays ({filteredHolidays.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Holiday Name</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Description</TableHead>
                <TableHead className="text-white font-semibold">Recurring</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHolidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No holidays found</p>
                      <p className="text-sm text-muted-foreground">Add holidays to manage company time off</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getTypeBadge(holiday.type)}>
                        {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{holiday.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={holiday.isRecurring ? 'default' : 'secondary'}>
                        {holiday.isRecurring ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(holiday)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(holiday.id)}
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

export default Holidays;
