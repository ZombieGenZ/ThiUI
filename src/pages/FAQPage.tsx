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
        question: 'Làm sao để đặt hàng?',
        answer:
          'Bạn có thể đặt hàng trực tuyến bằng cách thêm sản phẩm vào giỏ và hoàn tất quy trình checkout. Bạn cũng có thể đặt qua hotline (800) 555-0199 hoặc ghé showroom để được tư vấn trực tiếp.',
      },
      {
        question: 'Phương thức thanh toán nào được chấp nhận?',
        answer:
          'Chúng tôi chấp nhận thẻ tín dụng/ghi nợ (Visa, MasterCard, Amex), Apple Pay, Google Pay, PayPal, chuyển khoản ngân hàng và trả góp 0% với Affirm cho đơn trên $300.',
      },
      {
        question: 'Có được thay đổi/hủy đơn hàng không?',
        answer:
          'Đơn hàng có thể chỉnh sửa hoặc hủy trong vòng 24 giờ kể từ khi đặt. Sau thời gian này, vui lòng liên hệ support@zshop.com để được hỗ trợ. Đơn hàng đã giao cho đơn vị vận chuyển sẽ áp dụng phí hoàn kho.',
      },
      {
        question: 'Coupon code áp dụng như thế nào?',
        answer:
          'Nhập mã coupon tại bước thanh toán trong mục “Order Summary”. Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá và không áp dụng cho sản phẩm đã giảm giá sâu hoặc gói thiết kế.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'Bao lâu để nhận hàng?',
        answer:
          'Standard Delivery mất 5-7 ngày làm việc, Express Delivery 2-3 ngày và White Glove Delivery sẽ được hẹn theo lịch bạn chọn. Hàng đặt theo yêu cầu có thể cần thêm 2-4 tuần.',
      },
      {
        question: 'Có giao hàng quốc tế không?',
        answer:
          'ZShop giao hàng toàn quốc và quốc tế đến hơn 25 quốc gia. Chi phí và thời gian vận chuyển sẽ hiển thị tại bước thanh toán tùy theo địa chỉ.',
      },
      {
        question: 'Làm thế nào để track đơn hàng?',
        answer:
          'Sau khi đơn được gửi đi, bạn sẽ nhận email chứa tracking number. Bạn có thể truy cập trang Track Order để theo dõi chi tiết theo thời gian thực.',
      },
      {
        question: 'Điều gì xảy ra nếu tôi không có nhà khi giao hàng?',
        answer:
          'Đối với Standard/Express, hãng vận chuyển sẽ liên hệ để giao lại hoặc để lại thông báo. Với White Glove Delivery, chúng tôi sẽ sắp xếp lại lịch miễn phí trong 48 giờ.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      {
        question: 'Chính sách đổi trả như thế nào?',
        answer:
          'Bạn có thể trả hàng trong 30 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, chưa lắp đặt và đầy đủ bao bì. Custom items, sale items và nệm không áp dụng.',
      },
      {
        question: 'Làm sao để hoàn trả sản phẩm?',
        answer:
          'Liên hệ đội hỗ trợ để nhận mã RMA và hướng dẫn đóng gói. Chúng tôi sẽ gửi nhãn trả hàng và sắp xếp đơn vị vận chuyển đến lấy.',
      },
      {
        question: 'Khi nào tôi nhận được hoàn tiền?',
        answer:
          'Hoàn tiền được xử lý trong 5-7 ngày làm việc sau khi kho nhận và kiểm tra sản phẩm. Nếu sản phẩm bị lỗi do nhà sản xuất, bạn sẽ được hoàn 100% giá trị.',
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        question: 'Sản phẩm có bảo hành không?',
        answer:
          'Mỗi sản phẩm có bảo hành tiêu chuẩn 2 năm cho khung, cấu trúc và lỗi sản xuất. Một số bộ sưu tập cao cấp có bảo hành mở rộng 5 năm.',
      },
      {
        question: 'Tôi có thể order mẫu vải/màu không?',
        answer:
          'Có. Bạn có thể yêu cầu tối đa 6 mẫu vải, gỗ hoặc da miễn phí. Đăng ký trực tuyến và chúng tôi sẽ gửi trong 3-5 ngày.',
      },
      {
        question: 'Sản phẩm custom mất bao lâu?',
        answer:
          'Các đơn hàng custom thường cần 6-10 tuần để sản xuất và giao hàng, tùy vào chất liệu và thiết kế yêu cầu.',
      },
      {
        question: 'Hướng dẫn chăm sóc nội thất?',
        answer:
          'Mỗi sản phẩm đi kèm hướng dẫn bảo quản chi tiết. Bạn cũng có thể xem hướng dẫn tại mục Product Care trong tài khoản của mình.',
      },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      {
        question: 'Làm sao tạo tài khoản?',
        answer:
          'Chọn “Sign Up” ở góc phải trên cùng, nhập email, mật khẩu và thông tin liên hệ. Bạn sẽ nhận email xác nhận để kích hoạt tài khoản.',
      },
      {
        question: 'Quên mật khẩu?',
        answer:
          'Sử dụng chức năng “Forgot Password”, nhập email đăng ký để nhận liên kết đặt lại mật khẩu mới.',
      },
      {
        question: 'Liên hệ customer service?',
        answer:
          'Bạn có thể chat trực tiếp trên website, gửi email support@zshop.com hoặc gọi hotline (800) 555-0199 (8:00-20:00 mỗi ngày).',
      },
    ],
  },
];

export function FAQPage() {
  usePageMetadata({
    title: 'Frequently Asked Questions',
    description:
      'Find answers about ordering, shipping, returns, product care, and support at ZShop to make furniture shopping effortless.',
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
                Tổng hợp câu hỏi thường gặp để bạn mua sắm và chăm sóc nội thất ZShop một cách dễ dàng nhất.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1 space-y-4">
            <div className="sticky top-32 p-6 border border-neutral-200 rounded-3xl bg-white shadow-sm">
              <h2 className="font-semibold text-lg text-neutral-900 mb-2">Cần hỗ trợ thêm?</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Chat trực tuyến, gửi email hoặc đặt lịch tư vấn với stylist để được gợi ý phù hợp nhất cho không gian của bạn.
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
