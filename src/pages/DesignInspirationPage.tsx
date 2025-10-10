import { useMemo, useState } from 'react';
import { Filter, Heart, Layers, Search } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

interface DesignProduct {
  name: string;
  price: string;
}

interface DesignInspiration {
  id: string;
  title: string;
  style: string;
  room: string;
  budget: string;
  image: string;
  description: string;
  totalPrice: string;
  products: DesignProduct[];
}

const designIdeas: DesignInspiration[] = [
  {
    id: 'living-modern',
    title: 'Sunlit Modern Lounge',
    style: 'Modern',
    room: 'Living Room Ideas',
    budget: 'Under $5,000',
    image: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Sofa góc màu trung tính kết hợp ghế bành nhung, bàn trà đá cẩm thạch và đèn sàn kim loại tạo nên không gian hiện đại, ấm áp.',
    totalPrice: '$4,280',
    products: [
      { name: 'Harper Sectional Sofa', price: '$2,150' },
      { name: 'Marble Orbit Coffee Table', price: '$780' },
      { name: 'Atlas Arc Floor Lamp', price: '$390' },
      { name: 'Tonal Wool Rug 8x10', price: '$960' },
    ],
  },
  {
    id: 'bedroom-scandi',
    title: 'Scandinavian Calm Bedroom',
    style: 'Scandinavian',
    room: 'Bedroom Inspiration',
    budget: 'Under $3,000',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Tông màu gỗ sáng, ga giường linen và đèn ngủ thủy tinh giúp phòng ngủ nhẹ nhàng, thư thái, chuẩn phong cách Bắc Âu.',
    totalPrice: '$2,540',
    products: [
      { name: 'Nordic Oak Platform Bed (Queen)', price: '$1,290' },
      { name: 'Linen Bedding Set', price: '$360' },
      { name: 'Haze Glass Nightstands (Set of 2)', price: '$540' },
      { name: 'Softloom Area Rug', price: '$350' },
    ],
  },
  {
    id: 'dining-industrial',
    title: 'Industrial Loft Dining',
    style: 'Industrial',
    room: 'Dining Room Designs',
    budget: 'Under $4,000',
    image: 'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Bàn gỗ nguyên tấm kết hợp ghế kim loại đệm da và hệ đèn trần ống đồng tạo điểm nhấn đậm chất industrial.',
    totalPrice: '$3,780',
    products: [
      { name: 'Forge Live-Edge Dining Table', price: '$2,150' },
      { name: 'Set of 6 Rivet Leather Chairs', price: '$1,140' },
      { name: 'Copper Cascade Chandelier', price: '$490' },
    ],
  },
  {
    id: 'office-modern',
    title: 'Modern Home Office Suite',
    style: 'Modern',
    room: 'Home Office Setup',
    budget: 'Under $3,500',
    image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Bàn làm việc chữ L phủ gỗ óc chó, ghế công thái học và hệ tủ treo giúp tối ưu hiệu quả làm việc tại nhà.',
    totalPrice: '$3,280',
    products: [
      { name: 'Walnut Executive Desk', price: '$1,450' },
      { name: 'ErgoFlex Leather Chair', price: '$620' },
      { name: 'Modular Wall Storage', price: '$890' },
      { name: 'Linear Task Lighting', price: '$320' },
    ],
  },
  {
    id: 'small-space',
    title: 'Compact Studio Haven',
    style: 'Minimalist',
    room: 'Small Space Solutions',
    budget: 'Under $2,500',
    image: 'https://images.pexels.com/photos/276551/pexels-photo-276551.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Sofa giường đa năng, bàn ăn gấp và kệ treo tường giúp căn studio tối ưu từng mét vuông mà vẫn đẹp mắt.',
    totalPrice: '$2,180',
    products: [
      { name: 'Convertible Sofa Bed', price: '$940' },
      { name: 'Foldaway Dining Set', price: '$520' },
      { name: 'Wall-Mounted Shelving System', price: '$390' },
      { name: 'Soft Glow Pendant', price: '$330' },
    ],
  },
  {
    id: 'outdoor-coastal',
    title: 'Coastal Outdoor Retreat',
    style: 'Boho',
    room: 'Outdoor Patio',
    budget: 'Under $4,500',
    image: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Ghế lounge chống nước, thảm ngoài trời và đèn lồng mây tạo nên patio thư giãn phong cách biển cả.',
    totalPrice: '$4,320',
    products: [
      { name: 'Driftwood Outdoor Sofa', price: '$1,980' },
      { name: 'All-Weather Lounge Chairs (Set of 2)', price: '$1,080' },
      { name: 'Braided Outdoor Rug', price: '$420' },
      { name: 'Rattan Lantern Trio', price: '$340' },
      { name: 'Acacia Coffee Table', price: '$500' },
    ],
  },
  {
    id: 'seasonal-decor',
    title: 'Winter Chalet Living',
    style: 'Seasonal',
    room: 'Seasonal Decor',
    budget: 'Under $6,000',
    image: 'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description:
      'Gỗ tự nhiên, lò sưởi đá và phụ kiện len dệt dày mang lại cảm giác ấm áp cho mùa đông.',
    totalPrice: '$5,640',
    products: [
      { name: 'Alpine Modular Sofa', price: '$2,480' },
      { name: 'Stone Hearth Console', price: '$1,120' },
      { name: 'Chunky Wool Throws', price: '$420' },
      { name: 'Antler Inspired Chandelier', price: '$1,620' },
    ],
  },
];

