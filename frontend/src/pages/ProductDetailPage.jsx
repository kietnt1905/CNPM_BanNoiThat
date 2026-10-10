import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  ShoppingBag,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Maximize2,
  Sparkles,
  PhoneCall,
  Check,
  ChevronRight,
  Info,
  X,
  Compass,
  Layers,
  Award,
  Sparkle
} from 'lucide-react';
import { PRODUCTS_CATALOG, CATEGORY_GROUPS, COLLECTIONS_META } from './CategoryPage';

export default function ProductDetailPage({ id: propId }) {
  const { id: routeId, categorySlug } = useParams();
  const navigate = useNavigate();

  // Nhận diện product ID từ prop hoặc params
  const targetId = propId || routeId || categorySlug || '101';

  // Tìm sản phẩm trong catalog
  const product = useMemo(() => {
    const found = PRODUCTS_CATALOG.find(
      (p) => String(p.id) === String(targetId)
    );
    // Fallback về sản phẩm đầu tiên nếu không khớp
    return found || PRODUCTS_CATALOG[0];
  }, [targetId]);

  // Gallery hình ảnh cho sản phẩm
  const galleryImages = useMemo(() => {
    const images = [product.image];
    if (product.secondaryImage && product.secondaryImage !== product.image) {
      images.push(product.secondaryImage);
    }
    // Gán thêm ảnh chi tiết chất liệu hoặc không gian tùy loại
    if (product.materialType === 'leather') {
      images.push('/images/materials/mat-leather.jpg');
      images.push('/images/banners/phong-khach.jpg');
    } else if (product.materialType === 'stone') {
      images.push('/images/materials/mat-ceramic.jpg');
      images.push('/images/lookbook/lookbook-dining.jpg');
    } else if (product.materialType === 'wood') {
      images.push('/images/materials/mat-walnut.jpg');
      images.push('/images/lookbook/lookbook-bedroom.jpg');
    } else if (product.materialType === 'fabric') {
      images.push('/images/materials/mat-boucle.jpg');
      images.push('/images/lookbook/lookbook-living.jpg');
    } else {
      images.push('/images/materials/mat-walnut.jpg');
    }
    return images;
  }, [product]);

  // Danh sách swatch màu sắc theo loại sản phẩm
  const swatches = useMemo(() => {
    if (product.materialType === 'leather') {
      return [
        { id: 'cognac', name: 'Cognac Nâu Ấm Tuscany', hex: '#8C5D3E' },
        { id: 'ivory', name: 'Kem Ngà Champagne', hex: '#EAE3D6' },
        { id: 'charcoal', name: 'Xám Than Đẳng Cấp', hex: '#373634' },
        { id: 'forest', name: 'Xanh Rêu Hoàng Gia', hex: '#2F3E34' },
      ];
    }
    if (product.materialType === 'stone') {
      return [
        { id: 'calacatta', name: 'Đá Calacatta Gold Vân Vàng', hex: '#F0ECE4' },
        { id: 'nero', name: 'Đá Marble Đen Marquina', hex: '#242322' },
        { id: 'grey', name: 'Đá Xám Laurentian Mài Mờ', hex: '#7D7A76' },
      ];
    }
    if (product.materialType === 'fabric') {
      return [
        { id: 'cream', name: 'Trắng Sữa Len Bouclé', hex: '#F6F2EB' },
        { id: 'sand', name: 'Be Cát Sa Mạc', hex: '#DACEC0' },
        { id: 'moss', name: 'Xanh Rêu Tĩnh Tại', hex: '#525B50' },
      ];
    }
    return [
      { id: 'walnut', name: 'Gỗ Óc Chó Tự Nhiên FAS', hex: '#5A3D28' },
      { id: 'oak', name: 'Gỗ Sồi Trắng Bắc Mỹ', hex: '#B59876' },
      { id: 'ebony', name: 'Gỗ Đen Tuyền Mun Mun', hex: '#2A2521' },
    ];
  }, [product]);

  // Các tùy chọn kích thước may đo
  const dimensionOptions = useMemo(() => {
    const base = product.dimensions || 'D220 × R95 × C75 cm';
    return [
      { id: 'standard', label: base, note: 'Tiêu chuẩn sẵn có' },
      { id: 'extended', label: 'Bản mở rộng (+20cm)', note: 'Đặt sản xuất 7-10 ngày' },
      { id: 'custom', label: 'May đo theo mặt bằng', note: 'KTS khảo sát tận nơi' },
    ];
  }, [product]);

  // State tương tác người dùng
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSwatch, setSelectedSwatch] = useState(swatches[0]);
  const [selectedDimension, setSelectedDimension] = useState(dimensionOptions[0].id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [isWishlist, setIsWishlist] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Cuộn lên đầu trang khi đổi sản phẩm
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIdx(0);
    setSelectedSwatch(swatches[0]);
    setSelectedDimension(dimensionOptions[0].id);
    setQuantity(1);
  }, [product]);

  // Hiển thị toast thông báo
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    showToast(`Đã thêm ${quantity} × "${product.name}" (${selectedSwatch.name}) vào giỏ hàng!`);
  };

  // Xử lý mua ngay
  const handleBuyNow = () => {
    showToast(`Đang chuyển tới trang thanh toán cho "${product.name}"...`);
  };

  // Toggle yêu thích
  const handleToggleWishlist = () => {
    setIsWishlist((prev) => {
      const next = !prev;
      showToast(next ? `Đã lưu "${product.name}" vào danh sách yêu thích` : `Đã bỏ khỏi danh sách yêu thích`);
      return next;
    });
  };

  // Chia sẻ link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!');
    }
  };

  // Các sản phẩm gợi ý cùng bộ sưu tập hoặc danh mục
  const relatedProducts = useMemo(() => {
    return PRODUCTS_CATALOG.filter(
      (p) => p.id !== product.id && (p.collection === product.collection || p.group === product.group)
    ).slice(0, 4);
  }, [product]);

  // Lấy metadata bộ sưu tập
  const collectionInfo = product.collection ? COLLECTIONS_META[product.collection] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#FAF8F5] text-[#2C241E] pb-28 pt-2 sm:pt-4"
    >
      {/* Toast thông báo */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#2C241E] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center space-x-3 text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E6C280] flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="border-b border-[#E8E2D8] bg-[#F5F2EB]/80 backdrop-blur-sm sticky top-[73px] sm:top-[77px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-neutral-600">
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
              className="hover:text-neutral-900 transition-colors"
            >
              Sản phẩm
            </Link>
            <span className="text-neutral-400">/</span>
            <Link
              to={`/san-pham?category=${product.categorySlug}`}
              className="hover:text-[#8C6A48] transition-colors"
            >
              {product.categoryName}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-[#8C6A48] truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-[#E8E2D8] bg-white hover:bg-[#FAF6F0] text-neutral-700 transition-colors text-[11px]"
              title="Chia sẻ liên kết"
            >
              <Share2 className="w-3.5 h-3.5 text-[#8C6A48]" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-[#E8E2D8] transition-colors text-[11px] ${
                isWishlist
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white hover:bg-[#FAF6F0] text-neutral-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlist ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`} />
              <span className="hidden sm:inline">{isWishlist ? 'Đã lưu' : 'Lưu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KHỐI TRÌNH DIỄN CHÍNH (HERO PRODUCT SHOWCASE) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CỘT TRÁI: BỘ SƯU TẬP ẢNH TƯƠNG TÁC (INTERACTIVE GALLERY) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Khung ảnh chính */}
            <div className="relative rounded-3xl overflow-hidden bg-[#FAF6F0] border border-[#E8E2D8] aspect-[4/3] sm:aspect-[16/11] shadow-sm group">
              <img
                src={galleryImages[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Tag độc bản & Bộ sưu tập */}
              <div className="absolute top-4 left-4 flex flex-col space-y-1.5 z-10">
                {product.tag && (
                  <span className="bg-neutral-900/85 backdrop-blur-md text-[#E6C280] text-[10px] font-sans tracking-widest px-3 py-1 rounded-full uppercase shadow-sm font-semibold">
                    {product.tag}
                  </span>
                )}
                {collectionInfo && (
                  <Link
                    to={`/san-pham?collection=${collectionInfo.slug}`}
                    className="bg-[#FAF6F0]/90 backdrop-blur-md text-[#8C6A48] border border-[#E5DACD] text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full uppercase hover:bg-white transition-colors shadow-xs"
                  >
                    BST {collectionInfo.name}
                  </Link>
                )}
              </div>

              {/* Nút phóng to Lightbox */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-800 shadow-md backdrop-blur-md transition-all hover:scale-110"
                title="Phóng to ảnh xem chi tiết chất liệu"
              >
                <Maximize2 className="w-4 h-4 text-[#8C6A48]" />
              </button>

              {/* Nhãn xem chi tiết góc dưới */}
              <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-md text-white rounded-xl px-3 py-1.5 text-[11px] font-mono tracking-wide flex items-center space-x-2 border border-white/20">
                <Sparkle className="w-3 h-3 text-[#E6C280]" />
                <span>Góc nhìn {activeImageIdx + 1} / {galleryImages.length}</span>
              </div>
            </div>

            {/* Dãy Thumbnail nhỏ bên dưới */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                    activeImageIdx === idx
                      ? 'border-[#8C6A48] ring-2 ring-[#8C6A48]/30 scale-102 shadow-sm'
                      : 'border-[#E8E2D8] hover:border-neutral-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Khối Cam kết thương hiệu & Trải nghiệm phòng mẫu */}
            <div className="rounded-2xl border border-[#E8E2D8] bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-[#8C6A48]" />
                  <span>TIÊU CHUẨN THƯỢNG HẠNG TK HOUSE</span>
                </div>
                <span className="text-[10px] font-mono text-[#8C6A48] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#E5DACD]">
                  5 NĂM BẢO HÀNH
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#FAF8F5]">
                  <Truck className="w-4 h-4 text-[#8C6A48] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-[11px]">Vận chuyển toàn quốc</span>
                    <span className="text-[10.5px] text-neutral-500 font-light">Lắp đặt hoàn thiện tận nhà</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#FAF8F5]">
                  <Award className="w-4 h-4 text-[#8C6A48] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-[11px]">Chất liệu kiểm định</span>
                    <span className="text-[10.5px] text-neutral-500 font-light">100% Gỗ FAS & Da Ý tự nhiên</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#FAF8F5]">
                  <RotateCcw className="w-4 h-4 text-[#8C6A48] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-[11px]">Đổi trả trong 30 ngày</span>
                    <span className="text-[10.5px] text-neutral-500 font-light">Bảo hành kỹ thuật chính hãng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG TÙY CHỈNH & ĐẶT MUA (PURCHASE DOSSIER) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header thông tin sản phẩm */}
            <div className="space-y-2 border-b border-[#F0EBE1] pb-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-mono tracking-widest text-[#8C6A48] font-semibold">
                  {product.categoryName} • MÃ: TK-{product.id}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-neutral-900">{product.rating}</span>
                  <span className="text-neutral-400 text-[11px]">(32 lượt thẩm định)</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                {product.material}
              </p>

              {/* Mức giá */}
              <div className="pt-2 flex items-baseline space-x-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {product.priceDisplay}
                </span>
                {product.oldPriceDisplay && (
                  <span className="font-mono text-sm text-neutral-400 line-through">
                    {product.oldPriceDisplay}
                  </span>
                )}
                {product.oldPriceDisplay && (
                  <span className="bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    Tiết kiệm 10%
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 font-light">
                * Đã bao gồm thuế GTGT và phí vận chuyển tiêu chuẩn nội thành.
              </p>
            </div>

            {/* 1. TÙY CHỌN MÀU SẮC / DA BỌC (SWATCHES) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                  MÀU SẮC & CHẤT LIỆU
                </span>
                <span className="text-neutral-500 font-light text-[11px]">
                  Đang chọn: <strong className="text-[#8C6A48] font-medium">{selectedSwatch.name}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                {swatches.map((swatch) => {
                  const isSelected = selectedSwatch.id === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setSelectedSwatch(swatch)}
                      className={`relative w-8 h-8 rounded-full border transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-[#8C6A48] ring-offset-2 scale-110 border-white shadow-xs'
                          : 'border-black/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. TÙY CHỌN KÍCH THƯỚC MAY ĐO */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                  KÍCH THƯỚC CHẾ TÁC
                </span>
                <span className="text-neutral-400 font-mono text-[10px]">
                  (Dài × Rộng × Cao)
                </span>
              </div>

              <div className="space-y-2">
                {dimensionOptions.map((dim) => {
                  const isSelected = selectedDimension === dim.id;
                  return (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => setSelectedDimension(dim.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all ${
                        isSelected
                          ? 'border-[#8C6A48] bg-[#FAF6F0] text-[#8C6A48] font-semibold shadow-xs'
                          : 'border-[#E8E2D8] hover:bg-[#FAF8F5] text-neutral-700'
                      }`}
                    >
                      <span className="font-mono tracking-tight">{dim.label}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        {dim.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SỐ LƯỢNG & TÌNH TRẠNG KHO */}
            <div className="pt-2 flex items-center justify-between border-t border-[#F0EBE1]">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                  SỐ LƯỢNG:
                </span>
                <div className="flex items-center border border-[#E8E2D8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#EAE3D6] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#EAE3D6] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sẵn hàng tại Showroom</span>
              </span>
            </div>

            {/* 4. CỤM NÚT HÀNH ĐỘNG (CTA ACTIONS) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-[#8C6A48] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center space-x-2.5 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-[#E6C280]" />
                <span>THÊM VÀO GIỎ HÀNG</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8C6A48] hover:bg-[#734b2f] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 active:scale-98"
              >
                <span>MUA NGAY (GIAO TẬN NHÀ)</span>
              </button>

              {/* Nút tư vấn KTS */}
              <a
                href="tel:0988000999"
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-white text-neutral-700 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#8C6A48]" />
                <span>Tư vấn KTS qua Hotline: 0988.000.999</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HỒ SƠ KIẾN TRÚC & THÔNG SỐ CHẾ TÁC (TABS SECTION) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <div className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-10 shadow-sm">
          {/* Tabs header */}
          <div className="flex items-center space-x-4 sm:space-x-8 border-b border-[#E8E2D8] pb-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'specs', label: 'THÔNG SỐ KỸ THUẬT' },
              { id: 'story', label: 'CÂU CHUYỆN CHẾ TÁC' },
              { id: 'care', label: 'BẢO QUẢN & CHĂM SÓC' },
              { id: 'reviews', label: 'ĐÁNH GIÁ THỰC TẾ (32)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm uppercase tracking-wider pb-3 transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#8C6A48] font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 font-medium'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6A48]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: THÔNG SỐ KỸ THUẬT */}
          {activeTab === 'specs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm"
            >
              <div className="space-y-3">
                <h3 className="font-serif text-base sm:text-lg font-normal text-neutral-900">
                  Thông số kiến trúc chuẩn mực
                </h3>
                <div className="space-y-2 border-t border-[#F0EBE1] pt-3">
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Mã sản phẩm</span>
                    <span className="font-mono font-semibold text-neutral-900">TK-{product.id}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Kích thước tiêu chuẩn</span>
                    <span className="font-mono font-medium text-neutral-900">{product.dimensions}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Chất liệu chế tác</span>
                    <span className="font-medium text-neutral-900 text-right">{product.material}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Bộ sưu tập độc bản</span>
                    <span className="font-semibold text-[#8C6A48]">
                      {collectionInfo ? collectionInfo.title : 'TK House Master Collection'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Xuất xứ linh kiện</span>
                    <span className="font-medium text-neutral-900">Ý & Bắc Mỹ (Phụ kiện Hafele Đức)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-base sm:text-lg font-normal text-neutral-900">
                  Đặc quyền chủ nhân TK House
                </h3>
                <div className="space-y-2 border-t border-[#F0EBE1] pt-3">
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Thời gian bảo hành</span>
                    <span className="font-semibold text-neutral-900">05 Năm chính hãng toàn quốc</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Thời gian bảo trì</span>
                    <span className="font-medium text-neutral-900">Trọn đời (vệ sinh da & xử lý gỗ định kỳ)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Giao hàng & Lắp đặt</span>
                    <span className="font-medium text-emerald-600">Miễn phí 100% tận không gian phòng</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">May đo theo yêu cầu</span>
                    <span className="font-medium text-[#8C6A48]">Hỗ trợ điều chỉnh kích thước theo bản vẽ</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: CÂU CHUYỆN CHẾ TÁC */}
          {activeTab === 'story' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 sm:pt-8 space-y-4 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-3xl"
            >
              <h3 className="font-serif text-lg sm:text-xl font-normal text-neutral-900">
                Hơi thở kiến trúc đương đại và triết lý bền vững
              </h3>
              <p>
                Mỗi tác phẩm nội thất tại TK House là kết tinh của nghệ thuật tạo hình kiến trúc tối giản và sự chuẩn mực trong lựa chọn vật liệu nguyên bản. Chúng tôi tin rằng giá trị của một món đồ nội thất không chỉ nằm ở vẻ ngoài sang trọng, mà còn ở cách nó hòa quyện vào nhịp sống thường nhật của gia chủ qua hàng thập kỷ.
              </p>
              <p>
                Từ những khối đá thiêu kết chịu nhiệt độ cao 1200°C chống vết ố vĩnh cửu, da bò thuộc thảo mộc tự nhiên vùng Tuscany (Ý) cho đến gỗ sồi khối Bắc Mỹ được tẩm sấy tiêu chuẩn FAS quốc tế. Từng đường chỉ may thủ công, từng góc bo hữu cơ đều được chăm chút tỉ mỉ nhằm mang lại cảm giác tĩnh tại, an yên và sự tự hào cho mỗi ngôi nhà.
              </p>
            </motion.div>
          )}

          {/* Tab 3: BẢO QUẢN & CHĂM SÓC */}
          {activeTab === 'care' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm"
            >
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <span className="font-semibold text-neutral-900 block text-sm">Vệ sinh bề mặt</span>
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  Sử dụng khăn vi sợi mềm ẩm để lau sạch bụi bẩn hằng ngày. Tránh dùng chất tẩy rửa có tính axit mạnh hoặc cồn công nghiệp.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <span className="font-semibold text-neutral-900 block text-sm">Bảo vệ da & gỗ</span>
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  Dùng sáp dưỡng da hữu cơ hoặc dầu khoáng tự nhiên mỗi 6 tháng để giữ độ mềm mượt và bóng mịn tự nhiên theo thời gian.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <span className="font-semibold text-neutral-900 block text-sm">Vị trí bài trí</span>
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  Tránh đặt sản phẩm dưới ánh nắng trực tiếp gay gắt hoặc cạnh các nguồn nhiệt cao như lò sưởi để đảm bảo độ bền tối ưu.
                </p>
              </div>
            </motion.div>
          )}

          {/* Tab 4: ĐÁNH GIÁ THỰC TẾ */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 sm:pt-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EBE1] gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-3xl font-bold text-neutral-900">{product.rating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Dựa trên 32 đánh giá từ chủ nhân biệt thự & căn hộ cao cấp</p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Chức năng gửi cảm nhận sẽ mở sau khi đơn hàng được giao thành công!')}
                  className="px-5 py-2.5 rounded-full border border-[#8C6A48] text-[#8C6A48] hover:bg-[#8C6A48] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all self-start sm:self-auto"
                >
                  Viết cảm nhận của bạn
                </button>
              </div>

              {/* Danh sách review mẫu */}
              <div className="space-y-4">
                {[
                  {
                    author: 'KTS. Hoàng Long (Hà Nội)',
                    rating: 5,
                    date: '15/09/2026',
                    comment: 'Chất lượng hoàn thiện cực kỳ sắc sảo. Đường bo chỉ đồng và mặt đá chuẩn xác tuyệt đối theo bản vẽ phối cảnh. Khách hàng của tôi rất ưng ý.',
                  },
                  {
                    author: 'Chị Mai Lan (TP. Thủ Đức)',
                    rating: 5,
                    date: '02/10/2026',
                    comment: 'Đệm ngồi êm ái, da bò mềm đanh và có mùi thơm thảo mộc dịu nhẹ. Đội ngũ giao hàng TK House lịch sự, lắp đặt cẩn thận từng chi tiết.',
                  },
                ].map((rev, rIdx) => (
                  <div key={rIdx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-neutral-900">{rev.author}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                          Đã mua hàng
                        </span>
                      </div>
                      <span className="text-neutral-400 font-mono text-[11px]">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-neutral-600 leading-relaxed font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 4. SẢN PHẨM PHỐI HỢP / CÙNG BỘ SƯU TẬP (COMPLETE THE LOOK) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E2D8]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-semibold block mb-1">
                HOÀN THIỆN TỔ ẤM
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900">
                Tác Phẩm Đồng Điệu Cùng Bộ Sưu Tập
              </h2>
            </div>
            <Link
              to="/san-pham"
              className="text-xs font-semibold text-[#8C6A48] hover:text-neutral-900 transition-colors uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="group bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-[#FAF8F5] overflow-hidden">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {rel.tag && (
                    <span className="absolute top-2.5 left-2.5 bg-neutral-900/80 text-[#E6C280] text-[9.5px] px-2 py-0.5 rounded-full font-semibold">
                      {rel.tag}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C6A48] font-semibold block mb-0.5">
                      {rel.categoryName}
                    </span>
                    <h3 className="font-serif text-sm font-normal text-neutral-900 line-clamp-1 group-hover:text-[#8C6A48] transition-colors">
                      <Link to={`/san-pham/${rel.id}`}>{rel.name}</Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {rel.priceDisplay}
                    </span>
                    <Link
                      to={`/san-pham/${rel.id}`}
                      className="p-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#8C6A48] text-[#8C6A48] hover:text-white transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX MODAL PHÓNG TO ẢNH */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl">
              <img
                src={galleryImages[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. FLOATING BAR DÀNH CHO MOBILE (STICKY BOTTOM ACTION) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] p-3 px-4 flex items-center justify-between shadow-lg">
        <div>
          <span className="block text-[10px] text-neutral-500 uppercase font-mono">Giá sản phẩm</span>
          <span className="font-mono text-base font-bold text-neutral-900">{product.priceDisplay}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="p-2.5 rounded-xl border border-[#E8E2D8] text-neutral-700 hover:bg-[#FAF6F0]"
          >
            <Heart className={`w-4 h-4 ${isWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="py-2.5 px-5 rounded-xl bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Thêm giỏ</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
