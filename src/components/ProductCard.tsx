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
    <div className="group relative bg-white rounded-lg overflow-hidden card-hover shadow-sm border border-gray-100 flex flex-col h-full will-change-transform hover:shadow-lg hover:border-brand-200">
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        {user && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-110 smooth-transition hover:shadow-lg active:scale-95"
          >
            <Heart
              className={`w-4 h-4 smooth-transition ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
        )}
        {product.is_new && (
          <div className="absolute top-3 left-3 z-10 bg-brand-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
            NEW
          </div>
        )}
        {hasDiscount && (
          <div className={`absolute ${product.is_new ? 'top-12' : 'top-3'} left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm`}>
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

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 bg-white text-gray-900 px-3 py-2 rounded-md font-medium shadow-lg flex items-center justify-center gap-2 hover:bg-gray-100 smooth-transition text-sm"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </Link>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="flex-1 bg-brand-600 text-white px-3 py-2 rounded-md font-medium shadow-lg flex items-center justify-center gap-2 hover:bg-brand-700 smooth-transition text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 smooth-transition text-sm leading-relaxed">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-1 mt-auto">
          <span className={`font-bold text-base ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            ${price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">${product.base_price.toFixed(2)}</span>
          )}
        </div>

        {product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <p className="text-xs text-orange-600 font-medium">
            Only {product.stock_quantity} left!
          </p>
        )}
      </div>
    </div>
  );
}
