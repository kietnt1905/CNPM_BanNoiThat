import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Filter,
  ArrowRight,
  Search,
  Star,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// 1. DATA ĐỊNH NGHĨA DANH MỤC SẢN PHẨM
// ==========================================
export const CATEGORY_GROUPS = [
  {
    group: 'BÀN CAO CẤP',
    groupSlug: 'ban',
    items: [
      { slug: 'ban-an', name: 'Bàn ăn cao cấp', desc: 'Mặt đá Ceramic chống ố, Gỗ óc chó FAS' },
      { slug: 'ban-tra', name: 'Bàn trà - Sofa', desc: 'Đá Marble & Gỗ sồi tự nhiên' },
      { slug: 'ban-lam-viec', name: 'Bàn làm việc', desc: 'Thiết kế công thái học hiện đại' },
      { slug: 'ban-trang-diem', name: 'Bàn trang điểm', desc: 'Đường nét uốn cong nhẹ nhàng' },
    ],
  },
  {
    group: 'GHẾ & SOFA',
    groupSlug: 'sofa',
    items: [
      { slug: 'sofa-da', name: 'Sofa da thật', desc: 'Da bò Ý thuộc thảo mộc tự nhiên 100%' },
      { slug: 'sofa-vai', name: 'Sofa vải nỉ', desc: 'Vải dệt cao cấp êm ái thoáng mát' },
      { slug: 'ghe-thu-gian', name: 'Ghế Armchair thư giãn', desc: 'Nâng niu từng phút giây an yên' },
      { slug: 'ghe-an', name: 'Ghế ăn sang trọng', desc: 'Đệm ngồi êm dịu, tựa cong duyên dáng' },
    ],
  },
];

// Dữ liệu banner và thông điệp kiến trúc theo từng danh mục
export const CATEGORY_META = {
  all: {
    title: 'Tất Cả Sản Phẩm & Kiệt Tác',
    tag: 'TK HOUSE COLLECTION 2026',
    subtitle: 'Tuyển tập nội thất kiến trúc đương đại',
    description:
      'Hội tụ trọn vẹn những tác phẩm nội thất thủ công chuẩn mực từ đá thiêu kết, da bò Ý thảo mộc và gỗ sồi khối. Khơi nguồn cảm xúc tĩnh tại và đẳng cấp thượng lưu cho tổ ấm.',
    image: '/images/lookbook/lookbook-living.jpg',
  },
  'ban-an': {
    title: 'Bàn Ăn Sang Trọng & Đương Đại',
    tag: 'DINING COLLECTION',
    subtitle: 'Mặt đá Ceramic Nano chống ố & Gỗ óc chó FAS',
    description:
      'Tuyển tập bàn ăn mặt đá Ceramic Nano tôi luyện nhiệt độ 1200°C chống xước vĩnh cửu và chân gỗ óc chó nguyên khối. Nơi gắn kết trọn vẹn những bữa tiệc gia đình ấm cúng.',
    image: '/images/banners/phong-an.jpg',
  },
  'ban-tra': {
    title: 'Bàn Trà - Sofa Tinh Tế',
    tag: 'LIVING CENTERPIECE',
    subtitle: 'Đá Marble Calacatta & Kim loại mạ PVD',
    description:
      'Sự kết hợp hoàn hảo giữa những đường vân mây Calacatta mềm mại và khung Titan mạ vàng sang trọng, đánh thức cảm xúc thanh lịch cho trung tâm phòng khách.',
    image: '/images/products/ban-tra-doi.jpg',
  },
  'ban-lam-viec': {
    title: 'Bàn Làm Việc Nghệ Thuật & Tiện Nghi',
    tag: 'ATELIER WORKSPACE',
    subtitle: 'Gỗ óc chó Bắc Mỹ & Thiết kế công thái học',
    description:
      'Không gian nuôi dưỡng những quyết định lớn và ý tưởng đột phá với hệ bàn gỗ nguyên tấm và tỉ lệ nhân trắc học chuẩn mực.',
    image: '/images/categories/phong-lam-viec.jpg',
  },
  'ban-trang-diem': {
    title: 'Bàn Trang Điểm Voile Tinh Khôi',
    tag: 'BEAUTY & ELEGANCE',
    subtitle: 'Gương Bỉ tráng bạc & Đường uốn lượn duyên dáng',
    description:
      'Từng góc bo mềm mại nâng niu những khoảnh khắc chăm sóc bản thân, tôn vinh nét đẹp kiêu sa và thanh lịch của quý cô.',
    image: '/images/products/ke-tivi-oc-cho.jpg',
  },
  'sofa-da': {
    title: 'Sofa Da Thật Tuscany Thượng Hạng',
    tag: 'ITALIAN HERITAGE',
    subtitle: 'Da bò Ý thuộc thảo mộc tự nhiên 100%',
    description:
      'Phương pháp thuộc da bằng tanin vỏ sồi cổ truyền qua 40 ngày tại Tuscany (Ý). Càng sử dụng bề mặt càng đằm sâu, bóng mượt độc bản và tỏa hương thảo mộc dịu nhẹ.',
    image: '/images/banners/phong-khach.jpg',
  },
  'sofa-vai': {
    title: 'Sofa Vải Dệt Bouclé Êm Ái',
    tag: 'SCANDINAVIAN CHIC',
    subtitle: 'Vải len Bouclé nhập khẩu & Đệm lông vũ 3 lớp',
    description:
      'Xúc cảm tiếp xúc mềm mại ôm ấp, thoáng mát vào mùa hạ và ấm áp vào mùa đông. Biểu tượng của phong cách nội thất Scandinavia thư thái.',
    image: '/images/categories/sofa-3cho.jpg',
  },
  'ghe-thu-gian': {
    title: 'Ghế Armchair & Thư Giãn Nghệ Thuật',
    tag: 'RELAXATION & ART',
    subtitle: 'Mây đan mắt cáo thủ công & Đệm lông vũ êm ái',
    description:
      'Điểm tựa hoàn mỹ sau những bộn bề công việc. Góc đọc sách, thưởng trà và đắm mình trong bản nhạc êm dịu giữa không gian tổ ấm.',
    image: '/images/products/ghe-thu-gian.jpg',
  },
  'ghe-an': {
    title: 'Ghế Ăn Sang Trọng & Êm Ái',
    tag: 'DINING CHAIRS',
    subtitle: 'Da Nappa cao cấp, Tựa cong ôm trọn cơ thể',
    description:
      'Sự hòa quyện giữa chất liệu da Nappa mềm mịn, mây tự nhiên và khung kim loại mạ PVD vàng, mang đến trải nghiệm dùng bữa trọn vẹn sự thoải mái.',
    image: '/images/lookbook/lookbook-dining.jpg',
  },
  'giuong-ngu': {
    title: 'Giường Ngủ Master Victoria Thư Thái',
    tag: 'MASTER BEDROOM',
    subtitle: 'Gỗ sồi tự nhiên, nẹp chỉ đồng vỗ về giấc ngủ sâu',
    description:
      'Chốn về riêng tư bình yên nhất. Tuyển tập giường ngủ master gỗ sồi khối và gỗ óc chó cao cấp nâng niu giấc ngủ an lành.',
    image: '/images/banners/phong-ngu.jpg',
  },
  'tu-ke': {
    title: 'Tab Đầu Giường & Tủ Kệ Cao Cấp',
    tag: 'STORAGE & LUXURY',
    subtitle: 'Cánh kính khói & Phụ kiện Hafele giảm chấn',
    description:
      'Thiết kế tối ưu công năng lưu trữ với thẩm mỹ thanh lịch, tạo nên sự đồng điệu tuyệt đối cho kiến trúc phòng ngủ và phòng khách.',
    image: '/images/products/tu-quan-ao.jpg',
  },
  ban: {
    title: 'Tuyển Tập Bàn Cao Cấp TK House',
    tag: 'TABLES COLLECTION',
    subtitle: 'Bàn ăn mặt đá, Bàn trà sofa & Bàn làm việc',
    description:
      'Tuyển tập những mẫu bàn được chế tác tinh xảo từ đá Ceramic Nano, Marble Calacatta và gỗ sồi khối tự nhiên.',
    image: '/images/banners/phong-an.jpg',
  },
  sofa: {
    title: 'Tuyển Tập Ghế & Sofa Cao Cấp',
    tag: 'SEATING COLLECTION',
    subtitle: 'Sofa da thật, Sofa nỉ Bouclé & Armchair thư giãn',
    description:
      'Đỉnh cao của sự êm ái và nghệ thuật tạo hình kiến trúc phòng khách thượng lưu, nâng niu từng phút giây sum vầy.',
    image: '/images/banners/phong-khach.jpg',
  },
  'phong-ngu': {
    title: 'Không Gian Phòng Ngủ Thư Thái',
    tag: 'BEDROOM SUITE',
    subtitle: 'Giường ngủ master, Tab đầu giường & Tủ quần áo',
    description:
      'Tuyển tập nội thất phòng ngủ chuẩn phong cách khách sạn 5 sao, kết hợp gỗ tự nhiên và ánh sáng ấm áp vỗ về giấc ngủ ngon.',
    image: '/images/banners/phong-ngu.jpg',
  },
  'phong-khach': {
    title: 'Không Gian Phòng Khách Đẳng Cấp',
    tag: 'LIVING ROOM SUITE',
    subtitle: 'Sofa da thật, Bàn trà đôi đá tự nhiên & Armchair',
    description:
      'Trung tâm sinh hoạt và tiếp đón những vị khách quý, thể hiện gu thẩm mỹ tinh tế và đẳng cấp của gia chủ.',
    image: '/images/banners/phong-khach.jpg',
  },
  'phong-an': {
    title: 'Không Gian Phòng Ăn Đương Đại',
    tag: 'DINING ROOM SUITE',
    subtitle: 'Bộ bàn ăn mặt đá Ceramic & Ghế ăn bọc da cao cấp',
    description:
      'Nơi thắp lửa yêu thương qua từng bữa cơm ấm cúng, thiết kế rộng rãi và vật liệu bền đẹp trường tồn.',
    image: '/images/banners/phong-an.jpg',
  },
};

