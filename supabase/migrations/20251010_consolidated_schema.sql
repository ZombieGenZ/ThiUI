/*
  # SCHEMA TỔNG HỢP: Furniture Store Database Schema (20251010_fixed)

  ## Mục đích
  File này hợp nhất tất cả các file migration đã tạo trước đó thành một script SQL duy nhất,
  đảm bảo tính toàn vẹn, chức năng, và bao gồm tất cả các bản sửa lỗi và dữ liệu mẫu.

  ## Các tính năng chính
  1.  Các bảng cốt lõi: profiles, categories, products, product_variants, addresses.
  2.  Hệ thống đặt hàng: orders, order_items, hàm generate_order_number().
  3.  Chức năng người dùng: favorites, cart_items, reviews.
  4.  Hệ thống khuyến mãi: vouchers, voucher_usage.
  5.  Chức năng khác: contact_messages, room_inspirations, blog_posts, comments.
  6.  Tất cả RLS Policies, Constraints, và Indexes.
  7.  Dữ liệu mẫu cho vouchers và products.

  ## FIX LỖI 20251010
  - Đã sửa lỗi "column reference "slug" is ambiguous" trong khối DO $product_catalog$ bằng cách
    đổi tên biến PL/pgSQL 'slug' thành 'product_slug'.
*/

-- ============================================================================
-- 0. HÀM HỖ TRỢ
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
  counter integer := 0;
BEGIN
  LOOP
    new_order_number := 'ORD-' ||
                        to_char(now(), 'YYYYMMDD') || '-' ||
                        upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));

    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      RETURN new_order_number;
    END IF;

    counter := counter + 1;
    IF counter > 100 THEN
      RETURN 'ORD-' || upper(substring(gen_random_uuid()::text from 1 for 13));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PROFILES TABLE
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
-- 2. CATEGORIES TABLE
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
-- 3. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ============================================================================
-- 4. PRODUCT VARIANTS TABLE
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

DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON product_variants;

CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 5. ADDRESSES TABLE
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

DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

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
-- 6. VOUCHERS TABLE
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
-- 7. ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL DEFAULT generate_order_number(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),

  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  shipping_cost decimal(10, 2) NOT NULL DEFAULT 0,
  tax decimal(10, 2) NOT NULL DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0,
  total_amount decimal(10, 2) NOT NULL DEFAULT 0,

  voucher_id uuid REFERENCES vouchers(id),
  voucher_discount decimal(10, 2) DEFAULT 0,

  shipping_address_id uuid REFERENCES addresses(id),
  shipping_address jsonb DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  payment_method text NOT NULL DEFAULT 'credit-card',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_date date,
  assembly_service boolean DEFAULT false,
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

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
-- 8. ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,

  unit_price decimal(10, 2) NOT NULL DEFAULT 0,
  price decimal(10, 2) NOT NULL DEFAULT 0,
  subtotal decimal(10, 2) NOT NULL DEFAULT 0,

  dimensions text,
  material text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

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
-- 9. VOUCHER USAGE TABLE
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

CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_id ON voucher_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order_id ON voucher_usage(order_id);

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
-- 10. FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

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
-- 11. CART ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

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
-- 12. REVIEWS TABLE
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

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);

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
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = auth.uid()
        AND oi.product_id = product_id
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. ROOM INSPIRATIONS TABLE
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

DROP POLICY IF EXISTS "Room inspirations are viewable by everyone" ON room_inspirations;

CREATE POLICY "Room inspirations are viewable by everyone"
  ON room_inspirations FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 14. CONTACT MESSAGES TABLE
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

CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

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
-- 15. BLOG POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  excerpt_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
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
-- 16. BLOG COMMENTS TABLE
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
-- 17. INSERT SAMPLE DATA - CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description, display_order)
VALUES
  ('Living Room', 'living-room', 'Furniture for your living room', 1),
  ('Bedroom', 'bedroom', 'Furniture for your bedroom', 2),
  ('Dining', 'dining', 'Dining furniture and accessories', 3),
  ('Office', 'office', 'Home office furniture', 4),
  ('Outdoor', 'outdoor', 'Outdoor and patio furniture', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 18. INSERT SAMPLE DATA - VOUCHERS
-- ============================================================================

INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, max_discount, valid_until, is_active, description)
VALUES
  ('WELCOME10', 'percentage', 10, 100, 50, now() + interval '90 days', true, 'Welcome discount for new customers'),
  ('SAVE20', 'fixed', 20, 50, NULL, now() + interval '60 days', true, 'Save $20 on your order'),
  ('FURNITURE25', 'percentage', 25, 500, 200, now() + interval '30 days', true, '25% off furniture items'),
  ('FREESHIP', 'fixed', 50, 200, NULL, now() + interval '120 days', true, 'Free shipping on orders over $200'),
  ('MEGA50', 'fixed', 50, 300, NULL, now() + interval '45 days', true, 'Mega sale - $50 off')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 19. INSERT MULTI-LANGUAGE PRODUCT CATALOG
-- ============================================================================

DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;

DO $product_catalog$
DECLARE
  cat RECORD;
  product_index integer;
  cat_vi text;
  style_options text[] := ARRAY['Modern', 'Contemporary', 'Minimalist', 'Scandinavian', 'Industrial', 'Rustic', 'Transitional', 'Bohemian', 'Coastal', 'Luxury'];
  material_pool text[];
  image_pool text[];
  style_value text;
  style_value_vi text;
  english_name text;
  vietnamese_name text;
  english_description text;
  vietnamese_description text;
  product_slug text; -- RENAMED 'slug' to 'product_slug' to resolve ambiguity
  base_price numeric;
  sale_price numeric;
  stock integer;
  weight_val numeric;
  materials text[];
  width integer;
  depth integer;
  height integer;
  dimension_json jsonb;
  image_set text[];
  image_count integer;
  material_count integer;
  cat_price_factor numeric := 1.0;
