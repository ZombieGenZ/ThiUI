import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const cookieSections = [
  {
    title: 'What are Cookies?',
    paragraphs: [
      'Cookies là các tệp văn bản nhỏ được lưu trên thiết bị của bạn khi truy cập website. Chúng giúp ghi nhớ tùy chọn, tối ưu hiệu suất và cá nhân hóa trải nghiệm.',
      'ZShop sử dụng cookies để đảm bảo quá trình mua sắm an toàn, mượt mà và phù hợp với sở thích của bạn.',
    ],
  },
  {
    title: 'Types of Cookies We Use',
    subsections: [
      {
        title: 'Essential Cookies',
        items: [
          'Duy trì phiên đăng nhập và bảo vệ tài khoản.',
          'Quản lý giỏ hàng, thanh toán và quy trình checkout.',
          'Ngăn chặn hoạt động gian lận và bảo mật dữ liệu.',
        ],
      },
      {
        title: 'Performance Cookies',
        items: [
          'Google Analytics đo lường lượt truy cập, trang phổ biến.',
          'Theo dõi thời gian tải trang để cải thiện hiệu suất.',
          'Phân tích tương tác người dùng để tối ưu UI/UX.',
        ],
      },
      {
        title: 'Functionality Cookies',
        items: [
          'Ghi nhớ ngôn ngữ, khu vực giao hàng và tùy chọn hiển thị.',
          'Lưu danh sách yêu thích và các bộ lọc bạn đã chọn.',
        ],
      },
      {
        title: 'Marketing Cookies',
        items: [
          'Facebook Pixel theo dõi hiệu quả quảng cáo và retargeting.',
          'Google Ads tối ưu nội dung quảng cáo dựa trên hành vi.',
          'Đối tác quảng cáo hiển thị ưu đãi liên quan đến bạn.',
        ],
      },
    ],
  },
  {
    title: 'How to Manage Cookies',
    paragraphs: [
      'Bạn có thể điều chỉnh cài đặt cookies thông qua trình duyệt hoặc banner tuỳ chỉnh khi lần đầu truy cập trang. Việc tắt cookies cần thiết có thể ảnh hưởng tới trải nghiệm mua sắm.',
      'Hướng dẫn trình duyệt: Chrome (chrome://settings/cookies), Firefox (about:preferences#privacy), Safari (Preferences > Privacy), Microsoft Edge (edge://settings/content/cookies).',
      'Opt-out: Google Analytics Opt-out Browser Add-on, Network Advertising Initiative opt-out page.',
    ],
  },
  {
    title: 'Cookie Consent Banner',
    paragraphs: [
      'Khi lần đầu truy cập, bạn sẽ thấy banner quản lý cookies với các lựa chọn: Accept All, Reject Non-Essential, Customize.',
      'Bạn có thể thay đổi quyết định bất kỳ lúc nào thông qua mục “Cookie Preferences” ở footer.',
    ],
  },
  {
    title: 'Third-Party Cookies',
    paragraphs: [
      'Một số cookies được đặt bởi đối tác phân tích và quảng cáo. Bạn có thể tham khảo chính sách bảo mật của họ:',
    ],
    links: [
      { label: 'Google Privacy & Terms', url: 'https://policies.google.com/privacy' },
      { label: 'Meta Privacy Policy', url: 'https://www.facebook.com/policy.php' },
      { label: 'Klaviyo Privacy Notice', url: 'https://www.klaviyo.com/legal/privacy' },
    ],
  },
];

export function CookiePolicyPage() {
  usePageMetadata({
    title: 'Cookie Policy',
    description: 'Learn how ZShop uses cookies, what categories are collected, and how you can manage your preferences.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-72 bg-[url('https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]} />
            <div className="mt-6">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Cookie Policy</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Chính sách cookies mô tả cách ZShop thu thập, sử dụng và quản lý cookie để mang lại trải nghiệm phù hợp và an
                toàn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {cookieSections.map((section) => (
          <section key={section.title} className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-8 space-y-4">
            <h2 className="font-semibold text-xl text-neutral-900">{section.title}</h2>
            {section.paragraphs && (
              <div className="space-y-3 text-sm text-neutral-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
            {section.subsections && (
              <div className="space-y-4">
                {section.subsections.map((sub) => (
                  <div key={sub.title} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
                    <h3 className="font-semibold text-sm text-neutral-900 mb-2">{sub.title}</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      {sub.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex w-2 h-2 rounded-full bg-brand-600" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {section.links && (
              <ul className="space-y-2 text-sm text-brand-600">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default CookiePolicyPage;
