import { Mail, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

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
    { name: 'Facebook', url: 'https://facebook.com', icon: Facebook },
    { name: 'Twitter', url: 'https://twitter.com', icon: Twitter },
    { name: 'Youtube', url: 'https://youtube.com', icon: Youtube },
    { name: 'Instagram', url: 'https://instagram.com', icon: Instagram },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-1">
            <h3 className="font-display text-2xl text-white mb-4 font-bold">
              <span className="text-brand-500">Zombie</span>Shop
            </h3>
            <p className="text-sm mb-6">
              Crafting beautiful spaces with premium furniture and expert design services.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-button"
                    title={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
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
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          border-radius: 50%;
          background: linear-gradient(145deg, #1f2937, #111827);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
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
