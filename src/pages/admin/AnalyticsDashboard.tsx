import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  PieChart,
  RefreshCw,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getLocalizedValue } from '../../utils/i18n';

type OrdersRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

type TimeGranularity = 'day' | 'month' | 'year';

type TimeFilterValue = {
  granularity: TimeGranularity;
  value: string;
};

type BestSellerRecord = {
  productId: string;
  name: string;
  translations?: Record<string, string> | null;
  quantity: number;
  revenue: number;
};

type TimeSeriesPoint = {
  bucket: string;
  orders: number;
  revenue: number;
};

type AnalyticsSnapshot = {
  range: TimeFilterValue;
  start: string;
  end: string;
  label: string;
  orders: {
    total: number;
    completed: number;
    processing: number;
    cancelled: number;
    byStatus: Record<string, number>;
    trend: TimeSeriesPoint[];
  };
  revenue: number;
  averageOrderValue: number;
  newCustomers: number;
  bestSellers: BestSellerRecord[];
  content: {
    blogPosts: number;
    contactMessages: number;
    designRequests: number;
    careerApplications: number;
  };
};

type ExportFormat = 'csv' | 'excel' | 'pdf';

type OrderItemWithProduct = OrderItemRow & {
  products?: Pick<ProductRow, 'id' | 'name' | 'name_i18n'> | null;
};

type NumberDiff = {
  absolute: number;
  percent: number;
};

const COMPLETED_STATUSES = new Set(['delivered', 'completed']);
const PROCESSING_STATUSES = new Set([
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'in_review',
  'reviewing',
  'quoted',
  'scheduled',
]);
const CANCELLED_STATUSES = new Set(['cancelled', 'rejected', 'closed', 'archived']);

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function computeBuckets(selection: TimeFilterValue): string[] {
  if (selection.granularity === 'day') {
    return Array.from({ length: 24 }, (_, index) => `${pad(index)}:00`);
  }

  if (selection.granularity === 'month') {
    const [yearString, monthString] = selection.value.split('-');
    const year = Number(yearString);
    const month = Number(monthString);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: daysInMonth }, (_, index) => `${pad(index + 1)}`);
  }

  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
}

function parseSelection(selection: TimeFilterValue) {
  if (selection.granularity === 'day') {
    const [yearString, monthString, dayString] = selection.value.split('-');
    const year = Number(yearString);
    const month = Number(monthString) - 1;
    const day = Number(dayString);
    const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      labelDate: startDate,
    };
  }

  if (selection.granularity === 'month') {
    const [yearString, monthString] = selection.value.split('-');
    const year = Number(yearString);
    const month = Number(monthString) - 1;
    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      labelDate: startDate,
    };
  }

  const year = Number(selection.value);
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    labelDate: startDate,
  };
}

function formatSelectionLabel(selection: TimeFilterValue, locale: string) {
  const { labelDate } = parseSelection(selection);

  if (selection.granularity === 'day') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(labelDate);
  }

  if (selection.granularity === 'month') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
    }).format(labelDate);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
  }).format(labelDate);
}

function bucketForDate(selection: TimeFilterValue, isoDate: string) {
  const date = new Date(isoDate);

  if (selection.granularity === 'day') {
    return `${pad(date.getUTCHours())}:00`;
  }

  if (selection.granularity === 'month') {
    return pad(date.getUTCDate());
  }

  return pad(date.getUTCMonth() + 1);
}

