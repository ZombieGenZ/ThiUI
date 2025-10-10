import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

export function TermsPage() {
  usePageMetadata({
    title: 'Terms of Service',
    description: 'Review the ZShop Terms of Service outlining user responsibilities, usage guidelines, and legal protections.',
  });

  const effectiveDate = 'Effective Date: November 1, 2024';
  const lastUpdated = 'Last Updated: November 15, 2024';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By accessing or using the ZShop website you agree to be bound by these terms and any supplemental policies referenced herein. If you do not agree, please refrain from using the services.',
    },
    {
      title: '2. Use License',
      content:
        'We grant you a limited, non-exclusive, non-transferable license to access and use the site for lawful personal or commercial purposes. Copying, distributing, or exploiting content beyond this scope requires written permission.',
    },
    {
      title: '3. Disclaimer',
      content:
        'All information on the site is provided "as is." ZShop does not warrant that content will always be accurate, complete, or uninterrupted. We may update information at any time without prior notice.',
    },
    {
      title: '4. Limitations',
      content:
        'In no event shall ZShop or its partners be liable for indirect, incidental, or consequential damages arising from your use of the site, including but not limited to lost profits.',
    },
    {
      title: '5. Accuracy of Materials',
      content:
        'Content, imagery, and product descriptions may contain technical or typographical errors. While we strive for accuracy, ZShop does not guarantee that information is complete or current and will correct inaccuracies when identified.',
    },
    {
      title: '6. Links',
      content:
        'The site may contain links to third-party websites. ZShop is not responsible for the content, privacy policies, or practices of those sites, and accessing them is at your own risk.',
    },
    {
      title: '7. Modifications',
      content:
        'ZShop reserves the right to modify these terms at any time. Updates take effect upon posting to the site. Continued use after changes constitutes acceptance of the revised terms.',
    },
    {
      title: '8. Governing Law',
      content:
        'These terms are governed by the laws of the State of California, USA, without regard to conflict-of-law principles. Any disputes shall be resolved in the courts located in San Francisco County.',
    },
    {
      title: '9. User Accounts',
      content:
        'You are responsible for safeguarding your login credentials and notifying ZShop immediately of any unauthorized use. You remain liable for all activity that occurs under your account.',
    },
    {
      title: '10. Prohibited Uses',
      content:
        'You may not use the site for fraudulent activity, spamming, malware distribution, system intrusion, or unauthorized data collection. ZShop may suspend accounts engaged in prohibited conduct.',
    },
    {
      title: '11. Intellectual Property',
      content:
        'All content, logos, imagery, and designs are the intellectual property of ZShop or our licensors. Unauthorized use may violate copyright, trademark, or other laws.',
    },
    {
      title: '12. Termination',
      content:
        'ZShop may suspend or terminate your access for reasonable cause, including violations of these terms, legal requirements, or actions that harm other users.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 bg-[url('https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
            <div className="mt-6">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Terms of Service</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Please review these terms carefully to understand your rights and responsibilities when using ZShop services.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8">
          <p className="text-sm text-neutral-500 uppercase tracking-wide">{effectiveDate}</p>
          <p className="text-sm text-neutral-500 uppercase tracking-wide">{lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-8">
              <h2 className="font-semibold text-xl text-neutral-900 mb-3">{section.title}</h2>
              <p className="text-sm leading-relaxed text-neutral-600">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 text-sm text-neutral-600">
          <p>
            If you have questions about these terms or need assistance, contact us at <a href="mailto:legal@zshop.com" className="text-brand-600 font-semibold">legal@zshop.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