const styles = ['All Styles', 'Modern', 'Scandinavian', 'Industrial', 'Minimalist', 'Seasonal', 'Boho'];
const rooms = [
  'All Rooms',
  'Living Room Ideas',
  'Bedroom Inspiration',
  'Dining Room Designs',
  'Home Office Setup',
  'Outdoor Patio',
  'Small Space Solutions',
  'Seasonal Decor',
];
const budgets = [
  'Any Budget',
  'Under $2,500',
  'Under $3,000',
  'Under $3,500',
  'Under $4,000',
  'Under $4,500',
  'Under $5,000',
  'Under $6,000',
];

export function DesignInspirationPage() {
  usePageMetadata({
    title: 'Design Inspiration',
    description:
      'Discover curated design ideas by room, style, and budget with shoppable product lists to recreate the look at home.',
  });

  const [styleFilter, setStyleFilter] = useState('All Styles');
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [budgetFilter, setBudgetFilter] = useState('Any Budget');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDesigns = useMemo(() => {
    return designIdeas.filter((design) => {
      const matchesStyle = styleFilter === 'All Styles' || design.style === styleFilter;
      const matchesRoom = roomFilter === 'All Rooms' || design.room === roomFilter;
      const matchesBudget = budgetFilter === 'Any Budget' || design.budget === budgetFilter;
      const matchesSearch =
        !searchTerm.trim() ||
        design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStyle && matchesRoom && matchesBudget && matchesSearch;
    });
  }, [styleFilter, roomFilter, budgetFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Design Inspiration' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Design Inspiration</h1>
              <p className="text-white/80 text-lg">
                Khám phá những không gian được tuyển chọn bởi stylist ZShop. Lọc theo phong cách, phòng và ngân sách để tìm ý
                tưởng phù hợp nhất với bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-lg text-neutral-900">Filter Ideas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Style</label>
              <select
                value={styleFilter}
                onChange={(event) => setStyleFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Room</label>
              <select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Budget</label>
              <select
                value={budgetFilter}
                onChange={(event) => setBudgetFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {budgets.map((budget) => (
                  <option key={budget} value={budget}>
                    {budget}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by keyword..."
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-neutral-900">Gallery</h2>
            <p className="text-sm text-neutral-500">{filteredDesigns.length} designs curated for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDesigns.map((design) => (
              <article key={design.id} className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-lg">
                <div className="relative">
                  <img src={design.image} alt={design.title} className="h-64 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                        <Layers className="w-4 h-4" /> {design.style}
                      </span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{design.budget}</span>
                    </div>
                    <h3 className="font-display text-2xl mt-2">{design.title}</h3>
                    <p className="text-sm text-white/80">{design.room}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-600">{design.description}</p>
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-neutral-900">Shop This Look</h4>
                      <span className="text-sm font-semibold text-brand-600">{design.totalPrice}</span>
                    </div>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      {design.products.map((product) => (
                        <li key={product.name} className="flex items-center justify-between gap-3">
                          <span>{product.name}</span>
                          <span className="font-medium text-neutral-900">{product.price}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="mt-4 w-full rounded-xl bg-brand-600 text-white text-sm font-semibold py-2.5 hover:bg-brand-700 transition-colors">
                      Add All to Cart
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Save to favorites</span>
                    <button className="inline-flex items-center gap-1 text-brand-600 font-semibold text-xs">
                      <Heart className="w-3.5 h-3.5" /> Save Look
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredDesigns.length === 0 && (
            <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl">
              <p className="text-neutral-500">No designs match your filters. Try adjusting the criteria.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DesignInspirationPage;
