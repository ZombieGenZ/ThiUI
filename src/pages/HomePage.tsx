import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';

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
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-105 animate-ken-burns"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
              <div className="max-w-4xl">
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 animate-fade-in-scale drop-shadow-2xl">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-3xl text-white/95 mb-10 animate-fade-in-delay font-light tracking-wide drop-shadow-lg">
                  {slide.subtitle}
                </p>
                <button
                  className="bg-white text-black px-10 py-5 rounded-full font-bold hover:bg-brand-500 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-2xl inline-flex items-center space-x-3 text-lg"

                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all transform hover:scale-110 border border-white/30"

        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all transform hover:scale-110 border border-white/30"

        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-12' : 'bg-white/40 w-8 hover:bg-white/60'
              }`}

            />
          ))}
        </div>

        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 animate-bounce z-30 hidden md:block">
          <div className="w-7 h-12 border-2 border-white/60 rounded-full flex justify-center pt-2 backdrop-blur-sm">
            <div className="w-1.5 h-4 bg-white rounded-full animate-scroll" />
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
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-900">Best Sellers</h2>
          </div>
          <a
            href="/shop"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 transition-colors"
           
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-900 mb-4">Shop by Room</h2>
            <p className="text-neutral-600">Find everything you need for every space</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <a
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group relative aspect-square rounded-lg overflow-hidden"
               
                data-aos="zoom-in"
                data-aos-delay={index * 50}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                  src={category.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-white font-semibold">{category.name}</h3>
                </div>
              </a>
            ))}
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
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-900">New Arrivals</h2>
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
              <ProductCard product={product} />
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
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes ken-burns {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 1.2s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-scale 1.2s ease-out 0.3s both;
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out forwards;
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

