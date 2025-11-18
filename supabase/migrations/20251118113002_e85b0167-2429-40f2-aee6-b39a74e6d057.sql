-- Add monthly contribution field to jars
ALTER TABLE public.jars ADD COLUMN monthly_contribution numeric DEFAULT 0;

-- Create projections table
CREATE TABLE public.projections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  starting_amount numeric NOT NULL DEFAULT 0,
  monthly_savings numeric NOT NULL,
  months integer NOT NULL,
  final_amount numeric NOT NULL,
  interest_rate numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for projections
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;

-- RLS policies for projections
CREATE POLICY "Users can view own projections" 
ON public.projections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projections" 
ON public.projections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projections" 
ON public.projections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projections" 
ON public.projections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create AI suggestions table
CREATE TABLE public.ai_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  suggestion_text text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for ai_suggestions
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_suggestions
CREATE POLICY "Users can view own suggestions" 
ON public.ai_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions" 
ON public.ai_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" 
ON public.ai_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions" 
ON public.ai_suggestions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create budget alerts table
CREATE TABLE public.budget_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  alert_type text NOT NULL,
  message text NOT NULL,
  threshold_amount numeric,
  is_read boolean DEFAULT false,
  severity text DEFAULT 'info',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for budget_alerts
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget_alerts
CREATE POLICY "Users can view own alerts" 
ON public.budget_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" 
ON public.budget_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" 
ON public.budget_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" 
ON public.budget_alerts 
FOR DELETE 
USING (auth.uid() = user_id);