import { useMemo, useState } from 'react';
import { Box, ExternalLink, Palette, ShoppingBag, ZoomIn } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useLanguage } from '../contexts/LanguageContext';

interface LocalizedText {
  en: string;
  vi: string;
}

interface RoomHotspot {
  id: string;
  name: LocalizedText;
  price: string;
  description: LocalizedText;
  position: { top: string; left: string };
  colors?: { label: LocalizedText; value: string }[];
}

interface RoomTemplate {
  id: string;
  name: LocalizedText;
  image: string;
  description: LocalizedText;
  style: LocalizedText;
  products: RoomHotspot[];
}

const roomTemplates: RoomTemplate[] = [
  {
    id: 'living-contemporary',
    name: { en: 'Contemporary Living Room', vi: 'Phòng khách đương đại' },
    style: { en: 'Contemporary', vi: 'Đương đại' },
    description: {
      en: 'A modern neutral palette featuring a modular sofa, stone coffee table, and wool rug for a luxe yet welcoming feel.',
      vi: 'Tông trung tính hiện đại với sofa mô-đun, bàn cà phê đá và thảm len tạo nên vẻ sang trọng mà vẫn thân thiện.',
    },
    image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'sofa-contempo',
        name: { en: 'Modular Cloud Sofa', vi: 'Sofa mô-đun Cloud' },
        price: '$3,450',
        description: {
          en: 'Performance fabric resists stains and the modular design reconfigures effortlessly.',
          vi: 'Vải chống bẩn dễ vệ sinh, thiết kế mô-đun linh hoạt bố trí.',
        },
        position: { top: '55%', left: '38%' },
        colors: [
          { label: { en: 'Oat', vi: 'Màu yến mạch' }, value: '#e8dfd2' },
          { label: { en: 'Stone', vi: 'Xám đá' }, value: '#d0cbc3' },
          { label: { en: 'Charcoal', vi: 'Than đen' }, value: '#4b4b4b' },
        ],
      },
      {
        id: 'table-aurora',
        name: { en: 'Aurora Marble Coffee Table', vi: 'Bàn cà phê đá Aurora' },
        price: '$780',
        description: {
          en: 'Italian marble top with brass-plated steel legs.',
          vi: 'Mặt đá cẩm thạch Ý kết hợp chân thép mạ đồng.',
        },
        position: { top: '63%', left: '56%' },
      },
      {
        id: 'lamp-arc',
        name: { en: 'Arc Studio Floor Lamp', vi: 'Đèn sàn Arc Studio' },
        price: '$420',
        description: {
          en: 'Arc floor lamp delivers focused yet soft lighting.',
          vi: 'Đèn sàn dạng vòm mang ánh sáng tập trung nhưng dịu nhẹ.',
        },
        position: { top: '35%', left: '68%' },
      },
    ],
  },
  {
    id: 'bedroom-scandinavian',
    name: { en: 'Scandinavian Bedroom', vi: 'Phòng ngủ Scandinavian' },
    style: { en: 'Scandinavian', vi: 'Scandinavian' },
    description: {
      en: 'A serene retreat with light woods, abundant natural light, and breathable linen textiles.',
      vi: 'Không gian thư thái với gỗ sáng màu, ánh sáng tự nhiên và chất liệu vải lanh thoáng mát.',
    },
    image: 'https://images.pexels.com/photos/6585611/pexels-photo-6585611.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'bed-nordic',
        name: { en: 'Nordic Oak Bed Frame', vi: 'Giường gỗ sồi Nordic' },
        price: '$1,280',
        description: {
          en: 'Crafted from FSC-certified oak with an upholstered, cushioned headboard.',
          vi: 'Làm từ gỗ sồi đạt chứng nhận FSC, đầu giường bọc vải đệm êm.',
        },
        position: { top: '58%', left: '48%' },
        colors: [
          { label: { en: 'Natural Oak', vi: 'Gỗ sồi tự nhiên' }, value: '#d8c7ab' },
          { label: { en: 'Smoked Oak', vi: 'Gỗ sồi hun khói' }, value: '#9b8263' },
        ],
      },
      {
        id: 'nightstand-glas',
        name: { en: 'Glass Globe Nightstand', vi: 'Tab đầu giường Glass Globe' },
        price: '$420',
        description: {
          en: 'Frosted glass top paired with stainless-steel legs.',
          vi: 'Mặt kính mờ kết hợp chân thép không gỉ.',
        },
        position: { top: '62%', left: '30%' },
      },
      {
        id: 'rug-softloom',
        name: { en: 'Softloom Rug 8x10', vi: 'Thảm Softloom 8x10' },
        price: '$520',
        description: {
          en: 'Hand-loomed wool rug in a versatile neutral palette.',
          vi: 'Thảm len dệt tay với gam màu trung tính dễ phối.',
        },
        position: { top: '73%', left: '57%' },
      },
    ],
  },
  {
    id: 'dining-industrial',
    name: { en: 'Industrial Dining', vi: 'Phòng ăn công nghiệp' },
    style: { en: 'Industrial', vi: 'Công nghiệp' },
    description: {
      en: 'Live-edge wood dining table, copper pendants, and leather seating lend an elevated urban loft vibe.',
      vi: 'Bàn ăn gỗ mép tự nhiên, đèn treo đồng và ghế da mang đến chất loft hiện đại.',
    },
    image: 'https://images.pexels.com/photos/279806/pexels-photo-279806.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'table-forge',
        name: { en: 'Forge Dining Table', vi: 'Bàn ăn Forge' },
        price: '$2,050',
        description: {
          en: 'Live-edge walnut slab with powder-coated metal legs.',
          vi: 'Tấm gỗ óc chó mép tự nhiên kết hợp chân kim loại sơn tĩnh điện.',
        },
        position: { top: '58%', left: '52%' },
      },
      {
        id: 'chair-rivet',
        name: { en: 'Rivet Leather Chair', vi: 'Ghế da Rivet' },
        price: '$320',
        description: {
          en: 'Top-grain leather chair with contrast stitching and matte black steel frame.',
          vi: 'Ghế da cao cấp đường chỉ nổi, khung thép đen mờ.',
        },
        position: { top: '60%', left: '34%' },
      },
      {
        id: 'pendant-copper',
        name: { en: 'Copper Cascade Pendant', vi: 'Đèn thả Copper Cascade' },
        price: '$620',
        description: {
          en: 'Triple pendant with warm LEDs and adjustable hanging heights.',
          vi: 'Bộ đèn thả 3 bóng LED ánh sáng ấm, điều chỉnh được độ cao.',
        },
        position: { top: '30%', left: '50%' },
      },
    ],
  },
  {
    id: 'office-modern',
    name: { en: 'Modern Office', vi: 'Văn phòng hiện đại' },
    style: { en: 'Modern', vi: 'Hiện đại' },
    description: {
      en: 'A productivity-focused office with walnut veneer L-desk, ergonomic seating, and built-in storage.',
      vi: 'Không gian làm việc hiệu quả với bàn chữ L gỗ óc chó, ghế công thái học và tủ lưu trữ tích hợp.',
    },
    image: 'https://images.pexels.com/photos/518244/pexels-photo-518244.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'desk-walnut',
        name: { en: 'Walnut L-Desk', vi: 'Bàn chữ L gỗ óc chó' },
        price: '$1,680',
        description: {
          en: 'L-shaped desk includes concealed cable management and soft-close drawers.',
          vi: 'Bàn chữ L tích hợp quản lý dây điện ẩn và ngăn kéo đóng êm.',
        },
        position: { top: '58%', left: '38%' },
      },
      {
        id: 'chair-ergoflex',
        name: { en: 'ErgoFlex Chair', vi: 'Ghế ErgoFlex' },
        price: '$540',
        description: {
          en: 'Mesh backrest with memory foam seat to support posture all day.',
          vi: 'Tựa lưng lưới cùng đệm memory foam hỗ trợ tư thế suốt ngày dài.',
        },
        position: { top: '62%', left: '55%' },
        colors: [
          { label: { en: 'Slate', vi: 'Xám Slate' }, value: '#5b6167' },
          { label: { en: 'Midnight', vi: 'Xanh Midnight' }, value: '#2f3541' },
        ],
      },
      {
        id: 'shelving-wall',
        name: { en: 'Wall Storage System', vi: 'Hệ tủ treo tường' },
        price: '$820',
        description: {
          en: 'Modular wall system that expands with additional storage units.',
          vi: 'Hệ tủ treo tường mô-đun có thể mở rộng với các ngăn bổ sung.',
        },
        position: { top: '36%', left: '70%' },
      },
    ],
  },
];

