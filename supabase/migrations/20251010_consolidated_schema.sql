/*
  # SCHEMA TỔNG HỢP: Furniture Store Database Schema (20251010_fixed_v5)

  ## Mục đích
  File này hợp nhất tất cả các file migration đã tạo trước đó thành một script SQL duy nhất,
  đảm bảo tính toàn vẹn, chức năng, và bao gồm tất cả các bản sửa lỗi và dữ liệu mẫu.

  ## Các tính năng chính
  1.  Các bảng cốt lõi: profiles, categories, products, product_variants, addresses.
  2.  Hệ thống đặt hàng: orders, order_items, hàm generate_order_number().
  3.  Chức năng người dùng: favorites, cart_items, reviews.
  4.  Hệ thống khuyến mãi: vouchers, voucher_usage.
  5.  Chức năng khác: contact_messages, room_inspirations, blog_posts, comments, design_service_requests, career_applications.
  6.  Tất cả RLS Policies, Constraints, và Indexes.
  7.  Dữ liệu mẫu cho vouchers và products.

  ## CÁC LỖI ĐÃ FIX
  1.  **FIX MỚI (42883): function auth_is_admin() does not exist** (Đã di chuyển định nghĩa hàm auth_is_admin() lên trước các CREATE POLICY sử dụng nó).
  2.  Fixed "column reference "slug" is ambiguous" (Đã đổi tên biến PL/pgSQL 'slug' thành 'product_slug').
  3.  Fixed "function gen_salt(unknown) does not exist" (Đã chỉ định rõ schema 'extensions' cho các hàm pgcrypto).
  4.  Fixed "column "instance_id" is of type uuid but expression is of type text" (Đã ép kiểu '00000000-0000-0000-0000-000000000000' thành UUID).
  5.  Fixed "relation "profiles" does not exist" (Đã di chuyển phần tạo bảng `profiles` lên trước khối `DO $$`).
  6.  FIX LỖI MỚI: "relation "products_to_remove" does not exist" (Đã hợp nhất các câu lệnh DELETE sử dụng CTE `products_to_remove` thành một khối CTE duy nhất).
*/

-- Đảm bảo các tiện ích mật mã cần thiết luôn khả dụng
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- Đảm bảo các hàm này có thể được gọi mà không cần chỉ định schema
GRANT EXECUTE ON FUNCTION extensions.gen_salt(text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION extensions.crypt(text, text) TO PUBLIC;


-- ============================================================================
-- 0. HÀM HỖ TRỢ (ĐÃ DI CHUYỂN LÊN ĐẦU ĐỂ KHẮC PHỤC LỖI 42883)
-- ============================================================================

CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  -- Hàm kiểm tra xem người dùng hiện tại có vai trò 'admin' trong JWT hay không.
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata') ->> 'role',
    (auth.jwt() -> 'user_metadata') ->> 'role',
    auth.jwt() ->> 'role',
    ''
  ) = 'admin';
$$;


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
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles; -- Lệnh DROP POLICY không cần sửa

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

-- Bây giờ hàm auth_is_admin() đã tồn tại nên lệnh này sẽ chạy thành công
CREATE POLICY "Admins manage profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());


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
      -- Dùng extensions.gen_random_uuid() để đảm bảo
      RETURN 'ORD-' || upper(substring(extensions.gen_random_uuid()::text from 1 for 13));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name text NOT NULL,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
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

DROP POLICY IF EXISTS "Admins manage categories" ON categories;

CREATE POLICY "Admins manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 3. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  currency text NOT NULL DEFAULT 'USD',
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

DROP POLICY IF EXISTS "Admins manage products" ON products;

CREATE POLICY "Admins manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 4. PRODUCT VARIANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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

DROP POLICY IF EXISTS "Admins manage product variants" ON product_variants;

CREATE POLICY "Admins manage product variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 5. ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
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

DROP POLICY IF EXISTS "Admins manage vouchers" ON vouchers;

