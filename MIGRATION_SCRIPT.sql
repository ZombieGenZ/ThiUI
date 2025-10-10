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
    '5 xu hướng nội thất nổi bật cho không gian sống hiện đại năm 2024',
    '5-xu-huong-noi-that-2024',
    'Khám phá những xu hướng nội thất dẫn đầu năm 2024 giúp bạn làm mới tổ ấm với phong cách tối giản, bền vững và giàu cảm hứng.',
    E'## Tối giản nhưng tinh tế\nKhông gian sống tối giản tiếp tục được yêu thích nhờ khả năng mang lại cảm giác gọn gàng, thư thái. Sử dụng các gam màu trung tính, nhấn nhá bằng chất liệu tự nhiên giúp tổng thể hài hòa.\n\n## Vật liệu thân thiện môi trường\nNgười tiêu dùng ngày càng quan tâm đến sự bền vững. Các vật liệu tái chế, gỗ FSC và vải hữu cơ được ưu tiên để bảo vệ môi trường nhưng vẫn đảm bảo thẩm mỹ.\n\n## Công nghệ thông minh trong nội thất\nThiết bị thông minh tích hợp trong đồ nội thất giúp nâng cao trải nghiệm sống. Từ hệ thống chiếu sáng điều khiển tự động đến nội thất đa năng đều mang tới sự tiện nghi.\n\n## Nghệ thuật cá nhân hóa\nTrang trí bằng những món đồ mang dấu ấn cá nhân giúp không gian trở nên độc đáo. Hãy thử kết hợp tranh nghệ thuật, đồ thủ công hoặc kỷ vật gia đình.\n\n## Không gian xanh trong nhà\nCây xanh tiếp tục là điểm nhấn giúp thanh lọc không khí và tạo cảm giác thư thái. Những góc vườn mini hoặc chậu cây treo mang đến sức sống cho căn nhà.',
    'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'Thi Interior Studio',
    '2024-03-18T08:00:00Z',
    '2024-03-18T08:00:00Z',
    '2024-03-18T08:00:00Z'
  ),
  (
    'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    'Bí quyết chọn sofa phù hợp với từng diện tích phòng khách',
    'bi-quyet-chon-sofa-cho-phong-khach',
    'Sofa là món nội thất trung tâm của phòng khách. Cùng ZShop tìm hiểu cách lựa chọn kích thước, chất liệu và màu sắc phù hợp với diện tích nhà bạn.',
    E'## Đo đạc không gian chính xác\nTrước khi chọn sofa, hãy đo diện tích phòng khách và vị trí đặt sofa để đảm bảo kích thước hài hòa. Đừng quên tính toán lối đi và các khu vực sinh hoạt khác.\n\n## Chọn kiểu dáng theo công năng\nNếu thường xuyên đón khách, sofa chữ L hoặc sofa giường là lựa chọn hợp lý. Với phòng khách nhỏ, sofa hai chỗ kết hợp ghế đôn sẽ tối ưu diện tích.\n\n## Chất liệu và màu sắc\nVải linen, cotton phù hợp với phong cách hiện đại, trong khi da mang lại vẻ sang trọng. Hãy ưu tiên gam màu trung tính và phối với gối tựa nhiều màu sắc.\n\n## Phối hợp với nội thất xung quanh\nSofa cần hài hòa với bàn trà, kệ tivi và đèn chiếu sáng. Đừng quên tạo điểm nhấn bằng thảm trải sàn hoặc tranh treo tường.',
    'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'Thi Interior Studio',
    '2024-03-12T08:00:00Z',
    '2024-03-12T08:00:00Z',
    '2024-03-12T08:00:00Z'
  ),
  (
    'bb20612b-71f0-4a77-91c8-fd0566f6cb99',
    'Tạo góc làm việc tại nhà tối ưu năng suất và cảm hứng',
    'goc-lam-viec-tai-nha-toi-uu',
    'Một góc làm việc khoa học sẽ giúp bạn tập trung và sáng tạo hơn. Tham khảo các gợi ý bố trí nội thất, ánh sáng và màu sắc từ chuyên gia ZShop.',
    E'## Ưu tiên ánh sáng tự nhiên\nĐặt bàn làm việc gần cửa sổ để tận dụng ánh sáng tự nhiên, giúp tinh thần luôn tỉnh táo. Có thể kết hợp rèm mỏng để điều chỉnh ánh sáng.\n\n## Lựa chọn bàn ghế ergonomic\nGhế có khả năng điều chỉnh độ cao và tựa lưng tốt sẽ bảo vệ cột sống. Mặt bàn rộng rãi giúp bạn sắp xếp thiết bị làm việc ngăn nắp.\n\n## Tối giản đồ dùng\nGiữ bề mặt bàn gọn gàng, chỉ để lại các vật dụng thật sự cần thiết. Sử dụng khay đựng tài liệu hoặc kệ treo tường để tiết kiệm diện tích.\n\n## Tạo điểm nhấn trang trí\nCây xanh mini, đèn bàn hoặc tranh trang trí sẽ mang đến nguồn cảm hứng và giảm căng thẳng khi làm việc.',
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
    'Góc làm việc quá đẹp! Mình sẽ áp dụng ý tưởng cây xanh và đèn bàn ngay tuần này.',
    true,
    '2024-03-06T09:15:00Z'
  ),
  (
    '5a3c1b20-79c9-4a8e-9dbf-2f1af7a5c1f2',
    'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    'Hoàng Nam',
    'namhoang@example.com',
    'Bài viết rất hữu ích. Đặc biệt thích phần về vật liệu bền vững vì gia đình mình đang hướng tới lối sống xanh.',
    true,
    '2024-03-18T10:45:00Z'
  ),
  (
    'c41fa61c-7b6a-4e72-8e12-4c0b5df20d35',
    'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    'Thảo Linh',
    'thaolinh@example.com',
    'Nhờ bài viết mà mình biết cách chọn sofa phù hợp với căn hộ nhỏ. Cảm ơn ZShop rất nhiều!',
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