BEGIN
  FOR cat IN SELECT id, slug, name FROM categories ORDER BY display_order LOOP
    CASE cat.slug
      WHEN 'living-room' THEN
        cat_vi := 'Phòng khách';
        material_pool := ARRAY['Solid oak', 'Walnut veneer', 'Performance linen', 'Full-grain leather', 'Powder-coated steel', 'Tempered glass', 'Rattan weave', 'Bouclé fabric'];
        image_pool := ARRAY[
          'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
          'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg',
          'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg',
          'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
          'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg'
        ];
        cat_price_factor := 1.18;
      WHEN 'bedroom' THEN
        cat_vi := 'Phòng ngủ';
        material_pool := ARRAY['Solid maple', 'Engineered wood', 'Soft linen', 'Chenille upholstery', 'Brushed brass', 'Handwoven cane', 'Natural rattan', 'Frosted glass'];
        image_pool := ARRAY[
          'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
          'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg',
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          'https://images.pexels.com/photos/6480707/pexels-photo-6480707.jpeg',
          'https://images.pexels.com/photos/8136912/pexels-photo-8136912.jpeg'
        ];
        cat_price_factor := 1.05;
      WHEN 'dining' THEN
        cat_vi := 'Phòng ăn';
        material_pool := ARRAY['Solid walnut', 'Marble composite', 'Upholstered leather', 'Steel base', 'Ceramic top', 'Oak veneer', 'Bouclé seat', 'Hand-forged iron'];
        image_pool := ARRAY[
          'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg',
          'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
          'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
          'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg',
          'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg'
        ];
        cat_price_factor := 1.08;
      WHEN 'office' THEN
        cat_vi := 'Văn phòng';
        material_pool := ARRAY['Powder-coated steel', 'Mesh backrest', 'High-density foam', 'Solid ash', 'Laminate surface', 'Aluminum detail', 'Vegan leather', 'Tempered glass'];
        image_pool := ARRAY[
          'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg',
          'https://images.pexels.com/photos/245232/pexels-photo-245232.jpeg',
          'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
          'https://images.pexels.com/photos/196655/pexels-photo-196655.jpeg',
          'https://images.pexels.com/photos/462235/pexels-photo-462235.jpeg'
        ];
        cat_price_factor := 0.95;
      WHEN 'outdoor' THEN
        cat_vi := 'Ngoài trời';
        material_pool := ARRAY['Solid teak', 'Weatherproof wicker', 'Outdoor acrylic', 'Galvanized steel', 'Powder-coated aluminum', 'Sunbrella fabric', 'Concrete composite', 'Sling weave'];
        image_pool := ARRAY[
          'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg',
          'https://images.pexels.com/photos/2909102/pexels-photo-2909102.jpeg',
          'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg',
          'https://images.pexels.com/photos/279643/pexels-photo-279643.jpeg',
          'https://images.pexels.com/photos/1833162/pexels-photo-1833162.jpeg'
        ];
        cat_price_factor := 1.02;
      ELSE
        cat_vi := cat.name;
        material_pool := ARRAY['Solid wood', 'Engineered veneer', 'Premium fabric'];
        image_pool := ARRAY['https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg'];
        cat_price_factor := 1.0;
    END CASE;

    image_count := array_length(image_pool, 1);
    material_count := array_length(material_pool, 1);

    FOR product_index IN 1..60 LOOP
      style_value := style_options[((product_index - 1) % array_length(style_options, 1)) + 1];
      SELECT CASE style_value
        WHEN 'Modern' THEN 'Hiện đại'
        WHEN 'Contemporary' THEN 'Đương đại'
        WHEN 'Minimalist' THEN 'Tối giản'
        WHEN 'Scandinavian' THEN 'Bắc Âu'
        WHEN 'Industrial' THEN 'Công nghiệp'
        WHEN 'Rustic' THEN 'Mộc mạc'
        WHEN 'Transitional' THEN 'Giao thoa'
        WHEN 'Bohemian' THEN 'Boho'
        WHEN 'Coastal' THEN 'Biển cả'
        WHEN 'Luxury' THEN 'Sang trọng'
        ELSE 'Phong cách'
      END INTO style_value_vi;

      english_name := format('%s %s Collection Piece %s', style_value, cat.name, lpad(product_index::text, 2, '0'));
      vietnamese_name := format('Mẫu %s %s số %s', style_value_vi, lower(cat_vi), lpad(product_index::text, 2, '0'));

      english_description := format('Piece %s highlights %s design for the %s with layered textures, smart storage, and adaptable proportions.', product_index, style_value, lower(cat.name));
      vietnamese_description := format('Thiết kế số %s mang tinh thần %s cho %s với chất liệu bền bỉ và công năng linh hoạt.', product_index, style_value_vi, lower(cat_vi));

      product_slug := regexp_replace(lower(format('%s %s signature %s', cat.slug, style_value, product_index)), '[^a-z0-9]+', '-', 'g'); -- Use product_slug

      base_price := round(((520 + product_index * 14) * cat_price_factor + random() * 160)::numeric, 2);
      IF product_index % 4 = 0 THEN
        sale_price := round((base_price * (0.82 + random() * 0.08))::numeric, 2);
        IF sale_price >= base_price THEN
          sale_price := base_price - 45;
        END IF;
      ELSE
        sale_price := NULL;
      END IF;

      stock := 12 + ((product_index * 3) % 48);
      weight_val := round((22 + product_index * 0.75 + random() * 8)::numeric, 2);

      materials := ARRAY[
        material_pool[((product_index - 1) % material_count) + 1],
        material_pool[((product_index) % material_count) + 1],
        material_pool[((product_index + 1) % material_count) + 1]
      ];

      width := 70 + ((product_index * 3) % 120);
      depth := 40 + ((product_index * 5) % 90);
      height := 45 + ((product_index * 2) % 110);
      dimension_json := jsonb_build_object(
        'width', format('%scm', width),
        'depth', format('%scm', depth),
        'height', format('%scm', height)
      );

      image_set := ARRAY[
        image_pool[((product_index - 1) % image_count) + 1],
        image_pool[((product_index) % image_count) + 1],
        image_pool[((product_index + 1) % image_count) + 1]
      ];

      INSERT INTO products (
        name,
        slug, -- Column name is still 'slug'
        description,
        name_i18n,
        description_i18n,
        category_id,
        base_price,
        sale_price,
        style,
        room_type,
        materials,
        dimensions,
        weight,
        sku,
        stock_quantity,
        images,
        video_url,
        model_3d_url,
        rating,
        review_count,
        is_featured,
        is_new,
        status,
        created_at,
        updated_at
      )
      VALUES (
        english_name,
        product_slug, -- Pass the variable product_slug
        english_description,
        jsonb_build_object('en', english_name, 'vi', vietnamese_name),
        jsonb_build_object('en', english_description, 'vi', vietnamese_description),
        cat.id,
        base_price,
        sale_price,
        style_value,
        cat.name,
        materials,
        dimension_json,
        weight_val,
        upper(left(cat.slug, 2)) || '-' || lpad(product_index::text, 3, '0') || '-' || lpad((100 + floor(random() * 900))::text, 3, '0'),
        stock,
        image_set,
        NULL,
        NULL,
        0,
        0,
        (product_index % 12 = 0),
        (product_index <= 10),
        'active',
        now() - ((product_index % 45) || ' days')::interval,
        now()
      )
      ON CONFLICT (slug) DO UPDATE SET -- Now 'slug' here clearly refers to the column
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        name_i18n = EXCLUDED.name_i18n,
        description_i18n = EXCLUDED.description_i18n,
        category_id = EXCLUDED.category_id,
        base_price = EXCLUDED.base_price,
        sale_price = EXCLUDED.sale_price,
        style = EXCLUDED.style,
        room_type = EXCLUDED.room_type,
        materials = EXCLUDED.materials,
        dimensions = EXCLUDED.dimensions,
        weight = EXCLUDED.weight,
        sku = EXCLUDED.sku,
        stock_quantity = EXCLUDED.stock_quantity,
        images = EXCLUDED.images,
        is_featured = EXCLUDED.is_featured,
        is_new = EXCLUDED.is_new,
        status = EXCLUDED.status,
        updated_at = now();
    END LOOP;
  END LOOP;
