import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'vi';

type TranslationDictionary = Record<string, Record<Language, string>>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  translate: (values: Partial<Record<Language, string>> | null | undefined, fallback?: string) => string;
}

const STORAGE_KEY = 'thiui.language';

const defaultDictionary: TranslationDictionary = {
  'app.loading': {
    en: 'Loading',
    vi: 'Đang tải'
  },
  'common.home': {
    en: 'Home',
    vi: 'Trang chủ'
  },
  'common.products': {
    en: 'Products',
    vi: 'Sản phẩm'
  },
  'common.blog': {
    en: 'Blog & News',
    vi: 'Tin tức & Blog'
  },
  'common.about': {
    en: 'About Us',
    vi: 'Giới thiệu'
  },
  'common.contact': {
    en: 'Contact',
    vi: 'Liên hệ'
  },
  'common.bestSellers': {
    en: 'Best Sellers',
    vi: 'Bán chạy'
  },
  'common.sale': {
    en: 'Sale',
    vi: 'Khuyến mãi'
  },
  'common.services': {
    en: 'Services',
    vi: 'Dịch vụ'
  },
  'common.resources': {
    en: 'Resources',
    vi: 'Tài nguyên'
  },
  'common.designInspiration': {
    en: 'Design Inspiration',
    vi: 'Gợi ý thiết kế'
  },
  'common.assemblyServices': {
    en: 'Assembly Services',
    vi: 'Dịch vụ lắp đặt'
  },
  'common.designServices': {
    en: 'Design Services',
    vi: 'Dịch vụ thiết kế'
  },
  'common.virtualShowroom': {
    en: 'Virtual Showroom',
    vi: 'Phòng trưng bày ảo'
  },
  'common.shippingReturns': {
    en: 'Shipping & Returns',
    vi: 'Vận chuyển & đổi trả'
  },
  'common.trackOrder': {
    en: 'Track Order',
    vi: 'Theo dõi đơn hàng'
  },
  'common.faq': {
    en: 'FAQ',
    vi: 'Câu hỏi thường gặp'
  },
  'common.sizeGuide': {
    en: 'Size Guide',
    vi: 'Hướng dẫn kích thước'
  },
  'common.search': {
    en: 'Search',
    vi: 'Tìm kiếm'
  },
  'common.filters': {
    en: 'Filters',
    vi: 'Bộ lọc'
  },
  'common.clearAll': {
    en: 'Clear All',
    vi: 'Xóa tất cả'
  },
  'common.addToCart': {
    en: 'Add to Cart',
    vi: 'Thêm vào giỏ'
  },
  'common.addEntireLook': {
    en: 'Add Entire Look to Cart',
    vi: 'Thêm toàn bộ vào giỏ'
  },
  'common.addLookToFavorites': {
    en: 'Save Look to Favorites',
    vi: 'Lưu bộ sưu tập vào yêu thích'
  },
  'common.readArticle': {
    en: 'Read article',
    vi: 'Đọc bài viết'
  },
  'common.darkMode': {
    en: 'Dark mode',
    vi: 'Chế độ tối'
  },
  'common.lightMode': {
    en: 'Light mode',
    vi: 'Chế độ sáng'
  },
  'common.language': {
    en: 'Language',
    vi: 'Ngôn ngữ'
  },
  'common.english': {
    en: 'English',
    vi: 'Tiếng Anh'
  },
  'common.vietnamese': {
    en: 'Vietnamese',
    vi: 'Tiếng Việt'
  },
  'products.title': {
    en: 'Our Products',
    vi: 'Bộ sưu tập sản phẩm'
  },
  'products.subtitle': {
    en: 'Discover our full collection of premium furniture',
    vi: 'Khám phá trọn bộ nội thất cao cấp của chúng tôi'
  },
  'products.filters.category': {
    en: 'Category',
    vi: 'Danh mục'
  },
  'products.filters.priceRange': {
    en: 'Price range',
    vi: 'Khoảng giá'
  },
  'products.filters.styles': {
    en: 'Styles',
    vi: 'Phong cách'
  },
  'products.filters.rating': {
    en: 'Minimum rating',
    vi: 'Đánh giá tối thiểu'
  },
  'products.viewMode.grid': {
    en: 'Grid view',
    vi: 'Xem dạng lưới'
  },
  'products.viewMode.list': {
    en: 'List view',
    vi: 'Xem dạng danh sách'
  },
  'products.sortBy': {
    en: 'Sort by',
    vi: 'Sắp xếp'
  },
  'products.pagination.previous': {
    en: 'Previous',
    vi: 'Trước'
  },
  'products.pagination.next': {
    en: 'Next',
    vi: 'Sau'
  },
  'products.pagination.page': {
    en: 'Page',
    vi: 'Trang'
  },
  'products.pagination.perPage': {
    en: 'per page',
    vi: 'mỗi trang'
  },
  'designInspiration.title': {
    en: 'Design Inspiration',
    vi: 'Gợi ý thiết kế'
  },
  'designInspiration.description': {
    en: 'Discover curated design ideas by room, style, and budget with shoppable product lists to recreate the look at home.',
    vi: 'Khám phá những ý tưởng nội thất được tuyển chọn theo phòng, phong cách và ngân sách với danh sách sản phẩm để mua sắm dễ dàng.'
  },
  'designInspiration.filters.style': {
    en: 'Style',
    vi: 'Phong cách'
  },
  'designInspiration.filters.room': {
    en: 'Room',
    vi: 'Không gian'
  },
  'designInspiration.filters.budget': {
    en: 'Budget',
    vi: 'Ngân sách'
  },
  'designInspiration.filters.search': {
    en: 'Search',
    vi: 'Tìm kiếm'
  },
  'designInspiration.gallery': {
    en: 'Gallery',
    vi: 'Bộ sưu tập ý tưởng'
  },
  'designInspiration.shopLook': {
    en: 'Shop This Look',
    vi: 'Mua bộ sản phẩm này'
  },
  'designInspiration.addLook': {
    en: 'Add Look to Cart',
    vi: 'Thêm toàn bộ vào giỏ'
  },
  'designInspiration.saveLook': {
    en: 'Save Look',
    vi: 'Lưu bộ sưu tập'
  },
  'designInspiration.totalLooks': {
    en: 'designs curated for you',
    vi: 'bộ ý tưởng dành cho bạn'
  },
  'header.quickSearch': {
    en: 'Quick:',
    vi: 'Tìm nhanh:'
  },
  'header.hot': {
    en: 'Hot',
    vi: 'Nổi bật'
  },
  'header.myAccount': {
    en: 'My Account',
    vi: 'Tài khoản của tôi'
  },
  'header.favorites': {
    en: 'Favorites',
    vi: 'Yêu thích'
  },
  'header.myOrders': {
    en: 'My Orders',
    vi: 'Đơn hàng của tôi'
  },
  'header.signOut': {
    en: 'Sign Out',
    vi: 'Đăng xuất'
  },
  'header.signIn': {
    en: 'Sign In',
    vi: 'Đăng nhập'
  },
  'header.signUp': {
    en: 'Sign Up',
    vi: 'Đăng ký'
  },
  'header.quickTerm.sofa': {
    en: 'Sofa',
    vi: 'Ghế sofa'
  },
  'header.quickTerm.bed': {
    en: 'Bed',
    vi: 'Giường'
  },
  'header.quickTerm.table': {
    en: 'Table',
    vi: 'Bàn'
  },
  'header.quickTerm.chair': {
    en: 'Chair',
    vi: 'Ghế'
  },
  'header.quickTerm.outdoor': {
    en: 'Outdoor',
    vi: 'Ngoài trời'
  },
  'blog.heroTitle': {
    en: 'Interior inspiration & brand stories',
    vi: 'Cảm hứng nội thất & câu chuyện thương hiệu'
  },
  'blog.heroFallback': {
    en: 'Stay up to date with stories, trends, and inspiration to elevate your home.',
    vi: 'Cập nhật câu chuyện, xu hướng và cảm hứng mới để nâng tầm ngôi nhà của bạn.'
  },
  'blog.latestPosts': {
    en: 'Latest Posts',
    vi: 'Bài viết mới'
  },
  'blog.noPosts': {
    en: 'No posts yet',
    vi: 'Chưa có bài viết'
  },
  'blog.noPostsDescription': {
    en: 'We are curating standout stories for you. Please check back soon!',
    vi: 'Chúng tôi đang tuyển chọn những câu chuyện nổi bật dành cho bạn. Hãy quay lại sau nhé!'
  },
  'admin.analytics.title': {
    en: 'Analytics & reporting',
    vi: 'Thống kê & báo cáo'
  },
  'admin.analytics.subtitle': {
    en: 'Track performance over time and export professional reports instantly.',
    vi: 'Theo dõi hiệu suất theo thời gian và xuất báo cáo chuyên nghiệp ngay lập tức.'
  },
  'admin.analytics.primary': {
    en: 'Primary range',
    vi: 'Khoảng thời gian'
  },
  'admin.analytics.compare': {
    en: 'Comparison',
    vi: 'So sánh'
  },
  'admin.analytics.enableCompare': {
    en: 'Enable comparison',
    vi: 'Bật so sánh'
  },
  'admin.analytics.compareHint': {
    en: 'Select to compare against a different range.',
    vi: 'Chọn để so sánh với một khoảng thời gian khác.'
  },
  'admin.analytics.day': {
    en: 'Day',
    vi: 'Ngày'
  },
  'admin.analytics.month': {
    en: 'Month',
    vi: 'Tháng'
  },
  'admin.analytics.year': {
    en: 'Year',
    vi: 'Năm'
  },
  'admin.analytics.today': {
    en: 'Latest',
    vi: 'Mới nhất'
  },
  'admin.analytics.totalRevenue': {
    en: 'Total revenue',
    vi: 'Tổng doanh thu'
  },
  'admin.analytics.totalOrders': {
    en: 'Total orders',
    vi: 'Số lượng đơn hàng'
  },
  'admin.analytics.completed': {
    en: 'Completed',
    vi: 'Hoàn thành'
  },
  'admin.analytics.processing': {
    en: 'Processing',
    vi: 'Đang xử lý'
  },
  'admin.analytics.cancelled': {
    en: 'Cancelled',
    vi: 'Đã hủy'
  },
  'admin.analytics.newCustomers': {
    en: 'New customers',
    vi: 'Khách hàng mới'
  },
  'admin.analytics.averageOrderValue': {
    en: 'Average order value',
    vi: 'Giá trị đơn hàng TB'
  },
  'admin.analytics.revenueTrendTitle': {
    en: 'Revenue over time',
    vi: 'Doanh thu theo thời gian'
  },
  'admin.analytics.revenueTrendSubtitle': {
    en: 'Monitor revenue and orders for the selected period.',
    vi: 'Theo dõi doanh thu và đơn hàng trong giai đoạn đã chọn.'
  },
  'admin.analytics.statusBreakdownTitle': {
    en: 'Order status breakdown',
    vi: 'Trạng thái đơn hàng'
  },
  'admin.analytics.statusBreakdownSubtitle': {
    en: 'Distribution of orders by fulfillment status.',
    vi: 'Tỷ trọng đơn hàng theo trạng thái xử lý.'
  },
  'admin.analytics.bestSellers': {
    en: 'Top selling products',
    vi: 'Sản phẩm bán chạy'
  },
  'admin.analytics.noBestSellers': {
    en: 'No sales data available yet',
    vi: 'Chưa có dữ liệu bán hàng'
  },
  'admin.analytics.unitsSold': {
    en: 'Units sold',
    vi: 'Số lượng bán'
  },
  'admin.analytics.contentUpdates': {
    en: 'Content activity',
    vi: 'Hoạt động nội dung'
  },
  'admin.analytics.blogPosts': {
    en: 'New blog posts',
    vi: 'Bài viết mới'
  },
  'admin.analytics.contactMessages': {
    en: 'New contact messages',
    vi: 'Liên hệ mới'
  },
  'admin.analytics.designRequests': {
    en: 'Design requests',
    vi: 'Yêu cầu thiết kế'
  },
  'admin.analytics.careerApplications': {
    en: 'New applications',
    vi: 'Ứng tuyển mới'
  },
  'admin.analytics.comparisonSummary': {
    en: 'Quick comparison',
    vi: 'So sánh nhanh'
  }
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) as Language | null;
    if (stored === 'en' || stored === 'vi') {
      return stored;
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const dictionary = useMemo(() => defaultDictionary, []);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'vi' : 'en'));
  };

  const t = (key: string, fallback?: string) => {
    const entry = dictionary[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    if (entry && entry.en) {
      return entry.en;
    }
    return fallback ?? key;
  };

  const translate = (values: Partial<Record<Language, string>> | null | undefined, fallback?: string) => {
    if (!values) {
      return fallback ?? '';
    }
    const candidate = values[language];
    if (candidate && candidate.trim()) {
      return candidate;
    }
    if (language === 'vi' && values.en) {
      return values.en;
    }
    if (language === 'en' && values.vi) {
      return values.vi;
    }
    return fallback ?? values.en ?? values.vi ?? '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
