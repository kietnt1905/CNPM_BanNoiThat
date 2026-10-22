import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
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
  Sparkle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import productApi from '../api/productApi';
import cacheHelper from '../utils/cache';
import { useCart } from '../context/CartContext';
import { PRODUCTS_CATALOG, COLLECTIONS_META } from './CategoryPage';

// Helper xác định mã màu HEX theo tên chất liệu/màu sắc
const getColorHex = (colorName) => {
  if (!colorName) return '#8C5D3E';
  const c = colorName.toLowerCase();
  if (c.includes('nâu') || c.includes('cognac') || c.includes('brown')) return '#8C5D3E';
  if (c.includes('đen nhám') || c.includes('đen') || c.includes('black')) return '#242322';
  if (c.includes('xám tro') || c.includes('xám') || c.includes('grey') || c.includes('gray')) return '#7D7A76';
  if (c.includes('kem') || c.includes('ivory') || c.includes('champagne')) return '#EAE3D6';
  if (c.includes('trắng') || c.includes('white') || c.includes('calacatta')) return '#F5F5F0';
  if (c.includes('rêu') || c.includes('green') || c.includes('forest') || c.includes('moss')) return '#3B4D3C';
  if (c.includes('sồi') || c.includes('oak') || c.includes('cát')) return '#C7A77B';
  return '#8C6A48';
};

