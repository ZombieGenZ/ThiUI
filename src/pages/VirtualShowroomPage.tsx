import { useMemo, useState } from 'react';
import { Box, ExternalLink, Palette, ShoppingBag, ZoomIn } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface RoomHotspot {
  id: string;
  name: string;
  price: string;
  description: string;
  position: { top: string; left: string };
  colors?: { label: string; value: string }[];
}

interface RoomTemplate {
  id: string;
  name: string;
  image: string;
  description: string;
  style: string;
  products: RoomHotspot[];
}

const roomTemplates: RoomTemplate[] = [
  {
    id: 'living-contemporary',
    name: 'Contemporary Living Room',
    style: 'Contemporary',
    description:
      'Tông trung tính hiện đại với sofa modular, bàn trà đá và thảm len mang lại cảm giác sang trọng nhưng vẫn ấm áp.',
    image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'sofa-contempo',
        name: 'Modular Cloud Sofa',
        price: '$3,450',
        description: 'Vải hiệu suất cao chống bám bẩn, có thể cấu hình linh hoạt.',
        position: { top: '55%', left: '38%' },
        colors: [
          { label: 'Oat', value: '#e8dfd2' },
          { label: 'Stone', value: '#d0cbc3' },
          { label: 'Charcoal', value: '#4b4b4b' },
        ],
      },
      {
        id: 'table-aurora',
        name: 'Aurora Marble Coffee Table',
        price: '$780',
        description: 'Mặt đá cẩm thạch Ý kết hợp chân thép phủ đồng.',
        position: { top: '63%', left: '56%' },
      },
      {
        id: 'lamp-arc',
        name: 'Arc Studio Floor Lamp',
        price: '$420',
        description: 'Đèn sàn dạng vòm cung cấp ánh sáng tập trung mềm mại.',
        position: { top: '35%', left: '68%' },
      },
    ],
  },
  {
    id: 'bedroom-scandinavian',
    name: 'Scandinavian Bedroom',
    style: 'Scandinavian',
    description:
      'Không gian nghỉ ngơi tối giản với gỗ sáng màu, ánh sáng tự nhiên và chất liệu linen thoáng nhẹ.',
    image: 'https://images.pexels.com/photos/6585611/pexels-photo-6585611.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'bed-nordic',
        name: 'Nordic Oak Bed Frame',
        price: '$1,280',
        description: 'Gỗ sồi FSC bền vững, đầu giường bọc nỉ thoải mái.',
        position: { top: '58%', left: '48%' },
        colors: [
          { label: 'Natural Oak', value: '#d8c7ab' },
          { label: 'Smoked Oak', value: '#9b8263' },
        ],
      },
      {
        id: 'nightstand-glas',
        name: 'Glass Globe Nightstand',
        price: '$420',
        description: 'Bàn đầu giường mặt kính mờ cùng chân thép không gỉ.',
        position: { top: '62%', left: '30%' },
      },
      {
        id: 'rug-softloom',
        name: 'Softloom Rug 8x10',
        price: '$520',
        description: 'Thảm len dệt tay với gam màu trung tính dễ kết hợp.',
        position: { top: '73%', left: '57%' },
      },
    ],
  },
  {
    id: 'dining-industrial',
    name: 'Industrial Dining',
    style: 'Industrial',
    description:
      'Bàn gỗ nguyên khối kết hợp đèn treo ống đồng và ghế da mang hơi thở loft đô thị.',
    image: 'https://images.pexels.com/photos/279806/pexels-photo-279806.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'table-forge',
        name: 'Forge Dining Table',
        price: '$2,050',
        description: 'Gỗ óc chó ghép sống kết hợp chân kim loại phủ tĩnh điện.',
        position: { top: '58%', left: '52%' },
      },
      {
        id: 'chair-rivet',
        name: 'Rivet Leather Chair',
        price: '$320',
        description: 'Ghế da thật với đường chỉ nổi và khung thép đen mờ.',
        position: { top: '60%', left: '34%' },
      },
      {
        id: 'pendant-copper',
        name: 'Copper Cascade Pendant',
        price: '$620',
        description: 'Hệ đèn 3 cụm ánh sáng ấm, điều chỉnh độ cao linh hoạt.',
        position: { top: '30%', left: '50%' },
      },
    ],
  },
  {
    id: 'office-modern',
    name: 'Modern Office',
    style: 'Modern',
    description:
      'Không gian làm việc với bàn chữ L phủ veneer óc chó, ghế công thái học và hệ tủ lưu trữ âm tường.',
    image: 'https://images.pexels.com/photos/518244/pexels-photo-518244.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'desk-walnut',
        name: 'Walnut L-Desk',
        price: '$1,680',
        description: 'Bàn chữ L có module dây điện ẩn và ngăn kéo mềm.',
        position: { top: '58%', left: '38%' },
      },
      {
        id: 'chair-ergoflex',
        name: 'ErgoFlex Chair',
        price: '$540',
        description: 'Tựa lưng lưới, đệm memory foam hỗ trợ cột sống.',
        position: { top: '62%', left: '55%' },
        colors: [
          { label: 'Slate', value: '#5b6167' },
          { label: 'Midnight', value: '#2f3541' },
        ],
      },
      {
        id: 'shelving-wall',
        name: 'Wall Storage System',
        price: '$820',
        description: 'Hệ tủ treo modular có thể mở rộng thêm module.',
        position: { top: '36%', left: '70%' },
      },
    ],
  },
  {
    id: 'outdoor-patio',
    name: 'Outdoor Patio',
    style: 'Boho Coastal',
    description:
      'Bộ sofa chống nước, đèn lồng mây và cây xanh tạo nên khu patio thư giãn.',
    image: 'https://images.pexels.com/photos/2179217/pexels-photo-2179217.jpeg?auto=compress&cs=tinysrgb&w=1600',
    products: [
      {
        id: 'sofa-outdoor',
        name: 'Driftwood Outdoor Sofa',
        price: '$1,980',
        description: 'Khung gỗ dầu chống thời tiết, nệm quick-dry có thể tháo vỏ.',
        position: { top: '58%', left: '38%' },
        colors: [
          { label: 'Seashell', value: '#f1ede4' },
          { label: 'Mist', value: '#dfe3dd' },
        ],
      },
      {
        id: 'table-outdoor',
        name: 'Acacia Coffee Table',
        price: '$480',
        description: 'Bề mặt gỗ acacia tự nhiên được xử lý chống tia UV.',
        position: { top: '62%', left: '58%' },
      },
      {
        id: 'lantern-set',
        name: 'Rattan Lantern Set',
        price: '$340',
        description: 'Bộ 3 đèn lồng mây, dùng được với đèn led hoặc nến.',
        position: { top: '40%', left: '65%' },
      },
    ],
  },
];

