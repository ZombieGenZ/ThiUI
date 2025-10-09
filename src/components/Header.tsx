import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, SlidersHorizontal } from 'lucide-react';
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 dark:text-gray-200" /> : <Menu className="w-6 h-6 dark:text-gray-200" />}
            </button>

            <div className="flex-1 lg:flex-initial">
              <Link to="/" className="font-serif text-2xl lg:text-3xl tracking-wide font-bold">
                <span className="text-brand-600">Zombie</span><span className="text-neutral-900 dark:text-white">Shop</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-brand-600 dark:text-gray-200"
              >
                Home
              </Link>

              <div className="relative group">
                <button className="text-sm font-medium transition-colors hover:text-brand-600 dark:text-gray-200 flex items-center space-x-1">
                  <span>Products</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-neutral-700">
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

              <Link
                to="/about"
                className="text-sm font-medium transition-colors hover:text-brand-600 dark:text-gray-200"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="text-sm font-medium transition-colors hover:text-brand-600 dark:text-gray-200"
              >
                Contact
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5 dark:text-gray-200" />
              </button>

              {user && (
                <Link
                  to="/favorites"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors hidden sm:block"
                >
                  <Heart className="w-5 h-5 dark:text-gray-200" />
                </Link>
              )}

              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors relative"
                onClick={onCartOpen}
              >
                <ShoppingCart className="w-5 h-5 dark:text-gray-200" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>

              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                  <User className="w-5 h-5 dark:text-gray-200" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
          <div className="border-t border-gray-200 dark:border-neutral-700 bg-gradient-to-b from-white via-brand-50/30 to-white dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 shadow-xl backdrop-blur-sm animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-600 z-10 transition-transform group-focus-within:scale-110 duration-300" />
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
                    placeholder="Search products, styles, rooms..."
                    className="w-full pl-16 pr-36 py-5 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base transition-all duration-300 bg-white/90 dark:bg-neutral-800/90 dark:text-white backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-brand-100 relative z-10"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white px-7 py-3 rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 z-10"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-5 h-5 text-brand-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Popular Searches:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Sofa', icon: '🛋️' },
                      { name: 'Bed', icon: '🛏️' },
                      { name: 'Dining Table', icon: '🪑' },
                      { name: 'Office Chair', icon: '💺' },
                      { name: 'Outdoor', icon: '🌿' }
                    ].map((term) => (
                      <button
                        key={term.name}
                        onClick={() => {
                          navigate(`/products?search=${term.name}`);
                          setSearchOpen(false);
                        }}
                        className="px-5 py-2.5 bg-white dark:bg-neutral-800 dark:text-gray-200 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-sm hover:border-brand-600 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                      >
                        <span className="text-lg">{term.icon}</span>
                        <span>{term.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="dark:text-gray-400">💡 Tip: Press Enter to search quickly</span>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
                    >
                      Close
                    </button>
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