// ==========================================
// 1.5. ĐỊNH NGHĨA METADATA CÁC BỘ SƯU TẬP (COLLECTIONS META)
// ==========================================
export const COLLECTIONS_META = {
  victoria: {
    slug: 'victoria',
    name: 'Victoria',
    title: 'Bộ Sưu Tập Victoria',
    tag: 'SIGNATURE COLLECTION 2026',
    subtitle: 'Hơi Thở Lãng Mạn Miền Quê Nước Pháp',
    description:
      'Đường cong uốn lượn từ gỗ sồi khối FAS hòa quyện cùng da bò Ý ủ thảo mộc, khơi gợi xúc cảm quý tộc thanh lịch và sang trọng vượt thời gian.',
    image: '/images/banners/banner-hero/banner-victoria.jpg',
  },
  valencia: {
    slug: 'valencia',
    name: 'Valencia',
    title: 'Bộ Sưu Tập Valencia',
    tag: 'MEDITERRANEAN LIVING',
    subtitle: 'Bờ Biển Địa Trung Hải & Hình Khối Hữu Cơ',
    description:
      'Đá Marble Calacatta vân mây vàng champagne kết hợp cùng phom dáng bo tròn vỗ về nếp sống tự do, khoáng đạt và ngập tràn ánh nắng.',
    image: '/images/banners/banner-hero/banner-cotenoire.jpg',
  },
  moretti: {
    slug: 'moretti',
    name: 'Moretti',
    title: 'Bộ Sưu Tập Moretti',
    tag: 'MILANESE CONTEMPORARY',
    subtitle: 'Chủ Nghĩa Tối Giản Milanese Sắc Sảo',
    description:
      'Đá thiêu kết nung ép 1200°C chống trầy xước vĩnh cửu phối cùng gỗ óc chó Bắc Mỹ, biểu tượng cho phong cách sống vị lai sắc nét.',
    image: '/images/banners/banner-hero/banner-modern.jpg',
  },
  osaka: {
    slug: 'osaka',
    name: 'Osaka',
    title: 'Bộ Sưu Tập Osaka',
    tag: 'JAPANDI & WABI-SABI',
    subtitle: 'Tinh Thần Japandi & Thiền Định Wabi-Sabi',
    description:
      'Nghệ thuật đan mây mắt cáo thủ công kết hợp khung gỗ sồi trắng mộc mạc, tạo nên góc trú ẩn bình yên tĩnh tại giữa nhịp sống đô thị.',
    image: '/images/products/ghe-thu-gian.jpg',
  },
  elegance: {
    slug: 'elegance',
    name: 'Elegance',
    title: 'Bộ Sưu Tập Elegance',
    tag: 'ROYAL DINING SUITE',
    subtitle: 'Bàn Tiệc Hoàng Gia & Đá Thiêu Kết Ý',
    description:
      'Mặt đá Ceramic Nano kháng hoàn toàn vết ố rượu vang, nâng tầm những bữa tiệc gia đình sum vầy thành trải nghiệm ẩm thực thượng đỉnh.',
    image: '/images/products/ban-an.jpg',
  },
  coastal: {
    slug: 'coastal',
    name: 'Coastal',
    title: 'Bộ Sưu Tập Coastal',
    tag: 'RESORT LIVING 2026',
    subtitle: 'Biệt Thự Ven Biển & Gỗ Sáng Phóng Khoáng',
    description:
      'Gam màu be cát dịu mắt, chất liệu gỗ sồi sáng tự nhiên và đá trắng mây mở rộng tối đa biên độ thị giác cho không gian nghỉ dưỡng tại gia.',
    image: '/images/lookbook/lookbook-living.jpg',
  },
};

