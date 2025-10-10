import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, toggleLanguage, t, translate } = useLanguage();

  const productCategories = [
    { label: { en: 'All Products', vi: 'Tất cả sản phẩm' }, path: '/products' },
    { label: { en: 'Living Room', vi: 'Phòng khách' }, path: '/shop/living' },
    { label: { en: 'Bedroom', vi: 'Phòng ngủ' }, path: '/shop/bedroom' },
    { label: { en: 'Dining', vi: 'Phòng ăn' }, path: '/shop/dining' },
    { label: { en: 'Office', vi: 'Văn phòng' }, path: '/shop/office' },
    { label: { en: 'Outdoor', vi: 'Ngoài trời' }, path: '/shop/outdoor' },
  ];

  const serviceLinks = [
    { label: { en: 'Assembly Services', vi: 'Dịch vụ lắp đặt' }, path: '/assembly-services' },
    { label: { en: 'Design Services', vi: 'Dịch vụ thiết kế' }, path: '/design-services' },
    { label: { en: 'Virtual Showroom', vi: 'Phòng trưng bày ảo' }, path: '/virtual-showroom' },
  ];

  const resourceLinks = [
    { label: { en: 'Blog & News', vi: 'Tin tức & Blog' }, path: '/blog' },
    { label: { en: 'Shipping & Returns', vi: 'Vận chuyển & đổi trả' }, path: '/shipping-returns' },
    { label: { en: 'Track Order', vi: 'Theo dõi đơn hàng' }, path: '/track-order' },
    { label: { en: 'FAQ', vi: 'Câu hỏi thường gặp' }, path: '/faq' },
    { label: { en: 'Size Guide', vi: 'Hướng dẫn kích thước' }, path: '/size-guide' },
    { label: { en: 'Design Inspiration', vi: 'Gợi ý thiết kế' }, path: '/design-inspiration' },
  ];

  const quickSearchTerms = [
    { id: 'sofa', labelKey: 'header.quickTerm.sofa', query: { en: 'Sofa', vi: 'ghế sofa' } },
    { id: 'bed', labelKey: 'header.quickTerm.bed', query: { en: 'Bed', vi: 'giường' } },
    { id: 'table', labelKey: 'header.quickTerm.table', query: { en: 'Table', vi: 'bàn' } },
    { id: 'chair', labelKey: 'header.quickTerm.chair', query: { en: 'Chair', vi: 'ghế' } },
    { id: 'outdoor', labelKey: 'header.quickTerm.outdoor', query: { en: 'Outdoor', vi: 'ngoài trời' } },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg border-b border-neutral-200/50 dark:border-neutral-700/50 transition-all duration-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg smooth-transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 dark:text-gray-200" /> : <Menu className="w-6 h-6 dark:text-gray-200" />}
            </button>

            <div className="flex-1 lg:flex-initial">
              <Link to="/" className="font-display text-2xl lg:text-3xl tracking-wide font-bold smooth-transition hover-scale">
                <span className="text-brand-600">Furni</span><span className="text-neutral-900 dark:text-white">Craft</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                to="/"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {t('common.home')}
              </Link>

              <div className="relative group">
                <button className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 flex items-center space-x-1">
                  <span>{t('common.products')}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-gray-100 dark:border-neutral-700">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.path}
                      to={cat.path}
                      className="block px-4 py-3 text-sm hover:bg-brand-50 dark:hover:bg-neutral-700 hover:text-brand-600 dark:text-gray-200 transition-colors font-medium"
                    >
                      {translate(cat.label)}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/about"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {t('common.about')}
              </Link>

              <Link
                to="/contact"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {t('common.contact')}
              </Link>

              <Link
                to="/blog"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {t('common.blog')}
              </Link>

              <Link
                to="/best-sellers"
                className="text-sm font-medium transition-colors text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>{t('common.bestSellers')}</span>
              </Link>

              <Link
                to="/sale"
                className="text-sm font-medium transition-colors text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <span>{t('common.sale')}</span>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{t('header.hot')}</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200 hover:border-brand-500 hover:text-brand-600 dark:hover:border-brand-500 smooth-transition"
                onClick={toggleLanguage}
                type="button"
                aria-label={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
              >
                <Languages className="w-4 h-4" />
                {language === 'en' ? 'EN' : 'VI'}
              </button>

              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full smooth-transition hover-scale"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5 dark:text-gray-200" />
              </button>

              {user && (
                <Link
                  to="/favorites"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full smooth-transition hover-scale hidden sm:block"
                >
                  <Heart className="w-5 h-5 dark:text-gray-200" />
                </Link>
              )}

              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full smooth-transition hover-scale relative"
                onClick={onCartOpen}
              >
                <ShoppingCart className="w-5 h-5 dark:text-gray-200" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-fade-in-scale">
                    {itemCount}
                  </span>
                )}
              </button>

              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full smooth-transition hover-scale">
                  <User className="w-5 h-5 dark:text-gray-200" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 border border-gray-100 dark:border-neutral-700">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        {t('header.myAccount')}
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors sm:hidden"
                      >
                        {t('header.favorites')}
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        {t('header.myOrders')}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                        >
                          Bảng điều khiển
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        {t('header.signOut')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        {t('header.signIn')}
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        {t('header.signUp')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg animate-slide-down">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="space-y-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    placeholder={translate({ en: 'Search for furniture...', vi: 'Tìm nội thất...' })}
                    className="w-full pl-10 pr-20 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all bg-white dark:bg-neutral-700 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white px-4 py-1.5 rounded-md hover:bg-brand-700 transition-colors text-sm font-medium"
                  >
                    {t('common.search')}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('header.quickSearch')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSearchTerms.map((term) => (
                      <button
                        key={term.id}
                        onClick={() => {
                          const termQuery = translate(term.query);
                          navigate(`/products?search=${encodeURIComponent(termQuery)}`);
                          setSearchOpen(false);
                        }}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-neutral-700 dark:text-gray-200 rounded-md text-xs hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-neutral-600 transition-colors"
                      >
                        {t(term.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 shadow-lg">
            <nav className="py-4">
              <Link
                to="/"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.home')}
              </Link>
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('common.products')}</div>
              {productCategories.map((cat) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate(cat.label)}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('common.services')}</div>
              {serviceLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate(item.label)}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('common.resources')}</div>
              {resourceLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate(item.label)}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <Link
                to="/about"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.about')}
              </Link>
              <Link
                to="/contact"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.contact')}
              </Link>
              <Link
                to="/sale"
                className="block px-6 py-3 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {`${t('common.sale')} 🔥`}
              </Link>
              <div className="px-6 pt-4 flex items-center gap-3">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200 hover:border-brand-500 hover:text-brand-600 dark:hover:border-brand-500 smooth-transition"
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Languages className="w-4 h-4" />
                  {language === 'en' ? 'EN' : 'VI'}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