// ==========================================
// HÀM TẠO DỮ LIỆU SẢN PHẨM CHI TIẾT TỪ CATALOG (TEST & FALLBACK)
// ==========================================
export const buildCatalogProductDetail = (catalogItem) => {
  if (!catalogItem) return null;

  const basePrice = Number(catalogItem.price || 20000000);
  const id = Number(catalogItem.id || 101);
  const name = catalogItem.name || 'Sản phẩm nội thất TK House';
  const slug = catalogItem.slug || `san-pham-${id}`;
  const material = catalogItem.material || 'Vật liệu tự nhiên cao cấp';
  const materialType = catalogItem.materialType || 'wood';
  const group = catalogItem.group || 'ban';
  const primaryImage = catalogItem.image || '/images/products/sofa-3-cho-victoria.jpg';
  const secImage = catalogItem.secondaryImage || '/images/materials/mat-leather.jpg';

  // Gallery hình ảnh
  const images = [
    { url: primaryImage, is_primary: true },
    { url: secImage, is_primary: false },
  ];
  if (materialType === 'leather') {
    images.push({ url: '/images/materials/mat-leather.jpg' });
    images.push({ url: '/images/lookbook/lookbook-living.jpg' });
  } else if (materialType === 'stone') {
    images.push({ url: '/images/materials/mat-ceramic.jpg' });
    images.push({ url: '/images/lookbook/lookbook-dining.jpg' });
  } else if (materialType === 'wood') {
    images.push({ url: '/images/materials/mat-walnut.jpg' });
    images.push({ url: '/images/banners/phong-ngu.jpg' });
  } else {
    images.push({ url: '/images/materials/mat-boucle.jpg' });
  }

  // Tạo các biến thể đa dạng theo nhóm sản phẩm để người dùng test thoải mái
  let variants = [];

  if (group === 'sofa' || catalogItem.categorySlug?.includes('sofa') || catalogItem.categorySlug?.includes('ghe')) {
    const isSingleChair = name.toLowerCase().includes('armchair') || name.toLowerCase().includes('ghế');
    const dimList = isSingleChair
      ? [
        { key: 'Tiêu chuẩn', detail: 'D85 × R80 × C90 cm', priceAdj: 0 },
        { key: 'Mở rộng Grand', detail: 'D95 × R88 × C95 cm', priceAdj: 1500000 },
      ]
      : [
        { key: '2m2', detail: 'D220 × R95 × C75 cm (Phù hợp căn hộ 70-100m²)', priceAdj: 0 },
        { key: '2m6', detail: 'D260 × R95 × C75 cm (Phù hợp biệt thự, penthouse)', priceAdj: 4500000 },
      ];

    const colors = [
      { name: 'Nâu Cognac', code: '#8C5D3E' },
      { name: 'Đen Nhám', code: '#242322' },
      { name: 'Xám Tro', code: '#7D7A76' },
      { name: 'Kem Ivory', code: '#EAE3D6' },
    ];

    const materials = [
      { name: 'Da Bò Ý Cao Cấp', matAdj: 0 },
      { name: 'Vải Nỉ Bouclé Ý', matAdj: -2000000 },
    ];

    let varIdx = 1;
    for (const mat of materials) {
      for (const col of colors) {
        for (const dim of dimList) {
          const varPrice = Math.max(5000000, basePrice + dim.priceAdj + mat.matAdj);
          variants.push({
            id: id * 100 + varIdx++,
            sku: `TK-${id}-${dim.key.replace(/\s+/g, '')}-${col.name.slice(0, 2).toUpperCase()}`,
            color: col.name,
            material: mat.name,
            dimensions: dim.key,
            dimensions_detail: dim.detail,
            price: varPrice,
            price_display: `${new Intl.NumberFormat('vi-VN').format(varPrice)}₫`,
            stock_quantity: 8,
          });
        }
      }
    }
  } else if (group === 'ban' || catalogItem.categorySlug?.includes('ban')) {
    const isDining = name.toLowerCase().includes('bàn ăn');
    const dimList = isDining
      ? [
        { key: '1m8 (6-8 người)', detail: 'D180 × R90 × C75 cm', priceAdj: 0 },
        { key: '2m2 (8-10 người)', detail: 'D220 × R100 × C75 cm', priceAdj: 3500000 },
      ]
      : [
        { key: 'Tiêu chuẩn', detail: catalogItem.dimensions || 'D80 × R80 × C45 cm', priceAdj: 0 },
        { key: 'Bản lớn Grand', detail: 'D100 × R100 × C45 cm', priceAdj: 2200000 },
      ];

    const colors = [
      { name: 'Trắng Calacatta', code: '#F5F5F0' },
      { name: 'Đen Nero Marquina', code: '#242322' },
      { name: 'Xám Champagne', code: '#7D7A76' },
    ];

    const materials = [
      { name: 'Đá Ceramic Calacatta', matAdj: 0 },
      { name: 'Đá Marble Laurentian', matAdj: 1500000 },
    ];

    let varIdx = 1;
    for (const mat of materials) {
      for (const col of colors) {
        for (const dim of dimList) {
          const varPrice = basePrice + dim.priceAdj + mat.matAdj;
          variants.push({
            id: id * 100 + varIdx++,
            sku: `TK-${id}-${dim.key.slice(0, 3)}-${col.name.slice(0, 2).toUpperCase()}`,
            color: col.name,
            material: mat.name,
            dimensions: dim.key,
            dimensions_detail: dim.detail,
            price: varPrice,
            price_display: `${new Intl.NumberFormat('vi-VN').format(varPrice)}₫`,
            stock_quantity: 12,
          });
        }
      }
    }
  } else if (group === 'phong-ngu' || catalogItem.categorySlug?.includes('giuong') || catalogItem.categorySlug?.includes('tu')) {
    const isBed = name.toLowerCase().includes('giường');
    const dimList = isBed
      ? [
        { key: '1m8 × 2m', detail: 'D200 × R180 × C100 cm', priceAdj: 0 },
        { key: '2m × 2m2', detail: 'D220 × R200 × C100 cm', priceAdj: 3000000 },
      ]
      : [
        { key: 'Tiêu chuẩn 4 cánh', detail: 'D240 × R60 × C260 cm', priceAdj: 0 },
        { key: 'May đo 6 cánh', detail: 'D320 × R60 × C260 cm', priceAdj: 8500000 },
      ];

    const colors = [
      { name: 'Gỗ Óc Chó Tự Nhiên', code: '#4A3525' },
      { name: 'Gỗ Sồi Bắc Mỹ', code: '#C7A77B' },
      { name: 'Xám Khói Hiện Đại', code: '#7D7A76' },
    ];

    const materials = [
      { name: 'Gỗ Óc Chó FAS & Nỉ Bouclé', matAdj: 0 },
      { name: 'Gỗ Sồi Bắc Mỹ & Da Nappa', matAdj: 1500000 },
    ];

    let varIdx = 1;
    for (const mat of materials) {
      for (const col of colors) {
        for (const dim of dimList) {
          const varPrice = basePrice + dim.priceAdj + mat.matAdj;
          variants.push({
            id: id * 100 + varIdx++,
            sku: `TK-${id}-${dim.key.replace(/\s+/g, '')}-${col.name.slice(0, 2).toUpperCase()}`,
            color: col.name,
            material: mat.name,
            dimensions: dim.key,
            dimensions_detail: dim.detail,
            price: varPrice,
            price_display: `${new Intl.NumberFormat('vi-VN').format(varPrice)}₫`,
            stock_quantity: 6,
          });
        }
      }
    }
  } else {
    const dimList = [
      { key: 'Tiêu chuẩn', detail: catalogItem.dimensions || 'Chiều cao tiêu chuẩn', priceAdj: 0 },
    ];
    const colors = [
      { name: 'Đồng Thau Cổ Điển', code: '#B8860B' },
      { name: 'Đen Nhám Mạ PVD', code: '#242322' },
    ];
    const materials = [
      { name: 'Đồng Thau Đúc & Pha Lê', matAdj: 0 },
    ];
    let varIdx = 1;
    for (const mat of materials) {
      for (const col of colors) {
        for (const dim of dimList) {
          const varPrice = basePrice + dim.priceAdj + mat.matAdj;
          variants.push({
            id: id * 100 + varIdx++,
            sku: `TK-${id}-${col.name.slice(0, 2).toUpperCase()}`,
            color: col.name,
            material: mat.name,
            dimensions: dim.key,
            dimensions_detail: dim.detail,
            price: varPrice,
            price_display: `${new Intl.NumberFormat('vi-VN').format(varPrice)}₫`,
            stock_quantity: 15,
          });
        }
      }
    }
  }

  return {
    id: id,
    name: name,
    slug: slug,
    brand: 'TK House Luxury',
    description:
      catalogItem.description ||
      `Kiệt tác ${name} thuộc bộ sưu tập đỉnh cao của TK House, kết hợp hài hòa giữa kỹ nghệ thủ công bậc thầy và đường nét kiến trúc đương đại. Từng chi tiết đều được chăm chút tỉ mỉ từ vật liệu tuyển chọn cao cấp, mang đến vẻ đẹp vĩnh cửu và sự êm ái tuyệt đối cho không gian sống thượng lưu.`,
    category: {
      name: catalogItem.categoryName || 'Nội thất cao cấp',
      slug: catalogItem.categorySlug || 'san-pham',
    },
    categoryName: catalogItem.categoryName || 'Nội thất cao cấp',
    categorySlug: catalogItem.categorySlug || 'san-pham',
    collection: catalogItem.collection || 'valencia',
    material: catalogItem.material || 'Vật liệu tự nhiên cao cấp',
    materialType: materialType,
    dimensions: catalogItem.dimensions || 'Tiêu chuẩn cao cấp',
    rating: catalogItem.rating || 5.0,
    review_count: 24,
    warranty_months: 36,
    min_price: basePrice,
    max_price: basePrice + 5000000,
    price: basePrice,
    price_display: catalogItem.priceDisplay || `${new Intl.NumberFormat('vi-VN').format(basePrice)}₫`,
    old_price_display: catalogItem.oldPriceDisplay || `${new Intl.NumberFormat('vi-VN').format(basePrice * 1.15)}₫`,
    in_stock: true,
    total_stock: 25,
    images: images,
    variants: variants,
  };
};

