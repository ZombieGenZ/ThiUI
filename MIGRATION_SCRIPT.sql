-- CRITICAL: Run this SQL script manually in your Supabase SQL Editor
-- This script fixes the schema and adds new tables for reviews and contacts

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 2. Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- 4. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.order_id = reviews.order_id
      AND oi.product_id = reviews.product_id
      AND o.user_id = auth.uid()
      AND o.status = 'completed'
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Policies for contact_messages
CREATE POLICY "Users can view own messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating = COALESCE((
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ), 0),
    review_count = COALESCE((
      SELECT COUNT(*)::integer
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ), 0)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to auto-update ratings
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();