// ==========================================
// 2. DANH SÁCH SẢN PHẨM HOÀN CHỈNH (MOCK DATA LUXURY)
// ==========================================
export const PRODUCTS_CATALOG = [
  // --- BÀN ĂN ---
  {
    id: 101,
    name: 'Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá',
    categorySlug: 'ban-an',
    categoryName: 'Bàn Ăn Cao Cấp',
    group: 'ban',
    collection: 'elegance',
    price: 46500000,
    priceDisplay: '46.500.000₫',
    oldPriceDisplay: '52.000.000₫',
    image: '/images/products/ban-an.jpg',
    secondaryImage: '/images/categories/phong-am.jpg',
    tag: 'Best Seller',
    material: 'Mặt đá Ceramic Nano & Gỗ Óc Chó FAS',
    materialType: 'stone',
    dimensions: 'D220 × R95 × C75 cm',
    rating: 5.0,
    inStock: true,
  },
  {
    id: 102,
    name: 'Bàn Ăn Mở Rộng Thông Minh Calacatta Gold',
    categorySlug: 'ban-an',
    categoryName: 'Bàn Ăn Cao Cấp',
    group: 'ban',
    collection: 'valencia',
    price: 24900000,
    priceDisplay: '24.900.000₫',
    oldPriceDisplay: '28.500.000₫',
    image: '/images/lookbook/lookbook-dining.jpg',
    secondaryImage: '/images/products/ban-an.jpg',
    tag: 'Mới Ra Mắt',
    material: 'Đá Thiêu Kết Calacatta & Khung Titan Mạ PVD',
    materialType: 'stone',
    dimensions: 'D180-240 × R90 × C75 cm',
    rating: 4.9,
    inStock: true,
  },

  // --- BÀN TRÀ ---
  {
    id: 201,
    name: 'Bàn Trà Đôi Mặt Đá Marble Calacatta Elegance',
    categorySlug: 'ban-tra',
    categoryName: 'Bàn Trà - Sofa',
    group: 'ban',
    collection: 'valencia',
    price: 11500000,
    priceDisplay: '11.500.000₫',
    oldPriceDisplay: '13.200.000₫',
    image: '/images/products/ban-tra-doi.jpg',
    secondaryImage: '/images/lookbook/lookbook-living.jpg',
    tag: 'Bán Chạy Nhất',
    material: 'Đá Marble Calacatta & Khung Titan Mạ Vàng',
    materialType: 'stone',
    dimensions: 'Ø90 × C45 cm & Ø60 × C38 cm',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 202,
    name: 'Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật',
    categorySlug: 'ban-tra',
    categoryName: 'Bàn Trà - Sofa',
    group: 'ban',
    collection: 'moretti',
    price: 8600000,
    priceDisplay: '8.600.000₫',
    oldPriceDisplay: '9.800.000₫',
    image: '/images/lookbook/lookbook-armchair.jpg',
    secondaryImage: '/images/products/ban-tra-doi.jpg',
    tag: 'Thiết Kế Tinh Xảo',
    material: 'Gỗ Óc Chó FAS Tự Nhiên & Dầu Lau Hữu Cơ',
    materialType: 'wood',
    dimensions: 'Ø75 × C42 cm',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 203,
    name: 'Bàn Trà Đôi Gỗ Sồi Coastal Trắng Mây',
    categorySlug: 'ban-tra',
    categoryName: 'Bàn Trà - Sofa',
    group: 'ban',
    collection: 'coastal',
    price: 9800000,
    priceDisplay: '9.800.000₫',
    oldPriceDisplay: '11.500.000₫',
    image: '/images/products/ban-tra-doi.jpg',
    secondaryImage: '/images/banners/phong-khach.jpg',
    tag: 'Resort Living',
    material: 'Gỗ Sồi Trắng Sáng & Mặt Đá Mài Mờ',
    materialType: 'wood',
    dimensions: 'Ø80 × C40 cm',
    rating: 4.8,
    inStock: true,
  },

  // --- BÀN LÀM VIỆC ---
  {
    id: 301,
    name: 'Bàn Làm Việc Giám Đốc Atelier Master Óc Chó',
    categorySlug: 'ban-lam-viec',
    categoryName: 'Bàn Làm Việc',
    group: 'ban',
    collection: 'moretti',
    price: 32000000,
    priceDisplay: '32.000.000₫',
    oldPriceDisplay: '36.500.000₫',
    image: '/images/categories/phong-lam-viec.jpg',
    secondaryImage: '/images/products/ke-tivi-oc-cho.jpg',
    tag: 'Độc Bản KTS',
    material: 'Gỗ Óc Chó Bắc Mỹ & Hộc Kéo Da Nappa',
    materialType: 'wood',
    dimensions: 'D180 × R85 × C76 cm',
    rating: 5.0,
    inStock: true,
  },
  {
    id: 302,
    name: 'Bàn Làm Việc Gỗ Sồi Japandi Modern',
    categorySlug: 'ban-lam-viec',
    categoryName: 'Bàn Làm Việc',
    group: 'ban',
    collection: 'osaka',
    price: 15900000,
    priceDisplay: '15.900.000₫',
    oldPriceDisplay: '18.000.000₫',
    image: '/images/categories/phong-lam-viec.jpg',
    secondaryImage: '/images/lookbook/lookbook-dining.jpg',
    tag: 'Tối Giản',
    material: 'Gỗ Sồi Trắng Bắc Mỹ & Ray Trượt Hafele',
    materialType: 'wood',
    dimensions: 'D160 × R75 × C75 cm',
    rating: 4.8,
    inStock: true,
  },

  // --- BÀN TRANG ĐIỂM ---
  {
    id: 303,
    name: 'Bàn Trang Điểm Voile Gương Tròn Đèn LED Cảm Ứng',
    categorySlug: 'ban-trang-diem',
    categoryName: 'Bàn Trang Điểm',
    group: 'ban',
    collection: 'elegance',
    price: 13800000,
    priceDisplay: '13.800.000₫',
    oldPriceDisplay: '15.500.000₫',
    image: '/images/products/ke-tivi-oc-cho.jpg',
    secondaryImage: '/images/products/tu-quan-ao.jpg',
    tag: 'Nữ Tính Tinh Tế',
    material: 'Gỗ Sồi Trắng Sơn Satin & Gương Bỉ Tráng Bạc',
    materialType: 'wood',
    dimensions: 'D110 × R48 × C76 cm',
    rating: 4.9,
    inStock: true,
  },

  // --- SOFA DA THẬT ---
  {
    id: 401,
    name: 'Sofa 3 Chỗ Victoria Da Thật Ý Thảo Mộc',
    categorySlug: 'sofa-da',
    categoryName: 'Sofa Da Thật',
    group: 'sofa',
    collection: 'victoria',
    price: 38500000,
    priceDisplay: '38.500.000₫',
    oldPriceDisplay: '44.000.000₫',
    image: '/images/products/sofa-3-cho-victoria.jpg',
    secondaryImage: '/images/categories/sofa-3cho.jpg',
    tag: 'Tâm Điểm Phòng Khách',
    material: 'Da Bò Ý Thuộc Thảo Mộc Tuscany & Khung Gỗ Sồi',
    materialType: 'leather',
    dimensions: 'D240 × R100 × C82 cm',
    rating: 5.0,
    inStock: true,
  },
  {
    id: 402,
    name: 'Sofa Góc L Florence Da Nappa Thượng Hạng',
    categorySlug: 'sofa-da',
    categoryName: 'Sofa Da Thật',
    group: 'sofa',
    collection: 'moretti',
    price: 56000000,
    priceDisplay: '56.000.000₫',
    oldPriceDisplay: '62.000.000₫',
    image: '/images/categories/sofa-3cho.jpg',
    secondaryImage: '/images/products/sofa-3-cho-victoria.jpg',
    tag: 'Đẳng Cấp',
    material: 'Da Bò Nappa Full Grain & Khung Thép Sơn PVD',
    materialType: 'leather',
    dimensions: 'D280 × R170 × C80 cm',
    rating: 4.9,
    inStock: true,
  },

  // --- SOFA VẢI NỈ ---
  {
    id: 403,
    name: 'Sofa Băng Scandinavia Vải Dệt Bouclé Êm Ái',
    categorySlug: 'sofa-vai',
    categoryName: 'Sofa Vải Nỉ',
    group: 'sofa',
    collection: 'coastal',
    price: 22800000,
    priceDisplay: '22.800.000₫',
    oldPriceDisplay: '26.000.000₫',
    image: '/images/categories/sofa-3cho.jpg',
    secondaryImage: '/images/lookbook/lookbook-living.jpg',
    tag: 'Xu Hướng 2026',
    material: 'Vải Len Bouclé Nhập Pháp & Đệm Lông Vũ 3 Lớp',
    materialType: 'fabric',
    dimensions: 'D210 × R92 × C80 cm',
    rating: 4.8,
    inStock: true,
  },

  // --- GHẾ ARMCHAIR THƯ GIÃN ---
  {
    id: 501,
    name: 'Ghế Bành Thư Giãn Armchair Mây Osaka',
    categorySlug: 'ghe-thu-gian',
    categoryName: 'Ghế Armchair Thư Giãn',
    group: 'sofa',
    collection: 'osaka',
    price: 14200000,
    priceDisplay: '14.200.000₫',
    oldPriceDisplay: '16.500.000₫',
    image: '/images/products/ghe-thu-gian.jpg',
    secondaryImage: '/images/lookbook/lookbook-armchair.jpg',
    tag: 'Biểu Tượng KTS',
    material: 'Mây Đan Mắt Cáo Thủ Công & Gỗ Sồi Khối',
    materialType: 'wood',
    dimensions: 'D82 × R80 × C95 cm',
    rating: 5.0,
    inStock: true,
  },
  {
    id: 502,
    name: 'Ghế Đọc Sách Lounge Chair & Ottoman Tuscany',
    categorySlug: 'ghe-thu-gian',
    categoryName: 'Ghế Armchair Thư Giãn',
    group: 'sofa',
    collection: 'victoria',
    price: 21500000,
    priceDisplay: '21.500.000₫',
    oldPriceDisplay: '24.800.000₫',
    image: '/images/products/ghe-thu-gian.jpg',
    secondaryImage: '/images/lookbook/lookbook-living.jpg',
    tag: 'Được Yêu Thích',
    material: 'Da Bò Thuộc Thảo Mộc & Khung Gỗ Uốn Nhiệt',
    materialType: 'leather',
    dimensions: 'D88 × R85 × C85 cm',
    rating: 4.9,
    inStock: true,
  },

  // --- GHẾ ĂN ---
  {
    id: 601,
    name: 'Ghế Ăn Bọc Da Nappa Roma Chân Kim Loại',
    categorySlug: 'ghe-an',
    categoryName: 'Ghế Ăn Sang Trọng',
    group: 'sofa',
    collection: 'elegance',
    price: 4800000,
    priceDisplay: '4.800.000₫',
    oldPriceDisplay: '5.500.000₫',
    image: '/images/categories/phong-am.jpg',
    secondaryImage: '/images/lookbook/lookbook-dining.jpg',
    tag: 'Bán Chạy',
    material: 'Da Bò Ý Cao Cấp & Chân Thép Mạ PVD Vàng',
    materialType: 'leather',
    dimensions: 'D52 × R56 × C82 cm',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 602,
    name: 'Bộ Ghế Ăn Tựa Mây Duyên Dáng Scandinavian',
    categorySlug: 'ghe-an',
    categoryName: 'Ghế Ăn Sang Trọng',
    group: 'sofa',
    collection: 'osaka',
    price: 6200000,
    priceDisplay: '6.200.000₫',
    oldPriceDisplay: '7.500.000₫',
    image: '/images/lookbook/lookbook-dining.jpg',
    secondaryImage: '/images/categories/phong-am.jpg',
    tag: 'Tinh Hoa Thủ Công',
    material: 'Gỗ Sồi Khối Tự Nhiên & Tựa Mây Mắt Cáo',
    materialType: 'wood',
    dimensions: 'D54 × R56 × C84 cm',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 603,
    name: 'Ghế Thư Giãn Valencia Khung Titan Champagne',
    categorySlug: 'ghe-thu-gian',
    categoryName: 'Ghế Armchair Thư Giãn',
    group: 'sofa',
    collection: 'valencia',
    price: 13800000,
    priceDisplay: '13.800.000₫',
    oldPriceDisplay: '15.500.000₫',
    image: '/images/products/ghe-thu-gian.jpg',
    secondaryImage: '/images/lookbook/lookbook-living.jpg',
    tag: 'Đường Cong Hữu Cơ',
    material: 'Vải Len Bouclé & Titan Khung Mạ Vàng',
    materialType: 'fabric',
    dimensions: 'D78 × R76 × C88 cm',
    rating: 4.9,
    inStock: true,
  },

  // --- GIƯỜNG NGỦ ---
  {
    id: 701,
    name: 'Giường Ngủ Master Gỗ Sồi Victoria Tự Nhiên',
    categorySlug: 'giuong-ngu',
    categoryName: 'Giường Ngủ Cao Cấp',
    group: 'phong-ngu',
    collection: 'victoria',
    price: 32500000,
    priceDisplay: '32.500.000₫',
    oldPriceDisplay: '37.000.000₫',
    image: '/images/products/giuong-ngu-go-tu-nhien.jpg',
    secondaryImage: '/images/lookbook/lookbook-bedroom.jpg',
    tag: 'Tâm Điểm Phòng Ngủ',
    material: 'Gỗ Sồi Khối Tự Nhiên & Drap Linen Dệt Thô',
    materialType: 'wood',
    dimensions: 'D220 × R200 × C110 cm',
    rating: 5.0,
    inStock: true,
  },
  {
    id: 702,
    name: 'Giường Ngủ Gỗ Óc Chó Viền Đồng Master Luxury',
    categorySlug: 'giuong-ngu',
    categoryName: 'Giường Ngủ Cao Cấp',
    group: 'phong-ngu',
    collection: 'moretti',
    price: 35000000,
    priceDisplay: '35.000.000₫',
    oldPriceDisplay: '39.500.000₫',
    image: '/images/categories/giuong-ngu.jpg',
    secondaryImage: '/images/products/giuong-ngu-go-tu-nhien.jpg',
    tag: 'Độc Bản Master',
    material: 'Gỗ Óc Chó FAS & Chỉ Đồng Thau Chế Tác',
    materialType: 'wood',
    dimensions: 'D215 × R190 × C105 cm',
    rating: 5.0,
    inStock: true,
  },

  // --- TAB & TỦ KỆ ---
  {
    id: 801,
    name: 'Tab Đầu Giường Gỗ Tự Nhiên Nordic Tinh Tế',
    categorySlug: 'tu-ke',
    categoryName: 'Tab Đầu Giường & Tủ Kệ',
    group: 'phong-ngu',
    collection: 'coastal',
    price: 4500000,
    priceDisplay: '4.500.000₫',
    oldPriceDisplay: '5.200.000₫',
    image: '/images/products/ke-tivi-oc-cho.jpg',
    secondaryImage: '/images/products/tu-quan-ao.jpg',
    tag: 'Bán Chạy',
    material: 'Gỗ Sồi Trắng & Ray Giảm Chấn Hafele',
    materialType: 'wood',
    dimensions: 'D50 × R40 × C45 cm',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 802,
    name: 'Tủ Quần Áo Master Victoria Cánh Kính Khói',
    categorySlug: 'tu-ke',
    categoryName: 'Tab Đầu Giường & Tủ Kệ',
    group: 'phong-ngu',
    collection: 'victoria',
    price: 28500000,
    priceDisplay: '28.500.000₫',
    oldPriceDisplay: '33.000.000₫',
    image: '/images/products/tu-quan-ao.jpg',
    secondaryImage: '/images/products/ke-tivi-oc-cho.jpg',
    tag: 'Kính Khói Sang Trọng',
    material: 'Gỗ Sồi Bắc Mỹ & Cánh Kính Khói Cường Lực',
    materialType: 'wood',
    dimensions: 'D220 × R60 × C240 cm',
    rating: 4.9,
    inStock: true,
  },
];

