import { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Package, Truck, User } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

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

const mockOrders: OrderTrackingInfo[] = [
  {
    orderNumber: 'ZSH123456',
    email: 'emma.lee@example.com',
    customer: 'Emma Lee',
    address: '245 Market Street, San Francisco, CA 94105',
    estimatedDelivery: 'December 4, 2024',
    carrier: 'FedEx Home Delivery',
    trackingNumber: 'FE123409875US',
    currentStatus: 'Out for Delivery',
    coordinates: {
      lat: 37.7893,
      lng: -122.4015,
    },
    events: [
      {
        status: 'Order Placed',
        description: 'Order confirmed and payment processed.',
        date: 'November 26, 2024 - 09:14 AM',
      },
      {
        status: 'Processing',
        description: 'Furniture inspected and packaged at FurniCraft fulfillment center.',
        date: 'November 27, 2024 - 02:30 PM',
      },
      {
        status: 'Shipped',
        description: 'Departed from Oakland, CA. Tracking updates activated.',
        date: 'November 29, 2024 - 07:45 AM',
      },
      {
        status: 'Out for Delivery',
        description: 'Courier is en route to the delivery address.',
        date: 'December 4, 2024 - 08:05 AM',
      },
    ],
  },
  {
    orderNumber: 'ZSH987654',
    email: 'diego.ramirez@example.com',
    customer: 'Diego Ramirez',
    address: '88 Hudson Yards, New York, NY 10001',
    estimatedDelivery: 'December 12, 2024',
    carrier: 'UPS Freight',
    trackingNumber: '1Z45F89P0467823100',
    currentStatus: 'Processing',
    coordinates: {
      lat: 40.7539,
      lng: -74.0010,
    },
    events: [
      {
        status: 'Order Placed',
        description: 'Order submitted and awaiting stock confirmation.',
        date: 'November 24, 2024 - 04:50 PM',
      },
      {
        status: 'Processing',
        description: 'White Glove team assigned, preparing delivery schedule.',
        date: 'November 28, 2024 - 11:20 AM',
      },
    ],
  },
];

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please provide your order number and email address.');
      return;
    }

    setError('');
    setIsLoading(true);
    setSuccessMessage('');

    setTimeout(() => {
      const match = mockOrders.find(
        (item) => item.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() && item.email === email.trim(),
      );

      if (!match) {
        setOrder(null);
        setError('We could not locate an order with the provided details. Please double-check and try again.');
        setSuccessMessage('');
      } else {
        setOrder(match);
        setSuccessMessage('Your order was located successfully. Live tracking details are now available below.');
      }
      setIsLoading(false);
    }, 800);
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
