import type { Database } from '../lib/supabase';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export const blogPostsFallback: BlogPost[] = [
  {
    id: 'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    title: '5 Interior Design Trends Defining Modern Living in 2024',
    slug: '5-interior-design-trends-2024',
    excerpt:
      'Discover the leading interior trends of 2024 to refresh your home with minimalist, sustainable, and highly curated touches.',
    content:
      '## Minimalism with warmth\nThe minimalist look remains popular for the calm and clarity it brings. Work with a neutral palette and layer natural textures to keep the space welcoming.\n\n## Planet-friendly materials\nSustainability is now a priority. Reclaimed woods, FSC-certified timber, and organic fabrics are top picks that balance style with responsibility.\n\n## Smart technology at home\nConnected lighting, automated shades, and multifunctional furnishings create a seamless living experience. Integrate smart features where they make daily routines easier.\n\n## Personalized styling\nDisplay art, handmade pieces, and meaningful keepsakes to give every room character. A few personal accents instantly make a space feel one-of-a-kind.\n\n## Indoor greenery\nPlants continue to shine as natural mood boosters. Cluster mini planters or hang cascading greenery to purify the air and energize the room.',
    featured_image_url: 'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-18T08:00:00Z',
    created_at: '2024-03-18T08:00:00Z',
    updated_at: '2024-03-18T08:00:00Z',
  },
  {
    id: 'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    title: 'How to Choose the Right Sofa for Every Living Room Size',
    slug: 'how-to-choose-the-right-sofa',
    excerpt:
      'The sofa is the heart of the living room. Learn how to pick the ideal dimensions, materials, and colors for your space.',
    content:
      '## Measure with intention\nBefore you shop, map out the room and note doorways, walkways, and other furniture placements to confirm the sofa will fit comfortably.\n\n## Match the shape to your lifestyle\nIf you host often, consider an L-shaped sectional or sleeper sofa. For compact apartments, a two-seater paired with an ottoman keeps things flexible.\n\n## Focus on fabric and color\nPerformance linen and cotton blend well with modern styles, while leather introduces polish. Stick with timeless neutrals and layer in colorful pillows for personality.\n\n## Coordinate with the rest of the room\nBalance the sofa with the coffee table, media console, and lighting. Finish the look with an area rug or wall art that ties the palette together.',
    featured_image_url: 'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-12T08:00:00Z',
    created_at: '2024-03-12T08:00:00Z',
    updated_at: '2024-03-12T08:00:00Z',
  },
  {
    id: 'bb20612b-71f0-4a77-91c8-fd0566f6cb99',
    title: 'Design a Home Office That Boosts Productivity and Creativity',
    slug: 'design-a-productive-home-office',
    excerpt:
      'A thoughtful workspace keeps you focused and inspired. Explore layout, lighting, and styling ideas from the ZShop team.',
    content:
      '## Embrace natural light\nPosition your desk near a window to soak up daylight and stay energized. Layer sheer curtains or blinds so you can control glare during video calls.\n\n## Invest in ergonomic furniture\nChoose a chair with proper lumbar support and a height-adjustable seat. A spacious desktop keeps monitors, keyboards, and notebooks organized.\n\n## Keep clutter in check\nEdit your work surface regularly and rely on trays, shelves, or wall-mounted organizers to store paperwork. A tidy setup makes it easier to focus.\n\n## Add inspiring accents\nGreenery, sculptural lamps, or framed prints introduce texture and creativity. Rotate a few accessories seasonally to keep the space feeling fresh.',
    featured_image_url: 'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-05T08:00:00Z',
    created_at: '2024-03-05T08:00:00Z',
    updated_at: '2024-03-05T08:00:00Z',
  },
];
