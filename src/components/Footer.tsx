import { Mail } from 'lucide-react';

export function Footer() {
  const sections = [
    {
      title: 'Shop',
      links: [
        { name: 'Living Room', path: '/shop/living-room' },
        { name: 'Bedroom', path: '/shop/bedroom' },
        { name: 'Dining', path: '/shop/dining' },
        { name: 'Office', path: '/shop/office' },
        { name: 'Outdoor', path: '/shop/outdoor' },
        { name: 'Sale', path: '/sale' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', path: '/contact' },
        { name: 'Shipping & Returns', path: '/shipping' },
        { name: 'Assembly Services', path: '/assembly' },
        { name: 'Track Order', path: '/track' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Size Guide', path: '/size-guide' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Design Inspiration', path: '/inspiration' },
        { name: 'Virtual Showroom', path: '/showroom' },
        { name: 'Design Services', path: '/design-services' },
        { name: 'Blog', path: '/blog' },
        { name: 'Careers', path: '/careers' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
    },
    {
      name: 'Youtube',
      url: 'https://youtube.com',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-1">
            <h3 className="font-serif text-2xl text-white mb-4 font-bold">
              <span className="text-brand-500">Zombie</span>Shop
            </h3>
            <p className="text-sm mb-6">
              Crafting beautiful spaces with premium furniture and expert design services.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Mail className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold text-white">Subscribe to our newsletter</p>
                <p className="text-xs">Get updates on new arrivals and exclusive offers</p>
              </div>
            </div>

            <form className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white text-sm w-full md:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-gray-900 rounded-r-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm">
            <p>&copy; 2024 ZombieShop. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style>{`
        .social-button {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(145deg, #1f2937, #111827);
          display: flex;
          align-items: center;
          justify-center;
          color: #9ca3af;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .social-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }

        .social-button svg {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .social-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
        }

        .social-button:hover::before {
          width: 100%;
          height: 100%;
        }

        .social-button:hover svg {
          color: #ffffff;
          transform: scale(1.1) rotate(5deg);
        }

        .social-button:active {
          transform: translateY(-1px) scale(1.02);
        }
      `}</style>
    </footer>
  );
}
