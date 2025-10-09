import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
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
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export function HomePage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [featured, newItems, cats] = await Promise.all([
      supabase.from('products').select('*').eq('is_featured', true).limit(8),
      supabase.from('products').select('*').eq('is_new', true).limit(8),
      supabase.from('categories').select('*').is('parent_id', null).order('display_order'),
    ]);

    if (featured.data) setFeaturedProducts(featured.data);
    if (newItems.data) setNewArrivals(newItems.data);
    if (cats.data) setCategories(cats.data);
  };

  const heroSlides = [
    {
      title: 'Transform Your Living Space',
      subtitle: 'Discover Premium Furniture Collections',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920',
      cta: 'Shop Now',
    },
    {
      title: 'Curated for Comfort',
      subtitle: 'Modern Designs, Timeless Elegance',
      image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1920',
      cta: 'Explore Collection',
    },
    {
      title: 'New Season Arrivals',
      subtitle: 'Fresh Styles for Every Room',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920',
      cta: 'Discover More',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    await addToCart(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-screen">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
              <div className="max-w-4xl">
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-delay">
                  {slide.subtitle}
                </p>
                <button
                  className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
                 
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
         
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
         
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
             
            />
          ))}
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12" data-aos="fade-up">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-6 h-6 text-accent-500" />
              <span className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-neutral-900">Best Sellers</h2>
          </div>
          <a
            href="/best-sellers"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
            </div>
          ))}
        </div>
      </section>

      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="font-display text-3xl md:text-4xl text-neutral-900 mb-4">Shop by Room</h2>
            <p className="text-neutral-600">Find everything you need for every space</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <a
              href="/shop/living"
              className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              data-aos="zoom-in"
              data-aos-delay="0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg"
                alt="Living Room"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white font-bold text-lg mb-1">Living Room</h3>
                <p className="text-white/80 text-sm">Sofas, Tables & More</p>
              </div>
            </a>
            <a
              href="/shop/bedroom"
              className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              data-aos="zoom-in"
              data-aos-delay="50"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg"
                alt="Bedroom"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white font-bold text-lg mb-1">Bedroom</h3>
                <p className="text-white/80 text-sm">Beds, Dressers & More</p>
              </div>
            </a>
            <a
              href="/shop/dining"
              className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg"
                alt="Dining"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white font-bold text-lg mb-1">Dining</h3>
                <p className="text-white/80 text-sm">Tables, Chairs & More</p>
              </div>
            </a>
            <a
              href="/shop/office"
              className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              data-aos="zoom-in"
              data-aos-delay="150"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg"
                alt="Office"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white font-bold text-lg mb-1">Office</h3>
                <p className="text-white/80 text-sm">Desks, Chairs & More</p>
              </div>
            </a>
            <a
              href="/shop/outdoor"
              className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img
                src="https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg"
                alt="Outdoor"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white font-bold text-lg mb-1">Outdoor</h3>
                <p className="text-white/80 text-sm">Patio, Garden & More</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12" data-aos="fade-up">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-6 h-6 text-brand-600" />
              <span className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">Just In</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-neutral-900">New Arrivals</h2>
          </div>
          <a
            href="/shop?filter=new"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 transition-colors"
           
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 100}>
              <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-aos="fade-up" data-aos-delay="0">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-gray-400 text-sm">Crafted with the finest materials for lasting beauty</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-400 text-sm">Multiple payment options with complete security</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-400 text-sm">White glove delivery and assembly available</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

