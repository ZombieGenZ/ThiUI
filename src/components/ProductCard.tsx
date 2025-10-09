import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  room_type: string | null;
  stock_quantity?: number;
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(fav => fav.product_id === product.id);
  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden card-hover shadow-soft flex flex-col h-full will-change-transform hover:shadow-strong">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 flex-shrink-0">
        {user && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-125 smooth-transition hover:shadow-lg active:scale-95"
          >
            <Heart
              className={`w-5 h-5 smooth-transition ${
                isFavorite
                  ? 'fill-red-500 text-red-500 animate-bounce-in'
                  : 'text-neutral-600 hover:text-red-500'
              }`}
            />
          </button>
        )}
        {product.is_new && (
          <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-scale">
            NEW
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-14 right-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-scale">
            -{discountPercent}%
          </div>
        )}
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover image-scale"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-0 sm:translate-y-4 group-hover:translate-y-0">
          <Link
            to={`/product/${product.slug}`}
            className="bg-white text-neutral-900 px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold shadow-strong flex items-center space-x-2 hover:bg-neutral-100 smooth-transition hover:scale-110 hover:shadow-xl active:scale-95"
          >
            <Eye className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">View</span>
          </Link>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="bg-brand-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold shadow-strong flex items-center space-x-2 hover:bg-brand-700 smooth-transition hover:scale-110 hover:shadow-xl active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 transition-transform hover:-rotate-12" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-600 smooth-transition min-h-[3rem] hover:underline decoration-brand-600 decoration-2 underline-offset-4">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-accent-400 text-accent-400'
                    : 'text-neutral-300'
                }`}
              />
            ))}
            <span className="text-sm text-neutral-600 ml-1">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-center space-x-2 mb-2 mt-auto">
          <span className={`font-bold text-lg ${hasDiscount ? 'text-accent-600' : 'text-neutral-900'}`}>
            ${price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-500 line-through">${product.base_price.toFixed(2)}</span>
          )}
        </div>

        {product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <p className="text-xs text-orange-600 font-semibold">
            Only {product.stock_quantity} left in stock!
          </p>
        )}
      </div>
    </div>
  );
}
