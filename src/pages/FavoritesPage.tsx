import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';

export function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success(`${productName} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-4xl font-display font-bold text-neutral-900">My Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">No favorites yet</h2>
            <p className="text-neutral-600 mb-8">
              Start exploring our products and save your favorites here!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <p className="text-neutral-600 mb-8">
              You have {favorites.length} favorite {favorites.length === 1 ? 'item' : 'items'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => {
                const product = favorite.product;
                if (!product) return null;

                return (
                  <div key={favorite.id} className="relative">
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        base_price: product.base_price,
                        sale_price: product.sale_price,
                        images: product.images,
                        rating: product.rating,
                        review_count: product.review_count,
                        is_new: product.is_new,
                        room_type: null,
                        stock_quantity: product.stock_quantity,
                      }}
                      onAddToCart={() => handleAddToCart(product.id, product.name)}
                    />
                    <button
                      onClick={async () => {
                        try {
                          await toggleFavorite(product.id);
                          toast.success('Removed from favorites');
                        } catch (error) {
                          toast.error('Failed to remove from favorites');
                        }
                      }}
                      className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors group"
                      title="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
