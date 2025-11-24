-- Fix RLS policies for jar_transactions
CREATE POLICY "Users can delete own jar transactions"
ON jar_transactions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM jars
    WHERE jars.id = jar_transactions.jar_id
    AND jars.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own jar transactions"
ON jar_transactions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jars
    WHERE jars.id = jar_transactions.jar_id
    AND jars.user_id = auth.uid()
  )
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual')),
  monthly_amount NUMERIC NOT NULL DEFAULT 0,
  annual_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget_items
CREATE POLICY "Users can view own budget items"
ON budget_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget items"
ON budget_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget items"
ON budget_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget items"
ON budget_items FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget_items
CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON budget_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();