import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  Calendar,
  CreditCard,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import adminOrderApi from '../../api/adminOrderApi';
import OrderDetailDrawer, {
  STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
} from '../../components/admin/OrderDetailDrawer';
import CancelOrderConfirmModal from '../../components/admin/CancelOrderConfirmModal';

export default function AdminOrdersPage() {
  // State danh sách đơn hàng và phân trang
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    shipping_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
    total_revenue_display: '0₫',
  });
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'shipping', 'completed', 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [perPage, setPerPage] = useState(15);

  // Route param (nếu truy cập /admin/orders/:id)
  const { id: routeOrderId } = useParams();
  const navigate = useNavigate();

  // Drawer chi tiết đơn hàng
  const [selectedOrderId, setSelectedOrderId] = useState(routeOrderId || null);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(routeOrderId));

  useEffect(() => {
    if (routeOrderId) {
      setSelectedOrderId(routeOrderId);
      setIsDrawerOpen(true);
    }
  }, [routeOrderId]);

  // Modal xác nhận hủy đơn
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelCallbackRef = useRef(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Debounce search 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Tải danh sách đơn hàng
  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        sort: sortOrder,
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (paymentMethod !== 'all') {
        params.payment_method = paymentMethod;
      }
      if (paymentStatus !== 'all') {
        params.payment_status = paymentStatus;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }

      const res = await adminOrderApi.getOrders(params);
      if (res.data?.status) {
        setOrders(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.statistics) {
          setStatistics(res.data.statistics);
        }
      } else {
        showToast(res.data?.message || 'Không thể tải danh sách đơn hàng', 'error');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      showToast(err.response?.data?.message || 'Lỗi kết nối khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, paymentMethod, paymentStatus, dateFrom, dateTo, sortOrder, perPage]);

  // Trigger fetch khi thay đổi bất kỳ filter nào
  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Đặt lại bộ lọc
  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchTerm('');
    setDebouncedSearch('');
    setPaymentMethod('all');
    setPaymentStatus('all');
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setPerPage(15);
    showToast('Đã đặt lại toàn bộ bộ lọc về mặc định', 'info');
  };

  // Mở Drawer chi tiết
  const handleOpenDetail = (order) => {
    setSelectedOrderId(order.id);
    setSelectedOrderData(order);
    setIsDrawerOpen(true);
  };

  // Quick Change Status từ dropdown trên từng hàng
  const handleQuickStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return;

    if (newStatus === 'cancelled') {
      // Mở modal xác nhận hủy đơn
      setCancelModalOrder(order);
      setIsCancelModalOpen(true);
      cancelCallbackRef.current = async (note) => {
        try {
          setIsCancelling(true);
          const res = await adminOrderApi.updateStatus(order.id, {
            status: 'cancelled',
            admin_note: note,
          });
          if (res.data?.status) {
            showToast('Hủy đơn hàng và hoàn kho thành công!', 'success');
            setIsCancelModalOpen(false);
            fetchOrders(pagination.current_page);
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi hủy đơn hàng', 'error');
        } finally {
          setIsCancelling(false);
        }
      };
      return;
    }

    try {
      const res = await adminOrderApi.updateStatus(order.id, { status: newStatus });
      if (res.data?.status) {
        showToast(`Đã chuyển trạng thái đơn #${order.order_code} sang "${STATUS_CONFIG[newStatus]?.label || newStatus}"`, 'success');
        // Cập nhật ngay trong list local để UI phản hồi tức thì
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus, status_label: STATUS_CONFIG[newStatus]?.label } : o))
        );
        // Refresh thống kê
        fetchOrders(pagination.current_page);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn', 'error');
    }
  };

  // Copy mã đơn
  const handleCopyCode = (e, code, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast(`Đã chép mã đơn ${code}`, 'success');
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Callback khi đơn hàng được cập nhật từ trong Drawer
  const handleOrderUpdatedInDrawer = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
    );
    fetchOrders(pagination.current_page);
  };

  // Mở modal xác nhận hủy từ trong Drawer
  const handleRequestCancelFromDrawer = (order, callback) => {
    setCancelModalOrder(order);
    setIsCancelModalOpen(true);
    cancelCallbackRef.current = async (note) => {
      try {
        setIsCancelling(true);
        await callback(note);
        setIsCancelModalOpen(false);
        fetchOrders(pagination.current_page);
      } finally {
        setIsCancelling(false);
      }
    };
  };

  // Cấu hình các Tabs trạng thái
  const TABS = [
    { key: 'all', label: 'Tất cả đơn', count: statistics.total_orders },
    { key: 'pending', label: 'Chờ xác nhận', count: statistics.pending_orders, badgeColor: 'bg-amber-100 text-amber-800' },
    { key: 'confirmed', label: 'Đã xác nhận', count: statistics.confirmed_orders, badgeColor: 'bg-blue-100 text-blue-800' },
    { key: 'shipping', label: 'Đang giao hàng', count: statistics.shipping_orders, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { key: 'completed', label: 'Đã hoàn thành', count: statistics.completed_orders, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { key: 'cancelled', label: 'Đã hủy', count: statistics.cancelled_orders, badgeColor: 'bg-rose-100 text-rose-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-stone-900/90 text-white border-stone-700'
                : 'bg-[#2C241E] text-white border-stone-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header & Quick Stat Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 tracking-tight">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Theo dõi tiến trình đặt hàng, điều phối vận chuyển và đối soát doanh thu TK House Atelier.
          </p>
        </div>

        {/* Nút Làm mới & Xuất dữ liệu */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => fetchOrders(pagination.current_page)}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8C6A48]' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Thẻ Thống kê nhanh (KPI Summary Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng doanh thu hoàn thành */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8C6A48] flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">
              Doanh thu thực nhận
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-neutral-900 leading-tight">
              {statistics.total_revenue_display || '0₫'}
            </span>
          </div>
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">
              Tổng số đơn hàng
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-neutral-900 leading-tight">
              {statistics.total_orders.toLocaleString('vi-VN')} đơn
            </span>
          </div>
        </div>

        {/* Chờ xác nhận (Cần xử lý) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center space-x-3.5 relative overflow-hidden">
          {statistics.pending_orders > 0 && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-amber-800 font-medium uppercase tracking-wider block">
              Cần xác nhận ngay
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-amber-900 leading-tight">
              {statistics.pending_orders.toLocaleString('vi-VN')} đơn
            </span>
          </div>
        </div>

        {/* Đang giao hàng */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">
              Đang vận chuyển
            </span>
            <span className="text-base sm:text-lg font-serif font-bold text-indigo-900 leading-tight">
              {statistics.shipping_orders.toLocaleString('vi-VN')} đơn
            </span>
          </div>
        </div>
      </div>

      {/* 2. Thanh Tabs Trạng Thái Đơn Hàng */}
      <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#2C241E] text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeColor || 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {tab.count ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Bộ Lọc & Tìm Kiếm (Filter Toolbar) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Ô tìm kiếm thông minh */}
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn (ORD-..., TK-...), tên khách, SĐT..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] rounded-xl outline-none transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Lọc phương thức thanh toán */}
          <div className="lg:col-span-2">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#8C6A48] rounded-xl outline-none transition-all cursor-pointer text-stone-700"
            >
              <option value="all">Phương thức: Tất cả</option>
              <option value="cod">COD (Khi nhận hàng)</option>
              <option value="bank_transfer">Chuyển khoản NH</option>
              <option value="vnpay">Ví VNPAY / QR</option>
              <option value="momo">Ví MoMo</option>
            </select>
          </div>

          {/* Lọc trạng thái thanh toán */}
          <div className="lg:col-span-2">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#8C6A48] rounded-xl outline-none transition-all cursor-pointer text-stone-700"
            >
              <option value="all">Thanh toán: Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="success">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
          </div>

          {/* Lọc theo ngày bắt đầu */}
          <div className="lg:col-span-2 relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Từ ngày"
              className="w-full text-xs py-2.5 px-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#8C6A48] rounded-xl outline-none transition-all text-stone-700"
            />
          </div>

          {/* Lọc theo ngày kết thúc */}
          <div className="lg:col-span-2 relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Đến ngày"
              className="w-full text-xs py-2.5 px-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#8C6A48] rounded-xl outline-none transition-all text-stone-700"
            />
          </div>
        </div>

        {/* Thanh phụ: Sắp xếp & Nút Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-2 text-stone-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2.5 text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="total_desc">Giá trị cao nhất</option>
              <option value="total_asc">Giá trị thấp nhất</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bảng Danh Sách Đơn Hàng (Orders Table) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn Hàng</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-3 text-center">Số Món</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4">Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái Đơn</th>
                <th className="py-3.5 px-4">Ngày Đặt</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#8C6A48]" />
                      <p className="text-xs uppercase tracking-wider font-medium">Đang tải danh sách đơn hàng...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="w-10 h-10 text-stone-300" />
                      <p className="text-sm font-medium text-stone-600">Không tìm thấy đơn hàng nào</p>
                      <p className="text-xs text-stone-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const paymentConf = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOpenDetail(order)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Mã đơn */}
                      <td className="py-4 px-4 font-mono font-bold text-neutral-900 group-hover:text-[#8C6A48] transition-colors whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{order.order_code}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(e, order.order_code, order.id)}
                            title="Sao chép mã"
                            className="text-stone-300 group-hover:text-stone-500 hover:text-stone-800 transition-colors p-1 rounded"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-stone-900 text-xs">
                            {order.recipient_name}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {order.recipient_phone}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate max-w-xs" title={order.shipping_address}>
                            {order.shipping_address}
                          </div>
                        </div>
                      </td>

                      {/* Số món */}
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[11px]">
                          {order.total_items} món
                        </span>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-4 px-4 text-right font-serif font-bold text-neutral-900 text-sm whitespace-nowrap">
                        {order.total_amount_display || `${order.total_amount?.toLocaleString('vi-VN')}₫`}
                      </td>

                      {/* Thanh toán */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${paymentConf.border} ${paymentConf.bg} ${paymentConf.text}`}
                          >
                            {order.payment_status_label || paymentConf.label}
                          </span>
                          <div className="text-[10px] text-stone-400">
                            {order.payment_method_label || PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method?.toUpperCase()}
                          </div>
                        </div>
                      </td>

                      {/* Badge trạng thái kèm Quick Status Select */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                            className={`text-[11px] font-bold py-1 pl-2.5 pr-6 rounded-full border cursor-pointer outline-none transition-all shadow-2xs appearance-none ${statusConf.bg} ${statusConf.text} ${statusConf.border} hover:opacity-90`}
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao hàng</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Hủy đơn (Hoàn kho)</option>
                          </select>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none`} />
                        </div>
                      </td>

                      {/* Ngày đặt */}
                      <td className="py-4 px-4 text-stone-500 whitespace-nowrap text-[11px]">
                        {order.created_at_display || order.created_at}
                      </td>

                      {/* Cột thao tác */}
                      <td className="py-4 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-[#8C6A48] hover:text-white text-stone-700 rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center space-x-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Phân Trang (Pagination) */}
        <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          {/* Hiển thị số lượng */}
          <div className="flex items-center space-x-2">
            <span>Hiển thị</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>trong tổng số <strong>{pagination.total}</strong> đơn hàng</span>
          </div>

          {/* Các nút bấm trang */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchOrders(pagination.current_page - 1)}
              className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Các trang hiển thị */}
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
              .filter((p) => {
                // Chỉ hiện trang hiện tại, lân cận và trang đầu/cuối
                return (
                  p === 1 ||
                  p === pagination.last_page ||
                  Math.abs(p - pagination.current_page) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                const showEllipsis = prevP && p - prevP > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-stone-400">...</span>}
                    <button
                      type="button"
                      onClick={() => fetchOrders(p)}
                      className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        pagination.current_page === p
                          ? 'bg-[#2C241E] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchOrders(pagination.current_page + 1)}
              className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Chi tiết Đơn hàng */}
      <OrderDetailDrawer
        isOpen={isDrawerOpen}
        orderId={selectedOrderId}
        initialOrder={selectedOrderData}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdatedInDrawer}
        onRequestCancelConfirm={handleRequestCancelFromDrawer}
        showToast={showToast}
      />

      {/* Modal Xác Nhận Hủy Đơn Hàng & Hoàn Kho */}
      <CancelOrderConfirmModal
        isOpen={isCancelModalOpen}
        order={cancelModalOrder}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={(note) => {
          if (cancelCallbackRef.current) {
            cancelCallbackRef.current(note);
          }
        }}
        isLoading={isCancelling}
      />
    </div>
  );
}
