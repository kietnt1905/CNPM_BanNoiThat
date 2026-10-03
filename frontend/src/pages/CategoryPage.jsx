import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function CategoryPage({ categoryId = '02' }) {
  const [searchParams] = useSearchParams();
  const queryCategory = searchParams.get('danh-muc');

  // Dữ liệu các danh mục không gian kiến trúc
  const categoryData = {
    '01': {
      id: '01',
      tag: 'Phòng Ăn Đương Đại',
      title: 'Bộ Bàn Ăn Sang Trọng',
      subtitle: 'Mặt đá Ceramic chống ố, Ghế ăn bọc da cao cấp',
      image: '/images/categories/phong-am.jpg',
      slug: 'ban-an',
      description:
        'Tuyển tập bàn ăn mặt đá Ceramic Nano và ghế ăn chế tác từ gỗ sồi khối, da thuộc Ý cao cấp. Nơi gắn kết trọn vẹn những bữa tiệc gia đình ấm cúng.',
      products: [
        {
          id: 101,
          name: 'Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ',
          category: 'Bàn Ăn Cao Cấp',
          price: '46.500.000₫',
          oldPrice: '52.000.000₫',
          image: '/images/categories/phong-am.jpg',
          tag: 'Best Seller',
          material: 'Mặt đá Ceramic Nano & Gỗ Óc Chó FAS',
        },
        {
          id: 102,
          name: 'Ghế Ăn Bọc Da Nappa Roma',
          category: 'Ghế Bàn Ăn',
          price: '4.800.000₫',
          oldPrice: '5.500.000₫',
          image: '/images/products/ghe-thu-gian.jpg',
          tag: 'New',
          material: 'Da Bò Thuộc Ý & Chân Thép Mạ PVD',
        },
      ],
    },
    '02': {
      id: '02',
      tag: 'Không Gian Phòng Khách',
      title: 'Sofa & Bàn Trà Tinh Tế',
      subtitle: 'Sofa da thảo mộc, Bàn trà đôi đá tự nhiên',
      image: '/images/categories/phong-khach.jpg',
      slug: 'sofa-ban-tra',
      description:
        'Sự kết hợp hoàn hảo giữa da bò thảo mộc Tuscany và mặt đá Marble Calacatta sang trọng, đánh thức cảm xúc tĩnh tại và thịnh vượng cho phòng khách thượng lưu.',
      products: [
        {
          id: 201,
          name: 'Sofa 3 Chỗ Victoria Da Thật',
          category: 'Sofa Phòng Khách',
          price: '38.500.000₫',
          oldPrice: '44.000.000₫',
          image: '/images/products/sofa-3-cho-victoria.jpg',
          tag: 'Tâm điểm phòng khách',
          material: 'Da Bò Ý Thuộc Thảo Mộc Tuscany',
        },
        {
          id: 202,
          name: 'Bàn Trà Đôi Mặt Đá Marble Elegance',
          category: 'Bàn Trà Sang Trọng',
          price: '11.500.000₫',
          oldPrice: '13.200.000₫',
          image: '/images/products/ban-tra-doi.jpg',
          tag: 'Bán chạy nhất',
          material: 'Đá Marble Calacatta & Khung Titan Mạ Vàng',
        },
        {
          id: 203,
          name: 'Sofa Băng Scandinavia Vải Dệt Êm Ái',
          category: 'Sofa Vải Cao Cấp',
          price: '22.800.000₫',
          oldPrice: '26.000.000₫',
          image: '/images/categories/sofa-3cho.jpg',
          tag: 'Xu hướng 2026',
          material: 'Vải Len Bouclé & Gỗ Sồi Tự Nhiên',
        },
        {
          id: 204,
          name: 'Ghế Bành Thư Giãn Armchair Mây Osaka',
          category: 'Armchair Phòng Khách',
          price: '14.200.000₫',
          oldPrice: '16.500.000₫',
          image: '/images/products/ghe-thu-gian.jpg',
          tag: 'Biểu tượng KTS',
          material: 'Mây Đan Mắt Cáo Thủ Công & Đệm Lông Vũ',
        },
      ],
    },
    '03': {
      id: '03',
      tag: 'Xưởng Cảm Hứng',
      title: 'Góc Làm Việc Nghệ Thuật',
      subtitle: 'Bàn làm việc gỗ sồi khối, Ghế công thái học êm ái',
      image: '/images/categories/phong-lam-viec.jpg',
      slug: 'ban-lam-viec',
      description:
        'Không gian nuôi dưỡng những quyết định lớn và ý tưởng đột phá với hệ bàn gỗ nguyên tấm và ghế bọc da công thái học chuẩn mực.',
      products: [
        {
          id: 301,
          name: 'Bàn Giám Đốc Gỗ Óc Chó Atelier Master',
          category: 'Bàn Làm Việc Cao Cấp',
          price: '32.000.000₫',
          oldPrice: '36.500.000₫',
          image: '/images/categories/phong-lam-viec.jpg',
          tag: 'Độc bản KTS',
          material: 'Gỗ Óc Chó Bắc Mỹ Tự Nhiên FAS',
        },
      ],
    },
    '04': {
      id: '04',
      tag: 'Góc Tĩnh Lặng',
      title: 'Ghế Thư Giãn & Armchair',
      subtitle: 'Đệm lông vũ mềm mại, nâng niu từng phút giây thư thái',
      image: '/images/products/ghe-thu-gian.jpg',
      slug: 'ghe-thu-gian',
      description:
        'Điểm tựa hoàn mỹ sau những bộn bề công việc. Góc đọc sách, thưởng trà và đắm mình trong bản nhạc êm dịu.',
      products: [
        {
          id: 401,
          name: 'Ghế Thư Giãn Armchair Mây Osaka',
          category: 'Ghế Thư Giãn Nghệ Thuật',
          price: '14.200.000₫',
          oldPrice: '16.500.000₫',
          image: '/images/products/ghe-thu-gian.jpg',
          tag: 'Thiết kế biểu tượng',
          material: 'Mây Đan Mắt Cáo Thủ Công & Gỗ Sồi Khối',
        },
      ],
    },
  };

  // Xác định category hiển thị
  let activeCatId = categoryId;
  if (queryCategory === 'sofa') activeCatId = '02';
  if (queryCategory === 'ban-an') activeCatId = '01';
  if (queryCategory === 'ban-lam-viec') activeCatId = '03';
  if (queryCategory === 'ghe-thu-gian') activeCatId = '04';

  const category = categoryData[activeCatId] || categoryData['02'];

  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      style={{ willChange: 'opacity' }}
      className="min-h-screen bg-[#FAF7F2] text-[#2C241E] pb-24"
    >
      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="border-b border-[#E8E2D8] bg-[#F5F2EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-neutral-900 transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-500">Danh mục không gian</span>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-neutral-900">{category.title}</span>
          </div>

          <span className="hidden sm:inline-block font-mono text-[11px] text-[#8C5D3E] tracking-wider uppercase font-semibold">
            TK HOUSE COLLECTION 2026
          </span>
        </div>
      </div>

      {/* 2. ARCHITECTURAL HERO BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D8] shadow-lg aspect-[21/9] min-h-[300px] sm:min-h-[380px] bg-stone-900 flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
          <img
            src={category.image}
            alt={category.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          {/* Top category stamp */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center space-x-2">
            <span className="bg-black/60 text-white text-[10px] font-sans tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-white/30 uppercase shadow-sm font-semibold">
              {category.id} • {category.tag}
            </span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal text-white italic drop-shadow-md">
              {category.title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-neutral-200 font-light leading-relaxed drop-shadow">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT LIST SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D8] gap-4 mb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-800 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#8C5D3E]" />
            <span>TẤT CẢ KIỆT TÁC ({category.products.length} MẪU THIẾT KẾ)</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-500">Lọc chất liệu:</span>
            {['all', 'leather', 'stone', 'wood'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  activeFilter === f
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-[#E8E2D8] hover:border-neutral-400'
                }`}
              >
                {f === 'all' && 'Tất cả'}
                {f === 'leather' && 'Da Ý Nappa'}
                {f === 'stone' && 'Đá Marble'}
                {f === 'wood' && 'Gỗ Óc Chó'}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {category.products.map((prod) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="group bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Photo */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />

                {prod.tag && (
                  <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-[#E6C687] text-[10px] font-mono tracking-wider px-2.5 py-1 rounded uppercase">
                    {prod.tag}
                  </span>
                )}

                {/* Quick actions overlay */}
                <div className="absolute top-3 right-3 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-red-500 shadow flex items-center justify-center transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C5D3E] font-semibold block mb-1">
                    {prod.category}
                  </span>
                  <h3 className="font-serif text-base font-semibold text-neutral-900 group-hover:text-[#8C5D3E] transition-colors leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-[11.5px] text-neutral-500 mt-1 font-light line-clamp-1">
                    {prod.material}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm sm:text-base font-bold text-neutral-900 font-mono">
                      {prod.price}
                    </span>
                    {prod.oldPrice && (
                      <span className="block text-[11px] text-neutral-400 line-through font-mono">
                        {prod.oldPrice}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Đã thêm "${prod.name}" vào giỏ hàng!`)}
                    className="p-2.5 rounded-full bg-neutral-900 hover:bg-[#8C5D3E] text-white transition-colors shadow-sm"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
