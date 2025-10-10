import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'Personal information: họ tên, email, số điện thoại, địa chỉ giao hàng và thanh toán.',
      'Payment information: dữ liệu thẻ tín dụng được mã hóa và xử lý thông qua đối tác thanh toán đạt chuẩn PCI-DSS.',
      'Browsing data: cookies, địa chỉ IP, loại thiết bị, hành vi duyệt web để tối ưu trải nghiệm.',
    ],
  },
  {
    title: '2. How We Use Information',
    content: [
      'Xử lý đơn hàng, giao hàng và cung cấp dịch vụ hậu mãi.',
      'Gửi thông báo về đơn hàng, cập nhật sản phẩm và chương trình khuyến mãi (khi có sự đồng ý).',
      'Phân tích dữ liệu để cải thiện website, cá nhân hóa đề xuất sản phẩm.',
      'Triển khai chiến dịch marketing, retargeting khi bạn cho phép.',
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      'ZShop không bán hoặc cho thuê dữ liệu cá nhân của bạn.',
      'Chúng tôi chia sẻ thông tin với đối tác vận chuyển, xử lý thanh toán, nhà cung cấp dịch vụ marketing khi cần thiết để hoàn thành đơn hàng.',
      'Thông tin có thể được cung cấp theo yêu cầu pháp lý hoặc khi cần bảo vệ quyền lợi của ZShop và khách hàng.',
    ],
  },
  {
    title: '4. Cookies',
    content: [
      'Essential cookies: duy trì phiên đăng nhập, giỏ hàng và bảo mật.',
      'Analytics cookies: đo lường hiệu suất trang, hành vi người dùng (Google Analytics).',
      'Marketing cookies: phục vụ quảng cáo cá nhân hóa (Facebook Pixel, Google Ads).',
      'Bạn có thể quản lý cookie qua phần cài đặt trình duyệt hoặc banner tuỳ chỉnh khi truy cập lần đầu.',
    ],
  },
  {
    title: '5. Data Security',
    content: [
      'Mã hóa SSL cho mọi giao dịch và truyền tải dữ liệu.',
      'Máy chủ đặt tại trung tâm dữ liệu đạt chuẩn ISO 27001 với cơ chế kiểm soát truy cập nghiêm ngặt.',
      'Thực hiện đánh giá bảo mật định kỳ và chương trình phát hiện xâm nhập.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'Truy cập, chỉnh sửa hoặc yêu cầu xoá dữ liệu cá nhân.',
      'Từ chối nhận email marketing bất kỳ lúc nào bằng cách sử dụng liên kết “Unsubscribe”.',
      'Yêu cầu bản sao dữ liệu và hạn chế xử lý theo quy định GDPR & CCPA.',
      'Liên hệ privacy@furniturestore.com để gửi yêu cầu liên quan đến dữ liệu.',
    ],
  },
  {
    title: "7. Children's Privacy",
    content: [
      'ZShop không thu thập dữ liệu từ trẻ em dưới 13 tuổi. Nếu phát hiện, chúng tôi sẽ xoá thông tin ngay lập tức.',
    ],
  },
  {
    title: '8. Changes to Policy',
    content: [
      'Chúng tôi có thể cập nhật chính sách bảo mật theo nhu cầu kinh doanh hoặc yêu cầu pháp luật. Thời gian cập nhật sẽ được thông báo trên trang này.',
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      'Email: privacy@furniturestore.com',
      'Hotline bảo mật: (800) 555-0199 ext. 4',
      'Địa chỉ: 245 Market Street, San Francisco, CA 94105',
    ],
  },
];

export function PrivacyPolicyPage() {
  usePageMetadata({
    title: 'Privacy Policy',
    description: 'Understand how ZShop collects, uses, and protects your personal data in compliance with GDPR and CCPA.',
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
                ZShop cam kết bảo vệ dữ liệu cá nhân của bạn và tuân thủ các tiêu chuẩn bảo mật toàn cầu bao gồm GDPR và CCPA.
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
            Chính sách này áp dụng cho tất cả khách hàng, người đăng ký newsletter, khách tham quan showroom và người dùng dịch
            vụ trực tuyến của ZShop.
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
            ZShop thực hiện các quyền của bạn theo GDPR và CCPA. Bạn có thể gửi yêu cầu truy cập, di chuyển, xoá hoặc phản đối
            xử lý dữ liệu bằng cách liên hệ <a href="mailto:privacy@furniturestore.com" className="text-brand-600 font-semibold">privacy@furniturestore.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