CREATE POLICY "Admins manage vouchers"
  ON vouchers
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 7. ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL DEFAULT generate_order_number(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),

  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  shipping_cost decimal(10, 2) NOT NULL DEFAULT 0,
  tax decimal(10, 2) NOT NULL DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0,
  total_amount decimal(10, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',

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

DROP POLICY IF EXISTS "Admins manage orders" ON orders;

CREATE POLICY "Admins manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 8. ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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

DROP POLICY IF EXISTS "Admins manage order items" ON order_items;

CREATE POLICY "Admins manage order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 9. VOUCHER USAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS voucher_usage (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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

DROP POLICY IF EXISTS "Admins manage reviews" ON reviews;

CREATE POLICY "Admins manage reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

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
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  style_tags text[],
  style_tags_i18n jsonb NOT NULL DEFAULT '[]'::jsonb,
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

ALTER TABLE room_inspirations
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS title_i18n jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_i18n jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS style_tags_i18n jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS product_slugs text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS product_details jsonb DEFAULT '[]'::jsonb;

ALTER TABLE room_inspirations
  ALTER COLUMN product_ids SET DEFAULT ARRAY[]::uuid[];

CREATE UNIQUE INDEX IF NOT EXISTS room_inspirations_slug_unique ON room_inspirations(slug);

-- ============================================================================
-- 14. CONTACT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text NOT NULL,
  subject_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  message text NOT NULL,
  message_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
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

DROP POLICY IF EXISTS "Admins manage contact messages" ON contact_messages;

CREATE POLICY "Admins manage contact messages"
  ON contact_messages
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 14B. DESIGN SERVICE REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_service_requests (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  email text NOT NULL,
  phone text DEFAULT '',
  project_type text NOT NULL,
  project_scope text,
  preferred_style text,
  budget_range text,
  desired_timeline text,
  additional_notes text,
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'quoted', 'scheduled', 'completed', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE design_service_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_design_service_requests_email ON design_service_requests(email);
CREATE INDEX IF NOT EXISTS idx_design_service_requests_status ON design_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_design_service_requests_created_at ON design_service_requests(created_at DESC);

DROP POLICY IF EXISTS "Users manage own design requests" ON design_service_requests;
DROP POLICY IF EXISTS "Authenticated design request submissions" ON design_service_requests;
DROP POLICY IF EXISTS "Anonymous design request submissions" ON design_service_requests;
DROP POLICY IF EXISTS "Admins manage design requests" ON design_service_requests;

CREATE POLICY "Users manage own design requests"
  ON design_service_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated design request submissions"
  ON design_service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous design request submissions"
  ON design_service_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins manage design requests"
  ON design_service_requests
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 14C. CAREER APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS career_applications (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  full_name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  email text NOT NULL,
  phone text DEFAULT '',
  position_applied text NOT NULL,
  position_applied_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  resume_url text NOT NULL,
  cover_letter text,
  cover_letter_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  portfolio_url text,
  expected_salary text,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'interview', 'offer', 'hired', 'archived', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at DESC);

DROP POLICY IF EXISTS "Users manage own applications" ON career_applications;
DROP POLICY IF EXISTS "Authenticated career submissions" ON career_applications;
DROP POLICY IF EXISTS "Anonymous career submissions" ON career_applications;
DROP POLICY IF EXISTS "Admins manage career applications" ON career_applications;

CREATE POLICY "Users manage own applications"
  ON career_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated career submissions"
  ON career_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous career submissions"
  ON career_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins manage career applications"
  ON career_applications
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 15. BLOG POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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

DROP POLICY IF EXISTS "Admins manage blog posts" ON blog_posts;

CREATE POLICY "Admins manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ============================================================================
-- 16. BLOG COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
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

INSERT INTO categories (name, name_i18n, slug, description, display_order)
VALUES
  (
    'Living Room',
    jsonb_build_object('en', 'Living Room', 'vi', 'Phòng khách'),
    'living-room',
    'Furniture for your living room',
    1
  ),
  (
    'Bedroom',
    jsonb_build_object('en', 'Bedroom', 'vi', 'Phòng ngủ'),
    'bedroom',
    'Furniture for your bedroom',
    2
  ),
  (
    'Dining',
    jsonb_build_object('en', 'Dining', 'vi', 'Phòng ăn'),
    'dining',
    'Dining furniture and accessories',
    3
  ),
  (
    'Office',
    jsonb_build_object('en', 'Office', 'vi', 'Văn phòng'),
    'office',
    'Home office furniture',
    4
  ),
  (
    'Outdoor',
    jsonb_build_object('en', 'Outdoor', 'vi', 'Ngoài trời'),
    'outdoor',
    'Outdoor and patio furniture',
    5
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 18. INSERT SAMPLE DATA - VOUCHERS
-- ============================================================================

INSERT INTO vouchers (
  code,
  discount_type,
  discount_value,
  min_purchase,
  max_discount,
  valid_until,
  is_active,
  description,
  description_i18n
)
VALUES
  (
    'WELCOME10',
    'percentage',
    10,
    100,
    50,
    now() + interval '90 days',
    true,
    'Welcome discount for new customers',
    jsonb_build_object('en', 'Welcome discount for new customers', 'vi', 'Ưu đãi chào mừng khách hàng mới')
  ),
  (
    'SAVE20',
    'fixed',
    20,
    50,
    NULL,
    now() + interval '60 days',
    true,
    'Save $20 on your order',
    jsonb_build_object('en', 'Save $20 on your order', 'vi', 'Giảm 20$ cho đơn hàng của bạn')
  ),
  (
    'FURNITURE25',
    'percentage',
    25,
    500,
    200,
    now() + interval '30 days',
    true,
    '25% off furniture items',
    jsonb_build_object('en', '25% off furniture items', 'vi', 'Giảm 25% cho các sản phẩm nội thất')
  ),
  (
    'FREESHIP',
    'fixed',
    50,
    200,
    NULL,
    now() + interval '120 days',
    true,
    'Free shipping on orders over $200',
    jsonb_build_object('en', 'Free shipping on orders over $200', 'vi', 'Miễn phí vận chuyển cho đơn từ $200')
  ),
  (
    'MEGA50',
    'fixed',
    50,
    300,
    NULL,
    now() + interval '45 days',
    true,
    'Mega sale - $50 off',
    jsonb_build_object('en', 'Mega sale - $50 off', 'vi', 'Siêu khuyến mãi - giảm $50')
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 18B. INSERT SAMPLE DATA - SUPPORTING COMMUNICATION TABLES
-- ============================================================================

INSERT INTO contact_messages (
  id,
  name,
  name_i18n,
  email,
  phone,
  subject,
  subject_i18n,
  message,
  message_i18n,
  status,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'Emily Carter',
    jsonb_build_object('en', 'Emily Carter', 'vi', 'Emily Carter'),
    'emily.carter@example.com',
    '+1-555-0134',
    'Order status question',
    jsonb_build_object('en', 'Order status question', 'vi', 'Câu hỏi về trạng thái đơn hàng'),
    'Hi team, could you update me on the status of my recent order?',
    jsonb_build_object(
      'en', 'Hi team, could you update me on the status of my recent order?',
      'vi', 'Chào đội ngũ, bạn có thể cập nhật tình trạng đơn hàng mới nhất của tôi không?'
    ),
    'pending',
    now() - interval '5 days',
    now() - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Minh Tran',
    jsonb_build_object('en', 'Minh Tran', 'vi', 'Minh Trần'),
    'minh.tran@example.com',
    '+84-28-3899-0123',
    'Design consultation follow-up',
    jsonb_build_object('en', 'Design consultation follow-up', 'vi', 'Theo dõi tư vấn thiết kế'),
    'Thank you for the consultation. I would love to receive the proposal this week.',
    jsonb_build_object(
      'en', 'Thank you for the consultation. I would love to receive the proposal this week.',
      'vi', 'Cảm ơn buổi tư vấn. Tôi mong nhận được đề xuất trong tuần này.'
    ),
    'read',
    now() - interval '9 days',
    now() - interval '7 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO design_service_requests (
  id,
  name,
  name_i18n,
  email,
  phone,
  project_type,
  project_scope,
  preferred_style,
  budget_range,
  desired_timeline,
  additional_notes,
  title_i18n,
  description_i18n,
  status,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Isabella Nguyen',
    jsonb_build_object('en', 'Isabella Nguyen', 'vi', 'Isabella Nguyễn'),
    'isabella.nguyen@example.com',
    '+84-901-234-567',
    'Residential apartment',
    'Complete living room redesign',
    'Modern',
    '$10,000 - $15,000',
    '6 weeks',
    'Focus on maximizing natural light and concealed storage.',
    jsonb_build_object('en', 'Living Room Refresh', 'vi', 'Tái tạo phòng khách'),
    jsonb_build_object(
      'en', 'A modern living room plan with flexible layouts and smart storage.',
      'vi', 'Giải pháp phòng khách hiện đại với bố cục linh hoạt và lưu trữ thông minh.'
    ),
    'in_review',
    now() - interval '12 days',
    now() - interval '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Daniel Carter',
    jsonb_build_object('en', 'Daniel Carter', 'vi', 'Daniel Carter'),
    'daniel.carter@example.com',
    '+1-555-0456',
    'Boutique office',
    'Workspace for a five-person creative team',
    'Scandinavian',
    '$18,000 - $25,000',
    '8 weeks',
    'Need acoustic treatment for calls and modular collaboration areas.',
    jsonb_build_object('en', 'Creative Studio Concept', 'vi', 'Ý tưởng studio sáng tạo'),
    jsonb_build_object(
      'en', 'Design a calming office with collaborative zones and acoustic solutions.',
      'vi', 'Thiết kế văn phòng thư thái với khu vực hợp tác và xử lý âm thanh hiệu quả.'
    ),
    'quoted',
    now() - interval '20 days',
    now() - interval '14 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO career_applications (
  id,
  full_name,
  full_name_i18n,
  email,
  phone,
  position_applied,
  position_applied_i18n,
  resume_url,
  cover_letter,
  cover_letter_i18n,
  portfolio_url,
  expected_salary,
  status,
  notes,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'Linh Pham',
    jsonb_build_object('en', 'Linh Pham', 'vi', 'Linh Phạm'),
    'linh.pham@example.com',
    '+84-915-678-900',
    'Senior Interior Designer',
    jsonb_build_object('en', 'Senior Interior Designer', 'vi', 'Chuyên gia thiết kế nội thất cao cấp'),
    'https://example.com/resumes/linh-pham.pdf',
    'I bring 8 years of experience leading residential design projects across APAC.',
    jsonb_build_object(
      'en', 'I bring 8 years of experience leading residential design projects across APAC.',
      'vi', 'Tôi có 8 năm kinh nghiệm dẫn dắt các dự án thiết kế nhà ở tại khu vực châu Á - Thái Bình Dương.'
    ),
    'https://example.com/portfolios/linh-pham',
    '$48,000',
    'reviewing',
    'Top candidate for Q3 hiring pipeline.',
    now() - interval '15 days',
    now() - interval '8 days'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Ethan Walker',
    jsonb_build_object('en', 'Ethan Walker', 'vi', 'Ethan Walker'),
    'ethan.walker@example.com',
    '+1-555-0899',
    'Visual Merchandising Specialist',
    jsonb_build_object('en', 'Visual Merchandising Specialist', 'vi', 'Chuyên viên trưng bày trực quan'),
    'https://example.com/resumes/ethan-walker.pdf',
    'Passionate about retail storytelling and in-store experience design.',
    jsonb_build_object(
      'en', 'Passionate about retail storytelling and in-store experience design.',
      'vi', 'Đam mê kể chuyện thương hiệu và thiết kế trải nghiệm mua sắm tại cửa hàng.'
    ),
    'https://example.com/portfolios/ethan-walker',
    '$42,000',
    'received',
    'Schedule portfolio review with creative director.',
    now() - interval '6 days',
    now() - interval '2 days'
  )
ON CONFLICT (id) DO NOTHING;

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

      -- FIX: Đã đổi tên biến local 'slug' thành 'product_slug'
      product_slug := regexp_replace(lower(format('%s %s signature %s', cat.slug, style_value, product_index)), '[^a-z0-9]+', '-', 'g');

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
        slug, -- column reference
        description,
        name_i18n,
        description_i18n,
        category_id,
        base_price,
        sale_price,
        currency,
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
        'USD',
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
      ON CONFLICT (slug) DO UPDATE SET -- column reference
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        name_i18n = EXCLUDED.name_i18n,
        description_i18n = EXCLUDED.description_i18n,
        category_id = EXCLUDED.category_id,
        base_price = EXCLUDED.base_price,
        sale_price = EXCLUDED.sale_price,
        currency = EXCLUDED.currency,
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
-- 20. UPSERT CURATED ROOM INSPIRATIONS
-- ============================================================================

DELETE FROM room_inspirations;

WITH inspiration_data AS (
  SELECT * FROM (VALUES
    (
      'living-modern-lounge',
      'Sunlit Modern Lounge',
      'Phòng khách hiện đại ngập nắng',
      'A creamy sectional anchors the lounge with a velvet accent chair, marble coffee table, and warm brass lighting for an inviting modern retreat.',
      'Ghế sofa chữ L màu kem kết hợp ghế nhung, bàn cà phê mặt đá và đèn đồng ấm áp tạo nên không gian tiếp khách hiện đại, thư thái.',
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['modern'],
      'living',
      'under-5000',
      'USD',
      ARRAY['living-room-modern-signature-1', 'living-room-modern-signature-11', 'living-room-modern-signature-21', 'living-room-modern-signature-31'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'living-room-modern-signature-1',
          'fallback_name', jsonb_build_object('en', 'Harper Sectional Sofa', 'vi', 'Sofa góc Harper'),
          'fallback_price', 2150,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'living-room-modern-signature-11',
          'fallback_name', jsonb_build_object('en', 'Marble Orbit Coffee Table', 'vi', 'Bàn cà phê Marble Orbit'),
          'fallback_price', 780,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'living-room-modern-signature-21',
          'fallback_name', jsonb_build_object('en', 'Atlas Arc Floor Lamp', 'vi', 'Đèn sàn Atlas Arc'),
          'fallback_price', 390,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'living-room-modern-signature-31',
          'fallback_name', jsonb_build_object('en', 'Tonal Wool Rug 8x10', 'vi', 'Thảm len Tonal 8x10'),
          'fallback_price', 960,
          'currency', 'USD'
        )
      ),
      true
    ),
    (
      'bedroom-scandi-hideaway',
      'Scandinavian Calm Bedroom',
      'Phòng ngủ phong cách Bắc Âu',
      'Layered oak tones, breathable linen bedding, and airy glass lighting make this bedroom a serene Scandinavian hideaway.',
      'Sắc gỗ sồi, chăn ga vải lanh thoáng mát và đèn thủy tinh nhẹ nhàng mang đến phòng ngủ Bắc Âu yên bình.',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['scandinavian'],
      'bedroom',
      'under-3000',
      'USD',
      ARRAY['bedroom-scandinavian-signature-4', 'bedroom-minimalist-signature-3', 'bedroom-contemporary-signature-2', 'bedroom-luxury-signature-10'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'bedroom-scandinavian-signature-4',
          'fallback_name', jsonb_build_object('en', 'Nordic Oak Platform Bed (Queen)', 'vi', 'Giường bệt gỗ sồi Nordic (Queen)'),
          'fallback_price', 1290,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'bedroom-minimalist-signature-3',
          'fallback_name', jsonb_build_object('en', 'Linen Bedding Set', 'vi', 'Bộ ga giường vải lanh'),
          'fallback_price', 360,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'bedroom-contemporary-signature-2',
          'fallback_name', jsonb_build_object('en', 'Haze Glass Nightstands (Set of 2)', 'vi', 'Tab đầu giường kính Haze (Bộ 2 chiếc)'),
          'fallback_price', 540,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'bedroom-luxury-signature-10',
          'fallback_name', jsonb_build_object('en', 'Softloom Area Rug', 'vi', 'Thảm Softloom'),
          'fallback_price', 350,
          'currency', 'USD'
        )
      ),
      true
    ),
    (
      'dining-industrial-loft',
      'Industrial Loft Dining',
      'Phòng ăn phong cách loft công nghiệp',
      'A live-edge dining table, leather and metal seating, and a copper statement chandelier capture an authentic loft mood.',
      'Bàn ăn gỗ nguyên tấm, ghế da kết hợp kim loại và đèn chùm đồng tạo nên sắc thái loft đậm chất công nghiệp.',
      'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['industrial'],
      'dining',
      'under-4000',
      'USD',
      ARRAY['dining-industrial-signature-5', 'dining-contemporary-signature-2', 'dining-luxury-signature-10'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'dining-industrial-signature-5',
          'fallback_name', jsonb_build_object('en', 'Forge Live-Edge Dining Table', 'vi', 'Bàn ăn Forge mép tự nhiên'),
          'fallback_price', 2150,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'dining-contemporary-signature-2',
          'fallback_name', jsonb_build_object('en', 'Set of 6 Rivet Leather Chairs', 'vi', 'Bộ 6 ghế da Rivet'),
          'fallback_price', 1140,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'dining-luxury-signature-10',
          'fallback_name', jsonb_build_object('en', 'Copper Cascade Chandelier', 'vi', 'Đèn chùm Copper Cascade'),
          'fallback_price', 490,
          'currency', 'USD'
        )
      ),
      false
    ),
    (
      'office-modern-suite',
      'Modern Home Office Suite',
      'Góc làm việc hiện đại tại nhà',
      'A walnut L-desk, ergonomic seating, and modular storage deliver a streamlined work-from-home command center.',
      'Bàn chữ L gỗ óc chó, ghế công thái học và tủ lưu trữ mô-đun tạo nên trung tâm làm việc tại nhà gọn gàng.',
      'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['modern'],
      'office',
      'under-3500',
      'USD',
      ARRAY['office-modern-signature-1', 'office-transitional-signature-7', 'office-contemporary-signature-2', 'office-minimalist-signature-3'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'office-modern-signature-1',
          'fallback_name', jsonb_build_object('en', 'Walnut Executive Desk', 'vi', 'Bàn làm việc gỗ óc chó'),
          'fallback_price', 1450,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'office-transitional-signature-7',
          'fallback_name', jsonb_build_object('en', 'ErgoFlex Leather Chair', 'vi', 'Ghế da ErgoFlex'),
          'fallback_price', 620,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'office-contemporary-signature-2',
          'fallback_name', jsonb_build_object('en', 'Modular Wall Storage', 'vi', 'Tủ lưu trữ treo tường mô-đun'),
          'fallback_price', 890,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'office-minimalist-signature-3',
          'fallback_name', jsonb_build_object('en', 'Linear Task Lighting', 'vi', 'Đèn làm việc Linear'),
          'fallback_price', 320,
          'currency', 'USD'
        )
      ),
      false
    ),
    (
      'studio-compact-haven',
      'Compact Studio Haven',
      'Căn hộ studio tiện nghi',
      'Multifunctional pieces keep the studio flexible and clutter-free, from a sleeper sofa to folding dining set.',
      'Nội thất đa năng giúp căn studio linh hoạt và gọn gàng, từ sofa giường đến bộ bàn ăn gấp gọn.',
      'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['minimalist'],
      'studio',
      'under-2500',
      'USD',
      ARRAY['living-room-minimalist-signature-3', 'dining-transitional-signature-7', 'living-room-bohemian-signature-8', 'living-room-coastal-signature-9'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'living-room-minimalist-signature-3',
          'fallback_name', jsonb_build_object('en', 'Convertible Sofa Bed', 'vi', 'Sofa giường đa năng'),
          'fallback_price', 940,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'dining-transitional-signature-7',
          'fallback_name', jsonb_build_object('en', 'Foldaway Dining Set', 'vi', 'Bộ bàn ăn gấp gọn'),
          'fallback_price', 520,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'living-room-bohemian-signature-8',
          'fallback_name', jsonb_build_object('en', 'Wall-Mounted Shelving System', 'vi', 'Kệ treo tường đa năng'),
          'fallback_price', 390,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'living-room-coastal-signature-9',
          'fallback_name', jsonb_build_object('en', 'Soft Glow Pendant', 'vi', 'Đèn thả Soft Glow'),
          'fallback_price', 330,
          'currency', 'USD'
        )
      ),
      false
    ),
    (
      'outdoor-coastal-retreat',
      'Coastal Outdoor Retreat',
      'Góc thư giãn ngoài trời phong cách biển',
      'Water-resistant lounge seating, textured rugs, and woven lanterns bring a breezy coastal vibe outside.',
      'Ghế lounge chống thấm, thảm dệt và lồng đèn mây mang hơi thở biển cả ra không gian ngoài trời.',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600',
      ARRAY['boho'],
      'outdoor',
      'under-4500',
      'USD',
      ARRAY['outdoor-coastal-signature-9', 'outdoor-bohemian-signature-8', 'outdoor-rustic-signature-6', 'outdoor-transitional-signature-7', 'outdoor-modern-signature-1'],
      jsonb_build_array(
        jsonb_build_object(
          'slug', 'outdoor-coastal-signature-9',
          'fallback_name', jsonb_build_object('en', 'Driftwood Outdoor Sofa', 'vi', 'Sofa ngoài trời Driftwood'),
          'fallback_price', 1980,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'outdoor-bohemian-signature-8',
          'fallback_name', jsonb_build_object('en', 'All-Weather Lounge Chairs (Set of 2)', 'vi', 'Bộ 2 ghế lounge mọi thời tiết'),
          'fallback_price', 1080,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'outdoor-rustic-signature-6',
          'fallback_name', jsonb_build_object('en', 'Braided Outdoor Rug', 'vi', 'Thảm ngoài trời Braided'),
          'fallback_price', 420,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'outdoor-transitional-signature-7',
          'fallback_name', jsonb_build_object('en', 'Rattan Lantern Trio', 'vi', 'Bộ ba đèn mây'),
          'fallback_price', 340,
          'currency', 'USD'
        ),
        jsonb_build_object(
          'slug', 'outdoor-modern-signature-1',
          'fallback_name', jsonb_build_object('en', 'Acacia Coffee Table', 'vi', 'Bàn cà phê gỗ keo'),
          'fallback_price', 500,
          'currency', 'USD'
        )
      ),
      false
    )
  ) AS v(
    slug,
    title_en,
    title_vi,
    description_en,
    description_vi,
    image_url,
    style_tags,
    room_type,
    budget,
    currency,
    product_slugs,
    product_details,
    is_featured
  )
)
INSERT INTO room_inspirations (
  slug,
  title,
  description,
  image_url,
  style_tags,
  style_tags_i18n,
  room_type,
  product_slugs,
  product_ids,
  is_featured,
  title_i18n,
  description_i18n,
  budget,
  currency,
  product_details,
  created_at
)
SELECT
  data.slug,
  data.title_en,
  data.description_en,
  data.image_url,
  data.style_tags,
  jsonb_build_object(
    'en', data.style_tags,
    'vi', COALESCE(
      (
        SELECT ARRAY_AGG(
          CASE lower(tag)
            WHEN 'modern' THEN 'hiện đại'
            WHEN 'scandinavian' THEN 'bắc âu'
            WHEN 'minimalist' THEN 'tối giản'
            WHEN 'industrial' THEN 'công nghiệp'
            WHEN 'bohemian' THEN 'boho'
            WHEN 'coastal' THEN 'ven biển'
            WHEN 'luxury' THEN 'sang trọng'
            ELSE initcap(replace(tag, '-', ' '))
          END
        )
        FROM unnest(data.style_tags) AS tag
      ),
      ARRAY[]::text[]
    )
  ),
  data.room_type,
  data.product_slugs,
  COALESCE(
    (
      SELECT ARRAY_AGG(p.id ORDER BY array_position(data.product_slugs, p.slug))
      FROM products p
      WHERE p.slug = ANY(data.product_slugs)
    ),
    ARRAY[]::uuid[]
  ),
  data.is_featured,
  jsonb_build_object('en', data.title_en, 'vi', data.title_vi),
  jsonb_build_object('en', data.description_en, 'vi', data.description_vi),
  data.budget,
  data.currency,
  data.product_details,
  now()
