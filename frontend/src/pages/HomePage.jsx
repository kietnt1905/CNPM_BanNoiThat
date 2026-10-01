import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Award,
  Truck,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Eye,
  Heart,
  ShoppingBag
} from 'lucide-react';

export default function HomePage() {
  const location = useLocation();

  // Tự động cuộn mượt mà đến mục khi URL có hash hoặc đường dẫn tương ứng
  useEffect(() => {
    const scrollToTarget = (targetId) => {
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    };

    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      scrollToTarget(hashId);
    } else if (location.pathname === '/thiet-ke-noi-that') {
      scrollToTarget('thiet-ke-noi-that');
    } else if (
      location.pathname === '/cau-chuyen' ||
      location.pathname === '/cau-chuyen-thuong-hieu' ||
      decodeURIComponent(location.pathname).includes('cau-chuyen')
    ) {
      scrollToTarget('cau-chuyen-thuong-hieu');
    }
  }, [location.pathname, location.hash]);

  // Dữ liệu Slider Hero Banner (chuẩn phong cách Nhà Xinh)
  const heroSlides = [
    {
      id: 1,
      tag: 'BỘ SƯU TẬP MỚI',
      title: 'Victoria',
      description:
        'Từ cảm hứng miền quê Pháp đến cảm xúc ngôi nhà Việt, đường cong mềm mại, chi tiết chạm tay và tông màu ấm cho từng không gian sống.',
      image: '/images/banners/banner-hero/banner-victoria.jpg',
      primaryBtn: {
        text: 'KHÁM PHÁ BỘ SƯU TẬP',
        link: '/bo-suu-tap/victoria',
      },
      secondaryBtn: {
        text: 'CÂU CHUYỆN VICTORIA',
        link: '/cau-chuyen/victoria',
      },
    },
    {
      id: 2,
      tag: 'HÀNG MỚI VỀ',
      title: 'Côte Noire',
      description:
        'Bộ sưu tập hoa lụa nghệ thuật & hương thơm thượng lưu từ Pháp, thắp sáng nét quý phái và lãng mạn cho không gian nhà bạn.',
      image: '/images/banners/banner-hero/banner-cotenoire.jpg',
      primaryBtn: {
        text: 'XEM BỘ SƯU TẬP',
        link: '/bo-suu-tap/cote-noire',
      },
      secondaryBtn: {
        text: 'HƯƠNG THƠM NGHỆ THUẬT',
        link: '/san-pham/den-trang-tri',
      },
    },
    {
      id: 3,
      tag: 'KHÔNG GIAN ĐƯƠNG ĐẠI 2026',
      title: 'Modern Living',
      description:
        'Định nghĩa chuẩn mực tiện nghi đương đại: Tinh tế trong từng đường nét kiến trúc, bền bỉ cùng thời gian và nâng tầm phong cách sống.',
      image: '/images/banners/banner-hero/banner-modern.jpg',
      primaryBtn: {
        text: 'KHÁM PHÁ KHÔNG GIAN',
        link: '/phong/phong-khach',
      },
      secondaryBtn: {
        text: 'TƯ VẤN THIẾT KẾ',
        link: '/thiet-ke-noi-that',
      },
    },
  ];

  // Trạng thái Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_DURATION = 6000; // 6 giây mỗi slide

  // Tự động chuyển slide sau mỗi 6 giây liên tục
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleGoToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Ref và hàm điều khiển lướt Carousel sản phẩm nổi bật
  const productScrollRef = useRef(null);
  const scrollProducts = (direction) => {
    if (productScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      productScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Dữ liệu mẫu danh mục nổi bật
  const featuredCategories = [
    {
      title: 'Phòng Khách',
      subtitle: 'Sofa, Bàn trà, Kệ tivi',
      image: '/images/categories/phong-khach.jpg',
      link: '/phong/phong-khach',
    },
    {
      title: 'Phòng Ăn',
      subtitle: 'Bàn ăn đá, Ghế ăn bọc da',
      image: '/images/categories/phong-am.jpg',
      link: '/phong/phong-an',
    },
    {
      title: 'Phòng Ngủ',
      subtitle: 'Giường master, Tab đầu giường',
      image: '/images/categories/phong-ngu.jpg',
      link: '/phong/phong-ngu',
    },
    {
      title: 'Phòng Làm Việc',
      subtitle: 'Bàn làm việc, Ghế công thái học',
      image: '/images/categories/phong-lam-viec.jpg',
      link: '/phong/phong-lam-viec',
    },
  ];

  // Dữ liệu mẫu sản phẩm tiêu biểu (8 sản phẩm cao cấp mới nhất)
  const featuredProducts = [
    {
      id: 1,
      name: 'Sofa 3 Chỗ Victoria Da Thật',
      category: 'Sofa Phòng Khách',
      price: '38.500.000₫',
      oldPrice: '42.000.000₫',
      image: '/images/products/sofa-3-cho-victoria.jpg',
      tag: 'Bán chạy',
    },
    {
      id: 2,
      name: 'Bàn Ăn Mặt Đá Ceramic Elegance',
      category: 'Bàn Ăn Cao Cấp',
      price: '24.900.000₫',
      oldPrice: '',
      image: '/images/products/ban-an.jpg',
      tag: 'Mới',
    },
    {
      id: 3,
      name: 'Ghế Thư Giãn Armchair Mây Osaka',
      category: 'Ghế Thư Giãn',
      price: '14.200.000₫',
      oldPrice: '16.500.000₫',
      image: '/images/products/ghe-thu-gian.jpg',
      tag: '-15%',
    },
    {
      id: 4,
      name: 'Giường Ngủ Master Gỗ Tự Nhiên',
      category: 'Nội Thất Phòng Ngủ',
      price: '32.000.000₫',
      oldPrice: '',
      image: '/images/products/giuong-ngu-go-tu-nhien.jpg',
      tag: 'Độc quyền',
    },
    {
      id: 5,
      name: 'Tủ Quần Áo 4 Cánh Milan Gỗ Sồi',
      category: 'Tủ Quần Áo',
      price: '28.800.000₫',
      oldPrice: '31.500.000₫',
      image: '/images/products/tu-quan-ao.jpg',
      tag: 'Mới',
    },
    {
      id: 6,
      name: 'Bàn Trà Đôi Mặt Đá Marble Elegance',
      category: 'Bàn Trà Phòng Khách',
      price: '11.500.000₫',
      oldPrice: '',
      image: '/images/products/ban-tra-doi.jpg',
      tag: 'Bán chạy',
    },
    {
      id: 7,
      name: 'Kệ Tivi Gỗ Óc Chó Contemporary',
      category: 'Kệ Tivi & Trang Trí',
      price: '19.200.000₫',
      oldPrice: '22.000.000₫',
      image: '/images/products/ke-tivi-oc-cho.jpg',
      tag: '-12%',
    },
    {
      id: 8,
      name: 'Đèn Cây Đứng Nghệ Thuật Bắc Âu',
      category: 'Đèn & Trang Trí',
      price: '6.800.000₫',
      oldPrice: '',
      image: '/images/products/den-cay-nghe-thuat.jpg',
      tag: 'Độc quyền',
    },
  ];

  // Dữ liệu 3 danh mục chủ đạo (Sofa, Giường, Bàn ăn)
  const coreCategories = [
    {
      title: 'Sofa',
      link: '/san-pham/sofa-da',
      image: '/images/categories/sofa-3cho.jpg',
    },
    {
      title: 'Giường',
      link: '/san-pham/giuong-ngu',
      image: '/images/categories/giuong-ngu.jpg',
    },
    {
      title: 'Bàn ăn',
      link: '/san-pham/ban-an',
      image: '/images/categories/ban-an.jpg',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO BANNER - SLIDER TỰ ĐỘNG VỚI HIỆU ỨNG KEN BURNS (SLOW ZOOM & FADE) */}
      <section className="relative w-full h-[620px] lg:h-[740px] flex items-center justify-center overflow-hidden select-none bg-neutral-900">
        {/* Slides Container với hiệu ứng Crossfade & Ken Burns */}
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ảnh nền có hiệu ứng Ken Burns (Zoom-in từ từ từ scale-100 lên scale-110 trong 6s) */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  key={isActive ? `img-active-${slide.id}` : `img-inactive-${slide.id}`}
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center ${
                    isActive ? 'animate-kenburns' : 'scale-100'
                  }`}
                />
                {/* Lớp phủ chuyển màu nhẹ nhàng, giữ ảnh sáng sủa, ấm cúng và tôn chữ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
              </div>

              {/* Nội dung Banner từng slide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-5 transition-all duration-700 delay-150 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-neutral-200">
                    {slide.tag}
                  </p>

                  <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-wide italic text-white drop-shadow-md">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg font-light text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
                    {slide.description}
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to={slide.primaryBtn.link}
                      className="w-full sm:w-auto px-8 py-3.5 bg-white text-neutral-900 font-semibold text-xs tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-all duration-300 shadow-lg"
                    >
                      {slide.primaryBtn.text}
                    </Link>

                    {slide.secondaryBtn && (
                      <Link
                        to={slide.secondaryBtn.link}
                        className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white text-white font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-neutral-900 transition-all duration-300 shadow-lg backdrop-blur-sm"
                      >
                        {slide.secondaryBtn.text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Nút mũi tên chuyển slide thủ công bên Trái */}
        <button
          onClick={handlePrevSlide}
          aria-label="Slide trước"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* Nút mũi tên chuyển slide thủ công bên Phải */}
        <button
          onClick={handleNextSlide}
          aria-label="Slide tiếp theo"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group focus:outline-none"
        >
          <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* Thanh điều hướng: Các vạch tiến trình (Progress Bar Indicators) chuẩn phong cách Nhà Xinh */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3">
          {heroSlides.map((_, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={index}
                onClick={() => handleGoToSlide(index)}
                aria-label={`Chuyển sang slide ${index + 1}`}
                className="group py-2 focus:outline-none"
              >
                <div className="w-14 sm:w-20 h-1.5 bg-white/35 rounded-full overflow-hidden backdrop-blur-sm group-hover:bg-white/60 transition-all">
                  {isActive ? (
                    <div
                      key={`progress-${currentSlide}`}
                      className="h-full bg-white rounded-full animate-progress-fill"
                    />
                  ) : (
                    <div className="h-full w-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SECTION 3 CỘT (SOFA, GIƯỜNG, BÀN ĂN) CHUẨN PHONG CÁCH NHÀ XINH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-2 sm:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {coreCategories.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group block text-center"
            >
              {/* Tỷ lệ khung hình dọc aspect-[3/4], tràn viền thanh lịch, scale nhẹ khi hover */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Tên danh mục đặt ngay dưới mỗi ảnh, font chữ gọn gàng, căn giữa */}
              <div className="mt-2.5 sm:mt-3">
                <h3 className="text-base sm:text-lg font-medium text-neutral-900 tracking-wider group-hover:text-neutral-600 transition-colors uppercase">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. KHÔNG GIAN SỐNG THEO PHÒNG (CATEGORIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            KHÔNG GIAN SỐNG
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
            Khơi nguồn cảm hứng tổ ấm
          </h2>
          <div className="w-12 h-0.5 bg-neutral-900 mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="group relative overflow-hidden bg-neutral-100 aspect-[4/5] block rounded-sm shadow-sm"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-normal group-hover:translate-x-1 transition-transform">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-300 font-light">{cat.subtitle}</p>
                <div className="pt-2 flex items-center text-xs font-medium text-amber-300 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Khám phá phòng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SẢN PHẨM NỔI BẬT MỚI NHẤT (CAROUSEL TRƯỢT NGANG MƯỢT MÀ) */}
      <section className="bg-white border-y border-neutral-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                TUYỆT TÁC THIẾT KẾ
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
                Sản phẩm nổi bật mới nhất
              </h2>
            </div>

            <div>
              <Link
                to="/san-pham"
                className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-neutral-900 hover:text-amber-800 transition-colors"
              >
                <span>Xem tất cả sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cụm Carousel sản phẩm trượt ngang kèm 2 Floating Navigation Arrows ở 2 bên */}
          <div className="relative group">
            {/* Nút lướt sang trái nằm đè lên mép trái căn giữa khung hình sản phẩm (Floating Arrow Left) */}
            <button
              type="button"
              onClick={() => scrollProducts('left')}
              className="absolute -left-3 sm:-left-5 top-[139px] sm:top-[149px] lg:top-[156px] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-neutral-800 hover:text-neutral-950 border border-neutral-200/90 shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Lướt sang trái"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dải Carousel sản phẩm trượt ngang mượt mà */}
            <div
              ref={productScrollRef}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-1 snap-x snap-mandatory px-1"
            >
              {featuredProducts.map((p) => (
                <div
                  key={p.id}
                  className="w-[270px] sm:w-[290px] lg:w-[305px] flex-shrink-0 snap-start group/card bg-neutral-50/50 rounded border border-neutral-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {p.tag && (
                      <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm shadow-sm">
                        {p.tag}
                      </span>
                    )}
                    {/* Quick Action buttons */}
                    <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-white/90 text-neutral-800 hover:bg-neutral-900 hover:text-white flex items-center justify-center shadow-md transition-colors"
                        title="Thêm vào yêu thích"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-white/90 text-neutral-800 hover:bg-neutral-900 hover:text-white flex items-center justify-center shadow-md transition-colors"
                        title="Xem nhanh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div>
                      <p className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {p.category}
                      </p>
                      <h3 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-600 transition-colors mt-0.5">
                        <Link to={`/san-pham/${p.id}`}>{p.name}</Link>
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-sm font-bold text-neutral-900">{p.price}</span>
                        {p.oldPrice && (
                          <span className="text-xs text-neutral-400 line-through ml-2">
                            {p.oldPrice}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút lướt sang phải nằm đè lên mép phải căn giữa khung hình sản phẩm (Floating Arrow Right) */}
            <button
              type="button"
              onClick={() => scrollProducts('right')}
              className="absolute -right-3 sm:-right-5 top-[139px] sm:top-[149px] lg:top-[156px] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-neutral-800 hover:text-neutral-950 border border-neutral-200/90 shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Lướt sang phải"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Nút xem tất cả sản phẩm trên mobile */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/san-pham"
              className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-neutral-900 hover:text-amber-800 transition-colors py-2 px-5 border border-neutral-300 rounded"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. DỊCH VỤ THIẾT KẾ NỘI THẤT (MÀU BE HIỆN ĐẠI THEO PHONG CÁCH NHÀ XINH) */}
      <section id="thiet-ke-noi-that" className="w-full bg-[#f4f2ee] mt-12 sm:mt-16 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Cột trái: Nội dung màu be, cỡ chữ nhỏ gọn gàng, tinh tế */}
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 flex flex-col justify-center items-start space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-semibold text-neutral-800 tracking-tight">
              Thiết kế nội thất
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-600 font-normal leading-relaxed max-w-md">
              Với kinh nghiệm hơn 27 năm trong thiết kế và hoàn thiện nội thất cùng đội ngũ thiết kế chuyên nghiệp, TK House mang đến giải pháp toàn diện trong nội thất.
            </p>
            <div className="pt-1">
              <Link
                to="/thiet-ke-noi-that"
                className="inline-block px-7 py-2 text-xs font-medium text-neutral-700 border border-neutral-400 rounded-full hover:bg-neutral-800 hover:text-white hover:border-neutral-800 transition-all duration-300"
              >
                Xem thêm
              </Link>
            </div>
          </div>

          {/* Cột phải: Ảnh phòng ăn hiện đại ngập tràn ánh sáng */}
          <div className="h-72 sm:h-96 lg:h-[420px] w-full overflow-hidden">
            <img
              src="/images/banners/thiet-ke.jpg"
              alt="Thiết kế nội thất TK House"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </section>

      {/* 5. PHẦN CÂU CHUYỆN THƯƠNG HIỆU (OUR STORY) - ĐẶT GẦN CUỐI */}
      <section id="cau-chuyen-thuong-hieu" className="w-full bg-[#faf8f5] pt-14 sm:pt-20 pb-20 sm:pb-28 border-t border-neutral-200/50 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* DÒNG CHỮ NGĂN CÁCH GIỮA PHẦN TƯ VẤN THIẾT KẾ VÀ CÂU CHUYỆN */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-neutral-500 uppercase block">
              CÂU CHUYỆN THƯƠNG HIỆU
            </span>
            <div className="w-12 h-0.5 bg-neutral-900 mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* CỘT TRÁI: Bố cục 2 ảnh so le nghệ thuật */}
            <div className="lg:col-span-6 relative pb-10 sm:pb-14 pr-6 sm:pr-10">
              {/* Ảnh lớn chính: Góc nội thất êm dịu, ánh sáng dịu dàng */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] w-[82%] sm:w-[84%] overflow-hidden rounded-sm shadow-md bg-neutral-200">
                <img
                  src="/images/story/st1.jpg"
                  alt="Không gian sống êm dịu TK House"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Ảnh nhỏ chi tiết cận cảnh đổ bóng mờ mềm mại */}
              <div className="absolute right-0 bottom-0 w-[52%] sm:w-[48%] aspect-[4/5] overflow-hidden rounded-sm shadow-2xl border-4 sm:border-[6px] border-[#faf8f5] bg-neutral-100">
                <img
                  src="/images/story/st2.jpg"
                  alt="Chi tiết thủ công tỉ mỉ"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Viền góc nghệ thuật tạo chiều sâu */}
              <div className="absolute -top-3 -left-3 w-24 h-24 border-t border-l border-amber-900/20 -z-0 hidden sm:block pointer-events-none"></div>
            </div>

            {/* CỘT PHẢI: Nội dung tự sự nhẹ nhàng, font serif mềm mại */}
            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <div className="space-y-2.5">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-neutral-900 leading-[1.25] tracking-normal">
                  Nơi chốn đi về, <br className="hidden sm:inline" />
                  <span className="italic font-normal text-neutral-800">khơi nguồn xúc cảm an yên</span>
                </h2>
              </div>

              <div className="space-y-3.5 text-xs sm:text-[13.5px] text-neutral-600 font-light leading-relaxed">
                <p>
                  Với <strong className="font-medium text-neutral-800">TK House</strong>, mỗi món đồ nội thất không đơn thuần là vật dụng bài trí trong bốn bức tường, mà là một thực thể sống chứa đựng linh hồn, văn hóa và từng nhịp thở êm đềm của năm tháng.
                </p>
                <p>
                  Chúng tôi chắt lọc sự chuẩn mực của ngôn ngữ thiết kế đương đại hòa quyện cùng nét đằm thắm, ấm cúng của nếp nhà Việt. Từng đường cong mềm mại của gỗ, từng thớ vải da tinh tuyển hay bề mặt đá mát lành đều được tạo tác để nâng niu từng giác quan và lưu giữ trọn vẹn những phút giây gắn kết gia đình.
                </p>
              </div>

              {/* Trích dẫn nổi bật viền nét mỏng bên trái */}
              <blockquote className="border-l-2 border-amber-700/60 pl-5 py-1.5 text-xs sm:text-sm font-serif italic text-neutral-800 leading-relaxed bg-amber-50/50 rounded-r">
                “Một ngôi nhà đẹp không chỉ đo bằng thước tấc vật liệu, mà được đong đầy bằng sự dịu dàng của ánh sáng và cảm giác thuộc về.”
              </blockquote>

              {/* Nút xem thêm tinh giản */}
              <div className="pt-2">
                <Link
                  to="/cau-chuyen"
                  className="group inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:text-amber-900 transition-colors pb-1 border-b border-neutral-900 hover:border-amber-900"
                >
                  <span>KHÁM PHÁ CÂU CHUYỆN TK HOUSE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
