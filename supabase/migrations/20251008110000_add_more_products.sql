/*
  # Add More Product Samples

  1. Purpose
    - Add comprehensive product catalog across all categories
    - Include variety of styles, price points, and room types
    - Populate database with realistic product data

  2. Categories Covered
    - Living Room (sofas, coffee tables, TV stands, armchairs)
    - Bedroom (beds, dressers, nightstands, wardrobes)
    - Dining (dining tables, dining chairs, bar stools)
    - Office (desks, office chairs, bookcases, filing cabinets)
    - Outdoor (patio sets, loungers, planters, outdoor sofas)

  3. Product Details
    - Realistic pricing and sale prices
    - High-quality stock photos from Pexels
    - Detailed descriptions and specifications
    - Proper inventory management
*/

-- Living Room Products
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
], 4.8, 156, false, 'Living Room', '{"width": "75cm", "height": "82cm", "depth": "80cm"}', ARRAY['Fabric', 'Beech Wood'], 18, 'LR-CHR-004', 35, 'Scandinavian');

-- Bedroom Products
INSERT INTO products (name, slug, description, base_price, sale_price, images, rating, review_count, is_new, room_type, dimensions, materials, weight, sku, stock_quantity, style) VALUES
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

('Luxury Walk-In Wardrobe', 'luxury-walk-in-wardrobe', 'Spacious modular wardrobe system with sliding mirrored doors and customizable interior organization.', 3499.99, 2999.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg'
], 4.8, 87, true, 'Bedroom', '{"width": "300cm", "height": "240cm", "depth": "65cm"}', ARRAY['Mirrored Glass', 'Laminated Board', 'Aluminum Frame'], 180, 'BR-WRD-004', 8, 'Luxury');

