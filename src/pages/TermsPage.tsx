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
        'Bằng việc truy cập hoặc sử dụng website ZShop, bạn đồng ý bị ràng buộc bởi các điều khoản này cùng với mọi chính sách bổ sung được tham chiếu. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.',
    },
    {
      title: '2. Use License',
      content:
        'Chúng tôi cấp cho bạn giấy phép hạn chế, không độc quyền, không thể chuyển nhượng để truy cập và sử dụng website cho mục đích cá nhân và thương mại hợp pháp. Việc sao chép, phân phối hoặc khai thác nội dung vượt ngoài phạm vi này phải có sự chấp thuận bằng văn bản.',
    },
    {
      title: '3. Disclaimer',
      content:
        'Thông tin trên website được cung cấp trên cơ sở “nguyên trạng”. ZShop không bảo đảm rằng nội dung luôn chính xác, đầy đủ hoặc không gián đoạn. Chúng tôi có thể cập nhật thông tin mà không cần thông báo trước.',
    },
    {
      title: '4. Limitations',
      content:
        'Trong mọi trường hợp, ZShop và các đối tác sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng website, bao gồm nhưng không giới hạn lợi nhuận bị mất.',
    },
    {
      title: '5. Accuracy of Materials',
      content:
        'Nội dung, hình ảnh và mô tả sản phẩm có thể chứa lỗi kỹ thuật hoặc chính tả. Chúng tôi không cam kết rằng mọi thông tin sẽ chính xác và cập nhật tại mọi thời điểm; tuy nhiên, ZShop sẽ nỗ lực điều chỉnh ngay khi phát hiện.',
    },
    {
      title: '6. Links',
      content:
        'Website có thể chứa liên kết đến trang bên thứ ba. ZShop không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc thực tiễn của các trang này, và việc truy cập là rủi ro của riêng bạn.',
    },
    {
      title: '7. Modifications',
      content:
        'ZShop có quyền sửa đổi các điều khoản bất kỳ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc chấp nhận điều khoản mới.',
    },
    {
      title: '8. Governing Law',
      content:
        'Các điều khoản này được điều chỉnh bởi luật pháp bang California, Hoa Kỳ, không xét đến xung đột pháp luật. Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại San Francisco County.',
    },
    {
      title: '9. User Accounts',
      content:
        'Bạn có trách nhiệm giữ bí mật thông tin đăng nhập và thông báo cho ZShop ngay lập tức nếu phát hiện sử dụng trái phép. Bạn chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của mình.',
    },
    {
      title: '10. Prohibited Uses',
      content:
        'Nghiêm cấm sử dụng website cho mục đích gian lận, gửi thư rác, phát tán mã độc, xâm nhập hệ thống hoặc thu thập dữ liệu trái phép. Chúng tôi có quyền đình chỉ tài khoản nếu phát hiện hành vi vi phạm.',
    },
    {
      title: '11. Intellectual Property',
      content:
        'Toàn bộ nội dung, logo, hình ảnh và thiết kế thuộc sở hữu trí tuệ của ZShop hoặc được cấp phép. Việc sử dụng trái phép có thể vi phạm luật bản quyền, thương hiệu và các quy định khác.',
    },
    {
      title: '12. Termination',
      content:
        'ZShop có thể đình chỉ hoặc chấm dứt quyền truy cập của bạn khi có lý do hợp lý, bao gồm vi phạm điều khoản, yêu cầu của pháp luật hoặc hoạt động gây hại tới người dùng khác.',
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
                Vui lòng đọc kỹ điều khoản sử dụng để hiểu quyền và nghĩa vụ khi truy cập các dịch vụ của ZShop.
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
            Nếu bạn có câu hỏi về điều khoản hoặc cần hỗ trợ, vui lòng liên hệ <a href="mailto:legal@zshop.com" className="text-brand-600 font-semibold">legal@zshop.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
