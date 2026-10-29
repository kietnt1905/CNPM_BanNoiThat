import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Check,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  User,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderApi from '../api/orderApi';

const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Lâm Đồng',
  'Khánh Hòa',
  'Quảng Nam',
  'Thừa Thiên Huế',
  'Bắc Ninh',
  'Quảng Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Kiên Giang',
  'An Giang',
  'Bình Thuận',
  'Tỉnh/Thành phố khác',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cart,
    selectedItems,
    selectedSummary,
    removePurchasedItems,
    refreshCart,
    selectAllItems,
  } = useCart();

  // Kiểm tra tài khoản đăng nhập
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      setIsAuth(true);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          setForm((prev) => ({
            ...prev,
            recipient_name: prev.recipient_name || parsed.name || '',
            recipient_phone: prev.recipient_phone || parsed.phone || '',
          }));
        } catch {
          // ignore
        }
      }
    } else {
      setIsAuth(false);
    }
  }, []);

  // Đảm bảo có sản phẩm được chọn
  useEffect(() => {
    if (selectedItems.length === 0 && (cart?.items || []).length > 0) {
      selectAllItems();
    }
  }, [selectedItems.length, cart?.items]);

  // Form thông tin nhận hàng
  const [form, setForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    province: 'TP. Hồ Chí Minh',
    detailed_address: '',
    payment_method: 'cod', // 'cod' | 'bank_transfer' | 'vnpay' | 'momo'
    note: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Voucher / Giảm giá
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tính toán tổng tiền
  const subtotal = selectedSummary?.total_amount || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.value : 0;
  const shippingFee = 0; // Luôn miễn phí cho dòng nội thất cao cấp
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const finalTotalDisplay = `${new Intl.NumberFormat('vi-VN').format(finalTotal)}₫`;

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Vui lòng nhập mã ưu đãi');
      return;
    }

    if (code === 'TKHOUSE10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: 'TKHOUSE10', value: discount, label: 'Giảm 10% đặc quyền Atelier' });
      showToast('Áp dụng mã ưu đãi 10% thành công!');
    } else if (code === 'WELCOME5') {
      const discount = Math.round(subtotal * 0.05);
      setAppliedCoupon({ code: 'WELCOME5', value: discount, label: 'Giảm 5% chào mừng thành viên' });
      showToast('Áp dụng mã ưu đãi 5% thành công!');
    } else if (code === 'FREESHIP') {
      showToast('Đơn hàng nội thất TK House đã được áp dụng Miễn phí vận chuyển toàn quốc!');
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết lượt áp dụng.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    showToast('Đã hủy áp dụng mã ưu đãi.');
  };

  // Xác thực Form
  const validateForm = () => {
    const errs = {};
    if (!form.recipient_name.trim()) {
      errs.recipient_name = 'Vui lòng nhập họ và tên người nhận.';
    }
    if (!form.recipient_phone.trim()) {
      errs.recipient_phone = 'Vui lòng nhập số điện thoại liên hệ.';
    } else if (!/^[0-9+().\s-]{9,20}$/.test(form.recipient_phone.trim())) {
      errs.recipient_phone = 'Số điện thoại không đúng định dạng.';
    }
    if (!form.detailed_address.trim()) {
      errs.detailed_address = 'Vui lòng nhập số nhà, tên đường, phường/xã, quận/huyện.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Đặt hàng
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      showToast('Giỏ hàng chưa có sản phẩm nào được chọn để thanh toán.');
      return;
    }

    if (!validateForm()) {
      // Cuộn lên phần lỗi đầu tiên
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    // Nếu chưa đăng nhập, hướng dẫn người dùng đăng nhập để lưu đơn
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập để hoàn tất tạo đơn hàng an toàn.');
      setTimeout(() => {
        navigate('/dang-nhap?redirect=/checkout');
      }, 1200);
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${form.detailed_address.trim()}, ${form.province}`;

      const payload = {
        recipient_name: form.recipient_name.trim(),
        recipient_phone: form.recipient_phone.trim(),
        shipping_address: fullAddress,
        payment_method: form.payment_method,
        note: form.note.trim() || undefined,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        items: selectedItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const res = await orderApi.createOrder(payload);

      if (res.data?.status && res.data?.data) {
        const paymentUrl = res.data.payment_url || res.data.data.payment_url;
        const purchasedVariantIds = selectedItems.map((item) => Number(item.variant_id));
        await removePurchasedItems(purchasedVariantIds);

        // Nếu là phương thức VNPay và có link thanh toán, chuyển hướng sang cổng VNPay
        if (form.payment_method === 'vnpay' && paymentUrl) {
          localStorage.setItem('vnpay_pending_order', JSON.stringify({
            order_code: res.data.data.order_code,
            order_id: res.data.data.id,
            total_amount: res.data.data.total_amount,
            timestamp: Date.now(),
          }));
          window.location.href = paymentUrl;
          return;
        }

        setOrderSuccess(res.data.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(res.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại.';
      showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2C241E] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-[#E8E2D8] p-8 sm:p-12 text-center space-y-6"
        >
          {/* Icon huy hiệu thành công */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold block">
              TK HOUSE ATELIER • XÁC NHẬN ĐƠN HÀNG
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
              Cảm ơn quý khách đã tin tưởng và lựa chọn thiết kế từ <strong>TK House</strong>. Bộ phận KTS và kỹ thuật viên sẽ liên hệ trong ít phút để xác nhận chi tiết lịch giao lắp.
            </p>
          </div>

          {/* Khối tóm tắt đơn hàng thành công */}
          <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E2D8] text-left space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-neutral-900 text-sm text-[#8C6A48]">
                {orderSuccess.order_code}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500">Người nhận hàng:</span>
              <span className="font-semibold text-neutral-900">
                {orderSuccess.recipient_name} ({orderSuccess.recipient_phone})
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500">Địa chỉ giao & lắp đặt:</span>
              <span className="font-medium text-neutral-900 text-right max-w-xs truncate" title={orderSuccess.shipping_address}>
                {orderSuccess.shipping_address}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500">Phương thức thanh toán:</span>
              <span className="font-semibold text-neutral-900">
                {orderSuccess.payment?.method_label || form.payment_method.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-sm text-neutral-900">
              <span>Tổng số tiền:</span>
              <span className="font-mono text-base text-[#8C6A48]">
                {orderSuccess.total_amount_display || `${orderSuccess.total_amount?.toLocaleString('vi-VN')}₫`}
              </span>
            </div>
          </div>

          {/* Hướng dẫn chuyển khoản nếu chọn bank_transfer */}
          {form.payment_method === 'bank_transfer' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-left text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-amber-950">
                <Building2 className="w-4 h-4 text-[#8C6A48]" />
                <span>Thông tin chuyển khoản công ty:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-amber-800/80 block">Ngân hàng:</span>
                  <span className="font-bold">Vietcombank (VCB)</span>
                </div>
                <div>
                  <span className="text-amber-800/80 block">Số tài khoản:</span>
                  <span className="font-mono font-bold text-[#8C6A48]">1900 8899 6688</span>
                </div>
                <div>
                  <span className="text-amber-800/80 block">Chủ tài khoản:</span>
                  <span className="font-bold">TK HOUSE ATELIER CORP</span>
                </div>
                <div>
                  <span className="text-amber-800/80 block">Nội dung chuyển khoản:</span>
                  <span className="font-mono font-bold text-amber-900">{orderSuccess.order_code}</span>
                </div>
              </div>
            </div>
          )}

          {/* Các nút điều hướng */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/gio-hang"
              className="flex-1 py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors text-center"
            >
              Về giỏ hàng
            </Link>
            <Link
              to="/san-pham"
              className="flex-1 py-3 px-5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all text-center shadow-md"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // TRƯỜNG HỢP GIỎ HÀNG HOÀN TOÀN TRỐNG
  if (selectedItems.length === 0 && (cart?.items || []).length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2C241E] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-stone-400 mb-4 shadow-sm">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-neutral-900 mb-2">
          Chưa có sản phẩm nào để thanh toán
        </h2>
        <p className="text-xs text-neutral-500 font-light max-w-sm mb-6 leading-relaxed">
          Giỏ hàng của quý khách hiện đang trống. Hãy khám phá các tuyệt tác nội thất của TK House để hoàn thiện không gian sống.
        </p>
        <Link
          to="/san-pham"
          className="px-6 py-3 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2"
        >
          <span>Khám phá sản phẩm</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C241E] pb-24">
      {/* Toast Notification */}
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

      {/* 1. Breadcrumbs & Security Tag */}
      <div className="border-b border-[#E8E2D8] bg-[#F5F2EB]/70 backdrop-blur-sm sticky top-[73px] sm:top-[77px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-neutral-900 transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-neutral-400">/</span>
            <Link to="/gio-hang" className="hover:text-neutral-900 transition-colors">
              Giỏ hàng
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-[#8C6A48]">Thanh toán đơn hàng</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-stone-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bảo mật giao dịch SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* 2. Main Checkout Container (2 Columns) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-tight">
            Thanh Toán Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1.5">
            Vui lòng điền thông tin người nhận và lựa chọn phương thức thanh toán phù hợp.
          </p>
        </div>

        {/* Chưa đăng nhập: Banner nhắc nhở đăng nhập */}
        {!isAuth && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#8C6A48] flex-shrink-0" />
              <span>
                Quý khách đã có tài khoản tại TK House? Đăng nhập để nhận ưu đãi thành viên và theo dõi tiến độ đơn hàng.
              </span>
            </div>
            <Link
              to="/dang-nhap?redirect=/checkout"
              className="px-3.5 py-1.5 bg-[#8C6A48] hover:bg-[#725436] text-white font-semibold rounded-xl whitespace-nowrap transition-colors shadow-2xs text-[11px]"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================
              CỘT TRÁI (COL 7): FORM THÔNG TIN NGƯỜI NHẬN & THANH TOÁN
             ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmitOrder} className="space-y-6" id="checkout-form">
              {/* Khối 1: Thông tin người nhận */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-5">
                <div className="flex items-center space-x-3 pb-4 border-b border-[#F0ECE1]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-neutral-900">
                      1. Thông Tin Người Nhận
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-light">
                      Kỹ thuật viên sẽ liên hệ số này để hẹn ngày giờ giao lắp nội thất
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Họ tên */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-800 block">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.recipient_name}
                      onChange={(e) => {
                        setForm({ ...form, recipient_name: e.target.value });
                        if (errors.recipient_name) setErrors({ ...errors, recipient_name: null });
                      }}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.recipient_name ? 'border-rose-400 bg-rose-50/20' : 'border-[#D5CDC2] focus:border-[#8C6A48]'
                      } focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all placeholder:text-stone-400`}
                    />
                    {errors.recipient_name && (
                      <p className="text-[11px] text-rose-500">{errors.recipient_name}</p>
                    )}
                  </div>

                  {/* SĐT */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-800 block">
                      Số điện thoại liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.recipient_phone}
                      onChange={(e) => {
                        setForm({ ...form, recipient_phone: e.target.value });
                        if (errors.recipient_phone) setErrors({ ...errors, recipient_phone: null });
                      }}
                      placeholder="0901 234 567"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.recipient_phone ? 'border-rose-400 bg-rose-50/20' : 'border-[#D5CDC2] focus:border-[#8C6A48]'
                      } focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all placeholder:text-stone-400`}
                    />
                    {errors.recipient_phone && (
                      <p className="text-[11px] text-rose-500">{errors.recipient_phone}</p>
                    )}
                  </div>

                  {/* Tỉnh / Thành */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-neutral-800 block">
                      Tỉnh / Thành phố giao hàng <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all bg-white cursor-pointer"
                    >
                      {VIETNAM_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Địa chỉ chi tiết */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-neutral-800 block">
                      Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà/căn hộ, phường/xã) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.detailed_address}
                      onChange={(e) => {
                        setForm({ ...form, detailed_address: e.target.value });
                        if (errors.detailed_address) setErrors({ ...errors, detailed_address: null });
                      }}
                      placeholder="Ví dụ: Tòa Landmark 81, Căn 12.05, 720A Điện Biên Phủ, Phường 22, Bình Thạnh"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.detailed_address ? 'border-rose-400 bg-rose-50/20' : 'border-[#D5CDC2] focus:border-[#8C6A48]'
                      } focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all placeholder:text-stone-400`}
                    />
                    {errors.detailed_address && (
                      <p className="text-[11px] text-rose-500">{errors.detailed_address}</p>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-neutral-800 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#8C6A48]" />
                      <span>Ghi chú cho đội ngũ lắp đặt & vận chuyển (Tùy chọn)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Ví dụ: Giao giờ hành chính, chung cư có thang máy vận chuyển hàng, hẹn trước 30 phút..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC2] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] outline-none transition-all placeholder:text-stone-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Khối 2: Chọn phương thức thanh toán */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-2xs space-y-5">
                <div className="flex items-center space-x-3 pb-4 border-b border-[#F0ECE1]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-neutral-900">
                      2. Phương Thức Thanh Toán
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-light">
                      Lựa chọn phương thức giao dịch thuận tiện và an toàn nhất
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start space-x-3.5 transition-all ${
                      form.payment_method === 'cod'
                        ? 'border-[#8C6A48] bg-[#FAF6F0] shadow-2xs ring-1 ring-[#8C6A48]'
                        : 'border-[#E8E2D8] hover:bg-neutral-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={form.payment_method === 'cod'}
                      onChange={() => setForm({ ...form, payment_method: 'cod' })}
                      className="mt-1 accent-[#8C6A48] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          Thanh toán khi nhận hàng & lắp đặt (COD)
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                        Kiểm tra bàn ghế nguyên vẹn, ưng ý mới thanh toán tiền mặt trực tiếp cho nhân viên kỹ thuật.
                      </p>
                    </div>
                  </label>

                  {/* Chuyển khoản ngân hàng */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start space-x-3.5 transition-all ${
                      form.payment_method === 'bank_transfer'
                        ? 'border-[#8C6A48] bg-[#FAF6F0] shadow-2xs ring-1 ring-[#8C6A48]'
                        : 'border-[#E8E2D8] hover:bg-neutral-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={form.payment_method === 'bank_transfer'}
                      onChange={() => setForm({ ...form, payment_method: 'bank_transfer' })}
                      className="mt-1 accent-[#8C6A48] cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-neutral-900 block">
                        Chuyển khoản ngân hàng (VietQR / Internet Banking 24/7)
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                        Chuyển khoản qua tài khoản ngân hàng chính thức của TK House. Hệ thống đối soát và xác nhận đơn ngay khi nhận tiền.
                      </p>

                      {/* Chi tiết STK khi chọn */}
                      {form.payment_method === 'bank_transfer' && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-700 space-y-1">
                          <p><strong>Ngân hàng:</strong> Vietcombank (VCB) - CN Tân Định</p>
                          <p><strong>Số tài khoản:</strong> <span className="font-mono font-bold text-[#8C6A48]">1900 8899 6688</span></p>
                          <p><strong>Chủ tài khoản:</strong> CÔNG TY CP NỘI THẤT TK HOUSE</p>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* VNPAY */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start space-x-3.5 transition-all ${
                      form.payment_method === 'vnpay'
                        ? 'border-[#8C6A48] bg-[#FAF6F0] shadow-2xs ring-1 ring-[#8C6A48]'
                        : 'border-[#E8E2D8] hover:bg-neutral-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={form.payment_method === 'vnpay'}
                      onChange={() => setForm({ ...form, payment_method: 'vnpay' })}
                      className="mt-1 accent-[#8C6A48] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-neutral-900">
                            Cổng thanh toán VNPAY (QR Pay, Thẻ ATM, Visa/Master)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          VNPAY Sandbox
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        Chuyển hướng an toàn sang cổng VNPAY. Hỗ trợ quét mã VNPAY-QR từ hơn 30+ app ngân hàng, thẻ ATM nội địa hoặc thẻ quốc tế.
                      </p>

                      {/* Thông tin hỗ trợ khi chọn VNPAY */}
                      {form.payment_method === 'vnpay' && (
                        <div className="mt-3 p-3 bg-white/90 rounded-xl border border-stone-200 text-[11px] text-stone-700 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-blue-700 font-semibold">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Thông tin thẻ ATM Test NCB (Môi trường thử nghiệm):</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg">
                            <div>Ngân hàng: <strong>NCB</strong></div>
                            <div>Số thẻ: <strong className="font-mono text-[#8C6A48]">9704198526191432198</strong></div>
                            <div>Tên chủ thẻ: <strong>NGUYEN VAN A</strong></div>
                            <div>Ngày phát hành: <strong>07/15</strong> (OTP: <strong>123456</strong>)</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* MoMo */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex items-start space-x-3.5 transition-all ${
                      form.payment_method === 'momo'
                        ? 'border-[#8C6A48] bg-[#FAF6F0] shadow-2xs ring-1 ring-[#8C6A48]'
                        : 'border-[#E8E2D8] hover:bg-neutral-50/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={form.payment_method === 'momo'}
                      onChange={() => setForm({ ...form, payment_method: 'momo' })}
                      className="mt-1 accent-[#8C6A48] cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-neutral-900 block">
                        Ví điện tử MoMo
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                        Quét mã thanh toán nhanh chóng qua ứng dụng Ví MoMo trên điện thoại.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cam kết tiêu chuẩn chất lượng */}
              <div className="p-5 rounded-3xl bg-[#F6F2EA] border border-[#E8E2D8] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#8C6A48]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Đặc quyền gia chủ từ TK House Atelier</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-stone-600 font-light">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6A48]" />
                    <span>Bảo hành chính hãng 5 năm</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6A48]" />
                    <span>Vận chuyển & Lắp đặt 0₫</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6A48]" />
                    <span>Đổi trả linh hoạt 30 ngày</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ========================================================
              CỘT PHẢI (COL 5): KHỐI TÓM TẮT ĐƠN HÀNG (ORDER SUMMARY)
             ======================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
                <div className="flex items-center space-x-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#8C6A48]" />
                  <h2 className="font-serif text-base font-semibold text-neutral-900">
                    Đơn Hàng Của Bạn
                  </h2>
                </div>
                <Link
                  to="/gio-hang"
                  className="text-xs text-[#8C6A48] hover:underline font-medium"
                >
                  Sửa giỏ hàng
                </Link>
              </div>

              {/* Danh sách món đồ thu nhỏ */}
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3.5 text-xs pb-3.5 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="relative w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.thumbnail || '/images/placeholder.jpg'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-[#2C241E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                        x{item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate text-xs" title={item.product_name}>
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {item.variant_name || [item.color, item.dimensions].filter(Boolean).join(' • ') || 'Tiêu chuẩn'}
                      </p>
                      <div className="text-[11px] font-mono text-stone-600 mt-0.5">
                        {item.price_display || `${item.price?.toLocaleString('vi-VN')}₫`}
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-neutral-900 text-xs">
                      {item.total_price_display || `${item.total_price?.toLocaleString('vi-VN')}₫`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ô nhập mã Voucher / Ưu đãi */}
              <div className="pt-2">
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã ưu đãi (TKHOUSE10...)"
                      disabled={Boolean(appliedCoupon)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#8C6A48] uppercase tracking-wider font-mono placeholder:normal-case placeholder:font-sans"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  )}
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-500 mt-1.5">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-medium">{appliedCoupon.label}</span>
                    <span className="font-mono font-bold">
                      -{new Intl.NumberFormat('vi-VN').format(appliedCoupon.value)}₫
                    </span>
                  </div>
                )}
              </div>

              {/* Tóm tắt chi phí thanh toán */}
              <div className="pt-4 border-t border-[#F0ECE1] space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>Tạm tính ({selectedSummary.total_items} món):</span>
                  <span className="font-mono text-neutral-900 font-medium">
                    {selectedSummary.total_amount_display}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Vận chuyển toàn quốc:</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10.5px]">
                    Miễn phí
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Lắp đặt & hiệu chỉnh:</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10.5px]">
                    Miễn phí
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Ưu đãi giảm giá ({appliedCoupon.code}):</span>
                    <span className="font-mono font-bold">
                      -{new Intl.NumberFormat('vi-VN').format(appliedCoupon.value)}₫
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-base font-bold text-neutral-900 block">
                      Tổng Thanh Toán:
                    </span>
                    <span className="text-[10px] text-neutral-400 font-light">
                      (Đã bao gồm VAT & dịch vụ trọn gói)
                    </span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#8C6A48]">
                    {finalTotalDisplay}
                  </span>
                </div>
              </div>

              {/* Nút Xác nhận đặt hàng */}
              <div className="pt-2">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="w-full py-4 rounded-2xl bg-[#2C241E] hover:bg-[#8C6A48] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang khởi tạo đơn hàng...</span>
                    </>
                  ) : (
                    <>
                      <span>Xác nhận đặt hàng ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-neutral-400 font-light mt-3 leading-relaxed">
                  Bằng việc bấm xác nhận, quý khách đồng ý với điều khoản dịch vụ & chính sách bảo hành của TK House.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
