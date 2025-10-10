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
    question: 'Mất bao lâu để lắp đặt?',
    answer:
      'Phần lớn các buổi lắp đặt kéo dài từ 1-3 giờ tùy vào số lượng và độ phức tạp của sản phẩm. Đội ngũ của chúng tôi luôn thông báo thời lượng dự kiến trước khi bắt đầu.',
  },
  {
    question: 'Có cần chuẩn bị gì không?',
    answer:
      'Vui lòng đảm bảo không gian lắp đặt sạch sẽ và có đủ diện tích trống để thao tác. Nếu có vật dụng dễ vỡ hoặc thiết bị điện tử, hãy di chuyển sang khu vực khác trước khi chúng tôi đến.',
  },
  {
    question: 'Có dọn dẹp sau lắp đặt không?',
    answer:
      'Có. Dịch vụ Assembly Service của ZShop bao gồm việc thu gom bao bì, hút bụi nhẹ và xử lý rác sau khi hoàn tất lắp đặt để bạn có thể tận hưởng không gian mới ngay lập tức.',
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
                Đặt lịch đội ngũ thợ chuyên nghiệp, được đào tạo và có bảo hiểm để lắp đặt mọi món nội thất trong nhà bạn.
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
                  <h3 className="font-semibold text-lg text-neutral-900">Đội ngũ được chứng nhận</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Kỹ thuật viên của ZShop có chứng chỉ bảo hiểm trách nhiệm, được kiểm tra lý lịch và tuân thủ quy trình an
                  toàn nghiêm ngặt của nhà sản xuất.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Hammer className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Mọi cấp độ phức tạp</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Từ ghế, bàn nhỏ đến hệ tủ bếp module, chúng tôi xử lý trọn gói và đảm bảo kết cấu bền chắc theo tiêu chuẩn.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-brand-600" />
                  <h3 className="font-semibold text-lg text-neutral-900">Bảo hành dịch vụ</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Mọi buổi lắp đặt được bảo hành 30 ngày. Nếu có vấn đề phát sinh, chúng tôi sẽ quay lại điều chỉnh miễn phí.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl text-neutral-900 mb-6">Bảng giá minh bạch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {priceTiers.map((tier) => (
                  <div key={tier.title} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <h3 className="font-semibold text-xl text-neutral-900 mb-2">{tier.title}</h3>
                    <p className="text-sm text-brand-600 font-semibold mb-3">{tier.price}</p>
                    <p className="text-sm text-neutral-600">{tier.description}</p>
                  </div>
                ))}
                <div className="md:col-span-2 p-6 rounded-2xl bg-brand-50 border border-brand-100">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">Gói Full-Room Assembly</h3>
                  <p className="text-sm text-neutral-600">
                    Lắp đặt toàn bộ phòng và được giảm 20% trên tổng chi phí dịch vụ. Bao gồm tư vấn bố trí, kiểm tra an toàn
                    điện và cố định tường khi cần thiết.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8 sticky top-32">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-brand-600" />
              <h2 className="font-display text-2xl text-neutral-900">Đặt lịch lắp đặt</h2>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              Chọn ngày, giờ và loại sản phẩm cần lắp đặt. Chúng tôi sẽ xác nhận lịch trong vòng 24 giờ và có thể đổi lịch miễn
              phí trước 48 giờ so với lịch hẹn.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Nguyễn Văn A"
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
                    placeholder="0123 456 789"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-neutral-700">
                    Ngày mong muốn
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
                    Khung giờ
                  </label>
                  <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(event) => handleChange('preferredTime', event.target.value)}
                    className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                      errors.preferredTime ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">Chọn khung giờ</option>
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
                  Loại sản phẩm
                </label>
                <select
                  id="itemCategory"
                  value={formData.itemCategory}
                  onChange={(event) => handleChange('itemCategory', event.target.value)}
                  className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                    errors.itemCategory ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Chọn loại sản phẩm</option>
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
                  Ghi chú thêm (tuỳ chọn)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ví dụ: Căn hộ có thang máy, cần mang dụng cụ khoan tường..."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi yêu cầu...' : 'Đặt lịch ngay'}
              </button>

              {submitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu và sẽ liên hệ xác nhận trong vòng 24 giờ.
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-neutral-900">Quy trình làm việc</h2>
            <p className="text-neutral-600">
              Sau khi nhận được yêu cầu, chúng tôi xác nhận thông tin, chuẩn bị dụng cụ cần thiết và đến đúng giờ đã hẹn. Mọi
              kỹ thuật viên đều sử dụng tấm trải bảo vệ sàn, đảm bảo không gian sạch sẽ và an toàn.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[`Khảo sát & xác nhận lịch`, `Lắp đặt chuyên nghiệp`, `Kiểm tra an toàn`, `Dọn dẹp hoàn thiện`].map((step) => (
                <div key={step} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-700">
                  {step}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              Có thể thay đổi lịch miễn phí trước 48 giờ. Hủy lịch dưới 24 giờ sẽ thu phí $40 để bù chi phí chuẩn bị nhân sự.
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
                <p className="text-sm font-semibold text-neutral-900">Xác nhận lịch trong 24 giờ</p>
                <p className="text-xs text-neutral-500">Hỗ trợ đổi lịch linh hoạt trước 48 giờ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 border border-neutral-200 rounded-3xl p-10">
          <h2 className="font-display text-3xl text-neutral-900 mb-6">Câu hỏi thường gặp</h2>
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
