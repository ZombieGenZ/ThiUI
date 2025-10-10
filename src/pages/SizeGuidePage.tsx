import { Armchair, ArrowUpRight, Maximize, Ruler, Sofa, UtensilsCrossed } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const livingRoomSizes = [
  { label: 'Sofa 2 chỗ', dimensions: 'Chiều dài 60" - 72"', notes: 'Phù hợp căn hộ nhỏ hoặc phòng khách phụ.' },
  { label: 'Sofa 3 chỗ', dimensions: 'Chiều dài 78" - 90"', notes: 'Kích thước phổ biến cho phòng khách tiêu chuẩn.' },
  { label: 'Sofa sectional', dimensions: 'Chiều dài 90" - 140"', notes: 'Đảm bảo có lối đi 36" phía trước.' },
  { label: 'Bàn trà', dimensions: '48" - 54" (cho sofa 84" - 96")', notes: 'Giữ khoảng cách 16"-18" tới sofa.' },
  { label: 'Kệ TV', dimensions: 'Rộng hơn màn hình 6" mỗi bên', notes: 'Chiều cao mắt nhìn khoảng 42" khi ngồi.' },
  { label: 'Thảm phòng khách', dimensions: '8 ft x 10 ft', notes: 'Chân trước sofa đặt trên thảm để cố định bố cục.' },
];

const bedroomSizes = [
  { label: 'Twin', dimensions: '39" x 75"', notes: 'Lý tưởng cho phòng trẻ em hoặc giường phụ.' },
  { label: 'Full', dimensions: '54" x 75"', notes: 'Phù hợp cho phòng khách đơn hoặc studio.' },
  { label: 'Queen', dimensions: '60" x 80"', notes: 'Lựa chọn đa năng nhất cho cặp đôi.' },
  { label: 'King', dimensions: '76" x 80"', notes: 'Cần phòng rộng tối thiểu 12 ft x 12 ft.' },
  { label: 'California King', dimensions: '72" x 84"', notes: 'Chiều dài lớn, phù hợp người cao.' },
  { label: 'Tủ đầu giường', dimensions: 'Cao 24" - 28"', notes: 'Tương đương chiều cao mặt nệm.' },
  { label: 'Tủ áo (6 ngăn)', dimensions: '60" W x 18" D x 34" H', notes: 'Khoảng trống mở ngăn kéo tối thiểu 36".' },
];

const diningSizes = [
  { label: 'Bàn 4 người', dimensions: '36" x 48"', notes: 'Khoảng cách ghế - tường tối thiểu 36".' },
  { label: 'Bàn 6 người', dimensions: '36" x 72"', notes: 'Đảm bảo có 24" không gian cho mỗi chỗ ngồi.' },
  { label: 'Bàn 8 người', dimensions: '40" x 96"', notes: 'Lý tưởng cho phòng ăn lớn và tiệc.' },
  { label: 'Ghế ăn', dimensions: 'Chiều cao 18" - 20"', notes: 'Khoảng cách mặt bàn - ghế 10" - 12".' },
  { label: 'Ghế counter height', dimensions: 'Chiều cao 24" - 26"', notes: 'Dùng cho bàn đảo cao 36".' },
  { label: 'Ghế bar height', dimensions: 'Chiều cao 30" - 32"', notes: 'Phù hợp quầy bar cao 42".' },
];

const measurementTips = [
  'Đo chiều dài, chiều rộng và chiều cao phòng, ghi chú vị trí cửa, cửa sổ, ổ điện.',
  'Để lối đi tối thiểu 30" - 36" quanh đồ nội thất chính để di chuyển thoải mái.',
  'Chừa 24" không gian cho ghế kéo ra ở bàn ăn hoặc bàn làm việc.',
  'Sử dụng băng keo giấy dán trên sàn để mô phỏng kích thước đồ nội thất trước khi mua.',
  'Cân nhắc chiều cao trần và vị trí đèn, quạt khi đặt tủ cao hoặc giường có canopy.',
];

export function SizeGuidePage() {
  usePageMetadata({
    title: 'Furniture Size Guide',
    description:
      'Use detailed size charts for living room, bedroom, and dining furniture plus expert measurement tips to plan your space.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/6585612/pexels-photo-6585612.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Size Guide' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Size Guide</h1>
              <p className="text-white/80 text-lg">
                Tham khảo kích thước chuẩn và mẹo đo đạc để đảm bảo nội thất ZShop phù hợp hoàn hảo với không gian của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sofa className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Living Room Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Đảm bảo sofa, bàn trà và thảm có tỉ lệ cân đối giúp phòng khách thông thoáng. Hãy đo khoảng cách giữa các điểm
            chính như TV, sofa và lối đi trước khi chọn mua.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livingRoomSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Armchair className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Bedroom Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Cân bằng giữa giường, tủ áo, tủ đầu giường và lối đi để không gian nghỉ ngơi thật thư thái. Đừng quên chừa không
            gian mở cửa tủ và di chuyển quanh giường.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bedroomSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Dining Room Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Tạo trải nghiệm ăn uống thoải mái bằng cách đảm bảo mỗi người có đủ không gian và ghế phù hợp độ cao bàn. Sử dụng
            kích thước dưới đây để tính toán số chỗ ngồi tương ứng.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diningSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Ruler className="w-8 h-8 text-brand-600" />
              <h2 className="font-display text-3xl text-neutral-900">How to Measure Your Space</h2>
            </div>
            <p className="text-neutral-600">
              Chuẩn bị bản vẽ tay hoặc sử dụng ứng dụng planner để ghi lại kích thước phòng, vị trí cửa ra vào, cửa sổ, ổ điện
              và lỗ thông gió. Điều này giúp đội ngũ stylist đề xuất đồ nội thất chính xác.
            </p>
            <ul className="space-y-3 text-sm text-neutral-600">
              {measurementTips.map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex w-2.5 h-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://planner.roomsketcher.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Launch Room Planner
            </a>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/209224/pexels-photo-209224.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Illustration of a floor plan sketch with measuring tools"
              className="w-full rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 bg-white border border-neutral-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
              <Maximize className="w-8 h-8 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Tip: Mark furniture footprints</p>
                <p className="text-xs text-neutral-500">Dùng băng keo giấy để mô phỏng kích thước thực tế trên sàn.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SizeGuidePage;