export function VirtualShowroomPage() {
  const { language, translate } = useLanguage();

  usePageMetadata({
    title: translate({ en: 'Virtual Showroom', vi: 'Phòng trưng bày ảo' }),
    description: translate({
      en: 'Explore our curated spaces and interact with products in 360° views.',
      vi: 'Khám phá các không gian được tuyển chọn và tương tác với sản phẩm ở góc nhìn 360°.',
    }),
  });

  const [selectedRoomId, setSelectedRoomId] = useState(roomTemplates[0].id);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(roomTemplates[0].products[0].id);
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({});

  const selectedRoom = useMemo(
    () => roomTemplates.find((room) => room.id === selectedRoomId) ?? roomTemplates[0],
    [selectedRoomId],
  );

  const handleColorChange = (productId: string, color: string) => {
    setColorSelections(prev => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative h-72 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <Breadcrumb
            items={[
              { label: translate({ en: 'Home', vi: 'Trang chủ' }), href: '/' },
              { label: translate({ en: 'Virtual Showroom', vi: 'Phòng trưng bày ảo' }) }
            ]}
          />
          <div className="mt-6">
            <h1 className="font-display text-4xl md:text-5xl text-white font-semibold">
              {translate({ en: 'Virtual Showroom', vi: 'Phòng trưng bày ảo' })}
            </h1>
            <p className="mt-3 text-white/80 max-w-2xl">
              {translate({
                en: 'Step inside our immersive spaces, explore product hotspots, and discover finishes that match your style.',
                vi: 'Bước vào các không gian sống động, khám phá điểm nhấn sản phẩm và lựa chọn hoàn thiện phù hợp với phong cách của bạn.',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            {translate({ en: 'Choose a space to explore', vi: 'Chọn không gian để khám phá' })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roomTemplates.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setActiveHotspot(null);
                }}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  room.id === selectedRoomId
                    ? 'border-brand-600 bg-brand-50 shadow-lg'
                    : 'border-neutral-200 hover:border-brand-300'
                }`}
              >
                <p className="text-xs uppercase text-neutral-500">{room.style[language]}</p>
                <p className="mt-1 font-semibold text-neutral-900">{room.name[language]}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
              <img src={selectedRoom.image} alt={selectedRoom.name[language]} className="w-full object-cover max-h-[640px]" />
              {selectedRoom.products.map((product) => (
                <button
                  key={product.id}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center border-2 backdrop-blur bg-white/80 transition-transform hover:scale-110 ${
                    activeHotspot === product.id ? 'border-brand-600 text-brand-600' : 'border-white text-neutral-700'
                  }`}
                  style={product.position}
                  onClick={() => setActiveHotspot(product.id)}
                  aria-label={translate({ en: `View details for ${product.name.en}`, vi: `Xem chi tiết ${product.name.vi}` })}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-neutral-200 rounded-3xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Box className="w-6 h-6 text-brand-600" />
                <div>
                  <h2 className="font-semibold text-lg text-neutral-900">{selectedRoom.name[language]}</h2>
                  <p className="text-xs uppercase text-neutral-500">{selectedRoom.style[language]}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600">{selectedRoom.description[language]}</p>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-neutral-900 mb-4">
                {translate({ en: 'Interactive Products', vi: 'Sản phẩm tương tác' })}
              </h3>
              <div className="space-y-4">
                {selectedRoom.products.map((product) => {
                  const isActive = activeHotspot === product.id;
                  const selectedColor = colorSelections[product.id];

                  return (
                    <div
                      key={product.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isActive ? 'border-brand-600 bg-brand-50' : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{product.name[language]}</p>
                          <p className="text-xs text-neutral-500">{product.price}</p>
                        </div>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                          <ShoppingBag className="w-3.5 h-3.5" /> {translate({ en: 'Add to Cart', vi: 'Thêm vào giỏ' })}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{product.description[language]}</p>

                      {product.colors && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                            <Palette className="w-3.5 h-3.5 text-brand-600" />
                            {translate({ en: 'Finishes', vi: 'Lựa chọn màu' })}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => handleColorChange(product.id, color.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedColor === color.value
                                    ? 'border-brand-600 ring-2 ring-brand-200'
                                    : 'border-white shadow-sm'
                                }`}
                                style={{ backgroundColor: color.value }}
                                aria-label={translate({ en: `Select ${color.label.en}`, vi: `Chọn ${color.label.vi}` })}
                              />
                            ))}
                          </div>
                          {selectedColor && (
                            <p className="mt-2 text-xs text-neutral-500">
                              {translate({ en: 'Selected', vi: 'Đã chọn' })}:{' '}
                              {product.colors?.find((c) => c.value === selectedColor)?.label[language]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

        <section className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            {translate({ en: 'Ready to bring the look home?', vi: 'Sẵn sàng mang cảm hứng về nhà?' })}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            {translate({
              en: 'Browse our product catalog to find the exact pieces featured in each virtual scene.',
              vi: 'Khám phá danh mục sản phẩm để tìm đúng món đồ xuất hiện trong từng không gian ảo.',
            })}
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {translate({ en: 'Browse products', vi: 'Xem sản phẩm' })} <ExternalLink className="w-4 h-4" />
          </a>
        </section>
      </div>
    </div>
  );
}

export default VirtualShowroomPage;
