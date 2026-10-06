import React, { useState, useEffect, useRef } from 'react';
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
    ArrowRight,
    LogOut
} from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

    // User authentication state
    const [user, setUser] = useState(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const checkAuth = () => {
            // Kiểm tra token fallback trên URL nếu có
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('token');
            const urlUser = params.get('user');
            if (urlToken) {
                localStorage.setItem('token', urlToken);
                if (urlUser) {
                    try {
                        localStorage.setItem('user', decodeURIComponent(urlUser));
                    } catch {}
                }
            }

            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            setAvatarError(false);
            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser({ name: 'Quý khách' });
                }
            } else if (token) {
                setUser({ name: 'Quý khách' });
            } else {
                setUser(null);
            }
        };

        checkAuth();

        window.addEventListener('storage', checkAuth);
        window.addEventListener('auth-change', checkAuth);

        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('auth-change', checkAuth);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserMenuOpen(false);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
    };

    // Cuộn mượt mà đến phần tương ứng mà không làm dính hash vào URL
    const handleScrollToSection = (e, targetId) => {
        if (!targetId) return;
        if (e && e.preventDefault) e.preventDefault();
        setMobileMenuOpen(false);
        if (location.pathname === '/') {
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const elem = document.getElementById(targetId);
                if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 200);
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
                    group: 'BÀN',
                    items: [
                        { name: 'Bàn ăn cao cấp', path: '/san-pham?category=ban-an', desc: 'Mặt đá Ceramic chống ố' },
                        { name: 'Bàn trà - Sofa', path: '/san-pham?category=ban-tra', desc: 'Đá Marble & Gỗ sồi tự nhiên' },
                        { name: 'Bàn làm việc', path: '/san-pham?category=ban-lam-viec', desc: 'Thiết kế công thái học hiện đại' },
                        { name: 'Bàn trang điểm', path: '/san-pham?category=ban-trang-diem', desc: 'Đường nét uốn cong nhẹ nhàng' },
                    ],
                },
                {
                    group: 'GHẾ & SOFA',
                    items: [
                        { name: 'Sofa da thật', path: '/san-pham?category=sofa-da', desc: 'Da bò thảo mộc tự nhiên 100%' },
                        { name: 'Sofa vải nỉ', path: '/san-pham?category=sofa-vai', desc: 'Vải dệt cao cấp êm ái thoáng mát' },
                        { name: 'Ghế Armchair thư giãn', path: '/san-pham?category=ghe-thu-gian', desc: 'Nâng niu từng phút giây an yên' },
                        { name: 'Ghế ăn sang trọng', path: '/san-pham?category=ghe-an', desc: 'Đệm ngồi êm dịu, tựa cong duyên dáng' },
                    ],
                },
            ],
            featuredLookbook: {
                badge: 'LOOKBOOK 2026',
                title: 'BST Bàn & Ghế 2026 - Thanh lịch & Êm ái',
                desc: 'Khám phá sự giao thoa giữa nghệ thuật tạo hình kiến trúc và độ êm ái vượt thời gian.',
                link: '/san-pham',
                image: '/images/lookbook/lookbook-living.jpg',
            },
        },
        {
            title: 'BỘ SƯU TẬP',
            path: '/bo-suu-tap',
            hasDropdown: true,
            collections: [
                {
                    name: 'VICTORIA',
                    desc: 'Cảm hứng miền quê Pháp lãng mạn & da thảo mộc',
                    tag: 'Nổi bật',
                    image: '/images/banners/banner-hero/banner-victoria.jpg',
                    link: '/bo-suu-tap/victoria',
                },
                {
                    name: 'VALENCIA',
                    desc: 'Đá Marble Calacatta & đường bo cong hữu cơ',
                    tag: 'Mới',
                    image: '/images/banners/banner-hero/banner-cotenoire.jpg',
                    link: '/bo-suu-tap/valencia',
                },
                {
                    name: 'MORETTI',
                    desc: 'Chủ nghĩa tối giản vị lai & da Nappa Milanese',
                    tag: 'Haute Couture',
                    image: '/images/banners/banner-hero/banner-modern.jpg',
                    link: '/bo-suu-tap/moretti',
                },
                {
                    name: 'OSAKA',
                    desc: 'Tinh hoa Japandi mộc mạc, tựa mây duyên dáng',
                    tag: 'Zen',
                    image: '/images/products/ghe-thu-gian.jpg',
                    link: '/bo-suu-tap/osaka',
                },
                {
                    name: 'ELEGANCE',
                    desc: 'Mặt đá Ceramic chống ố, vân gỗ sồi nguyên khối',
                    tag: '',
                    image: '/images/products/ban-an.jpg',
                    link: '/bo-suu-tap/elegance',
                },
                {
                    name: 'COASTAL',
                    desc: 'Phóng khoáng, tươi mới hơi thở đại dương & gỗ sáng',
                    tag: '',
                    image: '/images/products/ban-tra-doi.jpg',
                    link: '/bo-suu-tap/coastal',
                },
            ],
        },
        {
            title: 'CÂU CHUYỆN THƯƠNG HIỆU',
            path: '/#cau-chuyen-thuong-hieu',
            targetId: 'cau-chuyen-thuong-hieu',
        },
    ];

    return (
        <header className="w-full bg-white z-50 sticky top-0">

            {/* 2. MAIN HEADER (DÀN RỘNG THOÁNG ĐÃNG CHUẨN LUXURY) */}
            <div
                className={`bg-white transition-all duration-300 ${isScrolled ? 'shadow-md py-2.5' : 'py-3.5 border-b border-neutral-100'
                    }`}
            >
                <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="flex items-center justify-between gap-4 lg:gap-8">
                        {/* Left: Hamburger Button & Logo TK House */}
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-1.5 -ml-1.5 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                                aria-label="Mở danh mục menu"
                            >
                                <MenuIcon className="w-6 h-6 stroke-[1.75]" />
                            </button>

                            {/* Cụm Logo TK House: Biểu tượng ngôi nhà bên trái (to hơn), Chữ bên phải (căn đáy bằng ngôi nhà) */}
                            <Link
                                to="/"
                                onClick={() => {
                                    if (window.location.hash) {
                                        window.history.replaceState(null, '', window.location.pathname);
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="group flex-shrink-0 inline-flex items-end space-x-2 sm:space-x-3 transition-opacity duration-300 hover:opacity-90 select-none pb-0.5"
                            >
                                {/* Biểu tượng ngôi nhà (bên trái, to và nổi bật hơn) */}
                                <img
                                    src="/images/logo/logo.png"
                                    alt="TK House Icon"
                                    className="h-10 sm:h-11 md:h-[48px] lg:h-[50px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Ảnh chữ: TK HOUSE NỘI THẤT & THIẾT KẾ (bên phải, nhích xuống bằng đáy của ngôi nhà) */}
                                <img
                                    src="/images/logo/chu-logo.png"
                                    alt="TK HOUSE Nội Thất & Thiết Kế"
                                    className="h-7 sm:h-8 md:h-[35px] lg:h-[36px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] translate-y-[2px]"
                                />
                            </Link>
                        </div>

                        {/* Center: Desktop Navigation Bar */}
                        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap flex-nowrap text-[12.5px] font-semibold tracking-wider text-neutral-800">
                            {navMenuItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative group whitespace-nowrap flex-shrink-0 py-2"
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
                                        className="inline-flex items-center space-x-1.5 hover:text-neutral-500 transition-colors uppercase whitespace-nowrap"
                                    >
                                        <span className="whitespace-nowrap">{item.title}</span>
                                        {item.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5 stroke-[1.75] transition-transform duration-200 group-hover:-rotate-180 flex-shrink-0" />
                                        )}
                                        {item.badge && (
                                            <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ml-1 flex-shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Mega Dropdown: SẢN PHẨM (3 Cột: BÀN | GHẾ & SOFA | FEATURED LOOKBOOK 35%) */}
                                    {item.title === 'SẢN PHẨM' && (
                                        <div
                                            className="absolute left-1/2 -translate-x-[36%] top-full pt-3 z-50 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out"
                                        >
                                            {/* Hover bridge để rê chuột từ navbar vào menu không bị đứt quãng */}
                                            <div className="absolute -top-3 left-0 right-0 h-4" />

                                            <div className="w-[880px] bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8">
                                                <div className="flex gap-8 items-stretch">
                                                    {/* Cột 1: BÀN (Font Serif in hoa, line mỏng, hover #8C6A48 kèm gạch chân mượt mà) */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="pb-3 border-b border-[#E8E2D8]">
                                                                <h4 className="font-serif text-[15px] font-normal tracking-[0.18em] text-neutral-900 uppercase">
                                                                    {item.subcategories[0].group}
                                                                </h4>
                                                            </div>
                                                            <ul className="space-y-4 pt-4">
                                                                    {item.subcategories[0].items.map((subItem, siIdx) => (
                                                                        <li key={siIdx}>
                                                                            <Link
                                                                                to={subItem.path}
                                                                                className="group/link block text-left"
                                                                            >
                                                                                <span className="text-[13.5px] font-medium text-neutral-800 group-hover/link:text-[#8C6A48] transition-colors duration-300 relative inline-block">
                                                                                    {subItem.name}
                                                                                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#8C6A48] transition-all duration-300 ease-out group-hover/link:w-full" />
                                                                                </span>
                                                                                <span className="block text-[11px] text-stone-500 font-light mt-0.5">
                                                                                    {subItem.desc}
                                                                                </span>
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                            </ul>
                                                        </div>

                                                        <div className="pt-4 mt-4 border-t border-stone-100">
                                                            <Link
                                                                to="/san-pham?category=ban"
                                                                className="inline-flex items-center space-x-1.5 text-xs text-[#8C6A48] hover:text-neutral-900 font-medium tracking-wide transition-colors"
                                                            >
                                                                <span>Xem tất cả mẫu Bàn</span>
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Cột 2: GHẾ & SOFA (Font Serif in hoa, line mỏng, hover #8C6A48 kèm gạch chân mượt mà) */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="pb-3 border-b border-[#E8E2D8]">
                                                                <h4 className="font-serif text-[15px] font-normal tracking-[0.18em] text-neutral-900 uppercase">
                                                                    {item.subcategories[1].group}
                                                                </h4>
                                                            </div>
                                                            <ul className="space-y-4 pt-4">
                                                                {item.subcategories[1].items.map((subItem, siIdx) => (
                                                                    <li key={siIdx}>
                                                                        <Link
                                                                            to={subItem.path}
                                                                            className="group/link block text-left"
                                                                        >
                                                                            <span className="text-[13.5px] font-medium text-neutral-800 group-hover/link:text-[#8C6A48] transition-colors duration-300 relative inline-block">
                                                                                {subItem.name}
                                                                                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#8C6A48] transition-all duration-300 ease-out group-hover/link:w-full" />
                                                                            </span>
                                                                            <span className="block text-[11px] text-stone-500 font-light mt-0.5">
                                                                                {subItem.desc}
                                                                            </span>
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div className="pt-4 mt-4 border-t border-stone-100">
                                                            <Link
                                                                to="/san-pham?category=sofa"
                                                                className="inline-flex items-center space-x-1.5 text-xs text-[#8C6A48] hover:text-neutral-900 font-medium tracking-wide transition-colors"
                                                            >
                                                                <span>Xem tất cả Ghế & Sofa</span>
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Cột 3: FEATURED LOOKBOOK - Điểm nhấn (Chiếm 35% chiều rộng menu) */}
                                                    <div className="w-[35%] flex-shrink-0 flex flex-col h-full">
                                                        {item.featuredLookbook && (
                                                            <Link
                                                                to={item.featuredLookbook.link}
                                                                className="group/card relative rounded-xl overflow-hidden shadow-md flex-1 flex flex-col justify-end p-5 min-h-[320px] border border-stone-200/60 block"
                                                            >
                                                                <img
                                                                    src={item.featuredLookbook.image}
                                                                    alt={item.featuredLookbook.title}
                                                                    className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                                                                />
                                                                {/* Lớp phủ gradient nhẹ */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover/card:from-black/90 transition-colors duration-500" />

                                                                <div className="relative z-10 text-white space-y-2">
                                                                    <span className="backdrop-blur-md bg-white/20 text-[#FAF7F2] text-[9.5px] font-semibold tracking-[0.25em] uppercase px-2.5 py-0.5 rounded-full inline-block border border-white/25">
                                                                        {item.featuredLookbook.badge}
                                                                    </span>
                                                                    <h5 className="font-serif text-[15px] font-normal text-white drop-shadow leading-snug">
                                                                        {item.featuredLookbook.title}
                                                                    </h5>
                                                                    <p className="text-[11px] text-stone-200 font-light line-clamp-2 leading-relaxed">
                                                                        {item.featuredLookbook.desc}
                                                                    </p>
                                                                    <div className="pt-2">
                                                                        <span className="backdrop-blur-md bg-white/20 group-hover/card:bg-white/30 text-white text-[11px] font-medium tracking-wider px-4 py-2 rounded-full inline-flex items-center gap-2 border border-white/40 shadow-sm transition-all duration-300">
                                                                            <span>Khám phá ngay</span>
                                                                            <span className="text-xs transition-transform duration-300 group-hover/card:translate-x-1">→</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dropdown: BỘ SƯU TẬP (Lưới 2x2 kèm Thumbnail ảnh & Tag be vàng đồng) */}
                                    {item.title === 'BỘ SƯU TẬP' && (
                                        <div
                                            className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out"
                                        >
                                            {/* Hover bridge */}
                                            <div className="absolute -top-3 left-0 right-0 h-4" />

                                            <div className="w-[660px] bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6">
                                                {/* Header */}
                                                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8E2D8]">
                                                    <div>
                                                        <span className="text-[10px] font-semibold tracking-[0.25em] text-[#8C6A48] uppercase block">
                                                            LOOKBOOK 2026
                                                        </span>
                                                        <h4 className="font-serif text-base font-normal text-neutral-900 tracking-wider uppercase mt-0.5">
                                                            BỘ SƯU TẬP CHỦ ĐẠO
                                                        </h4>
                                                    </div>
                                                    <Link
                                                        to="/bo-suu-tap"
                                                        className="inline-flex items-center space-x-1.5 text-xs text-[#8C6A48] hover:text-neutral-950 font-medium tracking-wide transition-colors"
                                                    >
                                                        <span>Xem tất cả bộ sưu tập</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>

                                                {/* Lưới 2x2 các thẻ bộ sưu tập */}
                                                <div className="grid grid-cols-2 gap-3.5">
                                                    {item.collections.map((col, cIdx) => (
                                                        <Link
                                                            key={cIdx}
                                                            to={col.link || `/bo-suu-tap/${col.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                            className="group/col flex items-center space-x-3.5 p-3 rounded-xl border border-transparent hover:border-[#E8E2D8] hover:bg-[#FAF7F2] transition-all duration-300 text-left"
                                                        >
                                                            {/* Thumbnail 1:1, rounded-xl */}
                                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 shadow-sm border border-stone-200/50">
                                                                <img
                                                                    src={col.image}
                                                                    alt={col.name}
                                                                    className="w-full h-full object-cover group-hover/col:scale-105 transition-all duration-500 ease-out"
                                                                />
                                                            </div>

                                                            {/* Thông tin bộ sưu tập */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h5 className="font-serif text-[13px] font-normal text-neutral-900 group-hover/col:text-[#8C6A48] uppercase tracking-wider transition-colors line-clamp-1">
                                                                        {col.name}
                                                                    </h5>
                                                                    {col.tag && (
                                                                        <span className="bg-[#F3EDE2] text-[#8C6A48] text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                                                                            {col.tag}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-stone-500 font-light line-clamp-2 mt-1 leading-relaxed">
                                                                    {col.desc}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right: Search Bar & Actions */}
                        <div className="flex items-center space-x-2.5 sm:space-x-3.5 lg:space-x-4 flex-shrink-0">
                            {/* Thanh tìm kiếm bo tròn tinh tế kèm kính lúp */}
                            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Tìm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-44 lg:w-52 xl:w-60 2xl:w-64 pl-4 pr-9 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 bg-neutral-100/90 rounded-full border border-transparent focus:border-neutral-800 focus:bg-white focus:outline-none transition-all duration-200"
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

                            {/* Nút Yêu Thích - Đặt cạnh bên trái giỏ hàng */}
                            <Link
                                to="/yeu-thich"
                                className="relative p-2 text-neutral-800 hover:text-neutral-950 transition-colors group"
                                aria-label="Sản phẩm yêu thích"
                                title="Danh sách yêu thích"
                            >
                                <Heart className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Nút Giỏ Hàng kèm Badge số lượng */}
                            <Link
                                to="/gio-hang"
                                className="relative p-2 text-neutral-800 hover:text-neutral-950 transition-colors group"
                                aria-label="Giỏ hàng"
                                title="Giỏ hàng"
                            >
                                <ShoppingBag className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Nút Tài Khoản: Hiển thị Avatar khi đã đăng nhập hoặc Nút Đăng ký/Đăng nhập */}
                            {user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="inline-flex items-center space-x-2 py-1 px-2 text-neutral-800 hover:text-neutral-950 rounded-full transition-all group cursor-pointer focus:outline-none"
                                        aria-label="Tài khoản cá nhân"
                                    >
                                        {/* Avatar mặc định chuẩn thương hiệu TK House */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8C6A48] to-[#C9A982] text-white flex items-center justify-center font-serif text-xs font-semibold shadow-sm ring-2 ring-[#E5DFD5] group-hover:ring-[#8C6A48] transition-all overflow-hidden flex-shrink-0">
                                            {user.avatar && !avatarError ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name || 'User'}
                                                    referrerPolicy="no-referrer"
                                                    onError={() => setAvatarError(true)}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span>{user.name ? user.name.trim().charAt(0).toUpperCase() : 'TK'}</span>
                                            )}
                                        </div>
                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-xs font-semibold text-neutral-900 group-hover:text-[#8C6A48] transition-colors leading-tight max-w-[110px] truncate">
                                                {user.name || 'Thành viên'}
                                            </span>
                                            <span className="text-[10px] text-stone-500 font-light leading-none">
                                                TK Atelier Member
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu tài khoản */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                                            <div className="px-4 py-2.5 border-b border-stone-100">
                                                <p className="text-xs font-semibold text-stone-900 truncate">
                                                    {user.name || 'Quý khách'}
                                                </p>
                                                <p className="text-[11px] text-stone-500 truncate">
                                                    {user.email || 'Thành viên TK House'}
                                                </p>
                                            </div>

                                            <div className="py-1 text-xs text-stone-700">
                                                <Link
                                                    to="/auth"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-stone-500" />
                                                    <span>Hồ sơ tài khoản</span>
                                                </Link>
                                                <Link
                                                    to="/gio-hang"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                                                >
                                                    <ShoppingBag className="w-4 h-4 text-stone-500" />
                                                    <span>Đơn hàng của tôi</span>
                                                </Link>
                                                <Link
                                                    to="/yeu-thich"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 text-stone-500" />
                                                    <span>Danh sách yêu thích</span>
                                                </Link>
                                            </div>

                                            <div className="pt-1 border-t border-stone-100">
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                                >
                                                    <LogOut className="w-4 h-4 text-rose-500" />
                                                    <span>Đăng xuất</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="inline-flex items-center space-x-1.5 py-1.5 px-2.5 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-full transition-all group"
                                    aria-label="Đăng nhập / Đăng ký"
                                    title="Đăng nhập / Đăng ký"
                                >
                                    <User className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
                                    <span className="hidden sm:inline text-xs font-medium text-neutral-700 group-hover:text-neutral-950 whitespace-nowrap">
                                        Đăng ký / Đăng nhập
                                    </span>
                                </Link>
                            )}
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
                                    className="inline-flex items-end space-x-2 flex-shrink-0 hover:opacity-90 transition-opacity pb-0.5"
                                >
                                    <img
                                        src="/images/logo/logo.png"
                                        alt="TK House Icon"
                                        className="h-9 sm:h-10 w-auto object-contain"
                                    />
                                    <img
                                        src="/images/logo/chu-logo.png"
                                        alt="TK HOUSE Nội Thất & Thiết Kế"
                                        className="h-6 sm:h-7 w-auto object-contain translate-y-[1.5px]"
                                    />
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
                                                {item.hasDropdown ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMobileExpandedSection(
                                                                mobileExpandedSection === item.title ? null : item.title
                                                            )
                                                        }
                                                        className="w-full flex items-center justify-between font-medium text-sm text-neutral-800 hover:text-neutral-950 uppercase tracking-wide text-left"
                                                    >
                                                        <span className="flex items-center space-x-2">
                                                            <span>{item.title}</span>
                                                            {item.badge && (
                                                                <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <ChevronDown
                                                            className={`w-4 h-4 transition-transform duration-200 text-neutral-400 ${mobileExpandedSection === item.title ? 'rotate-180 text-neutral-900' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                ) : (
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
                                                )}
                                            </div>

                                            {/* Expandable sub-items */}
                                            {item.hasDropdown && mobileExpandedSection === item.title && (
                                                <div className="pb-3 pl-4 space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded">
                                                    {item.title === 'SẢN PHẨM' && (
                                                        <div className="pb-2 mb-2 border-b border-neutral-200">
                                                            <Link
                                                                to="/san-pham"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="inline-flex items-center space-x-1.5 font-semibold text-xs text-[#8C6A48] hover:text-neutral-900"
                                                            >
                                                                <span>✦ Xem tất cả sản phẩm</span>
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    )}
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

                                                    {item.collections && (
                                                        <div className="space-y-2 pt-1">
                                                            {item.collections.map((c, cIdx) => (
                                                                <Link
                                                                    key={cIdx}
                                                                    to={c.link || `/bo-suu-tap/${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                                                >
                                                                    {c.image && (
                                                                        <img
                                                                            src={c.image}
                                                                            alt={c.name}
                                                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-neutral-200"
                                                                        />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-xs text-neutral-800">
                                                                                {c.name}
                                                                            </span>
                                                                            {c.tag && (
                                                                                <span className="bg-[#F3EDE2] text-[#8C6A48] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                                                                                    {c.tag}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] text-neutral-400 block line-clamp-1 font-light">
                                                                            {c.desc}
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
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

                                    {user ? (
                                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8C6A48] to-[#C9A982] text-white flex items-center justify-center font-serif text-sm font-semibold shadow-sm overflow-hidden flex-shrink-0">
                                                    {user.avatar && !avatarError ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name || 'User'}
                                                            referrerPolicy="no-referrer"
                                                            onError={() => setAvatarError(true)}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{user.name ? user.name.trim().charAt(0).toUpperCase() : 'TK'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                                                    <p className="text-[10.5px] text-stone-500 truncate">{user.email || 'Thành viên TK House'}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg text-xs transition-colors cursor-pointer"
                                                title="Đăng xuất"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to="/auth"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center space-x-2 py-1 hover:text-neutral-900"
                                        >
                                            <User className="w-4 h-4 text-neutral-500" />
                                            <span>Tài khoản của tôi / Đăng nhập</span>
                                        </Link>
                                    )}
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
