import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authApi from '../api/authApi';
import {
    Eye,
    EyeOff,
    ArrowLeft,
    Check,
    Mail,
    User as UserIcon,
    Phone,
    ShieldCheck,
    ArrowRight,
    Lock,
    Sparkles,
    Info
} from 'lucide-react';

export default function AuthPage({ defaultMode = 'login' }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const modeParam = searchParams.get('mode');

    // true: Đăng nhập, false: Đăng ký
    const [isLogin, setIsLogin] = useState(
        modeParam === 'register' ? false : defaultMode === 'register' ? false : true
    );

    // Sync query param & handle Google token callback
    useEffect(() => {
        if (modeParam === 'register') {
            setIsLogin(false);
        } else if (modeParam === 'login') {
            setIsLogin(true);
        }

        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            authApi.getProfile()
                .then((res) => {
                    if (res.data?.status) {
                        localStorage.setItem('user', JSON.stringify(res.data.data));
                        window.dispatchEvent(new Event('auth-change'));
                    }
                    navigate('/');
                })
                .catch(() => navigate('/'));
        }
    }, [modeParam, searchParams, navigate]);

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Feedback & loading
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    // OTP Modal states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpFeedback, setOtpFeedback] = useState(null);

    // Form inputs state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        rememberMe: true,
        agreeTerms: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Password strength evaluator (0 to 3)
    const getPasswordStrength = () => {
        const pass = formData.password;
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 9) score += 1;
        if (/[A-Z]/.test(pass) || /[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const passwordScore = getPasswordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedbackMessage(null);

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setIsLoading(false);
                setFeedbackMessage({
                    type: 'error',
                    text: 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.',
                });
                return;
            }

            try {
                const response = await authApi.register(formData);
                setIsLoading(false);
                setOtpEmail(formData.email);
                setShowOtpModal(true);
                setFeedbackMessage({
                    type: 'success',
                    text: response.data.message || 'Đăng ký thành công! Vui lòng nhập mã OTP.',
                });
            } catch (err) {
                setIsLoading(false);
                const msg = err.response?.data?.message || 'Đăng ký thất bại.';
                const fieldErrors = err.response?.data?.errors;
                const detail = fieldErrors ? Object.values(fieldErrors).flat().join(' ') : '';
                setFeedbackMessage({
                    type: 'error',
                    text: `${msg} ${detail}`,
                });
            }
        } else {
            try {
                const response = await authApi.login({
                    email: formData.email,
                    password: formData.password,
                });
                setIsLoading(false);
                if (response.data.status) {
                    const { access_token, user } = response.data.data;
                    localStorage.setItem('token', access_token);
                    localStorage.setItem('user', JSON.stringify(user));
                    window.dispatchEvent(new Event('auth-change'));
                    setFeedbackMessage({
                        type: 'success',
                        text: 'Đăng nhập thành công! Đang chuyển hướng...',
                    });
                    setTimeout(() => navigate('/'), 800);
                }
            } catch (err) {
                setIsLoading(false);
                if (err.response?.status === 403 && err.response?.data?.need_verification) {
                    setOtpEmail(formData.email);
                    setShowOtpModal(true);
                    setFeedbackMessage({
                        type: 'error',
                        text: 'Tài khoản chưa xác thực. Vui lòng nhập mã OTP!',
                    });
                } else {
                    setFeedbackMessage({
                        type: 'error',
                        text: err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.',
                    });
                }
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setOtpFeedback(null);
        try {
            const response = await authApi.verifyOtp({ email: otpEmail, otp: otpCode });
            setOtpLoading(false);
            if (response.data.status) {
                const { access_token, user } = response.data.data;
                localStorage.setItem('token', access_token);
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('auth-change'));
                setOtpFeedback({ type: 'success', text: 'Xác thực OTP thành công! Đang chuyển hướng...' });
                setTimeout(() => {
                    setShowOtpModal(false);
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            setOtpLoading(false);
            setOtpFeedback({
                type: 'error',
                text: err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.',
            });
        }
    };

    const handleResendOtp = async () => {
        setOtpLoading(true);
        try {
            const response = await authApi.resendOtp({ email: otpEmail });
            setOtpLoading(false);
            setOtpFeedback({ type: 'success', text: response.data.message || 'Đã gửi lại mã OTP!' });
        } catch (err) {
            setOtpLoading(false);
            setOtpFeedback({ type: 'error', text: err.response?.data?.message || 'Không thể gửi lại mã OTP.' });
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#222222] font-sans selection:bg-[#8C6A48] selection:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative">
            {/* Architectural Sub-grid Background Accent */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cfc6b8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* =========================================================================
                1. TOP COMPACT HEADER
            ========================================================================= */}
            <header className="relative z-10 w-full max-w-[1040px] mx-auto flex items-center justify-between py-2 border-b border-[#E5DFD5] mb-4 sm:mb-6">
                <Link to="/" className="inline-flex items-center space-x-2.5 group">
                    <img
                        src="/images/logo/logo.png"
                        alt="TK House Icon"
                        className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="flex flex-col">
                        <span className="font-serif text-sm sm:text-base font-semibold tracking-wide text-stone-900 uppercase leading-none">
                            TK HOUSE
                        </span>
                        <span className="text-[8.5px] tracking-[0.2em] text-[#8C6A48] uppercase font-semibold mt-0.5">
                            KIẾN TRÚC & NỘI THẤT CAO CẤP
                        </span>
                    </div>
                </Link>

                <div className="flex items-center space-x-4 sm:space-x-6 text-xs text-stone-600 font-medium">
                    <span className="hidden sm:inline text-stone-500">
                        Hotline KTS: <strong className="text-stone-800 font-semibold">1800 7200</strong>
                    </span>

                    <Link
                        to="/"
                        className="inline-flex items-center space-x-1.5 bg-white hover:bg-stone-900 hover:text-white transition-all border border-[#E5DFD5] px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-800 shadow-sm"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Về trang chủ</span>
                    </Link>
                </div>
            </header>

            {/* =========================================================================
                2. MAIN COMPACT SPLIT CARD (KHUNG CARD TRẮNG CỐ ĐỊNH KÍCH THƯỚC CHUẨN)
            ========================================================================= */}
            <div className="relative z-10 w-full max-w-[1040px] mx-auto bg-white rounded-2xl border border-[#E5DFD5] shadow-[0_15px_40px_-10px_rgba(40,32,25,0.07)] overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12 lg:h-[610px]">
                {/* -------------------------------------------------------------
                    CỘT TRÁI (5 Cột): Khung Ảnh Fade Nhẹ Nhàng Bằng AnimatePresence
                ------------------------------------------------------------- */}
                <div className="hidden lg:block lg:col-span-5 relative bg-stone-900 overflow-hidden h-full">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={isLogin ? 'living' : 'dining'}
                            src={isLogin ? '/images/lookbook/lookbook-living.jpg' : '/images/lookbook/lookbook-dining.jpg'}
                            alt="TK House Architectural Interior"
                            initial={{ opacity: 0.6, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0.6 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full h-full object-cover object-center absolute inset-0"
                        />
                    </AnimatePresence>

                    {/* Gradient phủ nhẹ để tăng chiều sâu và dễ đọc chữ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-stone-950/40 pointer-events-none" />

                    {/* Architectural Top Stamp */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/90 z-10">
                        <span className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded text-[9.5px] font-mono tracking-widest text-[#E6C687] uppercase border border-white/15">
                            <Sparkles className="w-3 h-3 text-[#E6C687]" />
                            <span>TK HOUSE ATELIER</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">EST. 2026</span>
                    </div>

                    {/* Architectural Bottom Quote */}
                    <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'living-quote' : 'dining-quote'}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#E6C687] font-semibold block mb-1.5">
                                    {isLogin ? 'CONTEMPORARY LIVING' : 'SIGNATURE BANQUET'}
                                </span>
                                <h3 className="font-serif text-lg font-light text-white leading-snug drop-shadow-sm mb-3">
                                    {isLogin
                                        ? '“Kiến tạo sự cân bằng hoàn mỹ giữa ánh sáng tự nhiên và chất liệu mộc mạc.”'
                                        : '“Nơi mỗi đường nét kiến trúc đều tôn vinh cảm xúc an yên của gia đình.”'}
                                </h3>
                            </motion.div>
                        </AnimatePresence>

                        {/* Điểm nhấn tối giản */}
                        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-stone-300">
                            <span>Thiết kế may đo độc bản</span>
                            <span className="text-[#E6C687] font-mono">Bảo hành 10 năm</span>
                        </div>
                    </div>
                </div>

                {/* -------------------------------------------------------------
                    CỘT PHẢI (7 Cột): Form Giữ Ổn Định Chiều Cao, Không Co Giật
                ------------------------------------------------------------- */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white h-full overflow-y-auto">
                    <div>
                        {/* Title Header */}
                        <div className="mb-5">
                            <div className="flex items-center space-x-1.5 text-[10px] font-bold tracking-[0.2em] text-[#8C6A48] uppercase mb-1">
                                <Lock className="w-3 h-3 text-[#8C6A48]" />
                                <span>CỔNG THÀNH VIÊN TK HOUSE</span>
                            </div>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isLogin ? 'header-login' : 'header-register'}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                >
                                    <h2 className="font-serif text-2xl sm:text-[26px] font-normal text-stone-900 tracking-tight">
                                        {isLogin ? 'Đăng nhập tài khoản' : 'Đăng ký hồ sơ mới'}
                                    </h2>
                                    <p className="text-stone-500 text-xs font-light mt-1">
                                        {isLogin
                                            ? 'Chào mừng Quý khách quay trở lại với không gian sống TK House.'
                                            : 'Trở thành thành viên để lưu giữ thiết kế yêu thích và nhận tư vấn KTS.'}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* =====================================================
                            4. THANH GẠCH CHÂN CỦA TAB VỚI layoutId="auth-tab-indicator"
                        ===================================================== */}
                        <div className="grid grid-cols-2 border-b border-stone-200 mb-5 relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setFeedbackMessage(null);
                                }}
                                className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider transition-colors duration-200 relative text-center uppercase cursor-pointer select-none ${isLogin
                                        ? 'text-stone-900'
                                        : 'text-stone-400 hover:text-stone-700'
                                    }`}
                            >
                                <span>Đăng nhập</span>
                                {isLogin && (
                                    <motion.div
                                        layoutId="auth-tab-indicator"
                                        className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#8C6A48]"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 320,
                                            damping: 28,
                                        }}
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setFeedbackMessage(null);
                                }}
                                className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider transition-colors duration-200 relative text-center uppercase cursor-pointer select-none ${!isLogin
                                        ? 'text-stone-900'
                                        : 'text-stone-400 hover:text-stone-700'
                                    }`}
                            >
                                <span>Đăng ký mới</span>
                                {!isLogin && (
                                    <motion.div
                                        layoutId="auth-tab-indicator"
                                        className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#8C6A48]"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 320,
                                            damping: 28,
                                        }}
                                    />
                                )}
                            </button>
                        </div>

                        {/* Feedback Alert */}
                        {feedbackMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mb-4 p-3 rounded-lg text-xs flex items-center space-x-2 ${
                                    feedbackMessage.type === 'error'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : feedbackMessage.type === 'info'
                                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                            >
                                {feedbackMessage.type === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
                                {feedbackMessage.type === 'info' && <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />}
                                <span>{feedbackMessage.text}</span>
                            </motion.div>
                        )}

                        {/* =====================================================
                            3. HIỆU ỨNG NỘI DUNG FORM (FADE MƯỢT KHÔNG CO GIẬT)
                        ===================================================== */}
                        <div className="min-h-[360px]">
                            <AnimatePresence mode="wait" initial={false}>
                                {isLogin ? (
                                    /* ================= FORM ĐĂNG NHẬP ================= */
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 6 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                    >
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                                                Email tài khoản <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="name@example.com"
                                                    className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] rounded-lg py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                />
                                                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[10.5px] font-semibold text-stone-700 uppercase tracking-wider">
                                                    Mật khẩu truy cập <span className="text-red-500">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => alert('Vui lòng kiểm tra email để thiết lập lại mật khẩu.')}
                                                    className="text-[11px] text-[#8C6A48] hover:text-stone-950 transition-colors font-medium hover:underline cursor-pointer"
                                                >
                                                    Quên mật khẩu?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="••••••••"
                                                    className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] rounded-lg py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center pt-0.5">
                                            <label className="inline-flex items-center space-x-2 text-xs text-stone-600 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    checked={formData.rememberMe}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-[#8C6A48] accent-stone-900 cursor-pointer"
                                                />
                                                <span>Ghi nhớ phiên đăng nhập trên thiết bị này</span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-[#1C1917] hover:bg-[#8C6A48] text-white font-medium py-3 rounded-lg transition-colors duration-200 text-xs sm:text-sm tracking-wider uppercase disabled:opacity-75 disabled:cursor-not-allowed mt-2 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                                        >
                                            {isLoading ? (
                                                <span>Đang xác thực...</span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-2">
                                                    <span>Đăng nhập tài khoản</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                    /* ================= FORM ĐĂNG KÝ ================= */
                                    <motion.div
                                        key="register"
                                        initial={{ opacity: 0, x: 6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                    >
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                                                Họ và tên Quý khách <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="Nguyễn Văn A"
                                                    className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] rounded-lg py-2 pl-3.5 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                />
                                                <UserIcon className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="name@example.com"
                                                    className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] rounded-lg py-2 px-3 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="0901 234 567"
                                                    className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] rounded-lg py-2 px-3 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                                                    Mật khẩu <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        required
                                                        minLength={6}
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="Tối thiểu 6 ký tự"
                                                        className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] rounded-lg py-2 pl-3 pr-8 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                                    >
                                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                                                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        required
                                                        minLength={6}
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="Nhập lại mật khẩu"
                                                        className="w-full bg-[#FAF8F5] focus:bg-white border border-[#E2DDD5] focus:border-[#8C6A48] rounded-lg py-2 pl-3 pr-8 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.password && (
                                            <div className="flex items-center space-x-1.5">
                                                <div className="flex-1 grid grid-cols-3 gap-1 h-1">
                                                    <div className={`rounded-full transition-all ${passwordScore >= 1 ? (passwordScore === 1 ? 'bg-rose-500' : 'bg-amber-500') : 'bg-stone-200'}`} />
                                                    <div className={`rounded-full transition-all ${passwordScore >= 2 ? (passwordScore === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-stone-200'}`} />
                                                    <div className={`rounded-full transition-all ${passwordScore >= 3 ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                                                </div>
                                                <span className="text-[10px] text-stone-500">
                                                    Độ mạnh: {passwordScore === 1 ? 'Yếu' : passwordScore === 2 ? 'Khá' : 'Tốt'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="pt-0.5">
                                            <label className="inline-flex items-start space-x-2 text-[11px] text-stone-600 cursor-pointer select-none leading-relaxed">
                                                <input
                                                    type="checkbox"
                                                    name="agreeTerms"
                                                    required
                                                    checked={formData.agreeTerms}
                                                    onChange={handleChange}
                                                    className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-[#8C6A48] accent-stone-900 cursor-pointer mt-0.5"
                                                />
                                                <span>
                                                    Tôi đồng ý với{' '}
                                                    <a href="#dieu-khoan" className="text-stone-900 underline hover:text-[#8C6A48]">
                                                        Điều khoản dịch vụ
                                                    </a>{' '}
                                                    và{' '}
                                                    <a href="#bao-mat" className="text-stone-900 underline hover:text-[#8C6A48]">
                                                        Chính sách bảo mật
                                                    </a>
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-[#1C1917] hover:bg-[#8C6A48] text-white font-medium py-2.5 rounded-lg transition-colors duration-200 text-xs sm:text-sm tracking-wider uppercase disabled:opacity-75 disabled:cursor-not-allowed mt-1 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                                        >
                                            {isLoading ? (
                                                <span>Đang đăng ký...</span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-2">
                                                    <span>Đăng ký tài khoản</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#E8E2D7]" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-white px-3 text-stone-400 tracking-wider">
                                    hoặc tiếp tục với
                                </span>
                            </div>
                        </div>

                        {/* Social Buttons (Google & Facebook bên dưới) */}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="border border-[#E2DDD5] hover:border-stone-400 bg-[#FAF8F5] hover:bg-white transition-colors rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-stone-700 shadow-sm cursor-pointer"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFeedbackMessage({
                                    type: 'info',
                                    text: 'Tính năng đăng nhập qua Facebook đang trong quá trình phát triển & hoàn thiện. Quý khách vui lòng sử dụng Google hoặc Email/Mật khẩu!',
                                })}
                                className="border border-[#E2DDD5] hover:border-stone-400 bg-[#FAF8F5] hover:bg-white transition-colors rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-stone-700 shadow-sm cursor-pointer relative"
                            >
                                <svg className="w-4 h-4 flex-shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                                <span className="text-[9px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-normal leading-none">
                                    Sắp có
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Footer Switch */}
                    <div className="pt-3 border-t border-stone-100 text-center">
                        <p className="text-xs text-stone-500">
                            {isLogin ? 'Chưa có tài khoản TK House? ' : 'Đã có tài khoản thành viên? '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setFeedbackMessage(null);
                                }}
                                className="font-semibold text-stone-900 hover:text-[#8C6A48] transition-colors underline underline-offset-4 cursor-pointer"
                            >
                                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================================
                3. BOTTOM FOOTER
            ========================================================================= */}
            <footer className="relative z-10 w-full max-w-[1040px] mx-auto flex flex-col sm:flex-row items-center justify-between py-2 text-[11px] text-stone-500 border-t border-[#E5DFD5] gap-2 mt-4">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bảo mật dữ liệu chuẩn mã hóa SSL 256-bit</span>
                </div>
                <span>© 2026 TK HOUSE — NỘI THẤT & THIẾT KẾ KIẾN TRÚC CAO CẤP</span>
            </footer>

            {/* =========================================================================
                4. POPUP XÁC THỰC MÃ OTP
            ========================================================================= */}
            <AnimatePresence>
                {showOtpModal && (
                    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl p-6 sm:p-8 max-w-md w-full relative"
                        >
                            <h3 className="font-serif text-xl font-semibold text-stone-900 mb-1">
                                Xác thực mã OTP
                            </h3>
                            <p className="text-xs text-stone-600 mb-4">
                                Mã OTP 6 chữ số đã được gửi tới email <strong className="text-stone-900">{otpEmail}</strong>. (Trường hợp dev local, xem mã tại <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">backend/storage/logs/laravel.log</code>).
                            </p>

                            {otpFeedback && (
                                <div className={`mb-4 p-3 rounded-lg text-xs ${otpFeedback.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                                    {otpFeedback.text}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-stone-700 uppercase mb-1.5 tracking-wider">
                                        Nhập mã OTP (6 chữ số)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="123456"
                                        className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold bg-[#FAF8F5] border border-[#E2DDD5] focus:border-[#8C6A48] focus:ring-1 focus:ring-[#8C6A48] rounded-lg py-3 outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={otpLoading}
                                    className="w-full bg-[#1C1917] hover:bg-[#8C6A48] text-white py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-75 cursor-pointer shadow-sm"
                                >
                                    {otpLoading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                                </button>
                            </form>

                            <div className="mt-4 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={otpLoading}
                                    className="text-[#8C6A48] hover:underline font-medium cursor-pointer"
                                >
                                    Gửi lại mã OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowOtpModal(false)}
                                    className="hover:underline text-stone-600 cursor-pointer"
                                >
                                    Đóng
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
