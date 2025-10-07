import { useEffect, useState } from 'react';
import { Star, SlidersHorizontal, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  room_type: string | null;
}

export function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('discount');
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    sortProducts();
  }, [sortBy, products]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .not('sale_price', 'is', null)
      .order('created_at', { ascending: false });

    if (data) {
      const onSale = data.filter((p) => p.sale_price && p.sale_price < p.base_price);
      setProducts(onSale);
      setFilteredProducts(onSale);
    }
  };

  const sortProducts = () => {
    let sorted = [...products];

    switch (sortBy) {
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = ((a.base_price - (a.sale_price || a.base_price)) / a.base_price) * 100;
          const discountB = ((b.base_price - (b.sale_price || b.base_price)) / b.base_price) * 100;
          return discountB - discountA;
        });
        break;
      case 'price-low':
        sorted.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Flame className="w-12 h-12 text-white animate-pulse" />
              <h1 className="font-serif text-5xl text-white">Sale</h1>
              <Flame className="w-12 h-12 text-white animate-pulse" />
            </div>
            <p className="text-xl text-white/90">Up to 50% off on selected items</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> products on sale
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} onAddToCart={() => addToCart(product.id, 1)} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products on sale at the moment</p>
            <a href="/" className="mt-4 inline-block text-red-600 font-semibold hover:underline">
              Browse all products
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const price = product.sale_price || product.base_price;
  const discountPercent = Math.round(((product.base_price - price) / product.base_price) * 100);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-red-500">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          -{discountPercent}%
        </div>
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <button
          onClick={onAddToCart}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          Add to Cart
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        {product.rating > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600">({product.review_count})</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-red-600">${price.toFixed(2)}</span>
          <span className="text-sm text-gray-500 line-through">${product.base_price.toFixed(2)}</span>
          <span className="text-xs font-semibold text-red-600">Save ${(product.base_price - price).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
