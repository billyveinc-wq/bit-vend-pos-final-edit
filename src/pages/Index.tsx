import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Clock
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Sales',
      value: '$0',
      icon: DollarSign,
      change: '+0%',
      color: 'text-green-600'
    },
    {
      title: 'Products in Stock',
      value: '0',
      icon: Package,
      change: '+0%',
      color: 'text-blue-600'
    },
    {
      title: "Today's Sales",
      value: '$0',
      icon: TrendingUp,
      change: '+0%',
      color: 'text-orange-600'
    },
    {
      title: 'Customers',
      value: '0',
      icon: Users,
      change: '+0%',
      color: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Start POS Session',
      description: 'Begin a new point of sale session',
      action: () => navigate('/checkout'),
      color: 'bg-primary hover:bg-primary/90'
    },
    {
      title: 'Add New Product',
      description: 'Add a new product to inventory',
      action: () => navigate('/products/add'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'View Sales Report',
      description: 'Check today\'s sales performance',
      action: () => navigate('/sales-report'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Manage Inventory',
      description: 'Update stock levels and products',
      action: () => navigate('/products'),
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to <span style={{ color: '#FFD000' }}>Bit Vend</span> POS
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your business operations efficiently
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString()}</span>
          <Clock size={16} />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="product-card">
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
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="product-card cursor-pointer" onClick={action.action}>
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
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="product-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent sales to display</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/checkout')}
              >
                Start Your First Sale
              </Button>
            </div>
          </CardContent>
        </Card>

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
                className="mt-4"
                onClick={() => navigate('/products')}
              >
                Manage Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
