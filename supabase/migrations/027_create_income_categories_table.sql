-- Create income_categories table
CREATE TABLE public.income_categories (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10b981',
  is_active BOOLEAN NOT NULL DEFAULT true,
  income_count INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;

-- Policies for income_categories
CREATE POLICY "Users can read income categories for their company" ON public.income_categories
FOR SELECT
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert income categories for their company" ON public.income_categories
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update income categories for their company" ON public.income_categories
FOR UPDATE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete income categories for their company" ON public.income_categories
FOR DELETE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_income_categories_updated_at
BEFORE UPDATE ON public.income_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_income_categories_company_id ON public.income_categories(company_id);
CREATE INDEX idx_income_categories_is_active ON public.income_categories(is_active);
CREATE INDEX idx_income_categories_name ON public.income_categories(name);

-- Insert default income categories
INSERT INTO public.income_categories (company_id, name, description, color) VALUES
(1, 'Sales Revenue', 'Revenue from product and service sales', '#10b981'),
(1, 'Service Income', 'Income from services provided', '#3b82f6'),
(1, 'Interest Income', 'Interest earned on investments', '#8b5cf6'),
(1, 'Other Income', 'Miscellaneous income sources', '#f59e0b');

-- Add category_id to income table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='income' AND column_name='category_id'
  ) THEN
    ALTER TABLE public.income ADD COLUMN category_id BIGINT REFERENCES public.income_categories(id);
    CREATE INDEX idx_income_category_id ON public.income(category_id);
  END IF;
END $$;

-- Function to update income category totals
CREATE OR REPLACE FUNCTION public.update_income_category_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category totals when income is inserted/updated/deleted
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.income_categories 
    SET 
      income_count = (SELECT COUNT(*) FROM public.income WHERE category_id = NEW.category_id),
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM public.income WHERE category_id = NEW.category_id)
    WHERE id = NEW.category_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE public.income_categories 
    SET 
      income_count = (SELECT COUNT(*) FROM public.income WHERE category_id = OLD.category_id),
      total_amount = (SELECT COALESCE(SUM(amount), 0) FROM public.income WHERE category_id = OLD.category_id)
    WHERE id = OLD.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update category totals
CREATE TRIGGER update_income_category_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.income
FOR EACH ROW
EXECUTE FUNCTION public.update_income_category_totals();
