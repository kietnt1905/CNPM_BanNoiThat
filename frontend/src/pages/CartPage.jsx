import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, summary, updateQuantity, removeFromCart, clearAll, loading } = useCart();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Áp dụng mã giảm giá giả lập
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    setCouponError(null);

    if (!code) {
      setCouponError('Vui lòng nhập mã ưu đãi.');
      return;
    }

    if (code === 'TKHOUSE10' || code === 'VIP10') {
      const discountPercent = 10;
      const discountValue = Math.round((summary.total_amount * discountPercent) / 100);
      setAppliedCoupon({
        code,
        percent: discountPercent,
        value: discountValue,
        description: 'Ưu đãi 10% đặc quyền thành viên TK Atelier',
      });
      showToast('Áp dụng mã ưu đãi 10% thành công!');
    } else if (code === 'KINFOLK' || code === 'WELCOME5') {
      const discountPercent = 5;
      const discountValue = Math.round((summary.total_amount * discountPercent) / 100);
      setAppliedCoupon({
        code,
        percent: discountPercent,
        value: discountValue,
        description: 'Ưu đãi 5% cho đơn hàng đầu tiên',
      });
      showToast('Áp dụng mã ưu đãi 5% thành công!');
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    showToast('Đã hủy áp dụng mã ưu đãi.');
  };

  // Tính tổng sau giảm giá
  const finalTotal = appliedCoupon
    ? Math.max(0, summary.total_amount - appliedCoupon.value)
    : summary.total_amount;

  const finalTotalDisplay = `${new Intl.NumberFormat('vi-VN').format(finalTotal)}₫`;

  const handleClearCart = async () => {
    await clearAll();
    setConfirmClearOpen(false);
    showToast('Đã làm trống toàn bộ giỏ hàng.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#FAF8F5] text-[#2C241E] pb-24"
    >
      {/* Toast thông báo */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C241E] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center space-x-3 text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E6C280] flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal xác nhận xóa toàn bộ */}
      <AnimatePresence>
        {confirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmClearOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl border border-[#E8E2D8] p-6 max-w-sm w-full shadow-2xl space-y-4 text-center z-10"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-normal text-neutral-900">
                  Làm trống giỏ hàng?
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Tất cả các sản phẩm đang có trong giỏ hàng sẽ bị xóa. Thao tác này không thể hoàn tác.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Breadcrumbs */}
      <div className="border-b border-[#E8E2D8] bg-[#F5F2EB]/70 backdrop-blur-sm sticky top-[73px] sm:top-[77px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-neutral-900 transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-neutral-400">/</span>
            <Link to="/san-pham" className="hover:text-neutral-900 transition-colors">
              Sản phẩm
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-[#8C6A48]">Giỏ hàng của bạn</span>
          </div>

          <span className="hidden sm:inline-block font-mono text-[11px] text-[#8C6A48] tracking-widest uppercase font-semibold">
            TK HOUSE ATELIER
          </span>
        </div>
      </div>

      {/* 2. Tiêu đề trang */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold">
              Tuyển tập giỏ hàng
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900">
              Kiểm Tra Giỏ Hàng Kiến Trúc
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl">
              Những tác phẩm nội thất thủ công được lưu giữ riêng cho tổ ấm của bạn.
            </p>
          </div>

          {!isEmpty && (
            <div className="flex items-center space-x-3">
              <span className="bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] text-xs font-mono px-3 py-1.5 rounded-full font-bold">
                {summary.total_items} món đồ
              </span>
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="text-xs text-neutral-500 hover:text-rose-600 inline-flex items-center space-x-1 transition-colors"
                title="Xóa tất cả sản phẩm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Làm trống giỏ hàng</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Nội dung Giỏ hàng: 2 Cột */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isEmpty ? (
          /* Trạng thái trống */
          <div className="bg-white rounded-3xl border border-[#E8E2D8] p-12 sm:p-20 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
              <ShoppingBag className="w-9 h-9 stroke-[1.25]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-normal text-neutral-900">
                Giỏ hàng của bạn hiện đang trống
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
                Chưa có tác phẩm nội thất nào được thêm vào giỏ. Hãy ghé thăm bộ sưu tập để chọn cho mình những sản phẩm ưng ý nhất.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/san-pham"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <span>Khám phá bộ sưu tập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI (8 Cột): Danh sách sản phẩm chi tiết */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-xs divide-y divide-[#E8E2D8]/70">
                {/* Header bảng (Desktop) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  <div className="col-span-6">Sản phẩm & Tùy chọn</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>

                {/* Các dòng sản phẩm */}
                {items.map((item, idx) => {
                  const itemKey = item.id || `variant-${item.variant_id}-${idx}`;
                  const isOutOfStock = item.is_out_of_stock;
                  const exceedsStock = item.exceeds_stock;

                  return (
                    <div key={itemKey} className="p-4 sm:p-6 transition-colors hover:bg-[#FAF8F5]/40">
                      <div className="flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                        {/* Cột 1: Ảnh & Thông tin (col-span-6) */}
                        <div className="sm:col-span-6 flex items-start space-x-4">
                          <Link
                            to={`/san-pham/${item.product_slug || item.product_id}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] overflow-hidden flex-shrink-0 relative group"
                          >
                            <img
                              src={item.thumbnail || item.image || '/images/products/sofa-3-cho-victoria.jpg'}
                              alt={item.product_name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                            />
                          </Link>

                          <div className="flex-1 min-w-0 space-y-1">
                            {item.category_name && (
                              <span className="text-[10px] font-mono text-[#8C6A48] uppercase tracking-wider font-semibold">
                                {item.category_name}
                              </span>
                            )}
                            <h3 className="font-serif text-sm sm:text-base font-semibold text-neutral-900 leading-snug">
                              <Link
                                to={`/san-pham/${item.product_slug || item.product_id}`}
                                className="hover:text-[#8C6A48] transition-colors"
                              >
                                {item.product_name}
                              </Link>
                            </h3>

                            {/* Chi tiết biến thể */}
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-neutral-500 font-light">
                              {item.color && (
                                <span className="bg-[#FAF8F5] border border-[#E8E2D8] px-2 py-0.5 rounded-md">
                                  Màu: <strong>{item.color}</strong>
                                </span>
                              )}
                              {item.material && (
                                <span className="bg-[#FAF8F5] border border-[#E8E2D8] px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                  {item.material}
                                </span>
                              )}
                              {item.dimensions && (
                                <span className="bg-[#FAF8F5] border border-[#E8E2D8] px-2 py-0.5 rounded-md font-mono text-[10px]">
                                  {item.dimensions}
                                </span>
                              )}
                            </div>

                            {/* Cảnh báo kho */}
                            {isOutOfStock && (
                              <p className="flex items-center space-x-1 text-xs text-rose-600 font-medium pt-1">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Tạm thời hết hàng trong kho</span>
                              </p>
                            )}
                            {exceedsStock && !isOutOfStock && (
                              <p className="flex items-center space-x-1 text-xs text-amber-600 font-medium pt-1">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Số lượng yêu cầu vượt quá tồn kho ({item.stock_quantity})</span>
                              </p>
                            )}

                            {/* Nút xóa trên mobile */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item)}
                              className="sm:hidden text-xs text-neutral-400 hover:text-rose-600 pt-1 flex items-center space-x-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>

                        {/* Cột 2: Đơn giá (col-span-2) */}
                        <div className="sm:col-span-2 sm:text-center mt-3 sm:mt-0 flex sm:block justify-between items-center text-xs sm:text-sm font-mono text-neutral-600">
                          <span className="sm:hidden text-neutral-400">Đơn giá:</span>
                          <span>{item.price_display}</span>
                        </div>

                        {/* Cột 3: Bộ tăng giảm số lượng (col-span-2) */}
                        <div className="sm:col-span-2 sm:text-center mt-2 sm:mt-0 flex sm:justify-center items-center justify-between">
                          <span className="sm:hidden text-xs text-neutral-400">Số lượng:</span>
                          <div className="inline-flex items-center border border-[#E8E2D8] rounded-xl bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              disabled={loading || item.quantity <= 1}
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F0] hover:text-[#8C6A48] disabled:opacity-30 transition-colors"
                              title="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-semibold font-mono text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={loading || (item.stock_quantity && item.quantity >= item.stock_quantity)}
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F0] hover:text-[#8C6A48] disabled:opacity-30 transition-colors"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Cột 4: Thành tiền & Nút xóa Desktop (col-span-2) */}
                        <div className="sm:col-span-2 sm:text-right mt-2 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between">
                          <span className="sm:hidden text-xs text-neutral-400">Thành tiền:</span>
                          <div>
                            <span className="font-mono text-sm sm:text-base font-bold text-neutral-900">
                              {item.line_total_display || item.price_display}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item)}
                            className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-neutral-400 hover:text-rose-600 mt-1 transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hàng nút chuyển tiếp mua sắm */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Link
                  to="/san-pham"
                  className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-[#8C6A48] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Tiếp tục tuyển chọn nội thất</span>
                </Link>

                <div className="flex items-center space-x-2 text-xs text-neutral-500 font-light">
                  <ShieldCheck className="w-4 h-4 text-[#8C6A48]" />
                  <span>Mọi sản phẩm đều được bảo chứng chất lượng bởi TK House</span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (4 Cột): Tóm tắt đơn hàng & Mã giảm giá */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-[140px] bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-7 shadow-xs space-y-6">
                <div className="pb-4 border-b border-[#E8E2D8]">
                  <h2 className="font-serif text-lg font-normal text-neutral-900 tracking-wide uppercase">
                    Tóm Tắt Đơn Hàng
                  </h2>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    Hóa đơn thanh toán & đặc quyền dịch vụ
                  </p>
                </div>

                {/* Ô nhập mã ưu đãi (Coupon) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    MÃ ƯU ĐÃI / VOUCHER
                  </span>

                  {appliedCoupon ? (
                    <div className="bg-[#FAF6F0] border border-[#E5DACD] rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8C6A48] text-white flex items-center justify-center">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#8C6A48] font-mono tracking-wider">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-light">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                        title="Hủy mã"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Mã ưu đãi (VD: TKHOUSE10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-3.5 py-2 text-xs font-mono uppercase focus:outline-none focus:border-[#8C6A48] text-neutral-900 placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-2xs"
                        >
                          Áp dụng
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{couponError}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-neutral-400 font-light">
                        Mẹo: Nhập <span className="font-mono font-semibold text-[#8C6A48]">TKHOUSE10</span> để nhận ưu đãi 10%.
                      </p>
                    </form>
                  )}
                </div>

                {/* Các khoản thanh toán */}
                <div className="space-y-3 pt-3 border-t border-[#E8E2D8] text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Tổng tiền hàng ({summary.total_items} món):</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {summary.total_amount_display}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-[#8C6A48]">
                      <span>Ưu đãi voucher ({appliedCoupon.code}):</span>
                      <span className="font-mono font-semibold">
                        -{new Intl.NumberFormat('vi-VN').format(appliedCoupon.value)}₫
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center space-x-1.5">
                      <span>Vận chuyển toàn quốc:</span>
                    </span>
                    <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                      Miễn phí
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Lắp đặt & hoàn thiện:</span>
                    <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                      Miễn phí
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D8] flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-base font-semibold text-neutral-900 block">
                        Tổng thanh toán:
                      </span>
                      <span className="text-[10.5px] text-neutral-400 font-light">
                        (Đã bao gồm VAT & chi phí lắp đặt)
                      </span>
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-900">
                      {finalTotalDisplay}
                    </span>
                  </div>
                </div>

                {/* Nút đặt hàng */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Hệ thống đặt hàng đang chuẩn bị kết nối thanh toán...');
                    }}
                    className="w-full py-4 rounded-2xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Tiến hành đặt hàng ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[10.5px] text-neutral-400 font-light leading-relaxed">
                    Nhân viên KTS của TK House sẽ liên hệ xác nhận bản vẽ & địa chỉ trước khi vận chuyển.
                  </p>
                </div>

                {/* Cam kết thương hiệu TK House */}
                <div className="pt-4 border-t border-[#E8E2D8] space-y-2.5 bg-[#FAF8F5] p-3.5 rounded-2xl border border-dashed border-[#E2D9CC]">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#8C6A48]">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>ĐẶC QUYỀN THÀNH VIÊN TK HOUSE</span>
                  </div>
                  <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 pl-1">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#8C6A48] font-bold">✓</span>
                      <span>Bảo hành chính hãng 5 năm kết cấu khung gỗ & mặt đá</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#8C6A48] font-bold">✓</span>
                      <span>Đổi trả linh hoạt trong vòng 30 ngày</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-[#8C6A48] font-bold">✓</span>
                      <span>Kỹ thuật viên khảo sát tận nơi và hỗ trợ may đo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