export function VirtualShowroomPage() {
  usePageMetadata({
    title: 'Virtual Showroom',
    description:
      'Step into ZShop\'s virtual showroom to explore curated rooms, interact with products, and shop directly from the scene.',
  });

  const [selectedRoomId, setSelectedRoomId] = useState(roomTemplates[0].id);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({});

  const selectedRoom = useMemo(
    () => roomTemplates.find((room) => room.id === selectedRoomId) ?? roomTemplates[0],
    [selectedRoomId],
  );

  const handleColorChange = (productId: string, color: string) => {
    setColorSelections((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1451471/pexels-photo-1451471.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Virtual Showroom' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Virtual Showroom</h1>
              <p className="text-white/80 text-lg">
                Trải nghiệm không gian 360° được thiết kế sẵn. Nhấn vào các hotspot để xem chi tiết sản phẩm, thay đổi màu sắc
                và thêm vào giỏ hàng ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-neutral-900">Room Templates</h2>
              <p className="text-sm text-neutral-500">
                Chọn phong cách yêu thích và khám phá sản phẩm trong từng không gian.
              </p>
            </div>
            <a
              href="https://cal.com/zshop/design"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Schedule Virtual Consultation
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-xs uppercase text-neutral-500">{room.style}</p>
                <p className="mt-1 font-semibold text-neutral-900">{room.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
              <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full object-cover max-h-[640px]" />
              {selectedRoom.products.map((product) => (
                <button
                  key={product.id}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center border-2 backdrop-blur bg-white/80 transition-transform hover:scale-110 ${
                    activeHotspot === product.id ? 'border-brand-600 text-brand-600' : 'border-white text-neutral-700'
                  }`}
                  style={product.position}
                  onClick={() => setActiveHotspot(product.id)}
                  aria-label={`View details for ${product.name}`}
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
                  <h2 className="font-semibold text-lg text-neutral-900">{selectedRoom.name}</h2>
                  <p className="text-xs uppercase text-neutral-500">{selectedRoom.style}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600">{selectedRoom.description}</p>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-neutral-900 mb-4">Interactive Products</h3>
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
                          <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                          <p className="text-xs text-neutral-500">{product.price}</p>
                        </div>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{product.description}</p>

                      {product.colors && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                            <Palette className="w-3.5 h-3.5 text-brand-600" /> Finishes
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
                                aria-label={`Select ${color.label}`}
                              />
                            ))}
                          </div>
                          {selectedColor && (
                            <p className="mt-2 text-xs text-neutral-500">
                              Selected: {product.colors?.find((c) => c.value === selectedColor)?.label}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-neutral-900 mb-4">Need more help?</h3>
              <p className="text-sm text-neutral-600">
                Đặt lịch hẹn trực tiếp tại showroom hoặc tư vấn trực tuyến 1:1 với nhà thiết kế nội thất của ZShop để tạo nên
                không gian mơ ước.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href="https://cal.com/zshop/showroom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl border border-brand-600 text-brand-600 text-sm font-semibold py-2 text-center hover:bg-brand-50 transition-colors"
                >
                  Book In-Store Appointment
                </a>
                <a
                  href="mailto:design@zshop.com"
                  className="block w-full rounded-xl bg-neutral-900 text-white text-sm font-semibold py-2 text-center hover:bg-neutral-800 transition-colors"
                >
                  Schedule Virtual Consultation
                </a>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default VirtualShowroomPage;
