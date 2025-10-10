import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'Personal information: full name, email address, phone number, and shipping/billing addresses.',
      'Payment information: encrypted card data processed through PCI-DSS compliant partners.',
      'Browsing data: cookies, IP address, device type, and on-site behavior used to optimize your experience.',
    ],
  },
  {
    title: '2. How We Use Information',
    content: [
      'Fulfill orders, coordinate deliveries, and provide post-purchase support.',
      'Send order notifications, product updates, and promotional offers (with your consent).',
      'Analyze data to improve our website and personalize product recommendations.',
      'Run marketing and retargeting campaigns when permitted.',
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      'FurniCraft never sells or rents your personal data.',
      'We share information with shipping, payment, and marketing partners when required to deliver services.',
      'Information may be disclosed to comply with legal requests or protect the rights of FurniCraft and our customers.',
    ],
  },
  {
    title: '4. Cookies',
    content: [
      'Essential cookies maintain login sessions, carts, and site security.',
      'Analytics cookies measure performance and user behavior (Google Analytics).',
      'Marketing cookies deliver personalized advertising (Facebook Pixel, Google Ads).',
      'Manage cookies via your browser settings or the consent banner when you first visit the site.',
    ],
  },
  {
    title: '5. Data Security',
    content: [
      'SSL encryption protects every transaction and data transfer.',
      'Servers are hosted in ISO 27001 certified data centers with strict access controls.',
      'We perform routine security assessments and operate intrusion detection programs.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'Access, correct, or request deletion of your personal data.',
      'Opt out of marketing emails at any time using the "Unsubscribe" link.',
      'Request copies of your data or restrict processing under GDPR and CCPA.',
      'Contact privacy@furniturestore.com for any privacy-related requests.',
    ],
  },
  {
    title: "7. Children's Privacy",
    content: [
      'FurniCraft does not knowingly collect data from children under 13. We will delete such information immediately if discovered.',
    ],
  },
  {
    title: '8. Changes to Policy',
    content: [
      'We may update this policy to reflect business needs or legal requirements. Updates will always be posted on this page.',
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      'Email: privacy@furniturestore.com',
      'Security hotline: (800) 555-0199 ext. 4',
      'Address: 245 Market Street, San Francisco, CA 94105',
    ],
  },
];

export function PrivacyPolicyPage() {
  usePageMetadata({
    title: 'Privacy Policy',
    description: 'Understand how FurniCraft collects, uses, and protects your personal data in compliance with GDPR and CCPA.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 bg-[url('https://images.pexels.com/photos/3184469/pexels-photo-3184469.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
            <div className="mt-6">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Privacy Policy</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                FurniCraft is committed to safeguarding your personal data and complies with global security standards including GDPR and CCPA.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8 text-sm text-neutral-600">
          <p>Effective Date: November 1, 2024</p>
          <p>Last Updated: November 20, 2024</p>
          <p className="mt-4">
            This policy applies to all customers, newsletter subscribers, showroom visitors, and users of FurniCraft's online services.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-8">
              <h2 className="font-semibold text-xl text-neutral-900 mb-4">{section.title}</h2>
              <ul className="space-y-3 text-sm text-neutral-600">
                {section.content.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex w-2 h-2 rounded-full bg-brand-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 text-sm text-neutral-600">
          <p>
            FurniCraft honors your rights under GDPR and CCPA. Submit access, portability, deletion, or objection requests by contacting
            <a href="mailto:privacy@furniturestore.com" className="text-brand-600 font-semibold">privacy@furniturestore.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
