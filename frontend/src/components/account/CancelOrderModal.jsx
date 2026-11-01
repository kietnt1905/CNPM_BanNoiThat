import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2, Info } from 'lucide-react';

const COMMON_REASONS = [
  'Tôi muốn thay đổi mẫu mã, kích thước hoặc màu sắc',
  'Tôi muốn cập nhật lại địa chỉ nhận hàng hoặc số điện thoại',
  'Tôi tìm thấy sản phẩm nội thất khác phù hợp hơn',
  'Tôi đặt trùng đơn hoặc đặt nhầm số lượng',
  'Tôi muốn hoãn lại kế hoạch mua sắm',
  'Lý do khác',
];

export default function CancelOrderModal({
  isOpen,
  order,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác') {
      if (!customReason.trim()) {
        setErrorMsg('Vui lòng nhập lý do hủy đơn hàng');
        return;
      }
      finalReason = customReason.trim();
    } else if (customReason.trim()) {
      finalReason = `${selectedReason} - ${customReason.trim()}`;
    }

    onConfirm(finalReason);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isLoading ? onClose : undefined}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C241E]">
                  Xác Nhận Hủy Đơn Hàng
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Mã đơn: <span className="font-semibold text-[#8C6A48]">{order.order_code}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tóm tắt đơn */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block">Tổng thanh toán:</span>
                <span className="font-serif font-bold text-sm text-[#2C241E]">
                  {order.total_amount_display}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block">Số sản phẩm:</span>
                <span className="font-medium text-stone-800">
                  {order.total_items || order.items?.length || 1} món
                </span>
              </div>
            </div>

            {/* Note lưu ý */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Quý khách có thể tự hủy đơn khi ở trạng thái <strong>Chờ xác nhận</strong>. Sau khi hủy, hệ thống sẽ tự động cập nhật và hoàn lại số lượng tồn kho của sản phẩm.
              </p>
            </div>

            {/* Chọn lý do */}
            <div>
              <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                Chọn lý do hủy đơn:
              </label>
              <div className="space-y-2">
                {COMMON_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-[#8C6A48] bg-[#FAF8F5] text-[#2C241E] font-medium shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => {
                        setSelectedReason(reason);
                        setErrorMsg('');
                      }}
                      className="accent-[#8C6A48] w-4 h-4 cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nhập thêm chi tiết hoặc lý do khác */}
            <div>
              <label className="block text-xs font-semibold text-[#2C241E] mb-1.5">
                {selectedReason === 'Lý do khác' ? (
                  <span>
                    Chi tiết lý do hủy <span className="text-rose-500">*</span>:
                  </span>
                ) : (
                  <span className="text-stone-600">Ghi chú bổ sung (tùy chọn):</span>
                )}
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={
                  selectedReason === 'Lý do khác'
                    ? 'Quý khách vui lòng cho TK House biết lý do để nâng cao chất lượng phục vụ...'
                    : 'Nhập ghi chú thêm nếu có...'
                }
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] bg-stone-50/50"
              />
              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errorMsg}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Giữ lại đơn hàng
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide transition-colors flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy đơn</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
