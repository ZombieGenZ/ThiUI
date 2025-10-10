import { Mail, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const sections = [
    {
      title: 'Customer Service',
      links: [
        { name: 'Shipping & Returns', path: '/shipping-returns' },
        { name: 'Track Order', path: '/track-order' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Design Services', path: '/design-services' },
        { name: 'Careers', path: '/careers' },
      ],
    },
    {
      title: 'Explore',
      links: [
        { name: 'Design Inspiration', path: '/design-inspiration' },
        { name: 'Virtual Showroom', path: '/virtual-showroom' },
        { name: 'Size Guide', path: '/size-guide' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/cookie-policy' },
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="font-display text-xl text-white mb-3 font-bold">
              <span className="text-brand-500">Furni</span>Craft
            </h3>
            <p className="text-sm mb-4 text-gray-400">
              Premium furniture for beautiful spaces.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-all duration-300 hover:scale-110"
                    title={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-3 text-sm">{section.title}</h4>
              <ul className="space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs text-gray-400 hover:text-white transition-colors block">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-white">Newsletter</p>
                <p className="text-xs text-gray-400">Get exclusive offers</p>
              </div>
            </div>

            <form className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm w-full md:w-56"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-r-md hover:bg-brand-700 transition-colors font-medium text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>&copy; 2024 FurniCraft. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
