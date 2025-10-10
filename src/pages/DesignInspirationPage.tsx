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
  price: number;
  name: LocalizedText;
  currency?: string;
}

interface DesignInspiration {
  id: string;
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

const designIdeas: DesignInspiration[] = [
  {
    id: 'living-modern',
    title: { en: 'Sunlit Modern Lounge', vi: 'Phòng khách hiện đại ngập nắng' },
    style: 'modern',
    room: 'living',
    budget: 'under-5000',
    image: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'A creamy sectional anchors the lounge with a velvet accent chair, marble coffee table, and warm brass lighting for an inviting modern retreat.',
      vi: 'Ghế sofa chữ L màu kem kết hợp ghế nhung, bàn cà phê mặt đá và đèn đồng ấm áp tạo nên không gian tiếp khách hiện đại, thư thái.',
    },
    products: [
      { slug: 'harper-sectional-sofa', price: 2150, name: { en: 'Harper Sectional Sofa', vi: 'Sofa góc Harper' } },
      { slug: 'marble-orbit-coffee-table', price: 780, name: { en: 'Marble Orbit Coffee Table', vi: 'Bàn cà phê Marble Orbit' } },
      { slug: 'atlas-arc-floor-lamp', price: 390, name: { en: 'Atlas Arc Floor Lamp', vi: 'Đèn sàn Atlas Arc' } },
      { slug: 'tonal-wool-rug-8x10', price: 960, name: { en: 'Tonal Wool Rug 8x10', vi: 'Thảm len Tonal 8x10' } },
    ],
  },
  {
    id: 'bedroom-scandi',
    title: { en: 'Scandinavian Calm Bedroom', vi: 'Phòng ngủ phong cách Bắc Âu' },
    style: 'scandinavian',
    room: 'bedroom',
    budget: 'under-3000',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'Layered oak tones, breathable linen bedding, and airy glass lighting make this bedroom a serene Scandinavian hideaway.',
      vi: 'Sắc gỗ sồi, chăn ga vải lanh thoáng mát và đèn thủy tinh nhẹ nhàng mang đến phòng ngủ Bắc Âu yên bình.',
    },
    products: [
      { slug: 'nordic-oak-platform-bed', price: 1290, name: { en: 'Nordic Oak Platform Bed (Queen)', vi: 'Giường bệt gỗ sồi Nordic (Queen)' } },
      { slug: 'linen-bedding-set', price: 360, name: { en: 'Linen Bedding Set', vi: 'Bộ ga giường vải lanh' } },
      { slug: 'haze-glass-nightstands-set-of-2', price: 540, name: { en: 'Haze Glass Nightstands (Set of 2)', vi: 'Tab đầu giường kính Haze (Bộ 2 chiếc)' } },
      { slug: 'softloom-area-rug', price: 350, name: { en: 'Softloom Area Rug', vi: 'Thảm Softloom' } },
    ],
  },
  {
    id: 'dining-industrial',
    title: { en: 'Industrial Loft Dining', vi: 'Phòng ăn phong cách loft công nghiệp' },
    style: 'industrial',
    room: 'dining',
    budget: 'under-4000',
    image: 'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'A live-edge dining table, leather and metal seating, and a copper statement chandelier capture an authentic loft mood.',
      vi: 'Bàn ăn gỗ nguyên tấm, ghế da kết hợp kim loại và đèn chùm đồng tạo nên sắc thái loft đậm chất công nghiệp.',
    },
    products: [
      { slug: 'forge-live-edge-dining-table', price: 2150, name: { en: 'Forge Live-Edge Dining Table', vi: 'Bàn ăn Forge mép tự nhiên' } },
      { slug: 'rivet-leather-dining-chairs-set-of-6', price: 1140, name: { en: 'Set of 6 Rivet Leather Chairs', vi: 'Bộ 6 ghế da Rivet' } },
      { slug: 'copper-cascade-chandelier', price: 490, name: { en: 'Copper Cascade Chandelier', vi: 'Đèn chùm Copper Cascade' } },
    ],
  },
  {
    id: 'office-modern',
    title: { en: 'Modern Home Office Suite', vi: 'Góc làm việc hiện đại tại nhà' },
    style: 'modern',
    room: 'office',
    budget: 'under-3500',
    image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'A walnut L-desk, ergonomic seating, and modular storage deliver a streamlined work-from-home command center.',
      vi: 'Bàn chữ L gỗ óc chó, ghế công thái học và tủ lưu trữ mô-đun tạo nên trung tâm làm việc tại nhà gọn gàng.',
    },
    products: [
      { slug: 'walnut-executive-desk', price: 1450, name: { en: 'Walnut Executive Desk', vi: 'Bàn làm việc gỗ óc chó' } },
      { slug: 'ergoflex-leather-chair', price: 620, name: { en: 'ErgoFlex Leather Chair', vi: 'Ghế da ErgoFlex' } },
      { slug: 'modular-wall-storage', price: 890, name: { en: 'Modular Wall Storage', vi: 'Tủ lưu trữ treo tường mô-đun' } },
      { slug: 'linear-task-lighting', price: 320, name: { en: 'Linear Task Lighting', vi: 'Đèn làm việc Linear' } },
    ],
  },
  {
    id: 'small-space',
    title: { en: 'Compact Studio Haven', vi: 'Căn hộ studio tiện nghi' },
    style: 'minimalist',
    room: 'studio',
    budget: 'under-2500',
    image: 'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'Multifunctional pieces keep the studio flexible and clutter-free, from a sleeper sofa to folding dining set.',
      vi: 'Nội thất đa năng giúp căn studio linh hoạt và gọn gàng, từ sofa giường đến bộ bàn ăn gấp gọn.',
    },
    products: [
      { slug: 'convertible-sofa-bed', price: 940, name: { en: 'Convertible Sofa Bed', vi: 'Sofa giường đa năng' } },
      { slug: 'foldaway-dining-set', price: 520, name: { en: 'Foldaway Dining Set', vi: 'Bộ bàn ăn gấp gọn' } },
      { slug: 'wall-mounted-shelving-system', price: 390, name: { en: 'Wall-Mounted Shelving System', vi: 'Kệ treo tường đa năng' } },
      { slug: 'soft-glow-pendant', price: 330, name: { en: 'Soft Glow Pendant', vi: 'Đèn thả Soft Glow' } },
    ],
  },
  {
    id: 'outdoor-coastal',
    title: { en: 'Coastal Outdoor Retreat', vi: 'Góc thư giãn ngoài trời phong cách biển' },
    style: 'boho',
    room: 'outdoor',
    budget: 'under-4500',
    image: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'Water-resistant lounge seating, textured rugs, and woven lanterns bring a breezy coastal vibe outside.',
      vi: 'Ghế lounge chống thấm, thảm dệt và lồng đèn mây mang hơi thở biển cả ra không gian ngoài trời.',
    },
    products: [
      { slug: 'driftwood-outdoor-sofa', price: 1980, name: { en: 'Driftwood Outdoor Sofa', vi: 'Sofa ngoài trời Driftwood' } },
      { slug: 'all-weather-lounge-chairs-set-of-2', price: 1080, name: { en: 'All-Weather Lounge Chairs (Set of 2)', vi: 'Bộ 2 ghế lounge mọi thời tiết' } },
      { slug: 'braided-outdoor-rug', price: 420, name: { en: 'Braided Outdoor Rug', vi: 'Thảm ngoài trời Braided' } },
      { slug: 'rattan-lantern-trio', price: 340, name: { en: 'Rattan Lantern Trio', vi: 'Bộ ba đèn mây' } },
      { slug: 'acacia-coffee-table', price: 500, name: { en: 'Acacia Coffee Table', vi: 'Bàn cà phê gỗ keo' } },
    ],
  },
  {
    id: 'seasonal-decor',
    title: { en: 'Winter Chalet Living', vi: 'Phòng khách phong cách chalet mùa đông' },
    style: 'seasonal',
    room: 'seasonal',
    budget: 'under-6000',
    image: 'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: {
      en: 'Natural wood, stone accents, and chunky knit layers turn the living space into a cozy alpine escape.',
      vi: 'Gỗ tự nhiên, điểm nhấn đá và các lớp len dày mang đến cảm giác ấm cúng như nghỉ dưỡng trên núi.',
    },
    products: [
      { slug: 'alpine-modular-sofa', price: 2480, name: { en: 'Alpine Modular Sofa', vi: 'Sofa mô-đun Alpine' } },
      { slug: 'stone-hearth-console', price: 1120, name: { en: 'Stone Hearth Console', vi: 'Kệ trang trí Stone Hearth' } },
      { slug: 'chunky-wool-throws', price: 420, name: { en: 'Chunky Wool Throws', vi: 'Chăn len Chunky' } },
      { slug: 'antler-inspired-chandelier', price: 1620, name: { en: 'Antler Inspired Chandelier', vi: 'Đèn chùm lấy cảm hứng từ gạc nai' } },
    ],
  },
];

