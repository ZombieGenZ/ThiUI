-- Run this SQL script in your Supabase SQL Editor to fix the orders schema
-- This ensures all required columns exist in the orders and order_items tables

-- Fix orders table: ensure all required columns exist
DO $$
BEGIN
  -- Add contact_info if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE orders ADD COLUMN contact_info jsonb DEFAULT '{}';
  END IF;

  -- Add shipping_address if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address jsonb DEFAULT '{}';
  END IF;

  -- Add subtotal if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal decimal(10, 2) NOT NULL DEFAULT 0;
  END IF;

  -- Add payment_status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- Fix order_items table: ensure all required columns exist
DO $$
BEGIN
  -- Add unit_price if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN unit_price decimal(10, 2) NOT NULL DEFAULT 0;
  END IF;

  -- Add price if missing (for compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN price decimal(10, 2) NOT NULL DEFAULT 0;
  END IF;

  -- Add subtotal if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal decimal(10, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Verify the changes
SELECT 'orders table columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

SELECT 'order_items table columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;