END $product_catalog$;

-- ============================================================================
-- 20. INSERT BULK PRODUCT REVIEWS
-- ============================================================================

DO $product_reviews$
DECLARE
  product_record RECORD;
  review_total integer;
  i integer;
  rating_value integer;
  review_templates text[] := ARRAY[
    'Exceptional craftsmanship and comfort.',
    'Beautiful finish and thoughtful detailing throughout.',
    'Arrived well packaged and feels incredibly sturdy.',
    'The proportions are perfect for our home.',
    'Color and texture are exactly as described.',
    'Easy to assemble with clear instructions.',
    'Adds a luxurious feel to the entire space.',
    'Quality materials that hold up to daily use.',
    'Highly versatile styling options.',
    'Great balance between form and function.',
    'Soft yet supportive cushions that everyone loves.',
    'Impressive durability even with kids and pets.',
    'Elevated the look of our room instantly.',
    'Thoughtful storage keeps everything organized.',
    'Finishes look premium and timeless.',
    'Customer service was responsive and helpful.',
    'Packaging was secure and environmentally conscious.',
    'Assembly took minutes and pieces fit perfectly.',
    'A standout piece that guests always notice.',
    'Comfortable enough for long evenings at home.'
  ];
  sentiment_tail text;
BEGIN
  FOR product_record IN SELECT id FROM products LOOP
    review_total := 20 + floor(random() * 31)::integer;

    FOR i IN 1..review_total LOOP
      rating_value := 1 + floor(random() * 5)::integer;
      SELECT CASE rating_value
        WHEN 5 THEN 'Absolutely recommended for design lovers.'
        WHEN 4 THEN 'Highly satisfied and would purchase again.'
        WHEN 3 THEN 'Solid quality with a few minor quirks.'
        WHEN 2 THEN 'Useful but could benefit from refinements.'
        ELSE 'Appreciate the concept though execution could improve.'
      END INTO sentiment_tail;

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
        product_record.id,
        NULL,
        NULL,
        rating_value,
        review_templates[((i - 1) % array_length(review_templates, 1)) + 1] || ' ' || sentiment_tail,
        false,
        'approved',
        now() - ((i + floor(random() * 90)) || ' days')::interval
      );
    END LOOP;

    UPDATE products p
    SET
      rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM reviews r WHERE r.product_id = p.id), 0),
      review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
    WHERE p.id = product_record.id;
  END LOOP;
END $product_reviews$;

-- ============================================================================
-- 21. INSERT MULTI-LANGUAGE BLOG POSTS
-- ============================================================================

DELETE FROM comments;
DELETE FROM blog_posts;

