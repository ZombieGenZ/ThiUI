import { Star, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden card-hover shadow-soft">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {product.is_new && (
          <div className="absolute top-4 left-4 z-10 bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-medium">
            NEW
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-4 right-4 z-10 bg-accent-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-medium">
            -{discountPercent}%
          </div>
        )}
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover image-scale"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Link
            to={`/product/${product.slug}`}
            className="bg-white text-neutral-900 px-5 py-3 rounded-full font-semibold shadow-strong flex items-center space-x-2 hover:bg-neutral-100"
           
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Link>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="bg-brand-600 text-white px-5 py-3 rounded-full font-semibold shadow-strong flex items-center space-x-2 hover:bg-brand-700"
             
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
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

        <div className="flex items-center space-x-2 mb-2">
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
