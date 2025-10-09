import { useEffect, useState } from 'react';
import { Star, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createAddToCartHandler } from '../utils/cartHelpers';

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

export function OutdoorPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const handleAddToCart = createAddToCartHandler(addToCart, user, navigate);

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
      .eq('room_type', 'Outdoor')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
  };

  const sortProducts = () => {
    let sorted = [...products];

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
        break;
      case 'newest':
        sorted.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-5xl text-white mb-4">Outdoor</h1>
            <p className="text-xl text-white/90">Enjoy the outdoors in comfort</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> products
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} onAddToCart={() => handleAddToCart(product.id, product.name, 1)} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.is_new && (
          <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            NEW
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
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
          <span className="font-bold text-lg">${price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">${product.base_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
