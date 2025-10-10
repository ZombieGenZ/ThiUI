import { useEffect, useMemo, useState } from 'react';
import { Filter, Heart, Layers, Loader2, Search } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DesignProduct {
  name: string;
  price: string;
  slug: string;
}

interface DesignInspiration {
  id: string;
  title: string;
  style: string;
  room: string;
  budget: string;
  image: string;
  description: string;
  totalPrice: string;
  products: DesignProduct[];
}

const designIdeas: DesignInspiration[] = [
  {
    id: 'living-modern',
    title: 'Sunlit Modern Lounge',
    style: 'Modern',
    room: 'Living Room Ideas',
    budget: 'Under $5,000',
    image: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'A creamy sectional anchors the lounge with a velvet accent chair, marble coffee table, and warm brass lighting for an inviting modern retreat.',
    totalPrice: '$4,280',
    products: [
      { name: 'Harper Sectional Sofa', price: '$2,150', slug: 'harper-sectional-sofa' },
      { name: 'Marble Orbit Coffee Table', price: '$780', slug: 'marble-orbit-coffee-table' },
      { name: 'Atlas Arc Floor Lamp', price: '$390', slug: 'atlas-arc-floor-lamp' },
      { name: 'Tonal Wool Rug 8x10', price: '$960', slug: 'tonal-wool-rug-8x10' },
    ],
  },
  {
    id: 'bedroom-scandi',
    title: 'Scandinavian Calm Bedroom',
    style: 'Scandinavian',
    room: 'Bedroom Inspiration',
    budget: 'Under $3,000',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Layered oak tones, breathable linen bedding, and airy glass lighting make this bedroom a serene Scandinavian hideaway.',
    totalPrice: '$2,540',
    products: [
      { name: 'Nordic Oak Platform Bed (Queen)', price: '$1,290', slug: 'nordic-oak-platform-bed' },
      { name: 'Linen Bedding Set', price: '$360', slug: 'linen-bedding-set' },
      { name: 'Haze Glass Nightstands (Set of 2)', price: '$540', slug: 'haze-glass-nightstands-set-of-2' },
      { name: 'Softloom Area Rug', price: '$350', slug: 'softloom-area-rug' },
    ],
  },
  {
    id: 'dining-industrial',
    title: 'Industrial Loft Dining',
    style: 'Industrial',
    room: 'Dining Room Designs',
    budget: 'Under $4,000',
    image: 'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'A live-edge dining table, leather and metal seating, and a copper statement chandelier capture an authentic loft mood.',
    totalPrice: '$3,780',
    products: [
      { name: 'Forge Live-Edge Dining Table', price: '$2,150', slug: 'forge-live-edge-dining-table' },
      { name: 'Set of 6 Rivet Leather Chairs', price: '$1,140', slug: 'rivet-leather-dining-chairs-set-of-6' },
      { name: 'Copper Cascade Chandelier', price: '$490', slug: 'copper-cascade-chandelier' },
    ],
  },
  {
    id: 'office-modern',
    title: 'Modern Home Office Suite',
    style: 'Modern',
    room: 'Home Office Setup',
    budget: 'Under $3,500',
    image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'A walnut L-desk, ergonomic seating, and modular storage deliver a streamlined work-from-home command center.',
    totalPrice: '$3,280',
    products: [
      { name: 'Walnut Executive Desk', price: '$1,450', slug: 'walnut-executive-desk' },
      { name: 'ErgoFlex Leather Chair', price: '$620', slug: 'ergoflex-leather-chair' },
      { name: 'Modular Wall Storage', price: '$890', slug: 'modular-wall-storage' },
      { name: 'Linear Task Lighting', price: '$320', slug: 'linear-task-lighting' },
    ],
  },
  {
    id: 'small-space',
    title: 'Compact Studio Haven',
    style: 'Minimalist',
    room: 'Small Space Solutions',
    budget: 'Under $2,500',
    image: 'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Multifunctional pieces like a sleeper sofa, folding dining set, and floating storage keep the studio flexible and clutter-free.',
    totalPrice: '$2,180',
    products: [
      { name: 'Convertible Sofa Bed', price: '$940', slug: 'convertible-sofa-bed' },
      { name: 'Foldaway Dining Set', price: '$520', slug: 'foldaway-dining-set' },
      { name: 'Wall-Mounted Shelving System', price: '$390', slug: 'wall-mounted-shelving-system' },
      { name: 'Soft Glow Pendant', price: '$330', slug: 'soft-glow-pendant' },
    ],
  },
  {
    id: 'outdoor-coastal',
    title: 'Coastal Outdoor Retreat',
    style: 'Boho',
    room: 'Outdoor Patio',
    budget: 'Under $4,500',
    image: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Water-resistant lounge seating, textured outdoor rugs, and woven lanterns bring a breezy coastal vibe outside.',
    totalPrice: '$4,320',
    products: [
      { name: 'Driftwood Outdoor Sofa', price: '$1,980', slug: 'driftwood-outdoor-sofa' },
      { name: 'All-Weather Lounge Chairs (Set of 2)', price: '$1,080', slug: 'all-weather-lounge-chairs-set-of-2' },
      { name: 'Braided Outdoor Rug', price: '$420', slug: 'braided-outdoor-rug' },
      { name: 'Rattan Lantern Trio', price: '$340', slug: 'rattan-lantern-trio' },
      { name: 'Acacia Coffee Table', price: '$500', slug: 'acacia-coffee-table' },
    ],
  },
  {
    id: 'seasonal-decor',
    title: 'Winter Chalet Living',
    style: 'Seasonal',
    room: 'Seasonal Decor',
    budget: 'Under $6,000',
    image: 'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Natural wood, stone accents, and chunky knit layers turn the living space into a cozy alpine escape.',
    totalPrice: '$5,640',
    products: [
      { name: 'Alpine Modular Sofa', price: '$2,480', slug: 'alpine-modular-sofa' },
      { name: 'Stone Hearth Console', price: '$1,120', slug: 'stone-hearth-console' },
      { name: 'Chunky Wool Throws', price: '$420', slug: 'chunky-wool-throws' },
      { name: 'Antler Inspired Chandelier', price: '$1,620', slug: 'antler-inspired-chandelier' },
    ],
  },
];

