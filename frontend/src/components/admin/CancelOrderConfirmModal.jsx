import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Modal cảnh báo khi Hủy đơn hàng (Cancelled)
 * Nhắc nhở Admin về cơ chế hoàn tồn kho tự động trong hệ thống.
 */
export default function CancelOrderConfirmModal({
  isOpen,
  order,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [adminNote, setAdminNote] = useState('');

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    onConfirm(adminNote);
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-rose-50/60">
            <div className="flex items-center space-x-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-rose-900">
                  Xác Nhận Hủy Đơn Hàng
                </h3>
                <p className="text-xs text-rose-600 font-sans">
                  Mã đơn: <span className="font-semibold">{order.order_code}</span>
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

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Cảnh báo tự động hoàn kho */}
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start space-x-3 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-950 font-semibold mb-0.5">
                  Lưu ý quan trọng về tồn kho:
                </strong>
                Hệ thống sẽ <strong>tự động hoàn lại số lượng tồn kho (restock)</strong> cho tất cả sản phẩm trong đơn này vào kho dữ liệu. Đồng thời, trạng thái thanh toán nếu đang chờ (pending) sẽ tự động chuyển sang thất bại (failed).
              </div>
            </div>

            {/* Thông tin tóm tắt đơn hàng */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Khách hàng:</span>
                <span className="font-medium text-stone-900">{order.recipient_name} ({order.recipient_phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tổng giá trị:</span>
                <span className="font-bold text-[#8C6A48]">{order.total_amount_display || `${order.total_amount?.toLocaleString('vi-VN')}₫`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Số lượng món:</span>
                <span className="font-medium text-stone-900">{order.total_items} sản phẩm</span>
              </div>
            </div>

            {/* Lý do hủy đơn (Admin Note) */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                Lý do hủy đơn hàng <span className="text-stone-400 font-normal lowercase">(ghi chú lưu vào lịch sử)</span>:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ví dụ: Khách gọi yêu cầu hủy, đổi địa chỉ, hết hàng chi nhánh..."
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-stone-50 border-t border-stone-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý hoàn kho...</span>
                </>
              ) : (
                <span>Xác nhận Hủy Đơn & Hoàn Kho</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