WITH series AS (
  SELECT
    gs AS idx,
    (ARRAY['Modern', 'Scandinavian', 'Industrial', 'Minimalist', 'Coastal', 'Artisan', 'Luxury', 'Mid-century'])[((gs - 1) % 8) + 1] AS style_en,
    (ARRAY['Hiện đại', 'Bắc Âu', 'Công nghiệp', 'Tối giản', 'Biển cả', 'Thủ công', 'Sang trọng', 'Giữa thế kỷ'])[((gs - 1) % 8) + 1] AS style_vi,
    (ARRAY['living spaces', 'bedroom retreats', 'dining gatherings', 'creative workspaces', 'outdoor lounges', 'family rooms', 'compact homes', 'seasonal décor'])[((gs - 1) % 8) + 1] AS focus_en,
    (ARRAY['không gian sinh hoạt', 'phòng ngủ thư thái', 'bữa tiệc quây quần', 'góc làm việc sáng tạo', 'khoảng sân thư thái', 'phòng sinh hoạt gia đình', 'căn hộ nhỏ gọn', 'trang trí theo mùa'])[((gs - 1) % 8) + 1] AS focus_vi,
    (ARRAY[
      'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg',
      'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg',
      'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg',
      'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg',
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
      'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg',
      'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg',
      'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg'
    ])[((gs - 1) % 8) + 1] AS image_url
  FROM generate_series(1, 35) AS gs
)
INSERT INTO blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  author,
  published_at,
  created_at,
  updated_at,
  title_i18n,
  excerpt_i18n
)
SELECT
  gen_random_uuid(),
  format('%s Style Guide #%s for %s', style_en, idx, focus_en),
  regexp_replace(lower(format('%s style guide %s %s', style_en, focus_en, idx)), '[^a-z0-9]+', '-', 'g'),
  format('Learn how to layer %s elements into %s with materials, lighting, and styling cues from our design team.', style_en, focus_en),
  format(
    E'## Define your palette
Blend tones and textures that echo %s sensibilities while keeping functionality top of mind.

## Elevate the mood
Layer lighting, greenery, and personal accents to make %s feel inviting day and night.

## Curate with intention
Combine statement pieces with everyday essentials to strike the right balance for %s.',
    lower(style_en), focus_en, focus_en
  ),
  image_url,
  'Thi Interior Studio',
  now() - ((idx - 1) * interval '3 days'),
  now() - ((idx - 1) * interval '3 days'),
  now() - ((idx - 1) * interval '3 days'),
  jsonb_build_object(
    'en', format('%s Style Guide #%s for %s', style_en, idx, focus_en),
    'vi', format('Cẩm nang phong cách %s #%s cho %s', style_vi, idx, focus_vi)
  ),
  jsonb_build_object(
    'en', format('Learn how to layer %s elements into %s with materials, lighting, and styling cues from our design team.', style_en, focus_en),
    'vi', format('Khám phá cách phối hợp phong cách %s trong %s với vật liệu, ánh sáng và gợi ý từ đội ngũ stylist của chúng tôi.', style_vi, focus_vi)
  )
FROM series;

-- ============================================================================
-- 22. INSERT SAMPLE BLOG COMMENTS
-- ============================================================================

INSERT INTO comments (id, post_id, name, email, content, is_approved, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  c.name,
  c.email,
  c.content,
  true,
  now() - (c.days_ago || ' days')::interval
FROM (
  VALUES
    (0, 'Minh Anh', 'minhanh@example.com', 'Không gian làm việc này quá đẹp! Mình sẽ thêm cây xanh và một chiếc đèn bàn giống trong bài.', 7),
    (1, 'Hoàng Nam', 'namhoang@example.com', 'Những gợi ý về chất liệu bền vững thực sự hữu ích cho căn hộ của gia đình mình.', 12),
    (2, 'Thảo Linh', 'thaolinh@example.com', 'Nhờ hướng dẫn này mà phòng ăn nhỏ của mình trở nên gọn gàng và ấm cúng hơn hẳn.', 4)
) AS c(offset_index, name, email, content, days_ago)
JOIN LATERAL (
  SELECT id
  FROM blog_posts
  ORDER BY published_at DESC
  OFFSET c.offset_index
  LIMIT 1
) AS p ON TRUE
ON CONFLICT DO NOTHING;
