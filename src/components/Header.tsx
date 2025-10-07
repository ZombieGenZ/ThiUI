import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onCartOpen: () => void;
  onAuthOpen: () => void;
}

export function Header({ onCartOpen, onAuthOpen }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-neutral-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-cursor="explore"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:flex-initial">
              <Link to="/" className="font-serif text-2xl lg:text-3xl tracking-wide font-bold" data-cursor="explore">
                <span className="text-brand-600">Zombie</span><span className="text-neutral-900">Shop</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 `}
                  data-cursor="explore"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                data-cursor="explore"
              >
                <Search className="w-5 h-5" />
              </button>

              {user && (
                <Link
                  to="/wishlist"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
                  data-cursor="star"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                onClick={onCartOpen}
                data-cursor="cart"
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
                  data-cursor="explore"
                >
                  <User className="w-5 h-5" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        data-cursor="explore"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        data-cursor="explore"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors sm:hidden"
                        data-cursor="explore"
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        data-cursor="explore"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onAuthOpen}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        data-cursor="explore"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={onAuthOpen}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        data-cursor="explore"
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
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search furniture, rooms, styles..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
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
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`block px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-colors `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}