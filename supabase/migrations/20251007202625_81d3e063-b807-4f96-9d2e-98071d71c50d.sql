-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('processing', 'preparing', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create saved_cakes table
CREATE TABLE public.saved_cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  layers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on saved_cakes
ALTER TABLE public.saved_cakes ENABLE ROW LEVEL SECURITY;

-- Saved cakes policies
CREATE POLICY "Users can view own saved cakes"
  ON public.saved_cakes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved cakes"
  ON public.saved_cakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved cakes"
  ON public.saved_cakes FOR DELETE
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  comment TEXT,
  status public.order_status DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_history table
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  comment TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_history
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Order history policies
CREATE POLICY "Users can view own order history"
  ON public.order_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create verification_codes table for email verification
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on verification_codes
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No public access to verification codes (only via edge functions)

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to move order to history
CREATE OR REPLACE FUNCTION public.complete_order(order_id UUID)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
BEGIN
  -- Get the order
  SELECT * INTO order_record FROM public.orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Insert into history
  INSERT INTO public.order_history (
    user_id, order_id, items, total_price, 
    customer_name, customer_phone, delivery_date, comment
  ) VALUES (
    order_record.user_id, order_record.id, order_record.items, 
    order_record.total_price, order_record.customer_name, 
    order_record.customer_phone, order_record.delivery_date, order_record.comment
  );
  
  -- Delete from orders
  DELETE FROM public.orders WHERE id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;