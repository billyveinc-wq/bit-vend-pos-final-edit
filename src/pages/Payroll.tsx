import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Eye,
  Users,
  Calendar,
  DollarSign,
  Calculator,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  payPeriod: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
  payDate?: string;
  createdAt: string;
}

interface EmployeeOption {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
}

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriod: new Date().toISOString().slice(0, 7),
    baseSalary: '',
    overtime: '',
    bonuses: '',
    deductions: ''
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, payRes] = await Promise.all([
          supabase.from('employees').select('id, first_name, last_name, position, salary'),
          supabase
            .from('payroll_records')
            .select('id, employee_id, pay_period, base_salary, overtime, bonuses, deductions, gross_pay, net_pay, status, pay_date, created_at, employees:employee_id ( first_name, last_name, position )')
            .order('created_at', { ascending: false })
        ]);

        if (empRes.error) throw empRes.error;
        const emps: EmployeeOption[] = (empRes.data || []).map((row: any) => ({
          id: String(row.id),
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          position: row.position || '',
          baseSalary: row.salary ? Number(row.salary) : 0,
        }));
        setEmployees(emps);

        if (payRes.error) throw payRes.error;
        const mapped: PayrollRecord[] = (payRes.data || []).map((row: any) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          employeeName: `${row.employees?.first_name || ''} ${row.employees?.last_name || ''}`.trim() || 'Unknown',
          position: row.employees?.position || '',
          payPeriod: row.pay_period,
          baseSalary: Number(row.base_salary) || 0,
          overtime: Number(row.overtime) || 0,
          bonuses: Number(row.bonuses) || 0,
          deductions: Number(row.deductions) || 0,
          grossPay: Number(row.gross_pay) || 0,
          netPay: Number(row.net_pay) || 0,
          status: (row.status || 'draft') as PayrollRecord['status'],
          payDate: row.pay_date || undefined,
          createdAt: row.created_at,
        }));
        setPayrollRecords(mapped);
      } catch (e) {
        console.warn('payroll not available');
      }
    };
    load();
  }, []);

  const filteredRecords = useMemo(() => {
    const bySearch = (r: PayrollRecord) =>
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.payPeriod.includes(searchTerm);
    const byPeriod = (r: PayrollRecord) => !selectedPeriod || r.payPeriod === selectedPeriod;
    return payrollRecords.filter(r => byPeriod(r) && bySearch(r));
  }, [payrollRecords, searchTerm, selectedPeriod]);

  const calculatePayroll = () => {
    const baseSalary = parseFloat(formData.baseSalary) || 0;
    const overtime = parseFloat(formData.overtime) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const grossPay = baseSalary + overtime + bonuses;
    const netPay = grossPay - deductions;
    return { grossPay, netPay };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.baseSalary) {
      toast.error('Please fill in all required fields');
      return;
    }
    const employee = employees.find(emp => emp.id === formData.employeeId);
    if (!employee) { toast.error('Employee not found'); return; }

    const { grossPay, netPay } = calculatePayroll();

    const { data, error } = await supabase
      .from('payroll_records')
      .insert({
        employee_id: formData.employeeId,
        pay_period: formData.payPeriod,
        base_salary: parseFloat(formData.baseSalary),
        overtime: parseFloat(formData.overtime) || 0,
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        gross_pay: grossPay,
        net_pay: netPay,
        status: 'draft',
      })
      .select('id, employee_id, pay_period, base_salary, overtime, bonuses, deductions, gross_pay, net_pay, status, pay_date, created_at, employees:employee_id ( first_name, last_name, position )')
      .single();
    if (error) { toast.error(error.message); return; }

    const newRecord: PayrollRecord = {
      id: String((data as any).id),
      employeeId: String((data as any).employee_id),
      employeeName: `${(data as any).employees?.first_name || ''} ${(data as any).employees?.last_name || ''}`.trim() || employee.name,
      position: (data as any).employees?.position || employee.position,
      payPeriod: (data as any).pay_period,
      baseSalary: Number((data as any).base_salary) || 0,
      overtime: Number((data as any).overtime) || 0,
      bonuses: Number((data as any).bonuses) || 0,
      deductions: Number((data as any).deductions) || 0,
      grossPay: Number((data as any).gross_pay) || 0,
      netPay: Number((data as any).net_pay) || 0,
      status: ((data as any).status || 'draft') as PayrollRecord['status'],
      payDate: (data as any).pay_date || undefined,
      createdAt: (data as any).created_at,
    };
    setPayrollRecords(prev => [newRecord, ...prev]);
    toast.success('Payroll record created successfully!');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      payPeriod: new Date().toISOString().slice(0, 7),
      baseSalary: '',
      overtime: '',
      bonuses: '',
      deductions: ''
    });
  };

  const handleProcessPayroll = async (id: string) => {
    const { error } = await supabase.from('payroll_records').update({ status: 'processed' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setPayrollRecords(prev => prev.map(record =>
      record.id === id ? { ...record, status: 'processed' } : record
    ));
    toast.success('Payroll processed successfully!');
  };

  const handleMarkPaid = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('payroll_records').update({ status: 'paid', pay_date: today }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setPayrollRecords(prev => prev.map(record =>
      record.id === id ? { ...record, status: 'paid', payDate: today } : record
    ));
    toast.success('Payroll marked as paid!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
      processed: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      paid: 'bg-green-500/10 text-green-500 border border-green-500/20'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'processed': return <Calculator className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalPayroll = useMemo(() => payrollRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.netPay, 0), [payrollRecords]);

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Payroll
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => resetForm()}>
                <Plus size={16} />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Process Employee Payroll</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee</Label>
                    <Select value={formData.employeeId} onValueChange={(value) => {
                      const employee = employees.find(emp => emp.id === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        employeeId: value,
                        baseSalary: (employee?.baseSalary ?? '').toString()
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payPeriod">Pay Period</Label>
                    <Input
                      id="payPeriod"
                      type="month"
                      value={formData.payPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseSalary">Base Salary</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      step="0.01"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="overtime">Overtime Pay</Label>
                    <Input
                      id="overtime"
                      type="number"
                      step="0.01"
                      value={formData.overtime}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bonuses">Bonuses</Label>
                    <Input
                      id="bonuses"
                      type="number"
                      step="0.01"
                      value={formData.bonuses}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonuses: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      step="0.01"
                      value={formData.deductions}
                      onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {formData.baseSalary && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Payroll Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Pay:</span>
                        <span className="font-medium">${calculatePayroll().grossPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Pay:</span>
                        <span className="font-medium text-green-600">${calculatePayroll().netPay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Payroll Record
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPayroll.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {payrollRecords.filter(r => r.status === 'processed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payrollRecords.filter(r => r.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees or pay periods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Payroll Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500 hover:bg-blue-500">
                <TableHead className="text-white font-semibold">Employee</TableHead>
                <TableHead className="text-white font-semibold">Position</TableHead>
                <TableHead className="text-white font-semibold">Pay Period</TableHead>
                <TableHead className="text-white font-semibold">Base Salary</TableHead>
                <TableHead className="text-white font-semibold">Overtime</TableHead>
                <TableHead className="text-white font-semibold">Bonuses</TableHead>
                <TableHead className="text-white font-semibold">Deductions</TableHead>
                <TableHead className="text-white font-semibold">Net Pay</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payroll records found</p>
                      <p className="text-sm text-muted-foreground">Process payroll for employees to see records</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{record.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.position}</TableCell>
                    <TableCell>{record.payPeriod}</TableCell>
                    <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>${record.overtime.toFixed(2)}</TableCell>
                    <TableCell>${record.bonuses.toFixed(2)}</TableCell>
                    <TableCell>${record.deductions.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">${record.netPay.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye size={14} />
                        </Button>
                        {record.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcessPayroll(record.id)}
                          >
                            Process
                          </Button>
                        )}
                        {record.status === 'processed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(record.id)}
                            className="text-green-600"
                          >
                            Mark Paid
                          </Button>
                        )}
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

export default Payroll;
