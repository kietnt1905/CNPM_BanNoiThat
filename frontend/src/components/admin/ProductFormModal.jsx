import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Layers,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Link as LinkIcon,
  Star,
  Info,
  DollarSign,
  Shield,
  Palette,
  Maximize2
} from 'lucide-react';
import adminProductApi from '../../api/adminProductApi';
import adminCategoryApi from '../../api/adminCategoryApi';
import { slugify } from './CategoryModal';

// Helper hiển thị ảnh an toàn
export const getSafeImageUrl = (url) => {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `http://127.0.0.1:8000${url}`;
  return url;
};

export default function ProductFormModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(product);
  const fileInputRef = useRef(null);

  // Danh mục tải từ API
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Tab chuyển đổi trong form: 'general' | 'gallery' | 'variants'
  const [activeFormTab, setActiveFormTab] = useState('general');

  // State Form Chính
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    brand: '',
    warranty_months: 12,
    description: '',
    is_active: true,
  });

  // State Thư viện Ảnh
  const [images, setImages] = useState([]); // [{ image_url, alt_text, sort_order }]
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // State Danh sách Biến thể (Dynamic Variants)
  const [variants, setVariants] = useState([
    {
      id: null,
      color: 'Mặc định',
      material: 'Gỗ sồi tự nhiên',
      price: '',
      stock_quantity: 10,
      length_cm: '',
      width_cm: '',
      height_cm: '',
      weight_kg: '',
      sku: '',
      is_active: true,
    },
  ]);

  const [isSlugAuto, setIsSlugAuto] = useState(!isEditing);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Tải danh mục cho dropdown
  useEffect(() => {
    if (isOpen) {
      setLoadingCategories(true);
      adminCategoryApi
        .getAllNoPagination()
        .then((res) => {
          if (res.data?.status && Array.isArray(res.data.data)) {
            setCategories(res.data.data);
          }
        })
        .catch((err) => console.error('Lỗi nạp danh mục:', err))
        .finally(() => setLoadingCategories(false));
    }
  }, [isOpen]);

  // Nạp dữ liệu sản phẩm khi mở modal (Tạo mới hoặc Sửa)
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      // Đang sửa: nạp chi tiết từ prop hoặc tải chi tiết
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category?.id || product.category_id || '',
        brand: product.brand || '',
        warranty_months: product.warranty_months ?? 12,
        description: product.description || '',
        is_active: product.is_active !== false,
      });

      // Nếu có sẵn mảng images và variants từ API
      if (Array.isArray(product.images) && product.images.length > 0) {
        setImages(
          product.images.map((img, idx) => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order ?? idx,
          }))
        );
      } else if (product.thumbnail) {
        setImages([
          {
            image_url: product.thumbnail,
            alt_text: product.name,
            sort_order: 0,
          },
        ]);
      } else {
        setImages([]);
      }

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            id: v.id,
            color: v.color || '',
            material: v.material || '',
            price: v.price ?? '',
            stock_quantity: v.stock_quantity ?? 0,
            length_cm: v.length_cm ?? '',
            width_cm: v.width_cm ?? '',
            height_cm: v.height_cm ?? '',
            weight_kg: v.weight_kg ?? '',
            sku: v.sku || '',
            is_active: v.is_active !== false,
          }))
        );
      } else {
        setVariants([
          {
            id: null,
            color: 'Tiêu chuẩn',
            material: 'Gỗ cao cấp',
            price: product.min_price || '',
            stock_quantity: product.total_stock || 10,
            length_cm: '',
            width_cm: '',
            height_cm: '',
            weight_kg: '',
            sku: '',
            is_active: true,
          },
        ]);
      }

      setIsSlugAuto(false);
    } else {
      // Chế độ Tạo mới
      setFormData({
        name: '',
        slug: '',
        category_id: '',
        brand: 'TK House Atelier',
        warranty_months: 24,
        description: '',
        is_active: true,
      });
      setImages([]);
      setVariants([
        {
          id: null,
          color: 'Nâu Walnut',
          material: 'Gỗ óc chó Bắc Mỹ',
          price: '',
          stock_quantity: 10,
          length_cm: '',
          width_cm: '',
          height_cm: '',
          weight_kg: '',
          sku: '',
          is_active: true,
        },
      ]);
      setIsSlugAuto(true);
    }

    setErrors({});
    setServerError('');
    setActiveFormTab('general');
  }, [product, isOpen]);

  // Xử lý đổi tên -> tự sinh slug nếu chưa sửa tay
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, name: val };
      if (isSlugAuto || !prev.slug.trim()) {
        next.slug = slugify(val);
      }
      return next;
    });

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleSlugChange = (e) => {
    setIsSlugAuto(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  // Upload ảnh từ máy tính thông qua API uploadImage
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setServerError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate định dạng & dung lượng <= 5MB
      if (!file.type.startsWith('image/')) {
        setServerError('Vui lòng chỉ chọn các tệp hình ảnh (jpg, png, webp).');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setServerError(`Tệp "${file.name}" vượt quá dung lượng tối đa 5MB.`);
        continue;
      }

      try {
        const res = await adminProductApi.uploadImage(file);
        if (res.data?.status && res.data.data?.image_url) {
          const newImg = {
            image_url: res.data.data.image_url,
            full_url: res.data.data.full_url || res.data.data.image_url,
            alt_text: file.name.replace(/\.[^/.]+$/, ''),
            sort_order: images.length,
          };
          setImages((prev) => [...prev, newImg]);
        }
      } catch (err) {
        console.error('Lỗi upload ảnh:', err);
        const msg =
          err.response?.data?.message ||
          `Không thể tải ảnh "${file.name}" lên server.`;
        setServerError(msg);
      }
    }

    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Thêm ảnh từ URL trực tiếp
  const handleAddDirectUrl = () => {
    const url = directImageUrl.trim();
    if (!url) return;

    setImages((prev) => [
      ...prev,
      {
        image_url: url,
        full_url: url,
        alt_text: formData.name || 'Ảnh sản phẩm',
        sort_order: prev.length,
      },
    ]);
    setDirectImageUrl('');
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Đưa ảnh lên làm ảnh đại diện chính (đầu mảng)
  const handleSetPrimaryImage = (indexToPrimary) => {
    setImages((prev) => {
      const target = prev[indexToPrimary];
      const remaining = prev.filter((_, idx) => idx !== indexToPrimary);
      return [target, ...remaining].map((img, idx) => ({
        ...img,
        sort_order: idx,
      }));
    });
  };

  // Thêm 1 dòng biến thể mới
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: null,
        color: '',
        material: '',
        price: prev[0]?.price || '',
        stock_quantity: 10,
        length_cm: prev[0]?.length_cm || '',
        width_cm: prev[0]?.width_cm || '',
        height_cm: prev[0]?.height_cm || '',
        weight_kg: prev[0]?.weight_kg || '',
        sku: '',
        is_active: true,
      },
    ]);
  };

  // Cập nhật giá trị một trường của biến thể
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  // Xóa một dòng biến thể (bắt buộc giữ lại tối thiểu 1)
  const handleRemoveVariant = (indexToRemove) => {
    if (variants.length <= 1) {
      setServerError('Sản phẩm phải có tối thiểu một biến thể quy cách/màu sắc.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Kiểm tra tính hợp lệ dữ liệu trước khi gửi lên Server
  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Vui lòng nhập tên sản phẩm.';
    } else if (formData.name.trim().length > 200) {
      errs.name = 'Tên sản phẩm không được vượt quá 200 ký tự.';
    }

    if (!formData.category_id) {
      errs.category_id = 'Vui lòng chọn danh mục cho sản phẩm.';
    }

    if (variants.length === 0) {
      errs.variants = 'Sản phẩm phải có ít nhất một biến thể quy cách.';
    } else {
      // Validate từng biến thể
      variants.forEach((v, idx) => {
        if (!v.color || !v.color.trim()) {
          errs[`variant_${idx}_color`] = `Biến thể #${idx + 1} thiếu màu sắc.`;
        }
        if (!v.material || !v.material.trim()) {
          errs[`variant_${idx}_material`] = `Biến thể #${idx + 1} thiếu chất liệu.`;
        }
        if (v.price === '' || isNaN(v.price) || Number(v.price) < 0) {
          errs[`variant_${idx}_price`] = `Biến thể #${idx + 1} có giá không hợp lệ.`;
        }
        if (
          v.stock_quantity === '' ||
          isNaN(v.stock_quantity) ||
          Number(v.stock_quantity) < 0
        ) {
          errs[`variant_${idx}_stock`] = `Biến thể #${idx + 1} có tồn kho không hợp lệ.`;
        }
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Xử lý gửi Form (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setServerError('Vui lòng kiểm tra và hoàn thiện các trường dữ liệu bắt buộc.');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      // Định dạng mảng images theo chuẩn API
      const formattedImages = images.map((img, idx) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || formData.name,
        sort_order: idx,
      }));

      // Định dạng mảng variants
      const formattedVariants = variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        sku: v.sku?.trim() || undefined,
        color: v.color.trim(),
        material: v.material.trim(),
        price: parseFloat(v.price),
        stock_quantity: parseInt(v.stock_quantity, 10),
        length_cm: v.length_cm ? parseFloat(v.length_cm) : null,
        width_cm: v.width_cm ? parseFloat(v.width_cm) : null,
        height_cm: v.height_cm ? parseFloat(v.height_cm) : null,
        weight_kg: v.weight_kg ? parseFloat(v.weight_kg) : null,
        is_active: v.is_active !== false,
      }));

      const payload = {
        category_id: parseInt(formData.category_id, 10),
        name: formData.name.trim(),
        slug: formData.slug?.trim() ? slugify(formData.slug.trim()) : undefined,
        brand: formData.brand?.trim() || null,
        warranty_months: parseInt(formData.warranty_months, 10) || 12,
        description: formData.description?.trim() || null,
        is_active: Boolean(formData.is_active),
        images: formattedImages,
        variants: formattedVariants,
      };

      if (isEditing) {
        const res = await adminProductApi.update(product.id, payload);
        if (res.data?.status) {
          onSuccess(res.data.message || `Cập nhật sản phẩm "${payload.name}" thành công.`);
        }
      } else {
        const res = await adminProductApi.create(payload);
        if (res.data?.status) {
          onSuccess(res.data.message || `Tạo mới sản phẩm "${payload.name}" thành công.`);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      const data = err.response?.data;
      if (data?.errors) {
        const backendErrs = {};
        Object.keys(data.errors).forEach((key) => {
          backendErrs[key] = data.errors[key][0];
        });
        setErrors((prev) => ({ ...prev, ...backendErrs }));
      }
      const msg =
        data?.message ||
        'Không thể lưu thông tin sản phẩm. Vui lòng kiểm tra lại các trường dữ liệu!';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* ==========================================================
            HEADER MODAL
           ========================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#8C6A48] flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold block">
                ATELIER ADMIN PRODUCTS
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
                {isEditing ? `Chỉnh Sửa: ${product.name}` : 'Thêm Sản Phẩm Mới'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-stone-200/80 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==========================================================
            NAVIGATION TABS (3 KHỐI THEO CHUẨN MỤC 5)
           ========================================================== */}
        <div className="flex items-center space-x-2 px-6 border-b border-stone-200 bg-white shrink-0 overflow-x-auto">
          {[
            { id: 'general', label: '1. Thông tin chung', icon: Info },
            { id: 'gallery', label: `2. Bộ sưu tập ảnh (${images.length})`, icon: ImageIcon },
            { id: 'variants', label: `3. Biến thể & Quy cách (${variants.length})`, icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFormTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#8C6A48] text-[#8C6A48] bg-stone-50/50'
                    : 'border-transparent text-stone-500 hover:text-neutral-900 hover:border-stone-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* THÔNG BÁO LỖI SERVER HOẶC VALIDATION */}
        {serverError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {/* ==========================================================
            BODY FORM SCROLLABLE
           ========================================================== */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* ----------------------------------------------------
              KHỐI 1: THÔNG TIN CHUNG
             ---------------------------------------------------- */}
          {activeFormTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên sản phẩm */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-800 font-semibold flex items-center space-x-1">
                      <span>Tên sản phẩm</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10.5px] text-stone-400 font-mono">
                      {formData.name.length}/200
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    maxLength={200}
                    placeholder="Ví dụ: Bàn Ăn Gỗ Sồi Bắc Âu Florence..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-neutral-900 text-xs transition-all ${
                      errors.name
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-stone-200 bg-stone-50/50 focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/20'
                    } focus:outline-none`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{errors.name}</span>
                  )}
                </div>

                {/* Đường dẫn Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-800 font-semibold">
                      Đường dẫn URL (Slug)
                    </label>
                    <span className="text-[10.5px] text-stone-400 font-mono">(Tùy chọn)</span>
                  </div>
                  <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-[#8C6A48]">
                    <span className="px-2.5 py-2 text-stone-400 font-mono bg-stone-100/70 border-r border-stone-200 text-[11px]">
                      /san-pham/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      placeholder="ban-an-go-soi"
                      className="w-full px-3 py-2 font-mono text-neutral-900 bg-transparent text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Danh mục */}
                <div>
                  <label className="text-neutral-800 font-semibold block mb-1">
                    Danh mục phân loại <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, category_id: e.target.value }));
                      if (errors.category_id) {
                        setErrors((prev) => ({ ...prev, category_id: null }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-neutral-900 text-xs transition-all ${
                      errors.category_id
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-stone-200 bg-stone-50/50 focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/20'
                    } focus:outline-none cursor-pointer`}
                  >
                    <option value="">-- Chọn danh mục sản phẩm --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.category_id}
                    </span>
                  )}
                </div>

                {/* Thương hiệu */}
                <div>
                  <label className="text-neutral-800 font-semibold block mb-1">
                    Thương hiệu / Xưởng chế tác
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                    placeholder="Ví dụ: Nordic Living, Atelier TK..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-neutral-900 text-xs focus:border-[#8C6A48] focus:outline-none"
                  />
                </div>

                {/* Thời gian bảo hành */}
                <div>
                  <label className="text-neutral-800 font-semibold block mb-1">
                    Thời gian bảo hành (Tháng)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.warranty_months}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, warranty_months: e.target.value }))
                    }
                    placeholder="24"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-neutral-900 text-xs focus:border-[#8C6A48] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Mô tả sản phẩm */}
              <div>
                <label className="text-neutral-800 font-semibold block mb-1">
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Mô tả phong cách thiết kế Scandinavian, nguồn gốc gỗ nhập khẩu, công nghệ đệm mút cao cấp, chính sách vận chuyển..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-neutral-900 text-xs focus:border-[#8C6A48] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Switch Kích hoạt trạng thái hiển thị is_active */}
              <div className="p-4 bg-stone-50/90 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="product_is_active_toggle"
                    className="font-semibold text-neutral-900 text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    {formData.is_active ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-400" />
                    )}
                    <span>Kích hoạt hiển thị sản phẩm trên website</span>
                  </label>
                  <p className="text-[11px] text-stone-500 font-light">
                    {formData.is_active
                      ? 'Sản phẩm sẽ được hiển thị trên danh mục bán lẻ và khách hàng có thể đặt mua.'
                      : 'Sản phẩm sẽ bị tạm ẩn khỏi cửa hàng trực tuyến.'}
                  </p>
                </div>

                <button
                  type="button"
                  id="product_is_active_toggle"
                  role="switch"
                  aria-checked={formData.is_active}
                  onClick={() =>
                    setFormData((p) => ({ ...p, is_active: !p.is_active }))
                  }
                  className={`w-11 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    formData.is_active ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              KHỐI 2: BỘ SƯU TẬP HÌNH ẢNH (GALLERY)
             ---------------------------------------------------- */}
          {activeFormTab === 'gallery' && (
            <div className="space-y-5">
              {/* Vùng Upload Kéo Thả & Chọn File từ máy tính */}
              <div className="p-6 border-2 border-dashed border-[#8C6A48]/30 hover:border-[#8C6A48] rounded-3xl bg-[#FAF8F5]/60 text-center transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                  className="hidden"
                  id="product_images_upload"
                />

                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 text-[#8C6A48] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#8C6A48]" />
                  ) : (
                    <Upload className="w-6 h-6 stroke-[1.8]" />
                  )}
                </div>

                <h3 className="font-serif font-bold text-sm text-neutral-900 mb-1">
                  {uploadingImage ? 'Đang tải hình ảnh lên máy chủ...' : 'Tải lên hình ảnh từ máy tính'}
                </h3>
                <p className="text-[11px] text-stone-500 mb-3 font-light">
                  Hỗ trợ định dạng JPG, PNG, WEBP, dung lượng tối đa 5MB mỗi tệp.
                </p>

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Chọn tệp ảnh
                </button>
              </div>

              {/* Nhập trực tiếp đường link URL ảnh */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={directImageUrl}
                    onChange={(e) => setDirectImageUrl(e.target.value)}
                    placeholder="Hoặc dán trực tiếp đường link URL ảnh (https://...)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:border-[#8C6A48] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Thêm URL
                </button>
              </div>

              {/* Danh sách ảnh đã có */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-800 text-xs">
                    Hình ảnh đã chọn ({images.length} ảnh):
                  </span>
                  <span className="text-[10.5px] text-stone-400 italic">
                    * Ảnh đầu tiên có ngôi sao vàng sẽ làm ảnh đại diện chính (Thumbnail)
                  </span>
                </div>

                {images.length === 0 ? (
                  <div className="py-10 border border-stone-200 rounded-2xl bg-stone-50/50 text-center text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>Chưa có hình ảnh nào được thêm.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img, index) => {
                      const isPrimary = index === 0;
                      return (
                        <div
                          key={index}
                          className={`group relative rounded-2xl border overflow-hidden aspect-square bg-stone-100 shadow-2xs transition-all ${
                            isPrimary
                              ? 'border-[#8C6A48] ring-2 ring-[#8C6A48]/30'
                              : 'border-stone-200'
                          }`}
                        >
                          <img
                            src={getSafeImageUrl(img.full_url || img.image_url)}
                            alt={img.alt_text || `Ảnh ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder.jpg';
                            }}
                          />

                          {/* Badge ảnh đại diện chính */}
                          {isPrimary && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#8C6A48] text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Ảnh chính</span>
                            </div>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(index)}
                                title="Đặt làm ảnh đại diện chính"
                                className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-stone-800 transition-colors shadow-sm cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              title="Xóa ảnh này"
                              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              KHỐI 3: DANH SÁCH BIẾN THỂ (VARIANTS TABLE DYNAMIC)
             ---------------------------------------------------- */}
          {activeFormTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900">
                    Bảng Biến Thể Sản Phẩm
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light">
                    Mỗi sản phẩm nội thất có thể có nhiều màu sắc, chất liệu và kích thước khác nhau.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm biến thể mới</span>
                </button>
              </div>

              {/* Bảng động các biến thể */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10.5px] font-mono text-stone-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Màu sắc *</th>
                      <th className="py-2.5 px-3 font-semibold">Chất liệu *</th>
                      <th className="py-2.5 px-3 font-semibold">Giá bán (VND) *</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Tồn kho *</th>
                      <th className="py-2.5 px-3 font-semibold">D x R x C (cm)</th>
                      <th className="py-2.5 px-3 font-semibold">Nặng (kg)</th>
                      <th className="py-2.5 px-3 font-semibold">Mã SKU</th>
                      <th className="py-2.5 px-2 text-center font-semibold">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-2 px-3 font-mono text-stone-400 font-bold text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Màu sắc */}
                        <td className="py-2 px-2 min-w-[120px]">
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                            placeholder="Nâu da bò, Xám..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:border-[#8C6A48] focus:outline-none"
                          />
                        </td>

                        {/* Chất liệu */}
                        <td className="py-2 px-2 min-w-[130px]">
                          <input
                            type="text"
                            value={v.material}
                            onChange={(e) => handleVariantChange(idx, 'material', e.target.value)}
                            placeholder="Gỗ sồi, Da bò..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:border-[#8C6A48] focus:outline-none"
                          />
                        </td>

                        {/* Giá bán */}
                        <td className="py-2 px-2 min-w-[120px]">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            placeholder="8500000"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-mono font-bold text-[#8C6A48] focus:border-[#8C6A48] focus:outline-none"
                          />
                        </td>

                        {/* Tồn kho */}
                        <td className="py-2 px-2 min-w-[80px]">
                          <input
                            type="number"
                            min="0"
                            value={v.stock_quantity}
                            onChange={(e) =>
                              handleVariantChange(idx, 'stock_quantity', e.target.value)
                            }
                            placeholder="10"
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-mono text-center focus:border-[#8C6A48] focus:outline-none"
                          />
                        </td>

                        {/* Kích thước D x R x C */}
                        <td className="py-2 px-2 min-w-[130px]">
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              value={v.length_cm}
                              onChange={(e) => handleVariantChange(idx, 'length_cm', e.target.value)}
                              placeholder="D"
                              title="Chiều dài (cm)"
                              className="w-10 px-1.5 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono text-center focus:outline-none"
                            />
                            <span className="text-stone-300">×</span>
                            <input
                              type="number"
                              min="0"
                              value={v.width_cm}
                              onChange={(e) => handleVariantChange(idx, 'width_cm', e.target.value)}
                              placeholder="R"
                              title="Chiều rộng (cm)"
                              className="w-10 px-1.5 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono text-center focus:outline-none"
                            />
                            <span className="text-stone-300">×</span>
                            <input
                              type="number"
                              min="0"
                              value={v.height_cm}
                              onChange={(e) => handleVariantChange(idx, 'height_cm', e.target.value)}
                              placeholder="C"
                              title="Chiều cao (cm)"
                              className="w-10 px-1.5 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono text-center focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Khối lượng (kg) */}
                        <td className="py-2 px-2 min-w-[70px]">
                          <input
                            type="number"
                            min="0"
                            value={v.weight_kg}
                            onChange={(e) => handleVariantChange(idx, 'weight_kg', e.target.value)}
                            placeholder="Kg"
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-mono text-center focus:outline-none"
                          />
                        </td>

                        {/* SKU */}
                        <td className="py-2 px-2 min-w-[120px]">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                            placeholder="Tự sinh nếu trống"
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono focus:outline-none placeholder:text-stone-300"
                          />
                        </td>

                        {/* Nút xóa */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            disabled={variants.length <= 1}
                            onClick={() => handleRemoveVariant(idx)}
                            title={
                              variants.length <= 1
                                ? 'Bắt buộc giữ lại tối thiểu 1 biến thể'
                                : 'Xóa biến thể này'
                            }
                            className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>

        {/* ==========================================================
            FOOTER ACTIONS
           ========================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50/90 shrink-0">
          <div className="text-[11px] text-stone-500 font-light hidden sm:block">
            {isEditing
              ? 'Mọi thay đổi sẽ được cập nhật đồng bộ vào kho dữ liệu sản phẩm.'
              : 'Sản phẩm mới sẽ sẵn sàng cho việc phân phối bán lẻ ngay khi lưu.'}
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 text-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu sản phẩm...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm Mới'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
