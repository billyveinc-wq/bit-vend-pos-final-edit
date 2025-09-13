import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Star,
  Users,
  Shield,
  Zap,
  BarChart3,
  CreditCard,
  Smartphone,
  Globe,
  ArrowRight,
  Play,
  TrendingUp,
  Lock,
  Clock,
  Award,
  Monitor,
  Tablet,
  Phone,
  Building2,
  Target,
  Sparkles,
  Sun,
  Moon,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string>(() => {
    try { return localStorage.getItem('selected-plan') || 'starter'; } catch { return 'starter'; }
  });
  const choosePlan = (plan: string) => {
    setSelectedPlan(plan);
    try { localStorage.setItem('selected-plan', plan); } catch {}
  };

  // Typewriter for provider integrations
  const providerPhrases = useMemo(() => ([
    { name: 'M-Pesa', color: 'text-green-700 dark:text-green-300', glow: 'from-green-500/30', dot: 'bg-green-500' },
    { name: 'PayPal', color: 'text-blue-700 dark:text-blue-300', glow: 'from-blue-500/30', dot: 'bg-blue-500' },
    { name: 'Flutterwave', color: 'text-orange-700 dark:text-orange-300', glow: 'from-orange-500/30', dot: 'bg-orange-500' }
  ]), []);
  const [pIndex, setPIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');

  useEffect(() => {
    const phrase = providerPhrases[pIndex].name;
    let t: any;
    if (phase === 'typing') {
      if (typed.length < phrase.length) {
        t = setTimeout(() => setTyped(phrase.slice(0, typed.length + 1)), 90);
      } else {
        setPhase('pausing');
        t = setTimeout(() => setPhase('deleting'), 1100);
      }
    } else if (phase === 'deleting') {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(phrase.slice(0, typed.length - 1)), 50);
      } else {
        setPhase('typing');
        setPIndex((i) => (i + 1) % providerPhrases.length);
      }
    } else {
      t = setTimeout(() => setPhase('deleting'), 600);
    }
    return () => clearTimeout(t);
  }, [typed, phase, pIndex, providerPhrases]);

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time insights into your sales, inventory, and customer behavior with comprehensive reporting.'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Accept cash, cards, mobile money (M-Pesa), and digital payments seamlessly.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Works perfectly on any device - desktop, tablet, or mobile for on-the-go management.'
    },
    {
      icon: Users,
      title: 'Multi-User Support',
      description: 'Add cashiers, managers, and staff with role-based permissions and access control.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',  
      description: 'Bank-level security with encrypted data, secure payments, and regular backups.'
    },
    {
      icon: Globe,
      title: 'Multi-Branch Ready',
      description: 'Manage multiple locations from one dashboard with centralized inventory and reporting.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Retail Store Owner',
      company: 'Fashion Forward',
      content: 'BitVend POS transformed our business operations. Sales tracking is effortless and the analytics help us make better decisions.',
      rating: 5
    },
    {
      name: 'James Kiprotich',
      role: 'Restaurant Manager', 
      company: 'Savanna Grill',
      content: 'The M-Pesa integration is seamless. Our customers love the payment flexibility and we process orders 3x faster.',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'Pharmacy Owner',
      company: 'HealthPlus Pharmacy',
      content: 'Inventory management has never been easier. Low stock alerts save us from stockouts and the reporting is comprehensive.',
      rating: 5
    }
  ];

  const stats = [
    { number: '25,000+', label: 'Active Businesses', icon: Building2 },
    { number: '1.2B+', label: 'Transactions Processed', icon: TrendingUp },
    { number: '99.99%', label: 'Uptime Guarantee', icon: Shield },
    { number: '24/7', label: 'Customer Support', icon: Clock }
  ];

  const platforms = [
    { name: 'Desktop', icon: Monitor },
    { name: 'Tablet', icon: Tablet },
    { name: 'Mobile', icon: Phone }
  ];

  // Smooth scroll-reveal for sections
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-animate]')) as HTMLElement[];
    els.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-6');
          el.classList.add('transition-all', 'duration-700', 'ease-out');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background marketing-page" data-page="landing">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BV</span>
                </div>
                <span className="font-bold text-xl">BitVend</span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
            
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
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link to="/auth?mode=signin">
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                <Link to={`/auth?mode=signup&plan=${selectedPlan}`}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500/10 via-background to-blue-600/10 py-16 lg:py-24" data-animate>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-600/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-orange-500/20 backdrop-blur-sm border border-orange-500/20 rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  #1 Rated POS System
                </span>
              </div>

              {/* Typewriter: Integrated with ... */}
              <div className="relative inline-flex items-center mt-4">
                <div className={`absolute -inset-1 rounded-lg blur-lg bg-gradient-to-r ${providerPhrases[pIndex].glow} to-transparent transition-all duration-700`} aria-hidden="true" />
                <div className="relative z-10 text-base md:text-lg font-semibold drop-shadow-sm">
                  <span className="text-muted-foreground">Integrated with </span>
                  <span className={`${providerPhrases[pIndex].color}`}>{typed}</span>
                  <span className="inline-block w-[2px] h-4 ml-0.5 align-middle bg-foreground animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">POS & Inventory</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                A comprehensive point-of-sale solution designed to organize and track inventory, 
                process payments, and grow your business with powerful insights and analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg">
                  <Link to="/auth">
                    <Play className="mr-2 h-5 w-5" />
                    View Live Demo
                  </Link>
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-medium">4.9 from 2,847 reviews</span>
                </div>
              </div>
              
              <div className="flex items-center justify-start gap-8 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
              </div>
              
              {/* Platform Icons */}
              <div className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">Available on all platforms</p>
                <div className="flex items-center gap-4">
                  {platforms.map((platform, index) => {
                    const IconComponent = platform.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{platform.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-4 bg-slate-800 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-300 font-medium">BitVend POS Dashboard</span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-slate-900">
                    {/* Mock sidebar */}
                    <div className="flex gap-4">
                      <div className="w-16 space-y-2">
                        <div className="w-full h-8 bg-slate-700 rounded"></div>
                        <div className="w-full h-6 bg-slate-800 rounded"></div>
                        <div className="w-full h-6 bg-slate-800 rounded"></div>
                        <div className="w-full h-6 bg-slate-800 rounded"></div>
                      </div>
                      
                      {/* Mock main content */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg"></div>
                          <div className="h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-lg"></div>
                          <div className="h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg"></div>
                        </div>
                        <div className="h-24 bg-slate-800 rounded-lg"></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-16 bg-slate-800 rounded-lg"></div>
                          <div className="h-16 bg-slate-800 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-orange-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Integrations Spotlight */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Accept Payments Your Customers Love</h2>
            <p className="text-muted-foreground">Built-in integrations with leading providers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto" data-animate>
            <Card className="relative overflow-hidden border-2 border-green-500/30">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">M-Pesa (Daraja)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Native mobile money payments for East Africa with STK Push and Paybill/Till support.</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Popular</Badge>
                  <Badge variant="outline">STK Push</Badge>
                  <Badge variant="outline">Paybill</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-2 border-blue-500/30">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">PayPal</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Trusted global payments with one of the world’s most recognized digital wallets.</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Checkout</Badge>
                  <Badge variant="outline">Subscriptions</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-2 border-orange-500/30">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Flutterwave</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Card, bank, and mobile money payments across Africa with robust developer tools.</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Cards</Badge>
                  <Badge variant="outline">Bank</Badge>
                  <Badge variant="outline">Mobile Money</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-y border-border/50" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Choose the perfect plan for your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" data-animate>
            {[
              {
                name: 'Starter Plan',
                price: '$9',
                period: '/month',
                description: 'Best for small shops',
                icon: Building2,
                popular: false,
                features: ['Basic inventory & sales tracking', 'M-Pesa payments enabled', 'Simple reports', 'Email support', 'Add one extra user (cashier)']
              },
              {
                name: 'Standard Plan',
                price: '$19',
                period: '/month',
                description: 'Perfect for growing businesses',
                icon: Star,
                popular: true,
                features: ['Everything in Starter', 'Multi-user accounts', 'Advanced reports', 'Priority support']
              },
              {
                name: 'Pro Plan',
                price: '$39',
                period: '/month',
                description: 'Advanced features for scaling',
                icon: Crown,
                popular: false,
                features: ['Everything in Standard', 'Multi-branch support', 'Customer management', 'Custom receipts']
              },
              {
                name: 'Enterprise Plan',
                price: '$79',
                period: '/month',
                description: 'Complete solution for large operations',
                icon: Crown,
                popular: false,
                features: ['Everything in Pro', 'Unlimited branches & users', 'API integrations', '24/7 support']
              }
            ].map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Link to={`/auth?mode=signup&plan=${
                        plan.name === 'Starter Plan' ? 'starter' : plan.name === 'Standard Plan' ? 'standard' : plan.name === 'Pro Plan' ? 'pro' : 'enterprise'
                      }`} onClick={() => choosePlan(
                        plan.name === 'Starter Plan' ? 'starter' : plan.name === 'Standard Plan' ? 'standard' : plan.name === 'Pro Plan' ? 'pro' : 'enterprise'
                      )}>
                        {plan.name === 'Starter Plan' ? 'Start Free Trial' : `Choose ${plan.name}`}
                      </Link>
                    </Button>
                    
                    <div className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{plan.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              <Link to="/pricing">
                View All Plans & Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trusted by businesses worldwide
            </h2>
            <p className="text-muted-foreground">
              Join thousands of businesses that have transformed their operations
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500/10 to-blue-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20 px-4 py-2">
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Everything You Need to 
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent"> Scale Your Business</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From inventory management to advanced analytics, our comprehensive POS system 
              provides all the tools you need to streamline operations and maximize profits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto" data-animate>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-border/50 hover:border-orange-500/30 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-7 w-7 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Loved by Business Owners Everywhere
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their businesses with BitVend POS.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" data-animate>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24" data-animate>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-700"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-16 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Ready to Transform 
                <br />
                <span className="text-orange-200">Your Business?</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Join 25,000+ businesses using BitVend POS to streamline operations, 
                boost sales, and deliver exceptional customer experiences.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Link to={`/auth?mode=signup&plan=${selectedPlan}`} onClick={() => choosePlan(selectedPlan)}>
                  Start Free Trial Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg font-semibold backdrop-blur-sm">
                <Link to="/contact">
                  <Target className="mr-2 h-5 w-5" />
                  Schedule Demo
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 pt-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 text-orange-200" />
                <span className="text-white/90 font-medium">5-min setup</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-orange-200" />
                <span className="text-white/90 font-medium">Enterprise security</span>
              </div>
              <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
                <Award className="h-6 w-6 text-orange-200" />
                <span className="text-white/90 font-medium">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
