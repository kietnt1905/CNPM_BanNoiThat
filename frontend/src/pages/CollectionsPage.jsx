import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
  Share2,
  Bookmark,
  BookOpen,
  Calendar,
  Eye,
  MapPin,
  ShieldCheck,
  MoveRight,
  Home
} from 'lucide-react';

// ==========================================
// 1. DỮ LIỆU CÁC BỘ SƯU TẬP ĐỘC BẢN (COLLECTIONS DATA)
// ==========================================
export const COLLECTIONS_DATA = [
  {
    id: '01',
    number: '01',
    code: 'COLLECTION 01',
    slug: 'victoria',
    name: 'BỘ SƯU TẬP VICTORIA',
    subtitle: 'Hơi Thở Lãng Mạn Miền Quê Nước Pháp',
    style: 'phap-co-dien',
    styleLabel: 'Cổ Điển Pháp & Lãng Mạn',
    season: 'SIGNATURE 2026',
    concept: 'Đường cong uốn lượn từ gỗ sồi khối FAS hòa quyện cùng da bò Ý ủ thảo mộc, khơi gợi xúc cảm quý tộc thanh lịch và sang trọng vượt thời gian.',
    mainImage: '/images/banners/banner-hero/banner-victoria.jpg',
    mainImageCaption: 'Phối cảnh phòng khách trang viên hoàng gia',
    detailImage: '/images/products/sofa-3-cho-victoria.jpg',
    detailCaption: 'Sofa Victoria 3 Chỗ da bò Tuscany ủ thảo mộc',
    contextImage: '/images/categories/sofa-3cho.jpg',
    materials: [
      { name: 'Da Bò Tuscany (Ý)', detail: 'Ủ thảo mộc 40 ngày', color: '#8C5D3E' },
      { name: 'Gỗ Sồi Khối FAS', detail: 'Bắc Mỹ sấy chân không', color: '#D4B282' },
      { name: 'Đồng Thau Cổ PVD', detail: 'Mạ Satin mờ tinh xảo', color: '#C8A97E' },
    ],
    spaces: 'Phòng Khách Thượng Lưu • Master Suite',
    productCount: '12 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=victoria',
  },
  {
    id: '02',
    number: '02',
    code: 'COLLECTION 02',
    slug: 'valencia',
    name: 'BỘ SƯU TẬP VALENCIA',
    subtitle: 'Bờ Biển Địa Trung Hải & Hình Khối Hữu Cơ',
    style: 'dia-trung-hai',
    styleLabel: 'Địa Trung Hải & Phóng Khoáng',
    season: 'SPRING / SUMMER 2026',
    concept: 'Đá Marble Calacatta vân mây vàng champagne kết hợp cùng phom dáng bo tròn vỗ về nếp sống tự do, khoáng đạt và ngập tràn ánh nắng.',
    mainImage: '/images/banners/banner-hero/banner-cotenoire.jpg',
    mainImageCaption: 'Phối cảnh phòng khách Địa Trung Hải đón trọn ánh sáng',
    detailImage: '/images/products/ban-tra-doi.jpg',
    detailCaption: 'Bàn trà đôi Marble Calacatta & Titan PVD mạ vàng',
    contextImage: '/images/lookbook/lookbook-living.jpg',
    materials: [
      { name: 'Đá Marble Calacatta', detail: 'Vân mây tự nhiên nguyên khối', color: '#E8E5DF' },
      { name: 'Titan Khung Mạ Vàng', detail: 'Bóng Satin Champagne', color: '#E6C280' },
      { name: 'Vải Len Bouclé', detail: 'Dệt sợi xoắn Atelier mềm mại', color: '#F3EFE9' },
    ],
    spaces: 'Phòng Khách Đương Đại • Góc Thưởng Trà',
    productCount: '8 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=valencia',
  },
  {
    id: '03',
    number: '03',
    code: 'COLLECTION 03',
    slug: 'moretti',
    name: 'BỘ SƯU TẬP MORETTI',
    subtitle: 'Chủ Nghĩa Tối Giản Milanese Sắc Sảo',
    style: 'y-duong-dai',
    styleLabel: 'Đương Đại Ý',
    season: 'MILANO DESIGN 2026',
    concept: 'Đá thiêu kết nung ép 1200°C chống trầy xước vĩnh cửu phối cùng gỗ óc chó Bắc Mỹ, biểu tượng cho phong cách sống vị lai sắc nét.',
    mainImage: '/images/banners/banner-hero/banner-modern.jpg',
    mainImageCaption: 'Không gian sống & làm việc chuẩn kiến trúc Milan',
    detailImage: '/images/products/ke-tivi-oc-cho.jpg',
    detailCaption: 'Kệ lưu trữ óc chó cánh kính khói viền kim loại',
    contextImage: '/images/categories/phong-lam-viec.jpg',
    materials: [
      { name: 'Gỗ Óc Chó FAS', detail: 'Vân cuộn sóng Bắc Mỹ cao cấp', color: '#4A3525' },
      { name: 'Đá Ceramic Nano', detail: 'Chống xước & nhiệt 1200°C', color: '#3A3836' },
      { name: 'Hợp Kim Nhôm Đúc', detail: 'Sơn tĩnh điện vi tinh thể', color: '#2C2B29' },
    ],
    spaces: 'Phòng Giám Đốc • Không Gian Atelier',
    productCount: '10 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=moretti',
  },
  {
    id: '04',
    number: '04',
    code: 'COLLECTION 04',
    slug: 'osaka',
    name: 'BỘ SƯU TẬP OSAKA',
    subtitle: 'Tinh Thần Japandi & Thiền Định Wabi-Sabi',
    style: 'bac-au-japandi',
    styleLabel: 'Tối Giản Bắc Âu & Japandi',
    season: 'ALL SEASONS 2026',
    concept: 'Nghệ thuật đan mây mắt cáo thủ công kết hợp khung gỗ sồi trắng mộc mạc, tạo nên góc trú ẩn bình yên tĩnh tại giữa nhịp sống đô thị.',
    mainImage: '/images/products/ghe-thu-gian.jpg',
    mainImageCaption: 'Ghế Armchair mây Osaka tựa lưng công thái học thư thái',
    detailImage: '/images/lookbook/lookbook-armchair.jpg',
    detailCaption: 'Chi tiết mây đan thủ công kết hợp gỗ sồi mộc mạc',
    contextImage: '/images/categories/phong-khach.jpg',
    materials: [
      { name: 'Mây Tự Nhiên Đan', detail: 'Mắt cáo thủ công làng nghề', color: '#C8A97E' },
      { name: 'Gỗ Sồi Trắng Bắc Mỹ', detail: 'Chứng nhận bền vững FSC', color: '#D9C5AB' },
      { name: 'Vải Linen Dệt Thô', detail: 'Sợi lanh hữu cơ thoáng mát', color: '#EDE6DD' },
    ],
    spaces: 'Góc Đọc Sách • Phòng Khách Thư Thái',
    productCount: '7 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=osaka',
  },
  {
    id: '05',
    number: '05',
    code: 'COLLECTION 05',
    slug: 'elegance',
    name: 'BỘ SƯU TẬP ELEGANCE',
    subtitle: 'Bàn Tiệc Hoàng Gia & Đá Thiêu Kết Ý',
    style: 'y-duong-dai',
    styleLabel: 'Đương Đại Ý',
    season: 'ANNUAL SUITE 2026',
    concept: 'Mặt đá Ceramic Nano kháng hoàn toàn vết ố rượu vang, nâng tầm những bữa tiệc gia đình sum vầy thành trải nghiệm ẩm thực thượng đỉnh.',
    mainImage: '/images/products/ban-an.jpg',
    mainImageCaption: 'Bàn ăn 8 chỗ Elegance mặt đá Calacatta chân óc chó',
    detailImage: '/images/lookbook/lookbook-dining.jpg',
    detailCaption: 'Phòng ăn đương đại kết hợp ghế da bò Nappa Roma',
    contextImage: '/images/categories/phong-am.jpg',
    materials: [
      { name: 'Đá Ceramic Nano', detail: 'Ép áp lực 25.000 tấn chống ố', color: '#FAF8F5' },
      { name: 'Gỗ Óc Chó Chân Trụ', detail: 'Tạo hình khối điêu khắc tinh xảo', color: '#583D2A' },
      { name: 'Da Bò Nappa Roma', detail: 'Êm ái, kháng bám bẩn cao cấp', color: '#7E634F' },
    ],
    spaces: 'Phòng Ăn Đương Đại • Bếp Đảo Kiến Trúc',
    productCount: '9 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=elegance',
  },
  {
    id: '06',
    number: '06',
    code: 'COLLECTION 06',
    slug: 'coastal',
    name: 'BỘ SƯU TẬP COASTAL',
    subtitle: 'Biệt Thự Ven Biển & Gỗ Sáng Phóng Khoáng',
    style: 'dia-trung-hai',
    styleLabel: 'Địa Trung Hải & Phóng Khoáng',
    season: 'SUMMER VILLA 2026',
    concept: 'Gam màu be cát dịu mắt, chất liệu gỗ sồi sáng tự nhiên và đá trắng mây mở rộng tối đa biên độ thị giác cho không gian nghỉ dưỡng tại gia.',
    mainImage: '/images/lookbook/lookbook-living.jpg',
    mainImageCaption: 'Không gian mở đón gió biển và ánh sáng tràn ngập',
    detailImage: '/images/banners/phong-khach.jpg',
    detailCaption: 'Phòng khách thông tầng phong cách Coastal sang trọng',
    contextImage: '/images/lookbook/lookbook-exterior.jpg',
    materials: [
      { name: 'Gỗ Sồi Trắng Sáng', detail: 'Hoàn thiện dầu mờ tự nhiên', color: '#D6C4AD' },
      { name: 'Đá Marble Trắng Mây', detail: 'Mài mờ Hone finish dịu mắt', color: '#ECE8DF' },
      { name: 'Vải Cotton Linen', detail: 'Mộc mạc, kháng ẩm tự nhiên', color: '#F7F4EC' },
    ],
    spaces: 'Biệt Thự Nghỉ Dưỡng • Penthouse Ven Biển',
    productCount: '6 Kiệt Tác',
    targetCategoryLink: '/san-pham?collection=coastal',
  },
];

