import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Ordering & Payment',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Shop online by adding products to your cart and completing checkout. You can also call (800) 555-0199 or visit the showroom for personalized assistance.',
      },
      {
        question: 'Which payment methods do you accept?',
        answer:
          'We accept major credit and debit cards (Visa, MasterCard, Amex), Apple Pay, Google Pay, PayPal, bank transfer, and 0% APR financing with Affirm on orders over $300.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer:
          'Orders can be updated or canceled within 24 hours of purchase. Afterward, please contact support@zshop.com. Orders already handed to the carrier may incur a restocking fee.',
      },
      {
        question: 'How do I apply a coupon code?',
        answer:
          'Enter your code during checkout in the Order Summary section. Only one code may be used per order and some exclusions apply to sale items and design services.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long will delivery take?',
        answer:
          'Standard Delivery arrives within 5-7 business days, Express Delivery takes 2-3 days, and White Glove Delivery is scheduled at your convenience. Custom items may require an additional 2-4 weeks.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes. FurniCraft ships nationwide and to more than 25 international destinations. Shipping costs and timelines are calculated at checkout based on your address.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your order ships you will receive an email with a tracking number. Visit the Track Order page any time to follow the real-time status.',
      },
      {
        question: 'What happens if I am not home at delivery?',
        answer:
          'For Standard or Express deliveries, the carrier will attempt a re-delivery or leave a notice. For White Glove Delivery we will reschedule at no charge within 48 hours.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'Returns are accepted within 30 days when items are unused, unassembled, and in their original packaging. Custom items, clearance items, and mattresses are final sale.',
      },
      {
        question: 'How do I start a return?',
        answer:
          'Contact our support team to receive an RMA number and packing instructions. We will send a prepaid label and arrange carrier pickup.',
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Refunds are processed within 5-7 business days after the warehouse inspects your return. Defective products qualify for a full refund.',
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        question: 'Do your products include a warranty?',
        answer:
          'All pieces feature a standard two-year warranty covering frames, structure, and manufacturing defects. Select premium collections include extended five-year coverage.',
      },
      {
        question: 'Can I request material or fabric swatches?',
        answer:
          'Absolutely. Request up to six complimentary fabric, wood, or leather swatches online and we will ship them within 3-5 days.',
      },
      {
        question: 'How long do custom orders take?',
        answer:
          'Custom projects typically require 6-10 weeks for production and delivery depending on materials and design complexity.',
      },
      {
        question: 'Where can I find product care instructions?',
        answer:
          'Each item ships with detailed care guidelines. You can also log in to your account and visit Product Care to download maintenance tips.',
      },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Select "Sign Up" in the top-right corner, provide your email, password, and contact details, then confirm via the verification email.',
      },
      {
        question: 'What if I forget my password?',
        answer:
          'Use the "Forgot Password" option, enter your registered email, and follow the reset link sent to your inbox.',
      },
      {
        question: 'How can I contact customer service?',
        answer:
          'Chat with us on the website, email support@zshop.com, or call (800) 555-0199 daily from 8:00 AM to 8:00 PM.',
      },
    ],
  },
];

export function FAQPage() {
  usePageMetadata({
    title: 'Frequently Asked Questions',
    description:
      'Find answers about ordering, shipping, returns, product care, and support at FurniCraft to make furniture shopping effortless.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/8136910/pexels-photo-8136910.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">FAQ</h1>
              <p className="text-white/80 text-lg">
                Browse the most common questions so you can shop for and care for your FurniCraft furniture with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1 space-y-4">
            <div className="sticky top-32 p-6 border border-neutral-200 rounded-3xl bg-white shadow-sm">
              <h2 className="font-semibold text-lg text-neutral-900 mb-2">Need more help?</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Chat live, send us an email, or book a consultation with a stylist for personalized recommendations.
              </p>
              <div className="space-y-2 text-sm">
                <a href="mailto:support@zshop.com" className="block text-brand-600 font-semibold">
                  support@zshop.com
                </a>
                <p className="text-neutral-600">Hotline: (800) 555-0199</p>
              </div>
            </div>
          </aside>
          <div className="lg:col-span-3 space-y-8">
            {faqSections.map((section) => (
              <section key={section.title} className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8">
                <h2 className="font-display text-2xl text-neutral-900 mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <details key={item.question} className="group rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer">
                        <span className="text-sm font-semibold text-neutral-900">{item.question}</span>
                        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <div className="px-6 pb-4 text-sm text-neutral-600 leading-relaxed">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
