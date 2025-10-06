import { ShoppingCart, Search, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-slate-900 text-white py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center">
            Miễn phí vận chuyển cho đơn hàng từ 5 triệu đồng | Hotline: 1900-xxxx
          </p>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-slate-900 tracking-tight transition-all duration-300 hover:scale-105 hover:text-slate-700"
            >
              LUXHOME
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                isActive('/')
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10">Trang Chủ</span>
              <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-slate-100 scale-100' 
                  : 'bg-slate-50 scale-0 group-hover:scale-100'
              }`}></span>
              <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-slate-900 transition-all duration-300 ${
                isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/products"
              className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                isActive('/products')
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10">Sản Phẩm</span>
              <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isActive('/products') 
                  ? 'bg-slate-100 scale-100' 
                  : 'bg-slate-50 scale-0 group-hover:scale-100'
              }`}></span>
              <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-slate-900 transition-all duration-300 ${
                isActive('/products') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/about"
              className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                isActive('/about')
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10">Về Chúng Tôi</span>
              <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isActive('/about') 
                  ? 'bg-slate-100 scale-100' 
                  : 'bg-slate-50 scale-0 group-hover:scale-100'
              }`}></span>
              <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-slate-900 transition-all duration-300 ${
                isActive('/about') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/contact"
              className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                isActive('/contact')
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10">Liên Hệ</span>
              <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isActive('/contact') 
                  ? 'bg-slate-100 scale-100' 
                  : 'bg-slate-50 scale-0 group-hover:scale-100'
              }`}></span>
              <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-slate-900 transition-all duration-300 ${
                isActive('/contact') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Search"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-slate-700 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Search className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:rotate-12" />
              )}
            </button>
            <button
              className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-slate-700 transition-all duration-300 group-hover:fill-red-500 group-hover:text-red-500" />
            </button>
            <button
              className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 relative"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-700 transition-transform duration-300 rotate-0" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              autoFocus
            />
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/')
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Trang Chủ
              </Link>
              <Link
                to="/products"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/products')
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sản Phẩm
              </Link>
              <Link
                to="/about"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/about')
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Về Chúng Tôi
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/contact')
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Liên Hệ
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}