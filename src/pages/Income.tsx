import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, HandCoins, FileDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Income {
  id: string;
  title: string;
  amount: number;
  category: string;
  source: string;
  date: string;
  description?: string;
  status: 'received' | 'pending' | 'cancelled';
  paymentMethod: string;
}

const Income = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: ''
  });

  const [incomes] = useState<Income[]>([
  ]
  )

  const filteredIncomes = useMemo(() => {
    return incomes.filter(income =>
      income.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incomes, searchTerm]);

  const handleSubmit = () => {
    if (!formData.title || !formData.amount || !formData.category || !formData.source) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: editingIncome ? "Income Updated" : "Income Added",
      description: `Income record has been ${editingIncome ? 'updated' : 'added'} successfully`,
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: ''
    });
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      amount: income.amount.toString(),
      category: income.category,
      source: income.source,
      date: income.date,
      description: income.description || '',
      paymentMethod: income.paymentMethod
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    toast({
      title: "Income Deleted",
      description: "Income record has been deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const receivedIncome = incomes.filter(i => i.status === 'received').reduce((sum, income) => sum + income.amount, 0);
  const pendingIncome = incomes.filter(i => i.status === 'pending').reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Income Management</h1>
          <p className="text-muted-foreground">Track and manage your income sources</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingIncome(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingIncome ? 'Edit' : 'Add'} Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Income title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Interest">Interest</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="Income source"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Digital Payment">Digital Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingIncome ? 'Update' : 'Add'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="animate-slideInLeft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search income records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All income sources</p>
          </CardContent>
        </Card>
        <Card className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <HandCoins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${receivedIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Confirmed income</p>
          </CardContent>
        </Card>
        <Card className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <HandCoins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-primary dark:text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomes.length}</div>
            <p className="text-xs text-muted-foreground">Income records</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Title</TableHead>
                <TableHead className="text-white font-semibold">Amount</TableHead>
                <TableHead className="text-white font-semibold">Category</TableHead>
                <TableHead className="text-white font-semibold">Source</TableHead>
                <TableHead className="text-white font-semibold">Payment Method</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.map((income, index) => (
                <TableRow key={income.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                  <TableCell className="font-medium">{income.title}</TableCell>
                  <TableCell className="text-green-600 font-semibold">${income.amount.toLocaleString()}</TableCell>
                  <TableCell>{income.category}</TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>{income.paymentMethod}</TableCell>
                  <TableCell>{income.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(income.status)}>
                      {income.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(income)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Income</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this income record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;