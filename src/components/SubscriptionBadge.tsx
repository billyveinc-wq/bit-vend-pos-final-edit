import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  className?: string;
  showIcon?: boolean;
}

const PLAN_CONFIG = {
  starter: {
    label: 'Starter',
    icon: Star,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  standard: {
    label: 'Standard',
    icon: Zap,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Crown,
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  className,
  showIcon = true,
}) => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("animate-pulse", className)}>
        Loading...
      </Badge>
    );
  }

  const planId = subscription?.plan_id || 'starter';
  const config = PLAN_CONFIG[planId];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};