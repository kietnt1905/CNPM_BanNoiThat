import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import adminDashboardApi from '../../api/adminDashboard';

const CATEGORY_COLORS = ['#8C6A48', '#2C241E', '#C9A982', '#A68A68', '#5C4033', '#D4A373'];
const PAYMENT_COLORS = {
  cod: '#8C6A48',
  bank_transfer: '#2C241E',
  vnpay: '#0066CC',
  momo: '#D82D8B',
};
const FALLBACK_PAYMENT_COLORS = ['#8C6A48', '#2C241E', '#0066CC', '#D82D8B'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7_days'); // '7_days' | '30_days' | '12_months'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await adminDashboardApi.getOverview(period);
      if (res.data?.status && res.data?.data) {
        setDashboardData(res.data.data);
      } else {
        setError(res.data?.message || 'Không thể tải dữ liệu thống kê tổng quan.');
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải bảng điều khiển quản trị.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const rawKpis = dashboardData?.kpis || {};
  const kpis = {
    current_month_revenue:
      rawKpis.current_month_revenue ?? rawKpis.revenue?.this_month ?? 0,
    current_month_revenue_display:
      rawKpis.current_month_revenue_display ||
      rawKpis.revenue?.this_month_display ||
      (rawKpis.revenue?.this_month
        ? `${new Intl.NumberFormat('vi-VN').format(rawKpis.revenue.this_month)}₫`
        : '0₫'),
    revenue_growth_percentage:
      rawKpis.revenue_growth_percentage ?? rawKpis.revenue?.growth_month_percent ?? 0,
    today_orders_count:
      rawKpis.today_orders_count ?? rawKpis.orders?.today ?? 0,
    today_completed_count:
      rawKpis.today_completed_count ?? rawKpis.orders?.completed ?? 0,
    completion_rate:
      rawKpis.completion_rate ?? rawKpis.orders?.completion_rate_percent ?? 100,
    total_customers:
      rawKpis.total_customers ?? rawKpis.customers?.total_customers ?? 0,
    new_customers_this_month:
      rawKpis.new_customers_this_month ?? rawKpis.customers?.new_this_month ?? 0,
    total_products:
      rawKpis.total_products ?? rawKpis.inventory?.total_products ?? 0,
    low_stock_count:
      rawKpis.low_stock_count ?? rawKpis.inventory?.low_stock_count ?? 0,
    out_of_stock_count:
      rawKpis.out_of_stock_count ?? rawKpis.inventory?.out_of_stock_count ?? 0,
  };

  // Hỗ trợ cả 2 định dạng dữ liệu (flat hoặc nested trong charts)
  const rawRevenueTrend =
    dashboardData?.revenue_trend || dashboardData?.charts?.revenue_trend?.data || [];
  const revenueTrend = (Array.isArray(rawRevenueTrend) ? rawRevenueTrend : []).map((item) => ({
    ...item,
    date: item.date || item.label || (item.month ? `Thg ${item.month}` : ''),
    revenue: item.revenue ?? item.total_revenue ?? 0,
    orders: item.orders ?? item.order_count ?? 0,
  }));

  const rawCategorySales =
    dashboardData?.category_sales || dashboardData?.charts?.category_sales || [];
  const categorySales = (Array.isArray(rawCategorySales) ? rawCategorySales : []).map((item) => ({
    ...item,
    revenue: item.revenue ?? item.total_revenue ?? 0,
    revenue_display:
      item.revenue_display ||
      item.total_revenue_display ||
      (item.revenue || item.total_revenue
        ? `${new Intl.NumberFormat('vi-VN').format(item.revenue || item.total_revenue)}₫`
        : '0₫'),
  }));

  const rawPaymentMethods =
    dashboardData?.payment_methods || dashboardData?.charts?.payment_methods || [];
  const paymentMethods = (Array.isArray(rawPaymentMethods) ? rawPaymentMethods : []).map((item) => ({
    ...item,
    revenue: item.revenue ?? item.total_amount ?? 0,
    revenue_display:
      item.revenue_display ||
      item.total_amount_display ||
      (item.total_amount
        ? `${new Intl.NumberFormat('vi-VN').format(item.total_amount)}₫`
        : '0₫'),
  }));

  const pendingOrders =
    dashboardData?.actionable?.pending_orders || dashboardData?.pending_orders || [];

  const rawLowStock =
    dashboardData?.actionable?.low_stock_alerts || dashboardData?.low_stock_alerts || [];
  const lowStockAlerts = (Array.isArray(rawLowStock) ? rawLowStock : []).map((item) => ({
    ...item,
    id: item.id || item.variant_id,
    variant_name:
      item.variant_name || [item.color, item.material].filter(Boolean).join(' • '),
  }));

  // Custom Tooltip cho biểu đồ doanh thu
  const CustomRevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rev = payload.find((p) => p.dataKey === 'revenue')?.value || 0;
      const ord = payload.find((p) => p.dataKey === 'orders')?.value || 0;
      return (
        <div className="bg-[#1F1B18] text-white p-3 rounded-xl shadow-xl border border-stone-700/60 text-xs space-y-1">
          <p className="font-semibold text-[#C9A982] pb-1 border-b border-stone-800">
            Thời điểm: {label}
          </p>
          <div className="flex items-center justify-between space-x-4 pt-1">
            <span className="text-stone-400">Doanh thu:</span>
            <span className="font-mono font-bold text-emerald-400">
              {new Intl.NumberFormat('vi-VN').format(rev)}₫
            </span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-stone-400">Số đơn hàng:</span>
            <span className="font-bold text-amber-300">{ord} đơn</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho biểu đồ tròn
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1F1B18] text-white p-2.5 rounded-xl shadow-xl border border-stone-700/60 text-xs space-y-0.5">
          <p className="font-semibold text-[#C9A982]">{data.name || data.label}</p>
          <p className="text-stone-300 font-mono">
            {data.revenue_display || (data.revenue ? `${new Intl.NumberFormat('vi-VN').format(data.revenue)}₫` : '')}
          </p>
          <p className="text-stone-400 text-[11px]">
            Tỷ trọng: <strong className="text-white">{data.percentage}%</strong>
            {data.count !== undefined && ` (${data.count} đơn)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7">
      {/* 1. Header Toolbar & Bộ lọc chu kỳ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold block">
            TK HOUSE ATELIER • QUẢN TRỊ KINH DOANH
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5">
            Báo Cáo & Thống Kê Tổng Quan
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Số liệu thời gian thực về dòng tiền, đơn hàng, khách hàng và biến động tồn kho
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* Bộ lọc chu kỳ */}
          <div className="bg-white p-1 rounded-2xl border border-[#D5CDC2] shadow-2xs flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setPeriod('7_days')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                period === '7_days'
                  ? 'bg-[#2C241E] text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30_days')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                period === '30_days'
                  ? 'bg-[#2C241E] text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setPeriod('12_months')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                period === '12_months'
                  ? 'bg-[#2C241E] text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              12 tháng
            </button>
          </div>

          {/* Nút làm mới */}
          <button
            type="button"
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            className="p-2.5 bg-white border border-[#D5CDC2] hover:bg-neutral-50 text-neutral-700 rounded-2xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#8C6A48]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lỗi nạp dữ liệu */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchOverview()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors text-[11px]"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 2. 4 THẺ KPI CHỦ LỰC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Doanh thu tháng này */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8C6A48] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Doanh thu tháng này
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#8C6A48] flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {kpis.current_month_revenue_display}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs">
              {kpis.revenue_growth_percentage >= 0 ? (
                <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  +{kpis.revenue_growth_percentage}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                  <TrendingDown className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  {kpis.revenue_growth_percentage}%
                </span>
              )}
              <span className="text-neutral-400 font-light text-[11px]">so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Đơn hàng hôm nay */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8C6A48] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Đơn hàng hôm nay
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {kpis.today_orders_count} <span className="text-sm font-normal text-neutral-400">đơn</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs text-neutral-500">
              <span className="inline-flex items-center text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {kpis.completion_rate}% hoàn thành
              </span>
              <span className="text-neutral-400 font-light text-[11px]">
                ({kpis.today_completed_count} đơn xong)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Khách hàng */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8C6A48] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Cộng đồng khách hàng
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {kpis.total_customers} <span className="text-sm font-normal text-neutral-400">thành viên</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-neutral-500">
              <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                +{kpis.new_customers_this_month} mới
              </span>
              <span className="text-neutral-400 font-light text-[11px]">gia nhập trong tháng</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Cảnh báo Kho */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8C6A48] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Cảnh báo kho nội thất
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              kpis.out_of_stock_count > 0 || kpis.low_stock_count > 0
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-stone-50 border border-stone-200 text-stone-600'
            }`}>
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {kpis.total_products} <span className="text-sm font-normal text-neutral-400">kiệt tác</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="inline-flex items-center text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                {kpis.low_stock_count} sắp hết
              </span>
              <span className="inline-flex items-center text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                {kpis.out_of_stock_count} hết hàng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BIỂU ĐỒ DOANH THU & ĐƠN HÀNG (REVENUE TREND) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                Xu Hướng Doanh Thu & Lưu Lượng Đơn Hàng
              </h2>
              <p className="text-[11px] text-neutral-400 font-light">
                Chuỗi dữ liệu thời gian tương ứng với bộ lọc {period === '7_days' ? '7 ngày qua' : period === '30_days' ? '30 ngày qua' : '12 tháng gần nhất'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-[#8C6A48]" />
              <span className="text-neutral-600 font-medium">Doanh thu (VNĐ)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-[#2C241E]" />
              <span className="text-neutral-600 font-medium">Số đơn hàng</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ Recharts */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C6A48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8C6A48" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE1" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E8E2D8' }}
                  tick={{ fontSize: 11, fill: '#78716C' }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}Tr` : `${val}`)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#8C6A48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Số đơn hàng"
                  fill="#2C241E"
                  barSize={14}
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              Chưa có dữ liệu giao dịch trong chu kỳ này
            </div>
          )}
        </div>
      </div>

      {/* 4. CẶP BIỂU ĐỒ TRÒN (DONUT / PIE CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        {/* Donut 1: Cơ cấu doanh thu theo danh mục */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#F0ECE1]">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Doanh Thu Theo Danh Mục
              </h3>
              <p className="text-[11px] text-neutral-400 font-light">
                Tỷ trọng đóng góp dòng tiền từ các dòng sản phẩm chính
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 pt-1">
            <div className="sm:col-span-7 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={categorySales}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell
                        key={`cat-cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-5 space-y-2 text-xs">
              {categorySales.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-neutral-700 truncate" title={cat.name}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 ml-2">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut 2: Phương thức thanh toán */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#F0ECE1]">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-900">
                Phương Thức Thanh Toán
              </h3>
              <p className="text-[11px] text-neutral-400 font-light">
                Phân bổ giao dịch qua COD, Chuyển khoản VietQR, VNPAY và MoMo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 pt-1">
            <div className="sm:col-span-7 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={paymentMethods}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell
                        key={`pay-cell-${index}`}
                        fill={PAYMENT_COLORS[entry.method] || FALLBACK_PAYMENT_COLORS[index % 4]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-5 space-y-2 text-xs">
              {paymentMethods.map((pm, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          PAYMENT_COLORS[pm.method] || FALLBACK_PAYMENT_COLORS[idx % 4],
                      }}
                    />
                    <span className="text-neutral-700 truncate" title={pm.label}>
                      {pm.label}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 ml-2">
                    {pm.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. KHU VỰC TÁC VỤ NHANH (ACTIONABLE AREA - 2 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
        {/* Cột trái (7 Cột): 5 Đơn hàng cần duyệt gấp */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-900">
                  Đơn Hàng Chờ Xử Lý Gấp ({pendingOrders.length})
                </h3>
                <p className="text-[11px] text-neutral-400 font-light">
                  Các đơn hàng mới cần gọi điện xác nhận bản vẽ & địa chỉ giao lắp
                </p>
              </div>
            </div>

            <Link
              to="/admin/orders"
              className="text-xs text-[#8C6A48] hover:underline font-semibold flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#8C6A48] transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-neutral-900 text-[#8C6A48]">
                        {ord.order_code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                        Chờ xác nhận
                      </span>
                    </div>
                    <p className="text-neutral-700 font-medium truncate">
                      {ord.recipient_name} • {ord.recipient_phone}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-light">
                      {ord.items_count} món • Đặt lúc {ord.created_at_display}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1.5">
                    <div className="font-mono font-bold text-sm text-neutral-900">
                      {ord.total_amount_display}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${ord.id}`)}
                      className="px-3 py-1 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-[11px] font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Xử lý ngay</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-neutral-700">Tất cả đơn hàng đã được duyệt!</p>
                <p className="text-[11px] mt-0.5 font-light">Hiện không có đơn hàng nào tồn đọng ở trạng thái chờ duyệt.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải (5 Cột): Cảnh báo sắp hết hàng */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-900">
                  Cảnh Báo Hết Hàng Trong Kho
                </h3>
                <p className="text-[11px] text-neutral-400 font-light">
                  Các biến thể có tồn kho ≤ 5 chiếc cần liên hệ xưởng mộc bổ sung
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center space-x-3 text-xs"
                >
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D8] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 truncate" title={item.product_name}>
                      {item.product_name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      SKU: <span className="font-mono">{item.sku}</span> {item.variant_name && `• ${item.variant_name}`}
                    </p>
                    <p className="font-mono text-[11px] text-[#8C6A48] mt-0.5">
                      {item.price_display}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {item.is_out_of_stock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        Hết hàng (0)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Còn {item.stock_quantity} cái
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-neutral-700">Tồn kho đang rất dồi dào!</p>
                <p className="text-[11px] mt-0.5 font-light">Không có sản phẩm nào chạm ngưỡng cảnh báo tồn kho tối thiểu.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
