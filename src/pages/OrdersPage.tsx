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
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-cyan-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border border-neutral-200';
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
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">
            {translate({ en: 'My Orders', vi: 'Đơn hàng của tôi' })}
          </h1>
          <p className="text-neutral-600">
            {translate({ en: 'Track and manage your orders', vi: 'Theo dõi và quản lý đơn hàng' })}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200" data-aos="fade-up">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {translate({ en: 'No orders yet', vi: 'Chưa có đơn hàng' })}
            </h2>
            <p className="text-neutral-600 mb-6">
              {translate({
                en: 'Start shopping to see your orders here!',
                vi: 'Bắt đầu mua sắm để xem đơn hàng tại đây!'
              })}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              {translate({ en: 'Browse Products', vi: 'Xem sản phẩm' })}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, orderIndex) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
                data-aos="fade-up"
                data-aos-delay={orderIndex * 50}
              >
                <div className="p-5 border-b border-neutral-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(order.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4" />
                          <span>{order.order_items.length} {translate({ en: 'items', vi: 'sản phẩm' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-neutral-500 mb-1">
                        {translate({ en: 'Total', vi: 'Tổng tiền' })}
                      </p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatPrice(order.total_amount, language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    {order.order_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={normalizeImageUrl(item.product?.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                            alt={item.product
                              ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                              : translate({ en: 'Product image', vi: 'Hình ảnh sản phẩm' })}
                            className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                          />
                          <div className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 truncate">
                            {item.product
                              ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                              : translate({ en: 'Product', vi: 'Sản phẩm' })}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {item.quantity} × {formatPrice(item.unit_price, language)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-neutral-900">
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
