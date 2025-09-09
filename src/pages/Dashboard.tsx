import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeatureGate } from '@/components/FeatureGate';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import TopCustomersVendors from '@/components/TopCustomersVendors';
import { useProducts } from '@/contexts/ProductContext';
import { useSales } from '@/contexts/SalesContext';
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Store,
  Crown
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { getTotalSales, getTodaysSales } = useSales();
  const { subscription, hasFeature } = useSubscription();

  const totalSalesAmount = getTotalSales();
  const todaysSales = getTodaysSales();
  const activeProducts = products.filter(p => p.status === 'active');
  const lowStockProducts = products.filter(p => p.stock && p.minStock && p.stock <= p.minStock);

  const stats = [
    {
      title: 'Total Sales',
      value: `$${totalSalesAmount.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      color: 'text-green-600',
      feature: 'basic_sales_tracking' as const,
    },
    {
      title: 'Products in Stock',
      value: activeProducts.length.toString(),
      icon: Package,
      change: `${lowStockProducts.length} low stock`,
      color: 'text-blue-600',
      feature: 'basic_inventory' as const,
    },
    {
      title: "Today's Sales",
      value: `$${todaysSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}`,
      icon: TrendingUp,
      change: `${todaysSales.length} transactions`,
      color: 'text-orange-600',
      feature: 'basic_sales_tracking' as const,
    },
    {
      title: 'Staff Members',
      value: hasFeature('multi_user_accounts') ? '8' : '1',
      icon: Users,
      change: hasFeature('multi_user_accounts') ? '+2' : 'Upgrade for multi-user',
      color: 'text-purple-600',
      feature: 'multi_user_accounts' as const,
    }
  ];

  const quickActions = [
    {
      title: 'Start POS Session',
      description: 'Begin a new point of sale session',
      action: () => navigate('/checkout'),
      color: 'bg-primary hover:bg-primary/90',
      feature: 'basic_sales_tracking' as const,
    },
    {
      title: 'Add New Product',
      description: 'Add a new product to inventory',
      action: () => navigate('/products/add'),
      color: 'bg-orange-500 hover:bg-orange-600',
      feature: 'basic_inventory' as const,
    },
    {
      title: 'Advanced Reports',
      description: 'View detailed business analytics',
      action: () => navigate('/sales-report'),
      color: 'bg-green-500 hover:bg-green-600',
      feature: 'advanced_reports' as const,
    },
    {
      title: 'Manage Staff',
      description: 'Add and manage staff accounts',
      action: () => navigate('/employees'),
      color: 'bg-blue-500 hover:bg-blue-600',
      feature: 'multi_user_accounts' as const,
    }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header with Subscription Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to <span style={{ color: '#FFD000' }}>Bit Vend</span> POS
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your business operations efficiently
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SubscriptionBadge />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString()}</span>
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          {(!subscription || subscription.plan_id === 'starter') && (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => navigate('/settings?section=business&subsection=subscription')}
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Feature Limitations Alert */}
      {!hasFeature('multi_user_accounts') && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-200">
                Limited Features Available
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              You're on the Starter plan. Upgrade to unlock multi-user accounts, advanced reports, multi-branch support, and more features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/settings?section=business&subsection=subscription')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              View Plans & Pricing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <FeatureGate key={stat.title} feature={stat.feature} showUpgrade={false}>
              <Card className="product-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span className={stat.color}>{stat.change}</span>
                    {stat.feature === 'multi_user_accounts' && !hasFeature(stat.feature) ? (
                      <span className="ml-1"></span>
                    ) : (
                      <span className="ml-1">from last month</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <FeatureGate key={action.title} feature={action.feature}>
              <Card className="product-card cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <div className={`w-12 h-12 rounded-full ${action.color} ${action.title === 'Start POS Session' ? 'dark:bg-black' : ''} mx-auto flex items-center justify-center`}>
                      <BarChart3 className="h-6 w-6" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="product-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent sales to display</p>
              <FeatureGate feature="basic_sales_tracking" showUpgrade={false}>
                <Button
                  variant="outline"
                  className="mt-4 bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                  onClick={() => navigate('/checkout')}
                >
                  Start Your First Sale
                </Button>
              </FeatureGate>
            </div>
          </CardContent>
        </Card>

        <FeatureGate 
          feature="low_stock_alerts" 
          fallback={
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="text-foreground">Stock Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Basic stock view available</p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                    onClick={() => navigate('/products')}
                  >
                    View Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          }
        >
          <Card className="product-card">
            <CardHeader>
              <CardTitle className="text-foreground">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No low stock alerts</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                  onClick={() => navigate('/products')}
                >
                  Manage Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Business Insights */}
      <FeatureGate 
        feature="customer_supplier_management"
        fallback={
          <Card className="product-card">
            <CardHeader>
              <CardTitle className="text-foreground">Business Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Customer and supplier insights available in Pro plan
              </p>
              <Button 
                onClick={() => navigate('/settings?section=business&subsection=subscription')}
                className="gap-2"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        }
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Business Insights</h2>
          <TopCustomersVendors />
        </div>
      </FeatureGate>
    </div>
  );
};

export default Dashboard;