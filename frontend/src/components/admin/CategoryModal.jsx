import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  Sparkles,
  AlertTriangle,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import adminCategoryApi from '../../api/adminCategoryApi';

/**
 * Hàm chuyển đổi chuỗi tiếng Việt có dấu thành URL slug chuẩn SEO
 */
export function slugify(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(category);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Nạp dữ liệu khi mở modal hoặc đổi category
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        is_active: category.is_active !== false,
      });
      setIsSlugManuallyEdited(true);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        is_active: true,
      });
      setIsSlugManuallyEdited(false);
    }
    setErrors({});
    setServerError('');
  }, [category, isOpen]);

  // Xử lý thay đổi Tên danh mục (UX Tự động: nếu ô slug trống hoặc chưa sửa thủ công thì tự sinh slug)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, name: val };
      if (!isSlugManuallyEdited || !prev.slug.trim()) {
        next.slug = slugify(val);
      }
      return next;
    });

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  // Xử lý khi người dùng chỉnh sửa trực tiếp ô Slug
  const handleSlugChange = (e) => {
    const val = e.target.value;
    setIsSlugManuallyEdited(Boolean(val.trim()));
    setFormData((prev) => ({ ...prev, slug: val }));

    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: null }));
    }
  };

  // Nút sinh lại slug tự động từ tên
  const handleRegenerateSlug = () => {
    const autoSlug = slugify(formData.name);
    setFormData((prev) => ({ ...prev, slug: autoSlug }));
    setIsSlugManuallyEdited(false);
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Vui lòng nhập tên danh mục.';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Tên danh mục không được vượt quá 100 ký tự.';
    }

    const cleanSlug = formData.slug.trim();
    if (cleanSlug) {
      if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
        errs.slug = 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối (-).';
      } else if (cleanSlug.length > 191) {
        errs.slug = 'Slug không được vượt quá 191 ký tự.';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Mô tả không được vượt quá 1000 ký tự.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() ? slugify(formData.slug.trim()) : undefined,
        description: formData.description.trim() || null,
        is_active: Boolean(formData.is_active),
      };

      if (isEditing) {
        const res = await adminCategoryApi.update(category.id, payload);
        if (res.data?.status) {
          onSuccess(res.data.message || `Cập nhật danh mục "${payload.name}" thành công.`);
        }
      } else {
        const res = await adminCategoryApi.create(payload);
        if (res.data?.status) {
          onSuccess(res.data.message || `Tạo danh mục "${payload.name}" thành công.`);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err);
      const data = err.response?.data;
      if (data?.errors) {
        // Map backend validation errors
        const backendErrors = {};
        Object.keys(data.errors).forEach((key) => {
          backendErrors[key] = data.errors[key][0];
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      const msg = data?.message || 'Không thể lưu danh mục. Vui lòng kiểm tra lại thông tin!';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#8C6A48] flex items-center justify-center shadow-2xs">
              <Layers className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A48] font-bold block">
                ATELIER ADMIN CATEGORIES
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 mt-0.5">
                {isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lỗi từ Server */}
        {serverError && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Tên danh mục (name) - Bắt buộc */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-800 font-semibold flex items-center space-x-1">
                <span>Tên danh mục</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10.5px] text-stone-400 font-mono">
                {formData.name.length}/100
              </span>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              maxLength={100}
              placeholder="Ví dụ: Ghế Sofa, Bàn Ăn Gỗ..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-neutral-900 transition-all text-xs ${
                errors.name
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200'
                  : 'border-stone-200 bg-stone-50/50 focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/20'
              } focus:outline-none`}
            />
            {errors.name && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          {/* 2. Đường dẫn URL (slug) - Tùy chọn */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-800 font-semibold flex items-center space-x-1">
                <span>Đường dẫn URL (Slug)</span>
                <span className="text-stone-400 font-normal text-[11px]">(Tùy chọn)</span>
              </label>

              <button
                type="button"
                onClick={handleRegenerateSlug}
                title="Tự động đồng bộ slug theo tên danh mục"
                className="inline-flex items-center space-x-1 text-[11px] text-[#8C6A48] hover:text-[#6D4E31] font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Tự động sinh slug</span>
              </button>
            </div>

            <div className="relative flex items-center rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden focus-within:border-[#8C6A48] focus-within:ring-2 focus-within:ring-[#8C6A48]/20 transition-all">
              <span className="pl-3 pr-1 text-stone-400 text-xs font-mono select-none shrink-0 bg-stone-100/70 py-2.5 border-r border-stone-200">
                danh-muc/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="ban-an-go (bỏ trống để tự tạo)"
                className="w-full px-3 py-2.5 bg-transparent font-mono text-neutral-900 text-xs focus:outline-none placeholder:text-stone-400"
              />
            </div>
            {errors.slug ? (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.slug}
              </span>
            ) : (
              <p className="text-[10.5px] text-stone-400 mt-1 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-stone-400 shrink-0" />
                <span>
                  Đường dẫn hiển thị: <code className="text-neutral-700 font-semibold">/danh-muc/{formData.slug || '[tu-dong-sinh]'}</code>
                </span>
              </p>
            )}
          </div>

          {/* 3. Mô tả danh mục (description) - Tùy chọn */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-800 font-semibold">
                Mô tả danh mục <span className="text-stone-400 font-normal text-[11px]">(Tùy chọn)</span>
              </label>
              <span className="text-[10.5px] text-stone-400 font-mono">
                {formData.description.length}/1000
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              maxLength={1000}
              placeholder="Mô tả phong cách thiết kế, công năng và các sản phẩm tiêu biểu trong danh mục..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-neutral-900 transition-all text-xs resize-none ${
                errors.description
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-stone-200 bg-stone-50/50 focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/20'
              } focus:outline-none`}
            />
            {errors.description && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.description}
              </span>
            )}
          </div>

          {/* 4. Trạng thái hiển thị (is_active) - Switch Toggle / Checkbox */}
          <div className="pt-2">
            <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label
                  htmlFor="category_is_active"
                  className="font-semibold text-neutral-800 text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  {formData.is_active ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <span>Hiển thị danh mục này trên thanh menu website</span>
                </label>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                  {formData.is_active
                    ? 'Danh mục sẽ xuất hiện trên menu điều hướng và khách hàng có thể xem các sản phẩm.'
                    : 'Danh mục sẽ bị ẩn trên menu của khách hàng (các sản phẩm vẫn an toàn trong CSDL).'}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                id="category_is_active"
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

          {/* Buttons Footer */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors cursor-pointer text-xs"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 text-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu dữ liệu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
