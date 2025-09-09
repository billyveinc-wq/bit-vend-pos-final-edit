import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Archive, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Package,
  Ruler
} from 'lucide-react';
import { toast } from "sonner";

interface Unit {
  id: string;
  name: string;
  shortName: string;
  type: 'weight' | 'length' | 'volume' | 'quantity';
  baseUnit?: string;
  conversionFactor?: number;
  isActive: boolean;
  createdAt: string;
}

const Units = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    type: 'quantity' as Unit['type'],
    baseUnit: '',
    conversionFactor: 1,
    isActive: true
  });

  const [units, setUnits] = useState<Unit[]>([
  ]
  )

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUnit) {
      setUnits(prev => prev.map(unit =>
        unit.id === editingUnit.id
          ? { ...unit, ...formData }
          : unit
      ));
      toast.success('Unit updated successfully!');
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setUnits(prev => [...prev, newUnit]);
      toast.success('Unit created successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      shortName: unit.shortName,
      type: unit.type,
      baseUnit: unit.baseUnit || '',
      conversionFactor: unit.conversionFactor || 1,
      isActive: unit.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      setUnits(prev => prev.filter(unit => unit.id !== id));
      toast.success('Unit deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      type: 'quantity',
      baseUnit: '',
      conversionFactor: 1,
      isActive: true
    });
    setEditingUnit(null);
  };

  const getTypeColor = (type: Unit['type']) => {
    const colors = {
      quantity: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      weight: 'bg-green-500/10 text-green-500 border border-green-500/20',
      volume: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      length: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Units Management</h1>
          <p className="text-muted-foreground">Manage measurement units for your products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus size={16} />
              Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Unit Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Kilogram"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                    placeholder="e.g., kg"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type">Unit Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Unit['type'] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="quantity">Quantity</option>
                  <option value="weight">Weight</option>
                  <option value="volume">Volume</option>
                  <option value="length">Length</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseUnit">Base Unit (Optional)</Label>
                  <Input
                    id="baseUnit"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUnit: e.target.value }))}
                    placeholder="e.g., kg for grams"
                  />
                </div>
                <div>
                  <Label htmlFor="conversionFactor">Conversion Factor</Label>
                  <Input
                    id="conversionFactor"
                    type="number"
                    step="0.001"
                    value={formData.conversionFactor}
                    onChange={(e) => setFormData(prev => ({ ...prev, conversionFactor: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-cancel hover:bg-cancel-hover text-cancel-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="bg-save hover:bg-save-hover text-save-foreground">
                  {editingUnit ? 'Update' : 'Create'} Unit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {units.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler size={20} />
            Units ({filteredUnits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Name</TableHead>
                <TableHead className="text-white font-semibold">Short Name</TableHead>
                <TableHead className="text-white font-semibold">Type</TableHead>
                <TableHead className="text-white font-semibold">Base Unit</TableHead>
                <TableHead className="text-white font-semibold">Conversion</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Created</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{unit.shortName}</code>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(unit.type)}>
                      {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.baseUnit || '-'}
                  </TableCell>
                  <TableCell>
                    {unit.conversionFactor ? `${unit.conversionFactor}x` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.isActive ? "default" : "secondary"}>
                      {unit.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(unit.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
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

export default Units;