import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Package className="w-8 h-8 text-brand-600" />
          <h1 className="text-4xl font-display font-bold text-neutral-900">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-soft">
            <Package className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">No orders yet</h2>
            <p className="text-neutral-600 mb-8">
              Start shopping to see your orders here!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600">
                          {translate({ en: 'Total', vi: 'Tổng cộng' })}
                        </p>
                        <p className="text-lg font-bold text-neutral-900">
                          {formatPrice(order.total_amount, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={normalizeImageUrl(item.product?.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                          alt={item.product
                            ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                            : translate({ en: 'Product image', vi: 'Hình ảnh sản phẩm' })}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900">
                            {item.product
                              ? getLocalizedValue(item.product.name_i18n, language, item.product.name)
                              : translate({ en: 'Product', vi: 'Sản phẩm' })}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {translate({ en: 'Quantity', vi: 'Số lượng' })}: {item.quantity} x {formatPrice(item.unit_price, language)}
                          </p>
                        </div>
                        <p className="font-semibold text-neutral-900">
                          {formatPrice(item.quantity * item.unit_price, language)}
                        </p>
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