FROM inspiration_data AS data
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  style_tags = EXCLUDED.style_tags,
  style_tags_i18n = EXCLUDED.style_tags_i18n,
  room_type = EXCLUDED.room_type,
  product_slugs = EXCLUDED.product_slugs,
  product_ids = EXCLUDED.product_ids,
  is_featured = EXCLUDED.is_featured,
  title_i18n = EXCLUDED.title_i18n,
  description_i18n = EXCLUDED.description_i18n,
  budget = EXCLUDED.budget,
  currency = EXCLUDED.currency,
  product_details = EXCLUDED.product_details;

-- ============================================================================
-- 21. INSERT BULK PRODUCT REVIEWS
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
-- 22. INSERT MULTI-LANGUAGE BLOG POSTS
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
  extensions.gen_random_uuid(),
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
-- 23. INSERT SAMPLE BLOG COMMENTS
-- ============================================================================

INSERT INTO comments (id, post_id, name, email, content, is_approved, created_at)
SELECT
  extensions.gen_random_uuid(),
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

-- ============================================================================
-- 24. CHUẨN HÓA LINK ẢNH
-- ============================================================================

UPDATE products
SET images = COALESCE(
  ARRAY(
    SELECT normalized_img
    FROM (
      SELECT CASE
        WHEN img IS NULL OR btrim(img) = '' THEN NULL
        WHEN position('?' IN img) > 0 THEN regexp_replace(img, '\\?.*$', '?auto=compress&cs=tinysrgb&w=1600')
        ELSE img || '?auto=compress&cs=tinysrgb&w=1600'
      END AS normalized_img
      FROM unnest(products.images) AS img
    ) AS normalized
    WHERE normalized_img IS NOT NULL
  ),
  ARRAY[]::text[]
)
WHERE images IS NOT NULL;

