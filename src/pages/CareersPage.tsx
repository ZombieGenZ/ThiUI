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
      'Chào đón khách hàng tại showroom, tư vấn sản phẩm phù hợp và đảm bảo trải nghiệm mua sắm cao cấp.',
    requirements: [
      'Ít nhất 2 năm kinh nghiệm bán lẻ nội thất hoặc luxury lifestyle',
      'Kỹ năng giao tiếp xuất sắc, nói được tiếng Anh và Việt',
      'Yêu thích thiết kế nội thất và cập nhật xu hướng',
    ],
    responsibilities: [
      'Đón tiếp, khai thác nhu cầu và giới thiệu sản phẩm phù hợp',
      'Theo dõi pipeline khách hàng và phối hợp với bộ phận thiết kế',
      'Đảm bảo trưng bày showroom luôn chỉn chu',
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
      'Tư vấn thiết kế nội thất trực tuyến cho khách hàng trên toàn quốc, từ moodboard đến đề xuất sản phẩm chi tiết.',
    requirements: [
      'Bằng cấp hoặc chứng chỉ thiết kế nội thất',
      'Có portfolio dự án thực tế và kỹ năng trình bày 2D/3D',
      'Làm việc độc lập, tự quản lý thời gian',
    ],
    responsibilities: [
      'Tiếp nhận brief từ khách hàng và phát triển concept',
      'Phối hợp stylist chọn sản phẩm phù hợp ngân sách',
      'Thuyết trình giải pháp thông qua video call',
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
      'Quản lý kho, kiểm đếm, đóng gói và hỗ trợ điều phối giao hàng đúng tiến độ.',
    requirements: [
      'Sức khỏe tốt, có thể nâng vật nặng tới 50 lbs',
      'Kinh nghiệm làm việc kho ít nhất 1 năm',
      'Cẩn thận, tuân thủ quy trình an toàn lao động',
    ],
    responsibilities: [
      'Nhận và kiểm tra hàng hoá nhập kho',
      'Đóng gói đơn hàng theo tiêu chuẩn ZShop',
      'Phối hợp với đội giao nhận và cập nhật tồn kho',
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
      'Hỗ trợ khách hàng qua email, chat và điện thoại, đảm bảo trải nghiệm dịch vụ đồng nhất.',
    requirements: [
      'Kinh nghiệm CSKH 2 năm trong lĩnh vực bán lẻ hoặc e-commerce',
      'Kỹ năng xử lý tình huống và giao tiếp chuyên nghiệp',
      'Có thể làm việc theo ca, bao gồm cuối tuần',
    ],
    responsibilities: [
      'Trả lời ticket trong SLA quy định',
      'Phối hợp các bộ phận liên quan giải quyết vấn đề',
      'Ghi nhận phản hồi khách hàng để cải thiện quy trình',
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
      'Giao hàng nội thất cao cấp tới khách hàng, đảm bảo đúng giờ và an toàn.',
    requirements: [
      'Bằng lái hạng C, hồ sơ lái xe sạch',
      'Kinh nghiệm giao hàng chặng cuối 2 năm',
      'Kỹ năng chăm sóc khách hàng tốt, thái độ chuyên nghiệp',
    ],
    responsibilities: [
      'Vận chuyển, lắp đặt cơ bản và hướng dẫn khách sử dụng',
      'Kiểm tra tình trạng sản phẩm trước và sau giao',
      'Báo cáo nhanh cho quản lý khi phát sinh sự cố',
    ],
    applyEmail: 'logistics-careers@zshop.com',
  },
];

export function CareersPage() {
  usePageMetadata({
    title: 'Careers at ZShop',
    description:
      'Explore open positions at ZShop, learn about our culture and benefits, and submit your application to join the team.',
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
                Gia nhập đội ngũ ZShop, nơi chúng tôi tôn vinh sự sáng tạo, tinh thần dịch vụ và phát triển sự nghiệp bền vững.
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
                Chúng tôi xây dựng môi trường tôn trọng, sáng tạo và minh bạch. Đội ngũ ZShop gồm những con người đam mê thiết
                kế, dịch vụ khách hàng và công nghệ, sẵn sàng hỗ trợ nhau đạt mục tiêu chung.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-brand-600" />
                    <p className="font-semibold text-sm text-neutral-900">Benefits</p>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5">
                    <li>Health, dental & vision insurance</li>
                    <li>401(k) với employer match</li>
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
                    <li>Learning stipend $1,000/năm</li>
                    <li>Mentorship & growth plan</li>
                    <li>Đa dạng & hòa nhập</li>
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
                    placeholder="Chia sẻ thành tích nổi bật, lý do bạn muốn gia nhập ZShop..."
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
                    Cảm ơn bạn đã ứng tuyển! Chúng tôi sẽ xem xét hồ sơ và phản hồi trong 5 ngày làm việc.
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