const designProductSlugs = Array.from(new Set(designIdeas.flatMap(design => design.products.map(product => product.slug))));

export function DesignInspirationPage() {
  const { addToCart } = useCart();
  const { addFavorites, isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { language, translate } = useLanguage();
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

    const loadProducts = async () => {
      if (designProductSlugs.length === 0) {
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
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [styleFilter, roomFilter, budgetFilter, searchTerm, pageSize]);

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
  }, [styleFilter, roomFilter, budgetFilter, normalizedSearch, styleLabelMap, roomLabelMap, budgetLabelMap]);

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
  const designSummaryText =
    filteredDesigns.length > 0
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
        <section className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 md:p-8">
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
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedDesigns.map((design) => {
              const currency = design.currency ?? 'USD';
              const designTotals = design.products.reduce(
                (accumulator, product) => {
                  const availableProduct = productsBySlug[product.slug];
                  const priceValue =
                    availableProduct?.sale_price ?? availableProduct?.base_price ?? product.price;

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
                <article key={design.id} className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-lg">
                  <div className="relative">
                    <img src={design.image} alt={design.title[language]} className="h-64 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                          <Layers className="w-4 h-4" /> {styleLabel}
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{budgetLabel}</span>
                      </div>
                      <h3 className="font-display text-2xl mt-2">{design.title[language]}</h3>
                      <p className="text-sm text-white/80">{roomLabel}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-neutral-600">{design.description[language]}</p>
                    <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
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
                            availableProduct?.sale_price ?? availableProduct?.base_price ?? product.price;
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
                              className="flex gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm transition hover:border-brand-200"
                            >
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="h-16 w-16 flex-none rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
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
                                    className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm transition-colors ${
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
                                    <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                      {translate({ en: 'Unavailable', vi: 'Tạm hết hàng' })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => void handleAddProduct(design, product)}
                                    disabled={!productAvailable || isProductLoading}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
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
                                      className="inline-flex items-center justify-center gap-1 rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:border-brand-200 hover:text-brand-600"
                                    >
                                      {translate({ en: 'View Details', vi: 'Xem chi tiết' })}
                                    </Link>
                                  ) : (
                                    <span className="inline-flex items-center justify-center gap-1 rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-400">
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
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
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
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-500 bg-white py-3 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70"
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

          {filteredDesigns.length === 0 && (
            <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl">
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
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
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
                        className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
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
