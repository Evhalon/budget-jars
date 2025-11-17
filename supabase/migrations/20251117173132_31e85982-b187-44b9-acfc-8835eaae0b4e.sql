-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create incomes table
CREATE TABLE public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incomes"
  ON public.incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON public.incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON public.incomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON public.incomes FOR DELETE
  USING (auth.uid() = user_id);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create jars table (savings goals)
CREATE TABLE public.jars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.jars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jars"
  ON public.jars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jars"
  ON public.jars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jars"
  ON public.jars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jars"
  ON public.jars FOR DELETE
  USING (auth.uid() = user_id);

-- Create jar_transactions table
CREATE TABLE public.jar_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jar_id UUID NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.jar_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jar transactions"
  ON public.jar_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jars
      WHERE jars.id = jar_transactions.jar_id
      AND jars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own jar transactions"
  ON public.jar_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jars
      WHERE jars.id = jar_transactions.jar_id
      AND jars.user_id = auth.uid()
    )
  );