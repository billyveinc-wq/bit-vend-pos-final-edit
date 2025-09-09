import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionPlan = 'starter' | 'standard' | 'pro' | 'enterprise';

export interface SubscriptionFeatures {
  basic_inventory: boolean;
  basic_sales_tracking: boolean;
  mpesa_payments: boolean;
  simple_reports: boolean;
  multi_user_accounts: boolean;
  advanced_reports: boolean;
  low_stock_alerts: boolean;
  priority_email_support: boolean;
  multi_branch_support: boolean;
  customer_supplier_management: boolean;
  customizable_receipts: boolean;
  priority_chat_support: boolean;
  unlimited_branches: boolean;
  unlimited_users: boolean;
  api_integrations: boolean;
  dedicated_account_manager: boolean;
  priority_support_24_7: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string; // Changed to string for database compatibility
  started_at: string;
  expires_at?: string;
  payment_method?: string;
  payment_details?: any;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  features: SubscriptionFeatures;
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  canUseFeature: (feature: keyof SubscriptionFeatures, showToast?: boolean) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Default features for free tier (starter plan features)
const DEFAULT_FEATURES: SubscriptionFeatures = {
  basic_inventory: true,
  basic_sales_tracking: true,
  mpesa_payments: true,
  simple_reports: true,
  multi_user_accounts: false,
  advanced_reports: false,
  low_stock_alerts: false,
  priority_email_support: false,
  multi_branch_support: false,
  customer_supplier_management: false,
  customizable_receipts: false,
  priority_chat_support: false,
  unlimited_branches: false,
  unlimited_users: false,
  api_integrations: false,
  dedicated_account_manager: false,
  priority_support_24_7: false,
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeatures>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        setSubscription(null);
        setFeatures(DEFAULT_FEATURES);
        return;
      }
      
      if (!user) {
        setSubscription(null);
        setFeatures(DEFAULT_FEATURES);
        return;
      }

      // Fetch user subscription
      const { data: userSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
        // Continue with default features instead of failing
        setSubscription(null);
        setFeatures(DEFAULT_FEATURES);
        return;
      }

      if (userSub) {
        setSubscription(userSub);
        
        // Fetch plan features
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('features')
          .eq('id', userSub.plan_id)
          .single();

        if (planError) {
          console.error('Error fetching plan features:', planError);
          return;
        }

        // Convert features array to features object
        const planFeatures = plan.features as string[];
        const userFeatures: SubscriptionFeatures = { ...DEFAULT_FEATURES };
        
        Object.keys(userFeatures).forEach(feature => {
          userFeatures[feature as keyof SubscriptionFeatures] = planFeatures.includes(feature);
        });
        
        setFeatures(userFeatures);
      } else {
        // No active subscription - use default/free features
        setSubscription(null);
        setFeatures(DEFAULT_FEATURES);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchSubscription();
        }
      }
    );

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return features[feature] || false;
  };

  const canUseFeature = (feature: keyof SubscriptionFeatures, showToast: boolean = true): boolean => {
    const hasAccess = hasFeature(feature);
    
    if (!hasAccess && showToast) {
      const currentPlan = subscription?.plan_id || 'starter';
      toast({
        title: "Feature Not Available",
        description: `This feature is not included in your ${currentPlan} plan. Please upgrade to access this functionality.`,
        variant: "destructive",
      });
    }
    
    return hasAccess;
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        features,
        hasFeature,
        isLoading,
        refreshSubscription,
        canUseFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};