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
    ExternalLink,
    CreditCard
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
        <footer className="bg-[#2C241E] text-[#D8CFBE] text-xs font-sans border-t border-[#44382F] selection:bg-amber-900/60 selection:text-white">
            {/* 1. KHỐI ĐĂNG KÝ NHẬN BẢN TIN: NỀN BACKGROUND IMAGE NỘI THẤT SANG TRỌNG + OVERLAY TỐI MỜ NÂU ẤM */}
            <div
                className="relative overflow-hidden bg-cover bg-center py-10 sm:py-14 border-b border-[#3D3127]"
                style={{
                    backgroundImage: `url('/images/banners/footer.jpg')`,
                }}
            >
                {/* Lớp phủ overlay màu nâu hạt dẻ trầm ấm */}
                <div className="absolute inset-0 bg-[#241C16]/80 backdrop-blur-[2px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left space-y-1.5 max-w-xl text-[#FAF8F5]">
                            <div className="inline-flex items-center space-x-2 text-[#E6C280] text-xs font-semibold tracking-wider uppercase">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Đặc quyền ưu đãi TK House</span>
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#FAF8F5] font-normal tracking-wide">
                                Đăng ký nhận bản tin & Cảm hứng sống ấm cúng
                            </h3>
                            <p className="text-[#D8CFBE] text-xs sm:text-[13px] font-light leading-relaxed">
                                Nhận ngay voucher ưu đãi <strong className="text-white font-medium">500.000đ</strong> cho đơn hàng đầu tiên và cập nhật sớm nhất các thiết kế Bàn & Ghế mới.
                            </p>
                        </div>

                        <div className="w-full md:w-auto">
                            {isSubscribed ? (
                                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 px-5 py-3 rounded-xl text-xs backdrop-blur-sm shadow-md">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Cảm ơn bạn! Mã ưu đãi đã được gửi vào hòm thư.</span>
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
                                        className="w-full sm:w-72 bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF8F5] placeholder-[#B5A898] px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-[#E6C280] focus:ring-1 focus:ring-[#E6C280] shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-[#FAF8F5] hover:bg-white text-[#2C241E] font-semibold px-6 py-2.5 rounded-full text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
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

            {/* 2. KHỐI 4 CAM KẾT QUYỀN LỢI (NỀN GỖ TRẦM SANG TRỌNG) */}
            <div className="border-b border-[#3D3127] bg-[#231C16] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-[#E0D7CA]">
                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#2E251E] shadow-sm border border-[#483B30] flex items-center justify-center text-[#E6C280] flex-shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider">Bảo hành 24 tháng</p>
                                <p className="text-[11px] text-[#A89C8C]">Cam kết chất lượng chuẩn quốc tế</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#2E251E] shadow-sm border border-[#483B30] flex items-center justify-center text-[#E6C280] flex-shrink-0">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider">Đổi trả trong 7 ngày</p>
                                <p className="text-[11px] text-[#A89C8C]">Hỗ trợ nhanh chóng & linh hoạt</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#2E251E] shadow-sm border border-[#483B30] flex items-center justify-center text-[#E6C280] flex-shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider">Miễn phí giao hàng</p>
                                <p className="text-[11px] text-[#A89C8C]">Vận chuyển & lắp đặt tại nhà</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#2E251E] shadow-sm border border-[#483B30] flex items-center justify-center text-[#E6C280] flex-shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider">Thiết kế 3D miễn phí</p>
                                <p className="text-[11px] text-[#A89C8C]">Tư vấn phối cảnh bởi chuyên gia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN FOOTER CONTENT - 4 CỘT THÔNG TIN (TÔNG NÂU GỖ TRẦM ẤM ÁP) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* CỘT 1: Thương hiệu TK House & Liên hệ */}
                    <div className="space-y-4">
                        <Link
                            to="/"
                            className="group inline-block border-2 border-[#D8CFBE]/80 px-4 py-1.5 transition-all duration-300 hover:border-[#FAF8F5] hover:bg-white/10 rounded"
                        >
                            <span className="font-serif text-xl font-bold tracking-[0.25em] text-[#FAF8F5] uppercase select-none transition-colors">
                                TK House
                            </span>
                        </Link>

                        <p className="text-[12px] leading-relaxed text-[#D8CFBE] font-light">
                            TK House là thương hiệu nội thất cao cấp, chuyên tâm kiến tạo những tuyệt tác Bàn & Ghế mang phong cách Japandi và Hiện đại ấm cúng, nâng niu từng phút giây sum vầy gia đình.
                        </p>

                        <div className="space-y-2.5 pt-2 text-xs">
                            <div className="flex items-start space-x-2.5">
                                <Phone className="w-4 h-4 text-[#E6C280] mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-[#A89C8C] block text-[11px]">Tổng đài tư vấn (8:30 - 21:00)</span>
                                    <a
                                        href="tel:18007200"
                                        className="text-[#FAF8F5] font-bold text-sm hover:text-[#E6C280] transition-colors"
                                    >
                                        1800 7200
                                    </a>{' '}
                                    <span className="text-[10px] text-amber-200 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/80 font-medium">
                                        Miễn cước
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2.5">
                                <Mail className="w-4 h-4 text-[#E6C280] flex-shrink-0" />
                                <a
                                    href="mailto:TKhousecare@gmail.com"
                                    className="text-[#D8CFBE] hover:text-[#FAF8F5] transition-colors font-medium"
                                >
                                    TKhousecare@gmail.com
                                </a>
                            </div>

                            <div className="flex items-start space-x-2.5">
                                <Clock className="w-4 h-4 text-[#E6C280] mt-0.5 flex-shrink-0" />
                                <span className="text-[#D8CFBE]">
                                    Mở cửa: 8:30 - 21:00 (Tất cả các ngày trong tuần)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CỘT 2: Danh mục chuyên sâu Bàn & Ghế */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-[#FAF8F5] uppercase border-b border-[#3D3127] pb-2">
                            Danh mục Bàn & Ghế
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#D8CFBE]">
                            <li>
                                <Link to="/san-pham?category=ban-an" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Bàn ăn mặt đá Ceramic & Bàn ăn gỗ sồi
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham?category=sofa" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Sofa da tự nhiên & Sofa vải dệt cao cấp
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham?category=ban-tra" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Bàn trà đôi phòng khách & Bàn tròn mặt đá
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham?category=ghe-thu-gian" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Ghế thư giãn - Bành Armchair đọc sách
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham?category=ban-lam-viec" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Bàn làm việc thông minh & Ghế công thái học
                                </Link>
                            </li>
                            <li>
                                <Link to="/san-pham?category=ghe-an" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Ghế ăn bọc đệm êm ái & Ghế tựa mây duyên dáng
                                </Link>
                            </li>
                            <li>
                                <Link to="/bo-suu-tap" className="text-[#E6C280] hover:text-[#f3d9a8] font-semibold inline-block transition-colors">
                                    Khám phá 6 Bộ sưu tập độc bản 2026 →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 3: Chính sách đổi trả & bảo hành */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-[#FAF8F5] uppercase border-b border-[#3D3127] pb-2">
                            Chính sách & Dịch vụ
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#D8CFBE]">
                            <li>
                                <Link to="/chinh-sach-bao-hanh" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Chính sách bảo hành 24 tháng chính hãng
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-doi-tra" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Chính sách đổi trả linh hoạt trong 7 ngày
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-giao-hang" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Miễn phí vận chuyển & lắp đặt tại nhà
                                </Link>
                            </li>
                            <li>
                                <Link to="/thiet-ke-noi-that" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Tư vấn phối cảnh không gian 3D miễn phí
                                </Link>
                            </li>
                            <li>
                                <Link to="/huong-dan-thanh-toan" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Hướng dẫn mua hàng & trả góp 0% lãi suất
                                </Link>
                            </li>
                            <li>
                                <Link to="/chinh-sach-bao-mat" className="hover:text-[#FAF8F5] hover:translate-x-1 inline-block transition-all duration-150">
                                    Cam kết nguồn gốc gỗ & da đạt chuẩn quốc tế
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 4: Kết nối, Phương thức thanh toán & Showroom nhỏ gọn */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-[#FAF8F5] uppercase border-b border-[#3D3127] pb-2">
                            Hệ thống Showroom & Kết nối
                        </h4>

                        <div className="space-y-3 text-[11.5px] leading-relaxed">
                            {/* Thẻ 1: Showroom Phan Huy Ích */}
                            <div className="p-3 rounded-xl bg-[#231C16] border border-[#483B30] hover:border-[#735A47] transition-colors shadow-sm">
                                <p className="font-medium text-[#FAF8F5] flex items-center space-x-1.5 mb-1 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-[#E6C280] flex-shrink-0" />
                                    <span>Showroom Phan Huy Ích</span>
                                </p>
                                <p className="text-[#C8BDAE] text-[11.5px] leading-relaxed">
                                    Phan Huy Ích, P.14, Q.Gò Vấp, TP.HCM
                                </p>
                                <p className="text-[#A89C8C] text-[11px] mt-0.5">
                                    Hotline: 1800 7200 (8:30 - 21:00)
                                </p>
                            </div>

                            {/* Thẻ 2: Showroom Nguyễn Sáng */}
                            <div className="p-3 rounded-xl bg-[#231C16] border border-[#483B30] hover:border-[#735A47] transition-colors shadow-sm">
                                <p className="font-medium text-[#FAF8F5] flex items-center space-x-1.5 mb-1 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-[#E6C280] flex-shrink-0" />
                                    <span>Showroom Nguyễn Sáng</span>
                                </p>
                                <p className="text-[#C8BDAE] text-[11.5px] leading-relaxed">
                                    Nguyễn Sáng, P.Tây Thạnh, Q.Tân Phú, TP.HCM
                                </p>
                                <p className="text-[#A89C8C] text-[11px] mt-0.5">
                                    Hotline: 1800 7200 (8:30 - 21:00)
                                </p>
                            </div>

                            {/* Phương thức thanh toán an toàn */}
                            <div className="pt-1 space-y-1.5">
                                <span className="text-[11px] text-[#A89C8C] block">Phương thức thanh toán an toàn:</span>
                                <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                                    <span className="px-2 py-0.5 bg-[#231C16] border border-[#483B30] rounded text-[#D8CFBE]">Visa</span>
                                    <span className="px-2 py-0.5 bg-[#231C16] border border-[#483B30] rounded text-[#D8CFBE]">Mastercard</span>
                                    <span className="px-2 py-0.5 bg-[#231C16] border border-[#483B30] rounded text-[#D8CFBE]">VNPay</span>
                                    <span className="px-2 py-0.5 bg-[#231C16] border border-[#483B30] rounded text-[#D8CFBE]">MoMo</span>
                                    <span className="px-2 py-0.5 bg-[#231C16] border border-[#483B30] rounded text-[#E6C280] font-medium">Trả góp 0%</span>
                                </div>
                            </div>

                            <div className="pt-1">
                                <Link
                                    to="/showroom"
                                    className="inline-flex items-center space-x-1 text-xs text-[#E6C280] hover:text-[#f3d9a8] font-semibold transition-colors"
                                >
                                    <span>Xem chỉ đường & 12+ showroom</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. DÒNG BẢN QUYỀN CUỐI TRANG (NỀN GỖ ĐẬM TỐI GIẢN) */}
            <div className="border-t border-[#382E25] bg-[#1C1612] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-[#9E9182]">
                        <div>
                            <p className="text-[#C8BDAE]">
                                © 2026 <strong className="text-[#FAF8F5] font-semibold">Nội Thất TK House</strong>. Tất cả quyền được bảo lưu.
                            </p>
                            <p className="text-[#9E9182] mt-0.5">
                                Hệ thống Website Bán Nội Thất Cao Cấp Chuyên Biệt Bàn & Ghế (Japandi / Modern Cozy Style).
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 text-[#9E9182] text-xs">
                            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
                                Điều khoản sử dụng
                            </span>
                            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
                                Chính sách bảo mật
                            </span>
                            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
                                Sơ đồ website
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
