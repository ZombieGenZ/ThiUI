import { useState, useEffect } from 'react';
import { TrendingUp, SortAsc } from 'lucide-react';
import { toast } from 'react-toastify';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  category_id: string;
  rating: number;
  review_count: number;
  is_new: boolean;
}

export function BestSellersPage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'reviews' | 'rating' | 'price-low' | 'price-high'>('reviews');

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('review_count', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading best sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    await addToCart(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'reviews') {
      return b.review_count - a.review_count;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'price-low') {
      return (a.sale_price || a.base_price) - (b.sale_price || b.base_price);
    } else {
      return (b.sale_price || b.base_price) - (a.sale_price || a.base_price);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div
        className="relative h-[40vh] bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center overflow-hidden"
        data-aos="fade"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Customer Favorites</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Best Sellers
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Our most loved furniture pieces, chosen by customers like you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <p className="text-neutral-600">
              {products.length} best-selling items
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SortAsc className="w-5 h-5 text-neutral-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="reviews">Most Reviews</option>
                <option value="rating">Highest Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-square rounded-lg mb-4" />
                <div className="bg-neutral-200 h-4 rounded mb-2" />
                <div className="bg-neutral-200 h-4 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedProducts.map((product, index) => (
              <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
                <ProductCard product={{
                  ...product,
                  room_type: null,
                  stock_quantity: 0
                }} onAddToCart={() => handleAddToCart(product)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No best sellers available
            </h3>
            <p className="text-neutral-600">
              Check back soon for our top products!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
