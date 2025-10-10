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
-- 9. Create blog_posts table
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

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Blog posts are readable by everyone"
  ON blog_posts FOR SELECT
  TO public
  USING (true);

-- 10. Create comments table for blog posts
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Approved comments are visible"
  ON comments FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY IF NOT EXISTS "Anyone can create comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

-- 11. Seed sample blog posts
INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image_url, author, published_at, created_at, updated_at)
VALUES
  (
    'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    '5 Interior Design Trends Defining Modern Living in 2024',
    '5-interior-design-trends-2024',
    'Discover the leading interior trends of 2024 to refresh your home with minimalist, sustainable, and highly curated touches.',
    E'## Minimalism with warmth\nThe minimalist look remains popular for the calm and clarity it brings. Work with a neutral palette and layer natural textures to keep the space welcoming.\n\n## Planet-friendly materials\nSustainability is now a priority. Reclaimed woods, FSC-certified timber, and organic fabrics are top picks that balance style with responsibility.\n\n## Smart technology at home\nConnected lighting, automated shades, and multifunctional furnishings create a seamless living experience. Integrate smart features where they make daily routines easier.\n\n## Personalized styling\nDisplay art, handmade pieces, and meaningful keepsakes to give every room character. A few personal accents instantly make a space feel one-of-a-kind.\n\n## Indoor greenery\nPlants continue to shine as natural mood boosters. Cluster mini planters or hang cascading greenery to purify the air and energize the room.',
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
    E'## Measure with intention\nBefore you shop, map out the room and note doorways, walkways, and other furniture placements to confirm the sofa will fit comfortably.\n\n## Match the shape to your lifestyle\nIf you host often, consider an L-shaped sectional or sleeper sofa. For compact apartments, a two-seater paired with an ottoman keeps things flexible.\n\n## Focus on fabric and color\nPerformance linen and cotton blend well with modern styles, while leather introduces polish. Stick with timeless neutrals and layer in colorful pillows for personality.\n\n## Coordinate with the rest of the room\nBalance the sofa with the coffee table, media console, and lighting. Finish the look with an area rug or wall art that ties the palette together.',
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
    E'## Embrace natural light\nPosition your desk near a window to soak up daylight and stay energized. Layer sheer curtains or blinds so you can control glare during video calls.\n\n## Invest in ergonomic furniture\nChoose a chair with proper lumbar support and a height-adjustable seat. A spacious desktop keeps monitors, keyboards, and notebooks organized.\n\n## Keep clutter in check\nEdit your work surface regularly and rely on trays, shelves, or wall-mounted organizers to store paperwork. A tidy setup makes it easier to focus.\n\n## Add inspiring accents\nGreenery, sculptural lamps, or framed prints introduce texture and creativity. Rotate a few accessories seasonally to keep the space feeling fresh.',
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

-- 12. Seed sample comments
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
