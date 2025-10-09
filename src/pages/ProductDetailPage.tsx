import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ReviewSection } from '../components/ReviewSection';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  room_type: string | null;
  dimensions: any;
  materials: string[];
  weight: number | null;
  sku: string;
  stock_quantity: number;
  style: string | null;
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProduct(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
      setQuantity(1);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    if (!user) {
      toast.error('Please sign in to save favorites');
      navigate('/login');
      return;
    }

    try {
      await toggleFavorite(product.id);
      if (isFavorite(product.id)) {
        toast.success('Removed from favorites');
      } else {
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Failed to update favorites');
    }
  };

  const nextImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden mb-4">
              {product.is_new && (
                <div className="absolute top-4 left-4 z-10 bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-medium">
                  NEW
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 right-4 z-10 bg-accent-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-medium">
                  -{discountPercent}%
                </div>
              )}
              <img
                src={product.images[selectedImage] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-brand-600' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-4xl text-neutral-900 mb-4">{product.name}</h1>

            {product.rating > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">({product.review_count} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline space-x-3 mb-6">
              <span className={`text-4xl font-bold ${hasDiscount ? 'text-accent-600' : 'text-neutral-900'}`}>
                ${price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-neutral-500 line-through">${product.base_price.toFixed(2)}</span>
                  <span className="text-lg font-semibold text-accent-600">
                    Save ${(product.base_price - product.sale_price!).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-neutral-600 leading-relaxed mb-8">{product.description}</p>

            {product.style && (
              <div className="mb-6">
                <span className="inline-block bg-neutral-100 text-neutral-700 text-sm font-medium px-4 py-2 rounded-full">
                  Style: {product.style}
                </span>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-8 mb-8">
              {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm font-medium">
                    Only {product.stock_quantity} left in stock - order soon!
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <label className="font-semibold text-neutral-900">Quantity:</label>
                <div className="flex items-center border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-neutral-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock_quantity === 0}
                  className={`flex-1 bg-brand-600 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    product.stock_quantity > 0
                      ? 'hover:bg-brand-700 transform hover:scale-[1.02]'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{addingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                {user && (
                  <button
                    onClick={handleToggleFavorite}
                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center transition-all ${
                      isFavorite(product.id)
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-neutral-300 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-8">
              <div className="flex items-start space-x-3">
                <Truck className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Free Shipping</h3>
                  <p className="text-sm text-neutral-600">On orders over $500</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">2 Year Warranty</h3>
                  <p className="text-sm text-neutral-600">Quality guaranteed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RotateCcw className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">30 Day Returns</h3>
                  <p className="text-sm text-neutral-600">Hassle-free returns</p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8 mt-8">
              <h3 className="font-semibold text-neutral-900 mb-4">Product Details</h3>
              <div className="space-y-2 text-sm">
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">SKU:</span>
                    <span className="text-neutral-900 font-medium">{product.sku}</span>
                  </div>
                )}
                {product.dimensions?.width && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Width:</span>
                    <span className="text-neutral-900 font-medium">{product.dimensions.width}</span>
                  </div>
                )}
                {product.dimensions?.height && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Height:</span>
                    <span className="text-neutral-900 font-medium">{product.dimensions.height}</span>
                  </div>
                )}
                {product.dimensions?.depth && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Depth:</span>
                    <span className="text-neutral-900 font-medium">{product.dimensions.depth}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Weight:</span>
                    <span className="text-neutral-900 font-medium">{product.weight} kg</span>
                  </div>
                )}
                {product.materials && product.materials.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Materials:</span>
                    <span className="text-neutral-900 font-medium">{product.materials.join(', ')}</span>
                  </div>
                )}
                {product.room_type && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Room Type:</span>
                    <span className="text-neutral-900 font-medium">{product.room_type}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Availability:</span>
                  <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReviewSection productId={product.id} onReviewAdded={loadProduct} />
      </div>
    </div>
  );
}
