import { Award, Users, Building2, Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  const stats = [
    { id: 1, value: '10+', label: 'Năm Kinh Nghiệm' },
    { id: 2, value: '5000+', label: 'Khách Hàng Hài Lòng' },
    { id: 3, value: '3', label: 'Showroom Toàn Quốc' },
    { id: 4, value: '100+', label: 'Sản Phẩm Đa Dạng' }
  ];

  const team = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      position: 'Giám Đốc Điều Hành',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      position: 'Trưởng Phòng Thiết Kế',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      position: 'Quản Lý Kinh Doanh',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      position: 'Chuyên Viên Tư Vấn',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative h-[400px] bg-slate-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="About Us"
            className="w-full h-full object-cover animate-scale-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 animate-slide-down">Về Chúng Tôi</h1>
            <p className="text-xl text-gray-100 animate-slide-down animation-delay-200">
              Đồng hành cùng bạn tạo nên không gian sống hoàn hảo
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Câu Chuyện Của Chúng Tôi
              </h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  LUXHOME được thành lập vào năm 2014 với sứ mệnh mang đến những sản phẩm nội thất cao cấp,
                  hiện đại và phù hợp với mọi không gian sống của người Việt.
                </p>
                <p>
                  Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi tự hào là đối tác tin cậy của hàng ngàn
                  gia đình trên toàn quốc. Mỗi sản phẩm được lựa chọn kỹ lưỡng về chất liệu, thiết kế và
                  độ bền để đảm bảo sự hài lòng tuyệt đối của khách hàng.
                </p>
                <p>
                  Đội ngũ chuyên gia thiết kế và tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn tạo nên
                  không gian sống đẹp mắt, tiện nghi và phản ánh phong cách riêng của bạn.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-in-right">
              <img
                src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Showroom 1"
                className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-500 shadow-lg hover:shadow-2xl"
              />
              <img
                src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Showroom 2"
                className="w-full h-64 object-cover rounded-lg mt-8 hover:scale-105 transition-transform duration-500 shadow-lg hover:shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.id} className="text-center group animate-scale-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-slate-600 group-hover:text-slate-900 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12 animate-fade-in">
            Giá Trị Cốt Lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group animate-slide-up">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Award className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300">Chất Lượng</h3>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Cam kết sản phẩm chính hãng với tiêu chuẩn cao nhất
              </p>
            </div>
            <div className="text-center group animate-slide-up animation-delay-100">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Users className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300">Khách Hàng</h3>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Đặt sự hài lòng của khách hàng lên hàng đầu
              </p>
            </div>
            <div className="text-center group animate-slide-up animation-delay-200">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Building2 className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300">Chuyên Nghiệp</h3>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Đội ngũ tư vấn giàu kinh nghiệm và nhiệt tình
              </p>
            </div>
            <div className="text-center group animate-slide-up animation-delay-300">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Heart className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-300">Tận Tâm</h3>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Phục vụ khách hàng với trái tim và tâm huyết
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12 animate-fade-in">
            Đội Ngũ Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={member.id} className="text-center group animate-scale-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto mb-4 object-cover group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-2xl"
                />
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-slate-700 transition-colors duration-300">{member.name}</h3>
                <p className="text-slate-600 group-hover:text-slate-800 transition-colors duration-300">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">
            Sẵn Sàng Tạo Nên Không Gian Mơ Ước?
          </h2>
          <p className="text-gray-300 mb-8 text-lg animate-fade-in animation-delay-100">
            Hãy để chúng tôi giúp bạn biến ngôi nhà thành tổ ấm hoàn hảo
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-slate-900 px-8 py-4 rounded-sm font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 animate-slide-up animation-delay-200"
          >
            Liên Hệ Ngay
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
