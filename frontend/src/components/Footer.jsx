import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    Mail,
    Clock,
    MapPin,
    ShieldCheck,
    RefreshCw,
    Truck,
    Sparkles,
    Send,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';

export default function Footer() {
    const [emailSub, setEmailSub] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (emailSub.trim()) {
            setIsSubscribed(true);
            setEmailSub('');
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    return (
        <footer className="bg-neutral-950 text-neutral-300 text-xs font-sans border-t border-neutral-800">
            {/* 1. KHỐI ĐĂNG KÝ NHẬN BẢN TIN: NỀN BACKGROUND IMAGE NỘI THẤT SANG TRỌNG + OVERLAY TỐI MỜ */}
            <div
                className="relative overflow-hidden bg-cover bg-center py-10 sm:py-14 border-b border-neutral-800"
                style={{
                    backgroundImage: `url('/images/banners/footer.jpg')`,
                }}
            >
                {/* Lớp phủ overlay tối nhẹ mờ (bg-neutral-950/65) */}
                <div className="absolute inset-0 bg-neutral-950/65 backdrop-blur-[1px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left space-y-1.5 max-w-xl text-white">
                            <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Đặc quyền ưu đãi TK House</span>
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-medium tracking-wide">
                                Đăng ký nhận bản tin & Cảm hứng sống mới
                            </h3>
                            <p className="text-neutral-200 text-xs sm:text-[13px] font-light leading-relaxed">
                                Nhận ngay voucher <strong className="text-white font-semibold">500.000đ</strong> cho đơn hàng đầu tiên và cập nhật sớm nhất các bộ sưu tập giới hạn.
                            </p>
                        </div>

                        <div className="w-full md:w-auto">
                            {isSubscribed ? (
                                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 px-5 py-3 rounded text-xs backdrop-blur-sm shadow-md">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Cảm ơn bạn! Ưu đãi đã được gửi vào hòm thư.</span>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubscribe}
                                    className="flex flex-col sm:flex-row items-center w-full max-w-md gap-2"
                                >
                                    <input
                                        type="email"
                                        required
                                        placeholder="Nhập địa chỉ email của bạn..."
                                        value={emailSub}
                                        onChange={(e) => setEmailSub(e.target.value)}
                                        className="w-full sm:w-72 bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-neutral-300 px-4 py-2.5 text-xs rounded focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-6 py-2.5 rounded text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
                                    >
                                        <span>ĐĂNG KÝ</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KHỐI 4 CAM KẾT QUYỀN LỢI (NỀN ĐEN TRẦM SANG TRỌNG) */}
            <div className="border-b border-neutral-800/80 bg-[#0d0e10] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-neutral-200">
                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 shadow-sm border border-neutral-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Bảo hành 24 tháng</p>
                                <p className="text-[11px] text-neutral-400">Cam kết chất lượng chuẩn quốc tế</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 shadow-sm border border-neutral-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Đổi trả trong 7 ngày</p>
                                <p className="text-[11px] text-neutral-400">Hỗ trợ nhanh chóng & linh hoạt</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 shadow-sm border border-neutral-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Miễn phí giao hàng</p>
                                <p className="text-[11px] text-neutral-400">Vận chuyển & lắp đặt tại nhà</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 shadow-sm border border-neutral-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">Thiết kế 3D miễn phí</p>
                                <p className="text-[11px] text-neutral-400">Đội ngũ kiến trúc sư chuyên gia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN FOOTER CONTENT - 4 CỘT THÔNG TIN (TÔNG MÀU XÁM THAN CHÌ #2b2d32) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* CỘT 1: Thương hiệu TK House & Liên hệ */}
                    <div className="space-y-4">
                        {/* Logo TK House viền hộp chữ nhật tối giản */}
                        <Link
                            to="/"
                            className="group inline-block border-2 border-neutral-300 px-4 py-1.5 transition-all duration-300 hover:border-white hover:bg-white/10"
                        >
                            <span className="font-serif text-xl font-bold tracking-[0.25em] text-white uppercase select-none transition-colors">
                                TK House
                            </span>
                        </Link>

                        <p className="text-[12px] leading-relaxed text-neutral-300 font-light">
                            TK House là thương hiệu nội thất hàng đầu Việt Nam, kiến tạo không gian sống thanh lịch, tiện nghi và đậm chất nghệ thuật đương đại từ năm 1999.
                        </p>

                        <div className="space-y-2.5 pt-2 text-xs">
                            <div className="flex items-start space-x-2.5">
                                <Phone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-neutral-400 block text-[11px]">Tổng đài tư vấn (8:30 - 21:00)</span>
                                    <a
                                        href="tel:18007200"
                                        className="text-white font-bold text-sm hover:text-amber-300 transition-colors"
                                    >
                                        1800 7200
                                    </a>{' '}
                                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 font-medium">
                                        Miễn cước
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2.5">
                                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <a
                                    href="mailto:TKhousecare@gmail.com"
                                    className="text-neutral-200 hover:text-white transition-colors font-medium"
                                >
                                    TKhousecare@gmail.com
                                </a>
                            </div>

                            <div className="flex items-start space-x-2.5">
                                <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <span className="text-neutral-300">
                                    Mở cửa: 8:30 - 21:00 (Tất cả các ngày trong tuần)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CỘT 2: Danh mục nội thất */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase border-b border-neutral-800 pb-2">
                            Danh mục nội thất
                        </h4>
                        <ul className="space-y-2.5 text-xs text-neutral-300">
                            <li>
                                <Link to="/san-pham/sofa-da" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Sofa da & Ghế thư giãn cao cấp
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham/ban-an" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Bàn ăn & Bàn trà phòng khách
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham/giuong-ngu" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Giường ngủ gỗ & Tab đầu giường
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham/tu-ao" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Tủ quần áo & Kệ tivi đương đại
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham/den-trang-tri" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Đèn nghệ thuật & Bình hoa trang trí
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham/tham-trai-san" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Thảm trải sàn dệt tay tự nhiên
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham-moi" className="text-amber-400 hover:text-amber-300 font-semibold inline-block transition-colors">
                                    Bộ sưu tập mới nhất 2026 →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 3: Chính sách & Bảo hành */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase border-b border-neutral-800 pb-2">
                            Chính sách & Dịch vụ
                        </h4>
                        <ul className="space-y-2.5 text-xs text-neutral-300">
                            <li>
                                <Link to="/chinh-sach-bao-hanh" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Chính sách bảo hành 24 tháng chính hãng
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-doi-tra" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Chính sách đổi trả trong vòng 7 ngày
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-giao-hang" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Miễn phí giao hàng & lắp đặt tận nơi
                                </Link>
                            </li>
                            <li>
                                <Link to="/#thiet-ke-noi-that" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Tư vấn & thiết kế nội thất 3D toàn diện
                                </Link>
                            </li>
                            <li>
                                <Link to="/huong-dan-thanh-toan" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Hướng dẫn mua hàng & thanh toán trả góp 0%
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-bao-mat" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-150">
                                    Chính sách bảo mật thông tin khách hàng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 4: Hệ thống Showroom & Giờ mở cửa */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase border-b border-neutral-800 pb-2">
                            Hệ thống Showroom TK House
                        </h4>

                        <div className="space-y-3 text-[11.5px] leading-relaxed">
                            {/* Thẻ 1: Showroom Phan Huy Ích (Nền đen trầm sang trọng đồng bộ) */}
                            <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm">
                                <p className="font-semibold text-white flex items-center space-x-1.5 mb-1 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <span>Showroom Phan Huy Ích</span>
                                </p>
                                <p className="text-neutral-300 text-[11.5px] leading-relaxed">
                                    Đường Phan Huy Ích, Phường 14, Quận Gò Vấp, TP.HCM
                                </p>
                                <p className="text-neutral-400 text-[11px] mt-1">
                                    Hotline: 1800 7200 (Mở cửa: 8:30 - 21:00)
                                </p>
                            </div>

                            {/* Thẻ 2: Showroom Nguyễn Sáng (Nền đen trầm sang trọng đồng bộ) */}
                            <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm">
                                <p className="font-semibold text-white flex items-center space-x-1.5 mb-1 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <span>Showroom Nguyễn Sáng</span>
                                </p>
                                <p className="text-neutral-300 text-[11.5px] leading-relaxed">
                                    Đường Nguyễn Sáng, Phường Tây Thạnh, Quận Tân Phú, TP.HCM
                                </p>
                                <p className="text-neutral-400 text-[11px] mt-1">
                                    Hotline: 1800 7200 (Mở cửa: 8:30 - 21:00)
                                </p>
                            </div>

                            <div className="pt-1">
                                <Link
                                    to="/showroom"
                                    className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                                >
                                    <span>Xem chỉ đường và 12+ showroom toàn quốc</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. DÒNG BẢN QUYỀN CUỐI TRANG (NỀN ĐEN TUYỀN) */}
            <div className="border-t border-neutral-900 bg-black py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-neutral-400">
                        <div>
                            <p className="text-neutral-300">
                                © 2026 <strong className="text-white font-semibold">Nội Thất TK House</strong>. Tất cả quyền được bảo lưu.
                            </p>
                            <p className="text-neutral-400 mt-0.5">
                                Đồ án Chuyên ngành: Hệ thống Website Bán Nội Thất Cao Cấp (React + Vite + Tailwind CSS).
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 text-neutral-400 text-xs">
                            <span className="hover:text-white transition-colors cursor-pointer">
                                Điều khoản sử dụng
                            </span>
                            <span className="hover:text-white transition-colors cursor-pointer">
                                Chính sách bảo mật
                            </span>
                            <span className="hover:text-white transition-colors cursor-pointer">
                                Sơ đồ website
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
