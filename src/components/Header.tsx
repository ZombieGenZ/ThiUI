import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onCartOpen: () => void;
  onAuthOpen: () => void;
}

export function Header({ onCartOpen, onAuthOpen }: HeaderProps) {
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
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-neutral-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:flex-initial">
              <Link to="/" className="font-serif text-2xl lg:text-3xl tracking-wide font-bold">
                <span className="text-brand-600">Zombie</span><span className="text-neutral-900">Shop</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-brand-600"
              >
                Home
              </Link>

              <div
                className="relative group"
              >
                <button className="text-sm font-medium transition-colors hover:text-brand-600 flex items-center space-x-1">
                  <span>Products</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.path}
                      className="block px-4 py-3 text-sm hover:bg-brand-50 hover:text-brand-600 transition-colors font-medium"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/about"
                className="text-sm font-medium transition-colors hover:text-brand-600"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="text-sm font-medium transition-colors hover:text-brand-600"
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
               
              >
                <Search className="w-5 h-5" />
              </button>

              {user && (
                <Link
                  to="/wishlist"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
                 
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                onClick={onCartOpen}
               
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>

              <div className="relative group">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                 
                >
                  <User className="w-5 h-5" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                       
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                       
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors sm:hidden"
                       
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                       
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onAuthOpen}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                       
                      >
                        Sign In
                      </button>
                      <button
                        onClick={onAuthOpen}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                       
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
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
                    placeholder="Search for furniture, styles, rooms..."
                    className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 text-base transition-all"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Popular:</span>
                    <div className="flex flex-wrap gap-2">
                      {['Sofa', 'Bed', 'Dining Table', 'Office Chair', 'Outdoor'].map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            navigate(`/products?search=${term}`);
                            setSearchOpen(false);
                          }}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:border-brand-600 hover:text-brand-600 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
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
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-4">
              <Link
                to="/"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="border-t border-gray-200 my-2" />
              <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase">Products</div>
              {productCategories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="block px-8 py-2 text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 my-2" />
              <Link
                to="/about"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/sale"
                className="block px-6 py-3 text-sm font-medium text-red-600 hover:bg-gray-100 transition-colors"
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