// ==========================================
// 2. CÁC TÙY CHỌN BỘ LỌC PHONG CÁCH
// ==========================================
export const STYLE_FILTERS = [
  { id: 'all', label: 'Tất cả BST' },
  { id: 'y-duong-dai', label: 'Đương Đại Ý' },
  { id: 'bac-au-japandi', label: 'Tối Giản Bắc Âu' },
  { id: 'phap-co-dien', label: 'Cổ Điển Pháp' },
  { id: 'dia-trung-hai', label: 'Địa Trung Hải' },
];

export default function CollectionsPage() {
  const { collectionSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStyle, setActiveStyle] = useState('all');
  const collectionRefs = useRef({});

  // Đọc query hoặc param từ URL
  useEffect(() => {
    const queryStyle = searchParams.get('style');
    if (queryStyle) {
      setActiveStyle(queryStyle);
    }
  }, [searchParams]);

  // Tự động cuộn đến bộ sưu tập nếu có slug trên URL
  useEffect(() => {
    if (collectionSlug && collectionRefs.current[collectionSlug]) {
      setTimeout(() => {
        collectionRefs.current[collectionSlug].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
  }, [collectionSlug]);

  const handleStyleChange = (styleId) => {
    setActiveStyle(styleId);
    const newParams = new URLSearchParams(searchParams);
    if (styleId === 'all') {
      newParams.delete('style');
    } else {
      newParams.set('style', styleId);
    }
    setSearchParams(newParams);
  };

  // Lọc danh sách bộ sưu tập theo phong cách
  const filteredCollections = COLLECTIONS_DATA.filter((col) => {
    if (activeStyle === 'all') return true;
    return col.style === activeStyle;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1C1917] selection:bg-[#8C6A48] selection:text-white pb-36">
      {/* 1. TOP BREADCRUMB & METADATA BAR (TINH GỌN & HIỆN ĐẠI) */}
      <div className="border-b border-stone-200/80 bg-[#FAF9F5]/90 backdrop-blur-md sticky top-[73px] sm:top-[77px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-stone-900 transition-colors flex items-center space-x-1">
              <Home className="w-3.5 h-3.5 text-stone-400 hover:text-stone-900 transition-colors" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-stone-300">/</span>
            <span className="font-semibold text-stone-900">Bộ Sưu Tập Độc Bản</span>
            {activeStyle !== 'all' && (
              <>
                <span className="text-stone-300">/</span>
                <span className="text-[#8C6A48] font-medium">
                  {STYLE_FILTERS.find((s) => s.id === activeStyle)?.label}
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono tracking-[0.25em] text-[#8C6A48] uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6A48] animate-pulse"></span>
            <span>EDITIONS 2026 • TK HOUSE ATELIER</span>
          </div>
        </div>
      </div>

      {/* 2. GRAND ARCHITECTURAL HERO BANNER (ĐẦU TRANG SIÊU NỔI BẬT & ĐẲNG CẤP KIẾN TRÚC) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-950 text-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-stone-800">
          {/* Ảnh nền không gian sống biểu tượng kiến trúc */}
          <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
            <img
              src="/images/lookbook/lookbook-living.jpg"
              alt="TK House Architectural Living"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.88] contrast-[1.05] transition-transform duration-1000 ease-out hover:scale-100"
            />

            {/* Gradient điện ảnh đa lớp tinh tế (không bị đen kịt, giữ trọn độ sáng & chiều sâu ảnh) */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent" />

            {/* Eyebrow Tag trên cùng */}
            <div className="absolute top-6 left-6 sm:top-10 sm:left-12 z-10 flex items-center gap-3">
              <span className="backdrop-blur-xl bg-white/15 text-stone-100 text-[10px] sm:text-[11px] font-mono tracking-[0.3em] px-4 py-2 rounded-full border border-white/25 uppercase font-semibold shadow-lg">
                ✦ TK HOUSE • ARCHITECTURAL COLLECTIONS 2026
              </span>
            </div>

            {/* Khối nội dung chính giữa & chân banner */}
            <div className="absolute bottom-8 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12 z-10 max-w-4xl space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.35em] text-[#E6C280] font-semibold block">
                  THE MASTERPIECE EXHIBITION
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal italic tracking-tight leading-[1.12] drop-shadow-xl">
                  Kiệt Tác Kiến Trúc & Các Bộ Sưu Tập Độc Bản
                </h1>
              </div>

              <p className="font-sans text-xs sm:text-sm lg:text-base text-stone-200 font-light max-w-2xl leading-relaxed tracking-wide drop-shadow-md">
                Mỗi bộ sưu tập là một tuyên ngôn kiến trúc độc bản — Nơi hình khối điêu khắc giao hòa cùng cảm xúc chất liệu nguyên bản trường tồn.
              </p>

              {/* 3 Thẻ chỉ số đẳng cấp bằng kính mờ */}
              <div className="pt-2 flex items-center flex-wrap gap-2.5 sm:gap-4 text-xs">
                <div className="backdrop-blur-xl bg-white/10 hover:bg-white/20 transition-colors text-white px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6C280]"></span>
                  <span className="font-mono text-[11px] tracking-wider uppercase font-medium">06 BỘ SƯU TẬP</span>
                </div>
                <div className="backdrop-blur-xl bg-white/10 hover:bg-white/20 transition-colors text-white px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6C280]"></span>
                  <span className="font-mono text-[11px] tracking-wider uppercase font-medium">52+ THIẾT KẾ ĐỘC QUYỀN</span>
                </div>
                <div className="backdrop-blur-xl bg-[#8C6A48]/85 text-amber-100 px-4 py-2 rounded-full border border-amber-300/30 flex items-center space-x-2 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span className="font-mono text-[11px] tracking-wider uppercase font-semibold">100% THỦ CÔNG NGHỆ NHÂN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BỘ LỌC PHONG CÁCH THANH LỊCH (STICKY MINIMALIST FILTER BAR) */}
      <section className="sticky top-[112px] sm:top-[121px] z-20 pb-4 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 sm:p-2.5 border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            {/* Cụm Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
              {STYLE_FILTERS.map((filter) => {
                const isActive = activeStyle === filter.id;
                const count =
                  filter.id === 'all'
                    ? COLLECTIONS_DATA.length
                    : COLLECTIONS_DATA.filter((c) => c.style === filter.id).length;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleStyleChange(filter.id)}
                    className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs whitespace-nowrap transition-all duration-300 font-medium ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`ml-1.5 text-[10px] font-mono ${
                        isActive ? 'text-[#E6C280]' : 'text-stone-400'
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Nút xem nhanh toàn bộ sản phẩm */}
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-stone-200 flex-shrink-0">
              <Link
                to="/san-pham"
                className="inline-flex items-center space-x-1.5 text-xs text-[#8C6A48] hover:text-stone-950 font-semibold tracking-wide transition-colors"
              >
                <span>Kho toàn bộ sản phẩm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODERN ARCHITECTURAL SHOWCASE (TỪNG BỘ SƯU TẬP NỔI BẬT, ÍT CHỮ, NÚT KHÁM PHÁ THIẾT KẾ RỰC RỠ) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 space-y-20 sm:space-y-28">
        <AnimatePresence mode="popLayout">
          {filteredCollections.map((col, index) => {
            return (
              <motion.article
                key={col.slug}
                id={col.slug}
                ref={(el) => (collectionRefs.current[col.slug] = el)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
                className="group relative rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-stone-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden p-6 sm:p-10 lg:p-12 scroll-mt-36"
              >
                {/* 1. TOP HEADER CỦA BỘ SƯU TẬP: Số thứ tự & Phong cách */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-5 mb-8">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="text-2xl sm:text-3xl font-mono font-light text-[#8C6A48] tracking-tighter">
                      {col.number}
                    </span>
                    <span className="h-4 w-px bg-stone-300"></span>
                    <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-stone-500 font-medium">
                      {col.styleLabel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                      {col.season}
                    </span>
                  </div>
                </div>

                {/* 2. BỐ CỤC CHÍNH: 2 KHỐI HÌNH ẢNH KIẾN TRÚC ĐẮT GIÁ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-8 sm:mb-10">
                  {/* Ảnh chính toàn cảnh không gian sống (8 cột) */}
                  <Link
                    to={col.targetCategoryLink}
                    className="lg:col-span-8 group/main relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] bg-stone-100 shadow-md block"
                  >
                    <img
                      src={col.mainImage}
                      alt={col.name}
                      className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover/main:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-300 group-hover/main:from-black/85" />
                    
                    {/* Badge chú thích góc dưới ảnh chính */}
                    <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between z-10">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E6C280] block font-semibold mb-1">
                          PHỐI CẢNH TOÀN CẢNH
                        </span>
                        <p className="font-serif italic text-base sm:text-lg text-white/95 drop-shadow line-clamp-1">
                          {col.mainImageCaption}
                        </p>
                      </div>
                      <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-amber-200 font-mono tracking-wider bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <span>Chiêm ngưỡng</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>

                  {/* Ảnh cận cảnh chất liệu & chi tiết chế tác (4 cột) */}
                  <Link
                    to={col.targetCategoryLink}
                    className="lg:col-span-4 group/detail relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto bg-stone-100 shadow-md flex flex-col justify-end"
                  >
                    <img
                      src={col.detailImage}
                      alt={col.detailCaption}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover/detail:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="relative p-5 sm:p-6 text-white space-y-1 z-10">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E6C280] block font-semibold">
                        CHI TIẾT CHẾ TÁC NGHỆ NHÂN
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-white/90 line-clamp-2">
                        {col.detailCaption}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* 3. KHỐI THÔNG TIN TINH GỌN (ÍT CHỮ LẠI, CỰC KỲ ĐẮT GIÁ) & NÚT "KHÁM PHÁ THIẾT KẾ" NỔI BẬT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end pt-2 border-t border-stone-100">
                  {/* Cột trái: Tên BST & 1 Câu Ý Niệm Độc Bản */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#8C6A48] font-bold block">
                        {col.code} • {col.subtitle}
                      </span>
                      <h2 className="font-serif text-2xl sm:text-4xl text-stone-900 font-normal tracking-tight">
                        {col.name}
                      </h2>
                    </div>

                    {/* Câu triết lý thiết kế cô đọng (Ít chữ, giàu cảm xúc) */}
                    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-2xl">
                      {col.concept}
                    </p>

                    {/* Dải chất liệu quý đặc tuyển */}
                    <div className="pt-2 flex items-center flex-wrap gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-stone-400 mr-1">
                        CHẤT LIỆU:
                      </span>
                      {col.materials.map((mat, mIdx) => (
                        <div
                          key={mIdx}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-stone-200/90 text-stone-800 text-xs font-medium"
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: mat.color }}
                          />
                          <span>{mat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cột phải: NÚT "KHÁM PHÁ THIẾT KẾ" SIÊU NỔI BẬT & ĐẲNG CẤP */}
                  <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-end gap-4">
                    <div className="text-xs font-mono text-stone-500 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Không gian: {col.spaces}</span>
                    </div>

                    {/* Nút KHÁM PHÁ THIẾT KẾ nổi bật với gradient sang trọng, kích thước lớn và hiệu ứng ấn tượng */}
                    <Link
                      to={col.targetCategoryLink}
                      className="group/btn relative inline-flex items-center justify-center space-x-3.5 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-stone-900 hover:bg-[#8C6A48] text-white text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase shadow-[0_12px_35px_rgba(28,25,23,0.22)] hover:shadow-[0_18px_45px_rgba(140,106,72,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto text-center"
                    >
                      <span className="relative z-10 text-amber-100 group-hover/btn:text-white transition-colors">
                        Khám Phá Thiết Kế
                      </span>
                      <ArrowRight className="w-4 h-4 text-amber-300 group-hover/btn:text-white transition-all duration-300 group-hover/btn:translate-x-2" />
                      <span className="text-[11px] font-mono font-normal opacity-70 ml-1 border-l border-white/20 pl-2">
                        {col.productCount}
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </main>
    </div>
  );
}
