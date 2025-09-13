-- Create stock_ins table for stock receipts
CREATE TABLE public.stock_ins (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id),
  product_sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by VARCHAR(255) NOT NULL DEFAULT 'System',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stock_outs table for stock dispatch/outbound
CREATE TABLE public.stock_outs (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id),
  product_sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  reason VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  batch_number VARCHAR(100),
  out_date DATE NOT NULL DEFAULT CURRENT_DATE,
  processed_by VARCHAR(255) NOT NULL DEFAULT 'System',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stock_returns table for stock returns
CREATE TABLE public.stock_returns (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id),
  product_sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  customer VARCHAR(255),
  reason VARCHAR(255) NOT NULL,
  return_type VARCHAR(50) NOT NULL DEFAULT 'defective', -- defective, excess, expired, customer_return
  batch_number VARCHAR(100),
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  processed_by VARCHAR(255) NOT NULL DEFAULT 'System',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  refund_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign keys to products if sku exists
ALTER TABLE public.stock_ins 
ADD CONSTRAINT stock_ins_product_sku_fkey 
FOREIGN KEY (product_sku) REFERENCES public.products(sku);

ALTER TABLE public.stock_outs 
ADD CONSTRAINT stock_outs_product_sku_fkey 
FOREIGN KEY (product_sku) REFERENCES public.products(sku);

ALTER TABLE public.stock_returns 
ADD CONSTRAINT stock_returns_product_sku_fkey 
FOREIGN KEY (product_sku) REFERENCES public.products(sku);

-- Enable Row Level Security
ALTER TABLE public.stock_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_returns ENABLE ROW LEVEL SECURITY;

-- Policies for stock_ins
CREATE POLICY "Users can read stock ins for their company" ON public.stock_ins
FOR SELECT
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert stock ins for their company" ON public.stock_ins
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update stock ins for their company" ON public.stock_ins
FOR UPDATE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Policies for stock_outs (similar pattern)
CREATE POLICY "Users can read stock outs for their company" ON public.stock_outs
FOR SELECT
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert stock outs for their company" ON public.stock_outs
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update stock outs for their company" ON public.stock_outs
FOR UPDATE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Policies for stock_returns (similar pattern)
CREATE POLICY "Users can read stock returns for their company" ON public.stock_returns
FOR SELECT
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert stock returns for their company" ON public.stock_returns
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update stock returns for their company" ON public.stock_returns
FOR UPDATE
USING (
  company_id IN (
    SELECT cu.company_id 
    FROM public.company_users cu 
    WHERE cu.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stock_ins_updated_at
BEFORE UPDATE ON public.stock_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_outs_updated_at
BEFORE UPDATE ON public.stock_outs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_returns_updated_at
BEFORE UPDATE ON public.stock_returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_stock_ins_company_id ON public.stock_ins(company_id);
CREATE INDEX idx_stock_ins_product_sku ON public.stock_ins(product_sku);
CREATE INDEX idx_stock_ins_received_date ON public.stock_ins(received_date);
CREATE INDEX idx_stock_ins_status ON public.stock_ins(status);

CREATE INDEX idx_stock_outs_company_id ON public.stock_outs(company_id);
CREATE INDEX idx_stock_outs_product_sku ON public.stock_outs(product_sku);
CREATE INDEX idx_stock_outs_out_date ON public.stock_outs(out_date);
CREATE INDEX idx_stock_outs_status ON public.stock_outs(status);

CREATE INDEX idx_stock_returns_company_id ON public.stock_returns(company_id);
CREATE INDEX idx_stock_returns_product_sku ON public.stock_returns(product_sku);
CREATE INDEX idx_stock_returns_return_date ON public.stock_returns(return_date);
CREATE INDEX idx_stock_returns_status ON public.stock_returns(status);
