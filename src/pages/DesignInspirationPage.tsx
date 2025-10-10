import { useEffect, useMemo, useState } from 'react';
import { Filter, Heart, Layers, Loader2, Search, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, getLocalizedValue } from '../utils/i18n';

interface LocalizedText {
  en: string;
  vi: string;
}

interface DesignProduct {
  slug: string;
  price?: number;
  name: LocalizedText;
  currency?: string;
}

interface DesignInspiration {
  id: string;
  slug: string;
  title: LocalizedText;
  style: string;
  room: string;
  budget: string;
  image: string;
  description: LocalizedText;
  currency?: string;
  products: DesignProduct[];
}

interface AvailableProduct {
  id: string;
  slug: string;
  name: string;
  name_i18n?: Record<string, string> | null;
  base_price: number;
  sale_price: number | null;
  images: string[] | null;
}

interface FilterOption {
  value: string;
  label: LocalizedText;
}

interface RawInspirationRow {
  id: string;
  slug?: string | null;
  title: string;
  title_i18n?: Record<string, string> | null;
  description?: string | null;
  description_i18n?: Record<string, string> | null;
  image_url: string;
  style_tags?: string[] | null;
  room_type?: string | null;
  budget?: string | null;
  currency?: string | null;
  product_slugs?: string[] | null;
  product_details?: unknown;
}

interface RawProductDetail {
  slug?: string;
  fallback_name?: Record<string, string> | null;
  fallback_price?: number;
  currency?: string | null;
}

const styleOptions: FilterOption[] = [
  { value: 'all', label: { en: 'All Styles', vi: 'Tất cả phong cách' } },
  { value: 'modern', label: { en: 'Modern', vi: 'Hiện đại' } },
  { value: 'scandinavian', label: { en: 'Scandinavian', vi: 'Scandinavian' } },
  { value: 'industrial', label: { en: 'Industrial', vi: 'Công nghiệp' } },
  { value: 'minimalist', label: { en: 'Minimalist', vi: 'Tối giản' } },
  { value: 'boho', label: { en: 'Boho', vi: 'Boho' } },
  { value: 'seasonal', label: { en: 'Seasonal', vi: 'Theo mùa' } },
];

const roomOptions: FilterOption[] = [
  { value: 'all', label: { en: 'All Rooms', vi: 'Tất cả không gian' } },
  { value: 'living', label: { en: 'Living Room', vi: 'Phòng khách' } },
  { value: 'bedroom', label: { en: 'Bedroom', vi: 'Phòng ngủ' } },
  { value: 'dining', label: { en: 'Dining Room', vi: 'Phòng ăn' } },
  { value: 'office', label: { en: 'Home Office', vi: 'Phòng làm việc tại nhà' } },
  { value: 'outdoor', label: { en: 'Outdoor', vi: 'Ngoài trời' } },
  { value: 'studio', label: { en: 'Small Space', vi: 'Không gian nhỏ' } },
  { value: 'seasonal', label: { en: 'Seasonal Decor', vi: 'Trang trí theo mùa' } },
];

const budgetOptions: FilterOption[] = [
  { value: 'any', label: { en: 'Any Budget', vi: 'Mọi ngân sách' } },
  { value: 'under-2500', label: { en: 'Under $2,500', vi: 'Dưới $2,500' } },
  { value: 'under-3000', label: { en: 'Under $3,000', vi: 'Dưới $3,000' } },
  { value: 'under-3500', label: { en: 'Under $3,500', vi: 'Dưới $3,500' } },
  { value: 'under-4000', label: { en: 'Under $4,000', vi: 'Dưới $4,000' } },
  { value: 'under-4500', label: { en: 'Under $4,500', vi: 'Dưới $4,500' } },
  { value: 'under-5000', label: { en: 'Under $5,000', vi: 'Dưới $5,000' } },
  { value: 'under-6000', label: { en: 'Under $6,000', vi: 'Dưới $6,000' } },
];

const normalizeTextObject = (value?: Record<string, string> | null, fallback?: string): LocalizedText => ({
  en: value?.en ?? fallback ?? '',
  vi: value?.vi ?? value?.en ?? fallback ?? '',
});

