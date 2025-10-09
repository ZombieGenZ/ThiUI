import { useState, useEffect } from 'react';
import { Tag, Filter, SortAsc } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';

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

export function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'discount' | 'price-low' | 'price-high'>('discount');

  useEffect(() => {
    loadSaleProducts();
  }, []);

  const loadSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('sale_price', 'is', null)
        .eq('status', 'active');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'discount') {
      const discountA = a.sale_price ? ((a.base_price - a.sale_price) / a.base_price) * 100 : 0;
      const discountB = b.sale_price ? ((b.base_price - b.sale_price) / b.base_price) * 100 : 0;
      return discountB - discountA;
    } else if (sortBy === 'price-low') {
      return (a.sale_price || a.base_price) - (b.sale_price || b.base_price);
    } else {
      return (b.sale_price || b.base_price) - (a.sale_price || a.base_price);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div
        className="relative h-[40vh] bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center overflow-hidden"
        data-aos="fade"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Tag className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Special Offers</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Sale & Clearance
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Save up to 50% on selected furniture pieces
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <p className="text-neutral-600">
              {products.length} items on sale
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SortAsc className="w-5 h-5 text-neutral-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="discount">Highest Discount</option>
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
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No items on sale right now
            </h3>
            <p className="text-neutral-600">
              Check back soon for amazing deals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
