import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  Smartphone,
  Users,
  Shield,
  Globe,
  Package,
  Receipt,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  Database,
  Cloud,
  PieChart,
  DollarSign,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

const FeaturesPage = () => {
  const { theme, setTheme } = useTheme();
  const coreFeatures = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Reporting',
      description: 'Get deep insights into your business with real-time sales analytics, profit margins, top-selling products, and customer behavior patterns.',
      benefits: ['Real-time dashboards', 'Customizable reports', 'Export to Excel/PDF', 'Visual charts & graphs']
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, set low-stock alerts, manage suppliers, and automate reordering to never run out of popular items.',
      benefits: ['Stock tracking', 'Low stock alerts', 'Supplier management', 'Auto-reordering']
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Methods',
      description: 'Accept cash, credit cards, mobile money (M-Pesa, MTN Mobile Money), and digital wallets seamlessly.',
      benefits: ['Cash payments', 'Card processing', 'Mobile money', 'Digital wallets']
    },
    {
      icon: Receipt,
      title: 'Sales & POS System',
      description: 'Fast checkout process with barcode scanning, customizable receipts, and support for discounts and promotions.',
      benefits: ['Barcode scanning', 'Custom receipts', 'Discounts & promos', 'Split payments']
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Build customer database, track purchase history, implement loyalty programs, and send targeted promotions.',
      benefits: ['Customer database', 'Purchase history', 'Loyalty programs', 'Email marketing']
    },
    {
      icon: FileText,
      title: 'Financial Reporting',
      description: 'Generate profit & loss statements, balance sheets, cash flow reports, and tax-ready documentation.',
      benefits: ['P&L statements', 'Balance sheets', 'Cash flow reports', 'Tax documents']
    }
  ];

  const advancedFeatures = [
    {
      icon: Globe,
      title: 'Multi-Branch Management',
      description: 'Manage multiple store locations from one central dashboard with unified inventory and reporting.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimization',
      description: 'Works perfectly on any device - desktop, tablet, or mobile for on-the-go management.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encrypted data, secure payments, and regular automated backups.'
    },
    {
      icon: Cloud,
      title: 'Cloud Synchronization',
      description: 'Real-time data sync across all devices and locations with automatic cloud backup.'
    },
    {
      icon: Database,
      title: 'Data Export & Backup',
      description: 'Export your data anytime, schedule automatic backups, and maintain full data ownership.'
    },
    {
      icon: Zap,
      title: 'Integration Ready',
      description: 'Connect with accounting software, e-commerce platforms, and third-party applications.'
    }
  ];

  const businessBenefits = [
    { icon: TrendingUp, title: 'Increase Sales', description: 'Up to 30% increase in sales efficiency' },
    { icon: Clock, title: 'Save Time', description: 'Reduce checkout time by 50%' },
    { icon: DollarSign, title: 'Reduce Costs', description: 'Lower operational costs by 25%' },
    { icon: PieChart, title: 'Better Insights', description: 'Make data-driven business decisions' }
  ];

  return (
    <div className="min-h-screen bg-background" data-page="features">
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
              Complete Feature Set
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Everything You Need to</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Run Your Business
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              From inventory management to financial reporting, BitVend POS provides all the tools 
              you need to streamline operations, increase sales, and grow your business.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              <Link to="/auth">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Essential tools for modern business operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {feature.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features for growing businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-orange-500" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground mb-2">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Business Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See the measurable benefits our customers experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-blue-600">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BitVend POS to streamline operations and increase profits.
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

export default FeaturesPage;