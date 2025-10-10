import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const productCategories = [
    { name: 'All Products', path: '/products' },
    { name: 'Living Room', path: '/shop/living' },
    { name: 'Bedroom', path: '/shop/bedroom' },
    { name: 'Dining', path: '/shop/dining' },
    { name: 'Office', path: '/shop/office' },
    { name: 'Outdoor', path: '/shop/outdoor' },
  ];

  const serviceLinks = [
    { name: 'Assembly Services', path: '/assembly-services' },
    { name: 'Design Services', path: '/design-services' },
    { name: 'Virtual Showroom', path: '/virtual-showroom' },
  ];

  const resourceLinks = [
    { name: 'Blog & News', path: '/blog' },
    { name: 'Shipping & Returns', path: '/shipping-returns' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'Design Inspiration', path: '/design-inspiration' },
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
                <span className="text-brand-600">Z</span><span className="text-neutral-900 dark:text-white">Shop</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                to="/"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </Link>

              <div className="relative group">
                <button className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 flex items-center space-x-1">
                  <span>Products</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-gray-100 dark:border-neutral-700">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.path}
                      className="block px-4 py-3 text-sm hover:bg-brand-50 dark:hover:bg-neutral-700 hover:text-brand-600 dark:text-gray-200 transition-colors font-medium"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 flex items-center space-x-1">
                  <span>Services</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-gray-100 dark:border-neutral-700">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block px-4 py-3 text-sm hover:bg-brand-50 dark:hover:bg-neutral-700 hover:text-brand-600 dark:text-gray-200 transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 flex items-center space-x-1">
                  <span>Resources</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-gray-100 dark:border-neutral-700">
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block px-4 py-3 text-sm hover:bg-brand-50 dark:hover:bg-neutral-700 hover:text-brand-600 dark:text-gray-200 transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/about"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>

              <Link
                to="/blog"
                className="text-sm font-medium smooth-transition hover:text-brand-600 dark:text-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Blog
              </Link>

              <Link
                to="/best-sellers"
                className="text-sm font-medium transition-colors text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>Best Sellers</span>
              </Link>

              <Link
                to="/sale"
                className="text-sm font-medium transition-colors text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <span>Sale</span>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Hot</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">

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
                        My Account
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors sm:hidden"
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                      >
                        Sign Up
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
                    placeholder="Search for furniture..."
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
                    Search
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Quick:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Sofa', 'Bed', 'Table', 'Chair', 'Outdoor'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          navigate(`/products?search=${term}`);
                          setSearchOpen(false);
                        }}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-neutral-700 dark:text-gray-200 rounded-md text-xs hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-neutral-600 transition-colors"
                      >
                        {term}
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
                Home
              </Link>
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Products</div>
              {productCategories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Services</div>
              {serviceLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Resources</div>
              {resourceLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-neutral-700 my-2" />
              <Link
                to="/about"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/sale"
                className="block px-6 py-3 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sale 🔥
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
