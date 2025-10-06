import { Heart, Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
}

export default function ProductCard({
  name,
  price,
  image,
  rating,
  reviews,
  onAddToCart,
  onToggleFavorite
}: ProductCardProps) {
  return (
    <div className="bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.();
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 hover:fill-red-500" />
        </button>
      </div>
      <div className="p-5">
        <h4 className="font-semibold text-lg mb-2 text-slate-900 line-clamp-2 min-h-[3.5rem]">
          {name}
        </h4>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm text-slate-600">
              {rating} ({reviews})
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-slate-900">
            {price}₫
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded-sm hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
