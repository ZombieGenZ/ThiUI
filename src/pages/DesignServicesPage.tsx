import { useState } from 'react';
import { ClipboardPenLine, PenTool, Sparkles, Video } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface DesignFormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  contactMethod: string;
  startDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const packages = [
  {
    name: 'Basic Consultation',
    price: '$200',
    features: [
      '1 giờ video call với interior designer',
      'Gợi ý bố cục, bảng màu, style định hướng',
      'Danh sách mua sắm sản phẩm gợi ý',
    ],
  },
  {
    name: 'Room Design Package',
    price: '$800',
    features: [
      'Phiên tư vấn chuyên sâu',
      '2D floor plan với kích thước chi tiết',
      'Mood board & bảng màu',
      'Danh sách sản phẩm kèm link mua',
      '2 vòng chỉnh sửa',
    ],
  },
  {
    name: 'Full Home Design',
    price: '$3,000+',
    features: [
      'Khảo sát tại nhà',
      'Floor plan toàn bộ không gian',
      '3D rendering chất lượng cao',
      'Sourcing sản phẩm và quản lý dự án',
      'Phối hợp lắp đặt trọn gói',
    ],
  },
];

export function DesignServicesPage() {
  usePageMetadata({
    title: 'Design Services',
    description:
      'Work with ZShop interior designers for personalized consultations, room packages, or full home design solutions.',
  });

  const [formData, setFormData] = useState<DesignFormData>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
    contactMethod: 'Email',
    startDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ và tên.';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ.';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại.';
    if (!formData.projectType) newErrors.projectType = 'Chọn loại dự án bạn quan tâm.';
    if (!formData.budget) newErrors.budget = 'Chọn mức ngân sách dự kiến.';
    if (!formData.timeline) newErrors.timeline = 'Chọn mốc thời gian mong muốn.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof DesignFormData, value: string) => {
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
        projectType: '',
        budget: '',
        timeline: '',
        message: '',
        contactMethod: 'Email',
        startDate: '',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Design Services' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Design Services</h1>
              <p className="text-white/80 text-lg">
                Đội ngũ interior designer của ZShop sẽ đồng hành từ concept đến thi công, tạo nên không gian sống phản ánh cá
                tính và nhu cầu của bạn.
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
                  <Sparkles className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Styling cá nhân hóa</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Chúng tôi khám phá phong cách sống, thói quen và gu thẩm mỹ của bạn để tạo nên concept độc đáo và thực tế.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <PenTool className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Quy trình rõ ràng</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Từ phác thảo ý tưởng, phát triển moodboard, floor plan, đến sourcing sản phẩm - mọi bước đều minh bạch.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Hỗ trợ linh hoạt</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Gặp gỡ trực tiếp tại showroom, qua video call hoặc onsite visit tùy theo nhu cầu và lịch trình của bạn.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl text-neutral-900 mb-6">Các gói dịch vụ</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.name} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-lg">
                    <h3 className="font-semibold text-xl text-neutral-900 mb-2">{pkg.name}</h3>
                    <p className="text-brand-600 font-semibold mb-4">{pkg.price}</p>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex w-1.5 h-1.5 rounded-full bg-brand-600" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8 sticky top-32">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardPenLine className="w-6 h-6 text-brand-600" />
              <h2 className="font-display text-2xl text-neutral-900">Schedule Discovery Call</h2>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              Điền thông tin bên dưới để chúng tôi liên hệ trong 24 giờ làm việc. Bạn có thể đính kèm hình ảnh hiện trạng ở bước
              tiếp theo sau khi gửi form.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Họ và tên
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Nguyễn Thị B"
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
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="0909 000 111"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-neutral-700">
                  Loại dự án
                </label>
                <select
                  id="projectType"
                  value={formData.projectType}
                  onChange={(event) => handleChange('projectType', event.target.value)}
                  className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                    errors.projectType ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Chọn dự án</option>
                  <option value="Living Room">Living Room Refresh</option>
                  <option value="Bedroom">Bedroom Retreat</option>
                  <option value="Full Home">Full Home Design</option>
                  <option value="Office">Home Office Setup</option>
                  <option value="Commercial">Commercial Space</option>
                </select>
                {errors.projectType && <p className="mt-1 text-xs text-red-600">{errors.projectType}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-neutral-700">
                    Ngân sách dự kiến
                  </label>
                  <select
                    id="budget"
                    value={formData.budget}
                    onChange={(event) => handleChange('budget', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.budget ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">Chọn ngân sách</option>
                    <option value="Under $5,000">Under $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000+">$25,000+</option>
                  </select>
                  {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
                </div>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-neutral-700">
                    Thời gian mong muốn
                  </label>
                  <select
                    id="timeline"
                    value={formData.timeline}
                    onChange={(event) => handleChange('timeline', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.timeline ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">Chọn thời gian</option>
                    <option value="1-2 months">1-2 tháng</option>
                    <option value="3-4 months">3-4 tháng</option>
                    <option value="5-6 months">5-6 tháng</option>
                    <option value="Flexible">Linh hoạt</option>
                  </select>
                  {errors.timeline && <p className="mt-1 text-xs text-red-600">{errors.timeline}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">
                  Thời điểm bắt đầu dự kiến (tuỳ chọn)
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(event) => handleChange('startDate', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
                  Mô tả dự án
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Chia sẻ mục tiêu, phong cách yêu thích, diện tích..."
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-neutral-700 mb-2">Preferred contact method</span>
                <div className="flex gap-3">
                  {['Email', 'Phone', 'Video Call'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleChange('contactMethod', method)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        formData.contactMethod === method
                          ? 'border-brand-600 bg-brand-50 text-brand-600'
                          : 'border-neutral-300 text-neutral-500 hover:border-brand-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Schedule Free Discovery Call'}
              </button>

              {submitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ liên hệ để sắp lịch Discovery Call.
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="bg-neutral-50 border border-neutral-200 rounded-3xl p-10">
          <h2 className="font-display text-3xl text-neutral-900 mb-6">Quy trình hợp tác</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Discovery Call', description: 'Tìm hiểu nhu cầu, phong cách và ngân sách của bạn.' },
              { title: 'Concept & Moodboard', description: 'Xây dựng moodboard và đề xuất bảng màu.' },
              { title: 'Design Development', description: 'Triển khai bản vẽ, floor plan, danh sách sản phẩm chi tiết.' },
              { title: 'Installation Support', description: 'Theo sát quá trình đặt hàng, lắp đặt và styling hoàn thiện.' },
            ].map((step, index) => (
              <div key={step.title} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold mb-3">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-lg text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-600 mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DesignServicesPage;
