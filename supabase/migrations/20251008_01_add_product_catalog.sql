/*
  # Add Comprehensive Product Catalog

  ## Overview
  This migration adds a diverse catalog of furniture products across all room categories,
  ensuring at least 10 products per category (Living Room, Bedroom, Dining, Office, Outdoor).

  ## New Products Added

  ### Living Room (12 products)
  - Modern sectional sofas, accent chairs, coffee tables, media consoles
  - Contemporary and classic styles with various price points
  - Products include: Modern L-Shape Sectional, Velvet Accent Chair, Marble Coffee Table, etc.

  ### Bedroom (12 products)
  - Platform beds, dressers, nightstands, wardrobes
  - Various sizes from twin to king
  - Products include: King Platform Bed, Modern Dresser, Upholstered Bed Frame, etc.

  ### Dining (10 products)
  - Dining tables, chairs, bar stools, buffets
  - Different seating capacities and styles
  - Products include: Solid Wood Dining Table, Velvet Dining Chairs, Modern Bar Stools, etc.

  ### Office (10 products)
  - Executive desks, ergonomic chairs, bookcases, filing cabinets
  - Home and professional office furniture
  - Products include: Executive Desk, Ergonomic Office Chair, Modern Bookcase, etc.

  ### Outdoor (10 products)
  - Patio sets, lounge chairs, dining sets, umbrellas
  - Weather-resistant materials
  - Products include: Outdoor Patio Set, Wicker Lounge Chair, Teak Dining Set, etc.

  ## Product Features
  - All products have realistic pricing between $89-$2,999
  - High-quality stock images from Pexels
  - Detailed descriptions and specifications
  - Stock quantities between 15-50 units
  - Rating system (4.0-5.0 stars) with review counts
  - Mix of featured and new arrival products
  - Some products with sale prices (15-25% off)

  ## Total Products Added: 54

  This ensures a rich, diverse catalog that provides customers with many options
  in each furniture category.
*/

-- Insert Living Room Products
INSERT INTO products (
  name,
  slug,
  description,
  base_price,
  sale_price,
  images,
  category_id,
  room_type,
  stock_quantity,
  status,
  is_featured,
  is_new,
  rating,
  review_count,
  sku
)
SELECT
  name,
  slug,
  description,
  base_price,
  sale_price,
  images,
  (SELECT id FROM categories WHERE categories.name = category_name LIMIT 1),
  room_type,
  stock_quantity,
  CASE WHEN stock_quantity > 0 THEN 'active' ELSE 'out_of_stock' END,
  is_featured,
  is_new,
  rating,
  review_count,
  'SKU-' || UPPER(SUBSTRING(MD5(slug) FROM 1 FOR 8))