UPDATE blog_posts
SET featured_image_url = CASE
  WHEN featured_image_url IS NULL OR btrim(featured_image_url) = '' THEN featured_image_url
  WHEN position('?' IN featured_image_url) > 0 THEN regexp_replace(featured_image_url, '\\?.*$', '?auto=compress&cs=tinysrgb&w=1600')
  ELSE featured_image_url || '?auto=compress&cs=tinysrgb&w=1600'
END;

-- ============================================================================
-- 25. GIẢM MẪU DỮ LIỆU
-- ============================================================================

-- BƯỚC FIX LỖI: Hợp nhất tất cả các lệnh DELETE sử dụng products_to_remove vào một CTE duy nhất
WITH keep_slugs AS (
  SELECT DISTINCT unnest(product_slugs) AS slug
  FROM room_inspirations
),
product_stats AS (
  SELECT COUNT(*)::numeric AS total_products FROM products
),
reserved_products AS (
  SELECT COUNT(*)::numeric AS reserved_products
  FROM products
  WHERE slug IN (SELECT slug FROM keep_slugs)
),
eligible_products AS (
  SELECT COUNT(*)::numeric AS eligible_total
  FROM products
  WHERE slug NOT IN (SELECT slug FROM keep_slugs)
),
delete_limit AS (
  SELECT LEAST(
      COALESCE(eligible_products.eligible_total, 0),
      GREATEST(floor(product_stats.total_products / 2.0) - COALESCE(reserved_products.reserved_products, 0), 0)
    ) AS limit_value
  FROM product_stats
  LEFT JOIN reserved_products ON TRUE
  LEFT JOIN eligible_products ON TRUE
),
products_to_remove AS (
  SELECT pc.id
  FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
      FROM products
      WHERE slug NOT IN (SELECT slug FROM keep_slugs)
  ) pc
  CROSS JOIN delete_limit dl
  WHERE pc.rn <= dl.limit_value
),
-- Thực hiện DELETE dựa trên CTE products_to_remove và trả về số lượng các bản ghi bị xóa (để làm cho câu lệnh hợp lệ)
deleted_reviews AS (
    DELETE FROM reviews WHERE product_id IN (SELECT id FROM products_to_remove) RETURNING 1
),
deleted_variants AS (
    DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products_to_remove) RETURNING 1
),
deleted_favorites AS (
    DELETE FROM favorites WHERE product_id IN (SELECT id FROM products_to_remove) RETURNING 1
),
deleted_cart_items AS (
    DELETE FROM cart_items WHERE product_id IN (SELECT id FROM products_to_remove) RETURNING 1
),
deleted_order_items AS (
    DELETE FROM order_items WHERE product_id IN (SELECT id FROM products_to_remove) RETURNING 1
)
-- Câu lệnh chính phải là một lệnh SELECT hoặc một lệnh thao tác dữ liệu cuối cùng.
-- Chúng ta thực hiện DELETE cuối cùng trên bảng cha (products).
DELETE FROM products WHERE id IN (SELECT id FROM products_to_remove);


