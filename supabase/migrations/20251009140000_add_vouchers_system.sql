/*
  # Add Vouchers System

  1. New Tables
    - `vouchers`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The voucher code users will enter
      - `discount_type` (text) - Either 'percentage' or 'fixed'
      - `discount_value` (decimal) - Percentage (0-100) or fixed amount
      - `min_order_amount` (decimal) - Minimum order amount to use voucher
      - `max_discount_amount` (decimal) - Maximum discount for percentage vouchers
      - `usage_limit` (integer) - Total times voucher can be used (null = unlimited)
      - `usage_count` (integer) - Current usage count
      - `active` (boolean) - Whether voucher is currently active
      - `valid_from` (timestamptz) - When voucher becomes valid
      - `valid_until` (timestamptz) - When voucher expires
      - `description` (text) - Description of the voucher
      - `created_at` (timestamptz)

    - `voucher_usage`
      - `id` (uuid, primary key)
      - `voucher_id` (uuid) - Reference to voucher
      - `user_id` (uuid) - User who used the voucher
      - `order_id` (uuid) - Order where voucher was applied
      - `discount_amount` (decimal) - Actual discount amount applied
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - All authenticated users can view active vouchers
    - Only authenticated users can use vouchers
    - Users can view their own voucher usage history

  3. Sample Data
    - Create some sample vouchers for testing
*/

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount decimal(10, 2) DEFAULT 0,
  max_discount_amount decimal(10, 2),
  usage_limit integer,
  usage_count integer DEFAULT 0,
  active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create voucher_usage table
CREATE TABLE IF NOT EXISTS voucher_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount decimal(10, 2) NOT NULL DEFAULT 0,
  used_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(active);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_id ON voucher_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order_id ON voucher_usage(order_id);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active vouchers" ON vouchers;
  DROP POLICY IF EXISTS "Users can view their voucher usage" ON voucher_usage;
  DROP POLICY IF EXISTS "Users can create voucher usage" ON voucher_usage;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for vouchers
CREATE POLICY "Anyone can view active vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- Policies for voucher_usage
CREATE POLICY "Users can view their voucher usage"
  ON voucher_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create voucher usage"
  ON voucher_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add voucher_id column to orders table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'voucher_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN voucher_id uuid REFERENCES vouchers(id);
    ALTER TABLE orders ADD COLUMN voucher_discount decimal(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Insert sample vouchers for testing
INSERT INTO vouchers (code, discount_type, discount_value, min_order_amount, max_discount_amount, description, valid_until)
VALUES
  ('WELCOME10', 'percentage', 10, 100, 50, 'Welcome discount - 10% off orders over $100', now() + interval '90 days'),
  ('SAVE20', 'fixed', 20, 50, NULL, 'Save $20 on orders over $50', now() + interval '60 days'),
  ('FURNITURE25', 'percentage', 25, 500, 200, 'Premium discount - 25% off orders over $500', now() + interval '30 days'),
  ('FREESHIP', 'fixed', 50, 200, NULL, 'Free shipping on orders over $200', now() + interval '120 days'),
  ('MEGA50', 'fixed', 50, 300, NULL, 'Save $50 on orders over $300', now() + interval '45 days')
ON CONFLICT (code) DO NOTHING;