export function DesignInspirationPage() {
  const { addToCart } = useCart();
  const { addFavorites, isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const [designIdeas, setDesignIdeas] = useState<DesignInspiration[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('any');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsBySlug, setProductsBySlug] = useState<Record<string, AvailableProduct>>({});
  const [loadingProductSlug, setLoadingProductSlug] = useState<string | null>(null);
  const [loadingDesignId, setLoadingDesignId] = useState<string | null>(null);
  const [savingDesignId, setSavingDesignId] = useState<string | null>(null);
  const [favoriteSlugLoading, setFavoriteSlugLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const pageSizeOptions = [6, 9, 12];

  const metaTitle = translate({ en: 'Design Inspiration', vi: 'Gợi ý thiết kế' });
  const metaDescription = translate({
    en: 'Discover curated design ideas by room, style, and budget with shoppable product lists to recreate the look at home.',
    vi: 'Khám phá những ý tưởng nội thất được tuyển chọn theo phòng, phong cách và ngân sách với danh sách sản phẩm mua sắm dễ dàng.',
  });

  usePageMetadata({ title: metaTitle, description: metaDescription });

  useEffect(() => {
    let isMounted = true;

    const loadInspirations = async () => {
      setLoadingDesigns(true);
      const { data, error } = await supabase
        .from('room_inspirations')
        .select(
          'id, slug, title, title_i18n, description, description_i18n, image_url, style_tags, room_type, budget, currency, product_slugs, product_details'
        )
        .order('created_at', { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to load design inspirations', error);
        toast.error(
          translate({
            en: 'We could not load the design inspirations right now. Please try again later.',
            vi: 'Không thể tải các gợi ý thiết kế. Vui lòng thử lại sau.',
          })
        );
        setDesignIdeas([]);
        setLoadingDesigns(false);
        return;
      }

      const mappedDesigns = (data ?? []).map<DesignInspiration>((row) => {
        const inspiration = row as RawInspirationRow;
        const styleValue = inspiration.style_tags?.[0]?.toLowerCase() ?? 'all';
        const normalizedRoom = inspiration.room_type?.toLowerCase() ?? 'all';
        const normalizedBudget = inspiration.budget ?? 'any';
        const currency = inspiration.currency ?? 'USD';
        const rawDetails = Array.isArray(inspiration.product_details)
          ? (inspiration.product_details as RawProductDetail[])
          : [];
        const detailMap = new Map<string, RawProductDetail>();
        rawDetails.forEach(detail => {
          if (detail?.slug) {
            detailMap.set(detail.slug, detail);
          }
        });
        const uniqueSlugs = Array.from(
          new Set(
            (inspiration.product_slugs ?? rawDetails.map(detail => detail.slug ?? '')).filter(
              (slug): slug is string => Boolean(slug)
            )
          )
        );

        const mappedProducts = uniqueSlugs.map<DesignProduct>((slug) => {
          const detail = detailMap.get(slug);
          const fallbackNameObject = (detail?.fallback_name ?? {}) as Record<string, string>;
          const fallbackNameEn = fallbackNameObject.en ?? fallbackNameObject['en-US'] ?? slug;
          const fallbackNameVi = fallbackNameObject.vi ?? fallbackNameEn;
          return {
            slug,
            price: typeof detail?.fallback_price === 'number' ? detail?.fallback_price : undefined,
            currency: detail?.currency ?? currency,
            name: {
              en: fallbackNameEn,
              vi: fallbackNameVi,
            },
          };
        });

        const title = normalizeTextObject(inspiration.title_i18n, inspiration.title);
        const description = normalizeTextObject(inspiration.description_i18n, inspiration.description ?? inspiration.title);

        return {
          id: inspiration.id,
          slug: inspiration.slug ?? inspiration.id,
          title,
          style: styleValue,
          room: normalizedRoom,
          budget: normalizedBudget,
          image: inspiration.image_url,
          description,
          currency,
          products: mappedProducts,
        };
      });

      setDesignIdeas(mappedDesigns);
      setLoadingDesigns(false);
    };

    void loadInspirations();

    return () => {
      isMounted = false;
    };
  }, [translate]);

  const designProductSlugs = useMemo(
    () => Array.from(new Set(designIdeas.flatMap(design => design.products.map(product => product.slug)))),
    [designIdeas]
  );

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (designProductSlugs.length === 0) {
        setProductsBySlug({});
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, name_i18n, base_price, sale_price, images')
        .in('slug', designProductSlugs);

      if (error) {
        console.error('Failed to load shoppable products', error);
        toast.error(
          translate({
            en: 'We could not load the shoppable products right now. Please try again later.',
            vi: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
          })
        );
        return;
      }

      if (!isMounted) {
        return;
      }

      const mapped = (data ?? []).reduce<Record<string, AvailableProduct>>((accumulator, product) => {
        if (product?.slug && product?.id) {
          accumulator[product.slug] = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            name_i18n: product.name_i18n,
            base_price: product.base_price,
            sale_price: product.sale_price,
            images: product.images,
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
  }, [designProductSlugs, translate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [styleFilter, roomFilter, budgetFilter, searchTerm, pageSize, designIdeas.length]);

  const styleLabelMap = useMemo(
    () => Object.fromEntries(styleOptions.map(option => [option.value, option.label])),
    []
  );
  const roomLabelMap = useMemo(
    () => Object.fromEntries(roomOptions.map(option => [option.value, option.label])),
    []
  );
  const budgetLabelMap = useMemo(
    () => Object.fromEntries(budgetOptions.map(option => [option.value, option.label])),
    []
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredDesigns = useMemo(() => {
    return designIdeas.filter((design) => {
      const matchesStyle = styleFilter === 'all' || design.style === styleFilter;
      const matchesRoom = roomFilter === 'all' || design.room === roomFilter;
      const matchesBudget = budgetFilter === 'any' || design.budget === budgetFilter;

      if (!normalizedSearch) {
        return matchesStyle && matchesRoom && matchesBudget;
      }

      const searchableTexts = [
        design.title.en,
        design.title.vi,
        design.description.en,
        design.description.vi,
        styleLabelMap[design.style]?.en,
        styleLabelMap[design.style]?.vi,
        roomLabelMap[design.room]?.en,
        roomLabelMap[design.room]?.vi,
        budgetLabelMap[design.budget]?.en,
        budgetLabelMap[design.budget]?.vi,
        ...design.products.flatMap(product => [product.name.en, product.name.vi])
      ]
        .filter(Boolean)
        .map(text => text!.toLowerCase());

      const matchesSearch = searchableTexts.some(text => text.includes(normalizedSearch));

      return matchesStyle && matchesRoom && matchesBudget && matchesSearch;
    });
  }, [designIdeas, styleFilter, roomFilter, budgetFilter, normalizedSearch, styleLabelMap, roomLabelMap, budgetLabelMap]);

  const totalPages = Math.max(1, Math.ceil(filteredDesigns.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedDesigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDesigns.slice(start, start + pageSize);
  }, [filteredDesigns, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredDesigns.length);
  const designSummaryText = loadingDesigns
    ? translate({ en: 'Loading curated inspirations...', vi: 'Đang tải các gợi ý thiết kế...' })
    : filteredDesigns.length > 0
        ? translate({
            en: `Showing ${startIndex + 1}-${endIndex} of ${filteredDesigns.length} curated designs`,
            vi: `Hiển thị ${startIndex + 1}-${endIndex} trong ${filteredDesigns.length} ý tưởng đã tuyển chọn`,
          })
        : translate({ en: 'No designs available', vi: 'Không có ý tưởng phù hợp' });

  const ensureAuthenticated = () => {
    if (!user) {
      toast.error(
        translate({ en: 'Please sign in to continue', vi: 'Vui lòng đăng nhập để tiếp tục' })
      );
      return false;
    }
    return true;
  };

  const handleAddProduct = async (design: DesignInspiration, designProduct: DesignProduct) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const product = productsBySlug[designProduct.slug];
    const fallbackName = translate(designProduct.name);

    if (!product) {
      toast.error(
        translate({
          en: `${fallbackName} is currently unavailable.`,
          vi: `${fallbackName} hiện không khả dụng.`,
        })
      );
      return;
    }

    try {
      setLoadingProductSlug(designProduct.slug);
      await addToCart(product.id, 1);
      const localizedName = getLocalizedValue(product.name_i18n, language, product.name);
      toast.success(
        translate({
          en: `Added ${localizedName} to your cart.`,
          vi: `Đã thêm ${localizedName} vào giỏ hàng.`,
        })
      );
    } catch (error) {
      console.error('Failed to add product to cart', error);
      toast.error(
        translate({
          en: 'We were unable to add that item to your cart. Please try again.',
          vi: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
        })
      );
    } finally {
      setLoadingProductSlug(null);
    }
  };

  const handleToggleProductFavorite = async (designProduct: DesignProduct) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const product = productsBySlug[designProduct.slug];
    const fallbackName = translate(designProduct.name);

    if (!product) {
      toast.error(
        translate({
          en: `${fallbackName} is currently unavailable.`,
          vi: `${fallbackName} hiện không khả dụng.`,
        })
      );
      return;
    }

    const localizedName = getLocalizedValue(product.name_i18n, language, product.name);
    const alreadyFavorite = isFavorite(product.id);

    try {
      setFavoriteSlugLoading(designProduct.slug);
      await toggleFavorite(product.id);
      toast.success(
        translate({
          en: alreadyFavorite
            ? `Removed ${localizedName} from your favorites.`
            : `Saved ${localizedName} to your favorites.`,
          vi: alreadyFavorite
            ? `Đã xóa ${localizedName} khỏi danh sách yêu thích.`
            : `Đã lưu ${localizedName} vào danh sách yêu thích.`,
        })
      );
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      toast.error(
        translate({
          en: 'We were unable to update your favorites. Please try again.',
          vi: 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.',
        })
      );
    } finally {
      setFavoriteSlugLoading(null);
    }
  };

  const handleAddDesign = async (design: DesignInspiration) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const missingProducts = design.products.filter(product => !productsBySlug[product.slug]);
    if (missingProducts.length > 0) {
      toast.error(
        translate({
          en: 'Some items in this look are currently unavailable.',
          vi: 'Một vài sản phẩm trong bộ sưu tập hiện chưa sẵn có.',
        })
      );
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
      toast.success(
        translate({
          en: `Added the entire "${design.title.en}" look to your cart.`,
          vi: `Đã thêm trọn bộ "${design.title.vi}" vào giỏ hàng của bạn.`,
        })
      );
    } catch (error) {
      console.error('Failed to add look to cart', error);
      toast.error(
        translate({
          en: 'We were unable to add the full look to your cart. Please try again.',
          vi: 'Không thể thêm trọn bộ vào giỏ hàng. Vui lòng thử lại.',
        })
      );
    } finally {
      setLoadingDesignId(null);
    }
  };

  const handleSaveLook = async (design: DesignInspiration) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const availableProductIds = design.products
      .map(product => productsBySlug[product.slug]?.id)
      .filter((id): id is string => Boolean(id));

    if (availableProductIds.length === 0) {
      toast.error(
        translate({
          en: 'We could not find any items from this look to save.',
          vi: 'Không tìm thấy sản phẩm nào từ bộ sưu tập để lưu.',
        })
      );
      return;
    }

    try {
      setSavingDesignId(design.id);
      await addFavorites(availableProductIds);
      toast.success(
        translate({
          en: 'Saved the entire look to your favorites.',
          vi: 'Đã lưu trọn bộ vào danh sách yêu thích.',
        })
      );
    } catch (error) {
      console.error('Failed to save look to favorites', error);
      toast.error(
        translate({
          en: 'We were unable to save this look. Please try again.',
          vi: 'Không thể lưu bộ sưu tập. Vui lòng thử lại.',
        })
      );
    } finally {
      setSavingDesignId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb
              items={[
                { label: translate({ en: 'Home', vi: 'Trang chủ' }), href: '/' },
                { label: translate({ en: 'Design Inspiration', vi: 'Gợi ý thiết kế' }) }
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
                {translate({ en: 'Design Inspiration', vi: 'Gợi ý thiết kế' })}
              </h1>
              <p className="text-white/80 text-lg">
                {metaDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white border border-neutral-200 shadow-md p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-lg text-neutral-900">
              {translate({ en: 'Filter Ideas', vi: 'Lọc ý tưởng' })}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">
                {translate({ en: 'Style', vi: 'Phong cách' })}
              </label>
              <select
                value={styleFilter}
                onChange={(event) => setStyleFilter(event.target.value)}
                className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">
                {translate({ en: 'Room', vi: 'Không gian' })}
              </label>
              <select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {roomOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">
                {translate({ en: 'Budget', vi: 'Ngân sách' })}
              </label>
              <select
                value={budgetFilter}
                onChange={(event) => setBudgetFilter(event.target.value)}
                className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">
                {translate({ en: 'Search', vi: 'Tìm kiếm' })}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={translate({ en: 'Search by keyword...', vi: 'Tìm theo từ khóa...' })}
                  className="w-full border border-neutral-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-neutral-900">
                {translate({ en: 'Gallery', vi: 'Bộ sưu tập ý tưởng' })}
              </h2>
              <p className="text-sm text-neutral-500">{designSummaryText}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-600" htmlFor="design-page-size">
                {translate({ en: 'Per page', vi: 'Mỗi trang' })}
              </label>
              <select
                id="design-page-size"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingDesigns ? (
            <div className="py-20 flex items-center justify-center gap-3 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>
                {translate({ en: 'Loading inspirations...', vi: 'Đang tải gợi ý thiết kế...' })}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {paginatedDesigns.map((design) => {
              const currency = design.currency ?? 'USD';
              const designTotals = design.products.reduce(
                (accumulator, product) => {
                  const availableProduct = productsBySlug[product.slug];
                  const priceValue =
                    availableProduct?.sale_price ?? availableProduct?.base_price ?? product.price ?? 0;

                  return {
                    total: accumulator.total + priceValue,
                    missing: accumulator.missing + (availableProduct ? 0 : 1),
                  };
                },
                { total: 0, missing: 0 }
              );
              const formattedTotal = formatCurrency(designTotals.total, language, currency);
              const hasUnavailableProducts = designTotals.missing > 0;
              const styleLabel = styleLabelMap[design.style]?.[language] ?? design.style;
              const roomLabel = roomLabelMap[design.room]?.[language] ?? design.room;
              const budgetLabel = budgetLabelMap[design.budget]?.[language] ?? design.budget;

              const isDesignBusy = loadingDesignId === design.id || savingDesignId === design.id;

                return (
                  <article key={design.id} className="overflow-hidden border border-neutral-200 bg-white shadow-lg">
                  <div className="relative">
                    <img src={design.image} alt={design.title[language]} className="h-64 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                          <Layers className="w-4 h-4" /> {styleLabel}
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1">{budgetLabel}</span>
                      </div>
                      <h3 className="font-display text-2xl mt-2">{design.title[language]}</h3>
                      <p className="text-sm text-white/80">{roomLabel}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-neutral-600">{design.description[language]}</p>
                    <div className="border border-neutral-200 p-5 bg-neutral-50">
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-neutral-900">
                            {translate({ en: 'Shop This Look', vi: 'Mua bộ sản phẩm này' })}
                          </h4>
                          <span className="text-sm font-semibold text-brand-600">{formattedTotal}</span>
                        </div>
                        {hasUnavailableProducts && (
                          <p className="text-xs font-medium text-amber-600">
                            {translate({
                              en: 'Some pieces are temporarily unavailable.',
                              vi: 'Một vài sản phẩm tạm thời chưa sẵn có.',
                            })}
                          </p>
                        )}
                      </div>
                      <ul className="space-y-3">
                        {design.products.map((product) => {
                          const availableProduct = productsBySlug[product.slug];
                          const isProductLoading = loadingProductSlug === product.slug || isDesignBusy;
                          const isFavoriteLoading = favoriteSlugLoading === product.slug;
                          const productName = availableProduct
                            ? getLocalizedValue(availableProduct.name_i18n, language, availableProduct.name)
                            : translate(product.name);
                          const productAvailable = Boolean(availableProduct);
                          const productImage = availableProduct?.images?.[0] ?? null;
                          const priceValue =
                            availableProduct?.sale_price ?? availableProduct?.base_price ?? product.price ?? 0;
                          const compareAtPrice =
                            availableProduct &&
                            availableProduct.sale_price &&
                            availableProduct.sale_price < availableProduct.base_price
                              ? availableProduct.base_price
                              : null;
                          const formattedPrice = formatCurrency(priceValue, language, currency);
                          const formattedCompare = compareAtPrice
                            ? formatCurrency(compareAtPrice, language, currency)
                            : null;
                          const isFavorited = availableProduct ? isFavorite(availableProduct.id) : false;

                          return (
                            <li
                              key={product.slug}
                              className="flex gap-3 border border-neutral-200 bg-white/90 p-3 shadow-sm transition hover:border-brand-200"
                            >
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="h-16 w-16 flex-none object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 flex-none items-center justify-center bg-neutral-100 text-neutral-400">
                                  <Layers className="h-5 w-5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  {productAvailable ? (
                                    <Link
                                      to={`/product/${product.slug}`}
                                      className="font-semibold text-neutral-900 transition-colors hover:text-brand-600 line-clamp-2"
                                    >
                                      {productName}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-neutral-500 line-clamp-2">{productName}</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => void handleToggleProductFavorite(product)}
                                    disabled={!productAvailable || isFavoriteLoading}
                                    aria-pressed={productAvailable ? isFavorited : false}
                                    className={`inline-flex h-9 w-9 flex-none items-center justify-center border text-sm transition-colors ${
                                      isFavorited
                                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                                        : 'border-neutral-200 text-neutral-400 hover:border-rose-200 hover:text-rose-500'
                                    } ${(!productAvailable || isFavoriteLoading) ? 'cursor-not-allowed opacity-60' : ''}`}
                                  >
                                    {isFavoriteLoading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Heart className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} />
                                    )}
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-baseline gap-2 text-sm">
                                  <span className="font-semibold text-neutral-900">{formattedPrice}</span>
                                  {formattedCompare && (
                                    <span className="text-xs text-neutral-400 line-through">{formattedCompare}</span>
                                  )}
                                  {!productAvailable && (
                                    <span className="ml-auto inline-flex items-center bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                      {translate({ en: 'Unavailable', vi: 'Tạm hết hàng' })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => void handleAddProduct(design, product)}
                                    disabled={!productAvailable || isProductLoading}
                                    className="inline-flex flex-1 items-center justify-center gap-2 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isProductLoading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> {translate({ en: 'Adding...', vi: 'Đang thêm...' })}
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="h-4 w-4" /> {translate({ en: 'Add to Cart', vi: 'Thêm vào giỏ' })}
                                      </>
                                    )}
                                  </button>
                                  {productAvailable ? (
                                    <Link
                                      to={`/product/${product.slug}`}
                                      className="inline-flex items-center justify-center gap-1 border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:border-brand-200 hover:text-brand-600"
                                    >
                                      {translate({ en: 'View Details', vi: 'Xem chi tiết' })}
                                    </Link>
                                  ) : (
                                    <span className="inline-flex items-center justify-center gap-1 border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-400">
                                      {translate({ en: 'Coming soon', vi: 'Sắp ra mắt' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => void handleAddDesign(design)}
                          disabled={isDesignBusy || loadingProductSlug !== null}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {loadingDesignId === design.id ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" /> {translate({ en: 'Adding Look...', vi: 'Đang thêm bộ sưu tập...' })}
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-5 w-5" /> {translate({ en: 'Add Entire Look to Cart', vi: 'Thêm toàn bộ vào giỏ' })}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => void handleSaveLook(design)}
                          disabled={savingDesignId === design.id || loadingProductSlug !== null}
                          className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-brand-500 bg-white py-3 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {savingDesignId === design.id ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" /> {translate({ en: 'Saving...', vi: 'Đang lưu...' })}
                            </>
                          ) : (
                            <>
                              <Heart className="w-5 h-5" fill="currentColor" /> {translate({ en: 'Save Look to Favorites', vi: 'Lưu bộ sưu tập vào yêu thích' })}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loadingDesigns && filteredDesigns.length === 0 && (
            <div className="text-center py-20 border border-dashed border-neutral-200">
              <p className="text-neutral-500">
                {translate({
                  en: 'No designs match your filters. Try adjusting the criteria.',
                  vi: 'Không có ý tưởng nào phù hợp bộ lọc. Hãy điều chỉnh tiêu chí tìm kiếm.',
                })}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-neutral-600">
                {translate({ en: `Page ${currentPage} of ${totalPages}`, vi: `Trang ${currentPage}/${totalPages}` })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  {translate({ en: 'Previous', vi: 'Trước' })}
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  {translate({ en: 'Next', vi: 'Sau' })}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DesignInspirationPage;
