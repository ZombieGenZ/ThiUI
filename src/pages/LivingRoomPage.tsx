import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { createAddToCartHandler } from '../utils/cartHelpers';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedValue } from '../utils/i18n';

interface Product {
  id: string;
  name: string;
  name_i18n?: Record<string, string> | null;
  slug: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  room_type: string | null;
}

export function LivingRoomPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const handleAddToCart = useMemo(
    () => createAddToCartHandler(addToCart, user, navigate, { translate }),
    [addToCart, user, navigate, translate]
  );

  const sortOptions = [
    { value: 'featured', label: { en: 'Featured', vi: 'Nổi bật' } },
    { value: 'newest', label: { en: 'Newest', vi: 'Mới nhất' } },
    { value: 'price-low', label: { en: 'Price: Low to High', vi: 'Giá: Từ thấp đến cao' } },
    { value: 'price-high', label: { en: 'Price: High to Low', vi: 'Giá: Từ cao đến thấp' } },
  ];

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
      .eq('room_type', 'Living Room')
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
    <div className="min-h-screen bg-neutral-50">
      <div
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-5xl text-white mb-4">
              {translate({ en: 'Living Room', vi: 'Phòng khách' })}
            </h1>
            <p className="text-xl text-white/90">
              {translate({ en: 'Comfort meets style', vi: 'Thoải mái hòa quyện phong cách' })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-neutral-600">
            {translate({
              en: `Showing ${filteredProducts.length} products`,
              vi: `Hiển thị ${filteredProducts.length} sản phẩm`,
            })}
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard
                product={product}
                onAddToCart={() =>
                  handleAddToCart(
                    product.id,
                    getLocalizedValue(product.name_i18n, language, product.name),
                    1
                  )
                }
              />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-600">
              {translate({ en: 'No products found', vi: 'Không tìm thấy sản phẩm' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
