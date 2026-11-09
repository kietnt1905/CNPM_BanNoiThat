import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  Calendar,
  CreditCard,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  ShieldCheck,
  Building2,
  PhoneCall,
  User,
  MapPin,
} from 'lucide-react';
import paymentApi from '../api/paymentApi';
import { useCart } from '../context/CartContext';

export default function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Chuyển toàn bộ searchParams thành plain object
  const queryParams = useMemo(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }, [searchParams]);

  useEffect(() => {
    // Nếu không có tham số nào của VNPay trên URL
    if (!queryParams.vnp_ResponseCode && !queryParams.vnp_SecureHash) {
      setLoading(false);
      setError('Không tìm thấy thông tin giao dịch VNPAY trên đường dẫn.');
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.verifyVNPayCallback(queryParams);

        if (res.data) {
          setResult(res.data);
          // Nếu thanh toán thành công, đồng bộ lại giỏ hàng
          if (res.data.status) {
            refreshCart();
            localStorage.removeItem('vnpay_pending_order');
          }
        } else {
          setError('Không nhận được phản hồi hợp lệ từ máy chủ.');
        }
      } catch (err) {
        console.error('VNPay verification error:', err);
        const serverMsg =
          err.response?.data?.message ||
          err.message ||
          'Có lỗi xảy ra trong quá trình xác thực giao dịch với VNPAY.';
        setError(serverMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [queryParams, refreshCart]);

  // Format ngày từ chuỗi VNPAY yyyyMMddHHmmss
  const formatVNPayDate = (dateStr) => {
    if (!dateStr || dateStr.length < 14) return 'Vừa xong';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const min = dateStr.substring(10, 12);
    const sec = dateStr.substring(12, 14);
    return `${hour}:${min}:${sec} - ${day}/${month}/${year}`;
  };

  // 1. MÀN HÌNH ĐANG XỬ LÝ (LOADING)
  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#2C241E]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#E8E2D8] text-center space-y-6"
        >
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#8C6A48]/20 border-t-[#8C6A48] animate-spin" />
            <CreditCard className="w-8 h-8 text-[#8C6A48]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold block">
              VNPAY PAYMENT GATEWAY
            </span>
            <h2 className="font-serif text-2xl font-bold text-neutral-900">
              Đang xác thực giao dịch...
            </h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Hệ thống đang kết nối đối soát dữ liệu bảo mật và cập nhật trạng thái đơn hàng của bạn. Vui lòng không đóng trang.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. MÀN HÌNH LỖI HỆ THỐNG HOẶC CHỮ KÝ BỊ GIẢ MẠO
  if (error || !result) {
    return (
      <div className="min-h-[80vh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#2C241E]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-rose-200 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-rose-50/50">
            <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-600 font-bold block">
              LỖI XÁC THỰC GIAO DỊCH
            </span>
            <h2 className="font-serif text-2xl font-bold text-neutral-900">
              Không thể xác nhận
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {error || 'Có lỗi phát sinh trong quá trình kiểm tra đơn hàng.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/gio-hang"
              className="flex-1 py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors text-center"
            >
              Về giỏ hàng
            </Link>
            <Link
              to="/thanh-toan"
              className="flex-1 py-3 px-5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all text-center shadow-md flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const isSuccess = result.status === true;
  const data = result.data || {};

  // 3. MÀN HÌNH KẾT QUẢ GIAO DỊCH (THÀNH CÔNG HOẶC THẤT BẠI)
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C241E] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-[#E8E2D8] p-8 sm:p-12 text-center space-y-6"
      >
        {/* Icon & Huy hiệu trạng thái */}
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-amber-50/50">
            <XCircle className="w-10 h-10 stroke-[2.2]" />
          </div>
        )}

        <div className="space-y-2">
          <span
            className={`text-[11px] font-mono uppercase tracking-widest font-bold block ${
              isSuccess ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isSuccess ? 'GIAO DỊCH THÀNH CÔNG • VNPAY SECURE' : 'GIAO DỊCH CHƯA HOÀN TẤT'}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            {isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Bị Hủy / Thất Bại'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
            {isSuccess
              ? 'Đơn hàng của bạn đã được thanh toán thành công qua cổng VNPAY. Đội ngũ KTS & kỹ thuật viên TK House sẽ sớm liên hệ xác nhận lịch giao lắp.'
              : result.message || 'Quá trình thanh toán không hoàn tất. Bạn có thể chọn thanh toán lại hoặc sử dụng hình thức nhận hàng trả tiền (COD).'}
          </p>
        </div>

        {/* Khối Hóa đơn Chi tiết Giao dịch */}
        <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E2D8] text-left space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#8C6A48]" />
              Mã đơn hàng:
            </span>
            <span className="font-mono font-bold text-neutral-900 text-sm text-[#8C6A48]">
              {data.order_code || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#8C6A48]" />
              Mã giao dịch VNPAY:
            </span>
            <span className="font-mono font-medium text-neutral-900">
              {data.vnp_transaction_no || 'Không có'}
            </span>
          </div>

          {data.bank_code && (
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#8C6A48]" />
                Ngân hàng / Cổng:
              </span>
              <span className="font-semibold text-neutral-900">
                {data.bank_code} {data.card_type ? `(${data.card_type})` : ''}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8C6A48]" />
              Thời gian:
            </span>
            <span className="font-medium text-neutral-800">
              {formatVNPayDate(data.pay_date)}
            </span>
          </div>

          {data.recipient_name && (
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8C6A48]" />
                Người nhận:
              </span>
              <span className="font-medium text-neutral-900">
                {data.recipient_name} ({data.recipient_phone})
              </span>
            </div>
          )}

          {data.shipping_address && (
            <div className="flex items-start justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8C6A48]" />
                Địa chỉ giao hàng:
              </span>
              <span className="font-medium text-neutral-900 text-right max-w-xs truncate" title={data.shipping_address}>
                {data.shipping_address}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 font-bold text-sm text-neutral-900">
            <span>Tổng số tiền:</span>
            <span className="font-mono text-base text-[#8C6A48]">
              {data.amount_display || (data.amount ? `${Number(data.amount).toLocaleString('vi-VN')}₫` : '0₫')}
            </span>
          </div>
        </div>

        {/* Cam kết tiêu chuẩn TK House */}
        <div className="p-4 rounded-2xl bg-[#F6F2EA] border border-[#E8E2D8] flex items-center justify-between text-xs text-[#8C6A48]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-medium">Bảo mật mã hóa HMAC SHA-512 & VNPAY 3D-Secure</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#E8E2D8]">
            Sandbox Tested
          </span>
        </div>

        {/* Các nút hành động */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isSuccess ? (
            <>
              <Link
                to="/san-pham"
                className="flex-1 py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tiếp tục mua sắm</span>
              </Link>
              <button
                onClick={() => navigate('/don-hang')}
                className="flex-1 py-3 px-5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Xem đơn hàng của tôi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/gio-hang"
                className="flex-1 py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors text-center"
              >
                Quay lại giỏ hàng
              </Link>
              <Link
                to="/thanh-toan"
                className="flex-1 py-3 px-5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử thanh toán lại</span>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
