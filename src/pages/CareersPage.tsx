import { ChangeEvent, useState } from 'react';
import { Building2, CheckCircle2, MapPin, Send, Shield, Users2 } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string;
  department: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  applyEmail: string;
}

interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  positionId: string;
  coverLetter: string;
  startDate: string;
  resumeName: string;
}

interface FormErrors {
  [key: string]: string;
}

const jobOpenings: JobOpening[] = [
  {
    id: 'sales-showroom',
    title: 'Sales Associate - Showroom',
    location: 'San Francisco, CA',
    type: 'Full-time',
    department: 'Retail',
    description:
      'Welcome clients in the showroom, guide them to the right pieces, and deliver a luxury shopping experience.',
    requirements: [
      'At least 2 years of furniture or luxury retail sales experience.',
      'Outstanding communication skills; bilingual in English and Vietnamese is a plus.',
      'Passion for interior design and emerging style trends.',
    ],
    responsibilities: [
      'Greet visitors, uncover their needs, and present curated product recommendations.',
      'Manage the client pipeline and collaborate with the design team.',
      'Maintain an elevated, on-brand showroom presentation.',
    ],
    applyEmail: 'careers@zshop.com',
  },
  {
    id: 'interior-consultant',
    title: 'Interior Design Consultant',
    location: 'Remote (US)',
    type: 'Part-time',
    department: 'Design',
    description:
      'Provide virtual interior design consultations nationwide, from mood boards to detailed product recommendations.',
    requirements: [
      'Interior design degree or certification.',
      'Portfolio of completed projects with strong 2D/3D presentation skills.',
      'Self-starter who manages time independently.',
    ],
    responsibilities: [
      'Interpret client briefs and build compelling concepts.',
      'Partner with stylists to source products that match budget and style.',
      'Present solutions and revisions over video calls.',
    ],
    applyEmail: 'design-careers@zshop.com',
  },
  {
    id: 'warehouse-associate',
    title: 'Warehouse Associate',
    location: 'Oakland, CA',
    type: 'Full-time',
    department: 'Operations',
    description:
      'Oversee inventory, handle picking and packing, and support on-time delivery coordination.',
    requirements: [
      'Able to safely lift up to 50 lbs.',
      '1+ year of warehouse operations experience.',
      'Detail oriented and committed to safety procedures.',
    ],
    responsibilities: [
      'Receive and inspect inbound merchandise.',
      'Pack outgoing orders to FurniCraft standards.',
      'Coordinate with the delivery team and update inventory records.',
    ],
    applyEmail: 'ops-careers@zshop.com',
  },
  {
    id: 'customer-service',
    title: 'Customer Service Representative',
    location: 'Remote (US)',
    type: 'Full-time',
    department: 'Customer Experience',
    description:
      'Support customers via email, chat, and phone to deliver a consistent, high-touch experience.',
    requirements: [
      '2+ years of customer service in retail or e-commerce.',
      'Strong problem-solving abilities and polished communication.',
      'Flexible schedule with availability for weekend shifts.',
    ],
    responsibilities: [
      'Respond to customer tickets within the defined SLA.',
      'Collaborate with cross-functional teams to resolve issues.',
      'Capture customer feedback and surface insights for process improvements.',
    ],
    applyEmail: 'cx-careers@zshop.com',
  },
  {
    id: 'delivery-driver',
    title: 'Delivery Driver',
    location: 'San Jose, CA',
    type: 'Full-time',
    department: 'Logistics',
    description:
      'Deliver premium furniture to customers with punctuality and care.',
    requirements: [
      "Valid Class C driver's license with a clean driving record.",
      '2+ years of final-mile delivery experience.',
      'Customer-first mindset and professional demeanor.',
    ],
    responsibilities: [
      'Transport, perform light assembly, and walk customers through product care.',
      'Inspect merchandise before loading and after delivery.',
      'Report issues promptly to the logistics manager.',
    ],
    applyEmail: 'logistics-careers@zshop.com',
  },
];