-- Dining Room Products
INSERT INTO products (name, slug, description, base_price, sale_price, images, rating, review_count, is_new, room_type, dimensions, materials, weight, sku, stock_quantity, style) VALUES
('Extendable Dining Table', 'extendable-dining-table', 'Elegant dining table that extends from 6 to 10 seats. Features solid oak construction with natural finish.', 1799.99, 1499.99, ARRAY[
  'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.9, 167, false, 'Dining', '{"width": "180-280cm", "height": "76cm", "depth": "100cm"}', ARRAY['Solid Oak', 'Metal Extension Mechanism'], 85, 'DN-TBL-001', 14, 'Traditional'),

('Upholstered Dining Chairs Set', 'upholstered-dining-chairs-set', 'Set of 4 comfortable dining chairs with padded seats and elegant curved backs. Neutral fabric complements any decor.', 899.99, 699.99, ARRAY[
  'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
  'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg'
], 4.6, 132, true, 'Dining', '{"width": "48cm", "height": "95cm", "depth": "55cm"}', ARRAY['Linen Fabric', 'Rubberwood'], 12, 'DN-CHR-002', 25, 'Contemporary'),

('Industrial Bar Stool Set', 'industrial-bar-stool-set', 'Set of 2 adjustable height bar stools with footrest and swivel seat. Perfect for kitchen islands or home bars.', 399.99, 299.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg'
], 4.5, 98, false, 'Dining', '{"width": "40cm", "height": "75-95cm", "depth": "40cm"}', ARRAY['Metal Frame', 'Faux Leather'], 8, 'DN-STL-003', 40, 'Industrial'),

('Marble Top Dining Set', 'marble-top-dining-set', 'Luxurious 6-seater dining set with genuine marble tabletop and velvet upholstered chairs with gold accents.', 3299.99, null, ARRAY[
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
  'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg'
], 4.8, 76, true, 'Dining', '{"width": "200cm", "height": "76cm", "depth": "100cm"}', ARRAY['Marble', 'Velvet', 'Gold-Plated Metal'], 120, 'DN-SET-004', 6, 'Luxury');

-- Office Products
INSERT INTO products (name, slug, description, base_price, sale_price, images, rating, review_count, is_new, room_type, dimensions, materials, weight, sku, stock_quantity, style) VALUES
('Executive L-Shaped Desk', 'executive-l-shaped-desk', 'Spacious corner desk with cable management, keyboard tray, and file cabinet. Ideal for home office productivity.', 1299.99, 999.99, ARRAY[
  'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.7, 189, false, 'Office', '{"width": "180cm", "height": "75cm", "depth": "140cm"}', ARRAY['Engineered Wood', 'Metal Frame'], 65, 'OF-DSK-001', 20, 'Executive'),

('Ergonomic Office Chair', 'ergonomic-office-chair', 'Premium mesh back chair with lumbar support, adjustable armrests, and headrest. Built for all-day comfort.', 699.99, 549.99, ARRAY[
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.9, 312, true, 'Office', '{"width": "65cm", "height": "120cm", "depth": "65cm"}', ARRAY['Breathable Mesh', 'Steel Frame', 'PU Leather'], 22, 'OF-CHR-002', 35, 'Ergonomic'),

('Industrial Bookcase Unit', 'industrial-bookcase-unit', 'Five-tier open bookshelf with metal frame and wood shelves. Perfect for displaying books, plants, and decor.', 599.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg'
], 4.6, 143, false, 'Office', '{"width": "100cm", "height": "180cm", "depth": "35cm"}', ARRAY['Pine Wood', 'Metal'], 38, 'OF-BKC-003', 28, 'Industrial'),

('Modern Filing Cabinet', 'modern-filing-cabinet', 'Three-drawer lateral filing cabinet with lock. Sleek design fits under most desks for space-saving storage.', 399.99, 329.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg'
], 4.5, 87, true, 'Office', '{"width": "50cm", "height": "65cm", "depth": "50cm"}', ARRAY['Steel', 'Powder Coating'], 28, 'OF-FIL-004', 32, 'Modern');

-- Outdoor Products
INSERT INTO products (name, slug, description, base_price, sale_price, images, rating, review_count, is_new, room_type, dimensions, materials, weight, sku, stock_quantity, style) VALUES
('Rattan Patio Dining Set', 'rattan-patio-dining-set', 'Weather-resistant 6-piece outdoor dining set with glass top table and comfortable cushioned chairs.', 1899.99, 1599.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.7, 134, false, 'Outdoor', '{"width": "150cm", "height": "75cm", "depth": "90cm"}', ARRAY['PE Rattan', 'Aluminum Frame', 'Tempered Glass'], 55, 'OD-SET-001', 16, 'Contemporary'),

('Teak Lounger with Cushion', 'teak-lounger-with-cushion', 'Premium outdoor chaise lounge with adjustable backrest and weather-resistant cushion. Perfect for poolside relaxation.', 799.99, 649.99, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.8, 98, true, 'Outdoor', '{"width": "200cm", "height": "35cm", "depth": "70cm"}', ARRAY['Teak Wood', 'Sunbrella Fabric'], 25, 'OD-LNG-002', 22, 'Tropical'),

('Large Ceramic Planter Set', 'large-ceramic-planter-set', 'Set of 3 decorative outdoor planters in graduated sizes. Frost-resistant ceramic with drainage holes.', 299.99, null, ARRAY[
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg'
], 4.6, 167, false, 'Outdoor', '{"width": "30-50cm", "height": "35-60cm", "depth": "30-50cm"}', ARRAY['Glazed Ceramic'], 15, 'OD-PLT-003', 40, 'Modern'),

('Modular Outdoor Sectional', 'modular-outdoor-sectional', 'Versatile 5-piece sectional sofa set with weather-resistant cushions. Rearrange to fit any patio layout.', 2499.99, 1999.99, ARRAY[
  'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
], 4.9, 145, true, 'Outdoor', '{"width": "280cm", "height": "75cm", "depth": "180cm"}', ARRAY['All-Weather Wicker', 'Powder-Coated Aluminum', 'Olefin Fabric'], 85, 'OD-SEC-004', 10, 'Modern');
