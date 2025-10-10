import { useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, Hammer, ShieldCheck } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  itemCategory: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const priceTiers = [
  {
    title: 'Small Items',
    price: '$50 - $75',
    description: 'Accent chairs, side tables, stools, nightstands, single shelving units.',
  },
  {
    title: 'Medium Items',
    price: '$100 - $150',
    description: 'Beds, dining tables, media consoles, dressers, multi-piece storage sets.',
  },
  {
    title: 'Large Items',
    price: '$200 - $300',
    description: 'Sectional sofas, wall units, large wardrobes, multi-component seating groups.',
  },
  {
    title: 'Complex Installations',
    price: '$400+',
    description: 'Custom cabinetry, built-ins, modular closet systems, kitchen installations.',
  },
];

const faqs = [
  {
    question: 'How long does assembly take?',
    answer:
      'Most appointments run 1-3 hours depending on how many pieces you have and the complexity involved. Our team confirms the estimated duration before we get started.',
  },
  {
    question: 'What should I prepare before the team arrives?',
    answer:
      'Please clear the installation area and make sure there is enough open space to work. Move fragile decor or electronics to a safe spot prior to our arrival.',
  },
  {
    question: 'Do you handle cleanup afterward?',
    answer:
      "Yes. ZShop's assembly service includes bagging packaging, light vacuuming, and removing debris so you can enjoy your newly furnished room right away.",
  },
];

export function AssemblyServicesPage() {
  usePageMetadata({
    title: 'Assembly Services',
    description:
      'Book professional furniture assembly with insured technicians, transparent pricing, and flexible scheduling from ZShop.',
  });

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    itemCategory: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Please provide your full name.';
    if (!formData.email.trim()) newErrors.email = 'An email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address.';

    if (!formData.phone.trim()) newErrors.phone = 'A contact phone number is required.';
    if (!formData.preferredDate) newErrors.preferredDate = 'Choose your preferred service date.';
    if (!formData.preferredTime) newErrors.preferredTime = 'Select a time slot.';
    if (!formData.itemCategory) newErrors.itemCategory = 'Select the type of item to assemble.';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitted(false);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        preferredDate: '',
        preferredTime: '',
        itemCategory: '',
        notes: '',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/3665354/pexels-photo-3665354.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Assembly Services' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Assembly Services</h1>
              <p className="text-white/80 text-lg">
                Schedule insured, highly trained technicians to assemble every piece of furniture in your home.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Certified Technicians</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  ZShop technicians carry liability insurance, pass background checks, and follow strict manufacturer safety
                  protocols.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Hammer className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">All Levels of Complexity</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  From accent chairs and side tables to modular kitchens, we handle every project end-to-end and ensure lasting stability.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Service Guarantee</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Every appointment is backed by a 30-day workmanship warranty. If anything needs attention, we return to fix it at no extra charge.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl text-neutral-900 mb-6">Transparent Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {priceTiers.map((tier) => (
                  <div key={tier.title} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <h3 className="font-semibold text-xl text-neutral-900 mb-2">{tier.title}</h3>
                    <p className="text-sm text-brand-600 font-semibold mb-3">{tier.price}</p>
                    <p className="text-sm text-neutral-600">{tier.description}</p>
                  </div>
                ))}
                <div className="md:col-span-2 p-6 rounded-2xl bg-brand-50 border border-brand-100">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">Full-Room Assembly Package</h3>
                  <p className="text-sm text-neutral-600">
                    Outfit an entire room and save 20% on labor. Includes layout guidance, electrical safety checks, and wall anchoring when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8 sticky top-32">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-brand-600" />
              <h2 className="font-display text-2xl text-neutral-900">Book an Assembly Visit</h2>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              Choose your date, time, and item category. We confirm within 24 hours and offer free rescheduling up to 48 hours before your appointment.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="555-123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-neutral-700">
                    Preferred Date
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(event) => handleChange('preferredDate', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.preferredDate ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  />
                  {errors.preferredDate && <p className="mt-1 text-xs text-red-600">{errors.preferredDate}</p>}
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-neutral-700">
                    Time Slot
                  </label>
                  <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(event) => handleChange('preferredTime', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.preferredTime ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">Select a time slot</option>
                    {['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'].map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.preferredTime && <p className="mt-1 text-xs text-red-600">{errors.preferredTime}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="itemCategory" className="block text-sm font-medium text-neutral-700">
                  Item Category
                </label>
                <select
                  id="itemCategory"
                  value={formData.itemCategory}
                  onChange={(event) => handleChange('itemCategory', event.target.value)}
                  className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                    errors.itemCategory ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Select an item category</option>
                  <option value="Small Items">Small Items</option>
                  <option value="Medium Items">Medium Items</option>
                  <option value="Large Items">Large Items</option>
                  <option value="Complex Items">Complex Items</option>
                  <option value="Full-Room Assembly">Full-Room Assembly</option>
                </select>
                {errors.itemCategory && <p className="mt-1 text-xs text-red-600">{errors.itemCategory}</p>}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
                  Additional notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="For example: Elevator access available, please bring wall-mounting tools..."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting request...' : 'Schedule Appointment'}
              </button>

              {submitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Thank you! We have received your request and will confirm within 24 hours.
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-neutral-900">How the Service Works</h2>
            <p className="text-neutral-600">
              After receiving your request, we confirm the details, prepare the necessary tools, and arrive right on time. Every technician uses protective floor coverings to keep your home clean and safe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[`Consult & confirm schedule`, `Professional assembly`, `Safety inspection`, `Clean-up & handoff`].map((step) => (
                <div key={step} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-700">
                  {step}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              Reschedule for free up to 48 hours in advance. Cancellations within 24 hours incur a $40 staffing fee.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/5591669/pexels-photo-5591669.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Technicians assembling a wooden bed frame"
              className="w-full rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 bg-white border border-neutral-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
              <CalendarClock className="w-8 h-8 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Schedule confirmed within 24 hours</p>
                <p className="text-xs text-neutral-500">Flexible rescheduling up to 48 hours ahead</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 border border-neutral-200 rounded-3xl p-10">
          <h2 className="font-display text-3xl text-neutral-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-white border border-neutral-200 overflow-hidden"
                open={index === 0}
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer">
                  <span className="text-sm font-semibold text-neutral-900">{faq.question}</span>
                  <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-neutral-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AssemblyServicesPage;