const designProductSlugs = Array.from(
  new Set(designIdeas.flatMap(design => design.products.map(product => product.slug)))
);

interface AvailableProduct {
  id: string;
  name: string;
}

const styles = ['All Styles', 'Modern', 'Scandinavian', 'Industrial', 'Minimalist', 'Seasonal', 'Boho'];
const rooms = [
  'All Rooms',
  'Living Room Ideas',
  'Bedroom Inspiration',
  'Dining Room Designs',
  'Home Office Setup',
  'Outdoor Patio',
  'Small Space Solutions',
  'Seasonal Decor',
];
const budgets = [
  'Any Budget',
  'Under $2,500',
  'Under $3,000',
  'Under $3,500',
  'Under $4,000',
  'Under $4,500',
  'Under $5,000',
  'Under $6,000',
];

export function DesignInspirationPage() {
  usePageMetadata({
    title: 'Design Inspiration',
    description:
      'Discover curated design ideas by room, style, and budget with shoppable product lists to recreate the look at home.',
  });

  const { addToCart } = useCart();
  const { user } = useAuth();
  const [styleFilter, setStyleFilter] = useState('All Styles');
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [budgetFilter, setBudgetFilter] = useState('Any Budget');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsBySlug, setProductsBySlug] = useState<Record<string, AvailableProduct>>({});
  const [loadingProductSlug, setLoadingProductSlug] = useState<string | null>(null);
  const [loadingDesignId, setLoadingDesignId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (designProductSlugs.length === 0) {
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name')
        .in('slug', designProductSlugs);

      if (error) {
        console.error('Failed to load shoppable products', error);
        toast.error('We could not load the shoppable products right now. Please try again later.');
        return;
      }

      if (!isMounted) {
        return;
      }

      const mapped = (data ?? []).reduce<Record<string, AvailableProduct>>((accumulator, product) => {
        if (product?.slug && product?.id) {
          accumulator[product.slug] = {
            id: product.id,
            name: product.name,
          };
        }
        return accumulator;
      }, {});

      setProductsBySlug(mapped);
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddProduct = async (slug: string, fallbackName: string) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }

    const product = productsBySlug[slug];
    if (!product) {
      toast.error(`${fallbackName} is currently unavailable.`);
      return;
    }

    try {
      setLoadingProductSlug(slug);
      await addToCart(product.id, 1);
      toast.success(`Added ${product.name} to your cart.`);
    } catch (error) {
      console.error('Failed to add product to cart', error);
      toast.error('We were unable to add that item to your cart. Please try again.');
    } finally {
      setLoadingProductSlug(null);
    }
  };

  const handleAddDesign = async (design: DesignInspiration) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }

    const missingProducts = design.products.filter(product => !productsBySlug[product.slug]);
    if (missingProducts.length > 0) {
      toast.error('Some items in this look are currently unavailable.');
      return;
    }

    try {
      setLoadingDesignId(design.id);
      for (const product of design.products) {
        const availableProduct = productsBySlug[product.slug];
        if (availableProduct) {
          await addToCart(availableProduct.id, 1);
        }
      }
      toast.success(`Added the entire ${design.title} look to your cart.`);
    } catch (error) {
      console.error('Failed to add look to cart', error);
      toast.error('We were unable to add the full look to your cart. Please try again.');
    } finally {
      setLoadingDesignId(null);
    }
  };

  const filteredDesigns = useMemo(() => {
    return designIdeas.filter((design) => {
      const matchesStyle = styleFilter === 'All Styles' || design.style === styleFilter;
      const matchesRoom = roomFilter === 'All Rooms' || design.room === roomFilter;
      const matchesBudget = budgetFilter === 'Any Budget' || design.budget === budgetFilter;
      const matchesSearch =
        !searchTerm.trim() ||
        design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStyle && matchesRoom && matchesBudget && matchesSearch;
    });
  }, [styleFilter, roomFilter, budgetFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Design Inspiration' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Design Inspiration</h1>
              <p className="text-white/80 text-lg">
                Explore stylist-curated rooms from ZShop. Filter by style, space, and budget to discover ideas you can bring home.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-lg text-neutral-900">Filter Ideas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Style</label>
              <select
                value={styleFilter}
                onChange={(event) => setStyleFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Room</label>
              <select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Budget</label>
              <select
                value={budgetFilter}
                onChange={(event) => setBudgetFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {budgets.map((budget) => (
                  <option key={budget} value={budget}>
                    {budget}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by keyword..."
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-neutral-900">Gallery</h2>
            <p className="text-sm text-neutral-500">{filteredDesigns.length} designs curated for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDesigns.map((design) => (
              <article key={design.id} className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-lg">
                <div className="relative">
                  <img src={design.image} alt={design.title} className="h-64 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                        <Layers className="w-4 h-4" /> {design.style}
                      </span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{design.budget}</span>
                    </div>
                    <h3 className="font-display text-2xl mt-2">{design.title}</h3>
                    <p className="text-sm text-white/80">{design.room}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-600">{design.description}</p>
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-neutral-900">Shop This Look</h4>
                      <span className="text-sm font-semibold text-brand-600">{design.totalPrice}</span>
                    </div>
                    <ul className="space-y-3">
                      {design.products.map((product) => {
                        const isProductLoading = loadingProductSlug === product.slug || loadingDesignId === design.id;
                        return (
                          <li
                            key={product.slug}
                            className="flex flex-col gap-2 rounded-xl border border-transparent bg-white/70 px-3 py-3 text-sm transition-colors hover:border-brand-200"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-neutral-900">{product.name}</span>
                              <span className="text-neutral-500">{product.price}</span>
                            </div>
                            <button
                              onClick={() => void handleAddProduct(product.slug, product.name)}
                              disabled={isProductLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isProductLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                                </>
                              ) : (
                                'Add to Cart'
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => void handleAddDesign(design)}
                      disabled={loadingDesignId === design.id || loadingProductSlug !== null}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingDesignId === design.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Adding Look...
                        </>
                      ) : (
                        'Add Entire Look to Cart'
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Save to favorites</span>
                    <button className="inline-flex items-center gap-1 text-brand-600 font-semibold text-xs">
                      <Heart className="w-3.5 h-3.5" /> Save Look
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredDesigns.length === 0 && (
            <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl">
              <p className="text-neutral-500">No designs match your filters. Try adjusting the criteria.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DesignInspirationPage;
