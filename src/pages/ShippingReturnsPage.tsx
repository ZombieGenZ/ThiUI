import { PackageCheck, Plane, RotateCcw, Truck } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

export function ShippingReturnsPage() {
  usePageMetadata({
    title: 'Shipping & Returns',
    description:
      'Learn about ZShop\'s shipping and returns policies including delivery options, international shipping, and how to start a return.',
  });

  const shippingOptions = [
    {
      name: 'Free Shipping',
      description: 'Complimentary delivery on orders above $500 across the continental U.S.',
      price: '$0',
      timeline: '5-7 business days',
    },
    {
      name: 'Standard Delivery',
      description: 'Carefully packaged furniture delivered to your door with reliable tracking updates.',
      price: '$50',
      timeline: '5-7 business days',
    },
    {
      name: 'Express Delivery',
      description: 'Priority processing and shipping to receive your order within 2-3 business days.',
      price: '$100',
      timeline: '2-3 business days',
    },
    {
      name: 'White Glove Delivery',
      description: 'Premium service that includes room-of-choice delivery, professional assembly, and cleanup.',
      price: '$200',
      timeline: 'Scheduled at your convenience',
    },
  ];

  const returnSteps = [
    {
      title: 'Contact Support',
      detail: 'Reach out to our concierge team with your order number and reason for return within 30 days.',
    },
    {
      title: 'Receive RMA',
      detail: 'We will email your Return Merchandise Authorization (RMA) number and prepaid label when eligible.',
    },
    {
      title: 'Pack Securely',
      detail: 'Return items in original packaging, unused, and unassembled to avoid restocking fees.',
    },
    {
      title: 'Refund Processing',
      detail: 'Refunds are issued within 5-7 business days after inspection. Faulty items receive 100% refunds.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Shipping & Returns' },
              ]}
            />
            <div className="mt-6 max-w-2xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Shipping & Returns</h1>
              <p className="text-white/80 text-lg">
                Reliable delivery options worldwide and a streamlined return process designed for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Shipping Policy</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl mb-8">
            ZShop partners with leading logistics specialists to deliver every order safely and on schedule. All
            shipments include real-time tracking numbers sent via email within 24 hours of dispatch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingOptions.map((option) => (
              <div
                key={option.name}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">{option.name}</h3>
                <p className="text-sm text-neutral-600 mb-4">{option.description}</p>
                <div className="flex items-center justify-between text-sm font-medium text-neutral-800">
                  <span>{option.price}</span>
                  <span>{option.timeline}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100">
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-6 h-6 text-brand-600" />
                <h3 className="font-semibold text-neutral-900 text-lg">Global Delivery Network</h3>
              </div>
              <p className="text-sm text-neutral-600">
                We deliver nationwide and internationally, coordinating customs documentation and white glove services for
                international clients to ensure seamless arrivals.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-900 text-white">
              <div className="flex items-center gap-3 mb-4">
                <PackageCheck className="w-6 h-6 text-brand-400" />
                <h3 className="font-semibold text-lg">Order Tracking</h3>
              </div>
              <p className="text-sm text-white/80">
                Track your purchase effortlessly. Each shipment receives a tracking link via email within 24 hours. Sign up
                for SMS alerts to receive milestone updates from processing to delivery.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-neutral-200">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-brand-600" />
                <h3 className="font-semibold text-lg text-neutral-900">Delivery Preparation</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Please ensure entryways are clear and measure doorways in advance. White glove teams handle assembly,
                placement, and debris removal for a polished finish.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <RotateCcw className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Return Policy</h2>
          </div>
          <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 text-neutral-600">
                <p>
                  Returns are accepted within 30 days of delivery for merchandise in pristine, unassembled condition with
                  original packaging. Custom orders, clearance items, and mattresses are final sale.
                </p>
                <p>
                  Manufacturer defects receive full refunds, including shipping. Change-of-mind returns incur a $75 return
                  service fee to cover carrier costs. Refunds are processed 5-7 business days after inspection.
                </p>
                <p className="font-medium text-neutral-900">
                  Need assistance? Email support@zshop.com or call (800) 555-0199 and our concierge team will guide you
                  through every step.
                </p>
              </div>
              <div className="space-y-6">
                {returnSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                      <p className="text-sm text-neutral-600">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-2xl text-neutral-900">Return Eligibility Checklist</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
              {[
                'Product remains unused and unassembled',
                'All hardware, manuals, and accessories included',
                'Original packaging and protective materials intact',
                'Return requested within 30 days of delivery',
                'RMA number clearly labeled on the package',
                'No damage caused by improper handling or installation',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex w-2.5 h-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg text-neutral-900 mb-4">Need to exchange an item?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              We are happy to arrange exchanges for different sizes or finishes. Contact support within 30 days and we will
              coordinate a pickup and delivery schedule that works for you.
            </p>
            <a
              href="mailto:support@zshop.com"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Email Support Team
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ShippingReturnsPage;
