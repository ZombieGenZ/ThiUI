import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getLocalizedValue } from '../utils/i18n';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelpers';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      name_i18n?: Record<string, string> | null;
      images: string[];
    } | null;
  }[];
}

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, translate } = useLanguage();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const statusLabels: Record<string, { en: string; vi: string }> = useMemo(
    () => ({
      pending: { en: 'Pending', vi: 'Đang chờ' },
      processing: { en: 'Processing', vi: 'Đang xử lý' },
      shipped: { en: 'Shipped', vi: 'Đã gửi hàng' },
      out_for_delivery: { en: 'Out for delivery', vi: 'Đang giao' },
      delivered: { en: 'Delivered', vi: 'Đã giao' },
      cancelled: { en: 'Cancelled', vi: 'Đã hủy' },
    }),
    []
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            product:products (
              name,
              name_i18n,
              images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(
        translate({
          en: 'Failed to load orders',
          vi: 'Không thể tải đơn hàng',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatStatus = (status: string) => {
    const label = statusLabels[status];
    if (label) {
      return translate(label);
    }
    return translate({ en: status.replace(/_/g, ' '), vi: status.replace(/_/g, ' ') });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12" data-aos="fade-down">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-8 h-8 text-brand-600" />
            <span className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
              {translate({ en: 'Order History', vi: 'Lịch sử đơn hàng' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900">
            {translate({ en: 'My Orders', vi: 'Đơn hàng của tôi' })}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg" data-aos="zoom-in">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-brand-100 rounded-full blur-2xl opacity-50 animate-pulse" />
              <Package className="w-32 h-32 text-neutral-300 relative" />
            </div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-3">
              {translate({ en: 'No orders yet', vi: 'Chưa có đơn hàng' })}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              {translate({
                en: 'Start shopping to see your orders here!',
                vi: 'Bắt đầu mua sắm để xem đơn hàng tại đây!'
              })}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-brand-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-brand-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {translate({ en: 'Browse Products', vi: 'Xem sản phẩm' })}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, orderIndex) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-neutral-100"
                data-aos="fade-up"
                data-aos-delay={orderIndex * 50}
              >
                <div className="bg-gradient-to-r from-brand-50 to-accent-50 p-6 border-b border-neutral-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-neutral-900 mb-1">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(order.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{order.order_items.length} {translate({ en: 'items', vi: 'sản phẩm' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-5 py-2.5 rounded-full text-sm font-bold ${getStatusColor(
                          order.status
                        )} shadow-sm`}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <div className="text-right bg-white rounded-xl px-6 py-3 shadow-sm">
                        <p className="text-xs text-neutral-600 mb-1">
                          {translate({ en: 'Total Amount', vi: 'Tổng tiền' })}
                        </p>
                        <p className="text-2xl font-display font-bold text-brand-600">
                          {formatPrice(order.total_amount, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={normalizeImageUrl(item.product?.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                            alt={item.product
                              ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                              : translate({ en: 'Product image', vi: 'Hình ảnh sản phẩm' })}
                            className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                          />
                          <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg text-neutral-900 mb-1 truncate">
                            {item.product
                              ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                              : translate({ en: 'Product', vi: 'Sản phẩm' })}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {item.quantity} × {formatPrice(item.unit_price, language)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-neutral-900">
                            {formatPrice(item.quantity * item.unit_price, language)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
