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
    <div className="bg-white overflow-hidden hover:shadow-xl transition-all duration-500 group cursor-pointer rounded-lg border border-transparent hover:border-slate-200 transform hover:-translate-y-2 animate-scale-in">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.();
          }}
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 hover:bg-white shadow-lg"
        >
          <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 hover:fill-red-500 transition-all duration-300" />
        </button>
        <div className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
          Xem chi tiết
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-semibold text-lg mb-2 text-slate-900 line-clamp-2 min-h-[3.5rem] group-hover:text-slate-700 transition-colors duration-300">
          {name}
        </h4>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="ml-1 text-sm text-slate-600 group-hover:text-slate-900 transition-colors duration-300">
              {rating} ({reviews})
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-slate-900 group-hover:scale-110 transition-transform duration-300 origin-left">
            {price}₫
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded-sm hover:bg-slate-700 transition-all duration-300 text-sm font-medium flex items-center gap-2 hover:gap-3 hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
