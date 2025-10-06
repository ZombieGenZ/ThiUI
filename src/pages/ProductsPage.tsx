import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'Tất Cả Sản Phẩm' },
    { id: 'living', name: 'Phòng Khách' },
    { id: 'bedroom', name: 'Phòng Ngủ' },
    { id: 'kitchen', name: 'Phòng Bếp' },
    { id: 'office', name: 'Phòng Làm Việc' },
    { id: 'dining', name: 'Phòng Ăn' },
    { id: 'decor', name: 'Trang Trí' }
  ];

  const products = [
    {
      id: 1,
      name: 'Sofa Góc Hiện Đại Premium',
      price: '15.900.000',
      image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviews: 124,
      category: 'living'
    },
    {
      id: 2,
      name: 'Bàn Ăn Gỗ Sồi Cao Cấp',
      price: '8.500.000',
      image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      reviews: 89,
      category: 'dining'
    },
    {
      id: 3,
      name: 'Giường Ngủ Tân Cổ Điển',
      price: '12.300.000',
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      reviews: 156,
      category: 'bedroom'
    },
    {
      id: 4,
      name: 'Tủ Kệ Tivi Cao Cấp',
      price: '6.200.000',
      image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      reviews: 92,
      category: 'living'
    },
    {
      id: 5,
      name: 'Bàn Làm Việc Minimalist',
      price: '4.800.000',
      image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviews: 203,
      category: 'office'
    },
    {
      id: 6,
      name: 'Ghế Thư Giãn Đọc Sách',
      price: '3.900.000',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      reviews: 178,
      category: 'living'
    },
    {
      id: 7,
      name: 'Tủ Quần Áo 4 Cánh',
      price: '9.700.000',
      image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.5,
      reviews: 67,
      category: 'bedroom'
    },
    {
      id: 8,
      name: 'Bộ Ghế Sofa 3 Chỗ',
      price: '13.500.000',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      reviews: 134,
      category: 'living'
    },
    {
      id: 9,
      name: 'Bàn Trang Điểm Sang Trọng',
      price: '5.200.000',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      reviews: 85,
      category: 'bedroom'
    },
    {
      id: 10,
      name: 'Ghế Ăn Bọc Nệm Cao Cấp',
      price: '2.100.000',
      image: 'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      reviews: 142,
      category: 'dining'
    },
    {
      id: 11,
      name: 'Kệ Sách Đứng Hiện Đại',
      price: '3.600.000',
      image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      reviews: 98,
      category: 'office'
    },
    {
      id: 12,
      name: 'Bàn Coffee Table Mặt Kính',
      price: '4.200.000',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.5,
      reviews: 76,
      category: 'living'
    }
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-8 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 animate-slide-down">Sản Phẩm</h1>
          <p className="text-slate-600 animate-slide-down animation-delay-100">Khám phá bộ sưu tập nội thất đa dạng của chúng tôi</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24 animate-slide-in-left hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <SlidersHorizontal className="w-5 h-5 text-slate-900 mr-2" />
                  <h3 className="font-bold text-lg text-slate-900">Bộ Lọc</h3>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Danh Mục</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="ml-2 text-slate-600">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Khoảng Giá</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value="all"
                        checked={priceRange === 'all'}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="ml-2 text-slate-600">Tất cả</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value="under5"
                        checked={priceRange === 'under5'}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="ml-2 text-slate-600">Dưới 5 triệu</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value="5to10"
                        checked={priceRange === '5to10'}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="ml-2 text-slate-600">5 - 10 triệu</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value="10to20"
                        checked={priceRange === '10to20'}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="ml-2 text-slate-600">10 - 20 triệu</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value="over20"
                        checked={priceRange === 'over20'}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="ml-2 text-slate-600">Trên 20 triệu</span>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-2 rounded-sm hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                  Xóa Bộ Lọc
                </button>
              </div>
            </aside>

            <main className="flex-1">
              <div className="flex items-center justify-between mb-6 animate-slide-in-right">
                <p className="text-slate-600">
                  Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all duration-300 hover:shadow-lg"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              <div className="mt-12 flex justify-center animate-fade-in">
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                    Trước
                  </button>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-sm transform scale-110 shadow-lg">1</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">2</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">3</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                    Sau
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
