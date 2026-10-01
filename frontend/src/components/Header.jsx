import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Phone,
    MapPin,
    Heart,
    User,
    ShoppingBag,
    Search,
    Menu as MenuIcon,
    X,
    ChevronDown,
    ChevronRight,
    Sparkles,
    ArrowRight
} from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

    // Cuộn mượt mà đến phần tương ứng khi click vào Thiết kế nội thất hoặc Câu chuyện
    const handleScrollToSection = (e, targetId) => {
        if (!targetId) return;
        setMobileMenuOpen(false);
        if (location.pathname === '/') {
            e.preventDefault();
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', `/#${targetId}`);
            }
        } else {
            e.preventDefault();
            navigate(`/#${targetId}`);
        }
    };

    // Cart & Wishlist counts (có thể nối context/Redux sau này)
    const [cartCount] = useState(2);
    const [wishlistCount] = useState(3);

    // Listen to scroll to adjust header elevation
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    const navMenuItems = [
        {
            title: 'SẢN PHẨM MỚI',
            path: '/san-pham-moi',
            badge: 'NEW',
        },
        {
            title: 'SẢN PHẨM',
            path: '/san-pham',
            hasDropdown: true,
            subcategories: [
                {
                    group: 'Bàn',
                    items: [
                        { name: 'Bàn ăn cao cấp', path: '/san-pham/ban-an' },
                        { name: 'Bàn trà - Bàn sofa', path: '/san-pham/ban-tra' },
                        { name: 'Bàn làm việc', path: '/san-pham/ban-lam-viec' },
                        { name: 'Bàn trang điểm', path: '/san-pham/ban-trang-diem' },
                    ],
                },
                {
                    group: 'Ghế & Sofa',
                    items: [
                        { name: 'Sofa da thật', path: '/san-pham/sofa-da' },
                        { name: 'Sofa vải cao cấp', path: '/san-pham/sofa-vai' },
                        { name: 'Ghế thư giãn - Armchair', path: '/san-pham/ghe-thu-gian' },
                        { name: 'Ghế ăn sang trọng', path: '/san-pham/ghe-an' },
                    ],
                },
                {
                    group: 'Tủ & Kệ',
                    items: [
                        { name: 'Tủ quần áo hiện đại', path: '/san-pham/tu-ao' },
                        { name: 'Kệ tivi phòng khách', path: '/san-pham/ke-tivi' },
                        { name: 'Tủ giày thông minh', path: '/san-pham/tu-giay' },
                        { name: 'Tủ sách & Kệ trang trí', path: '/san-pham/tu-sach' },
                    ],
                },
                {
                    group: 'Giường & Nệm',
                    items: [
                        { name: 'Giường ngủ master', path: '/san-pham/giuong-ngu' },
                        { name: 'Bàn đầu giường (Tab)', path: '/san-pham/tab-dau-giuong' },
                        { name: 'Nệm lò xo cao cấp', path: '/san-pham/nem' },
                        { name: 'Bộ chăn ga lụa', path: '/san-pham/chan-ga' },
                    ],
                },
            ],
            featuredImage: {
                title: 'Bộ sưu tập Sofa 2026',
                desc: 'Đường nét thanh lịch, đệm lông vũ êm ái',
                link: '/san-pham/sofa-da',
                imgUrl: '/images/products/sofa-3-cho-victoria.jpg',
            },
        },
        {
            title: 'PHÒNG',
            path: '/phong',
            hasDropdown: true,
            roomList: [
                { name: 'Phòng khách', path: '/phong/phong-khach', desc: 'Không gian sum vầy tao nhã' },
                { name: 'Phòng ăn', path: '/phong/phong-an', desc: 'Bữa tiệc ấm áp trọn vị' },
                { name: 'Phòng ngủ', path: '/phong/phong-ngu', desc: 'Chốn riêng tư thư thái tuyệt đối' },
                { name: 'Phòng làm việc', path: '/phong/phong-lam-viec', desc: 'Khơi nguồn sáng tạo đỉnh cao' },
                { name: 'Ban công & Sân vườn', path: '/phong/ngoai-troi', desc: 'Giao hòa cùng thiên nhiên' },
            ],
        },
        {
            title: 'BỘ SƯU TẬP',
            path: '/bo-suu-tap',
            hasDropdown: true,
            collections: [
                { name: 'Victoria Collection', desc: 'Cảm hứng miền quê Pháp lãng mạn', tag: 'Nổi bật' },
                { name: 'Elegance Series', desc: 'Đẳng cấp hoàng gia đương đại', tag: 'Mới' },
                { name: 'Osaka Minimalist', desc: 'Tinh hoa mộc mạc phong cách Nhật Bản', tag: '' },
                { name: 'Coastal Breeze', desc: 'Phóng khoáng, tươi mới hơi thở đại dương', tag: '' },
            ],
        },
        {
            title: 'THƯƠNG HIỆU',
            path: '/thuong-hieu',
            hasDropdown: true,
            brands: [
                { name: 'TK House Collection', desc: 'Nội thất chuẩn mực Việt Nam' },
                { name: 'Calligaris Italy', desc: 'Thiết kế biểu tượng từ nước Ý' },
                { name: 'BoConcept Denmark', desc: 'Phong cách Scandinavian trứ danh' },
            ],
        },
        {
            title: 'THIẾT KẾ NỘI THẤT',
            path: '/#thiet-ke-noi-that',
            targetId: 'thiet-ke-noi-that',
        },
        {
            title: 'CÂU CHUYỆN THƯƠNG HIỆU',
            path: '/#cau-chuyen-thuong-hieu',
            targetId: 'cau-chuyen-thuong-hieu',
        },
    ];

    return (
        <header className="w-full bg-white z-50 sticky top-0 transition-shadow duration-300">
            {/* 1. TOPBAR TRÊN CÙNG (Nhỏ, trang nhã, dàn rộng thoáng đãng) */}
            <div className="bg-[#f9f8f6] border-b border-neutral-200/80 text-[11px] text-neutral-600 font-sans tracking-wide">
                <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12 h-9 flex items-center justify-between">
                    {/* Topbar Left */}
                    <div className="flex items-center space-x-6">
                        <a
                            href="tel:18007200"
                            className="inline-flex items-center space-x-1.5 text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-neutral-700" />
                            <span>
                                Hotline: <strong className="text-neutral-900 font-bold">1800 7200</strong>{' '}
                                <span className="text-[10px] text-emerald-700 font-normal bg-emerald-50 px-1.5 py-0.5 rounded ml-1 border border-emerald-200">
                                    Miễn phí
                                </span>
                            </span>
                        </a>

                        <span className="hidden sm:inline-block w-px h-3 bg-neutral-300"></span>

                        <Link
                            to="/#cau-chuyen-thuong-hieu"
                            onClick={(e) => handleScrollToSection(e, 'cau-chuyen-thuong-hieu')}
                            className="hidden sm:inline-block hover:text-neutral-900 transition-colors"
                        >
                            Giới thiệu
                        </Link>

                        <Link
                            to="/khuyen-mai"
                            className="hidden md:inline-flex items-center space-x-1 text-amber-800 hover:text-amber-900 font-medium transition-colors"
                        >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Khuyến mãi đặc quyền</span>
                        </Link>
                    </div>

                    {/* Topbar Right */}
                    <div className="flex items-center space-x-5">
                        <Link
                            to="/showroom"
                            className="inline-flex items-center space-x-1.5 hover:text-neutral-900 transition-colors"
                        >
                            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="hidden sm:inline">Tìm Showroom</span>
                        </Link>

                        <Link
                            to="/yeu-thich"
                            className="inline-flex items-center space-x-1.5 hover:text-neutral-900 transition-colors relative"
                        >
                            <Heart className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="hidden sm:inline">Yêu thích</span>
                            {wishlistCount > 0 && (
                                <span className="inline-flex items-center justify-center bg-neutral-800 text-white text-[9px] w-3.5 h-3.5 rounded-full font-semibold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <span className="w-px h-3 bg-neutral-300"></span>

                        <Link
                            to="/dang-nhap"
                            className="inline-flex items-center space-x-1.5 hover:text-neutral-900 font-medium transition-colors"
                        >
                            <User className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Đăng nhập / Đăng ký</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. MAIN HEADER (DÀN RỘNG THOÁNG ĐÃNG CHUẨN LUXURY) */}
            <div
                className={`bg-white transition-all duration-300 ${isScrolled ? 'shadow-md py-2.5' : 'py-3.5 border-b border-neutral-100'
                    }`}
            >
                <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="flex items-center justify-between gap-4 lg:gap-8">
                        {/* Left: Hamburger Button & Logo TK House */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-1.5 -ml-1.5 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                                aria-label="Mở danh mục menu"
                            >
                                <MenuIcon className="w-6 h-6 stroke-[1.75]" />
                            </button>

                            {/* Logo viền hộp chữ nhật tối giản "TK House" */}
                            <Link
                                to="/"
                                className="group flex-shrink-0 inline-flex items-center justify-center border-2 border-neutral-800 px-3.5 py-1.5 transition-all duration-300 hover:border-neutral-950 hover:bg-neutral-950"
                            >
                                <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.2em] text-neutral-900 group-hover:text-white uppercase select-none transition-colors whitespace-nowrap">
                                    TK House
                                </span>
                            </Link>
                        </div>

                        {/* Center: Desktop Navigation Bar */}
                        <nav className="hidden xl:flex items-center space-x-6 2xl:space-x-8 text-[12.5px] font-semibold tracking-wider text-neutral-800">
                            {navMenuItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative group"
                                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.title)}
                                    onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                                >
                                    <Link
                                        to={item.path}
                                        onClick={(e) => {
                                            if (item.targetId) {
                                                handleScrollToSection(e, item.targetId);
                                            }
                                        }}
                                        className="inline-flex items-center py-2 space-x-1 hover:text-neutral-500 transition-colors uppercase"
                                    >
                                        <span>{item.title}</span>
                                        {item.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5 stroke-[1.75] transition-transform duration-200 group-hover:-rotate-180" />
                                        )}
                                        {item.badge && (
                                            <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ml-0.5">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Mega Dropdown: SẢN PHẨM */}
                                    {item.title === 'SẢN PHẨM' && (
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-[820px] bg-white border border-neutral-200 shadow-2xl rounded-sm p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="grid grid-cols-4 gap-6">
                                                {item.subcategories.map((sub, sIdx) => (
                                                    <div key={sIdx} className="space-y-3">
                                                        <h4 className="text-[13px] font-bold text-neutral-900 tracking-wider uppercase border-b border-neutral-100 pb-1.5">
                                                            {sub.group}
                                                        </h4>
                                                        <ul className="space-y-2 text-[12px] font-normal text-neutral-600">
                                                            {sub.items.map((subItem, siIdx) => (
                                                                <li key={siIdx}>
                                                                    <Link
                                                                        to={subItem.path}
                                                                        className="hover:text-neutral-950 hover:translate-x-1 inline-block transition-transform duration-150"
                                                                    >
                                                                        {subItem.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Featured banner at bottom of Mega Menu */}
                                            {item.featuredImage && (
                                                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50 p-3 rounded">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={item.featuredImage.imgUrl}
                                                            alt={item.featuredImage.title}
                                                            className="w-20 h-14 object-cover rounded shadow-sm"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 text-xs">
                                                                {item.featuredImage.title}
                                                            </p>
                                                            <p className="text-[11px] text-neutral-500 font-normal">
                                                                {item.featuredImage.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={item.featuredImage.link}
                                                        className="inline-flex items-center text-[11px] font-semibold text-neutral-900 hover:text-amber-800 space-x-1"
                                                    >
                                                        <span>Khám phá ngay</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Dropdown: PHÒNG */}
                                    {item.title === 'PHÒNG' && (
                                        <div className="absolute left-0 top-full w-64 bg-white border border-neutral-200 shadow-xl rounded-sm p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <ul className="space-y-2.5 text-[12px] font-normal text-neutral-700">
                                                {item.roomList.map((room, rIdx) => (
                                                    <li key={rIdx}>
                                                        <Link
                                                            to={room.path}
                                                            className="block p-1.5 rounded hover:bg-neutral-50 transition-colors"
                                                        >
                                                            <span className="font-medium text-neutral-900 block">{room.name}</span>
                                                            <span className="text-[10.5px] text-neutral-400">{room.desc}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Dropdown: BỘ SƯU TẬP */}
                                    {item.title === 'BỘ SƯU TẬP' && (
                                        <div className="absolute left-0 top-full w-72 bg-white border border-neutral-200 shadow-xl rounded-sm p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <ul className="space-y-2 text-[12px] font-normal text-neutral-700">
                                                {item.collections.map((col, cIdx) => (
                                                    <li key={cIdx}>
                                                        <Link
                                                            to={`/bo-suu-tap/${col.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                            className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 transition-colors"
                                                        >
                                                            <div>
                                                                <span className="font-semibold text-neutral-900 block">{col.name}</span>
                                                                <span className="text-[10px] text-neutral-400">{col.desc}</span>
                                                            </div>
                                                            {col.tag && (
                                                                <span className="text-[9px] bg-neutral-900 text-white font-bold px-1.5 py-0.5 rounded">
                                                                    {col.tag}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Dropdown: THƯƠNG HIỆU */}
                                    {item.title === 'THƯƠNG HIỆU' && (
                                        <div className="absolute left-0 top-full w-64 bg-white border border-neutral-200 shadow-xl rounded-sm p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <ul className="space-y-2.5 text-[12px] font-normal text-neutral-700">
                                                {item.brands.map((br, bIdx) => (
                                                    <li key={bIdx}>
                                                        <Link
                                                            to={`/thuong-hieu/${br.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                            className="block p-1.5 rounded hover:bg-neutral-50 transition-colors"
                                                        >
                                                            <span className="font-medium text-neutral-900 block">{br.name}</span>
                                                            <span className="text-[10.5px] text-neutral-400">{br.desc}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right: Search Bar & Actions */}
                        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5 flex-shrink-0">
                            {/* Thanh tìm kiếm bo tròn tinh tế kèm kính lúp */}
                            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Tìm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 lg:w-56 xl:w-64 2xl:w-72 pl-4 pr-9 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 bg-neutral-100/90 rounded-full border border-transparent focus:border-neutral-800 focus:bg-white focus:outline-none transition-all duration-200"
                                />
                                <button
                                    type="submit"
                                    aria-label="Tìm kiếm"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                                >
                                    <Search className="w-4 h-4 stroke-[1.8]" />
                                </button>
                            </form>

                            {/* Mobile Search Icon */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden p-2 text-neutral-700 hover:text-neutral-950"
                                aria-label="Tìm kiếm"
                            >
                                <Search className="w-5 h-5 stroke-[1.8]" />
                            </button>

                            {/* Nút Giỏ Hàng kèm Badge số lượng */}
                            <Link
                                to="/gio-hang"
                                className="relative p-2 text-neutral-800 hover:text-neutral-950 transition-colors group"
                                aria-label="Giỏ hàng"
                            >
                                <ShoppingBag className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute 1 top-0.5 right-0.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Nút Tài Khoản */}
                            <Link
                                to="/tai-khoan"
                                className="p-2 text-neutral-800 hover:text-neutral-950 transition-colors hidden sm:block"
                                aria-label="Tài khoản cá nhân"
                            >
                                <User className="w-5 h-5 stroke-[1.8]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MOBILE & SIDEBAR SLIDE-OVER DRAWER */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 left-0 max-w-full flex">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="border-2 border-neutral-900 px-3.5 py-1 font-serif text-lg font-bold tracking-widest text-neutral-900 uppercase whitespace-nowrap flex-shrink-0"
                                >
                                    TK House
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                                    aria-label="Đóng menu"
                                >
                                    <X className="w-6 h-6 stroke-[1.75]" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* Search Bar in Drawer */}
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm, bộ sưu tập..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 text-sm bg-neutral-100 rounded-full border border-transparent focus:border-neutral-800 focus:bg-white focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </form>

                                {/* Categories List */}
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                        Danh mục nổi bật
                                    </p>
                                    {navMenuItems.map((item, idx) => (
                                        <div key={idx} className="border-b border-neutral-100 last:border-none">
                                            <div className="flex items-center justify-between py-3">
                                                <Link
                                                    to={item.path}
                                                    onClick={(e) => {
                                                        setMobileMenuOpen(false);
                                                        if (item.targetId) {
                                                            handleScrollToSection(e, item.targetId);
                                                        }
                                                    }}
                                                    className="font-medium text-sm text-neutral-800 hover:text-neutral-950 uppercase tracking-wide flex items-center space-x-2"
                                                >
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>

                                                {item.hasDropdown && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMobileExpandedSection(
                                                                mobileExpandedSection === item.title ? null : item.title
                                                            )
                                                        }
                                                        className="p-1 text-neutral-400 hover:text-neutral-800"
                                                    >
                                                        <ChevronDown
                                                            className={`w-4 h-4 transition-transform duration-200 ${mobileExpandedSection === item.title ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Expandable sub-items */}
                                            {item.hasDropdown && mobileExpandedSection === item.title && (
                                                <div className="pb-3 pl-4 space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded">
                                                    {item.subcategories &&
                                                        item.subcategories.map((sub, sIdx) => (
                                                            <div key={sIdx} className="mb-2">
                                                                <span className="font-semibold text-neutral-800 block text-[11px] uppercase tracking-wide mb-1">
                                                                    {sub.group}
                                                                </span>
                                                                <div className="space-y-1.5 pl-2">
                                                                    {sub.items.map((subI, siIdx) => (
                                                                        <Link
                                                                            key={siIdx}
                                                                            to={subI.path}
                                                                            onClick={() => setMobileMenuOpen(false)}
                                                                            className="block hover:text-neutral-900 py-0.5"
                                                                        >
                                                                            {subI.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}

                                                    {item.roomList &&
                                                        item.roomList.map((r, rIdx) => (
                                                            <Link
                                                                key={rIdx}
                                                                to={r.path}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="block font-medium text-neutral-700 hover:text-neutral-950 py-1"
                                                            >
                                                                {r.name}
                                                            </Link>
                                                        ))}

                                                    {item.collections &&
                                                        item.collections.map((c, cIdx) => (
                                                            <Link
                                                                key={cIdx}
                                                                to={`/bo-suu-tap/${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="block font-medium text-neutral-700 hover:text-neutral-950 py-1"
                                                            >
                                                                {c.name}
                                                            </Link>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Links */}
                                <div className="pt-4 border-t border-neutral-200 space-y-3 text-xs text-neutral-600 font-medium">
                                    <Link
                                        to="/showroom"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-2 py-1 hover:text-neutral-900"
                                    >
                                        <MapPin className="w-4 h-4 text-neutral-500" />
                                        <span>Hệ thống Showroom TK House</span>
                                    </Link>

                                    <Link
                                        to="/yeu-thich"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-2 py-1 hover:text-neutral-900"
                                    >
                                        <Heart className="w-4 h-4 text-neutral-500" />
                                        <span>Sản phẩm yêu thích ({wishlistCount})</span>
                                    </Link>

                                    <Link
                                        to="/tai-khoan"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-2 py-1 hover:text-neutral-900"
                                    >
                                        <User className="w-4 h-4 text-neutral-500" />
                                        <span>Tài khoản của tôi / Đăng nhập</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Drawer Footer with Hotline Call */}
                            <div className="p-4 bg-neutral-100 border-t border-neutral-200">
                                <a
                                    href="tel:18007200"
                                    className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>Gọi Hotline 1800 7200 (Miễn phí)</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
