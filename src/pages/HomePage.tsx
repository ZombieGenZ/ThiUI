import { ChevronRight, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const categories = [
    'Phòng Khách',
    'Phòng Ngủ',
    'Phòng Bếp',
    'Phòng Làm Việc',
    'Phòng Ăn',
    'Trang Trí'
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Sofa Góc Hiện Đại',
      price: '15.900.000',
      image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: 'Bàn Ăn Gỗ Sồi',
      price: '8.500.000',
      image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: 'Giường Ngủ Tân Cổ Điển',
      price: '12.300.000',
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: 'Tủ Kệ Tivi Cao Cấp',
      price: '6.200.000',
      image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      reviews: 92
    },
    {
      id: 5,
      name: 'Bàn Làm Việc Minimalist',
      price: '4.800.000',
      image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviews: 203
    },
    {
      id: 6,
      name: 'Ghế Thư Giãn Đọc Sách',
      price: '3.900.000',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      reviews: 178
    },
    {
      id: 7,
      name: 'Tủ Quần Áo 4 Cánh',
      price: '9.700.000',
      image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.5,
      reviews: 67
    },
    {
      id: 8,
      name: 'Bộ Ghế Sofa 3 Chỗ',
      price: '13.500.000',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      reviews: 134
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'Chất lượng sản phẩm tuyệt vời, giao hàng nhanh chóng. Nhân viên tư vấn nhiệt tình. Tôi rất hài lòng với bộ sofa mới.'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'Thiết kế đẹp, hiện đại. Giá cả hợp lý so với chất lượng. Dịch vụ lắp đặt chuyên nghiệp. Sẽ giới thiệu cho bạn bè.'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'Mua bàn ăn và ghế ở đây, rất ưng ý. Gỗ thật, chắc chắn. Bảo hành tốt. Showroom đẹp, nhân viên thân thiện.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative h-[600px] bg-slate-100">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Nội Thất Cao Cấp<br />Cho Ngôi Nhà Của Bạn
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Khám phá bộ sưu tập nội thất hiện đại, sang trọng với chất lượng vượt trội
            </p>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-sm font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
              Khám Phá Ngay
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Danh Mục Sản Phẩm
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-slate-50 p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer border border-gray-200"
              >
                <p className="font-semibold text-slate-900">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">Sản Phẩm Nổi Bật</h3>
            <a href="/products" className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center">
              Xem Tất Cả
              <ChevronRight className="ml-1 w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Tại Sao Chọn Chúng Tôi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Chất Lượng Đảm Bảo</h4>
              <p className="text-slate-600">Sản phẩm chính hãng, bảo hành dài hạn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Giá Cả Hợp Lý</h4>
              <p className="text-slate-600">Giá tốt nhất thị trường, nhiều ưu đãi</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Giao Hàng Nhanh</h4>
              <p className="text-slate-600">Vận chuyển và lắp đặt tận nơi</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Hỗ Trợ 24/7</h4>
              <p className="text-slate-600">Tư vấn nhiệt tình, chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Đăng Ký Nhận Tin Khuyến Mãi
          </h3>
          <p className="text-gray-300 mb-8">
            Nhận thông tin sản phẩm mới và ưu đãi đặc biệt qua email
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-slate-900 px-8 py-3 rounded-sm font-semibold hover:bg-gray-100 transition-colors">
              Đăng Ký
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
