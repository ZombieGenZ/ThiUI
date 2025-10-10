import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit,
  Eye,
  Home as HomeIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  Newspaper,
  Palette,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Ticket,
  Trash2,
  Users as UsersIcon,
  X,
  Briefcase,
} from 'lucide-react';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

type InputType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'select'
  | 'datetime-local'
  | 'checkbox'
  | 'url';

type CrudMode = 'create' | 'update';

interface Option {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Option[];
  asyncOptions?: () => Promise<Option[]>;
  min?: number;
  step?: number;
}

interface ColumnConfig {
  key: string;
  label: string;
  widthClass?: string;
  render?: (value: any, row: Record<string, any>) => JSX.Element | string | number | null;
}

interface AdminRouteConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
  element: JSX.Element;
}

interface CrudManagerProps {
  title: string;
  table: string;
  defaultValues: Record<string, any>;
  columns: ColumnConfig[];
  formFields: FormField[];
  searchableColumns?: string[];
  orderBy?: { column: string; ascending?: boolean };
  transformForSave?: (values: Record<string, any>, mode: CrudMode) => Record<string, any>;
  transformForEdit?: (record: Record<string, any>) => Record<string, any>;
  validate?: (values: Record<string, any>, mode: CrudMode, original?: Record<string, any>) => string | null;
  renderActions?: (record: Record<string, any>, refresh: () => void) => JSX.Element | null;
  disableCreate?: boolean;
  disableDelete?: boolean;
  pageSize?: number;
  readOnly?: boolean;
}

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  sku: string;
  stock_quantity: number;
  created_at: string;
}

interface OrderWithRelations {
  id: string;
  order_number: string;
  status: string;
  user_id: string | null;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total_amount: number;
  shipping_address: Record<string, any> | null;
  contact_info: Record<string, any> | null;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  delivery_date: string | null;
  voucher_id: string | null;
  assembly_service: boolean;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  price: number;
  subtotal: number;
  created_at: string;
  dimensions: string | null;
  material: string | null;
}

const PAGE_SIZE = 10;

const badgeClass = (status: string) => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full';
  switch (status) {
    case 'pending':
    case 'received':
      return `${base} bg-amber-100 text-amber-800`;
    case 'processing':
    case 'in_review':
    case 'reviewing':
      return `${base} bg-sky-100 text-sky-800`;
    case 'shipped':
    case 'out_for_delivery':
    case 'scheduled':
      return `${base} bg-blue-100 text-blue-800`;
    case 'delivered':
    case 'completed':
    case 'hired':
      return `${base} bg-emerald-100 text-emerald-800`;
    case 'cancelled':
    case 'rejected':
    case 'closed':
    case 'archived':
      return `${base} bg-rose-100 text-rose-800`;
    case 'quoted':
    case 'offer':
      return `${base} bg-purple-100 text-purple-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
  }
};

const AdminCurrencyContext = createContext<(value: number) => string>(value =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0)
);

function useAdminCurrencyFormatter() {
  return useContext(AdminCurrencyContext);
}

const computeTrend = (current: number, previous: number) => {
  if (previous <= 0) {
    if (current <= 0) {
      return { label: '0%', positive: false };
    }
    return { label: '+100%', positive: true };
  }

  const diff = ((current - previous) / previous) * 100;
  return { label: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`, positive: diff >= 0 };
};

