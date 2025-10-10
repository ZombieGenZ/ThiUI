import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const cookieSections = [
  {
    title: 'What are Cookies?',
    paragraphs: [
      'Cookies are small text files stored on your device when you visit a website. They remember preferences, optimize performance, and personalize your experience.',
      'FurniCraft uses cookies to keep shopping secure, fast, and tailored to your interests.',
    ],
  },
  {
    title: 'Types of Cookies We Use',
    subsections: [
      {
        title: 'Essential Cookies',
        items: [
          'Keep you signed in and protect your account.',
          'Manage your cart, payments, and the checkout process.',
          'Prevent fraud and secure your data.',
        ],
      },
      {
        title: 'Performance Cookies',
        items: [
          'Google Analytics measures visits and popular pages.',
          'Track page load times to improve performance.',
          'Analyze user interactions to refine UI/UX.',
        ],
      },
      {
        title: 'Functionality Cookies',
        items: [
          'Remember language, shipping region, and display settings.',
          'Save wishlists and the filters you have applied.',
        ],
      },
      {
        title: 'Marketing Cookies',
        items: [
          'Facebook Pixel tracks campaign performance and retargeting.',
          'Google Ads adapts creative based on browsing behavior.',
          'Advertising partners surface offers that match your interests.',
        ],
      },
    ],
  },
  {
    title: 'How to Manage Cookies',
    paragraphs: [
      'You can adjust cookie settings through your browser or the consent banner when you first visit the site. Disabling essential cookies may impact your shopping experience.',
      'Browser guidance: Chrome (chrome://settings/cookies), Firefox (about:preferences#privacy), Safari (Preferences > Privacy), Microsoft Edge (edge://settings/content/cookies).',
      'Opt-out: Google Analytics Opt-out Browser Add-on, Network Advertising Initiative opt-out page.',
    ],
  },
  {
    title: 'Cookie Consent Banner',
    paragraphs: [
      'On your first visit you will see a cookie banner with the options: Accept All, Reject Non-Essential, Customize.',
      'You can revisit your choices anytime via the "Cookie Preferences" link in the footer.',
    ],
  },
  {
    title: 'Third-Party Cookies',
    paragraphs: [
      'Some cookies are set by analytics and advertising partners. Review their privacy notices below:',
    ],
    links: [
      { label: 'Google Privacy & Terms', url: 'https://policies.google.com/privacy' },
      { label: 'Meta Privacy Policy', url: 'https://www.facebook.com/policy.php' },
      { label: 'Klaviyo Privacy Notice', url: 'https://www.klaviyo.com/legal/privacy' },
    ],
  },
];

export function CookiePolicyPage() {
  usePageMetadata({
    title: 'Cookie Policy',
    description: 'Learn how FurniCraft uses cookies, what categories are collected, and how you can manage your preferences.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 bg-[url('https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]} />
            <div className="mt-6">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Cookie Policy</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                This cookie policy explains how FurniCraft collects, uses, and manages cookies to deliver a secure and personalized experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {cookieSections.map((section) => (
          <section key={section.title} className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-8 space-y-4">
            <h2 className="font-semibold text-xl text-neutral-900">{section.title}</h2>
            {section.paragraphs && (
              <div className="space-y-3 text-sm text-neutral-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
            {section.subsections && (
              <div className="space-y-4">
                {section.subsections.map((sub) => (
                  <div key={sub.title} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
                    <h3 className="font-semibold text-sm text-neutral-900 mb-2">{sub.title}</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      {sub.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex w-2 h-2 rounded-full bg-brand-600" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {section.links && (
              <ul className="space-y-2 text-sm text-brand-600">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default CookiePolicyPage;
