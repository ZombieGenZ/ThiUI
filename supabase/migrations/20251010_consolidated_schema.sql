/*
  # SCHEMA TỔNG HỢP: Furniture Store Database Schema (20251010)

  ## Mục đích
  File này hợp nhất tất cả các file migration đã tạo trước đó thành một script SQL duy nhất,
  đảm bảo tính toàn vẹn, chức năng, và bao gồm tất cả các bản sửa lỗi và dữ liệu mẫu.

  ## Các tính năng chính được hợp nhất
  1.  Các bảng cốt lõi: profiles, categories, products, product_variants, addresses.
  2.  Hệ thống đặt hàng: orders, order_items, hàm generate_order_number().
  3.  Chức năng người dùng: favorites, cart_items, reviews.
  4.  Hệ thống khuyến mãi: vouchers, voucher_usage.
  5.  Chức năng khác: contact_messages, room_inspirations.
  6.  Tất cả các cột sửa lỗi (ví dụ: total_amount, shipping_cost, contact_info, shipping_address).
  7.  Tất cả RLS Policies, Constraints, và Indexes.
  8.  Dữ liệu mẫu cho vouchers và products.
*/

-- ============================================================================
-- 0. HÀM HỖ TRỢ
-- ============================================================================

-- Hàm tạo số đơn hàng duy nhất (ORD-YYYYMMDD-XXXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
  counter integer := 0;
BEGIN
  LOOP
    -- Generate order number: ORD-YYYYMMDD-XXXXX (5 ký tự ngẫu nhiên)
    new_order_number := 'ORD-' ||
                        to_char(now(), 'YYYYMMDD') || '-' ||
                        upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));

    -- Kiểm tra tính duy nhất
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      RETURN new_order_number;
    END IF;

    -- Kiểm tra an toàn để tránh vòng lặp vô hạn
    counter := counter + 1;
    IF counter > 100 THEN
      -- Fallback về UUID nếu không thể tạo số duy nhất sau 100 lần thử
      RETURN 'ORD-' || upper(substring(gen_random_uuid()::text from 1 for 13));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PROFILES TABLE (Thông tin người dùng mở rộng)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  avatar_url text DEFAULT '',
  loyalty_points integer DEFAULT 0,
  loyalty_tier text DEFAULT 'Silver' CHECK (loyalty_tier IN ('Silver', 'Gold', 'Platinum')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

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

-- ============================================================================
-- 2. CATEGORIES TABLE (Danh mục sản phẩm)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 3. PRODUCTS TABLE (Sản phẩm chính)
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  style text,
  room_type text,
  materials text[],
  dimensions jsonb,
  weight decimal(8,2),
  sku text UNIQUE NOT NULL,
  stock_quantity integer DEFAULT 0,
  images text[] DEFAULT ARRAY[]::text[],
  video_url text,
  model_3d_url text,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (status = 'active' OR status = 'out_of_stock');

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS model_3d_url text;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ============================================================================
-- 4. PRODUCT VARIANTS TABLE (Biến thể sản phẩm - nếu có)
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_type text NOT NULL,
  variant_value text NOT NULL,
  price_adjustment decimal(10,2) DEFAULT 0,
  sku text UNIQUE NOT NULL,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 5. ADDRESSES TABLE (Địa chỉ người dùng)
-- ============================================================================

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'Vietnam',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================================
-- 6. VOUCHERS TABLE (Mã giảm giá)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_purchase decimal(10,2) DEFAULT 0,
  max_discount decimal(10,2),
  usage_limit integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  applicable_categories uuid[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON vouchers(is_active);

DROP POLICY IF EXISTS "Anyone can view active vouchers" ON vouchers;

CREATE POLICY "Anyone can view active vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- ============================================================================
-- 7. ORDERS TABLE (Đơn hàng)
-- Sử dụng total_amount/shipping_cost và DEFAULT 0 cho các cột NOT NULL
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL DEFAULT generate_order_number(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  
  -- Các cột tiền tệ (Đã thêm NOT NULL DEFAULT 0 để fix lỗi)
  subtotal decimal(10, 2) NOT NULL DEFAULT 0, -- Tổng giá trị sản phẩm trước phí/thuế/giảm giá
  shipping_cost decimal(10, 2) NOT NULL DEFAULT 0, -- Phí vận chuyển
  tax decimal(10, 2) NOT NULL DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0, -- Tổng giảm giá từ các nguồn
  total_amount decimal(10, 2) NOT NULL DEFAULT 0, -- TỔNG CUỐI CÙNG (fix lỗi null constraint)
  
  -- Thông tin chiết khấu voucher
  voucher_id uuid REFERENCES vouchers(id),
  voucher_discount decimal(10, 2) DEFAULT 0,

  -- Thông tin giao hàng/thanh toán
  shipping_address_id uuid REFERENCES addresses(id), -- Tham chiếu đến bảng addresses (tùy chọn)
  shipping_address jsonb DEFAULT '{}', -- Địa chỉ nhúng (tùy chọn, cho khách vãng lai)
  contact_info jsonb DEFAULT '{}', -- Thông tin liên hệ nhúng
  payment_method text NOT NULL DEFAULT 'credit-card',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_date date,
  assembly_service boolean DEFAULT false,
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

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

-- ============================================================================
-- 8. ORDER ITEMS TABLE (Chi tiết đơn hàng)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL, -- Variant ID (tùy chọn)
  quantity integer NOT NULL DEFAULT 1,
  
  unit_price decimal(10, 2) NOT NULL DEFAULT 0, -- Giá gốc/cơ sở tại thời điểm mua
  price decimal(10, 2) NOT NULL DEFAULT 0, -- Giá sau chiết khấu (nếu có)
  subtotal decimal(10, 2) NOT NULL DEFAULT 0, -- total = price * quantity
  
  dimensions text,
  material text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

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

-- ============================================================================
-- 9. VOUCHER USAGE TABLE (Lịch sử sử dụng Voucher)
-- ============================================================================

CREATE TABLE IF NOT EXISTS voucher_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount decimal(10, 2) NOT NULL DEFAULT 0,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_id ON voucher_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order_id ON voucher_usage(order_id);

-- Policies
DROP POLICY IF EXISTS "Users can view their voucher usage" ON voucher_usage;
DROP POLICY IF EXISTS "Users can create voucher usage" ON voucher_usage;

CREATE POLICY "Users can view their voucher usage"
  ON voucher_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create voucher usage"
  ON voucher_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. FAVORITES TABLE (Sản phẩm yêu thích)
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

-- Policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 11. CART ITEMS TABLE (Giỏ hàng)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id) -- Giả định mỗi sản phẩm/variant chỉ có 1 dòng trong giỏ hàng
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- Policies
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 12. REVIEWS TABLE (Đánh giá sản phẩm)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text NOT NULL,
  images text[] DEFAULT ARRAY[]::text[],
  is_verified_purchase boolean DEFAULT true,
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);

-- Policies
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. ROOM INSPIRATIONS TABLE (Ảnh phòng mẫu)
-- ============================================================================

CREATE TABLE IF NOT EXISTS room_inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  style_tags text[],
  room_type text,
  product_ids uuid[],
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE room_inspirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room inspirations are viewable by everyone"
  ON room_inspirations FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 14. CONTACT MESSAGES TABLE (Liên hệ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Policies
DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Anonymous users can insert messages" ON contact_messages;

CREATE POLICY "Users can view own messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert messages"
  ON contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert messages"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);


-- ============================================================================
-- 15. INSERT DỮ LIỆU MẪU
-- ============================================================================

-- INSERT CATEGORIES
INSERT INTO categories (name, slug, description, display_order)
VALUES
  ('Living Room', 'living-room', 'Furniture for your living room', 1),
  ('Bedroom', 'bedroom', 'Furniture for your bedroom', 2),
  ('Dining', 'dining', 'Dining furniture and accessories', 3),
  ('Office', 'office', 'Home office furniture', 4),
  ('Outdoor', 'outdoor', 'Outdoor and patio furniture', 5)
ON CONFLICT (slug) DO NOTHING;

-- INSERT VOUCHERS
INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, max_discount, valid_until, is_active, description)
VALUES
  ('WELCOME10', 'percentage', 10, 100, 50, now() + interval '90 days', true, 'Welcome discount for new customers'),
  ('SAVE20', 'fixed', 20, 50, NULL, now() + interval '60 days', true, 'Save $20 on your order'),
  ('FURNITURE25', 'percentage', 25, 500, 200, now() + interval '30 days', true, '25% off furniture items'),
  ('FREESHIP', 'fixed', 50, 200, NULL, now() + interval '120 days', true, 'Free shipping on orders over $200'),
  ('MEGA50', 'fixed', 50, 300, NULL, now() + interval '45 days', true, 'Mega sale - $50 off')
ON CONFLICT (code) DO NOTHING;

-- UPDATE PRODUCTS WITH CATEGORY_ID (Connect products to categories)
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.room_type = c.name;

-- INSERT PRODUCTS (Đã gộp từ 20251008110000_add_more_products.sql và các file khác)
INSERT INTO products (name, slug, description, base_price, sale_price, images, rating, review_count, is_new, room_type, dimensions, materials, weight, sku, stock_quantity, style) VALUES
('Modern Velvet Sectional Sofa', 'modern-velvet-sectional-sofa', 'Luxurious L-shaped sectional with premium velvet upholstery and reversible chaise. Perfect for contemporary living spaces.', 2499.99, 1999.99, ARRAY[
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.7, 89, true, 'Living Room', '{"width": "280cm", "height": "85cm", "depth": "180cm"}', ARRAY['Velvet', 'Hardwood Frame', 'High-Density Foam'], 95, 'LR-SEC-001', 15, 'Modern'),

('Industrial Coffee Table Set', 'industrial-coffee-table-set', 'Rustic coffee table with solid wood top and metal frame. Includes matching side table for complete living room setup.', 599.99, 449.99, ARRAY[
  'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg',
  'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg'
], 4.5, 124, false, 'Living Room', '{"width": "120cm", "height": "45cm", "depth": "70cm"}', ARRAY['Reclaimed Wood', 'Metal'], 35, 'LR-COF-002', 28, 'Industrial'),

('Minimalist TV Stand', 'minimalist-tv-stand', 'Clean-lined entertainment center with cable management system and spacious storage compartments.', 799.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg'
], 4.6, 67, true, 'Living Room', '{"width": "180cm", "height": "55cm", "depth": "45cm"}', ARRAY['Oak Wood', 'Tempered Glass'], 45, 'LR-TV-003', 22, 'Minimalist'),

('Scandinavian Accent Chair', 'scandinavian-accent-chair', 'Mid-century inspired lounge chair with comfortable cushioning and elegant wooden legs.', 449.99, 349.99, ARRAY[
  'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
  'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg'
], 4.8, 156, false, 'Living Room', '{"width": "75cm", "height": "82cm", "depth": "80cm"}', ARRAY['Fabric', 'Beech Wood'], 18, 'LR-CHR-004', 35, 'Scandinavian'),

('King Size Platform Bed', 'king-size-platform-bed', 'Contemporary platform bed with upholstered headboard and built-in LED lighting. Includes storage drawers.', 1899.99, 1599.99, ARRAY[
  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
  'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg'
], 4.9, 203, true, 'Bedroom', '{"width": "200cm", "height": "120cm", "depth": "220cm"}', ARRAY['Upholstered Fabric', 'Solid Wood', 'LED Lights'], 120, 'BR-BED-001', 12, 'Contemporary'),

('Rustic Wooden Dresser', 'rustic-wooden-dresser', 'Six-drawer dresser with antique brass handles and natural wood finish. Perfect for farmhouse style bedrooms.', 1299.99, 999.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg'
], 4.6, 98, false, 'Bedroom', '{"width": "150cm", "height": "95cm", "depth": "50cm"}', ARRAY['Solid Pine', 'Brass Hardware'], 75, 'BR-DRS-002', 18, 'Rustic'),

