import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  X,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  User,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderApi from '../api/orderApi';

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDirectCheckout =
    location.pathname === '/thanh-toan' ||
    location.pathname === '/checkout' ||
    location.search.includes('checkout=true') ||
    Boolean(location.state?.fromBuyNow);

  const {
    cart,
    summary,
    updateQuantity,
    removeFromCart,
    clearAll,
    loading,
    selectedIds,
    setSelectedIds,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedItems,
    selectedSummary,
    removePurchasedItems,
    refreshCart,
  } = useCart();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Lọc sản phẩm có thể chọn (còn hàng)
  const availableItems = items.filter((item) => !item.is_out_of_stock);
  const isAllSelected = availableItems.length > 0 && selectedItems.length === availableItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Checkout modal state: Tự động mở khi vào /thanh-toan hoặc mua ngay
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(() => isDirectCheckout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    shipping_address: '',
    payment_method: 'cod',
    note: '',
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});

  // Tự động bật modal checkout nếu route hoặc state yêu cầu
  useEffect(() => {
    if (isDirectCheckout) {
      setIsCheckoutOpen(true);
    }
  }, [isDirectCheckout]);

  // Nếu đến từ nút "Mua ngay", ưu tiên chỉ chọn riêng biến thể đó
  useEffect(() => {
    if (location.state?.buyNowVariantId && setSelectedIds) {
      setSelectedIds([Number(location.state.buyNowVariantId)]);
    }
  }, [location.state?.buyNowVariantId, setSelectedIds]);

  const handleCloseCheckout = () => {
    if (isSubmitting) return;
    setIsCheckoutOpen(false);
    if (location.pathname === '/thanh-toan' || location.pathname === '/checkout') {
      navigate('/gio-hang');
    }
  };

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
      const discountValue = Math.round((selectedSummary.total_amount * discountPercent) / 100);
      setAppliedCoupon({
        code,
        percent: discountPercent,
        value: discountValue,
        description: 'Ưu đãi 10% đặc quyền thành viên TK Atelier',
      });
      showToast('Áp dụng mã ưu đãi 10% thành công!');
    } else if (code === 'KINFOLK' || code === 'WELCOME5') {
      const discountPercent = 5;
      const discountValue = Math.round((selectedSummary.total_amount * discountPercent) / 100);
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

  // Tính tổng sau giảm giá dựa trên các món ĐÃ CHỌN
  const finalTotal = appliedCoupon
    ? Math.max(0, selectedSummary.total_amount - appliedCoupon.value)
    : selectedSummary.total_amount;

  const finalTotalDisplay = `${new Intl.NumberFormat('vi-VN').format(finalTotal)}₫`;

  const handleClearCart = async () => {
    await clearAll();
    setConfirmClearOpen(false);
    showToast('Đã làm trống toàn bộ giỏ hàng.');
  };

  // Xử lý gửi đơn hàng (API POST /api/orders)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm để đặt hàng.');
      return;
    }

    const errors = {};
    if (!checkoutForm.recipient_name.trim()) {
      errors.recipient_name = 'Vui lòng nhập họ và tên người nhận.';
    }
    if (!checkoutForm.recipient_phone.trim()) {
      errors.recipient_phone = 'Vui lòng nhập số điện thoại người nhận.';
    } else if (!/^[0-9+().\s-]{9,20}$/.test(checkoutForm.recipient_phone.trim())) {
      errors.recipient_phone = 'Số điện thoại không đúng định dạng.';
    }
    if (!checkoutForm.shipping_address.trim()) {
      errors.shipping_address = 'Vui lòng cung cấp địa chỉ giao hàng và lắp đặt.';
    }

    if (Object.keys(errors).length > 0) {
      setCheckoutErrors(errors);
      return;
    }

    setCheckoutErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        recipient_name: checkoutForm.recipient_name.trim(),
        recipient_phone: checkoutForm.recipient_phone.trim(),
        shipping_address: checkoutForm.shipping_address.trim(),
        payment_method: checkoutForm.payment_method,
        note: checkoutForm.note.trim() || undefined,
        shipping_fee: 0,
        discount_amount: appliedCoupon ? appliedCoupon.value : 0,
        // Gửi danh sách các món ĐÃ ĐƯỢC CHỌN
        items: selectedItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const res = await orderApi.createOrder(payload);

      if (res.data?.status && res.data?.data) {
        setOrderSuccess(res.data.data);
        const purchasedVariantIds = selectedItems.map((item) => Number(item.variant_id));
        await removePurchasedItems(purchasedVariantIds);
      } else {
        showToast(res.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng.';
      showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#2C241E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-medium border border-stone-700/50 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal xác nhận làm trống giỏ hàng */}
      <AnimatePresence>
        {confirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmClearOpen(false)}
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E2D8] space-y-4 text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-normal text-neutral-900">
                  Làm trống giỏ hàng?
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Tất cả các sản phẩm nội thất tuyển chọn sẽ bị xóa khỏi giỏ hàng của bạn.
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
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Đặt hàng (Checkout Modal) */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCheckout}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D8] overflow-hidden z-10 my-8"
            >
              {orderSuccess ? (
                /* Màn hình Đặt hàng thành công */
                <div className="p-8 sm:p-10 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9 stroke-[2]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold">
                      TK HOUSE ATELIER
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-900">
                      Đặt Hàng Thành Công!
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
                      Cảm ơn quý khách đã tin tưởng và chọn lựa kiệt tác nội thất từ TK House. Chuyên viên kiến trúc sẽ liên hệ qua điện thoại để xác nhận lịch giao lắp.
                    </p>
                  </div>

                  {/* Thẻ chi tiết đơn hàng */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E8E2D8] text-left space-y-3 max-w-md mx-auto text-xs">
                    <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
                      <span className="text-neutral-500">Mã đơn hàng:</span>
                      <span className="font-mono font-bold text-neutral-900 text-sm">
                        {orderSuccess.order_code}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
                      <span className="text-neutral-500">Người nhận:</span>
                      <span className="font-medium text-neutral-900">
                        {orderSuccess.recipient_name} ({orderSuccess.recipient_phone})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
                      <span className="text-neutral-500">Địa chỉ giao lắp:</span>
                      <span className="font-medium text-neutral-900 text-right max-w-[240px] truncate">
                        {orderSuccess.shipping_address}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
                      <span className="text-neutral-500">Phương thức:</span>
                      <span className="font-medium text-neutral-900">
                        {orderSuccess.payment?.method_label || 'Thanh toán khi nhận hàng (COD)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="font-serif font-bold text-neutral-900 text-sm">
                        Tổng thanh toán:
                      </span>
                      <span className="font-mono font-bold text-base text-[#8C6A48]">
                        {orderSuccess.total_amount_display}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin chuyển khoản nếu chọn bank_transfer */}
                  {orderSuccess.payment?.method === 'bank_transfer' && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left max-w-md mx-auto text-xs space-y-2 text-amber-900">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <Building2 className="w-4 h-4 text-[#8C6A48]" />
                        <span>Thông tin Chuyển khoản ngân hàng:</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed">
                        Ngân hàng: <strong>Vietcombank</strong> (CN Thủ Thiêm, TP.HCM)<br />
                        Số tài khoản: <strong>1905 8888 9999</strong><br />
                        Chủ tài khoản: <strong>CONG TY NOI THAT TK HOUSE</strong><br />
                        Nội dung CK: <strong className="font-mono text-rose-700">{orderSuccess.order_code}</strong>
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSuccess(null);
                        setIsCheckoutOpen(false);
                        navigate('/san-pham');
                      }}
                      className="px-6 py-3 rounded-full bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                </div>
              ) : (
                /* Form đặt hàng */
                <div>
                  {/* Header Modal */}
                  <div className="px-6 sm:px-8 py-5 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold">
                        BƯỚC THANH TOÁN
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-normal text-neutral-900">
                        Thông Tin Giao Hàng & Lắp Đặt
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseCheckout}
                      className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 stroke-[1.75]" />
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6">
                    {/* Danh sách tóm tắt các món được chọn */}
                    <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E8E2D8] space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-[#E8E2D8] pb-2">
                        <span className="font-semibold text-neutral-800">
                          Sản phẩm đã chọn ({selectedSummary.total_items} món)
                        </span>
                        <span className="font-mono font-bold text-[#8C6A48]">
                          {selectedSummary.total_amount_display}
                        </span>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#E8E2D8]/60">
                        {selectedItems.map((item) => (
                          <div key={item.variant_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                              <img
                                src={item.thumbnail || item.image || '/images/placeholder.jpg'}
                                alt={item.product_name}
                                className="w-9 h-9 rounded-lg object-cover border border-[#E8E2D8] flex-shrink-0"
                              />
                              <div className="min-w-0 truncate">
                                <p className="font-medium text-neutral-900 truncate">{item.product_name}</p>
                                <p className="text-[10.5px] text-neutral-400">
                                  {item.color} • SL: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-semibold text-neutral-800 flex-shrink-0">
                              {item.line_total_display || item.price_display}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Các trường nhập thông tin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Họ tên */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-[#8C6A48]" />
                          <span>Họ và tên người nhận <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.recipient_name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, recipient_name: e.target.value })}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] text-xs outline-none transition-all"
                        />
                        {checkoutErrors.recipient_name && (
                          <p className="text-[10.5px] text-rose-600">{checkoutErrors.recipient_name}</p>
                        )}
                      </div>

                      {/* Số điện thoại */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-[#8C6A48]" />
                          <span>Số điện thoại <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                          type="tel"
                          value={checkoutForm.recipient_phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, recipient_phone: e.target.value })}
                          placeholder="Ví dụ: 0901 234 567"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] text-xs outline-none transition-all"
                        />
                        {checkoutErrors.recipient_phone && (
                          <p className="text-[10.5px] text-rose-600">{checkoutErrors.recipient_phone}</p>
                        )}
                      </div>

                      {/* Địa chỉ giao & lắp đặt */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8C6A48]" />
                          <span>Địa chỉ giao hàng & lắp đặt tận nơi <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.shipping_address}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_address: e.target.value })}
                          placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] text-xs outline-none transition-all"
                        />
                        {checkoutErrors.shipping_address && (
                          <p className="text-[10.5px] text-rose-600">{checkoutErrors.shipping_address}</p>
                        )}
                      </div>

                      {/* Phương thức thanh toán */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1">
                          <CreditCard className="w-3.5 h-3.5 text-[#8C6A48]" />
                          <span>Phương thức thanh toán <span className="text-rose-500">*</span></span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                              checkoutForm.payment_method === 'cod'
                                ? 'border-[#8C6A48] bg-[#FAF6F0]'
                                : 'border-[#E8E2D8] hover:bg-neutral-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment_method"
                              value="cod"
                              checked={checkoutForm.payment_method === 'cod'}
                              onChange={() => setCheckoutForm({ ...checkoutForm, payment_method: 'cod' })}
                              className="accent-[#8C6A48]"
                            />
                            <div>
                              <p className="text-xs font-semibold text-neutral-900">Tiền mặt khi giao lắp (COD)</p>
                              <p className="text-[10.5px] text-neutral-500">Kiểm tra bàn ghế ưng ý mới thanh toán</p>
                            </div>
                          </label>

                          <label
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                              checkoutForm.payment_method === 'bank_transfer'
                                ? 'border-[#8C6A48] bg-[#FAF6F0]'
                                : 'border-[#E8E2D8] hover:bg-neutral-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment_method"
                              value="bank_transfer"
                              checked={checkoutForm.payment_method === 'bank_transfer'}
                              onChange={() => setCheckoutForm({ ...checkoutForm, payment_method: 'bank_transfer' })}
                              className="accent-[#8C6A48]"
                            />
                            <div>
                              <p className="text-xs font-semibold text-neutral-900">Chuyển khoản ngân hàng</p>
                              <p className="text-[10.5px] text-neutral-500">Qua mã QR / STK công ty tiện lợi</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-[#8C6A48]" />
                          <span>Ghi chú cho đội ngũ kỹ thuật lắp đặt (Tùy chọn)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={checkoutForm.note}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, note: e.target.value })}
                          placeholder="Ví dụ: Giao lên chung cư lầu 15 có thang máy, hẹn trước 30 phút..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] text-xs outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Tổng chi phí & Nút xác nhận */}
                    <div className="pt-3 border-t border-[#E8E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-neutral-500">Tổng thanh toán:</span>
                        <div className="font-mono text-xl sm:text-2xl font-bold text-neutral-900">
                          {finalTotalDisplay}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3.5 rounded-2xl bg-[#2C241E] hover:bg-[#8C6A48] disabled:bg-neutral-400 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {isSubmitting ? (
                          <span>Đang xử lý đơn hàng...</span>
                        ) : (
                          <>
                            <span>Xác nhận đặt hàng ngay</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
            <span className="font-semibold text-[#8C6A48]">
              {isDirectCheckout ? 'Thanh toán đơn hàng' : 'Giỏ hàng của bạn'}
            </span>
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
              {isDirectCheckout ? 'Xác nhận đơn hàng' : 'Tuyển tập giỏ hàng'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-tight">
              {isDirectCheckout ? 'Thanh Toán Đơn Hàng' : 'Giỏ Hàng Kiến Trúc'}
            </h1>
          </div>

          {!isEmpty && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-neutral-500 font-light">
                {summary.total_items} món trong giỏ (Đã chọn {selectedSummary.total_items} món)
              </span>
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2D8] text-xs font-medium text-neutral-600 hover:text-rose-600 hover:border-rose-200 transition-colors bg-white shadow-2xs"
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
                {/* Header bảng (Desktop) có Checkbox Chọn tất cả */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-neutral-500 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="select-all-desktop"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-[#D1C7BA] text-[#8C6A48] focus:ring-[#8C6A48] cursor-pointer accent-[#8C6A48]"
                    />
                    <label htmlFor="select-all-desktop" className="cursor-pointer select-none">
                      Chọn tất cả ({selectedItems.length}/{availableItems.length})
                    </label>
                  </div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>

                {/* Thanh Chọn tất cả trên Mobile */}
                <div className="sm:hidden px-4 py-3 bg-[#FAF8F5] border-b border-[#E8E2D8] flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-[#D1C7BA] text-[#8C6A48] focus:ring-[#8C6A48] cursor-pointer accent-[#8C6A48]"
                    />
                    <span className="font-semibold text-neutral-800">
                      Chọn tất cả ({selectedItems.length}/{availableItems.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-[11px] text-[#8C6A48] font-mono font-bold">
                      {selectedSummary.total_amount_display}
                    </span>
                  )}
                </div>

                {/* Các dòng sản phẩm */}
                {items.map((item, idx) => {
                  const itemKey = item.id || `variant-${item.variant_id}-${idx}`;
                  const isOutOfStock = item.is_out_of_stock;
                  const exceedsStock = item.exceeds_stock;
                  const isChecked = selectedIds.includes(item.variant_id);

                  return (
                    <div key={itemKey} className={`p-4 sm:p-6 transition-colors ${isChecked ? 'bg-[#FAF8F5]/50' : 'hover:bg-[#FAF8F5]/30'}`}>
                      <div className="flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                        {/* Cột 1: Checkbox & Ảnh & Thông tin (col-span-6) */}
                        <div className="sm:col-span-6 flex items-start space-x-3 sm:space-x-4">
                          {/* Checkbox chọn sản phẩm */}
                          <div className="pt-8 sm:pt-9 flex items-center justify-center">
                            <input
                              type="checkbox"
                              disabled={isOutOfStock}
                              checked={isChecked}
                              onChange={() => toggleSelectItem(item.variant_id)}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#D1C7BA] text-[#8C6A48] focus:ring-[#8C6A48] cursor-pointer accent-[#8C6A48] disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Chọn sản phẩm này'}
                            />
                          </div>

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
                    Đã chọn <strong className="text-neutral-800">{selectedSummary.total_items}</strong> tác phẩm để thanh toán
                  </p>
                </div>

                {/* Nhập mã ưu đãi */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#8C6A48]" />
                    <span>MÃ ƯU ĐÃI NỘI THẤT</span>
                  </span>

                  {appliedCoupon ? (
                    <div className="bg-[#FAF8F5] border border-[#E5DACD] rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8C6A48] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-neutral-900">{appliedCoupon.code}</p>
                          <p className="text-[10px] text-neutral-500">{appliedCoupon.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-neutral-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Mã voucher (VD: TKHOUSE10)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] text-xs outline-none uppercase font-mono transition-all"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
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

                {/* Các khoản thanh toán theo sản phẩm ĐÃ CHỌN */}
                <div className="space-y-3 pt-3 border-t border-[#E8E2D8] text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Tiền hàng đã chọn ({selectedSummary.total_items} món):</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {selectedSummary.total_amount_display}
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
                    disabled={selectedItems.length === 0}
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-4 rounded-2xl bg-[#2C241E] hover:bg-[#8C6A48] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>
                      {selectedItems.length > 0
                        ? `Tiến hành đặt hàng (${selectedSummary.total_items} món)`
                        : 'Vui lòng chọn sản phẩm để đặt hàng'}
                    </span>
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
                      <span>Hỗ trợ kỹ thuật căn chỉnh định kỳ miễn phí</span>
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
