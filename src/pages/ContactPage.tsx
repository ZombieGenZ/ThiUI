import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-8 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Liên Hệ</h1>
          <p className="text-slate-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-slide-in-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Gửi Tin Nhắn Cho Chúng Tôi
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    placeholder="0123 456 789"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Chủ Đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    placeholder="Tư vấn sản phẩm"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Tin Nhắn *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white px-8 py-4 rounded-sm font-semibold hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
                >
                  Gửi Tin Nhắn
                </button>
              </form>
            </div>

            <div className="animate-slide-in-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Thông Tin Liên Hệ
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start group animate-slide-up">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors duration-300">
                    <MapPin className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">Địa Chỉ Showroom</h3>
                    <p className="text-slate-600">
                      123 Đường ABC, Quận 1, TP. Hồ Chí Minh<br />
                      456 Đường XYZ, Quận Hai Bà Trưng, Hà Nội<br />
                      789 Đường DEF, Quận Hải Châu, Đà Nẵng
                    </p>
                  </div>
                </div>
                <div className="flex items-start group animate-slide-up animation-delay-100">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors duration-300">
                    <Phone className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">Số Điện Thoại</h3>
                    <p className="text-slate-600">
                      Hotline: 1900-xxxx<br />
                      Tư vấn: 0123 456 789
                    </p>
                  </div>
                </div>
                <div className="flex items-start group animate-slide-up animation-delay-200">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors duration-300">
                    <Mail className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">Email</h3>
                    <p className="text-slate-600">
                      info@luxhome.vn<br />
                      support@luxhome.vn
                    </p>
                  </div>
                </div>
                <div className="flex items-start group animate-slide-up animation-delay-300">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors duration-300">
                    <Clock className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">Giờ Làm Việc</h3>
                    <p className="text-slate-600">
                      Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                      Thứ 7 - Chủ Nhật: 9:00 - 17:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 animate-scale-in animation-delay-400">
                <h3 className="font-semibold text-slate-900 mb-3">Câu Hỏi Thường Gặp</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <a href="#" className="hover:text-slate-900 transition-all duration-300 hover:translate-x-1 inline-block">
                      • Chính sách bảo hành như thế nào?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-slate-900 transition-all duration-300 hover:translate-x-1 inline-block">
                      • Thời gian giao hàng là bao lâu?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-slate-900 transition-all duration-300 hover:translate-x-1 inline-block">
                      • Có hỗ trợ trả góp không?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-slate-900 transition-all duration-300 hover:translate-x-1 inline-block">
                      • Làm thế nào để đặt hàng?
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-0">
        <div className="w-full h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4266684649243!2d106.69745631533432!3d10.776889992320146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded8e9c533f74!2zSOG7jSBDaMOtIE1pbmggQ2l0eSBWaWV0bmFt!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      <Footer />
    </div>
  );
}
