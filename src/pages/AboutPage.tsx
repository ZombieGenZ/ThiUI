import { Award, Users, Target, Heart } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-96 bg-gradient-to-r from-neutral-900 to-neutral-700">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-5xl text-white mb-4">About ZShop</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Crafting beautiful living spaces since 2010
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div data-aos="fade-right">
            <h2 className="font-display text-4xl text-neutral-900 mb-6">Our Story</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              ZShop was founded with a simple mission: to make high-quality, beautifully designed furniture
              accessible to everyone. What started as a small workshop has grown into a trusted brand serving
              thousands of happy customers across the country.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We believe that your home should be a reflection of your personality and style. That's why we
              carefully curate each piece in our collection, ensuring that it meets our high standards for
              quality, design, and sustainability.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Every item we offer is selected with care, combining timeless aesthetics with modern functionality.
              Our team works directly with skilled craftsmen and manufacturers to bring you furniture that not
              only looks beautiful but is built to last for generations.
            </p>
          </div>
          <div data-aos="fade-left">
            <img
              src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Our showroom"
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center" data-aos="fade-up" data-aos-delay="0">
            <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-xl text-neutral-900 mb-2">Premium Quality</h3>
            <p className="text-neutral-600 text-sm">
              Every piece is crafted with attention to detail and built to last
            </p>
          </div>
          <div className="text-center" data-aos="fade-up" data-aos-delay="100">
            <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-xl text-neutral-900 mb-2">Expert Team</h3>
            <p className="text-neutral-600 text-sm">
              Our designers and craftsmen bring decades of experience
            </p>
          </div>
          <div className="text-center" data-aos="fade-up" data-aos-delay="200">
            <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-xl text-neutral-900 mb-2">Customer Focus</h3>
            <p className="text-neutral-600 text-sm">
              Your satisfaction is our top priority, always
            </p>
          </div>
          <div className="text-center" data-aos="fade-up" data-aos-delay="300">
            <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-xl text-neutral-900 mb-2">Sustainable</h3>
            <p className="text-neutral-600 text-sm">
              We're committed to eco-friendly materials and practices
            </p>
          </div>
        </div>

        <div className="bg-neutral-100 rounded-xl p-12" data-aos="fade-up">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl text-neutral-900 mb-6">Our Values</h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              At ZShop, we're more than just a furniture store. We're a community of design enthusiasts,
              craftspeople, and home lovers who believe in the power of beautiful spaces to transform lives.
              We're committed to sustainability, quality craftsmanship, and exceptional customer service in
              everything we do.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Quality First</h3>
                <p className="text-sm text-neutral-600">
                  We never compromise on the quality of materials or craftsmanship
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Design Excellence</h3>
                <p className="text-sm text-neutral-600">
                  Timeless designs that blend form and function perfectly
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Sustainability</h3>
                <p className="text-sm text-neutral-600">
                  Responsible sourcing and eco-conscious manufacturing processes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center" data-aos="fade-up">
          <h2 className="font-display text-3xl text-neutral-900 mb-4">Visit Our Showroom</h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Experience our furniture in person. Our showroom is open Monday through Saturday,
            and our expert staff are always happy to help you find the perfect pieces for your home.
          </p>
          <a
            href="/contact"
            className="inline-block bg-brand-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}