export default function ProductDetailPage({ id: propId }) {
  const params = useParams();
  const routeId = params.id;
  const idOrSlug = params.idOrSlug;
  const categorySlug = params.categorySlug;
  const splat = params['*'];
  const navigate = useNavigate();
  const { addToCart, setSelectedIds } = useCart();

  // Nhận diện product ID hoặc slug từ prop hoặc params
  const rawTarget = propId || idOrSlug || routeId || categorySlug || splat;
  let targetId = '';
  try {
    targetId = rawTarget ? decodeURIComponent(rawTarget).trim() : '';
  } catch {
    targetId = rawTarget ? String(rawTarget).trim() : '';
  }

  const detailCacheKey = `product_detail_${targetId}`;
  const initialDetailCached = cacheHelper.get(detailCacheKey);

  const [apiProduct, setApiProduct] = useState(() => initialDetailCached || null);
  const [loading, setLoading] = useState(() => !initialDetailCached);
  const [fetchError, setFetchError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dynamicRelated, setDynamicRelated] = useState([]);

  // Cuộn lên đầu trang và tải chi tiết sản phẩm từ backend API (Stale-While-Revalidate)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let isMounted = true;

    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      const cached = cacheHelper.get(detailCacheKey);
      if (cached) {
        setApiProduct(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setFetchError(null);

      try {
        const res = await productApi.getByIdOrSlug(targetId);
        if (isMounted && res.data?.status && res.data.data) {
          setApiProduct(res.data.data);
          cacheHelper.set(detailCacheKey, res.data.data, 10);
          setFetchError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend API getByIdOrSlug chưa phản hồi:', err.message);
      }

      if (isMounted) {
        if (!cached) {
          setFetchError('Không tìm thấy thông tin sản phẩm trên máy chủ.');
          setApiProduct(null);
        }
        setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Tải danh sách sản phẩm liên quan từ API theo danh mục
  useEffect(() => {
    if (!apiProduct) return;
    let isMounted = true;
    const catSlug = apiProduct.category?.slug || '';
    if (catSlug) {
      productApi.getAll({ category: catSlug, limit: 4 })
        .then((res) => {
          if (isMounted && res.data?.data) {
            const items = Array.isArray(res.data.data) ? res.data.data : res.data.data.items || [];
            setDynamicRelated(items.filter((p) => p.id !== apiProduct.id).slice(0, 4));
          }
        })
        .catch(() => { });
    }
    return () => {
      isMounted = false;
    };
  }, [apiProduct]);

  // Chuẩn hóa dữ liệu sản phẩm từ API
  const product = useMemo(() => {
    if (!apiProduct) return null;

    const catObj = apiProduct.category || {};
    const minP = Number(apiProduct.min_price || apiProduct.price || 0);
    const maxP = Number(apiProduct.max_price || minP);
    const priceDisplay = apiProduct.price_display || (minP > 0 ? `${new Intl.NumberFormat('vi-VN').format(minP)}₫` : 'Liên hệ');

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      slug: apiProduct.slug || String(apiProduct.id),
      brand: apiProduct.brand || 'TK House',
      description: apiProduct.description || '',
      categoryName: apiProduct.categoryName || catObj.name || 'Nội thất cao cấp',
      categorySlug: apiProduct.categorySlug || catObj.slug || 'san-pham',
      warranty_months: apiProduct.warranty_months || 24,
      min_price: minP,
      max_price: maxP,
      price: minP,
      priceDisplay: priceDisplay,
      oldPriceDisplay: apiProduct.old_price_display || apiProduct.oldPriceDisplay || null,
      in_stock: Boolean(apiProduct.in_stock ?? ((apiProduct.total_stock ?? 1) > 0)),
      total_stock: apiProduct.total_stock ?? 10,
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : [],
      variants: Array.isArray(apiProduct.variants) && apiProduct.variants.length > 0 ? apiProduct.variants : [],
      material: apiProduct.material || 'Gỗ sồi tự nhiên & da cao cấp',
      materialType: apiProduct.materialType || 'leather',
      collection: apiProduct.collection || '',
      dimensions: apiProduct.dimensions || 'Tiêu chuẩn',
      rating: apiProduct.rating || 5.0,
      review_count: apiProduct.review_count || 16,
      tag: apiProduct.tag || (apiProduct.in_stock ? 'Sẵn hàng tại Showroom' : 'Chế tác theo yêu cầu'),
      image: apiProduct.image || apiProduct.images?.[0]?.url || apiProduct.thumbnail || '/images/products/sofa-3-cho-victoria.jpg',
      secondaryImage: apiProduct.secondaryImage || apiProduct.images?.[1]?.url || null,
    };
  }, [apiProduct]);

  // Danh sách biến thể từ API
  const variants = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants;
    }
    if (product) {
      return [
        {
          id: product.id,
          sku: `TK-${product.id}`,
          color: 'Tiêu chuẩn',
          material: product.material,
          dimensions: product.dimensions,
          price: product.price,
          price_display: product.priceDisplay,
          stock_quantity: product.total_stock,
        },
      ];
    }
    return [];
  }, [product]);

  // Danh sách các tùy chọn Chất liệu, Màu sắc, Kích thước
  const availableMaterials = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => v.material && set.add(v.material));
    return Array.from(set);
  }, [variants]);

  const availableColors = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => v.color && set.add(v.color));
    return Array.from(set);
  }, [variants]);

  const availableDimensions = useMemo(() => {
    const list = [];
    const seen = new Set();
    variants.forEach((v) => {
      const dimKey = v.dimensions || '2m2';
      if (!seen.has(dimKey)) {
        seen.add(dimKey);
        list.push({
          key: dimKey,
          label: dimKey.includes('(') ? dimKey : `${dimKey} (${v.dimensions_detail || 'Chuẩn'})`,
          detail: v.dimensions_detail || 'Tiêu chuẩn cao cấp',
        });
      }
    });
    return list;
  }, [variants]);

  // State chọn lựa thuộc tính độc lập
  const [selectedMaterial, setSelectedMaterial] = useState(availableMaterials[0] || 'Da Bò Ý');
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || 'Nâu Cognac');
  const [selectedDimension, setSelectedDimension] = useState(availableDimensions[0]?.key || '2m2');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Biến thể khớp với bộ ba [Chất liệu, Màu sắc, Kích thước]
  const selectedVariant = useMemo(() => {
    const exact = variants.find(
      (v) =>
        v.material === selectedMaterial &&
        v.color === selectedColor &&
        (v.dimensions === selectedDimension || v.dimensions?.startsWith(selectedDimension))
    );
    if (exact) return exact;

    // Fallback nếu không khớp trọn vẹn
    const matchMatCol = variants.find((v) => v.material === selectedMaterial && v.color === selectedColor);
    if (matchMatCol) return matchMatCol;

    const matchMat = variants.find((v) => v.material === selectedMaterial);
    if (matchMat) return matchMat;

    return variants[0];
  }, [variants, selectedMaterial, selectedColor, selectedDimension]);

  // Reset về tùy chọn mặc định khi đổi sản phẩm
  useEffect(() => {
    if (availableMaterials.length > 0) setSelectedMaterial(availableMaterials[0]);
    if (availableColors.length > 0) setSelectedColor(availableColors[0]);
    if (availableDimensions.length > 0) setSelectedDimension(availableDimensions[0].key);
    setActiveImageIdx(0);
    setQuantity(1);
  }, [product, availableMaterials, availableColors, availableDimensions]);

  // Gallery hình ảnh cho sản phẩm
  const galleryImages = useMemo(() => {
    if (!product) return ['/images/products/sofa-3-cho-victoria.jpg'];
    const list = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = typeof img === 'string' ? img : img?.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (list.length === 0 && product.image) {
      list.push(product.image);
    }
    if (product.secondaryImage && !list.includes(product.secondaryImage)) {
      list.push(product.secondaryImage);
    }
    return list.length > 0 ? list : ['/images/products/sofa-3-cho-victoria.jpg'];
  }, [product]);

  // Giá và tồn kho hiện tại theo biến thể
  const currentPriceDisplay = useMemo(() => {
    if (selectedVariant?.price_display) return selectedVariant.price_display;
    if (selectedVariant?.price) {
      return `${new Intl.NumberFormat('vi-VN').format(Number(selectedVariant.price))}₫`;
    }
    return product?.priceDisplay || '28.500.000₫';
  }, [selectedVariant, product?.priceDisplay]);

  const currentStock = useMemo(() => {
    if (selectedVariant && selectedVariant.stock_quantity !== undefined) {
      return Number(selectedVariant.stock_quantity);
    }
    return Number(product?.total_stock ?? 10);
  }, [selectedVariant, product?.total_stock]);

  const isOutOfStock = currentStock <= 0;

  // Hiển thị toast thông báo
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Tăng/giảm số lượng
  const handleIncreaseQty = () => {
    if (currentStock > 0 && quantity >= currentStock) {
      showToast(`Kho hiện chỉ còn ${currentStock} sản phẩm cho phiên bản này`);
      return;
    }
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      showToast('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    if (isOutOfStock) {
      showToast('Phiên bản này hiện đang tạm hết hàng trong kho');
      return;
    }
    try {
      setIsAdding(true);
      await addToCart(selectedVariant.id, quantity, {
        openDrawer: false,
        productInfo: {
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          variant_name: `${selectedVariant.color} • ${selectedVariant.dimensions} • ${selectedVariant.material}`,
          sku: selectedVariant.sku,
          color: selectedVariant.color,
          material: selectedVariant.material,
          dimensions: selectedVariant.dimensions,
          price: selectedVariant.price,
          thumbnail: galleryImages[0] || product.image,
          stock_quantity: selectedVariant.stock_quantity,
        },
      });
      showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsAdding(false);
    }
  };

  // Xử lý mua ngay
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      showToast('Vui lòng chọn biến thể sản phẩm');
      return;
    }
    if (isOutOfStock) {
      showToast('Phiên bản này hiện đang tạm hết hàng trong kho');
      return;
    }
    try {
      setIsAdding(true);
      await addToCart(selectedVariant.id, quantity, {
        openDrawer: false,
        productInfo: {
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          variant_name: `${selectedVariant.color} • ${selectedVariant.dimensions} • ${selectedVariant.material}`,
          sku: selectedVariant.sku,
          color: selectedVariant.color,
          material: selectedVariant.material,
          dimensions: selectedVariant.dimensions,
          price: selectedVariant.price,
          thumbnail: galleryImages[0] || product.image,
          stock_quantity: selectedVariant.stock_quantity,
        },
      });
      // Chọn riêng sản phẩm này để thanh toán ngay
      if (setSelectedIds) {
        setSelectedIds([Number(selectedVariant.id)]);
      }
      // Chuyển thẳng đến bước thanh toán (không qua trang giỏ hàng)
      navigate('/checkout', {
        state: {
          buyNowVariantId: Number(selectedVariant.id),
          fromBuyNow: true,
        },
      });
    } catch (err) {
      showToast(err.message || 'Lỗi khi chuẩn bị đơn hàng');
    } finally {
      setIsAdding(false);
    }
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
    if (!product) return [];
    if (dynamicRelated.length > 0) return dynamicRelated;
    if (Array.isArray(PRODUCTS_CATALOG)) {
      return PRODUCTS_CATALOG.filter(
        (p) => p.id !== product.id && (p.collection === product.collection || p.categorySlug === product.categorySlug)
      ).slice(0, 4);
    }
    return [];
  }, [product, dynamicRelated]);

  // Lấy metadata bộ sưu tập
  const collectionInfo = (product?.collection && COLLECTIONS_META) ? COLLECTIONS_META[product.collection] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="w-9 h-9 animate-spin text-[#8C6A48] mb-4" />
        <p className="font-serif text-base text-neutral-800 tracking-wide">
          Đang tải thông tin sản phẩm...
        </p>
        <span className="text-xs text-neutral-400 mt-1 font-light">
          Hệ thống đang kết nối dữ liệu từ máy chủ
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-neutral-400 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-[#8C6A48]" />
        </div>
        <h2 className="font-serif text-2xl text-neutral-900 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mb-6 font-light">
          {fetchError || 'Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.'}
        </p>
        <div className="flex items-center space-x-3">
          <Link
            to="/san-pham"
            className="px-6 py-3 rounded-full bg-[#8C6A48] hover:bg-[#734b2f] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
          >
            Khám phá danh mục sản phẩm
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#FAF8F5] text-[#2C241E] pb-28 pt-2 sm:pt-4"
    >
      {/* Toast thông báo tinh tế */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2C241E]/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center space-x-2.5 text-xs font-medium tracking-wide backdrop-blur-md"
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
                src={galleryImages[activeImageIdx] || '/images/placeholder.jpg'}
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
                  className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${activeImageIdx === idx
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
                  {product.warranty_months} THÁNG BẢO HÀNH CHÍNH HÃNG
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
                    <span className="text-[10.5px] text-neutral-500 font-light">100% Gỗ FAS & Da Ý thảo mộc</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#FAF8F5]">
                  <RotateCcw className="w-4 h-4 text-[#8C6A48] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-[11px]">Đổi trả trong 30 ngày</span>
                    <span className="text-[10.5px] text-neutral-500 font-light">Bảo trì bảo dưỡng trọn đời</span>
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
                  {product.categoryName} • SKU: {selectedVariant?.sku || `TK-${product.id}`}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-neutral-900">{product.rating}</span>
                  <span className="text-neutral-400 text-[11px]">({product.review_count || 32} lượt thẩm định)</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                {selectedVariant?.material || product.material} • Khung gỗ sồi Bắc Mỹ tẩm sấy tiêu chuẩn FAS
              </p>

              {/* Mức giá */}
              <div className="pt-2 flex items-baseline space-x-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {currentPriceDisplay}
                </span>
                {product.oldPriceDisplay && (
                  <span className="font-mono text-sm text-neutral-400 line-through">
                    {product.oldPriceDisplay}
                  </span>
                )}
                {product.oldPriceDisplay && (
                  <span className="bg-[#FAF6F0] text-[#8C6A48] border border-[#E5DACD] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    Tiết kiệm 4.500.000₫
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 font-light">
                * Đã bao gồm thuế GTGT và miễn phí vận chuyển, lắp đặt hoàn thiện nội thành.
              </p>
            </div>

            {/* 1. TÙY CHỌN CHẤT LIỆU (MATERIAL PICKER) */}
            {availableMaterials.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                    1. CHẤT LIỆU BỌC
                  </span>
                  <span className="text-neutral-500 font-light text-[11px]">
                    Đang chọn: <strong className="text-[#8C6A48] font-medium">{selectedMaterial}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterial === mat;
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setSelectedMaterial(mat)}
                        className={`p-3 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${isSelected
                          ? 'border-[#8C6A48] bg-[#FAF6F0] text-[#8C6A48] font-semibold ring-1 ring-[#8C6A48] shadow-xs'
                          : 'border-[#E8E2D8] hover:bg-[#FAF8F5] text-neutral-700'
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8C6A48]' : 'text-neutral-400'}`} />
                          <span>{mat}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#8C6A48]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. TÙY CHỌN MÀU SẮC (COLOR SWATCHES) */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                    2. MÀU SẮC & HOÀN THIỆN
                  </span>
                  <span className="text-neutral-500 font-light text-[11px]">
                    Đang chọn: <strong className="text-[#8C6A48] font-medium">{selectedColor}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  {availableColors.map((colorName) => {
                    const isSelected = selectedColor === colorName;
                    const hex = getColorHex(colorName);
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={`relative group flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${isSelected
                          ? 'border-[#8C6A48] bg-[#FAF6F0] ring-1 ring-[#8C6A48] shadow-xs'
                          : 'border-[#E8E2D8] hover:border-neutral-400 bg-white'
                          }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner"
                          style={{ backgroundColor: hex }}
                        />
                        <span className={`text-xs ${isSelected ? 'font-semibold text-[#8C6A48]' : 'text-neutral-700'}`}>
                          {colorName}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-[#8C6A48]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. TÙY CHỌN KÍCH THƯỚC (DIMENSION SELECTOR) */}
            {availableDimensions.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                    3. KÍCH THƯỚC CHẾ TÁC
                  </span>
                  <span className="text-neutral-400 font-mono text-[10px]">
                    (Dài × Rộng × Cao)
                  </span>
                </div>

                <div className="space-y-2">
                  {availableDimensions.map((dim) => {
                    const isSelected = selectedDimension === dim.key;
                    return (
                      <button
                        key={dim.key}
                        type="button"
                        onClick={() => setSelectedDimension(dim.key)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all ${isSelected
                          ? 'border-[#8C6A48] bg-[#FAF6F0] text-[#8C6A48] font-semibold ring-1 ring-[#8C6A48] shadow-xs'
                          : 'border-[#E8E2D8] hover:bg-[#FAF8F5] text-neutral-700'
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold tracking-tight">{dim.key}</span>
                          <span className="text-neutral-400 font-normal">({dim.detail})</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-mono font-medium">
                          Sẵn hàng tại kho
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. SỐ LƯỢNG & TÌNH TRẠNG KHO */}
            <div className="pt-2 flex items-center justify-between border-t border-[#F0EBE1]">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
                  SỐ LƯỢNG:
                </span>
                <div className="flex items-center border border-[#E8E2D8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={handleDecreaseQty}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#EAE3D6] transition-colors disabled:opacity-40"
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQty}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[#EAE3D6] transition-colors disabled:opacity-40"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {!isOutOfStock ? (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sẵn hàng ({currentStock} sản phẩm tại kho)</span>
                </span>
              ) : (
                <span className="text-[11px] text-rose-500 font-medium flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Tạm hết hàng (Đặt trước 7-10 ngày)</span>
                </span>
              )}
            </div>

            {/* 5. CỤM NÚT HÀNH ĐỘNG (CTA ACTIONS) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-[#8C6A48] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center space-x-2.5 active:scale-98"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E6C280]" />
                    <span>ĐANG THÊM VÀO GIỎ HÀNG...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#E6C280]" />
                    <span>{isOutOfStock ? 'TẠM HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAdding || isOutOfStock}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8C6A48] hover:bg-[#734b2f] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 active:scale-98"
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
              { id: 'reviews', label: 'ĐÁNH GIÁ THỰC TẾ (48)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm uppercase tracking-wider pb-3 transition-colors relative whitespace-nowrap ${activeTab === tab.id
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
                    <span className="text-neutral-500">Mã sản phẩm / SKU</span>
                    <span className="font-mono font-semibold text-neutral-900">{selectedVariant?.sku || `TK-${product.id}`}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Kích thước phiên bản</span>
                    <span className="font-mono font-medium text-neutral-900">{selectedVariant?.dimensions_detail || selectedVariant?.dimensions || product.dimensions}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Chất liệu bọc</span>
                    <span className="font-medium text-neutral-900 text-right">{selectedVariant?.material || product.material}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Màu sắc hoàn thiện</span>
                    <span className="font-medium text-[#8C6A48] text-right">{selectedVariant?.color || 'Nâu Cognac'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Khung chịu lực</span>
                    <span className="font-medium text-neutral-900">Gỗ sồi Bắc Mỹ tẩm sấy tiêu chuẩn FAS</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Đệm mút & lò xo</span>
                    <span className="font-medium text-neutral-900">Mút D40 phủ lông vũ + Lò xo túi 7 vùng</span>
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
                    <span className="font-semibold text-neutral-900">{product.warranty_months} Tháng chính hãng toàn quốc</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Thời gian bảo trì</span>
                    <span className="font-medium text-neutral-900">Trọn đời (vệ sinh da & bảo dưỡng định kỳ)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Giao hàng & Lắp đặt</span>
                    <span className="font-medium text-emerald-600">Miễn phí 100% tận không gian phòng</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">May đo theo yêu cầu</span>
                    <span className="font-medium text-[#8C6A48]">Hỗ trợ điều chỉnh kích thước theo mặt bằng</span>
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
                Hơi thở kiến trúc đương đại và triết lý bền vững Ý
              </h3>
              <div className="whitespace-pre-line text-neutral-600 leading-relaxed font-light">
                {product.description}
              </div>
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
                  Sử dụng khăn vi sợi mềm ẩm để lau sạch bụi bẩn hằng ngày. Tuyệt đối không dùng chất tẩy rửa có tính axit mạnh hoặc cồn công nghiệp.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <span className="font-semibold text-neutral-900 block text-sm">Bảo vệ chất liệu da & nỉ</span>
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  Dùng sáp dưỡng da hữu cơ tự nhiên mỗi 6 tháng để giữ độ mềm mượt và bóng mịn tự nhiên theo thời gian.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <span className="font-semibold text-neutral-900 block text-sm">Vị trí bài trí</span>
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  Tránh đặt sản phẩm dưới ánh nắng trực tiếp gay gắt hoặc cạnh nguồn nhiệt cao để bảo toàn kết cấu sợi da và độ bền màu.
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
                    <span className="font-serif text-3xl font-bold text-neutral-900">5.0</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Dựa trên 48 đánh giá từ chủ nhân biệt thự & penthouse cao cấp</p>
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
                    comment: 'Chất lượng hoàn thiện cực kỳ sắc sảo. Đường bo chỉ đồng và mặt da bò Ý mềm đanh, chuẩn xác tuyệt đối theo bản vẽ phối cảnh 3D. Khách hàng của tôi rất hài lòng.',
                  },
                  {
                    author: 'Chị Mai Lan (TP. Thủ Đức)',
                    rating: 5,
                    date: '02/10/2026',
                    comment: 'Đệm ngồi êm ái, da bò mềm và có mùi thơm thảo mộc dịu nhẹ. Đội ngũ giao hàng TK House lịch sự, lắp đặt cẩn thận từng chi tiết.',
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
                      <Link to={`/san-pham/${rel.slug || rel.id}`}>{rel.name}</Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {rel.priceDisplay}
                    </span>
                    <Link
                      to={`/san-pham/${rel.slug || rel.id}`}
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
                src={galleryImages[activeImageIdx] || '/images/placeholder.jpg'}
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
          <span className="block text-[10px] text-neutral-500 uppercase font-mono">Giá phiên bản</span>
          <span className="font-mono text-base font-bold text-neutral-900">{currentPriceDisplay}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className="py-2.5 px-5 rounded-xl bg-[#8C6A48] disabled:bg-neutral-400 text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm active:scale-98"
          >
            {isAdding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
            <span>{isAdding ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
