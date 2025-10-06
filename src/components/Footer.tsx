import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-2xl font-bold mb-4">LUXHOME</h4>
            <p className="text-gray-300 mb-4">
              Nội thất cao cấp cho ngôi nhà hoàn hảo
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-lg">Thông Tin</h5>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/about" className="hover:text-white transition-colors">Về Chúng Tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính Sách Bảo Hành</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính Sách Đổi Trả</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng Dẫn Mua Hàng</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-lg">Hỗ Trợ</h5>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/contact" className="hover:text-white transition-colors">Liên Hệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu Hỏi Thường Gặp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Giao Hàng & Lắp Đặt</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thanh Toán</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-lg">Liên Hệ</h5>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>info@luxhome.vn</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>1900-xxxx</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2024 LUXHOME. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