const formatStatusLabel = (status: string) =>
  status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function AdminPanelPage() {
  const { user, loading, isAdmin, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const currencyFormatter = useMemo(
    () => (value: number) => formatPrice(value ?? 0, language),
    [formatPrice, language]
  );

  const adminRoutes = useMemo<AdminRouteConfig[]>(
    () => [
      {
        key: 'dashboard',
        label: t('admin.panel.routes.dashboard.label', 'Dashboard'),
        description: t('admin.panel.routes.dashboard.description', 'Overview of activity and key metrics.'),
        icon: LayoutDashboard,
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        key: 'analytics',
        label: t('admin.panel.routes.analytics.label', 'Analytics & reports'),
        description: t('admin.panel.routes.analytics.description', 'Analyze revenue, orders, and content over time.'),
        icon: BarChart3,
        path: 'analytics',
        element: <AnalyticsDashboard />,
      },
      {
        key: 'customers',
        label: t('admin.panel.routes.customers.label', 'Customer accounts'),
        description: t('admin.panel.routes.customers.description', 'Track customer account information.'),
        icon: UsersIcon,
        path: 'customers',
        element: <ProfilesManager readOnly />,
      },
      {
        key: 'contacts',
        label: t('admin.panel.routes.contacts.label', 'Contact & feedback'),
        description: t('admin.panel.routes.contacts.description', 'View support requests and feedback from customers.'),
        icon: Inbox,
        path: 'contacts',
        element: <ContactManager readOnly />,
      },
      {
        key: 'design-requests',
        label: t('admin.panel.routes.designRequests.label', 'Design requests'),
        description: t('admin.panel.routes.designRequests.description', 'Manage interior design consultation requests.'),
        icon: Palette,
        path: 'design-requests',
        element: <DesignRequestsManager readOnly />,
      },
      {
        key: 'applications',
        label: t('admin.panel.routes.applications.label', 'Applications'),
        description: t('admin.panel.routes.applications.description', 'Review candidates and hiring status.'),
        icon: Briefcase,
        path: 'applications',
        element: <CareerApplicationsManager readOnly />,
      },
      {
        key: 'products',
        label: t('admin.panel.routes.products.label', 'Products'),
        description: t('admin.panel.routes.products.description', 'Manage products, pricing, and inventory.'),
        icon: Boxes,
        path: 'products',
        element: <ProductsManager />,
      },
      {
        key: 'categories',
        label: t('admin.panel.routes.categories.label', 'Categories'),
        description: t('admin.panel.routes.categories.description', 'Adjust the structure of product categories.'),
        icon: Layers,
        path: 'categories',
        element: <CategoriesManager />,
      },
      {
        key: 'vouchers',
        label: t('admin.panel.routes.vouchers.label', 'Promotion codes'),
        description: t('admin.panel.routes.vouchers.description', 'Set up discount and promotional programs.'),
        icon: Ticket,
        path: 'vouchers',
        element: <VouchersManager />,
      },
      {
        key: 'orders',
        label: t('admin.panel.routes.orders.label', 'Orders'),
        description: t('admin.panel.routes.orders.description', 'Monitor processing and fulfillment progress.'),
        icon: ClipboardList,
        path: 'orders',
        element: <OrdersManager />,
      },
      {
        key: 'blog',
        label: t('admin.panel.routes.blog.label', 'Blog & news'),
        description: t('admin.panel.routes.blog.description', 'Manage blog and news content.'),
        icon: Newspaper,
        path: 'blog',
        element: <BlogPostsManager />,
      },
    ],
    [t, language]
  );

  const location = useLocation();
  const activePath = location.pathname.replace(/^\/?admin\/?/, '') || 'dashboard';
  const activeRoute = useMemo(
    () => adminRoutes.find(route => route.path === activePath) ?? adminRoutes[0],
    [adminRoutes, activePath]
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-rose-50 px-6 text-center">
        <div className="max-w-md rounded-3xl border border-rose-100 bg-white/80 p-10 shadow-strong backdrop-blur">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('admin.panel.limitedAccessTitle', 'Access restricted')}</h1>
          <p className="mt-3 text-sm text-neutral-600">
            {t(
              'admin.panel.limitedAccessDescription',
              'Only accounts with the admin role can access this area. Please contact the system administrator to request access.'
            )}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 hover:border-brand-200 hover:text-brand-600"
          >
            {t('admin.panel.limitedAccessAction', 'Return to homepage')}
          </button>
        </div>
      </div>
    );
  }

  const activeKey = activeRoute.key;
  const currentRoute = activeRoute;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userName = (user?.user_metadata as Record<string, any>)?.full_name ?? user?.email ?? 'Admin';
  const displayRole = role ?? 'member';

  return (
    <AdminCurrencyContext.Provider value={currencyFormatter}>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-emerald-50/70 text-neutral-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-neutral-200/80 bg-white/80 backdrop-blur xl:flex">
          <div className="border-b border-neutral-200/70 px-6 pb-6 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">Furnicraft</p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{t('admin.panel.heading', 'Admin Console')}</h2>
            <p className="mt-2 text-sm text-neutral-500">{userName}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> {displayRole}
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {adminRoutes.map(route => {
              const Icon = route.icon;
              const active = route.key === activeKey;
              return (
                <button
                  key={route.key}
                  type="button"
                  onClick={() => navigate(`/admin/${route.path}`)}
                  className={`group w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-brand-200 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent text-brand-700 shadow-lg shadow-brand-500/10'
                      : 'border-transparent bg-transparent text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100/80 hover:text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        active
                          ? 'border-brand-200 bg-white text-brand-600'
                          : 'border-neutral-200 bg-white/60 text-neutral-500 group-hover:border-brand-200 group-hover:text-brand-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold">{route.label}</span>
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group mt-6 flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-neutral-500 transition-all hover:border-brand-200 hover:bg-neutral-100/80 hover:text-brand-600"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white/60 text-neutral-500 group-hover:border-brand-200 group-hover:text-brand-600">
                <HomeIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">{t('admin.panel.backHome', 'Back to homepage')}</span>
            </button>
          </nav>
          <div className="px-4 pb-6">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 hover:border-brand-200 hover:text-brand-600"
            >
              <LogOut className="h-4 w-4" /> {t('admin.panel.signOut', 'Sign out')}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.38em] text-brand-500">
                  {t('admin.panel.sectionTitle', 'System administration')}
                </span>
                <h1 className="mt-2 text-3xl font-semibold text-neutral-900">{currentRoute.label}</h1>
                <p className="mt-2 text-sm text-neutral-500">{currentRoute.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm hover:border-brand-200 hover:text-brand-600"
                >
                  <RefreshCw className="h-4 w-4" /> {t('admin.panel.refresh', 'Refresh data')}
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 xl:hidden">
              {adminRoutes.map(route => {
                const active = route.key === activeKey;
                return (
                  <button
                    key={route.key}
                    type="button"
                    onClick={() => navigate(`/admin/${route.path}`)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                      active
                        ? 'border-brand-200 bg-brand-100 text-brand-700'
                        : 'border-neutral-200 bg-white/70 text-neutral-500'
                    }`}
                  >
                    {route.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:border-brand-200 hover:text-brand-600"
              >
                {t('admin.panel.home', 'Home')}
              </button>
            </div>
            <div className="rounded-3xl border border-neutral-200/70 bg-white/90 p-6 shadow-xl shadow-neutral-900/5 backdrop-blur">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                {adminRoutes.map(route => (
                  <Route key={route.key} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
      </div>
    </AdminCurrencyContext.Provider>
  );
}
function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [ordersSummary, setOrdersSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    statusBreakdown: [] as { status: string; count: number }[],
    monthlySeries: [] as { label: string; revenue: number; orders: number }[],
  });
  const formatCurrency = useAdminCurrencyFormatter();
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    const loadMetrics = async () => {
      setLoading(true);
      const tables = [
        'products',
        'categories',
        'orders',
        'blog_posts',
        'contact_messages',
        'design_service_requests',
        'career_applications',
      ];

      try {
        const [tableResults, ordersResult] = await Promise.all([
          Promise.all(tables.map(table => supabase.from(table).select('id', { count: 'exact', head: true }))),
          supabase.from('orders').select('total_amount, created_at, status').order('created_at', { ascending: true }),
        ]);

        if (!mounted) return;

        const counts: Record<string, number> = {};
        tableResults.forEach((result, index) => {
          if (result.error) throw result.error;
          counts[tables[index]] = result.count ?? 0;
        });
        setMetrics(counts);

        if (ordersResult.error) throw ordersResult.error;
        const ordersData = ordersResult.data ?? [];

        const totalRevenue = ordersData.reduce(
          (sum, order) => sum + Number(order.total_amount ?? 0),
          0
        );
        const totalOrders = ordersData.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const statusCounts = ordersData.reduce<Record<string, number>>((acc, order) => {
          const status = (order.status ?? 'unknown').toLowerCase();
          acc[status] = (acc[status] ?? 0) + 1;
          return acc;
        }, {});

        const statusBreakdown = Object.entries(statusCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([status, count]) => ({ status, count }));

        const monthlyMap = new Map<string, { revenue: number; orders: number }>();
        ordersData.forEach(order => {
          if (!order.created_at) return;
          const created = new Date(order.created_at);
          if (Number.isNaN(created.getTime())) return;
          const key = `${created.getFullYear()}-${created.getMonth()}`;
          const entry = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
          entry.revenue += Number(order.total_amount ?? 0);
          entry.orders += 1;
          monthlyMap.set(key, entry);
        });

        const monthlySeries: { label: string; revenue: number; orders: number }[] = [];
        const referenceDate = new Date();
        for (let offset = 5; offset >= 0; offset -= 1) {
          const pointDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
          const key = `${pointDate.getFullYear()}-${pointDate.getMonth()}`;
          const entry = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
          monthlySeries.push({
            label: pointDate.toLocaleString('vi-VN', { month: 'short' }),
            revenue: entry.revenue,
            orders: entry.orders,
          });
        }

        setOrdersSummary({ totalRevenue, totalOrders, averageOrderValue, statusBreakdown, monthlySeries });
      } catch (error) {
        console.error(error);
        if (mounted) toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const latestSeries =
    ordersSummary.monthlySeries[ordersSummary.monthlySeries.length - 1] ?? { revenue: 0, orders: 0 };
  const previousSeries =
    ordersSummary.monthlySeries.length > 1
      ? ordersSummary.monthlySeries[ordersSummary.monthlySeries.length - 2]
      : { revenue: 0, orders: 0 };
  const revenueTrend = computeTrend(latestSeries.revenue, previousSeries.revenue);
  const ordersTrend = computeTrend(latestSeries.orders, previousSeries.orders);
  const supportRequests = (metrics.contact_messages ?? 0) + (metrics.design_service_requests ?? 0);
  const averageMonthlyRevenue = ordersSummary.monthlySeries.length
    ? ordersSummary.monthlySeries.reduce((sum, item) => sum + item.revenue, 0) /
      ordersSummary.monthlySeries.length
    : 0;
  const bestMonth =
    ordersSummary.monthlySeries.length > 0
      ? ordersSummary.monthlySeries.reduce((best, item) =>
          item.revenue > best.revenue ? item : best
        )
      : { label: '—', revenue: 0, orders: 0 };

  const highlightCards = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(ordersSummary.totalRevenue),
      helper: `${revenueTrend.label} so với tháng trước`,
      positive: revenueTrend.positive,
    },
    {
      label: 'Đơn hàng tháng này',
      value: latestSeries.orders.toLocaleString('vi-VN'),
      helper: `${ordersTrend.label} so với tháng trước`,
      positive: ordersTrend.positive,
    },
    {
      label: 'Giá trị đơn trung bình',
      value: formatCurrency(ordersSummary.averageOrderValue),
      helper: `${ordersSummary.totalOrders.toLocaleString('vi-VN')} đơn đã ghi nhận`,
      positive: ordersSummary.averageOrderValue >= 0,
    },
    {
      label: 'Yêu cầu hỗ trợ',
      value: supportRequests.toLocaleString('vi-VN'),
      helper: 'Liên hệ & yêu cầu thiết kế cần xử lý',
      positive: true,
    },
  ];

  const engagementCards = [
    { label: 'Sản phẩm đang bán', value: metrics.products ?? 0, caption: 'Trong catalogue hiện tại' },
    { label: 'Danh mục sản phẩm', value: metrics.categories ?? 0, caption: 'Nhóm sản phẩm chính' },
    { label: 'Bài viết blog', value: metrics.blog_posts ?? 0, caption: 'Nguồn cảm hứng & tin tức' },
    { label: 'Đơn hàng toàn thời gian', value: metrics.orders ?? 0, caption: 'Bao gồm cả hoàn tất & đang xử lý' },
    { label: 'Yêu cầu thiết kế', value: metrics.design_service_requests ?? 0, caption: 'Khách hàng muốn tư vấn' },
    { label: 'Ứng tuyển vào đội ngũ', value: metrics.career_applications ?? 0, caption: 'Hồ sơ cần phản hồi' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlightCards.map(card => (
          <div
            key={card.label}
            className="rounded-3xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm shadow-neutral-900/5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-neutral-900">{card.value}</p>
            <p className={`mt-2 text-xs font-semibold ${card.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm shadow-neutral-900/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Doanh thu 6 tháng gần đây</h3>
              <p className="text-sm text-neutral-500">Theo dõi xu hướng doanh thu & số lượng đơn hàng.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              {t('admin.analytics.realtime', 'Realtime')}
            </span>
          </div>
          <div className="mt-6">
            <RevenueTrendChart data={ordersSummary.monthlySeries} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm shadow-neutral-900/5">
            <h3 className="text-base font-semibold text-neutral-900">Tình trạng đơn hàng</h3>
            <p className="mt-1 text-xs text-neutral-500">Các trạng thái phổ biến nhất trong hệ thống.</p>
            <div className="mt-4 space-y-2">
              {ordersSummary.statusBreakdown.length === 0 ? (
                <p className="text-sm text-neutral-500">Chưa có dữ liệu đơn hàng.</p>
              ) : (
                ordersSummary.statusBreakdown.map(item => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/70 px-3 py-2"
                  >
                    <span className={`${badgeClass(item.status)} text-[11px]`}>{formatStatusLabel(item.status)}</span>
                    <span className="text-sm font-semibold text-neutral-700">
                      {item.count.toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm shadow-neutral-900/5">
            <h3 className="text-base font-semibold text-neutral-900">Hiệu suất nhanh</h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              <li className="flex items-center justify-between">
                <span>Doanh thu trung bình / tháng</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(averageMonthlyRevenue)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tháng cao nhất</span>
                <span className="font-semibold text-neutral-900">
                  {bestMonth.label} · {formatCurrency(bestMonth.revenue)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tổng đơn đã ghi nhận</span>
                <span className="font-semibold text-neutral-900">
                  {ordersSummary.totalOrders.toLocaleString('vi-VN')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {engagementCards.map(card => (
          <div
            key={card.label}
            className="rounded-3xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm shadow-neutral-900/5"
          >
            <p className="text-sm font-semibold text-neutral-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{card.value.toLocaleString('vi-VN')}</p>
            <p className="mt-1 text-xs text-neutral-500">{card.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueTrendChart({
  data,
}: {
  data: { label: string; revenue: number; orders: number }[];
}) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-neutral-500">Chưa có dữ liệu để hiển thị.</p>;
  }

  const plottedData = data.length === 1 ? [...data, { ...data[0] }] : data;
  const maxRevenue = Math.max(...plottedData.map(item => item.revenue), 1);
  const maxOrders = Math.max(...plottedData.map(item => item.orders), 1);

  const points = plottedData.map((entry, index) => {
    const x = (index / Math.max(plottedData.length - 1, 1)) * 100;
    const y = 100 - (entry.revenue / maxRevenue) * 100;
    return `${x},${y}`;
  });

  const areaPoints = ['0,100', ...points, '100,100'].join(' ');

  return (
    <div className="space-y-6">
      <div className="relative h-56 overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#revenueGradient)" />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#16a34a"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map(point => {
            const [x, y] = point.split(',');
            return <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="#16a34a" />;
          })}
        </svg>

        <div className="absolute inset-x-6 bottom-6 flex h-24 items-end justify-between gap-3">
          {plottedData.map((entry, index) => {
            const barHeight = maxOrders === 0 ? 0 : (entry.orders / maxOrders) * 100;
            return (
              <div key={`${entry.label}-${index}`} className="flex flex-1 flex-col items-center gap-1 text-[11px]">
                <span className="font-semibold text-neutral-500">{entry.orders.toLocaleString('vi-VN')}</span>
                <div className="flex h-full w-full max-w-[38px] items-end rounded-full border border-emerald-100 bg-emerald-50/50 p-1">
                  <div
                    className="w-full rounded-full bg-emerald-500/70"
                    style={{ height: `${Math.max(barHeight, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-[11px] font-medium text-neutral-500">
        {plottedData.map((entry, index) => (
          <span key={`${entry.label}-${index}`} className="flex-1 text-center">
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CrudManager({
  title,
  table,
  defaultValues,
  columns,
  formFields,
  searchableColumns = [],
  orderBy,
  transformForSave,
  transformForEdit,
  validate,
  renderActions,
  disableCreate,
  disableDelete,
  pageSize = PAGE_SIZE,
  readOnly = false,
}: CrudManagerProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>(defaultValues);
  const [fieldOptions, setFieldOptions] = useState<Record<string, Option[]>>({});
  const [pendingDelete, setPendingDelete] = useState<Record<string, any> | null>(null);

  const loadOptions = useCallback(async () => {
    const optionEntries = await Promise.all(
      formFields.map(async field => {
        try {
          if (field.asyncOptions) {
            const data = await field.asyncOptions();
            return [field.name, data] as const;
          }
          if (field.options) {
            return [field.name, field.options] as const;
          }
        } catch (error) {
          toast.error(`Unable to load options for ${field.label}`);
        }
        return [field.name, []] as const;
      })
    );
    setFieldOptions(Object.fromEntries(optionEntries));
  }, [formFields]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let query: any = supabase.from(table).select('*', { count: 'exact' });
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }
      if (search && searchableColumns.length > 0) {
        const filters = searchableColumns.map(column => `${column}.ilike.%${search}%`).join(',');
        query = query.or(filters);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count: total, error } = await query.range(from, to);
      if (error) throw error;
      setItems(data ?? []);
      setCount(total ?? 0);
    } catch (error) {
      console.error(error);
      toast.error(`Unable to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [orderBy, page, pageSize, search, searchableColumns, table, title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormValues(defaultValues);
    setShowForm(true);
  };

  const handleEdit = (item: Record<string, any>) => {
    setEditingItem(item);
    if (transformForEdit) {
      setFormValues({ ...defaultValues, ...transformForEdit(item) });
    } else {
      setFormValues({ ...defaultValues, ...item });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormValues(defaultValues);
    setEditingItem(null);
  };

  const requestDelete = (item: Record<string, any>) => {
    if (disableDelete) return;
    setPendingDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', pendingDelete.id);
      if (error) throw error;
      toast.success('Record removed successfully');
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error('Unable to delete this record');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleInputChange = (name: string, value: any, type: InputType) => {
    if (type === 'checkbox') {
      setFormValues(prev => ({ ...prev, [name]: !prev[name] }));
      return;
    }
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const mode: CrudMode = editingItem ? 'update' : 'create';
    const payload: Record<string, any> = { ...formValues };

    for (const field of formFields) {
      const current = payload[field.name];
      if (field.required && (current === undefined || current === null || `${current}`.trim() === '')) {
        toast.error(`${field.label} is required`);
        return;
      }
      if (field.type === 'number') {
        payload[field.name] = current === '' || current === null || current === undefined ? null : Number(current);
      }
      if (field.type === 'select' && current === '') {
        payload[field.name] = null;
      }
      if (field.type === 'checkbox') {
        payload[field.name] = Boolean(current);
      }
    }

    if (!editingItem) {
      delete payload.id;
    }

    if (validate) {
      const validationMessage = validate(payload, mode, editingItem ?? undefined);
      if (validationMessage) {
        toast.error(validationMessage);
        return;
      }
    }

    const prepared = transformForSave ? transformForSave(payload, mode) : payload;

    if (
      mode === 'create' &&
      user &&
      Object.prototype.hasOwnProperty.call(prepared, 'user_id')
    ) {
      const currentUserId = prepared.user_id;
      const isMissingUserId =
        currentUserId === undefined ||
        currentUserId === null ||
        (typeof currentUserId === 'string' && currentUserId.trim() === '');

      if (isMissingUserId) {
        prepared.user_id = user.id;
      }
    }

    try {
      if (mode === 'create') {
        const { error } = await supabase.from(table).insert(prepared);
        if (error) throw error;
        toast.success('Record created successfully');
      } else {
        const { error } = await supabase.from(table).update(prepared).eq('id', editingItem?.id);
        if (error) throw error;
        toast.success('Record updated successfully');
      }
      handleCloseForm();
      fetchItems();
      loadOptions();
    } catch (error) {
      console.error(error);
      toast.error('Unable to save your changes');
    }
  };
  const hasActionsColumn = !readOnly || Boolean(renderActions);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">Manage records, update details, and keep data accurate.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-64"
                placeholder="Search records"
              />
            </div>
            {!disableCreate && !readOnly && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                New entry
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 ${column.widthClass ?? ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {hasActionsColumn && (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-neutral-500">
                    <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin text-brand-600" /> Loading data...
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-neutral-500">
                    No records found. Try adjusting your search.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    {columns.map(column => (
                      <td key={column.key} className="px-4 py-3 align-top text-neutral-700">
                        {column.render ? column.render(item[column.key], item) : (item[column.key] ?? '')}
                      </td>
                    ))}
                    {hasActionsColumn && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderActions?.(item, fetchItems)}
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand-300 hover:text-brand-600"
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                          )}
                          {!readOnly && !disableDelete && (
                            <button
                              type="button"
                              onClick={() => requestDelete(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, count)} of {count} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showForm && (
          <Portal>
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/60 backdrop-blur-md"
              onClick={event => {
                if (event.target === event.currentTarget) {
                  handleCloseForm();
                }
              }}
            >
              <div
                className="relative w-full max-w-2xl mx-4 my-8 overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-2xl shadow-neutral-900/15"
                onClick={event => event.stopPropagation()}
              >
              <div className="flex items-center justify-between border-b border-neutral-200/70 bg-gradient-to-r from-brand-50 via-white to-white px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {editingItem ? 'Update record' : 'Create new record'}
                  </h3>
                  <p className="text-xs text-neutral-500">Điền đầy đủ các thông tin bắt buộc trước khi lưu.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-6">
                {formFields.map(field => (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-700">
                      {field.label}
                      {field.required && <span className="ml-0.5 text-rose-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formValues[field.name] ?? ''}
                        onChange={event => handleInputChange(field.name, event.target.value, field.type)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formValues[field.name] ?? ''}
                        onChange={event => handleInputChange(field.name, event.target.value, field.type)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">Select an option</option>
                        {(fieldOptions[field.name] ?? []).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(formValues[field.name])}
                          onChange={() => handleInputChange(field.name, !formValues[field.name], field.type)}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-neutral-600">Enable</span>
                      </div>
                    ) : (
                      <input
                        type={
                          field.type === 'datetime-local'
                            ? 'datetime-local'
                            : field.type === 'number'
                            ? 'number'
                            : field.type === 'email'
                            ? 'email'
                            : field.type === 'url'
                            ? 'url'
                            : 'text'
                        }
                        value={formValues[field.name] ?? ''}
                        onChange={event => handleInputChange(field.name, event.target.value, field.type)}
                        placeholder={field.placeholder}
                        min={field.min}
                        step={field.step}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    )}
                    {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                  >
                    {editingItem ? 'Save changes' : 'Create record'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </Portal>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Xóa bản ghi"
          description="Thao tác này sẽ xóa dữ liệu khỏi hệ thống. Bạn có muốn tiếp tục?"
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          tone="danger"
          icon={<Trash2 className="h-5 w-5 text-rose-600" />}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
async function fetchCategoryOptions(): Promise<Option[]> {
  const { data, error } = await supabase.from('categories').select('id, name').order('name');
  if (error) throw error;
  return (data ?? []).map(category => ({ value: category.id, label: category.name }));
}

function CategoriesManager() {
  return (
    <CrudManager
      title="Product Categories"
      table="categories"
      defaultValues={{ name: '', slug: '', description: '', parent_id: '', display_order: 0, image_url: '' }}
      searchableColumns={['name', 'slug']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'parent_id',
          label: 'Parent',
          render: (_value, row) =>
            row.parent_id ? <span className="text-neutral-500">Linked</span> : <span className="text-neutral-400">None</span>,
        },
        { key: 'display_order', label: 'Order', widthClass: 'w-24' },
        {
          key: 'created_at',
          label: 'Created',
          render: value => new Date(value).toLocaleDateString(),
        },
      ]}
      formFields={[
        { name: 'name', label: 'Category name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text', required: true, description: 'Unique, URL-friendly identifier.' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'parent_id', label: 'Parent category', type: 'select', asyncOptions: fetchCategoryOptions },
        { name: 'display_order', label: 'Display order', type: 'number', step: 1 },
        { name: 'image_url', label: 'Image URL', type: 'url' },
      ]}
      validate={(values, mode, original) => {
        if (mode === 'update' && values.parent_id && original && original.id === values.parent_id) {
          return 'A category cannot be its own parent.';
        }
        return null;
      }}
      transformForSave={values => ({
        ...values,
        parent_id: values.parent_id || null,
        display_order: values.display_order === null ? 0 : values.display_order,
      })}
    />
  );
}
function ProductsManager() {
  const [variantProduct, setVariantProduct] = useState<Record<string, any> | null>(null);
  const formatCurrency = useAdminCurrencyFormatter();

  return (
    <>
      <CrudManager
        title="Products"
        table="products"
        defaultValues={{
          name: '',
          slug: '',
          description: '',
          category_id: '',
          base_price: 0,
          sale_price: '',
          sku: '',
          stock_quantity: 0,
          status: 'active',
          style: '',
          room_type: '',
          images: '',
          materials: '',
          is_featured: false,
          is_new: false,
        }}
        searchableColumns={['name', 'slug', 'sku']}
        orderBy={{ column: 'created_at', ascending: false }}
        columns={[
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'SKU', widthClass: 'w-32' },
          {
            key: 'base_price',
            label: 'Base price',
            widthClass: 'w-32',
            render: value => formatCurrency(Number(value ?? 0)),
          },
          {
            key: 'stock_quantity',
            label: 'Stock',
            widthClass: 'w-24',
          },
          {
            key: 'status',
            label: 'Status',
            render: value => <span className={badgeClass(value)}>{value}</span>,
          },
          {
            key: 'updated_at',
            label: 'Updated',
            render: value => new Date(value).toLocaleDateString(),
          },
        ]}
        formFields={[
          { name: 'name', label: 'Product name', type: 'text', required: true },
          { name: 'slug', label: 'Slug', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'category_id', label: 'Category', type: 'select', asyncOptions: fetchCategoryOptions },
          { name: 'base_price', label: 'Base price (USD)', type: 'number', step: 0.01, required: true },
          { name: 'sale_price', label: 'Sale price (USD)', type: 'number', step: 0.01 },
          { name: 'sku', label: 'SKU', type: 'text', required: true },
          { name: 'stock_quantity', label: 'Stock quantity', type: 'number', step: 1 },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'out_of_stock', label: 'Out of stock' },
            ],
          },
          { name: 'style', label: 'Style tags', type: 'text', placeholder: 'Modern, Minimalist' },
          { name: 'room_type', label: 'Room type', type: 'text', placeholder: 'Living, Bedroom' },
          {
            name: 'images',
            label: 'Image URLs',
            type: 'textarea',
            description: 'Enter one image URL per line. Links are automatically optimised for delivery.',
          },
          {
            name: 'materials',
            label: 'Materials',
            type: 'textarea',
            description: 'Comma separated list of materials (e.g. Oak, Linen, Steel).',
          },
          { name: 'is_featured', label: 'Featured product', type: 'checkbox' },
          { name: 'is_new', label: 'New arrival', type: 'checkbox' },
        ]}
        transformForEdit={item => ({
          ...item,
          category_id: item.category_id ?? '',
          sale_price: item.sale_price ?? '',
          images: Array.isArray(item.images) ? item.images.join('\n') : '',
          materials: Array.isArray(item.materials) ? item.materials.join(', ') : '',
        })}
        transformForSave={(values, mode) => {
          const images = typeof values.images === 'string'
            ? values.images
                .split(/\n|,/)
                .map((entry: string) => entry.trim())
                .filter((entry: string) => entry.length > 0)
            : Array.isArray(values.images)
            ? values.images
            : [];
          const materials = typeof values.materials === 'string'
            ? values.materials
                .split(',')
                .map((entry: string) => entry.trim())
                .filter((entry: string) => entry.length > 0)
            : Array.isArray(values.materials)
            ? values.materials
            : [];
          return {
            ...values,
            category_id: values.category_id || null,
            sale_price: values.sale_price === '' ? null : values.sale_price,
            images,
            materials: materials.length ? materials : null,
            is_featured: Boolean(values.is_featured),
            is_new: Boolean(values.is_new),
            name_i18n: { en: values.name, vi: values.name },
            description_i18n: { en: values.description ?? '', vi: values.description ?? '' },
            updated_at: mode === 'update' ? new Date().toISOString() : values.updated_at,
          };
        }}
        renderActions={item => (
          <button
            type="button"
            onClick={() => setVariantProduct(item)}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand-300 hover:text-brand-600"
          >
            <Layers className="h-3.5 w-3.5" /> Variants
          </button>
        )}
      />

      {variantProduct && (
        <VariantManager product={variantProduct} onClose={() => setVariantProduct(null)} />
      )}
    </>
  );
}
function VariantManager({ product, onClose }: { product: Record<string, any>; onClose: () => void }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formValues, setFormValues] = useState({
    variant_type: '',
    variant_value: '',
    price_adjustment: 0,
    sku: '',
    stock_quantity: 0,
  });
  const [pendingDelete, setPendingDelete] = useState<ProductVariant | null>(null);
  const formatCurrency = useAdminCurrencyFormatter();

  const loadVariants = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVariants(data ?? []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load product variants');
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const resetForm = () => {
    setFormValues({ variant_type: '', variant_value: '', price_adjustment: 0, sku: '', stock_quantity: 0 });
    setEditingVariant(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...formValues,
      product_id: product.id,
      price_adjustment: Number(formValues.price_adjustment ?? 0),
      stock_quantity: Number(formValues.stock_quantity ?? 0),
    };

    try {
      if (editingVariant) {
        const { error } = await supabase.from('product_variants').update(payload).eq('id', editingVariant.id);
        if (error) throw error;
        toast.success('Variant updated');
      } else {
        const { error } = await supabase.from('product_variants').insert(payload);
        if (error) throw error;
        toast.success('Variant created');
      }
      resetForm();
      loadVariants();
    } catch (error) {
      console.error(error);
      toast.error('Unable to save variant');
    }
  };

  const requestDelete = (variant: ProductVariant) => {
    setPendingDelete(variant);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', pendingDelete.id);
      if (error) throw error;
      toast.success('Variant removed');
      loadVariants();
    } catch (error) {
      console.error(error);
      toast.error('Unable to delete variant');
    } finally {
      setPendingDelete(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-2xl shadow-neutral-900/15">
        <div className="flex items-center justify-between border-b border-neutral-200/70 bg-gradient-to-r from-brand-50 via-white to-white px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Manage variants</h3>
            <p className="text-sm text-neutral-500">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.7fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Price adj.</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin text-brand-600" /> Loading variants...
                    </td>
                  </tr>
                )}
                {!loading && variants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No variants configured yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  variants.map(variant => (
                    <tr key={variant.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-2">{variant.variant_type}</td>
                      <td className="px-4 py-2">{variant.variant_value}</td>
                      <td className="px-4 py-2">{variant.sku}</td>
                      <td className="px-4 py-2">{formatCurrency(Number(variant.price_adjustment ?? 0))}</td>
                      <td className="px-4 py-2">{variant.stock_quantity}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVariant(variant);
                              setFormValues({
                                variant_type: variant.variant_type,
                                variant_value: variant.variant_value,
                                price_adjustment: variant.price_adjustment,
                                sku: variant.sku,
                                stock_quantity: variant.stock_quantity,
                              });
                            }}
                            className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 hover:border-brand-300 hover:text-brand-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(variant)}
                            className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-neutral-800">
              {editingVariant ? 'Update variant' : 'Create new variant'}
            </h4>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Variant type</label>
                <input
                  value={formValues.variant_type}
                  onChange={event => setFormValues(prev => ({ ...prev, variant_type: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  placeholder="Color, Size, Material"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Variant value</label>
                <input
                  value={formValues.variant_value}
                  onChange={event => setFormValues(prev => ({ ...prev, variant_value: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  placeholder="Walnut, Large"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">SKU</label>
                <input
                  value={formValues.sku}
                  onChange={event => setFormValues(prev => ({ ...prev, sku: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  placeholder="SKU-123"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Price adjustment (USD)</label>
                <input
                  type="number"
                  step={0.01}
                  value={formValues.price_adjustment}
                  onChange={event => setFormValues(prev => ({ ...prev, price_adjustment: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Stock quantity</label>
                <input
                  type="number"
                  step={1}
                  value={formValues.stock_quantity}
                  onChange={event => setFormValues(prev => ({ ...prev, stock_quantity: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {editingVariant ? 'Save changes' : 'Add variant'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Xóa biến thể"
          description="Biến thể sẽ bị xóa vĩnh viễn khỏi sản phẩm này. Bạn chắc chắn chứ?"
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          tone="danger"
          icon={<Trash2 className="h-5 w-5 text-rose-600" />}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
function VouchersManager() {
  const formatCurrency = useAdminCurrencyFormatter();
  return (
    <CrudManager
      title="Discount vouchers"
      table="vouchers"
      defaultValues={{
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase: 0,
        max_discount: '',
        usage_limit: '',
        valid_until: '',
        is_active: true,
      }}
      searchableColumns={['code', 'description']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'discount_type', label: 'Type', render: value => value.toUpperCase() },
        {
          key: 'discount_value',
          label: 'Value',
          render: (value, row) =>
            row.discount_type === 'percentage' ? `${value}%` : formatCurrency(Number(value ?? 0)),
        },
        {
          key: 'valid_until',
          label: 'Valid until',
          render: value => (value ? new Date(value).toLocaleDateString() : 'No expiry'),
        },
        {
          key: 'is_active',
          label: 'Status',
          render: value => <span className={badgeClass(value ? 'active' : 'closed')}>{value ? 'Active' : 'Inactive'}</span>,
        },
      ]}
      formFields={[
        { name: 'code', label: 'Voucher code', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        {
          name: 'discount_type',
          label: 'Discount type',
          type: 'select',
          options: [
            { value: 'percentage', label: 'Percentage' },
            { value: 'fixed', label: 'Fixed amount' },
          ],
        },
        { name: 'discount_value', label: 'Discount value', type: 'number', step: 0.01, required: true },
        { name: 'min_purchase', label: 'Minimum purchase', type: 'number', step: 0.01 },
        { name: 'max_discount', label: 'Maximum discount', type: 'number', step: 0.01 },
        { name: 'usage_limit', label: 'Usage limit', type: 'number', step: 1 },
        { name: 'valid_until', label: 'Valid until', type: 'datetime-local' },
        { name: 'is_active', label: 'Is active', type: 'checkbox' },
      ]}
      transformForSave={values => ({
        ...values,
        max_discount: values.max_discount === '' ? null : values.max_discount,
        usage_limit: values.usage_limit === '' ? null : values.usage_limit,
        valid_until: values.valid_until === '' ? null : values.valid_until,
        discount_value: Number(values.discount_value ?? 0),
        min_purchase: Number(values.min_purchase ?? 0),
        is_active: Boolean(values.is_active),
      })}
    />
  );
}
function OrdersManager() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const formatCurrency = useAdminCurrencyFormatter();

  return (
    <>
      <CrudManager
        title="Orders"
        table="orders"
        defaultValues={{
          user_id: '',
          status: 'pending',
          subtotal: 0,
          shipping_cost: 0,
          tax: 0,
          discount: 0,
          total_amount: 0,
          payment_method: 'credit-card',
          payment_status: 'pending',
          delivery_date: '',
          notes: '',
          assembly_service: false,
        }}
        searchableColumns={['order_number']}
        orderBy={{ column: 'created_at', ascending: false }}
        columns={[
          { key: 'order_number', label: 'Order #' },
          {
            key: 'user_id',
            label: 'Customer',
            render: value => value ?? 'Guest',
          },
          {
            key: 'total_amount',
            label: 'Total',
            render: value => formatCurrency(Number(value ?? 0)),
          },
          {
            key: 'status',
            label: 'Status',
            render: value => <span className={badgeClass(value)}>{value}</span>,
          },
          {
            key: 'payment_status',
            label: 'Payment',
            render: value => <span className={badgeClass(value)}>{value}</span>,
          },
          {
            key: 'created_at',
            label: 'Created',
            render: value => new Date(value).toLocaleString(),
          },
        ]}
        formFields={[
          { name: 'user_id', label: 'User ID', type: 'text', placeholder: 'Leave blank for guest order' },
          {
            name: 'status',
            label: 'Order status',
            type: 'select',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'out_for_delivery', label: 'Out for delivery' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          { name: 'subtotal', label: 'Subtotal', type: 'number', step: 0.01 },
          { name: 'shipping_cost', label: 'Shipping cost', type: 'number', step: 0.01 },
          { name: 'tax', label: 'Tax', type: 'number', step: 0.01 },
          { name: 'discount', label: 'Discount', type: 'number', step: 0.01 },
          { name: 'total_amount', label: 'Total amount', type: 'number', step: 0.01, required: true },
          {
            name: 'payment_method',
            label: 'Payment method',
            type: 'select',
            options: [
              { value: 'credit-card', label: 'Credit card' },
              { value: 'bank-transfer', label: 'Bank transfer' },
              { value: 'cod', label: 'Cash on delivery' },
            ],
          },
          {
            name: 'payment_status',
            label: 'Payment status',
            type: 'select',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ],
          },
          { name: 'delivery_date', label: 'Delivery date', type: 'datetime-local' },
          { name: 'assembly_service', label: 'Assembly service', type: 'checkbox' },
          { name: 'notes', label: 'Internal notes', type: 'textarea' },
        ]}
        transformForSave={values => ({
          ...values,
          user_id: values.user_id || null,
          delivery_date: values.delivery_date === '' ? null : values.delivery_date,
          subtotal: Number(values.subtotal ?? 0),
          shipping_cost: Number(values.shipping_cost ?? 0),
          tax: Number(values.tax ?? 0),
          discount: Number(values.discount ?? 0),
          total_amount: Number(values.total_amount ?? 0),
          assembly_service: Boolean(values.assembly_service),
          contact_info: values.contact_info ?? null,
          shipping_address: values.shipping_address ?? null,
        })}
        renderActions={record => (
          <button
            type="button"
            onClick={async () => {
              try {
                const { data, error } = await supabase
                  .from('orders')
                  .select('*')
                  .eq('id', record.id)
                  .single();
                if (error) throw error;
                setSelectedOrder(data as OrderWithRelations);
              } catch (error) {
                console.error(error);
                toast.error('Unable to load order details');
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand-300 hover:text-brand-600"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </button>
        )}
      />

      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  );
}
function OrderDetailsModal({ order, onClose }: { order: OrderWithRelations; onClose: () => void }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (mounted) setItems(data ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load order items');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadItems();
    return () => {
      mounted = false;
    };
  }, [order.id]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Order details</h3>
            <p className="text-sm text-neutral-500">{order.order_number}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
                <p className="text-xs uppercase font-semibold text-neutral-500">Financials</p>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd>{formatCurrency(order.shipping_cost)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Tax</dt>
                    <dd>{formatCurrency(order.tax)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Discount</dt>
                    <dd>-{formatCurrency(order.discount)}</dd>
                  </div>
                  <div className="flex justify-between font-semibold text-neutral-900">
                    <dt>Total</dt>
                    <dd>{formatCurrency(order.total_amount)}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
                <p className="text-xs uppercase font-semibold text-neutral-500">Status</p>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    Order status: <span className={badgeClass(order.status)}>{order.status}</span>
                  </p>
                  <p>
                    Payment status: <span className={badgeClass(order.payment_status)}>{order.payment_status}</span>
                  </p>
                  <p>Payment method: {order.payment_method}</p>
                  <p>Assembly service: {order.assembly_service ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Customer details</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs uppercase font-semibold text-neutral-500">Contact information</p>
                <pre className="mt-2 whitespace-pre-wrap text-neutral-700">
                  {JSON.stringify(order.contact_info ?? {}, null, 2)}
                </pre>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs uppercase font-semibold text-neutral-500">Shipping address</p>
                <pre className="mt-2 whitespace-pre-wrap text-neutral-700">
                  {JSON.stringify(order.shipping_address ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Items</h4>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Variant</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500">
                        <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-brand-600" /> Loading order items...
                      </td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    items.map(item => (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-2 font-medium text-neutral-700">{item.product_id}</td>
                        <td className="px-4 py-2 text-neutral-500">{item.variant_id ?? '—'}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-2 font-semibold text-neutral-800">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}
function BlogPostsManager() {
  return (
    <CrudManager
      title="Blog posts"
      table="blog_posts"
      defaultValues={{
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        author: '',
        published_at: '',
      }}
      searchableColumns={['title', 'slug', 'author']}
      orderBy={{ column: 'published_at', ascending: false }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'published_at',
          label: 'Published',
          render: value => new Date(value).toLocaleDateString(),
        },
        {
          key: 'author',
          label: 'Author',
        },
      ]}
      formFields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text', required: true },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { name: 'content', label: 'Content', type: 'textarea', required: true },
        { name: 'featured_image_url', label: 'Featured image', type: 'url' },
        { name: 'author', label: 'Author', type: 'text' },
        { name: 'published_at', label: 'Publish date', type: 'datetime-local' },
      ]}
      transformForSave={values => ({
        ...values,
        published_at: values.published_at === '' ? new Date().toISOString() : values.published_at,
        title_i18n: { en: values.title, vi: values.title },
        excerpt_i18n: { en: values.excerpt ?? '', vi: values.excerpt ?? '' },
      })}
    />
  );
}
function ContactManager({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <CrudManager
      title="Contact submissions"
      table="contact_messages"
      defaultValues={{
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        status: 'pending',
      }}
      searchableColumns={['name', 'email', 'subject']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Subject' },
        {
          key: 'status',
          label: 'Status',
          render: value => <span className={badgeClass(value)}>{value}</span>,
        },
        {
          key: 'created_at',
          label: 'Received',
          render: value => new Date(value).toLocaleString(),
        },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'read', label: 'Read' },
            { value: 'replied', label: 'Replied' },
            { value: 'closed', label: 'Closed' },
          ],
        },
      ]}
      transformForSave={values => ({
        ...values,
        phone: values.phone || '',
        status: values.status ?? 'pending',
      })}
      disableCreate={readOnly}
      disableDelete={readOnly}
      readOnly={readOnly}
    />
  );
}
function DesignRequestsManager({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <CrudManager
      title="Design service requests"
      table="design_service_requests"
      defaultValues={{
        name: '',
        email: '',
        phone: '',
        project_type: '',
        project_scope: '',
        preferred_style: '',
        budget_range: '',
        desired_timeline: '',
        additional_notes: '',
        status: 'pending',
      }}
      searchableColumns={['name', 'email', 'project_type', 'preferred_style']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'project_type', label: 'Project type' },
        { key: 'budget_range', label: 'Budget' },
        {
          key: 'status',
          label: 'Status',
          render: value => <span className={badgeClass(value)}>{value}</span>,
        },
        {
          key: 'created_at',
          label: 'Submitted',
          render: value => new Date(value).toLocaleString(),
        },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'project_type', label: 'Project type', type: 'text', required: true },
        { name: 'project_scope', label: 'Project scope', type: 'textarea' },
        { name: 'preferred_style', label: 'Preferred style', type: 'text' },
        { name: 'budget_range', label: 'Budget range', type: 'text' },
        { name: 'desired_timeline', label: 'Desired timeline', type: 'text' },
        { name: 'additional_notes', label: 'Additional notes', type: 'textarea' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'in_review', label: 'In review' },
            { value: 'quoted', label: 'Quoted' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'completed', label: 'Completed' },
            { value: 'closed', label: 'Closed' },
          ],
        },
      ]}
      transformForSave={values => ({
        ...values,
        phone: values.phone || '',
        status: values.status ?? 'pending',
      })}
      disableCreate={readOnly}
      disableDelete={readOnly}
      readOnly={readOnly}
    />
  );
}
function CareerApplicationsManager({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <CrudManager
      title="Career applications"
      table="career_applications"
      defaultValues={{
        full_name: '',
        email: '',
        phone: '',
        position_applied: '',
        resume_url: '',
        cover_letter: '',
        portfolio_url: '',
        expected_salary: '',
        status: 'received',
        notes: '',
      }}
      searchableColumns={['full_name', 'email', 'position_applied']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'position_applied', label: 'Position' },
        { key: 'expected_salary', label: 'Expected salary' },
        {
          key: 'status',
          label: 'Status',
          render: value => <span className={badgeClass(value)}>{value}</span>,
        },
        {
          key: 'created_at',
          label: 'Applied',
          render: value => new Date(value).toLocaleString(),
        },
      ]}
      formFields={[
        { name: 'full_name', label: 'Full name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'position_applied', label: 'Position applied', type: 'text', required: true },
        { name: 'resume_url', label: 'Resume URL', type: 'url', required: true },
        { name: 'cover_letter', label: 'Cover letter', type: 'textarea' },
        { name: 'portfolio_url', label: 'Portfolio URL', type: 'url' },
        { name: 'expected_salary', label: 'Expected salary', type: 'text' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'received', label: 'Received' },
            { value: 'reviewing', label: 'Reviewing' },
            { value: 'interview', label: 'Interview' },
            { value: 'offer', label: 'Offer' },
            { value: 'hired', label: 'Hired' },
            { value: 'archived', label: 'Archived' },
            { value: 'rejected', label: 'Rejected' },
          ],
        },
        { name: 'notes', label: 'Internal notes', type: 'textarea' },
      ]}
      transformForSave={values => ({
        ...values,
        phone: values.phone || '',
        expected_salary: values.expected_salary || '',
        status: values.status ?? 'received',
      })}
      disableCreate={readOnly}
      disableDelete={readOnly}
      readOnly={readOnly}
    />
  );
}
function ProfilesManager({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <CrudManager
      title="Customer profiles"
      table="profiles"
      defaultValues={{
        full_name: '',
        phone: '',
        address: '',
        loyalty_points: 0,
        loyalty_tier: 'Silver',
      }}
      searchableColumns={['full_name', 'phone']}
      orderBy={{ column: 'created_at', ascending: false }}
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'loyalty_points', label: 'Points', widthClass: 'w-24' },
        { key: 'loyalty_tier', label: 'Tier' },
        {
          key: 'updated_at',
          label: 'Updated',
          render: value => new Date(value).toLocaleString(),
        },
      ]}
      formFields={[
        { name: 'full_name', label: 'Full name', type: 'text' },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'loyalty_points', label: 'Loyalty points', type: 'number', step: 1 },
        {
          name: 'loyalty_tier',
          label: 'Loyalty tier',
          type: 'select',
          options: [
            { value: 'Silver', label: 'Silver' },
            { value: 'Gold', label: 'Gold' },
            { value: 'Platinum', label: 'Platinum' },
          ],
        },
      ]}
      transformForSave={values => ({
        ...values,
        loyalty_points: Number(values.loyalty_points ?? 0),
      })}
      disableCreate={readOnly}
      disableDelete={readOnly}
      readOnly={readOnly}
    />
  );
}

export { AdminPanelPage };