WITH ranked_reviews AS (
  SELECT
    id,
    product_id,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at DESC, id) AS rn,
    COUNT(*) OVER (PARTITION BY product_id) AS total_count
  FROM reviews
),
reviews_to_remove AS (
  SELECT id
  FROM ranked_reviews
  WHERE rn > floor(total_count / 2.0)
)
DELETE FROM reviews WHERE id IN (SELECT id FROM reviews_to_remove);

WITH candidate_posts AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY published_at DESC, id) AS rn,
    COUNT(*) OVER () AS total_count
  FROM blog_posts
  WHERE NOT EXISTS (
    SELECT 1 FROM comments WHERE comments.post_id = blog_posts.id
  )
),
posts_to_remove AS (
  SELECT id
  FROM candidate_posts
  WHERE rn > floor(total_count / 2.0)
)
DELETE FROM blog_posts WHERE id IN (SELECT id FROM posts_to_remove);

-- Cập nhật lại thống kê đánh giá sau khi giảm mẫu
WITH aggregates AS (
  SELECT
    product_id,
    ROUND(AVG(rating)::numeric, 2) AS avg_rating,
    COUNT(*) AS review_total
  FROM reviews
  GROUP BY product_id
)
UPDATE products AS p
SET
  rating = COALESCE(a.avg_rating, 0),
  review_count = COALESCE(a.review_total, 0)
FROM aggregates AS a
WHERE p.id = a.product_id;

UPDATE products
SET rating = 0, review_count = 0
WHERE id NOT IN (SELECT DISTINCT product_id FROM reviews);