function computeDiff(current: number, previous: number): NumberDiff {
  const absolute = current - previous;
  if (!previous) {
    return {
      absolute,
      percent: current === 0 ? 0 : 100,
    };
  }

  return {
    absolute,
    percent: (absolute / previous) * 100,
  };
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function buildCsv(snapshot: AnalyticsSnapshot) {
  const lines: string[] = [];
  lines.push('Metric,Value');
  lines.push(`Timeframe,${snapshot.label}`);
  lines.push(`Total Revenue,${snapshot.revenue}`);
  lines.push(`Total Orders,${snapshot.orders.total}`);
  lines.push(`Completed Orders,${snapshot.orders.completed}`);
  lines.push(`Processing Orders,${snapshot.orders.processing}`);
  lines.push(`Cancelled Orders,${snapshot.orders.cancelled}`);
  lines.push(`Average Order Value,${snapshot.averageOrderValue}`);
  lines.push(`New Customers,${snapshot.newCustomers}`);
  lines.push(`Blog Posts,${snapshot.content.blogPosts}`);
  lines.push(`Contact Messages,${snapshot.content.contactMessages}`);
  lines.push(`Design Requests,${snapshot.content.designRequests}`);
  lines.push(`Career Applications,${snapshot.content.careerApplications}`);
  lines.push('');
  lines.push('Best Sellers');
  lines.push('Product,Quantity,Revenue');
  snapshot.bestSellers.forEach(record => {
    lines.push(`${record.name.replace(/"/g, '""')},${record.quantity},${record.revenue}`);
  });
  lines.push('');
  lines.push('Revenue Trend');
  lines.push('Bucket,Orders,Revenue');
  snapshot.orders.trend.forEach(point => {
    lines.push(`${point.bucket},${point.orders},${point.revenue}`);
  });
  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

function buildExcel(
  snapshot: AnalyticsSnapshot,
  locale: string,
  formatCurrencyValue: (value: number) => string
) {
  const rows: string[] = [];
  const metrics = [
    ['Timeframe', snapshot.label],
    ['Total Revenue', formatCurrencyValue(snapshot.revenue)],
    ['Total Orders', formatNumber(snapshot.orders.total, locale)],
    ['Completed Orders', formatNumber(snapshot.orders.completed, locale)],
    ['Processing Orders', formatNumber(snapshot.orders.processing, locale)],
    ['Cancelled Orders', formatNumber(snapshot.orders.cancelled, locale)],
    ['Average Order Value', formatCurrencyValue(snapshot.averageOrderValue)],
    ['New Customers', formatNumber(snapshot.newCustomers, locale)],
    ['Blog Posts', formatNumber(snapshot.content.blogPosts, locale)],
    ['Contact Messages', formatNumber(snapshot.content.contactMessages, locale)],
    ['Design Requests', formatNumber(snapshot.content.designRequests, locale)],
    ['Career Applications', formatNumber(snapshot.content.careerApplications, locale)],
  ];

  rows.push('<table border="1">');
  rows.push('<tr><th>Metric</th><th>Value</th></tr>');
  metrics.forEach(([label, value]) => {
    rows.push(`<tr><td>${label}</td><td>${value}</td></tr>`);
  });
  rows.push('</table>');

  if (snapshot.bestSellers.length) {
    rows.push('<br /><table border="1">');
    rows.push('<tr><th>Product</th><th>Quantity</th><th>Revenue</th></tr>');
    snapshot.bestSellers.forEach(item => {
      rows.push(
        `<tr><td>${item.name}</td><td>${formatNumber(item.quantity, locale)}</td><td>${formatCurrencyValue(item.revenue)}</td></tr>`
      );
    });
    rows.push('</table>');
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${rows.join('')}</body></html>`;
  return new Blob([html], {
    type: 'application/vnd.ms-excel',
  });
}

function buildPdf(
  snapshot: AnalyticsSnapshot,
  locale: string,
  formatCurrencyValue: (value: number) => string
) {
  const summaryLines = [
    `Timeframe: ${snapshot.label}`,
    `Total revenue: ${formatCurrencyValue(snapshot.revenue)}`,
    `Total orders: ${formatNumber(snapshot.orders.total, locale)}`,
    `Completed orders: ${formatNumber(snapshot.orders.completed, locale)}`,
    `Processing orders: ${formatNumber(snapshot.orders.processing, locale)}`,
    `Cancelled orders: ${formatNumber(snapshot.orders.cancelled, locale)}`,
    `Average order value: ${formatCurrencyValue(snapshot.averageOrderValue)}`,
    `New customers: ${formatNumber(snapshot.newCustomers, locale)}`,
    `Blog posts: ${formatNumber(snapshot.content.blogPosts, locale)}`,
    `Contact messages: ${formatNumber(snapshot.content.contactMessages, locale)}`,
    `Design requests: ${formatNumber(snapshot.content.designRequests, locale)}`,
    `Career applications: ${formatNumber(snapshot.content.careerApplications, locale)}`,
  ];

  const bestSellerLines = snapshot.bestSellers.map(
    item => `${item.name} — ${item.quantity} (${formatCurrencyValue(item.revenue)})`
  );
  const trendLines = snapshot.orders.trend.map(
    point => `${point.bucket}: ${formatCurrencyValue(point.revenue)} / ${formatNumber(point.orders, locale)}`
  );

  const content = [
    ...summaryLines,
    '',
    'Best sellers:',
    ...bestSellerLines,
    '',
    'Revenue trend:',
    ...trendLines,
  ].join('\n');

  const text = content
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, ') Tj T* (');

  const streamContent = `BT /F1 12 Tf 50 800 Td (${text}) Tj ET`;
  const header = `%PDF-1.4\n`;
  const objects: string[] = [];
  const catalog = `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n`;
  const pages = `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n`;
  const page = `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n`;
  const font = `4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n`;
  const stream = `5 0 obj<</Length ${streamContent.length}>>stream\n${streamContent}\nendstream\nendobj\n`;
  objects.push(catalog, pages, page, font, stream);

  let offset = header.length;
  const xrefEntries = ['0000000000 65535 f '];
  const body = objects
    .map(object => {
      const entry = `${offset.toString().padStart(10, '0')} 00000 n `;
      xrefEntries.push(entry);
      offset += object.length;
      return object;
    })
    .join('');

  const xref = `xref\n0 ${xrefEntries.length}\n${xrefEntries.join('\n')}\n`;
  const trailer = `trailer<</Size ${xrefEntries.length}/Root 1 0 R>>\nstartxref\n${offset}\n%%EOF`;
  return new Blob([header, body, xref, trailer], { type: 'application/pdf' });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function useAnalytics(snapshot: TimeFilterValue | null) {
  const { language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { start, end } = parseSelection(snapshot);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .gte('created_at', start)
          .lt('created_at', end)
          .order('created_at', { ascending: true });
        if (ordersError) throw ordersError;
        const orders = (ordersData ?? []) as OrdersRow[];

        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('id, product_id, quantity, price, created_at, products(id, name, name_i18n)')
          .gte('created_at', start)
          .lt('created_at', end);
        if (orderItemsError) throw orderItemsError;
        const orderItems = (orderItemsData ?? []) as unknown as OrderItemWithProduct[];

        const [profilesRes, blogRes, contactRes, designRes, careerRes] = await Promise.all([
          supabase.from('profiles').select('id').gte('created_at', start).lt('created_at', end),
          supabase.from('blog_posts').select('id').gte('created_at', start).lt('created_at', end),
          supabase.from('contact_messages').select('id').gte('created_at', start).lt('created_at', end),
          supabase.from('design_service_requests').select('id').gte('created_at', start).lt('created_at', end),
          supabase.from('career_applications').select('id').gte('created_at', start).lt('created_at', end),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (blogRes.error) throw blogRes.error;
        if (contactRes.error) throw contactRes.error;
        if (designRes.error) throw designRes.error;
        if (careerRes.error) throw careerRes.error;

        const revenue = orders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);
        const ordersByStatus = orders.reduce<Record<string, number>>((accumulator, order) => {
          const key = order.status ?? 'unknown';
          accumulator[key] = (accumulator[key] ?? 0) + 1;
          return accumulator;
        }, {});

        const completed = orders.filter(order => COMPLETED_STATUSES.has(order.status ?? '')).length;
        const processing = orders.filter(order => PROCESSING_STATUSES.has(order.status ?? '')).length;
        const cancelled = orders.filter(order => CANCELLED_STATUSES.has(order.status ?? '')).length;

        const buckets = computeBuckets(snapshot);
        const timeSeriesMap = new Map<string, TimeSeriesPoint>();
        buckets.forEach(bucket => {
          timeSeriesMap.set(bucket, { bucket, orders: 0, revenue: 0 });
        });
        orders.forEach(order => {
          const bucket = bucketForDate(snapshot, order.created_at);
          const entry = timeSeriesMap.get(bucket);
          if (entry) {
            entry.orders += 1;
            entry.revenue += order.total_amount ?? 0;
          }
        });

        const timeSeries = Array.from(timeSeriesMap.values());

        const bestSellerMap = new Map<string, BestSellerRecord>();
        orderItems.forEach(item => {
          const productId = item.product_id;
          const existing = bestSellerMap.get(productId);
          const revenueContribution = (item.price ?? 0) * (item.quantity ?? 0);
          if (existing) {
            existing.quantity += item.quantity ?? 0;
            existing.revenue += revenueContribution;
          } else {
            bestSellerMap.set(productId, {
              productId,
              name: item.products?.name ?? 'Unknown product',
              translations: item.products?.name_i18n ?? null,
              quantity: item.quantity ?? 0,
              revenue: revenueContribution,
            });
          }
        });

        const bestSellers = Array.from(bestSellerMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        const snapshotData: AnalyticsSnapshot = {
          range: snapshot,
          start,
          end,
          label: formatSelectionLabel(snapshot, locale),
          revenue,
          averageOrderValue: orders.length ? revenue / orders.length : 0,
          newCustomers: profilesRes.data?.length ?? 0,
          bestSellers,
          content: {
            blogPosts: blogRes.data?.length ?? 0,
            contactMessages: contactRes.data?.length ?? 0,
            designRequests: designRes.data?.length ?? 0,
            careerApplications: careerRes.data?.length ?? 0,
          },
          orders: {
            total: orders.length,
            completed,
            processing,
            cancelled,
            byStatus: ordersByStatus,
            trend: timeSeries,
          },
        };

        if (!cancelled) {
          setData(snapshotData);
        }
      } catch (fetchError: any) {
        console.error(fetchError);
        if (!cancelled) {
          setError(fetchError?.message ?? 'Unable to load analytics');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [snapshot, locale]);

  return { data, loading, error };
}

function ComparisonBadge({ diff }: { diff: NumberDiff }) {
  const isPositive = diff.absolute >= 0;
  const trendColor = isPositive ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100';
  const arrow = isPositive ? '▲' : '▼';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trendColor}`}>
      {arrow}
      {diff.absolute.toLocaleString(undefined, { maximumFractionDigits: 1 })}
      <span className="text-[0.65rem] opacity-80">({diff.percent.toFixed(1)}%)</span>
    </span>
  );
}

function ChartShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-inner">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

function BarChart({ data, accent = '#2563eb' }: { data: TimeSeriesPoint[]; accent?: string }) {
  const maxValue = Math.max(...data.map(point => point.revenue), 0);
  const safeLength = Math.max(data.length, 1);
  return (
    <svg viewBox="0 0 100 60" className="h-48 w-full">
      {data.map((point, index) => {
        const height = maxValue ? (point.revenue / maxValue) * 50 : 0;
        const width = 90 / safeLength;
        const x = 5 + index * (90 / safeLength);
        return (
          <rect key={point.bucket} x={x} y={58 - height} width={width} height={height} fill={accent} rx={1.5} />
        );
      })}
      <line x1={2} x2={98} y1={58} y2={58} stroke="#d4d4d8" strokeWidth={0.6} />
    </svg>
  );
}

function LineChart({ data }: { data: TimeSeriesPoint[] }) {
  const maxValue = Math.max(...data.map(point => point.revenue), 0);
  const denominator = Math.max(data.length - 1, 1);
  const points = data.map((point, index) => {
    const x = (index / denominator) * 100;
    const y = 58 - (maxValue ? (point.revenue / maxValue) * 50 : 0);
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 100 60" className="h-48 w-full">
      <polyline points={points.join(' ')} fill="none" stroke="#0ea5e9" strokeWidth={1.5} strokeLinecap="round" />
      {data.map((point, index) => {
        const x = (index / denominator) * 100;
        const y = 58 - (maxValue ? (point.revenue / maxValue) * 50 : 0);
        return <circle key={point.bucket} cx={x} cy={y} r={1.5} fill="#0ea5e9" />;
      })}
      <line x1={2} x2={98} y1={58} y2={58} stroke="#d4d4d8" strokeWidth={0.6} />
    </svg>
  );
}

function DonutChart({ values }: { values: { label: string; value: number; color: string }[] }) {
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1;
  let cumulative = 0;
  const radius = 25;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 60 60" className="h-40 w-40">
      <circle cx="30" cy="30" r={radius} fill="none" stroke="#e4e4e7" strokeWidth={8} />
      {values.map(item => {
        const value = (item.value / total) * circumference;
        const dashArray = `${value} ${circumference - value}`;
        const dashOffset = -cumulative;
        cumulative += value;
        return (
          <circle
            key={item.label}
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={8}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        );
      })}
      <text x="30" y="32" textAnchor="middle" className="text-sm font-semibold fill-neutral-700">
        {total}
      </text>
    </svg>
  );
}

export function AnalyticsDashboard() {
  const { language, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatCurrency = useCallback((value: number) => formatPrice(value ?? 0, language), [formatPrice, language]);
  const [primaryFilter, setPrimaryFilter] = useState<TimeFilterValue>(() => ({
    granularity: 'month',
    value: new Date().toISOString().slice(0, 7),
  }));
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparisonFilter, setComparisonFilter] = useState<TimeFilterValue>({
    granularity: 'month',
    value: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 7),
  });

  const primaryAnalytics = useAnalytics(primaryFilter);
  const comparisonAnalytics = useAnalytics(compareEnabled ? comparisonFilter : null);

  const revenueDiff = useMemo(() => {
    if (!primaryAnalytics.data || !comparisonAnalytics.data) return null;
    return computeDiff(primaryAnalytics.data.revenue, comparisonAnalytics.data.revenue);
  }, [primaryAnalytics.data, comparisonAnalytics.data]);

  const ordersDiff = useMemo(() => {
    if (!primaryAnalytics.data || !comparisonAnalytics.data) return null;
    return computeDiff(primaryAnalytics.data.orders.total, comparisonAnalytics.data.orders.total);
  }, [primaryAnalytics.data, comparisonAnalytics.data]);

  const customersDiff = useMemo(() => {
    if (!primaryAnalytics.data || !comparisonAnalytics.data) return null;
    return computeDiff(primaryAnalytics.data.newCustomers, comparisonAnalytics.data.newCustomers);
  }, [primaryAnalytics.data, comparisonAnalytics.data]);

  const handleFilterChange = (update: Partial<TimeFilterValue>, isComparison = false) => {
    const setter = isComparison ? setComparisonFilter : setPrimaryFilter;
    setter(current => {
      const granularity = update.granularity ?? current.granularity;
      let value = update.value ?? current.value;

      if (update.granularity && update.value === undefined) {
        const now = new Date();
        if (granularity === 'day') {
          value = now.toISOString().slice(0, 10);
        } else if (granularity === 'month') {
          value = now.toISOString().slice(0, 7);
        } else {
          value = now.getUTCFullYear().toString();
        }
      }

      return { granularity, value };
    });
  };

  const exportReport = (format: ExportFormat) => {
    if (!primaryAnalytics.data) return;
    const snapshot = primaryAnalytics.data;
    if (format === 'csv') {
      const blob = buildCsv(snapshot);
      downloadBlob(blob, `analytics-${snapshot.range.value}.csv`);
      return;
    }
    if (format === 'excel') {
      const blob = buildExcel(snapshot, locale, formatCurrency);
      downloadBlob(blob, `analytics-${snapshot.range.value}.xls`);
      return;
    }
    const blob = buildPdf(snapshot, locale, formatCurrency);
    downloadBlob(blob, `analytics-${snapshot.range.value}.pdf`);
  };

  const renderTimeInput = (selection: TimeFilterValue, isComparison = false) => {
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
      handleFilterChange({ value: event.target.value }, isComparison);
    };

    if (selection.granularity === 'day') {
      return (
        <input
          type="date"
          value={selection.value}
          onChange={handleValueChange}
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
      );
    }

    if (selection.granularity === 'month') {
      return (
        <input
          type="month"
          value={selection.value}
          onChange={handleValueChange}
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
      );
    }

    return (
      <input
        type="number"
        min="2000"
        max="2100"
        value={selection.value}
        onChange={handleValueChange}
        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
      />
    );
  };

  const resetToCurrent = () => {
    const now = new Date();
    if (primaryFilter.granularity === 'day') {
      handleFilterChange({ value: now.toISOString().slice(0, 10) });
      return;
    }
    if (primaryFilter.granularity === 'month') {
      handleFilterChange({ value: now.toISOString().slice(0, 7) });
      return;
    }
    handleFilterChange({ value: now.getUTCFullYear().toString() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-100 p-3 text-brand-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{t('admin.analytics.title', 'Thống kê & báo cáo')}</h2>
            <p className="text-sm text-neutral-500">
              {t('admin.analytics.subtitle', 'Theo dõi hiệu suất theo thời gian và xuất báo cáo nhanh chóng.')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportReport('csv')}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <Download className="h-4 w-4" /> {t('admin.analytics.export.csv', 'CSV')}
          </button>
          <button
            type="button"
            onClick={() => exportReport('excel')}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <Download className="h-4 w-4" /> {t('admin.analytics.export.excel', 'Excel')}
          </button>
          <button
            type="button"
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <Download className="h-4 w-4" /> {t('admin.analytics.export.pdf', 'PDF')}
          </button>
        </div>
      </div>

      <div className="grid gap-6 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-brand-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-brand-100 p-3 text-brand-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-brand-600">
                  {t('admin.analytics.primary', 'Khoảng thời gian')}
                </p>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {formatSelectionLabel(primaryFilter, locale)}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2 rounded-full bg-white/70 p-1">
                {(['day', 'month', 'year'] as TimeGranularity[]).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFilterChange({ granularity: option }, false)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      primaryFilter.granularity === option
                        ? 'bg-brand-600 text-white shadow'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {t(`admin.analytics.${option}`, option.toUpperCase())}
                  </button>
                ))}
              </div>
              {renderTimeInput(primaryFilter)}
              <button
                type="button"
                onClick={resetToCurrent}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                <RefreshCw className="h-4 w-4" />
                {t('admin.analytics.today', 'Mới nhất')}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-100 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500">
                  {t('admin.analytics.compare', 'So sánh')}
                </p>
                {compareEnabled && (
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {formatSelectionLabel(comparisonFilter, locale)}
                  </h3>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                <input
                  type="checkbox"
                  checked={compareEnabled}
                  onChange={event => setCompareEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                {t('admin.analytics.enableCompare', 'Bật so sánh')}
              </label>
            </div>

            {compareEnabled ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2 rounded-full bg-white/70 p-1">
                  {(['day', 'month', 'year'] as TimeGranularity[]).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleFilterChange({ granularity: option }, true)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        comparisonFilter.granularity === option
                          ? 'bg-neutral-900 text-white shadow'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {t(`admin.analytics.${option}`, option.toUpperCase())}
                    </button>
                  ))}
                </div>
                {renderTimeInput(comparisonFilter, true)}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                {t('admin.analytics.compareHint', 'Chọn để so sánh hai khoảng thời gian khác nhau.')}
              </p>
            )}
          </div>
        </div>

        {primaryAnalytics.loading ? (
          <div className="flex h-56 items-center justify-center text-neutral-500">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            {t('app.loading', 'Đang tải')}
          </div>
        ) : primaryAnalytics.error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {primaryAnalytics.error}
          </div>
        ) : primaryAnalytics.data ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-neutral-500">
                    {t('admin.analytics.totalRevenue', 'Tổng doanh thu')}
                  </span>
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                </div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(primaryAnalytics.data.revenue)}
                </p>
                {revenueDiff && <ComparisonBadge diff={revenueDiff} />}
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-neutral-500">
                    {t('admin.analytics.totalOrders', 'Số lượng đơn hàng')}
                  </span>
                  <BarChart3 className="h-4 w-4 text-brand-600" />
                </div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {formatNumber(primaryAnalytics.data.orders.total, locale)}
                </p>
                {ordersDiff && <ComparisonBadge diff={ordersDiff} />}
                <p className="mt-2 text-xs text-neutral-500">
                  {t('admin.analytics.completed', 'Hoàn thành')}:{' '}
                  <strong className="text-neutral-700">{primaryAnalytics.data.orders.completed}</strong> ·{' '}
                  {t('admin.analytics.processing', 'Đang xử lý')}:{' '}
                  <strong className="text-neutral-700">{primaryAnalytics.data.orders.processing}</strong> ·{' '}
                  {t('admin.analytics.cancelled', 'Đã hủy')}:{' '}
                  <strong className="text-neutral-700">{primaryAnalytics.data.orders.cancelled}</strong>
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-neutral-500">
                    {t('admin.analytics.newCustomers', 'Khách hàng mới')}
                  </span>
                  <UsersIcon className="h-4 w-4 text-brand-600" />
                </div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {formatNumber(primaryAnalytics.data.newCustomers, locale)}
                </p>
                {customersDiff && <ComparisonBadge diff={customersDiff} />}
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-neutral-500">
                    {t('admin.analytics.averageOrderValue', 'Giá trị đơn hàng TB')}
                  </span>
                  <PieChart className="h-4 w-4 text-brand-600" />
                </div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(primaryAnalytics.data.averageOrderValue)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <ChartShell
                title={t('admin.analytics.revenueTrendTitle', 'Doanh thu theo thời gian')}
                description={t(
                  'admin.analytics.revenueTrendSubtitle',
                  'Theo dõi doanh thu và đơn hàng trong giai đoạn đã chọn.'
                )}
              >
                <div className="flex w-full flex-col gap-6 md:flex-row">
                  <div className="flex-1">
                    <LineChart data={primaryAnalytics.data.orders.trend} />
                  </div>
                  <div className="flex-1">
                    <BarChart data={primaryAnalytics.data.orders.trend} />
                  </div>
                </div>
              </ChartShell>

              <ChartShell
                title={t('admin.analytics.statusBreakdownTitle', 'Trạng thái đơn hàng')}
                description={t('admin.analytics.statusBreakdownSubtitle', 'Tỷ trọng đơn hàng theo trạng thái hoạt động.')}
              >
                <DonutChart
                  values={[
                    {
                      label: t('admin.analytics.completed', 'Hoàn thành'),
                      value: primaryAnalytics.data.orders.completed,
                      color: '#10b981',
                    },
                    {
                      label: t('admin.analytics.processing', 'Đang xử lý'),
                      value: primaryAnalytics.data.orders.processing,
                      color: '#3b82f6',
                    },
                    {
                      label: t('admin.analytics.cancelled', 'Đã hủy'),
                      value: primaryAnalytics.data.orders.cancelled,
                      color: '#ef4444',
                    },
                  ]}
                />
              </ChartShell>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">
                    {t('admin.analytics.bestSellers', 'Sản phẩm bán chạy')}
                  </h3>
                  <BarChart3 className="h-5 w-5 text-brand-600" />
                </div>
                <div className="space-y-4">
                  {primaryAnalytics.data.bestSellers.length === 0 && (
                    <p className="text-sm text-neutral-500">
                      {t('admin.analytics.noBestSellers', 'Chưa có dữ liệu bán hàng')}
                    </p>
                  )}
                  {primaryAnalytics.data.bestSellers.map(item => (
                    <div key={item.productId} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {getLocalizedValue(item.translations ?? null, language, item.name)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {t('admin.analytics.unitsSold', 'Số lượng bán')}:{' '}
                          <strong>{item.quantity}</strong>
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-neutral-700">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">
                    {t('admin.analytics.contentUpdates', 'Hoạt động nội dung')}
                  </h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between text-neutral-700">
                    <span>{t('admin.analytics.blogPosts', 'Bài viết mới')}</span>
                    <strong>{primaryAnalytics.data.content.blogPosts}</strong>
                  </li>
                  <li className="flex items-center justify-between text-neutral-700">
                    <span>{t('admin.analytics.contactMessages', 'Liên hệ mới')}</span>
                    <strong>{primaryAnalytics.data.content.contactMessages}</strong>
                  </li>
                  <li className="flex items-center justify-between text-neutral-700">
                    <span>{t('admin.analytics.designRequests', 'Yêu cầu thiết kế')}</span>
                    <strong>{primaryAnalytics.data.content.designRequests}</strong>
                  </li>
                  <li className="flex items-center justify-between text-neutral-700">
                    <span>{t('admin.analytics.careerApplications', 'Ứng tuyển mới')}</span>
                    <strong>{primaryAnalytics.data.content.careerApplications}</strong>
                  </li>
                </ul>
              </div>

              {comparisonAnalytics.data && (
                <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-neutral-900">
                      {t('admin.analytics.comparisonSummary', 'So sánh nhanh')}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {formatSelectionLabel(primaryAnalytics.data.range, locale)} ↔{' '}
                      {formatSelectionLabel(comparisonAnalytics.data.range, locale)}
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span>{t('admin.analytics.totalRevenue', 'Tổng doanh thu')}</span>
                      {revenueDiff && <ComparisonBadge diff={revenueDiff} />}
                    </li>
                    <li className="flex items-center justify-between">
                      <span>{t('admin.analytics.totalOrders', 'Số lượng đơn hàng')}</span>
                      {ordersDiff && <ComparisonBadge diff={ordersDiff} />}
                    </li>
                    <li className="flex items-center justify-between">
                      <span>{t('admin.analytics.newCustomers', 'Khách hàng mới')}</span>
                      {customersDiff && <ComparisonBadge diff={customersDiff} />}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
