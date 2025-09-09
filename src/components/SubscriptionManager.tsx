import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  History,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
  plan_name: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'mpesa';
  last_four?: string;
  expiry_month?: string;
  expiry_year?: string;
  brand?: string;
  email?: string;
  phone?: string;
  is_default: boolean;
}

const SubscriptionManager: React.FC = () => {
  const { subscription, refreshSubscription, isLoading } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // New payment method form
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'paypal' | 'mpesa',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchPlans();
    if (subscription) {
      fetchBillingHistory();
      fetchPaymentMethods();
    }
  }, [subscription]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : []
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const fetchBillingHistory = async () => {
    // Mock billing history - replace with actual database query
    const mockHistory: BillingHistory[] = [
      {
        id: '1',
        date: '2024-01-15',
        amount: 19,
        status: 'paid',
        plan_name: 'Standard Plan',
        invoice_url: '#'
      },
      {
        id: '2', 
        date: '2023-12-15',
        amount: 19,
        status: 'paid',
        plan_name: 'Standard Plan',
        invoice_url: '#'
      },
      {
        id: '3',
        date: '2023-11-15',
        amount: 19,
        status: 'paid',
        plan_name: 'Standard Plan',
        invoice_url: '#'
      }
    ];
    setBillingHistory(mockHistory);
  };

  const fetchPaymentMethods = async () => {
    // Mock payment methods - replace with actual database query
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'card',
        last_four: '4242',
        expiry_month: '12',
        expiry_year: '25',
        brand: 'Visa',
        is_default: true
      }
    ];
    setPaymentMethods(mockPaymentMethods);
  };

  const handlePlanUpgrade = async () => {
    if (!selectedPlan) return;
    
    try {
      // Simulate plan upgrade - integrate with actual payment processing
      toast.success('Plan upgrade initiated. Redirecting to payment...');
      setShowUpgradeDialog(false);
      
      // Refresh subscription data
      await refreshSubscription();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // Simulate subscription cancellation
      toast.success('Subscription cancelled. You will retain access until the current billing period ends.');
      setShowCancelDialog(false);
      
      // Refresh subscription data  
      await refreshSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      // Simulate adding payment method
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: newPaymentMethod.type,
        is_default: paymentMethods.length === 0,
        ...(newPaymentMethod.type === 'card' && {
          last_four: newPaymentMethod.cardNumber.slice(-4),
          expiry_month: newPaymentMethod.expiryMonth,
          expiry_year: newPaymentMethod.expiryYear,
          brand: 'Visa' // Would be detected from card number
        }),
        ...(newPaymentMethod.type === 'paypal' && {
          email: newPaymentMethod.email
        }),
        ...(newPaymentMethod.type === 'mpesa' && {
          phone: newPaymentMethod.phoneNumber
        })
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      toast.success('Payment method added successfully');
      setShowPaymentDialog(false);
      
      // Reset form
      setNewPaymentMethod({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        email: '',
        phoneNumber: ''
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleSetDefaultPayment = async (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        is_default: method.id === methodId
      }))
    );
    toast.success('Default payment method updated');
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    toast.success('Payment method removed');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.id === subscription.plan_id);
  };

  const currentPlan = getCurrentPlan();
  const nextBillingDate = subscription?.expires_at ? new Date(subscription.expires_at) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Current Plan</Label>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {currentPlan?.name || 'Free Plan'}
                </span>
                {getStatusBadge(subscription?.status || 'active')}
              </div>
              <p className="text-sm text-muted-foreground">
                ${currentPlan?.price || 0}/month
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Next Billing Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {nextBillingDate ? format(nextBillingDate, 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Subscription Status</Label>
              <div className="flex items-center gap-2">
                {subscription?.status === 'active' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">Active & Current</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-700">Requires Attention</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-3">
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upgrade Your Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.filter(plan => plan.id !== subscription?.plan_id).map(plan => (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : ''
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <p className="text-2xl font-bold">${plan.price}/month</p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm">
                            {plan.features.slice(0, 4).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePlanUpgrade} disabled={!selectedPlan}>
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="gap-2">
              <ArrowDownRight className="h-4 w-4" />
              Downgrade Plan
            </Button>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Cancel Subscription
                </Button>  
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                </DialogHeader>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will remain active until {nextBillingDate ? format(nextBillingDate, 'MMM dd, yyyy') : 'the end of the current billing period'}.
                    You'll lose access to premium features after this date.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep Subscription
                  </Button>
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    Confirm Cancellation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Management Tabs */}
      <Tabs defaultValue="billing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{bill.plan_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(bill.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${bill.amount}</p>
                        {bill.status === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        ) : bill.status === 'pending' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                      {bill.invoice_url && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="paymentType">Payment Type</Label>
                        <Select 
                          value={newPaymentMethod.type} 
                          onValueChange={(value: 'card' | 'paypal' | 'mpesa') => 
                            setNewPaymentMethod(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newPaymentMethod.type === 'card' && (
                        <>
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={newPaymentMethod.cardNumber}
                              onChange={(e) => setNewPaymentMethod(prev => ({ 
                                ...prev, 
                                cardNumber: e.target.value 
                              }))}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="expiryMonth">Month</Label>
                              <Select 
                                value={newPaymentMethod.expiryMonth}
                                onValueChange={(value) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  expiryMonth: value 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                      {String(i + 1).padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="expiryYear">Year</Label>
                              <Select 
                                value={newPaymentMethod.expiryYear}
                                onValueChange={(value) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  expiryYear: value 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="YY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return (
                                      <SelectItem key={year} value={String(year).slice(-2)}>
                                        {String(year).slice(-2)}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={newPaymentMethod.cvv}
                                onChange={(e) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  cvv: e.target.value 
                                }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                            <Input
                              id="cardholderName"
                              placeholder="John Doe"
                              value={newPaymentMethod.cardholderName}
                              onChange={(e) => setNewPaymentMethod(prev => ({ 
                                ...prev, 
                                cardholderName: e.target.value 
                              }))}
                            />
                          </div>
                        </>
                      )}

                      {newPaymentMethod.type === 'paypal' && (
                        <div>
                          <Label htmlFor="email">PayPal Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={newPaymentMethod.email}
                            onChange={(e) => setNewPaymentMethod(prev => ({ 
                              ...prev, 
                              email: e.target.value 
                            }))}
                          />
                        </div>
                      )}

                      {newPaymentMethod.type === 'mpesa' && (
                        <div>
                          <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            placeholder="+254712345678"
                            value={newPaymentMethod.phoneNumber}
                            onChange={(e) => setNewPaymentMethod(prev => ({ 
                              ...prev, 
                              phoneNumber: e.target.value 
                            }))}
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPaymentMethod}>
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {method.type === 'card' && `${method.brand} ****${method.last_four}`}
                          {method.type === 'paypal' && `PayPal (${method.email})`}
                          {method.type === 'mpesa' && `M-Pesa (${method.phone})`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'card' && `Expires ${method.expiry_month}/${method.expiry_year}`}
                          {method.is_default && (
                            <Badge variant="secondary" className="ml-2">Default</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Users</Label>
                    <div className="flex justify-between text-sm">
                      <span>5 of 10 users</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Storage</Label>
                    <div className="flex justify-between text-sm">
                      <span>2.5 GB of 5 GB</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You're approaching your user limit. Consider upgrading to add more team members.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManager;