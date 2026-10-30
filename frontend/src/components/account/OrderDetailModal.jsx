import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X,
  Package,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Copy,
  Check,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const STATUS_BADGES = {
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
    icon: CheckCircle2,
  },
  shipping: {
    label: 'Đang giao hàng',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
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

export default function OrderDetailModal({
  isOpen,
  order,
  onClose,
  onOpenCancel,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const statusConfig = STATUS_BADGES[order.status] || {
    label: order.status_label || order.status,
    bg: 'bg-stone-50',
    text: 'text-stone-800',
    border: 'border-stone-200',
    dot: 'bg-stone-400',
    icon: Clock,
  };
  const StatusIcon = statusConfig.icon;

  const handleCopyCode = () => {
    if (order.order_code) {
      navigator.clipboard.writeText(order.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'completed', label: 'Hoàn thành' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipping':
        return 2;
      case 'completed':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.status);

  // Tính toán các giá trị giảm giá
  const voucherDiscount = Number(order.voucher_discount || order.discount_amount || 0);
  const vipDiscount = Number(order.member_discount || order.vip_discount || 0);
  const shippingFee = Number(order.shipping_fee || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop sang trọng */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1A1613]/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window Luxury */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#EAE4DC] overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]"
        >
          {/* 1. HEADER CỦA MODAL (SANG TRỌNG & TỰ NHIÊN) */}
          <div className="px-6 sm:px-8 py-5 border-b border-[#EAE4DC] bg-[#FAF8F5] flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2C241E]">
                  Chi Tiết Đơn Hàng
                </h3>
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} shadow-2xs`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{order.status_label || statusConfig.label}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-stone-500 mt-1 font-light">
                <span>Mã đơn:</span>
                <span className="font-mono font-bold text-stone-900 tracking-wide">
                  {order.order_code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center space-x-1 text-[#8C6A48] hover:text-[#725436] transition-colors p-1"
                  title="Sao chép mã đơn"
                >
                  {copied ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Đã chép
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span>•</span>
                <span className="flex items-center space-x-1 text-stone-500">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>{order.created_at_display}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-[#EAE4DC] text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar bg-white">
            {/* 2. THANH TIẾN ĐỘ ĐƠN HÀNG (MINIMALIST LUXURY STEPPER) */}
            {order.status !== 'cancelled' ? (
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#ECE5DA] p-5 sm:p-6 shadow-xs">
                <div className="relative flex items-center justify-between">
                  {/* Đường line tiến trình thanh thoát */}
                  <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-[#E8E2D8] -z-0">
                    <div
                      className="h-full bg-[#8C6A48] transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%`,
                      }}
                    />
                  </div>

                  {steps.map((st, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={st.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shadow-xs ${
                            isDone
                              ? 'bg-[#8C6A48] text-white ring-4 ring-[#FAF8F5]'
                              : 'bg-white text-stone-400 border border-[#E0D8CD]'
                          } ${isCurrent ? 'ring-[#EAE2D5]' : ''}`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          ) : (
                            <span className="text-[11px] font-mono">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                            isCurrent
                              ? 'text-[#8C6A48] font-bold'
                              : isDone
                              ? 'text-stone-800'
                              : 'text-stone-400'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-center space-x-3.5 text-xs text-rose-800 shadow-xs">
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <strong className="block text-rose-950 font-semibold mb-0.5">
                    Đơn hàng đã được hủy
                  </strong>
                  Số lượng sản phẩm trong đơn đã được tự động hoàn lại kho. Mọi thắc mắc Quý khách vui lòng liên hệ hotline 1800 7200 để được hỗ trợ chu đáo.
                </div>
              </div>
            )}

            {/* 3. THÔNG TIN GIAO HÀNG & THANH TOÁN (CARD DUAL TỰ NHIÊN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột 1: Thông tin giao nhận */}
              <div className="p-5 rounded-2xl border border-[#ECE5DA] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-colors space-y-3">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-[#8C6A48] uppercase tracking-[0.15em] pb-2 border-b border-[#EAE3D9]">
                  <MapPin className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>Địa chỉ giao nhận</span>
                </div>
                <div className="text-xs space-y-1.5 text-stone-700">
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    {order.recipient_name}
                  </p>
                  <p className="flex items-center space-x-1.5 text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{order.recipient_phone}</span>
                  </p>
                  <p className="text-stone-600 leading-relaxed pt-0.5">
                    {order.shipping_address}
                  </p>
                  {order.note && (
                    <div className="pt-2 text-stone-500 italic flex items-start space-x-1.5 border-t border-[#EAE3D9]/60">
                      <FileText className="w-3.5 h-3.5 mt-0.5 text-stone-400 flex-shrink-0" />
                      <span>Ghi chú: {order.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột 2: Thông tin thanh toán */}
              <div className="p-5 rounded-2xl border border-[#ECE5DA] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-colors space-y-3">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-[#8C6A48] uppercase tracking-[0.15em] pb-2 border-b border-[#EAE3D9]">
                  <CreditCard className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>Phương thức & Thanh toán</span>
                </div>
                <div className="text-xs space-y-2 text-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Hình thức:</span>
                    <span className="font-medium text-stone-900">
                      {order.payment?.method_label || order.payment?.method || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Trạng thái:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        order.payment?.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.payment?.status === 'failed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.payment?.status_label || (order.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán')}
                    </span>
                  </div>
                  {order.payment?.transaction_code && (
                    <div className="flex items-center justify-between text-stone-500 pt-1 border-t border-[#EAE3D9]/60">
                      <span>Mã giao dịch:</span>
                      <span className="font-mono text-stone-800 text-[11.5px]">{order.payment.transaction_code}</span>
                    </div>
                  )}
                  {order.payment?.paid_at && (
                    <div className="flex items-center justify-between text-stone-500">
                      <span>Thời gian:</span>
                      <span className="text-stone-800">{order.payment.paid_at}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. SẢN PHẨM TRONG ĐƠN (TINH TẾ & GỌN GÀNG) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-bold text-[#8C6A48] uppercase tracking-[0.15em] flex items-center space-x-2">
                  <Package className="w-4 h-4 text-[#8C6A48]" />
                  <span>Sản phẩm trong đơn ({order.items?.length || 0})</span>
                </h4>
              </div>

              <div className="divide-y divide-[#ECE5DA] border border-[#ECE5DA] rounded-2xl overflow-hidden bg-white shadow-xs">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center space-x-4 min-w-0">
                      <img
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.product_name}
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0 border border-[#ECE5DA] shadow-xs"
                      />
                      <div className="min-w-0 space-y-1.5">
                        {item.product_slug ? (
                          <Link
                            to={`/san-pham/${item.product_slug}`}
                            className="font-serif font-semibold text-sm sm:text-base text-stone-900 hover:text-[#8C6A48] transition-colors line-clamp-1 block"
                          >
                            {item.product_name}
                          </Link>
                        ) : (
                          <h5 className="font-serif font-semibold text-sm sm:text-base text-stone-900 line-clamp-1">
                            {item.product_name}
                          </h5>
                        )}

                        {/* Thuộc tính sản phẩm tinh gọn */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          {item.color && (
                            <span className="bg-[#FAF8F5] border border-[#ECE5DA] px-2.5 py-0.5 rounded-md text-stone-700">
                              {item.color}
                            </span>
                          )}
                          {item.material && (
                            <span className="bg-[#FAF8F5] border border-[#ECE5DA] px-2.5 py-0.5 rounded-md text-stone-700">
                              {item.material}
                            </span>
                          )}
                          {item.dimensions && (
                            <span className="bg-[#FAF8F5] border border-[#ECE5DA] px-2.5 py-0.5 rounded-md text-stone-700">
                              {item.dimensions}
                            </span>
                          )}
                          {item.sku && (
                            <span className="font-mono text-stone-400 text-[11px]">
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-600 sm:hidden pt-1">
                          {item.unit_price_display} × {item.quantity} ={' '}
                          <span className="font-bold text-[#8C6A48]">
                            {item.line_total_display}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right flex-shrink-0">
                      <div className="font-serif font-bold text-base text-stone-900">
                        {item.line_total_display}
                      </div>
                      <div className="text-xs text-stone-500 font-light mt-0.5">
                        {item.unit_price_display} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. KHỐI TỔNG KẾT THANH TOÁN (LUXURY BILL RECEIPT CARD) */}
            <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-6 space-y-3.5 shadow-xs">
              {/* Tạm tính tiền hàng */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Tạm tính tiền hàng</span>
                <span className="text-neutral-900 font-medium text-base">
                  {order.subtotal_display || (order.subtotal ? `${Number(order.subtotal).toLocaleString('vi-VN')}₫` : order.total_amount_display)}
                </span>
              </div>

              {/* Phí vận chuyển */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Phí vận chuyển</span>
                <div className="flex items-center space-x-2">
                  {shippingFee > 0 ? (
                    <span className="font-medium text-base text-neutral-800">
                      {order.shipping_fee_display || `${shippingFee.toLocaleString('vi-VN')}₫`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 font-medium text-emerald-700 text-sm bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                      <Check className="w-3.5 h-3.5" />
                      <span>Miễn phí giao hàng</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Voucher giảm giá (Chỉ hiển thị rõ khi có áp dụng) */}
              {voucherDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C6A48]" />
                    <span>Voucher giảm giá</span>
                  </span>
                  <span className="font-medium text-base text-emerald-600">
                    -{order.voucher_discount_display || `${voucherDiscount.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
              )}

              {/* Chiết khấu thành viên VIP */}
              {vipDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A48]" />
                    <span>Ưu đãi thành viên VIP</span>
                  </span>
                  <span className="font-medium text-base text-emerald-600">
                    -{order.member_discount_display || `${vipDiscount.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
              )}

              {/* Phần Tổng cộng (Dòng chốt hóa đơn) */}
              <div className="border-t border-[#E5DFD5] pt-4 mt-2 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-base tracking-wider text-neutral-900 uppercase block">
                    TỔNG CỘNG
                  </span>
                  <span className="text-[11px] text-stone-500 font-light block">
                    (Đã bao gồm VAT & dịch vụ giao lắp tận nhà)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#8C6A48] tracking-tight">
                    {order.total_amount_display || `${Number(order.total_amount).toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. FOOTER ACTIONS */}
          <div className="px-6 sm:px-8 py-4 border-t border-[#EAE4DC] bg-white flex items-center justify-between flex-shrink-0">
            <div>
              {order.can_cancel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCancel(order);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-7 py-2.5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