FROM (VALUES
  -- Living Room Products
  ('Modern L-Shape Sectional', 'modern-l-shape-sectional', 'Spacious L-shaped sectional sofa with premium fabric upholstery and deep cushioning. Perfect for large living rooms.', 1899.00, 1599.00, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 25, true, true, 4.8, 156),
  ('Velvet Accent Chair', 'velvet-accent-chair', 'Luxurious velvet accent chair with gold metal legs. Adds elegance to any room.', 449.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 40, true, false, 4.6, 89),
  ('Marble Coffee Table', 'marble-coffee-table', 'Contemporary coffee table with genuine marble top and brushed brass base.', 799.00, 679.00, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 30, false, true, 4.7, 124),
  ('Modern Media Console', 'modern-media-console', '72-inch media console with ample storage and cable management system.', 599.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 35, false, false, 4.5, 67),
  ('Mid-Century Sofa', 'mid-century-sofa', 'Classic mid-century modern sofa with tufted cushions and tapered wooden legs.', 1299.00, 1099.00, ARRAY['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'], 'Living Room', 'Living Room', 20, true, false, 4.9, 203),
  ('Leather Recliner', 'leather-recliner', 'Genuine leather recliner with power headrest and USB charging ports.', 1199.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 15, false, true, 4.7, 91),
  ('Glass Side Table', 'glass-side-table', 'Sleek tempered glass side table with chrome frame. Perfect for small spaces.', 199.00, 169.00, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 50, false, false, 4.4, 45),
  ('Ottoman Storage Bench', 'ottoman-storage-bench', 'Multifunctional ottoman with hidden storage and tufted top cushion.', 299.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 45, false, true, 4.6, 78),
  ('Floor Lamp Modern', 'floor-lamp-modern', 'Arched floor lamp with marble base and adjustable shade.', 349.00, 299.00, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 40, false, false, 4.5, 56),
  ('Bookshelf Display Unit', 'bookshelf-display-unit', 'Open concept bookshelf with 5 tiers and industrial metal frame.', 499.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 30, false, false, 4.6, 72),
  ('Throw Pillow Set', 'throw-pillow-set', 'Set of 4 decorative throw pillows with removable covers in neutral tones.', 89.00, 74.00, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 100, false, true, 4.3, 234),
  ('Area Rug Contemporary', 'area-rug-contemporary', '8x10 contemporary area rug with abstract pattern and stain-resistant fibers.', 599.00, NULL, ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'Living Room', 'Living Room', 25, false, false, 4.7, 112),

  -- Bedroom Products
  ('King Platform Bed', 'king-platform-bed', 'Modern king-size platform bed with upholstered headboard and storage drawers.', 1299.00, 1099.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 20, true, true, 4.8, 167),
  ('Modern Dresser 6-Drawer', 'modern-dresser-6-drawer', 'Contemporary 6-drawer dresser with soft-close drawers and gold hardware.', 799.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 30, false, false, 4.6, 93),
  ('Upholstered Bed Frame Queen', 'upholstered-bed-frame-queen', 'Elegant queen bed frame with button-tufted headboard and linen fabric.', 899.00, 749.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 25, true, false, 4.7, 145),
  ('Nightstand Set of 2', 'nightstand-set-of-2', 'Matching nightstand set with 2 drawers each and USB charging ports.', 399.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 35, false, true, 4.5, 82),
  ('Wardrobe Armoire', 'wardrobe-armoire', 'Spacious wardrobe with hanging rod, shelves, and mirrored door.', 1099.00, 929.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 15, false, false, 4.6, 71),
  ('Vanity Table Set', 'vanity-table-set', 'Elegant vanity table with lighted mirror and cushioned stool.', 549.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 20, false, true, 4.7, 98),
  ('Memory Foam Mattress Queen', 'memory-foam-mattress-queen', 'Premium queen memory foam mattress with cooling gel layer.', 899.00, 749.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 40, true, false, 4.9, 289),
  ('Bedroom Bench Storage', 'bedroom-bench-storage', 'Upholstered storage bench perfect for foot of bed with lift-top design.', 299.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 30, false, false, 4.4, 56),
  ('Full Length Mirror', 'full-length-mirror', 'Standing full-length mirror with adjustable tilt and wooden frame.', 199.00, 169.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 45, false, true, 4.5, 124),
  ('Bedside Table Lamp Pair', 'bedside-table-lamp-pair', 'Set of 2 modern bedside lamps with fabric shades and touch control.', 129.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 50, false, false, 4.6, 187),
  ('Bedroom Area Rug', 'bedroom-area-rug', 'Soft plush area rug in neutral color, perfect for bedroom comfort.', 299.00, 254.00, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 35, false, false, 4.5, 76),
  ('Chest of Drawers Tall', 'chest-of-drawers-tall', '5-drawer tall chest with modern design and ample storage space.', 649.00, NULL, ARRAY['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'], 'Bedroom', 'Bedroom', 25, false, true, 4.7, 89),

  -- Dining Products
  ('Solid Wood Dining Table', 'solid-wood-dining-table', 'Handcrafted solid wood dining table seats 6-8 people comfortably.', 1299.00, 1099.00, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 20, true, true, 4.8, 142),
  ('Velvet Dining Chairs Set of 4', 'velvet-dining-chairs-set-4', 'Luxurious velvet dining chairs with gold legs, set of 4.', 799.00, NULL, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 30, false, false, 4.6, 87),
  ('Modern Bar Stools Set', 'modern-bar-stools-set', 'Set of 2 adjustable bar stools with swivel and back support.', 299.00, 254.00, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 40, false, true, 4.5, 93),
  ('Buffet Cabinet', 'buffet-cabinet', 'Elegant buffet cabinet with glass doors and wine rack storage.', 899.00, NULL, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 15, false, false, 4.7, 64),
  ('Round Dining Table Glass', 'round-dining-table-glass', 'Modern round glass dining table with chrome pedestal base.', 799.00, 679.00, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 25, true, false, 4.6, 76),
  ('Dining Bench Upholstered', 'dining-bench-upholstered', 'Padded dining bench seats 3 people, perfect for family dining.', 399.00, NULL, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 30, false, true, 4.4, 52),
  ('China Cabinet Display', 'china-cabinet-display', 'Traditional china cabinet with lighted interior and glass shelves.', 1199.00, 1019.00, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 12, false, false, 4.8, 43),
  ('Bar Cart Modern', 'bar-cart-modern', 'Rolling bar cart with gold finish and glass shelves for entertaining.', 249.00, NULL, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 35, false, true, 4.5, 68),
  ('Counter Height Table Set', 'counter-height-table-set', 'Pub-style counter height table with 4 matching stools.', 999.00, 849.00, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 18, false, false, 4.6, 81),
  ('Dining Room Chandelier', 'dining-room-chandelier', 'Statement chandelier with crystal accents and dimmable LED lights.', 449.00, NULL, ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'], 'Dining', 'Dining', 25, false, false, 4.7, 95),

  -- Office Products
  ('Executive Office Desk', 'executive-office-desk', 'Large executive desk with leather top and built-in file drawers.', 1499.00, 1274.00, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 15, true, true, 4.8, 128),
  ('Ergonomic Office Chair', 'ergonomic-office-chair', 'Premium ergonomic chair with lumbar support and adjustable armrests.', 599.00, NULL, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 40, true, false, 4.9, 312),
  ('Modern Bookcase 5-Shelf', 'modern-bookcase-5-shelf', 'Open bookcase with 5 shelves perfect for office organization.', 399.00, 339.00, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 30, false, true, 4.5, 87),
  ('Standing Desk Adjustable', 'standing-desk-adjustable', 'Electric standing desk with memory presets and cable management.', 799.00, NULL, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 25, false, false, 4.7, 156),
  ('Filing Cabinet 3-Drawer', 'filing-cabinet-3-drawer', 'Metal filing cabinet with lock and smooth glide rails.', 299.00, 254.00, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 35, false, true, 4.4, 62),
  ('Computer Desk L-Shape', 'computer-desk-l-shape', 'Spacious L-shaped desk perfect for home office setup.', 549.00, NULL, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 20, false, false, 4.6, 94),
  ('Task Chair Mesh', 'task-chair-mesh', 'Breathable mesh task chair with swivel and tilt mechanism.', 249.00, 211.00, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 45, false, true, 4.5, 178),
  ('Desk Lamp LED', 'desk-lamp-led', 'Modern LED desk lamp with touch control and USB charging port.', 79.00, NULL, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 50, false, false, 4.6, 234),
  ('Monitor Stand Dual', 'monitor-stand-dual', 'Dual monitor stand with adjustable height and cable organizer.', 199.00, 169.00, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 40, false, true, 4.7, 142),
  ('Office Storage Cabinet', 'office-storage-cabinet', 'Tall storage cabinet with doors and adjustable shelves.', 449.00, NULL, ARRAY['https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'], 'Office', 'Office', 25, false, false, 4.5, 73),

  -- Outdoor Products
  ('Outdoor Patio Set 5-Piece', 'outdoor-patio-set-5-piece', 'Weather-resistant 5-piece patio set with table and 4 chairs.', 899.00, 764.00, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 20, true, true, 4.7, 118),
  ('Wicker Lounge Chair', 'wicker-lounge-chair', 'Comfortable wicker lounge chair with weather-resistant cushions.', 449.00, NULL, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 30, false, false, 4.6, 87),
  ('Teak Dining Set', 'teak-dining-set', 'Premium teak wood outdoor dining set seats 6, built to last.', 1899.00, 1614.00, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 12, true, false, 4.8, 92),
  ('Patio Umbrella Large', 'patio-umbrella-large', '10-foot cantilever patio umbrella with UV protection and crank lift.', 399.00, NULL, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 25, false, true, 4.5, 73),
  ('Adirondack Chair Set', 'adirondack-chair-set', 'Classic Adirondack chairs set of 2, made from recycled plastic.', 299.00, 254.00, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 35, false, false, 4.6, 124),
  ('Fire Pit Table', 'fire-pit-table', 'Propane fire pit table with glass beads and storage cover.', 799.00, NULL, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 15, false, true, 4.7, 86),
  ('Outdoor Sectional Sofa', 'outdoor-sectional-sofa', 'Modular outdoor sectional with waterproof cushions and storage.', 1599.00, 1359.00, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 18, false, false, 4.8, 67),
  ('Garden Bench Metal', 'garden-bench-metal', 'Decorative metal garden bench with scrollwork design.', 249.00, NULL, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 30, false, true, 4.4, 58),
  ('Hammock with Stand', 'hammock-with-stand', 'Double hammock with weather-resistant stand and carrying case.', 299.00, 254.00, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 25, false, false, 4.6, 142),
  ('Outdoor Storage Box', 'outdoor-storage-box', 'Waterproof deck storage box with 120-gallon capacity.', 199.00, NULL, ARRAY['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'], 'Outdoor', 'Outdoor', 40, false, true, 4.5, 96)
) AS data(name, slug, description, base_price, sale_price, images, category_name, room_type, stock_quantity, is_featured, is_new, rating, review_count)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE products.slug = data.slug
);