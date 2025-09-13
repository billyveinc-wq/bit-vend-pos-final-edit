-- Create purchases table for purchase orders
CREATE TABLE public.purchases (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id),
  supplier VARCHAR(255) NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchase_items table for purchase order line items
CREATE TABLE public.purchase_items (
  id BIGSERIAL PRIMARY KEY,
  purchase_id BIGINT REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key to products if sku exists
ALTER TABLE public.purchase_items 
ADD CONSTRAINT purchase_items_product_sku_fkey 
FOREIGN KEY (product_sku) REFERENCES public.products(sku);

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Policies for purchases
CREATE POLICY "Users can read purchases for their company" ON public.purchases
FOR SELECT
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert purchases for their company" ON public.purchases
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update purchases for their company" ON public.purchases
FOR UPDATE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Policies for purchase_items
CREATE POLICY "Users can read purchase items for their company" ON public.purchase_items
FOR SELECT
USING (
  purchase_id IN (
    SELECT p.id FROM public.purchases p
    JOIN public.company_users cu ON p.company_id = cu.company_id
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert purchase items for their company" ON public.purchase_items
FOR INSERT
WITH CHECK (
  purchase_id IN (
    SELECT p.id FROM public.purchases p
    JOIN public.company_users cu ON p.company_id = cu.company_id
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update purchase items for their company" ON public.purchase_items
FOR UPDATE
USING (
  purchase_id IN (
    SELECT p.id FROM public.purchases p
    JOIN public.company_users cu ON p.company_id = cu.company_id
    WHERE cu.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_items_updated_at
BEFORE UPDATE ON public.purchase_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_purchases_company_id ON public.purchases(company_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_order_date ON public.purchases(order_date);
CREATE INDEX idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product_sku ON public.purchase_items(product_sku);
