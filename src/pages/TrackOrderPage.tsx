import { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Package, Truck, User } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { supabase } from '../lib/supabase';

interface TrackingEvent {
  status: string;
  description: string;
  date: string;
}

interface OrderTrackingInfo {
  orderNumber: string;
  email: string;
  customer: string;
  address: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  currentStatus: string;
  events: TrackingEvent[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

const statusDescriptions: Record<string, string> = {
  'pending': 'Order confirmed and payment being processed.',
  'processing': 'Furniture inspected and packaged at FurniCraft fulfillment center.',
  'shipped': 'Departed from warehouse. Tracking updates activated.',
  'out_for_delivery': 'Courier is en route to the delivery address.',
  'delivered': 'Package delivered successfully.',
  'cancelled': 'Order has been cancelled.',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusToLabel: Record<string, string> = {
  'pending': 'Order Placed',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'out_for_delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

export function TrackOrderPage() {
  usePageMetadata({
    title: 'Track Order',
    description:
      'Track your FurniCraft furniture order, view carrier updates, and access delivery support or invoices instantly.',
  });

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderTrackingInfo | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please provide your order number and email address.');
      return;
    }

    setError('');
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        setOrder(null);
        setError('We could not locate an order with the provided details. Please double-check and try again.');
        setSuccessMessage('');
        setIsLoading(false);
        return;
      }

      const contactEmail = orderData.contact_info && typeof orderData.contact_info === 'object' && 'email' in orderData.contact_info
        ? (orderData.contact_info as { email?: string }).email
        : email.trim();

      if (contactEmail?.toLowerCase() !== email.trim().toLowerCase()) {
        setOrder(null);
        setError('We could not locate an order with the provided details. Please double-check and try again.');
        setSuccessMessage('');
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', orderData.user_id)
        .maybeSingle();

      const shippingAddr = orderData.shipping_address as Record<string, unknown> | null;
      const contactInfo = orderData.contact_info as Record<string, unknown> | null;

      const customerName = contactInfo?.name as string ||
                          profileData?.full_name ||
                          'Customer';

      const fullAddress = shippingAddr
        ? `${shippingAddr.address_line1 || ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zip_code || ''}`
        : 'Address not available';

      const statusStages: Array<'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'> = [
        'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'
      ];

      const currentStatusIndex = statusStages.indexOf(orderData.status as 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered');

      const events: TrackingEvent[] = statusStages
        .slice(0, currentStatusIndex + 1)
        .map((status, index) => ({
          status: statusToLabel[status],
          description: statusDescriptions[status],
          date: index === 0 ? formatDate(orderData.created_at) : formatDate(orderData.updated_at),
        }));

      const estimatedDelivery = orderData.delivery_date
        ? new Date(orderData.delivery_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Estimated delivery date not available';

      const trackingInfo: OrderTrackingInfo = {
        orderNumber: orderData.order_number,
        email: contactEmail || email.trim(),
        customer: customerName,
        address: fullAddress,
        estimatedDelivery,
        carrier: 'FedEx Home Delivery',
        trackingNumber: `TRK${orderData.order_number.slice(-8)}`,
        currentStatus: statusToLabel[orderData.status] || orderData.status,
        events,
        coordinates: {
          lat: 37.7893,
          lng: -122.4015,
        },
      };

      setOrder(trackingInfo);
      setSuccessMessage('Your order was located successfully. Live tracking details are now available below.');
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('An error occurred while fetching your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentIndex = order
    ? order.events.findIndex((event) => event.status === order.currentStatus)
    : -1;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Track Order' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Track Your Order</h1>
              <p className="text-white/80 text-lg">
                Enter your order details to view live status, expected delivery date, and contact options with your carrier.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="orderNumber" className="block text-sm font-medium text-neutral-700">
                Order Number
              </label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="e.g. ZSH123456"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-brand-600 text-white px-6 py-3 text-sm font-semibold hover:bg-brand-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Track Order'}
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {successMessage && !error && (
            <p className="mt-4 text-sm text-emerald-600">{successMessage}</p>
          )}
        </section>

        {order ? (
          <section className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-neutral-50 border border-neutral-200 rounded-3xl p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Current Status</p>
                    <h2 className="font-display text-3xl text-neutral-900">{order.currentStatus}</h2>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
                      View Invoice
                    </button>
                    <a
                      href="mailto:support@zshop.com"
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-neutral-200" aria-hidden="true" />
                  <ol className="space-y-8">
                    {['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((stage, index) => {
                      const event = order.events.find((item) => item.status === stage);
                      const completed = currentIndex >= 0 && index <= currentIndex;
                      const isCurrent = order.currentStatus === stage;

                      return (
                        <li key={stage} className="relative pl-12">
                          <div
                            className={`absolute left-0 top-1.5 w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                              completed ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-neutral-300 bg-white text-neutral-400'
                            }`}
                          >
                            {completed ? <CheckCircle2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </div>
                          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-neutral-900">{stage}</h3>
                              {event && <span className="text-xs text-neutral-500">{event.date}</span>}
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                              {event ? event.description : 'Awaiting update from carrier.'}
                            </p>
                            {isCurrent && (
                              <span className="inline-flex mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-brand-100 text-brand-700">
                                In Progress
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-neutral-200 rounded-3xl p-6 bg-white">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-4">Delivery Details</h3>
                  <div className="space-y-3 text-sm text-neutral-600">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-brand-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-neutral-900">{order.customer}</p>
                        <p>{order.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="w-4 h-4 text-brand-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-neutral-900">{order.carrier}</p>
                        <p>Tracking #: {order.trackingNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-brand-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-neutral-900">Updates sent to</p>
                        <p>{order.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-neutral-900">Estimated Delivery</p>
                        <p>{order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-neutral-200">
                  <iframe
                    title="Delivery route map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.coordinates.lng - 0.05}%2C${order.coordinates.lat - 0.05}%2C${order.coordinates.lng + 0.05}%2C${order.coordinates.lat + 0.05}&layer=mapnik&marker=${order.coordinates.lat}%2C${order.coordinates.lng}`}
                    className="w-full h-64"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="border border-dashed border-neutral-300 rounded-3xl p-12 text-center bg-white">
            <h2 className="font-display text-2xl text-neutral-900 mb-2">Enter details to track your order</h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto">
              Provide the order number and email used at checkout to view shipping status, estimated delivery, and carrier
              information as soon as we locate your shipment.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default TrackOrderPage;