export function CareersPage() {
  usePageMetadata({
    title: 'Careers at FurniCraft',
    description:
      'Explore open positions at FurniCraft, learn about our culture and benefits, and submit your application to join the team.',
  });

  const [selectedJobId, setSelectedJobId] = useState(jobOpenings[0].id);
  const [formData, setFormData] = useState<ApplicationForm>({
    name: '',
    email: '',
    phone: '',
    positionId: jobOpenings[0].id,
    coverLetter: '',
    startDate: '',
    resumeName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof ApplicationForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange('resumeName', file.name);
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.positionId) newErrors.positionId = 'Select the position you are applying for.';
    if (!formData.resumeName) newErrors.resumeName = 'Please upload your resume.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        positionId: selectedJobId,
        coverLetter: '',
        startDate: '',
        resumeName: '',
      });
    }, 1000);
  };

  const selectedJob = jobOpenings.find((job) => job.id === selectedJobId) ?? jobOpenings[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Careers</h1>
              <p className="text-white/80 text-lg">
                Join the FurniCraft team where creativity, service excellence, and long-term career growth are celebrated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users2 className="w-6 h-6 text-brand-600" />
                <h2 className="font-display text-3xl text-neutral-900">Why Join Us</h2>
              </div>
              <p className="text-neutral-600 mb-6">
                We foster a respectful, creative, and transparent workplace. The FurniCraft team is made up of people who love design, customer experience, and technology, and who support one another to achieve shared goals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-brand-600" />
                    <p className="font-semibold text-sm text-neutral-900">Benefits</p>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5">
                    <li>Health, dental & vision insurance</li>
                    <li>401(k) with employer match</li>
                    <li>Employee discount 30%</li>
                    <li>Flexible hours & hybrid policy</li>
                  </ul>
                </div>
                <div className="border border-neutral-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-brand-600" />
                    <p className="font-semibold text-sm text-neutral-900">Culture</p>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5">
                    <li>Quarterly team retreats</li>
                    <li>Learning stipend of $1,000 per year</li>
                    <li>Mentorship & growth plan</li>
                    <li>Diversity & inclusion programs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl">
              <h2 className="font-display text-3xl text-neutral-900 mb-4">Open Positions</h2>
              <div className="space-y-6">
                {jobOpenings.map((job) => (
                  <article
                    key={job.id}
                    className={`rounded-2xl border p-6 transition-all ${
                      job.id === selectedJobId ? 'border-brand-600 bg-brand-50 shadow-lg' : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold text-xl text-neutral-900">{job.title}</h3>
                      <span className="text-xs font-semibold uppercase text-brand-600">{job.type}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span className="inline-flex items-center gap-1"><Users2 className="w-3.5 h-3.5" /> {job.department}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id);
                        handleChange('positionId', job.id);
                      }}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
                    >
                      View details <Send className="w-4 h-4" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="border border-neutral-200 rounded-3xl p-8 bg-white shadow-xl">
              <h2 className="font-display text-3xl text-neutral-900 mb-4">Role Overview</h2>
              <p className="text-sm text-neutral-600 mb-4">{selectedJob.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm uppercase">Requirements</h3>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    {selectedJob.requirements.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm uppercase">Responsibilities</h3>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    {selectedJob.responsibilities.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                Apply via email: <a href={`mailto:${selectedJob.applyEmail}`} className="text-brand-600 font-semibold">{selectedJob.applyEmail}</a>
              </p>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-8 bg-white shadow-xl">
              <h2 className="font-display text-3xl text-neutral-900 mb-4">Application Form</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-neutral-700">
                      Full Name
                    </label>
                    <input
                      id="appName"
                      type="text"
                      value={formData.name}
                      onChange={(event) => handleChange('name', event.target.value)}
                      className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="Alex Nguyen"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="appEmail" className="block text-sm font-medium text-neutral-700">
                      Email
                    </label>
                    <input
                      id="appEmail"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appPhone" className="block text-sm font-medium text-neutral-700">
                      Phone
                    </label>
                    <input
                      id="appPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => handleChange('phone', event.target.value)}
                      className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="appPosition" className="block text-sm font-medium text-neutral-700">
                      Position Applying For
                    </label>
                    <select
                      id="appPosition"
                      value={formData.positionId}
                      onChange={(event) => handleChange('positionId', event.target.value)}
                      className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                        errors.positionId ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    >
                      <option value="">Select a position</option>
                      {jobOpenings.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                    {errors.positionId && <p className="mt-1 text-xs text-red-600">{errors.positionId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appStartDate" className="block text-sm font-medium text-neutral-700">
                      Available Start Date
                    </label>
                    <input
                      id="appStartDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(event) => handleChange('startDate', event.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="appResume" className="block text-sm font-medium text-neutral-700">
                      Upload Resume (PDF)
                    </label>
                    <input
                      id="appResume"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formData.resumeName && <p className="mt-1 text-xs text-neutral-500">Selected: {formData.resumeName}</p>}
                    {errors.resumeName && <p className="mt-1 text-xs text-red-600">{errors.resumeName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="appCoverLetter" className="block text-sm font-medium text-neutral-700">
                    Cover Letter
                  </label>
                  <textarea
                    id="appCoverLetter"
                    value={formData.coverLetter}
                    onChange={(event) => handleChange('coverLetter', event.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Share your achievements and tell us why you want to join FurniCraft..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>

                {submitted && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Thank you for applying! Our talent team will review your submission and respond within five business days.
                  </div>
                )}
              </form>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default CareersPage;
