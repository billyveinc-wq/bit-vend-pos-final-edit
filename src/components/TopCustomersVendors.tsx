import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Truck,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const TopCustomersVendors: React.FC = () => {
  const [topCustomers] = useState([]);

  const [topVendors] = useState([]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Customers */}
      <Card className="animate-slideInLeft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Top Customers
          </CardTitle>
          <CardDescription>Highest value customers by sales volume</CardDescription>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No customer data available</p>
              <p className="text-sm">Add customers and sales to see top customers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div 
                  key={customer.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{customer.amount}</span>
                    {getTrendIcon(customer.trend)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Vendors */}
      <Card className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Top Vendors
          </CardTitle>
          <CardDescription>Highest purchase volume vendors</CardDescription>
        </CardHeader>
        <CardContent>
          {topVendors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vendor data available</p>
              <p className="text-sm">Add suppliers and purchases to see top vendors</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topVendors.map((vendor, index) => (
                <div 
                  key={vendor.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.orders} orders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{vendor.amount}</span>
                    {getTrendIcon(vendor.trend)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopCustomersVendors;