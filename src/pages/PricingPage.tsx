import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Check,
  Star,
  Zap,
  Building2,
  Crown,
  Users,
  Database,
  Shield,
  Headphones,
  TrendingUp,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

const PricingPage = () => {
  const { theme, setTheme } = useTheme();
  
  const plans = [
    {
      name: 'Starter Plan',
      price: '$9',
      period: '/month',
      description: 'Best for small shops',
      icon: Building2,
      popular: false,
      features: [
        'Basic inventory & sales tracking',
        'M-Pesa payments enabled',
        'Simple reports',
        'Email support'
      ],
      limitations: [
        'Single user only',
        'Basic features only'
      ]
    },
    {
      name: 'Standard Plan',
      price: '$19',
      period: '/month',
      description: 'Perfect for growing businesses',
      icon: Star,
      popular: true,
      features: [
        'Everything in Starter',
        'Multi-user accounts (cashiers/staff)',
        'Advanced sales & expense reports',
        'Low stock alerts',
        'Priority email support'
      ],
      limitations: []
    },
    {
      name: 'Pro Plan',
      price: '$39',
      period: '/month',
      description: 'Advanced features for scaling',
      icon: Crown,
      popular: false,
      features: [
        'Everything in Standard',
        'Multi-branch support',
        'Customer & supplier management',
        'Customizable receipts & invoices',
        'Priority chat support'
      ],
      limitations: []
    },
    {
      name: 'Enterprise Plan',
      price: '$79',
      period: '/month',
      description: 'Complete solution for large operations',
      icon: Crown,
      popular: false,
      features: [
        'Everything in Pro',
        'Unlimited branches & users',
        'API & advanced integrations',
        'Dedicated account manager',
        '24/7 priority support'
      ],
      limitations: []
    }
  ];

  const addOns = [
    {
      name: 'Additional Users',
      price: '$5/month per user',
      description: 'Add more staff members beyond plan limits'
    },
    {
      name: 'Extra Branches',
      price: '$10/month per branch',
      description: 'Add more store locations beyond plan limits'
    },
    {
      name: 'Premium Support',
      price: '$25/month',
      description: '24/7 phone support and priority assistance'
    },
    {
      name: 'Custom Development',
      price: 'Contact us',
      description: 'Tailored features and integrations for your business'
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and mobile money payments including M-Pesa.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for any plan. We provide free onboarding and training for all customers.'
    },
    {
      question: 'What if I exceed my transaction limits?',
      answer: 'We\'ll automatically suggest an upgrade to a plan that fits your usage. No transactions are blocked.'
    },
    {
      question: 'Do you offer discounts for annual payments?',
      answer: 'Yes! Save 20% when you pay annually instead of monthly.'
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-page="pricing">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BV</span>
              </div>
              <span className="font-bold text-xl">BitVend</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-9 px-0"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500/10 via-background to-blue-600/10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500/10 to-blue-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              Simple & Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Choose the Perfect</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Plan for Your Business
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free and scale as you grow. No hidden fees, no long-term contracts. 
              Change or cancel anytime with our flexible pricing.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-orange-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Button 
                      asChild 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Link to="/auth">
                        {plan.name === 'Starter Plan' ? 'Start Free Trial' : `Choose ${plan.name}`}
                      </Link>
                    </Button>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">What's included:</h4>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.length > 0 && (
                        <div className="pt-3 border-t border-border">
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Limitations:</h5>
                          {plan.limitations.map((limitation, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground/70">
                              • {limitation}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Add-ons
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Extend your POS system with additional features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {addon.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-orange-600 border-orange-500/20">
                      {addon.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-blue-600">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BitVend POS. Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              <Link to="/auth">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              <Link to="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;