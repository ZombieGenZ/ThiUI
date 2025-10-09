/*
  # Fix Schema and Add Orders Table

  1. Changes to Existing Tables
    - Rename `user_profiles` to `profiles` for consistency (if exists)
    - Keep favorites table as is

  2. New Tables
    - `orders` (if not exists)
    - `order_items` (if not exists)

  3. Security
    - Enable RLS on orders and order_items tables
    - Users can only view and manage their own orders
    - Add policies for authenticated users

  4. Indexes
    - Add indexes for quick order lookups
*/

-- Rename user_profiles to profiles if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'user_profiles' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'profiles' AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_profiles RENAME TO profiles;
  END IF;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  avatar_url text DEFAULT '',
  loyalty_points integer DEFAULT 0,
  loyalty_tier text DEFAULT 'Silver',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || gen_random_uuid()::text,
  total_amount decimal(10, 2) NOT NULL DEFAULT 0,
  shipping_cost decimal(10, 2) NOT NULL DEFAULT 0,
  tax decimal(10, 2) NOT NULL DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0,
  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'credit-card',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_address jsonb DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  delivery_date date,
  assembly_service boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table if not exists
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL DEFAULT 0,
  price decimal(10, 2) NOT NULL DEFAULT 0,
  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  dimensions text,
  material text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for orders (if not exists)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own orders" ON orders;
  DROP POLICY IF EXISTS "Users can create own orders" ON orders;
  DROP POLICY IF EXISTS "Users can update own orders" ON orders;
  DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
  DROP POLICY IF EXISTS "Users can create order items" ON order_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for order_items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );