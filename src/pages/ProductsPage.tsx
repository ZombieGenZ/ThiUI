import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, Grid3x3, List, X, Star, Check } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createAddToCartHandler } from '../utils/cartHelpers';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedValue } from '../utils/i18n';
import { normalizeImageUrl } from '../utils/imageHelpers';

interface Product {
  id: string;
  name: string;
  name_i18n?: Record<string, string> | null;
  slug: string;
  description?: string | null;
  base_price: number;
  sale_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  room_type: string | null;
  stock_quantity: number;
  in_stock: boolean;
  description_i18n?: Record<string, string> | null;
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const searchQuery = searchParams.get('search') || '';
  const { language, t, translate } = useLanguage();
  const handleAddToCart = useMemo(
    () => createAddToCartHandler(addToCart, user, navigate, { translate }),
    [addToCart, user, navigate, translate]
  );

  const categoryLabels: Record<string, { en: string; vi: string }> = {
    'Living Room': { en: 'Living Room', vi: 'Phòng khách' },
    Bedroom: { en: 'Bedroom', vi: 'Phòng ngủ' },
    Dining: { en: 'Dining', vi: 'Phòng ăn' },
    Office: { en: 'Office', vi: 'Văn phòng' },
    Outdoor: { en: 'Outdoor', vi: 'Ngoài trời' },
  };

  const sortOptions = [
    { value: 'featured', label: { en: 'Featured', vi: 'Nổi bật' } },
    { value: 'newest', label: { en: 'Newest', vi: 'Mới nhất' } },
    { value: 'price-low', label: { en: 'Price: Low to High', vi: 'Giá: Từ thấp đến cao' } },
    { value: 'price-high', label: { en: 'Price: High to Low', vi: 'Giá: Từ cao đến thấp' } },
    { value: 'name', label: { en: 'Name: A to Z', vi: 'Tên: A đến Z' } },
  ];

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, priceRange, selectedStyles, minRating, searchQuery]);

  const productSummaryText =
    filteredProducts.length > 0
      ? translate({
          en: `${filteredProducts.length} products found`,
          vi: `${filteredProducts.length} sản phẩm được tìm thấy`,
        })
      : translate({ en: 'No products available', vi: 'Không có sản phẩm' });

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 5000]);
    setSelectedStyles([]);
    setMinRating(null);
    setSortBy('featured');
  };

  const activeFilterCount = [
    selectedCategory !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== 5000,
    selectedStyles.length > 0,
    minRating !== null
  ].filter(Boolean).length;

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const normalized = data.map((product) => ({
        ...product,
        rating: Number(product.rating ?? 0),
        images: (product.images || []).map((image) => normalizeImageUrl(image)),
      })) as Product[];
      setProducts(normalized);
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .is('parent_id', null)
      .order('display_order');

    if (data) {
      setCategories(data.map(cat => cat.name));
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const nameEn = (p.name_i18n?.en ?? p.name ?? '').toLowerCase();
        const nameVi = (p.name_i18n?.vi ?? '').toLowerCase();
        const descEn = (p.description_i18n?.en ?? p.description ?? '').toLowerCase();
        const descVi = (p.description_i18n?.vi ?? '').toLowerCase();
        const room = p.room_type?.toLowerCase() ?? '';

        return (
          nameEn.includes(query) ||
          nameVi.includes(query) ||
          descEn.includes(query) ||
          descVi.includes(query) ||
          room.includes(query)
        );
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.room_type === selectedCategory);
    }

    if (selectedStyles.length > 0) {
      filtered = filtered.filter(p => selectedStyles.includes(p.room_type || ''));
    }

    if (minRating !== null) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    filtered = filtered.filter(p => {
      const price = p.sale_price || p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-6xl text-white mb-4 font-bold">{t('products.title')}</h1>
            <p className="text-xl text-white/90 mb-6">{t('products.subtitle')}</p>
            {searchQuery && (
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                <span>{translate({ en: 'Searching for:', vi: 'Đang tìm:' })}</span>
                <span className="font-semibold">{searchQuery}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-between bg-white rounded-xl shadow-soft p-4 font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>{t('common.filters')}</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-brand-600 text-white text-xs px-2 py-1 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <X className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-0' : 'rotate-45'}`} />
              </button>

              <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-soft p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">{t('common.filters')}</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {t('common.clearAll')}
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
                    <span>{t('products.filters.category')}</span>
                    {selectedCategory !== 'all' && (
                      <button onClick={() => setSelectedCategory('all')} className="text-xs text-brand-600">
                        {translate({ en: 'Reset', vi: 'Thiết lập lại' })}
                      </button>
                    )}
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                        selectedCategory === 'all'
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="font-medium">{translate({ en: 'All Products', vi: 'Tất cả sản phẩm' })}</span>
                      {selectedCategory === 'all' && <Check className="w-4 h-4" />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                          selectedCategory === cat
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span className="font-medium">{categoryLabels[cat]?.[language] ?? cat}</span>
                        {selectedCategory === cat && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
                    <span>{t('products.filters.priceRange')}</span>
                    {(priceRange[0] !== 0 || priceRange[1] !== 5000) && (
                      <button onClick={() => setPriceRange([0, 5000])} className="text-xs text-brand-600">
                        {translate({ en: 'Reset', vi: 'Thiết lập lại' })}
                      </button>
                    )}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-200">
                      <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-semibold">${priceRange[0]}</span>
                      </div>
                      <span className="text-neutral-400">-</span>
                      <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-semibold">${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
                    <span>{t('products.filters.rating')}</span>
                    {minRating !== null && (
                      <button onClick={() => setMinRating(null)} className="text-xs text-brand-600">
                        {translate({ en: 'Reset', vi: 'Thiết lập lại' })}
                      </button>
                    )}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={minRating ?? 1}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                      aria-label="Minimum rating"
                    />
                    <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium">
                        {minRating !== null
                          ? translate({
                              en: `${minRating} star${minRating > 1 ? 's' : ''} & up`,
                              vi: `${minRating} sao trở lên`,
                            })
                          : translate({ en: 'All ratings', vi: 'Tất cả đánh giá' })}
                      </span>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < (minRating ?? 0) ? 'fill-current text-brand-600' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <p className="text-neutral-600 dark:text-neutral-300">{productSummaryText}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-brand-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    aria-label={t('products.viewMode.grid')}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-brand-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    aria-label={t('products.viewMode.list')}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 text-neutral-700 dark:text-neutral-100"
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

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {filteredProducts.map((product, index) => {
                const displayName = getLocalizedValue(product.name_i18n, language, product.name);
                return (
                  <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
                    <ProductCard product={product} onAddToCart={() => handleAddToCart(product.id, displayName, 1)} />
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-4">
                  {translate({ en: 'No products found', vi: 'Không tìm thấy sản phẩm' })}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 5000]);
                    setMinRating(null);
                  }}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  {t('common.clearAll')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