// Khoảng giá lọc
export const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'under-10', label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { id: '10-25', label: '10 triệu - 25 triệu', min: 10000000, max: 25000000 },
  { id: '25-40', label: '25 triệu - 40 triệu', min: 25000000, max: 40000000 },
  { id: 'over-40', label: 'Trên 40 triệu', min: 40000000, max: Infinity },
];

// Tùy chọn sắp xếp
export const SORT_OPTIONS = [
  { id: 'featured', label: 'Mặc định (Nổi bật nhất)' },
  { id: 'price-asc', label: 'Giá: Thấp đến cao' },
  { id: 'price-desc', label: 'Giá: Cao đến thấp' },
  { id: 'name-asc', label: 'Tên sản phẩm: A → Z' },
  { id: 'rating', label: 'Đánh giá cao nhất' },
];

export default function CategoryPage({ categoryId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  // 1. Xác định query category và collection từ URL
  const activeCollection = (searchParams.get('collection') || '').toLowerCase().trim();
  const collectionMeta = activeCollection ? COLLECTIONS_META[activeCollection] : null;

  // Ưu tiên param từ URL search params: ?category=... hoặc fallback ?danh-muc=... hoặc param từ route :categorySlug
  const rawParam =
    searchParams.get('category') ||
    searchParams.get('danh-muc') ||
    categorySlug ||
    (categoryId
      ? categoryId === '01'
        ? 'ban-an'
        : categoryId === '02'
        ? 'sofa'
        : categoryId === '03'
        ? 'ban-lam-viec'
        : categoryId === '04'
        ? 'ghe-thu-gian'
        : categoryId === '05'
        ? 'phong-ngu'
        : 'all'
      : 'all');

  const activeCategory = rawParam || 'all';

  // State bộ lọc và sắp xếp
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(Boolean(activeCollection));
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Tự động mở danh mục nhỏ bộ sưu tập khi có activeCollection
  useEffect(() => {
    if (activeCollection) {
      setCollectionOpen(true);
    }
  }, [activeCollection]);

  // Hiển thị toast thông báo
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Toggle wishlist
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Đã thêm "${product.name}" vào danh sách yêu thích`);
        return [...prev, product.id];
      }
    });
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    showToast(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
  };

  // Cập nhật URL khi chuyển danh mục ở Sidebar
  const handleSelectCategory = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!slug || slug === 'all') {
      nextParams.delete('category');
      nextParams.delete('danh-muc');
    } else {
      nextParams.set('category', slug);
      nextParams.delete('danh-muc');
    }
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  // Chọn bộ sưu tập
  const handleSelectCollection = (colSlug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!colSlug || colSlug === 'all') {
      nextParams.delete('collection');
    } else {
      nextParams.set('collection', colSlug);
    }
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  // Xóa lọc bộ sưu tập
  const handleRemoveCollection = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('collection');
    setSearchParams(nextParams);
  };

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    nextParams.delete('danh-muc');
    nextParams.delete('collection');
    setSearchParams(nextParams);
    setSelectedPriceRange('all');
    setSelectedMaterial('all');
    setSortOption('featured');
    setMobileFilterOpen(false);
  };

  // Kiểm tra có bộ lọc đang hoạt động hay không
  const isFiltered =
    Boolean(activeCollection) ||
    activeCategory !== 'all' ||
    selectedPriceRange !== 'all' ||
    selectedMaterial !== 'all';

  // 2. Lọc danh sách sản phẩm theo Collection, Category, Giá, Chất liệu và Sắp xếp
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS_CATALOG];

    // Lọc theo Collection nếu có param trên URL
    if (activeCollection) {
      result = result.filter((item) => item.collection === activeCollection);
    }

    // Lọc theo Category
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter((item) => {
        // Nhóm Bàn
        if (activeCategory === 'ban') {
          return item.group === 'ban';
        }
        // Nhóm Ghế & Sofa
        if (activeCategory === 'sofa' || activeCategory === 'ghe') {
          return item.group === 'sofa';
        }
        // Phòng ăn
        if (activeCategory === 'phong-an') {
          return item.categorySlug === 'ban-an' || item.categorySlug === 'ghe-an';
        }
        // Phòng khách
        if (activeCategory === 'phong-khach') {
          return (
            item.categorySlug === 'sofa-da' ||
            item.categorySlug === 'sofa-vai' ||
            item.categorySlug === 'ban-tra' ||
            item.categorySlug === 'ghe-thu-gian'
          );
        }
        // Phòng ngủ
        if (activeCategory === 'phong-ngu') {
          return item.group === 'phong-ngu';
        }
        // So khớp chính xác theo slug (ban-an, ban-tra, ban-lam-viec, ban-trang-diem, sofa-da, sofa-vai, ghe-thu-gian, ghe-an, giuong-ngu, tu-ke)
        return (
          item.categorySlug === activeCategory ||
          (activeCategory === 'armchair' && item.categorySlug === 'ghe-thu-gian')
        );
      });
    }

    // Lọc theo Khoảng giá
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(
          (item) => item.price >= range.min && item.price <= range.max
        );
      }
    }

    // Lọc theo Chất liệu
    if (selectedMaterial !== 'all') {
      result = result.filter((item) => item.materialType === selectedMaterial);
    }

    // Sắp xếp
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeCollection, activeCategory, selectedPriceRange, selectedMaterial, sortOption]);

  // Thông tin tiêu đề và banner trang (ưu tiên collection nếu có)
  const meta = useMemo(() => {
    if (collectionMeta) {
      return {
        title: collectionMeta.title,
        tag: collectionMeta.tag,
        subtitle: collectionMeta.subtitle,
        description: collectionMeta.description,
        image: collectionMeta.image,
      };
    }
    return CATEGORY_META[activeCategory] || CATEGORY_META.all;
  }, [collectionMeta, activeCategory]);

  // Lấy tên danh mục/BST hiện tại hiển thị ở Breadcrumbs và Toolbar
  const currentCategoryName = useMemo(() => {
    if (collectionMeta) {
      if (activeCategory && activeCategory !== 'all') {
        let catLabel = activeCategory;
        for (const group of CATEGORY_GROUPS) {
          const found = group.items.find((item) => item.slug === activeCategory);
          if (found) {
            catLabel = found.name;
            break;
          }
        }
        return `${collectionMeta.title} • ${catLabel}`;
      }
      return collectionMeta.title;
    }

    if (!activeCategory || activeCategory === 'all') return 'Tất Cả Sản Phẩm';
    if (activeCategory === 'ban') return 'Tuyển Tập Bàn';
    if (activeCategory === 'sofa' || activeCategory === 'ghe') return 'Tuyển Tập Ghế & Sofa';
    if (activeCategory === 'phong-ngu') return 'Không Gian Phòng Ngủ';
    if (activeCategory === 'phong-khach') return 'Không Gian Phòng Khách';
    if (activeCategory === 'phong-an') return 'Không Gian Phòng Ăn';

    for (const group of CATEGORY_GROUPS) {
      const found = group.items.find((item) => item.slug === activeCategory);
      if (found) return found.name;
    }
    return meta.title || 'Sản Phẩm';
  }, [collectionMeta, activeCategory, meta.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="min-h-screen bg-[#FAF8F5] text-[#2C241E] pb-24"
    >
      {/* TOAST THÔNG BÁO TINH TẾ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C241E] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center space-x-3 text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E6C280] flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="border-b border-[#E8E2D8] bg-[#F5F2EB]/70 backdrop-blur-sm sticky top-[73px] sm:top-[77px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center space-x-2 flex-wrap">
            <Link
              to="/"
              className="hover:text-neutral-900 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-neutral-400">/</span>
            <Link
              to="/san-pham"
              onClick={handleResetFilters}
              className={`hover:text-neutral-900 transition-colors ${
                !activeCollection && activeCategory === 'all' ? 'font-semibold text-neutral-900' : ''
              }`}
            >
              Sản phẩm
            </Link>
            {activeCollection && (
              <>
                <span className="text-neutral-400">/</span>
                <Link
                  to="/bo-suu-tap"
                  className="hover:text-[#8C6A48] transition-colors"
                >
                  Bộ sưu tập
                </Link>
                <span className="text-neutral-400">/</span>
                <span className="font-semibold text-[#8C6A48]">
                  {collectionMeta ? collectionMeta.title : `BST ${activeCollection}`}
                </span>
              </>
            )}
            {activeCategory !== 'all' && (
              <>
                <span className="text-neutral-400">/</span>
                <span className="font-semibold text-[#8C6A48]">
                  {currentCategoryName}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-block font-mono text-[11px] text-[#8C6A48] tracking-widest uppercase font-semibold">
              TK HOUSE COLLECTION 2026
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-[11px] text-neutral-500 hover:text-neutral-900 bg-white px-2.5 py-1 rounded-full border border-[#E8E2D8] transition-colors"
                title="Xóa bộ lọc để xem toàn bộ"
              >
                <RotateCcw className="w-3 h-3 text-[#8C6A48]" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER KIẾN TRÚC (THIẾT KẾ THU GỌN TINH TẾ) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-sm min-h-[140px] sm:min-h-[170px] lg:min-h-[190px] bg-stone-900 flex flex-col justify-end p-5 sm:p-7 lg:p-8 text-white">
          <img
            src={meta.image}
            alt={meta.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Top category stamp */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center space-x-2">
            <span className="bg-black/60 text-white text-[10px] font-sans tracking-[0.25em] px-3 py-1 rounded-full border border-white/30 uppercase shadow-sm font-semibold">
              {meta.id || 'TK'} • {meta.tag || 'BỘ SƯU TẬP'}
            </span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 max-w-2xl space-y-1 sm:space-y-2">
            <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-normal text-white italic drop-shadow-md">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed drop-shadow line-clamp-2">
              {meta.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT LIST SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Main Grid: Left Sidebar (3 cols) + Right Product Grid (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: DESKTOP SIDEBAR FILTER */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[140px] bg-white rounded-2xl border border-[#E8E2D8] p-5 shadow-sm space-y-6">
              {/* Header của Sidebar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8C6A48]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    BỘ LỌC TÌM KIẾM
                  </span>
                </div>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-[#8C6A48] hover:underline font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* PHẦN 1: DANH MỤC NỘI THẤT */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    DANH MỤC NỘI THẤT
                  </span>
                </div>

                {/* Mục "Tất cả sản phẩm" */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 mb-1.5 ${
                    activeCategory === 'all' && !activeCollection
                      ? 'bg-[#FAF6F0] text-[#8C6A48] font-bold border border-[#E5DACD] shadow-sm'
                      : 'text-neutral-700 hover:bg-[#FAF8F5] hover:text-neutral-900'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeCategory === 'all' && !activeCollection ? 'bg-[#8C6A48]' : 'bg-neutral-300'
                      }`}
                    />
                    <span>Tất cả sản phẩm</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      activeCategory === 'all' && !activeCollection
                        ? 'bg-[#8C6A48] text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {PRODUCTS_CATALOG.length}
                  </span>
                </button>

                {/* Nhóm các danh mục */}
                <div className="space-y-4 pt-1">
                  {CATEGORY_GROUPS.map((grp, gIdx) => {
                    const isGroupActive = activeCategory === grp.groupSlug;
                    const groupItemCount = PRODUCTS_CATALOG.filter(
                      (p) => p.group === grp.groupSlug
                    ).length;

                    return (
                      <div key={gIdx} className="space-y-1">
                        {/* Group Header Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(grp.groupSlug)}
                          className={`w-full flex items-center justify-between text-[11.5px] font-bold uppercase tracking-wider text-left py-1 px-1 transition-colors ${
                            isGroupActive
                              ? 'text-[#8C6A48]'
                              : 'text-neutral-800 hover:text-[#8C6A48]'
                          }`}
                        >
                          <span className="flex items-center space-x-1.5">
                            <span className="text-[#8C6A48] text-[10px]">■</span>
                            <span>{grp.group}</span>
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono font-normal">
                            ({groupItemCount})
                          </span>
                        </button>

                        {/* Sub Items */}
                        <div className="pl-2 space-y-0.5">
                          {grp.items.map((sub, sIdx) => {
                            const isSubActive = activeCategory === sub.slug;
                            const subCount = PRODUCTS_CATALOG.filter(
                              (p) => p.categorySlug === sub.slug
                            ).length;

                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSelectCategory(sub.slug)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 text-left ${
                                  isSubActive
                                    ? 'bg-[#FAF6F0] text-[#8C6A48] font-semibold border-l-2 border-[#8C6A48]'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]'
                                }`}
                              >
                                <span className="truncate pr-2">{sub.name}</span>
                                <span
                                  className={`text-[10px] font-mono ${
                                    isSubActive
                                      ? 'text-[#8C6A48] font-bold'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {subCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Nhóm BỘ SƯU TẬP (Có nút toggle xổ xuống v) */}
                  <div className="space-y-1">
                    {/* Header Group Button với mũi tên xổ xuống v */}
                    <button
                      type="button"
                      onClick={() => setCollectionOpen((prev) => !prev)}
                      className={`w-full flex items-center justify-between text-[11.5px] font-bold uppercase tracking-wider text-left py-1 px-1 transition-colors group cursor-pointer ${
                        activeCollection
                          ? 'text-[#8C6A48]'
                          : 'text-neutral-800 hover:text-[#8C6A48]'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <span className="text-[#8C6A48] text-[10px]">■</span>
                        <span>BỘ SƯU TẬP</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            collectionOpen ? 'rotate-180 text-[#8C6A48]' : 'text-neutral-400 group-hover:text-[#8C6A48]'
                          }`}
                        />
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">
                        ({Object.keys(COLLECTIONS_META).length})
                      </span>
                    </button>

                    {/* Danh mục nhỏ các bộ sưu tập ẩn / hiện bên trong */}
                    {collectionOpen && (
                      <div className="pl-2 space-y-0.5">

                        {Object.entries(COLLECTIONS_META).map(([cSlug, cMeta]) => {
                          const isColActive = activeCollection === cSlug;
                          const colCount = PRODUCTS_CATALOG.filter((p) => p.collection === cSlug).length;

                          return (
                            <button
                              key={cSlug}
                              type="button"
                              onClick={() => handleSelectCollection(cSlug)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 text-left ${
                                isColActive
                                  ? 'bg-[#FAF6F0] text-[#8C6A48] font-semibold border-l-2 border-[#8C6A48]'
                                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]'
                              }`}
                            >
                              <span className="truncate pr-2">{cMeta.name}</span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isColActive ? 'text-[#8C6A48] font-bold' : 'text-neutral-400'
                                }`}
                              >
                                {colCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PHẦN 2: BỘ LỌC KHOẢNG GIÁ */}
              <div className="pt-4 border-t border-[#E8E2D8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    KHOẢNG GIÁ
                  </span>
                  {selectedPriceRange !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedPriceRange('all')}
                      className="text-[10px] text-[#8C6A48] hover:underline"
                    >
                      Mặc định
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => {
                    const isSelected = selectedPriceRange === range.id;
                    return (
                      <label
                        key={range.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FAF6F0] text-[#8C6A48] font-semibold border border-[#E5DACD]'
                            : 'text-neutral-700 hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="priceRangeDesktop"
                            value={range.id}
                            checked={isSelected}
                            onChange={() => setSelectedPriceRange(range.id)}
                            className="w-3.5 h-3.5 text-[#8C6A48] accent-[#8C6A48] focus:ring-0 cursor-pointer"
                          />
                          <span>{range.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN 3: BỘ LỌC CHẤT LIỆU */}
              <div className="pt-4 border-t border-[#E8E2D8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    CHẤT LIỆU CHẾ TÁC
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'leather', label: 'Da Bò Ý' },
                    { id: 'stone', label: 'Đá Marble/Ceramic' },
                    { id: 'wood', label: 'Gỗ Tự Nhiên' },
                    { id: 'fabric', label: 'Vải Bouclé' },
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setSelectedMaterial(mat.id)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                        selectedMaterial === mat.id
                          ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                          : 'bg-white text-neutral-600 border-[#E8E2D8] hover:border-neutral-400'
                      }`}
                    >
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cam kết thương hiệu TK House */}
              <div className="pt-4 border-t border-[#E8E2D8] bg-[#FAF8F5] p-3 rounded-xl border border-dashed border-[#E2D9CC] space-y-2">
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#8C6A48]">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>TIÊU CHUẨN THƯỢNG HẠNG</span>
                </div>
                <p className="text-[10.5px] text-neutral-500 font-light leading-relaxed">
                  100% sản phẩm bảo hành chính hãng 5 năm, miễn phí vận chuyển & lắp đặt hoàn thiện tận nhà.
                </p>
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* CỘT PHẢI: TOOLBAR & LƯỚI SẢN PHẨM (PRODUCT GRID) */}
          {/* ======================================================== */}
          <main className="col-span-1 lg:col-span-9 space-y-6">
            {/* 1. THANH CÔNG CỤ TOOLBAR (SỐ LƯỢNG + SẮP XẾP + NÚT BỘ LỌC MOBILE) */}
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-4 sm:p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-lg sm:text-xl font-normal text-neutral-900 tracking-wide">
                    {currentCategoryName}
                  </h2>
                  <span className="bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {filteredProducts.length} sản phẩm
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Bộ sưu tập tuyển chọn thiết kế nội thất đương đại cao cấp
                </p>
              </div>

              {/* Cụm công cụ lọc và sắp xếp */}
              <div className="flex items-center space-x-2.5">
                {/* Nút bật Bộ lọc trên Mobile */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E5DACD] text-[#8C6A48] text-xs font-semibold shadow-sm"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Bộ lọc {isFiltered ? '(Đang bật)' : ''}</span>
                </button>

                {/* Thanh chọn Sắp xếp */}
                <div className="flex items-center space-x-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline-block" />
                  <span className="text-neutral-500 hidden sm:inline-block">Sắp xếp:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#E8E2D8] text-neutral-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#8C6A48] font-medium cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CÁC THẺ TAG ĐANG LỌC (ACTIVE FILTER CHIPS) */}
            {isFiltered && (
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="text-neutral-400 text-[11px]">Đang lọc theo:</span>

                {/* Thẻ lọc Bộ Sưu Tập */}
                {activeCollection && (
                  <span className="inline-flex items-center space-x-1.5 bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm">
                    <Sparkles className="w-3 h-3 text-[#8C6A48]" />
                    <span>Bộ sưu tập: {collectionMeta ? collectionMeta.name : activeCollection}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCollection}
                      className="hover:text-black ml-1 p-0.5 rounded-full hover:bg-neutral-200/50 transition-colors"
                      title="Xóa lọc bộ sưu tập để xem toàn bộ sản phẩm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] px-2.5 py-1 rounded-full text-[11px] font-medium">
                    <span>Danh mục: {currentCategoryName}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('all')}
                      className="hover:text-black ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedPriceRange !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] px-2.5 py-1 rounded-full text-[11px] font-medium">
                    <span>
                      Giá:{' '}
                      {PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPriceRange('all')}
                      className="hover:text-black ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedMaterial !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] px-2.5 py-1 rounded-full text-[11px] font-medium">
                    <span>Chất liệu: {selectedMaterial}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMaterial('all')}
                      className="hover:text-black ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-[#8C6A48] hover:underline font-semibold ml-1"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* 2. LƯỚI CARD SẢN PHẨM (PRODUCT GRID) */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredProducts.map((prod) => {
                  const isLiked = wishlist.includes(prod.id);

                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="group bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-400 flex flex-col justify-between"
                    >
                      {/* Ảnh sản phẩm với Dual photo swap */}
                      <div className="relative aspect-[4/3] bg-[#FAF8F5] overflow-hidden">
                        {/* Ảnh chính */}
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                        />
                        {/* Ảnh phụ khi rê chuột */}
                        {prod.secondaryImage && (
                          <img
                            src={prod.secondaryImage}
                            alt={`${prod.name} phối cảnh`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-106 transition-all duration-700 ease-in-out"
                          />
                        )}

                        {/* Tag trạng thái */}
                        {prod.tag && (
                          <span className="absolute top-3 left-3 bg-neutral-900/85 backdrop-blur-md text-[#E6C280] text-[10px] font-sans tracking-wider px-2.5 py-1 rounded-full uppercase shadow-sm font-semibold">
                            {prod.tag}
                          </span>
                        )}

                        {/* Nút hành động nổi trên ảnh */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => toggleWishlist(prod)}
                            className={`w-8 h-8 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all ${
                              isLiked
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-rose-500'
                            }`}
                            title="Lưu yêu thích"
                          >
                            <Heart
                              className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Thanh thông số kích thước hover */}
                        {prod.dimensions && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 backdrop-blur-md bg-black/65 text-white rounded-xl px-2.5 py-1 text-[10px] font-mono tracking-tight flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-2.5 h-2.5 text-[#E6C280]" />
                              <span>{prod.dimensions}</span>
                            </span>
                            <span className="text-[#E6C280]">★ {prod.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Chi tiết nội dung card */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C6A48] font-semibold">
                              {prod.categoryName}
                            </span>
                            {prod.inStock && (
                              <span className="text-[9.5px] text-emerald-600 font-medium">
                                ● Sẵn hàng
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-base font-semibold text-neutral-900 group-hover:text-[#8C6A48] transition-colors leading-snug line-clamp-2">
                            {prod.name}
                          </h3>

                          <p className="text-[11.5px] text-neutral-500 mt-1 font-light line-clamp-1">
                            {prod.material}
                          </p>
                        </div>

                        {/* Giá tiền và Nút thêm vào giỏ */}
                        <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
                          <div>
                            <span className="text-sm sm:text-base font-bold text-neutral-900 font-mono tracking-tight">
                              {prod.priceDisplay}
                            </span>
                            {prod.oldPriceDisplay && (
                              <span className="block text-[11px] text-neutral-400 line-through font-mono">
                                {prod.oldPriceDisplay}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            className="p-2.5 rounded-full bg-neutral-900 hover:bg-[#8C6A48] text-white transition-all shadow-sm hover:scale-105 active:scale-95"
                            title="Thêm vào giỏ hàng"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* TRẠNG THÁI RỖNG (EMPTY STATE) */
              <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-normal text-neutral-900">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-light leading-relaxed">
                  Hiện chưa có sản phẩm nào thuộc bộ lọc bạn đã chọn. Vui lòng mở rộng khoảng giá hoặc chọn danh mục khác.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 rounded-full bg-[#8C6A48] hover:bg-[#734b2f] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center space-x-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xem tất cả sản phẩm</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL / DRAWER BỘ LỌC TRÊN MOBILE (SLIDE-OVER) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />

            {/* Panel trượt */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 max-w-full flex"
            >
              <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-900 uppercase">
                    <SlidersHorizontal className="w-4 h-4 text-[#8C6A48]" />
                    <span>BỘ LỌC SẢN PHẨM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Danh mục */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      DANH MỤC NỘI THẤT
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium mb-1 ${
                        activeCategory === 'all' && !activeCollection
                          ? 'bg-[#FAF6F0] text-[#8C6A48] font-bold border border-[#E5DACD]'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      ✦ Tất cả sản phẩm ({PRODUCTS_CATALOG.length})
                    </button>

                    {CATEGORY_GROUPS.map((grp, gIdx) => (
                      <div key={gIdx} className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(grp.groupSlug)}
                          className={`w-full text-left text-[11px] font-bold uppercase tracking-wider py-1 ${
                            activeCategory === grp.groupSlug
                              ? 'text-[#8C6A48]'
                              : 'text-neutral-800'
                          }`}
                        >
                          ■ {grp.group}
                        </button>
                        <div className="pl-2 space-y-1 mt-1">
                          {grp.items.map((sub, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSelectCategory(sub.slug)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs ${
                                activeCategory === sub.slug
                                  ? 'bg-[#FAF6F0] text-[#8C6A48] font-bold'
                                  : 'text-neutral-600'
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Nhóm BỘ SƯU TẬP (Có nút toggle xổ xuống v) */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setCollectionOpen((prev) => !prev)}
                        className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider py-1 ${
                          activeCollection ? 'text-[#8C6A48]' : 'text-neutral-800'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5">
                          <span className="text-[#8C6A48] text-[10px]">■</span>
                          <span>BỘ SƯU TẬP</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              collectionOpen ? 'rotate-180 text-[#8C6A48]' : 'text-neutral-400'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono font-normal">
                          ({Object.keys(COLLECTIONS_META).length})
                        </span>
                      </button>

                      {collectionOpen && (
                        <div className="pl-2 space-y-1 mt-1">
                          {Object.entries(COLLECTIONS_META).map(([cSlug, cMeta]) => {
                            const isColActive = activeCollection === cSlug;
                            const colCount = PRODUCTS_CATALOG.filter(
                              (p) => p.collection === cSlug
                            ).length;

                            return (
                              <button
                                key={cSlug}
                                type="button"
                                onClick={() => handleSelectCollection(cSlug)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                                  isColActive
                                    ? 'bg-[#FAF6F0] text-[#8C6A48] font-bold border-l-2 border-[#8C6A48]'
                                    : 'text-neutral-600'
                                }`}
                              >
                                <span>{cMeta.name}</span>
                                <span className={`text-[10px] font-mono ${isColActive ? 'text-[#8C6A48] font-bold' : 'text-neutral-400'}`}>
                                  ({colCount})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Khoảng giá */}
                  <div className="pt-4 border-t border-neutral-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      KHOẢNG GIÁ
                    </h4>
                    <div className="space-y-1.5">
                      {PRICE_RANGES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedPriceRange(r.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                            selectedPriceRange === r.id
                              ? 'bg-[#FAF6F0] text-[#8C6A48] font-bold border border-[#E5DACD]'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chất liệu */}
                  <div className="pt-4 border-t border-neutral-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      CHẤT LIỆU
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'leather', label: 'Da Bò Ý' },
                        { id: 'stone', label: 'Đá Marble' },
                        { id: 'wood', label: 'Gỗ Tự Nhiên' },
                        { id: 'fabric', label: 'Vải Bouclé' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMaterial(m.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg border ${
                            selectedMaterial === m.id
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-neutral-200 bg-[#FAF8F5] flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                  >
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#8C6A48] text-white text-xs font-semibold hover:bg-[#734b2f]"
                  >
                    Xem kết quả ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
