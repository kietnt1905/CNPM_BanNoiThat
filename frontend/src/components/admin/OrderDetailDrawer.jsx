import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  FileText,
  AlertCircle,
  Save,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Building,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import adminOrderApi from '../../api/adminOrderApi';

// Nhãn và màu sắc chuẩn hóa
export const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: CheckCircle,
  },
  shipping: {
    label: 'Đang giao hàng',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: Truck,
  },
  completed: {
    label: 'Đã hoàn thành',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
};

export const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Chờ thanh toán',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  success: {
    label: 'Đã thanh toán',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  failed: {
    label: 'Thanh toán thất bại',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
};

export const PAYMENT_METHOD_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  vnpay: 'Ví VNPAY / Thẻ ATM-QR',
  momo: 'Ví điện tử MoMo',
};

/**
 * Drawer / Modal Chi tiết Đơn hàng
 */
export default function OrderDetailDrawer({
  isOpen,
  orderId,
  initialOrder = null,
  onClose,
  onOrderUpdated,
  onRequestCancelConfirm,
  showToast,
}) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form cập nhật trạng thái đơn hàng
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Form cập nhật trạng thái thanh toán
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  // Tải chi tiết đơn hàng khi mở drawer
  useEffect(() => {
    if (!isOpen || !orderId) return;

    if (initialOrder && initialOrder.id === orderId && initialOrder.items) {
      setOrder(initialOrder);
      setSelectedStatus(initialOrder.status);
      setSelectedPaymentStatus(initialOrder.payment?.status || 'pending');
      setTransactionCode(initialOrder.payment?.transaction_code || '');
      setAdminNote('');
    } else {
      fetchOrderDetail(orderId);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async (id) => {
    setLoading(true);
    try {
      const res = await adminOrderApi.getOrderDetail(id);
      if (res.data?.status) {
        const orderData = res.data.data;
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        setSelectedPaymentStatus(orderData.payment?.status || 'pending');
        setTransactionCode(orderData.payment?.transaction_code || '');
        setAdminNote('');
      } else {
        showToast?.('Không thể lấy chi tiết đơn hàng', 'error');
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy mã đơn hàng
  const handleCopyCode = () => {
    if (!order?.order_code) return;
    navigator.clipboard.writeText(order.order_code);
    setCopiedCode(true);
    showToast?.('Đã sao chép mã đơn hàng vào clipboard', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (e) => {
    e?.preventDefault();
    if (!order) return;

    if (selectedStatus === order.status) {
      showToast?.('Đơn hàng hiện đã ở trạng thái này', 'info');
      return;
    }

    // Nếu chọn hủy đơn -> bật modal xác nhận hoàn kho
    if (selectedStatus === 'cancelled') {
      onRequestCancelConfirm?.(order, async (note) => {
        await executeStatusUpdate('cancelled', note);
      });
      return;
    }

    await executeStatusUpdate(selectedStatus, adminNote);
  };

  const executeStatusUpdate = async (status, note) => {
    setIsUpdatingStatus(true);
    try {
      const res = await adminOrderApi.updateStatus(order.id, {
        status,
        admin_note: note,
      });

      if (res.data?.status) {
        showToast?.(res.data.message || 'Cập nhật trạng thái thành công', 'success');
        setOrder(res.data.data);
        setSelectedStatus(res.data.data.status);
        setAdminNote('');
        onOrderUpdated?.(res.data.data);
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Cập nhật trạng thái thanh toán
  const handleUpdatePayment = async (e) => {
    e?.preventDefault();
    if (!order) return;

    setIsUpdatingPayment(true);
    try {
      const res = await adminOrderApi.updatePaymentStatus(order.id, {
        payment_status: selectedPaymentStatus,
        transaction_code: transactionCode,
      });

      if (res.data?.status) {
        showToast?.(res.data.message || 'Cập nhật thanh toán thành công', 'success');
        setOrder(res.data.data);
        onOrderUpdated?.(res.data.data);
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Lỗi khi cập nhật thanh toán', 'error');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Xử lý In đơn hàng (window.print())
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentStatusConfig = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
  const currentPaymentConfig = PAYMENT_STATUS_CONFIG[order?.payment?.status] || PAYMENT_STATUS_CONFIG.pending;
  const StatusIcon = currentStatusConfig.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/50 backdrop-blur-[2px] transition-opacity"
        />

        {/* Slide-in Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white shadow-2xl h-full flex flex-col z-10 overflow-hidden border-l border-stone-200"
        >
          {/* Top Header Drawer */}
          <div className="px-6 py-4 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-[#8C6A48]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif font-bold text-lg text-neutral-900 tracking-tight">
                    {order?.order_code || 'Chi Tiết Đơn Hàng'}
                  </h2>
                  {order?.order_code && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      title="Sao chép mã đơn"
                      className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded hover:bg-stone-200/50"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-light flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đặt lúc: {order?.created_at_display || order?.created_at}</span>
                </p>
              </div>
            </div>

            {/* Actions: Print & Close */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                title="In phiếu giao hàng"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span className="hidden sm:inline">In Đơn</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#8C6A48]" />
                <p className="text-xs uppercase tracking-wider font-medium">Đang tải thông tin đơn hàng...</p>
              </div>
            ) : !order ? (
              <div className="py-16 text-center text-stone-500 text-sm">
                Không tìm thấy thông tin đơn hàng.
              </div>
            ) : (
              <>
                {/* 1. Status Overview Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Trạng thái đơn hàng hiện tại */}
                  <div className={`p-4 rounded-2xl border ${currentStatusConfig.border} ${currentStatusConfig.bg} flex items-center space-x-3.5`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center ${currentStatusConfig.text} flex-shrink-0`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
                        Trạng thái đơn hàng
                      </span>
                      <span className={`text-sm font-bold ${currentStatusConfig.text}`}>
                        {order.status_label || currentStatusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Trạng thái thanh toán hiện tại */}
                  <div className={`p-4 rounded-2xl border ${currentPaymentConfig.border} ${currentPaymentConfig.bg} flex items-center space-x-3.5`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center ${currentPaymentConfig.text} flex-shrink-0`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
                        Thanh toán ({order.payment?.method_label || PAYMENT_METHOD_LABELS[order.payment?.method] || 'COD'})
                      </span>
                      <span className={`text-sm font-bold ${currentPaymentConfig.text}`}>
                        {order.payment?.status_label || currentPaymentConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Customer & Delivery Info */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <h3 className="font-serif font-semibold text-sm text-neutral-900 flex items-center space-x-2">
                      <User className="w-4 h-4 text-[#8C6A48]" />
                      <span>Thông Tin Khách Hàng & Giao Nhận</span>
                    </h3>
                    {order.user && (
                      <span className="text-[11px] bg-white border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
                        Tài khoản: {order.user.email}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Họ tên người nhận:</span>
                        <span className="font-semibold text-stone-900 text-sm">{order.recipient_name}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">Số điện thoại liên hệ:</span>
                        <a
                          href={`tel:${order.recipient_phone}`}
                          className="font-medium text-[#8C6A48] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.recipient_phone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Địa chỉ giao hàng:</span>
                        <div className="font-medium text-stone-900 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                          <span>{order.shipping_address}</span>
                        </div>
                      </div>

                      {order.note && (
                        <div>
                          <span className="text-stone-400 block text-[11px]">Ghi chú đơn hàng:</span>
                          <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-stone-700 italic">
                            "{order.note}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Ordered Products Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-semibold text-sm text-neutral-900 flex items-center space-x-2">
                      <Package className="w-4 h-4 text-[#8C6A48]" />
                      <span>Danh Sách Sản Phẩm Trong Đơn ({order.total_items} món)</span>
                    </h3>
                  </div>

                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                          <tr>
                            <th className="py-3 px-4">Sản phẩm</th>
                            <th className="py-3 px-3">Phân loại</th>
                            <th className="py-3 px-3 text-center">Tồn kho hiện tại</th>
                            <th className="py-3 px-3 text-right">Đơn giá</th>
                            <th className="py-3 px-3 text-center">SL</th>
                            <th className="py-3 px-4 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {order.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                              {/* Cột sản phẩm: Ảnh + Tên */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 shadow-2xs">
                                    <img
                                      src={item.image || '/images/placeholder.jpg'}
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80';
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium text-stone-900 line-clamp-1">{item.product_name}</div>
                                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">SKU: {item.sku || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Phân loại: Màu, Kích thước, Chất liệu */}
                              <td className="py-3.5 px-3">
                                <div className="space-y-0.5 text-stone-600">
                                  {item.color && (
                                    <div className="text-[11px]">
                                      <span className="text-stone-400">Màu:</span> {item.color}
                                    </div>
                                  )}
                                  {item.dimensions && (
                                    <div className="text-[11px]">
                                      <span className="text-stone-400">KT:</span> {item.dimensions}
                                    </div>
                                  )}
                                  {item.material && (
                                    <div className="text-[11px]">
                                      <span className="text-stone-400">Chất liệu:</span> {item.material}
                                    </div>
                                  )}
                                  {!item.color && !item.dimensions && !item.material && (
                                    <span className="text-stone-400 italic">Mặc định</span>
                                  )}
                                </div>
                              </td>

                              {/* Tồn kho hiện tại */}
                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    item.current_stock > 5
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : item.current_stock > 0
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {item.current_stock ?? 0} có sẵn
                                </span>
                              </td>

                              {/* Đơn giá */}
                              <td className="py-3.5 px-3 text-right font-medium text-stone-700">
                                {item.unit_price_display || `${item.unit_price?.toLocaleString('vi-VN')}₫`}
                              </td>

                              {/* Số lượng */}
                              <td className="py-3.5 px-3 text-center font-bold text-stone-900">
                                x{item.quantity}
                              </td>

                              {/* Thành tiền */}
                              <td className="py-3.5 px-4 text-right font-bold text-[#8C6A48]">
                                {item.line_total_display || `${item.line_total?.toLocaleString('vi-VN')}₫`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Tóm tắt thanh toán */}
                    <div className="bg-[#FAF8F5] p-4 border-t border-stone-200 flex flex-col items-end space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between w-64">
                        <span>Tạm tính hàng hóa:</span>
                        <span className="font-medium text-stone-900">
                          {order.subtotal_display || `${order.subtotal?.toLocaleString('vi-VN')}₫`}
                        </span>
                      </div>
                      <div className="flex justify-between w-64">
                        <span>Phí vận chuyển:</span>
                        <span className="font-medium text-stone-900">
                          {order.shipping_fee > 0 ? (order.shipping_fee_display || `${order.shipping_fee?.toLocaleString('vi-VN')}₫`) : 'Miễn phí'}
                        </span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between w-64 text-emerald-600 font-medium">
                          <span>Giảm giá khuyến mãi:</span>
                          <span>-{order.discount_amount_display || `${order.discount_amount?.toLocaleString('vi-VN')}₫`}</span>
                        </div>
                      )}
                      <div className="flex justify-between w-64 pt-2 border-t border-stone-300 font-bold text-sm text-[#2C241E]">
                        <span>Tổng thanh toán:</span>
                        <span className="text-[#8C6A48] text-base">
                          {order.total_amount_display || `${order.total_amount?.toLocaleString('vi-VN')}₫`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Admin Actions Controls (Quản Trị Đơn Hàng) */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-serif font-semibold text-sm text-neutral-900 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#8C6A48]" />
                    <span>Thao Tác Quản Trị Hệ Thống</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Block A: Đổi trạng thái đơn hàng */}
                    <form onSubmit={handleUpdateStatus} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                          Đổi Trạng Thái Đơn Hàng
                        </span>
                        <span className="text-[10px] text-stone-400">Tự động hoàn kho khi hủy</span>
                      </div>

                      <div>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all cursor-pointer font-medium"
                        >
                          <option value="pending">Chờ xác nhận (Pending)</option>
                          <option value="confirmed">Đã xác nhận (Confirmed)</option>
                          <option value="shipping">Đang giao hàng (Shipping)</option>
                          <option value="completed">Đã hoàn thành (Completed)</option>
                          <option value="cancelled">Hủy đơn hàng (Cancelled - Hoàn kho)</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Ghi chú admin (Mã vận đơn, lý do đổi...)"
                          className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:bg-white focus:border-[#8C6A48] outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingStatus || selectedStatus === order.status}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          selectedStatus === 'cancelled'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-[#2C241E] hover:bg-[#8C6A48] text-white'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {isUpdatingStatus ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Cập nhật trạng thái đơn</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Block B: Cập nhật trạng thái thanh toán */}
                    <form onSubmit={handleUpdatePayment} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                          Trạng Thái Thanh Toán
                        </span>
                        <span className="text-[10px] text-stone-400">Đối soát doanh thu</span>
                      </div>

                      <div>
                        <select
                          value={selectedPaymentStatus}
                          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                          className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all cursor-pointer font-medium"
                        >
                          <option value="pending">Chờ thanh toán (Pending)</option>
                          <option value="success">Đã thanh toán (Success)</option>
                          <option value="failed">Thanh toán thất bại (Failed)</option>
                          <option value="refunded">Đã hoàn tiền (Refunded)</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={transactionCode}
                          onChange={(e) => setTransactionCode(e.target.value)}
                          placeholder="Mã giao dịch ngân hàng / VNPAY / MoMo..."
                          className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:bg-white focus:border-[#8C6A48] outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingPayment}
                        className="w-full py-2 px-3 bg-stone-800 hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isUpdatingPayment ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Lưu thanh toán & Mã GD</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-3.5 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between flex-shrink-0 text-xs text-stone-500">
            <div>
              Mã hệ thống ID: <span className="font-mono font-medium text-stone-700">#{order?.id}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-200/80 hover:bg-stone-300 text-stone-700 rounded-xl transition-colors font-medium cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </motion.div>

        {/* Hidden Printable Invoice Section for window.print() */}
        {order && (
          <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 print:z-9999 text-black">
            <div className="border-b-2 border-stone-800 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold font-serif uppercase tracking-wider text-stone-900">
                  TK House Atelier
                </h1>
                <p className="text-xs text-stone-600">Nội thất cao cấp & Không gian sống thượng lưu</p>
                <p className="text-xs text-stone-600">Hotline: 1800 6868 | Website: tkhouse.vn</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold uppercase text-stone-800">PHIẾU XUẤT KHO & GIAO HÀNG</h2>
                <p className="text-xs font-mono font-bold mt-1">Mã đơn: {order.order_code}</p>
                <p className="text-xs text-stone-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6 p-4 bg-stone-50 rounded border border-stone-200">
              <div>
                <strong className="block uppercase text-stone-700 mb-1">Thông tin người nhận:</strong>
                <p className="font-semibold text-sm">{order.recipient_name}</p>
                <p>Số điện thoại: {order.recipient_phone}</p>
                <p>Địa chỉ nhận hàng: {order.shipping_address}</p>
              </div>
              <div>
                <strong className="block uppercase text-stone-700 mb-1">Chi tiết đơn hàng:</strong>
                <p>Ngày đặt: {order.created_at_display}</p>
                <p>Phương thức thanh toán: {order.payment?.method_label || 'COD'}</p>
                <p>Trạng thái thanh toán: {order.payment?.status_label || 'Chờ thanh toán'}</p>
                {order.note && <p className="italic">Ghi chú: {order.note}</p>}
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-stone-300 mb-6">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300">
                  <th className="p-2 border-r border-stone-300">STT</th>
                  <th className="p-2 border-r border-stone-300">Tên Sản Phẩm</th>
                  <th className="p-2 border-r border-stone-300">Phân Loại</th>
                  <th className="p-2 border-r border-stone-300 text-right">Đơn Giá</th>
                  <th className="p-2 border-r border-stone-300 text-center">SL</th>
                  <th className="p-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={item.id} className="border-b border-stone-200">
                    <td className="p-2 border-r border-stone-300 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-stone-300 font-medium">{item.product_name}</td>
                    <td className="p-2 border-r border-stone-300 text-stone-600">
                      {[item.color, item.dimensions, item.material].filter(Boolean).join(' - ') || 'Tiêu chuẩn'}
                    </td>
                    <td className="p-2 border-r border-stone-300 text-right">{item.unit_price_display}</td>
                    <td className="p-2 border-r border-stone-300 text-center font-bold">{item.quantity}</td>
                    <td className="p-2 text-right font-bold">{item.line_total_display}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end text-xs mb-10">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{order.subtotal_display}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>{order.shipping_fee > 0 ? order.shipping_fee_display : '0₫'}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Giảm giá:</span>
                    <span>-{order.discount_amount_display}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-800 pt-1.5 font-bold text-sm">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="text-base">{order.total_amount_display}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 text-center text-xs pt-8 border-t border-stone-200">
              <div>
                <p className="font-bold uppercase">Người Lập Phiếu</p>
                <p className="text-[10px] text-stone-400 mt-12">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold uppercase">Người Giao Hàng</p>
                <p className="text-[10px] text-stone-400 mt-12">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold uppercase">Khách Hàng Nhận</p>
                <p className="text-[10px] text-stone-400 mt-12">(Ký và xác nhận hàng nguyên vẹn)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
