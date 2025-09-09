import React from 'react';
import { useSubscription, type SubscriptionFeatures } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: keyof SubscriptionFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const FEATURE_NAMES: Record<keyof SubscriptionFeatures, string> = {
  basic_inventory: 'Basic Inventory',
  basic_sales_tracking: 'Basic Sales Tracking',
  mpesa_payments: 'M-Pesa Payments',
  simple_reports: 'Simple Reports',
  multi_user_accounts: 'Multi-User Accounts',
  advanced_reports: 'Advanced Reports',
  low_stock_alerts: 'Low Stock Alerts',
  priority_email_support: 'Priority Email Support',
  multi_branch_support: 'Multi-Branch Support',
  customer_supplier_management: 'Customer & Supplier Management',
  customizable_receipts: 'Customizable Receipts',
  priority_chat_support: 'Priority Chat Support',
  unlimited_branches: 'Unlimited Branches',
  unlimited_users: 'Unlimited Users',
  api_integrations: 'API Integrations',
  dedicated_account_manager: 'Dedicated Account Manager',
  priority_support_24_7: '24/7 Priority Support',
};

const FEATURE_PLANS: Record<keyof SubscriptionFeatures, string[]> = {
  basic_inventory: ['starter', 'standard', 'pro', 'enterprise'],
  basic_sales_tracking: ['starter', 'standard', 'pro', 'enterprise'],
  mpesa_payments: ['starter', 'standard', 'pro', 'enterprise'],
  simple_reports: ['starter', 'standard', 'pro', 'enterprise'],
  multi_user_accounts: ['standard', 'pro', 'enterprise'],
  advanced_reports: ['standard', 'pro', 'enterprise'],
  low_stock_alerts: ['standard', 'pro', 'enterprise'],
  priority_email_support: ['standard', 'pro', 'enterprise'],
  multi_branch_support: ['pro', 'enterprise'],
  customer_supplier_management: ['pro', 'enterprise'],
  customizable_receipts: ['pro', 'enterprise'],
  priority_chat_support: ['pro', 'enterprise'],
  unlimited_branches: ['enterprise'],
  unlimited_users: ['enterprise'],
  api_integrations: ['enterprise'],
  dedicated_account_manager: ['enterprise'],
  priority_support_24_7: ['enterprise'],
};

const PLAN_ICONS = {
  starter: Star,
  standard: Zap,
  pro: Crown,
  enterprise: Crown,
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasFeature, subscription } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const featureName = FEATURE_NAMES[feature];
  const requiredPlans = FEATURE_PLANS[feature];
  const lowestPlan = requiredPlans[0];
  const currentPlan = subscription?.plan_id || 'starter';

  const PlanIcon = PLAN_ICONS[lowestPlan as keyof typeof PLAN_ICONS];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {lowestPlan.charAt(0).toUpperCase() + lowestPlan.slice(1)}+ Required
          </Badge>
        </div>
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <PlanIcon className="h-5 w-5" />
          {featureName}
        </CardTitle>
        <CardDescription>
          This feature requires {lowestPlan === 'starter' ? 'a' : 'the'} {' '}
          <span className="font-medium capitalize">{lowestPlan}</span> plan or higher
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            You're currently on the <span className="font-medium capitalize">{currentPlan}</span> plan
          </p>
          <Button 
            className="w-full" 
            onClick={() => {
              // Navigate to subscription settings
              window.location.href = '/settings?section=business&subsection=subscription';
            }}
          >
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// HOC version for wrapping components
export const withFeatureGate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof SubscriptionFeatures,
  options?: {
    fallback?: React.ReactNode;
    showUpgrade?: boolean;
  }
) => {
  return (props: P) => (
    <FeatureGate
      feature={feature}
      fallback={options?.fallback}
      showUpgrade={options?.showUpgrade}
    >
      <WrappedComponent {...props} />
    </FeatureGate>
  );
};