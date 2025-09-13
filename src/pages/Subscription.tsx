import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Star, CreditCard, Smartphone, Building2, Crown, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { safeGetSession } from '@/integrations/supabase/safeAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';

const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 9,
    period: 'month',
    description: 'Best for small shops',
    icon: Building2,
    popular: false,
    features: [
      'Basic inventory & sales tracking',
      'Mpesa payments enabled',
      'Simple reports',
      'Email support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 19,
    period: 'month',
    description: 'Perfect for growing businesses',
    icon: Star,
    popular: true,
    features: [
      'Everything in Starter',
      'Multi-user accounts (cashiers/staff)',
      'Advanced sales & expense reports',
      'Low stock alerts',
      'Priority email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 39,
    period: 'month',
    description: 'Advanced features for scaling',
    icon: Crown,
    popular: false,
    features: [
      'Everything in Standard',
      'Multi-branch support',
      'Customer & supplier management',
      'Customizable receipts & invoices',
      'Priority chat support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 79,
    period: 'month',
    description: 'Complete solution for large operations',
    icon: Crown,
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited branches & users',
      'API & advanced integrations',
      'Dedicated account manager',
      '24/7 priority support'
    ]
  }
];

const paymentMethods = [
  {
    id: 'card',
    name: 'Bank Card',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard,
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: CreditCard,
    available: true
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Mobile money payments',
    icon: Smartphone,
    available: true
  }
];

const Subscription = () => {
  const navigate = useNavigate();
  const { subscription, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [plans, setPlans] = useState<typeof subscriptionPlans>(subscriptionPlans);
  const [promoDetails, setPromoDetails] = useState<{code: string, percent: number, expired: boolean} | null>(null);

  useEffect(() => {
    setCurrentPlan(subscription?.plan_id || 'starter');
    if (subscription?.plan_id) setSelectedPlan(subscription.plan_id);
  }, [subscription]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data } = await supabase.from('subscription_plans').select('id, name, price, features');
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((p: any) => {
            const raw = Number(p.price);
            const normalized = isFinite(raw) ? (raw >= 100 ? Math.round(raw) / 100 : raw) : 0;
            return {
              id: p.id,
              name: String(p.name || ''),
              price: normalized,
              period: 'month',
              description: 'Plan',
              icon: Crown,
              popular: p.id === 'standard',
              features: Array.isArray(p.features) ? p.features : []
            };
          });
          setPlans(mapped as any);
        }
      } catch {}
    };
    loadPlans();
  }, []);

  // Payment form data
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  
  const [paypalData, setPaypalData] = useState({
    email: ''
  });
  
  const [mpesaData, setMpesaData] = useState({
    phoneNumber: ''
  });
  
  const [stkPushModal, setStkPushModal] = useState<{
    isOpen: boolean;
    amount: number;
    phone: string;
    pin: string;
  }>({
    isOpen: false,
    amount: 0,
    phone: '',
    pin: ''
  });

  const formatWords = (s: string) => String(s || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    // Reset forms when switching payment methods
    if (paymentId === 'card') {
      setCardData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
      });
    } else if (paymentId === 'paypal') {
      setPaypalData({ email: '' });
    } else if (paymentId === 'mpesa') {
      setMpesaData({ phoneNumber: '' });
    }
  };

  const handleMpesaSTKPush = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!mpesaData.phoneNumber || !plan) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    // Simulate STK push
    setStkPushModal({
      isOpen: true,
      amount: plan.price,
      phone: mpesaData.phoneNumber,
      pin: ''
    });
  };

  const handleSTKConfirm = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    
    if (stkPushModal.pin.length !== 4) {
      toast.error('Please enter your 4-digit M-Pesa PIN');
      return;
    }
    
    // Simulate successful payment and persist subscription
    toast.success(`Payment of $${stkPushModal.amount} via M-Pesa successful! Subscription to ${plan?.name} activated`);

    try {
      const { data: { session } } = await safeGetSession();
      const user = session?.user;
      if (user && plan) {
        const startedAt = new Date();
        const expiresAt = new Date();
        expiresAt.setMonth(startedAt.getMonth() + 1);
        await supabase.from('user_subscriptions').upsert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_method: 'mpesa',
          payment_details: { phone: stkPushModal.phone }
        }, { onConflict: 'user_id' });
        await refreshSubscription();
      }
    } catch {}

    setStkPushModal({ isOpen: false, amount: 0, phone: '', pin: '' });
  };

  const handleSubscribe = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    const payment = paymentMethods.find(p => p.id === selectedPayment);
    
    // Check for referral code discount from multiple sources
    const urlParams = new URLSearchParams(window.location.search);
    let referralCode = urlParams.get('ref') || localStorage.getItem('applied-referral-code');
    let finalPrice = plan?.price || 0;
    let discountAmount = 0;
    let promoDetails = null;

    // If no referral code in URL or localStorage, check user_promotions for this user
    if (!referralCode) {
      try {
        const { data: { session } } = await safeGetSession();
        if (session?.user) {
          const { data: userPromo } = await supabase
            .from('user_promotions')
            .select('promo_codes!inner(*)')
            .eq('user_id', session.user.id)
            .order('applied_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (userPromo && userPromo.promo_codes) {
            referralCode = (userPromo.promo_codes as any).code;
          }
        }
      } catch (err) {
        console.warn('Failed to check user promotions:', err);
      }
    }

    if (referralCode) {
      try {
        // Check both promo_codes and promos tables for compatibility
        let promo = null;

        const { data: promoCodesData } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', referralCode)
          .maybeSingle();

        if (promoCodesData) {
          promo = promoCodesData;
        } else {
          // Fallback to promos table
          const { data: promosData } = await supabase
            .from('promos')
            .select('*')
            .eq('code', referralCode)
            .maybeSingle();
          promo = promosData;
        }

        if (promo) {
          const now = Date.now();
          const expiresAt = (promo as any).expires_at ? new Date((promo as any).expires_at).getTime() : null;
          const notExpired = !expiresAt || expiresAt > now;
          const pctRaw = (promo as any).discount_percent ?? (promo as any).discount;
          const pct = typeof pctRaw === 'number' ? pctRaw : parseFloat(pctRaw || '0');

          if (notExpired && isFinite(pct) && pct > 0 && pct <= 100) {
            discountAmount = Math.round(finalPrice * (pct / 100) * 100) / 100; // Round to 2 decimal places
            finalPrice = Math.max(0, finalPrice - discountAmount);
            const details = { code: referralCode, percent: pct, expired: false };
            setPromoDetails(details);

            toast.success(`Promo code applied: ${pct}% discount ($${discountAmount.toFixed(2)} off)`, {
              duration: 5000
            });
          } else if (!notExpired) {
            toast.error('Promo code has expired');
            setPromoDetails({ code: referralCode, percent: pct, expired: true });
          } else {
            toast.error('Invalid promo code discount value');
          }
        } else {
          toast.error('Promo code not found');
          setPromoDetails(null);
        }
      } catch (err) {
        console.error('Error applying promo code:', err);
        toast.error('Failed to apply promo code');
      }
    }
    
    // Validate payment data based on selected method
    let isValid = false;
    let paymentInfo = '';
    
    switch (selectedPayment) {
      case 'card':
        isValid = !!(cardData.cardNumber && cardData.expiryMonth && cardData.expiryYear && 
                    cardData.cvv && cardData.cardholderName);
        paymentInfo = `Card ending in ${cardData.cardNumber.slice(-4)}`;
        break;
      case 'paypal':
        isValid = paypalData.email.includes('@');
        paymentInfo = `PayPal account ${paypalData.email}`;
        break;
      case 'mpesa':
        isValid = !!mpesaData.phoneNumber;
        paymentInfo = `M-Pesa ${mpesaData.phoneNumber}`;
        // For M-Pesa, we'll use STK push instead of direct subscription
        if (isValid) {
          handleMpesaSTKPush();
          return;
        }
        break;
    }
    
    if (!isValid) {
      toast.error('Please fill in all required payment details');
      return;
    }
    
    if (plan && payment) {
      try {
        const { data: { session } } = await safeGetSession();
        const user = session?.user;
        if (!user) { toast.error('Please sign in to subscribe'); return; }
        const expires = new Date();
        expires.setMonth(expires.getMonth() + 1);
        const payload: any = {
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expires.toISOString(),
          payment_method: selectedPayment,
          payment_details: selectedPayment === 'card' ? { last4: cardData.cardNumber.slice(-4) } : selectedPayment === 'paypal' ? { email: paypalData.email } : { phone: mpesaData.phoneNumber },
          referral_code: referralCode || null,
          discount_applied: discountAmount || 0,
        };
        await supabase.from('user_subscriptions').upsert(payload, { onConflict: 'user_id' });
        await refreshSubscription();
        toast.success(`Subscribed to ${plan.name} successfully`);
        navigate('/dashboard/subscription/manage');
      } catch (err) {
        console.error(err);
        toast.error('Failed to activate subscription');
      }
    }
  };

  const handleCancelSubscription = () => {
    toast.info('Subscription cancellation will be implemented with backend integration');
  };

  return (
    <div className="space-y-8 p-6 animate-fade">
      {/* Header */}
      <div className="space-y-2 animate-slideInLeft">
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the perfect plan for your business needs</p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-2 border-primary animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Current Plan: {currentPlan ? (formatWords(currentPlan).charAt(0).toUpperCase() + formatWords(currentPlan).slice(1)) : 'Starter'} Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Next billing date: January 15, 2024
              </p>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          const isSelected = plan.id === selectedPlan;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:shadow-lg animate-fadeInUp",
                isCurrentPlan && "border-success bg-success/5",
                isSelected && !isCurrentPlan && "border-primary bg-primary/5",
                plan.popular && "ring-2 ring-orange-500 shadow-xl scale-105"
              )}
              onClick={() => !isCurrentPlan && handlePlanSelect(plan.id)}
              style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-success text-success-foreground px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-xl flex items-center justify-center mx-auto">
                    <IconComponent className="h-6 w-6 text-orange-500" />
                  </div>
                </div>

                <div>
                  <CardTitle className="text-xl">{formatWords(plan.name)}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{formatWords(plan.description)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  {promoDetails && !promoDetails.expired && plan.id === selectedPlan && (
                    <div className="text-center">
                      <div className="text-sm line-through text-muted-foreground">${plan.price}</div>
                      <div className="text-lg font-bold text-green-600">
                        ${(plan.price - Math.round(plan.price * (promoDetails.percent / 100) * 100) / 100).toFixed(2)}
                        <span className="text-sm text-green-600 ml-1">after {promoDetails.percent}% off</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{formatWords(feature)}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => navigate('/dashboard/subscription/manage')}
                    >
                      Manage Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' : ''}`}
                      variant={plan.popular ? 'default' : (isSelected ? 'default' : 'outline')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan.id);
                      }}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      {selectedPlan !== currentPlan && (
        <Card className="animate-slideInLeft" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select your preferred payment method for the subscription
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = method.id === selectedPayment;
                
                return (
                  <div
                    key={method.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-border hover:border-muted-foreground",
                      !method.available && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => method.available && handlePaymentSelect(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={cn(
                        "h-6 w-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div>
                        <div className="font-medium text-foreground">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Form Fields */}
            {selectedPayment === 'card' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">Secure Payment</span>
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      if (value.replace(/\s/g, '').length <= 16) {
                        setCardData(prev => ({ ...prev, cardNumber: value }));
                      }
                    }}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={cardData.cardholderName}
                      onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="expiryMonth">Month</Label>
                      <Select 
                        value={cardData.expiryMonth} 
                        onValueChange={(value) => setCardData(prev => ({ ...prev, expiryMonth: value }))}
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
                        value={cardData.expiryYear} 
                        onValueChange={(value) => setCardData(prev => ({ ...prev, expiryYear: value }))}
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
                      <div className="relative">
                        <Input
                          id="cvv"
                          type={showCvv ? "text" : "password"}
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setCardData(prev => ({ ...prev, cvv: value }));
                            }
                          }}
                          maxLength={4}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPayment === 'paypal' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">P</div>
                  <span className="text-sm font-medium">PayPal Payment</span>
                </div>
                
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email Address</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={paypalData.email}
                    onChange={(e) => setPaypalData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll be redirected to PayPal to complete the payment
                  </p>
                </div>
              </div>
            )}

            {selectedPayment === 'mpesa' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-600 text-white rounded text-xs flex items-center justify-center font-bold">M</div>
                  <span className="text-sm font-medium">M-Pesa Payment</span>
                </div>
                
                <div>
                  <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                  <Input
                    id="mpesaPhone"
                    placeholder="+254 700 000 000"
                    value={mpesaData.phoneNumber}
                    onChange={(e) => setMpesaData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive an STK push prompt on your phone
                  </p>
                </div>
              </div>
            )}

            {/* Subscribe Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedPlan && (() => {
                  const sel = plans.find(p => p.id === selectedPlan);
                  return sel ? (
                    <div className="space-y-1">
                      <div>Selected: {formatWords(sel.name)} - ${sel.price}/month</div>
                      {(promoDetails && !promoDetails.expired) && (
                        <div className="text-green-600 font-medium">
                          🎉 {promoDetails.percent}% discount applied with code "{promoDetails.code}"
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={selectedPlan === currentPlan}
                size="lg"
                className="min-w-[120px]"
              >
                {selectedPayment === 'mpesa' ? 'Send STK Push' : 'Subscribe Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STK Push Modal */}
      {stkPushModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4">
                M
              </div>
              <CardTitle>M-Pesa STK Push</CardTitle>
              <p className="text-sm text-muted-foreground">
                Payment request sent to {stkPushModal.phone}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">BitVend POS</div>
                <div className="text-2xl font-bold text-green-600">
                  ${stkPushModal.amount}
                </div>
                <p className="text-sm text-muted-foreground">
                  Subscription payment for {subscriptionPlans.find(p => p.id === selectedPlan)?.name}
                </p>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="stkPin">Enter your M-Pesa PIN</Label>
                <Input
                  id="stkPin"
                  type="password"
                  placeholder="••••"
                  value={stkPushModal.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setStkPushModal(prev => ({ ...prev, pin: value }));
                    }
                  }}
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStkPushModal({ isOpen: false, amount: 0, phone: '', pin: '' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSTKConfirm}
                  disabled={stkPushModal.pin.length !== 4}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirm Payment
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                This is a simulation. In production, this would be sent to your actual M-Pesa phone.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Comparison Note */}
      <Card className="bg-muted/30 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">Need Help Choosing?</h3>
            <p className="text-sm text-muted-foreground">
              All plans include secure data storage, regular backups, and mobile app access. 
              Upgrade or downgrade anytime.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
