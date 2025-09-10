import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart
} from 'lucide-react';

const BusinessReports: React.FC = () => {
  // Mock data - in a real app this would come from your sales context or API
  const businessMetrics = {
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    topSellingCategory: 'N/A',
    revenueGrowth: 0,
    salesGrowth: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideInLeft">
      {/* Total Revenue */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${businessMetrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+{businessMetrics.revenueGrowth}%</span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Sales */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sales
          </CardTitle>
          <ShoppingCart className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {businessMetrics.totalSales}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-blue-600" />
            <span className="text-blue-600">+{businessMetrics.salesGrowth}%</span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Order Value
          </CardTitle>
          <BarChart3 className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${businessMetrics.averageOrderValue.toFixed(2)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-orange-600" />
            <span className="text-orange-600">+0%</span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Category
          </CardTitle>
          <PieChart className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {businessMetrics.topSellingCategory}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Best Performer
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessReports;
