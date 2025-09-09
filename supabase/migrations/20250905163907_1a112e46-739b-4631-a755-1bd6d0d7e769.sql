-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, pending
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT, -- card, paypal, mpesa
  payment_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (public read)
CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans
FOR SELECT
USING (true);

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscription" ON public.user_subscriptions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Service role can insert subscriptions" ON public.user_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions" ON public.user_subscriptions
FOR UPDATE
USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, price, features) VALUES
('starter', 'Starter Plan', 900, '["basic_inventory", "basic_sales_tracking", "mpesa_payments", "simple_reports"]'),
('standard', 'Standard Plan', 1900, '["basic_inventory", "basic_sales_tracking", "mpesa_payments", "simple_reports", "multi_user_accounts", "advanced_reports", "low_stock_alerts", "priority_email_support"]'),
('pro', 'Pro Plan', 3900, '["basic_inventory", "basic_sales_tracking", "mpesa_payments", "simple_reports", "multi_user_accounts", "advanced_reports", "low_stock_alerts", "priority_email_support", "multi_branch_support", "customer_supplier_management", "customizable_receipts", "priority_chat_support"]'),
('enterprise', 'Enterprise Plan', 7900, '["basic_inventory", "basic_sales_tracking", "mpesa_payments", "simple_reports", "multi_user_accounts", "advanced_reports", "low_stock_alerts", "priority_email_support", "multi_branch_support", "customer_supplier_management", "customizable_receipts", "priority_chat_support", "unlimited_branches", "unlimited_users", "api_integrations", "dedicated_account_manager", "priority_support_24_7"]');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();