('Modern Nightstand Pair', 'modern-nightstand-pair', 'Set of two matching nightstands with soft-close drawers and wireless charging pad on top.', 499.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.7, 145, true, 'Bedroom', '{"width": "50cm", "height": "55cm", "depth": "40cm"}', ARRAY['Walnut Veneer', 'Metal'], 15, 'BR-NTS-003', 30, 'Modern'),

('Extendable Dining Table', 'extendable-dining-table', 'Elegant dining table that extends from 6 to 10 seats. Features solid oak construction with natural finish.', 1799.99, 1499.99, ARRAY[
  'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.9, 167, false, 'Dining', '{"width": "180-280cm", "height": "76cm", "depth": "100cm"}', ARRAY['Solid Oak', 'Metal Extension Mechanism'], 85, 'DN-TBL-001', 14, 'Traditional'),

('Upholstered Dining Chairs Set', 'upholstered-dining-chairs-set', 'Set of 4 comfortable dining chairs with padded seats and elegant curved backs. Neutral fabric complements any decor.', 899.99, 699.99, ARRAY[
  'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
  'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg'
], 4.6, 132, true, 'Dining', '{"width": "48cm", "height": "95cm", "depth": "55cm"}', ARRAY['Linen Fabric', 'Rubberwood'], 12, 'DN-CHR-002', 25, 'Contemporary'),

('Executive L-Shaped Desk', 'executive-l-shaped-desk', 'Spacious corner desk with cable management, keyboard tray, and file cabinet. Ideal for home office productivity.', 1299.99, 999.99, ARRAY[
  'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.7, 189, false, 'Office', '{"width": "180cm", "height": "75cm", "depth": "140cm"}', ARRAY['Engineered Wood', 'Metal Frame'], 65, 'OF-DSK-001', 20, 'Executive'),

('Ergonomic Office Chair', 'ergonomic-office-chair', 'Premium mesh back chair with lumbar support, adjustable armrests, and headrest. Built for all-day comfort.', 699.99, 549.99, ARRAY[
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.9, 312, true, 'Office', '{"width": "65cm", "height": "120cm", "depth": "65cm"}', ARRAY['Breathable Mesh', 'Steel Frame', 'PU Leather'], 22, 'OF-CHR-002', 35, 'Ergonomic'),

('Rattan Patio Dining Set', 'rattan-patio-dining-set', 'Weather-resistant 6-piece outdoor dining set with glass top table and comfortable cushioned chairs.', 1899.99, 1599.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.7, 134, false, 'Outdoor', '{"width": "150cm", "height": "75cm", "depth": "90cm"}', ARRAY['PE Rattan', 'Aluminum Frame', 'Tempered Glass'], 55, 'OD-SET-001', 16, 'Contemporary'),

('Teak Lounger with Cushion', 'teak-lounger-with-cushion', 'Premium outdoor chaise lounge with adjustable backrest and weather-resistant cushion. Perfect for poolside relaxation.', 799.99, 649.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.8, 98, true, 'Outdoor', '{"width": "200cm", "height": "35cm", "depth": "70cm"}', ARRAY['Teak Wood', 'Sunbrella Fabric'], 25, 'OD-LNG-002', 22, 'Tropical'),

('Luxury Walk-In Wardrobe', 'luxury-walk-in-wardrobe', 'Spacious modular wardrobe system with sliding mirrored doors and customizable interior organization.', 3499.99, 2999.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg'
], 4.8, 87, true, 'Bedroom', '{"width": "300cm", "height": "240cm", "depth": "65cm"}', ARRAY['Mirrored Glass', 'Laminated Board', 'Aluminum Frame'], 180, 'BR-WRD-004', 8, 'Luxury'),

('Industrial Bar Stool Set', 'industrial-bar-stool-set', 'Set of 2 adjustable height bar stools with footrest and swivel seat. Perfect for kitchen islands or home bars.', 399.99, 299.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg'
], 4.5, 98, false, 'Dining', '{"width": "40cm", "height": "75-95cm", "depth": "40cm"}', ARRAY['Metal Frame', 'Faux Leather'], 8, 'DN-STL-003', 40, 'Industrial'),

('Marble Top Dining Set', 'marble-top-dining-set', 'Luxurious 6-seater dining set with genuine marble tabletop and velvet upholstered chairs with gold accents.', 3299.99, null, ARRAY[
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
  'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg'
], 4.8, 76, true, 'Dining', '{"width": "200cm", "height": "76cm", "depth": "100cm"}', ARRAY['Marble', 'Velvet', 'Gold-Plated Metal'], 120, 'DN-SET-004', 6, 'Luxury'),

('Industrial Bookcase Unit', 'industrial-bookcase-unit', 'Five-tier open bookshelf with metal frame and wood shelves. Perfect for displaying books, plants, and decor.', 599.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg'
], 4.6, 143, false, 'Office', '{"width": "100cm", "height": "180cm", "depth": "35cm"}', ARRAY['Pine Wood', 'Metal'], 38, 'OF-BKC-003', 28, 'Industrial'),

('Modern Filing Cabinet', 'modern-filing-cabinet', 'Three-drawer lateral filing cabinet with lock. Sleek design fits under most desks for space-saving storage.', 399.99, 329.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'
], 4.5, 87, true, 'Office', '{"width": "50cm", "height": "65cm", "depth": "50cm"}', ARRAY['Steel', 'Powder Coating'], 28, 'OF-FIL-004', 32, 'Modern'),

('Large Ceramic Planter Set', 'large-ceramic-planter-set', 'Set of 3 decorative outdoor planters in graduated sizes. Frost-resistant ceramic with drainage holes.', 299.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.6, 167, false, 'Outdoor', '{"width": "30-50cm", "height": "35-60cm", "depth": "30-50cm"}', ARRAY['Glazed Ceramic'], 15, 'OD-PLT-003', 40, 'Modern'),

('Modular Outdoor Sectional', 'modular-outdoor-sectional', 'Versatile 5-piece sectional sofa set with weather-resistant cushions. Rearrange to fit any patio layout.', 2499.99, 1999.99, ARRAY[
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.9, 145, true, 'Outdoor', '{"width": "280cm", "height": "75cm", "depth": "180cm"}', ARRAY['All-Weather Wicker', 'Powder-Coated Aluminum', 'Olefin Fabric'], 85, 'OD-SEC-004', 10, 'Modern')
ON CONFLICT (slug) DO NOTHING;

-- Provide sample 3D models for selected hero products
UPDATE products
SET model_3d_url = 'https://modelviewer.dev/shared-assets/models/Chair.glb'
WHERE slug = 'scandinavian-accent-chair';

UPDATE products
SET model_3d_url = 'https://modelviewer.dev/shared-assets/models/Cube.gltf'
WHERE slug = 'modern-velvet-sectional-sofa';

-- ============================================================================
-- 16. DISABLE FOREIGN KEY CONSTRAINTS FOR SAMPLE DATA
-- ============================================================================

-- Tạm thời disable foreign key constraints để insert sample reviews
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_order_id_fkey;

-- Cho phép NULL cho sample data
ALTER TABLE reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN order_id DROP NOT NULL;

-- ============================================================================
-- 17. INSERT SAMPLE REVIEWS (15-30 per product)
-- ============================================================================

DO $$
DECLARE
  product_slug text;
  product_id uuid;
  sample_comments text[];
  sample_ratings integer[];
  i integer;
  num_reviews integer;
BEGIN
  -- Define sample data
  sample_comments := ARRAY[
    'Absolutely love this piece! The quality is outstanding and it fits perfectly in my living room.',
    'Great value for money. Very comfortable and looks exactly like the pictures.',
    'Delivery was smooth and the assembly was straightforward. Highly recommend!',
    'The fabric is luxurious and the color is even better in person.',
    'Comfortable seating, modern design. Perfect for entertaining guests.',
    'Very happy with this purchase. The quality exceeded my expectations.',
    'Beautiful furniture piece. Adds elegance to any room.',
    'Good quality but took longer to deliver than expected.',
    'Exactly what I was looking for. The craftsmanship is impressive.',
    'Sturdy and well-made. Worth every penny.',
    'Love the design and comfort. My family enjoys it every day.',
    'Premium quality materials. Looks great in my home.',
    'Easy to assemble and very comfortable. Great purchase!',
    'The attention to detail is remarkable. Highly satisfied.',
    'Perfect size and very comfortable. Would buy again.',
    'Elegant and functional. Matches my decor perfectly.',
    'Great addition to my home. Very pleased with the quality.',
    'Comfortable and stylish. Gets lots of compliments.',
    'Excellent craftsmanship. Built to last.',
    'Very comfortable for daily use. Love it!',
    'Beautiful piece of furniture. Exactly as described.',
    'High quality and great design. Totally worth it.',
    'Impressed with the build quality. Very satisfied.',
    'Perfect for my space. Comfortable and elegant.',
    'Great value. Looks and feels premium.',
    'Wonderful addition to my home. Love the style.',
    'Very pleased with this purchase. Excellent quality.',
    'Comfortable, stylish, and well-made. Highly recommend.',
    'Beautiful design and great comfort. Perfect choice.',
    'Outstanding quality. Exceeds expectations in every way.'
  ];

  sample_ratings := ARRAY[5, 5, 4, 5, 4, 5, 5, 3, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 4, 5];

  -- Insert reviews for each product
  FOR product_slug IN
    SELECT slug FROM products LIMIT 20
  LOOP
    SELECT id INTO product_id FROM products WHERE slug = product_slug;
    
    -- Random number of reviews (15-25)
    num_reviews := 15 + floor(random() * 11)::integer;

    -- Create reviews for this product
    FOR i IN 1..LEAST(num_reviews, array_length(sample_comments, 1))
    LOOP
      INSERT INTO reviews (
        product_id, 
        user_id, 
        order_id, 
        rating, 
        comment, 
        is_verified_purchase, 
        status, 
        created_at
      )
      VALUES (
        product_id,
        NULL, -- NULL user_id for sample data
        NULL, -- NULL order_id for sample data
        sample_ratings[i],
        sample_comments[i],
        false, -- Not verified since no real user
        'approved',
        now() - (random() * interval '180 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;

    -- Update product rating and review_count
    UPDATE products p
    SET
      rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews r WHERE r.product_id = p.id),
      review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
    WHERE p.id = product_id;
  END LOOP;
END $$ LANGUAGE plpgsql;

-- ============================================================================
-- 18. RE-ENABLE FOREIGN KEY CONSTRAINTS (Optional - for production)
-- ============================================================================

-- Uncomment these if you want to restore constraints after sample data
-- Note: This will prevent adding more sample reviews without real users
/*
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN order_id SET NOT NULL;

ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
ALTER TABLE reviews ADD CONSTRAINT reviews_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
*/

-- ============================================================================
-- 19. UPDATE PRODUCTS - LINK TO CATEGORIES AND MARK AS FEATURED
-- ============================================================================

-- Link products to categories based on room_type
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.room_type = c.name
  AND p.category_id IS NULL;

-- Mark best sellers as featured
UPDATE products
SET is_featured = true
WHERE id IN (
  SELECT id FROM products
  WHERE review_count > 0
  ORDER BY review_count DESC, rating DESC
  LIMIT 12
);

-- ============================================================================
-- 20. BLOG POSTS TABLE (Nội dung blog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

DROP POLICY IF EXISTS "Blog posts are readable by everyone" ON blog_posts;

CREATE POLICY "Blog posts are readable by everyone"
  ON blog_posts FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 21. BLOG COMMENTS TABLE (Bình luận bài viết)
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

DROP POLICY IF EXISTS "Approved comments are visible" ON comments;
DROP POLICY IF EXISTS "Public can insert comments" ON comments;

CREATE POLICY "Approved comments are visible"
  ON comments FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Public can insert comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================================================
-- 22. SEED SAMPLE BLOG DATA
-- ============================================================================

INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image_url, author, published_at, created_at, updated_at)
VALUES
  (
    'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    '5 Interior Design Trends Defining Modern Living in 2024',
    '5-interior-design-trends-2024',
    'Discover the leading interior trends of 2024 to refresh your home with minimalist, sustainable, and highly curated touches.',
    E'## Minimalism with warmth
The minimalist look remains popular for the calm and clarity it brings. Work with a neutral palette and layer natural textures to keep the space welcoming.

## Planet-friendly materials
Sustainability is now a priority. Reclaimed woods, FSC-certified timber, and organic fabrics are top picks that balance style with responsibility.

## Smart technology at home
Connected lighting, automated shades, and multifunctional furnishings create a seamless living experience. Integrate smart features where they make daily routines easier.

## Personalized styling
Display art, handmade pieces, and meaningful keepsakes to give every room character. A few personal accents instantly make a space feel one-of-a-kind.

## Indoor greenery
Plants continue to shine as natural mood boosters. Cluster mini planters or hang cascading greenery to purify the air and energize the room.',
    'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'Thi Interior Studio',
    '2024-03-18T08:00:00Z',
    '2024-03-18T08:00:00Z',
    '2024-03-18T08:00:00Z'
  ),
  (
    'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    'How to Choose the Right Sofa for Every Living Room Size',
    'how-to-choose-the-right-sofa',
    'The sofa is the heart of the living room. Learn how to pick the ideal dimensions, materials, and colors for your space.',
    E'## Measure with intention
Before you shop, map out the room and note doorways, walkways, and other furniture placements to confirm the sofa will fit comfortably.

## Match the shape to your lifestyle
If you host often, consider an L-shaped sectional or sleeper sofa. For compact apartments, a two-seater paired with an ottoman keeps things flexible.

## Focus on fabric and color
Performance linen and cotton blend well with modern styles, while leather introduces polish. Stick with timeless neutrals and layer in colorful pillows for personality.

## Coordinate with the rest of the room
Balance the sofa with the coffee table, media console, and lighting. Finish the look with an area rug or wall art that ties the palette together.',
    'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'Thi Interior Studio',
    '2024-03-12T08:00:00Z',
    '2024-03-12T08:00:00Z',
    '2024-03-12T08:00:00Z'
  ),
  (
    'bb20612b-71f0-4a77-91c8-fd0566f6cb99',
    'Design a Home Office That Boosts Productivity and Creativity',
    'design-a-productive-home-office',
    'A thoughtful workspace keeps you focused and inspired. Explore layout, lighting, and styling ideas from the ZShop team.',
    E'## Embrace natural light
Position your desk near a window to soak up daylight and stay energized. Layer sheer curtains or blinds so you can control glare during video calls.

## Invest in ergonomic furniture
Choose a chair with proper lumbar support and a height-adjustable seat. A spacious desktop keeps monitors, keyboards, and notebooks organized.

## Keep clutter in check
Edit your work surface regularly and rely on trays, shelves, or wall-mounted organizers to store paperwork. A tidy setup makes it easier to focus.

## Add inspiring accents
Greenery, sculptural lamps, or framed prints introduce texture and creativity. Rotate a few accessories seasonally to keep the space feeling fresh.',
    'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'Thi Interior Studio',
    '2024-03-05T08:00:00Z',
    '2024-03-05T08:00:00Z',
    '2024-03-05T08:00:00Z'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image_url = EXCLUDED.featured_image_url,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  updated_at = EXCLUDED.updated_at;

INSERT INTO comments (id, post_id, name, email, content, is_approved, created_at)
VALUES
  (
    '74f6b8f4-2573-4f71-9d6b-6f1c52a6f4b9',
    'bb20612b-71f0-4a77-91c8-fd0566f6cb99',
    'Minh Anh',
    'minhanh@example.com',
    'This workspace is gorgeous! I'm adding greenery and a new desk lamp this week.',
    true,
    '2024-03-06T09:15:00Z'
  ),
  (
    '5a3c1b20-79c9-4a8e-9dbf-2f1af7a5c1f2',
    'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    'Hoang Nam',
    'namhoang@example.com',
    'This article is incredibly helpful. I especially appreciate the section on sustainable materials as my family embraces a greener lifestyle.',
    true,
    '2024-03-18T10:45:00Z'
  ),
  (
    'c41fa61c-7b6a-4e72-8e12-4c0b5df20d35',
    'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    'Thao Linh',
    'thaolinh@example.com',
    'Thanks to this guide I finally know how to pick a sofa that fits my small apartment. Appreciate you, ZShop!',
    true,
    '2024-03-13T15:20:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  post_id = EXCLUDED.post_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  content = EXCLUDED.content,
  is_approved = EXCLUDED.is_approved,
  created_at = EXCLUDED.created_at;

-- 13. Seed products for design inspiration looks
INSERT INTO products (
  name,
  slug,
  description,
  base_price,
  sale_price,
  room_type,
  style,
  materials,
  dimensions,
  weight,
  sku,
  stock_quantity,
  images,
  rating,
  review_count,
  is_new,
  status
)
VALUES
  (
    'Harper Sectional Sofa',
    'harper-sectional-sofa',
    'A low-profile modular sectional with deep cushions and performance linen upholstery for family-friendly comfort.',
    2150.00,
    NULL,
    'Living Room',
    'Modern',
    ARRAY['Performance linen', 'Kiln-dried hardwood', 'Feather-wrapped foam'],
    '{"length": "112 in", "depth": "68 in", "height": "34 in"}'::jsonb,
    165,
    'LR-HAR-SEC-001',
    12,
    ARRAY['https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    142,
    true,
    'active'
  ),
  (
    'Marble Orbit Coffee Table',
    'marble-orbit-coffee-table',
    'Round marble coffee table with a sculptural metal base and a protective resin seal for everyday use.',
    780.00,
    NULL,
    'Living Room',
    'Modern',
    ARRAY['Carrara marble', 'Brushed brass'],
    '{"diameter": "42 in", "height": "15 in"}'::jsonb,
    95,
    'LR-MAR-COF-002',
    20,
    ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    88,
    false,
    'active'
  ),
  (
    'Atlas Arc Floor Lamp',
    'atlas-arc-floor-lamp',
    'Sleek arched floor lamp with a weighted base and adjustable shade to spotlight seating areas.',
    390.00,
    NULL,
    'Living Room',
    'Modern',
    ARRAY['Powder-coated steel', 'Linen shade'],
    '{"height": "78 in", "reach": "48 in"}'::jsonb,
    32,
    'LR-ATL-LMP-003',
    30,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    67,
    false,
    'active'
  ),
  (
    'Tonal Wool Rug 8x10',
    'tonal-wool-rug-8x10',
    'Hand-loomed wool rug in layered neutral tones to anchor modern seating arrangements.',
    960.00,
    NULL,
    'Living Room',
    'Modern',
    ARRAY['New Zealand wool', 'Cotton backing'],
    '{"width": "96 in", "length": "120 in", "pile": "0.6 in"}'::jsonb,
    45,
    'LR-TON-RUG-004',
    25,
    ARRAY['https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    53,
    true,
    'active'
  ),
  (
    'Nordic Oak Platform Bed (Queen)',
    'nordic-oak-platform-bed',
    'Solid oak platform bed with rounded corners and a slatted base for breathable support.',
    1290.00,
    NULL,
    'Bedroom',
    'Scandinavian',
    ARRAY['Solid oak', 'Baltic birch slats'],
    '{"width": "64 in", "length": "86 in", "height": "14 in", "headboard_height": "40 in"}'::jsonb,
    120,
    'BR-NOR-BED-001',
    18,
    ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.9,
    210,
    true,
    'active'
  ),
  (
    'Linen Bedding Set',
    'linen-bedding-set',
    'Four-piece garment-washed linen bedding bundle with breathable temperature regulation.',
    360.00,
    NULL,
    'Bedroom',
    'Scandinavian',
    ARRAY['European flax linen'],
    '{"size": "Queen", "pieces": "Duvet cover + 2 shams + sheet"}'::jsonb,
    12,
    'BR-LIN-BED-002',
    60,
    ARRAY['https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    95,
    false,
    'active'
  ),
  (
    'Haze Glass Nightstands (Set of 2)',
    'haze-glass-nightstands-set-of-2',
    'Pair of smoked glass nightstands with concealed storage shelves and soft-close doors.',
    540.00,
    NULL,
    'Bedroom',
    'Scandinavian',
    ARRAY['Tempered glass', 'Brass hardware'],
    '{"width": "20 in", "depth": "18 in", "height": "24 in"}'::jsonb,
    64,
    'BR-HAZ-NT-003',
    22,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    74,
    false,
    'active'
  ),
  (
    'Softloom Area Rug',
    'softloom-area-rug',
    'Plush looped rug with subtle geometric patterning to soften bedroom floors.',
    350.00,
    NULL,
    'Bedroom',
    'Scandinavian',
    ARRAY['Wool blend', 'Cotton backing'],
    '{"width": "84 in", "length": "108 in"}'::jsonb,
    38,
    'BR-SOF-RUG-004',
    28,
    ARRAY['https://images.pexels.com/photos/6585612/pexels-photo-6585612.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    58,
    true,
    'active'
  ),
  (
    'Forge Live-Edge Dining Table',
    'forge-live-edge-dining-table',
    'Statement dining table crafted from live-edge acacia wood with a raw steel base.',
    2150.00,
    NULL,
    'Dining',
    'Industrial',
    ARRAY['Acacia wood', 'Powder-coated steel'],
    '{"length": "96 in", "width": "40 in", "height": "30 in"}'::jsonb,
    210,
    'DN-FOR-TBL-001',
    10,
    ARRAY['https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.9,
    132,
    false,
    'active'
  ),
  (
    'Set of 6 Rivet Leather Chairs',
    'rivet-leather-dining-chairs-set-of-6',
    'Six industrial-inspired leather dining chairs with welded steel frames and stitched cushioning.',
    1140.00,
    NULL,
    'Dining',
    'Industrial',
    ARRAY['Top-grain leather', 'Steel frame'],
    '{"width": "19 in", "depth": "22 in", "height": "34 in", "seat_height": "18 in"}'::jsonb,
    132,
    'DN-RIV-CHR-002',
    18,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    91,
    true,
    'active'
  ),
  (
    'Copper Cascade Chandelier',
    'copper-cascade-chandelier',
    'Multi-tier chandelier with hand-brushed copper shades for dramatic dining room lighting.',
    490.00,
    NULL,
    'Dining',
    'Industrial',
    ARRAY['Copper', 'Fabric cord'],
    '{"diameter": "30 in", "height": "26 in"}'::jsonb,
    22,
    'DN-COP-CH-003',
    35,
    ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.5,
    64,
    false,
    'active'
  ),
  (
    'Walnut Executive Desk',
    'walnut-executive-desk',
    'L-shaped walnut veneer desk with integrated cable routing and soft-close storage drawers.',
    1450.00,
    NULL,
    'Office',
    'Modern',
    ARRAY['Walnut veneer', 'Powder-coated steel'],
    '{"width": "72 in", "depth": "60 in", "height": "30 in"}'::jsonb,
    180,
    'OF-WAL-DSK-001',
    14,
    ARRAY['https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    118,
    true,
    'active'
  ),
  (
    'ErgoFlex Leather Chair',
    'ergoflex-leather-chair',
    'Ergonomic task chair with breathable leather, lumbar support, and fully adjustable arms.',
    620.00,
    NULL,
    'Office',
    'Modern',
    ARRAY['Aniline leather', 'Aluminum base', 'Memory foam'],
    '{"width": "27 in", "depth": "27 in", "height": "48 in"}'::jsonb,
    52,
    'OF-ERG-CHR-002',
    30,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.9,
    256,
    false,
    'active'
  ),
  (
    'Modular Wall Storage',
    'modular-wall-storage',
    'Configurable wall-mounted storage system with open shelving and concealed cabinets for home offices.',
    890.00,
    NULL,
    'Office',
    'Modern',
    ARRAY['Engineered wood', 'Matte lacquer', 'Steel brackets'],
    '{"width": "96 in", "height": "84 in", "depth": "15 in"}'::jsonb,
    98,
    'OF-MOD-STO-003',
    16,
    ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    83,
    true,
    'active'
  ),
  (
    'Linear Task Lighting',
    'linear-task-lighting',
    'Slim LED task light with adjustable brightness and color temperature for focused work.',
    320.00,
    NULL,
    'Office',
    'Modern',
    ARRAY['Anodized aluminum', 'LED'],
    '{"length": "38 in", "height": "18 in"}'::jsonb,
    8,
    'OF-LIN-LGT-004',
    40,
    ARRAY['https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.5,
    45,
    false,
    'active'
  ),
  (
    'Convertible Sofa Bed',
    'convertible-sofa-bed',
    'Compact sofa that converts to a full-size bed with hidden storage for linens.',
    940.00,
    NULL,
    'Living Room',
    'Minimalist',
    ARRAY['Performance fabric', 'Solid pine frame'],
    '{"width": "84 in", "depth": "36 in", "height": "34 in"}'::jsonb,
    128,
    'LR-CON-SOF-005',
    26,
    ARRAY['https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    73,
    true,
    'active'
  ),
  (
    'Foldaway Dining Set',
    'foldaway-dining-set',
    'Wall-mounted foldable dining table with two upholstered stools that tuck away to save space.',
    520.00,
    NULL,
    'Dining',
    'Minimalist',
    ARRAY['Oak veneer', 'Steel', 'Performance fabric'],
    '{"table_width": "36 in", "table_depth": "20 in", "table_height": "30 in"}'::jsonb,
    60,
    'DN-FOL-SET-002',
    24,
    ARRAY['https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.5,
    52,
    false,
    'active'
  ),
  (
    'Wall-Mounted Shelving System',
    'wall-mounted-shelving-system',
    'Floating shelving solution with adjustable brackets to customize storage in tight spaces.',
    390.00,
    NULL,
    'Living Room',
    'Minimalist',
    ARRAY['Powder-coated steel', 'Oak veneer shelves'],
    '{"width": "72 in", "height": "78 in", "depth": "12 in"}'::jsonb,
    48,
    'LR-WAL-SHE-006',
    30,
    ARRAY['https://images.pexels.com/photos/209224/pexels-photo-209224.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.4,
    61,
    true,
    'active'
  ),
  (
    'Soft Glow Pendant',
    'soft-glow-pendant',
    'Frosted glass pendant with dimmable LED module ideal for intimate studio zones.',
    330.00,
    NULL,
    'Living Room',
    'Minimalist',
    ARRAY['Frosted glass', 'Brushed nickel'],
    '{"diameter": "18 in", "height": "12 in"}'::jsonb,
    12,
    'LR-SOF-PEN-007',
    35,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    44,
    false,
    'active'
  ),
  (
    'Driftwood Outdoor Sofa',
    'driftwood-outdoor-sofa',
    'All-weather outdoor sofa with teak-inspired frame and quick-dry cushions for coastal patios.',
    1980.00,
    NULL,
    'Outdoor',
    'Boho',
    ARRAY['Powder-coated aluminum', 'Olefin upholstery'],
    '{"width": "88 in", "depth": "34 in", "height": "32 in"}'::jsonb,
    120,
    'OD-DRI-SOF-001',
    12,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    102,
    true,
    'active'
  ),
  (
    'All-Weather Lounge Chairs (Set of 2)',
    'all-weather-lounge-chairs-set-of-2',
    'Pair of reclining outdoor lounge chairs with UV-resistant wicker and water-repellent cushions.',
    1080.00,
    NULL,
    'Outdoor',
    'Boho',
    ARRAY['Resin wicker', 'Aluminum frame', 'Polyester cushions'],
    '{"width": "30 in", "depth": "58 in", "height": "34 in"}'::jsonb,
    86,
    'OD-ALL-LNG-002',
    18,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    78,
    false,
    'active'
  ),
  (
    'Braided Outdoor Rug',
    'braided-outdoor-rug',
    'Weather-resistant flatweave rug with braided edges to ground outdoor seating zones.',
    420.00,
    NULL,
    'Outdoor',
    'Boho',
    ARRAY['Recycled polypropylene'],
    '{"width": "96 in", "length": "120 in"}'::jsonb,
    24,
    'OD-BRA-RUG-003',
    34,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    59,
    false,
    'active'
  ),
  (
    'Rattan Lantern Trio',
    'rattan-lantern-trio',
    'Set of three handwoven lanterns with glass inserts for layered outdoor lighting.',
    340.00,
    NULL,
    'Outdoor',
    'Boho',
    ARRAY['Natural rattan', 'Glass'],
    '{"heights": "12 in / 16 in / 20 in"}'::jsonb,
    18,
    'OD-RAT-LAN-004',
    40,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.5,
    48,
    true,
    'active'
  ),
  (
    'Acacia Coffee Table',
    'acacia-coffee-table',
    'Outdoor coffee table crafted from solid acacia with a slatted top for quick drying.',
    500.00,
    NULL,
    'Outdoor',
    'Boho',
    ARRAY['Solid acacia wood'],
    '{"diameter": "38 in", "height": "16 in"}'::jsonb,
    55,
    'OD-ACA-COF-005',
    22,
    ARRAY['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    41,
    false,
    'active'
  ),
  (
    'Alpine Modular Sofa',
    'alpine-modular-sofa',
    'Oversized modular sofa with deep chenille cushions and reversible corner pieces for chalet-inspired lounging.',
    2480.00,
    NULL,
    'Living Room',
    'Seasonal',
    ARRAY['Chenille upholstery', 'Solid birch frame', 'Feather blend cushions'],
    '{"width": "120 in", "depth": "68 in", "height": "34 in"}'::jsonb,
    220,
    'LR-ALP-SOF-008',
    10,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.9,
    98,
    true,
    'active'
  ),
  (
    'Stone Hearth Console',
    'stone-hearth-console',
    'Console table with a faux-stone finish and integrated media storage for lodge-inspired living rooms.',
    1120.00,
    NULL,
    'Living Room',
    'Seasonal',
    ARRAY['Engineered wood', 'Stone composite veneer'],
    '{"width": "72 in", "depth": "18 in", "height": "30 in"}'::jsonb,
    140,
    'LR-STO-CON-009',
    16,
    ARRAY['https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.6,
    54,
    false,
    'active'
  ),
  (
    'Chunky Wool Throws',
    'chunky-wool-throws',
    'Set of two oversized merino wool throws with hand-knotted tassels for layered winter texture.',
    420.00,
    NULL,
    'Living Room',
    'Seasonal',
    ARRAY['Merino wool'],
    '{"size": "50 in x 70 in"}'::jsonb,
    10,
    'LR-CHU-THR-010',
    40,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.8,
    63,
    true,
    'active'
  ),
  (
    'Antler Inspired Chandelier',
    'antler-inspired-chandelier',
    'Rustic chandelier crafted from resin antlers with warm LED bulbs for a cabin-worthy glow.',
    1620.00,
    NULL,
    'Living Room',
    'Seasonal',
    ARRAY['Resin', 'LED'],
    '{"diameter": "36 in", "height": "28 in"}'::jsonb,
    44,
    'LR-ANT-CH-011',
    18,
    ARRAY['https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'],
    4.7,
    49,
    false,
    'active'
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  room_type = EXCLUDED.room_type,
  style = EXCLUDED.style,
  materials = EXCLUDED.materials,
  dimensions = EXCLUDED.dimensions,
  weight = EXCLUDED.weight,
  sku = EXCLUDED.sku,
  stock_quantity = EXCLUDED.stock_quantity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_new = EXCLUDED.is_new,
  status = EXCLUDED.status;
