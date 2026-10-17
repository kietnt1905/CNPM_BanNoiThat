import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  X,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Filter,
  ShieldAlert,
  Info,
  DollarSign,
  Tag,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminProductApi from '../../api/adminProductApi';
import adminCategoryApi from '../../api/adminCategoryApi';
import ProductFormModal, { getSafeImageUrl } from '../../components/admin/ProductFormModal';

// ==========================================
// TOAST NOTIFICATION COMPONENT
// ==========================================
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium backdrop-blur-md max-w-md ${isSuccess
          ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50'
          : 'bg-rose-950/90 text-rose-100 border-rose-700/50'
        }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span className="leading-relaxed flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2 cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    low_stock: 0,
    out_of_stock: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // 1. Quick Tabs: 'all' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock'
  const [activeTab, setActiveTab] = useState('all');

  // 2. Toolbar State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all | in_stock | low_stock | out_of_stock
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Danh sách danh mục để đổ vào Dropdown lọc
  const [categories, setCategories] = useState([]);

  // 3. Modals & Action State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Xem chi tiết biến thể và cập nhật nhanh tồn kho
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [quickStockUpdatingId, setQuickStockUpdatingId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Nạp danh mục cho dropdown lọc
  useEffect(() => {
    adminCategoryApi
      .getAllNoPagination()
      .then((res) => {
        if (res.data?.status && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Lỗi nạp danh mục:', err));
  }, []);

  // Debounce tìm kiếm từ khóa 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Nạp danh sách sản phẩm từ API
  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        page: currentPage,
        per_page: 15,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Param tìm kiếm theo tên, thương hiệu, sku
      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }

      // Param danh mục
      if (categoryFilter && categoryFilter !== 'all') {
        params.category_id = categoryFilter;
      }

      // Xử lý logic lọc giữa Tabs và Dropdown Tồn kho
      if (activeTab === 'active') {
        params.is_active = '1';
      } else if (activeTab === 'inactive') {
        params.is_active = '0';
      } else if (activeTab === 'low_stock') {
        params.stock_status = 'low_stock';
      } else if (activeTab === 'out_of_stock') {
        params.stock_status = 'out_of_stock';
      }

      // Nếu người dùng chọn riêng dropdown tồn kho ở toolbar
      if (stockFilter && stockFilter !== 'all' && activeTab === 'all') {
        params.stock_status = stockFilter;
      }

      const res = await adminProductApi.getAll(params);
      if (res.data?.status) {
        setProducts(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp sản phẩm:', err);
      showToast(
        err.response?.data?.message || 'Không thể tải danh sách sản phẩm.',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeTab, debouncedSearch, categoryFilter, stockFilter, sortBy, sortOrder]);

  // Bật / Tắt trạng thái is_active trực tiếp trên bảng
  const handleToggleStatus = async (item) => {
    const nextStatus = !item.is_active;
    try {
      setUpdatingStatusId(item.id);
      const res = await adminProductApi.updateStatus(item.id, nextStatus);

      if (res.data?.status) {
        if (nextStatus) {
          showToast(`Đã kích hoạt hiển thị sản phẩm "${item.name}".`);
        } else {
          showToast(`Đã tạm ẩn sản phẩm "${item.name}" khỏi cửa hàng bán lẻ.`);
        }

        // Cập nhật state sản phẩm tại chỗ
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                ...p,
                is_active: nextStatus,
                status_label: nextStatus ? 'Đang hiển thị' : 'Đang ẩn',
              }
              : p
          )
        );

        // Cập nhật lại counts
        setCounts((prev) => ({
          ...prev,
          active: nextStatus ? prev.active + 1 : Math.max(0, prev.active - 1),
          inactive: nextStatus ? Math.max(0, prev.inactive - 1) : prev.inactive + 1,
        }));
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Lỗi khi cập nhật trạng thái sản phẩm.',
        'error'
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Mở modal xem chi tiết sản phẩm và các biến thể
  const handleOpenDetail = async (prod) => {
    setDetailLoading(true);
    try {
      const res = await adminProductApi.getById(prod.id);
      if (res.data?.status) {
        setDetailProduct(res.data.data);
        // Khởi tạo giá trị tồn kho tạm thời để cho phép chỉnh sửa nhanh
        const initStock = {};
        if (Array.isArray(res.data.data.variants)) {
          res.data.data.variants.forEach((v) => {
            initStock[v.id] = v.stock_quantity;
          });
        }
        setTempStockValue(initStock);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Không thể tải chi tiết sản phẩm.',
        'error'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Cập nhật nhanh số lượng tồn kho biến thể
  const handleQuickUpdateStock = async (productId, variantId) => {
    const newQty = parseInt(tempStockValue[variantId], 10);
    if (isNaN(newQty) || newQty < 0) {
      showToast('Số lượng tồn kho phải là số nguyên không âm.', 'error');
      return;
    }

    setQuickStockUpdatingId(variantId);
    try {
      const res = await adminProductApi.updateVariantStock(productId, variantId, newQty);
      if (res.data?.status) {
        showToast(res.data.message || 'Cập nhật tồn kho biến thể thành công!');
        // Cập nhật lại trong detail modal
        setDetailProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            variants: prev.variants.map((v) =>
              v.id === variantId ? { ...v, stock_quantity: newQty } : v
            ),
          };
        });
        // Tải lại danh sách ngoài bảng
        fetchProducts();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Không thể cập nhật tồn kho biến thể.',
        'error'
      );
    } finally {
      setQuickStockUpdatingId(null);
    }
  };

  // Xóa sản phẩm - Bắt mã lỗi 400 nếu sản phẩm đã có đơn hàng
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;

    setDeleteLoading(true);
    try {
      const res = await adminProductApi.delete(deleteConfirmProduct.id);
      if (res.data?.status) {
        showToast(
          res.data.message || `Xóa sản phẩm "${deleteConfirmProduct.name}" thành công!`
        );
        setDeleteConfirmProduct(null);
        fetchProducts();
      }
    } catch (err) {
      // Bắt chính xác lỗi 400 Bad Request từ Backend
      const errMsg =
        err.response?.data?.message ||
        `Không thể xóa sản phẩm "${deleteConfirmProduct.name}". Vui lòng kiểm tra lại đơn hàng.`;
      showToast(errMsg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper render badge tồn kho
  const renderStockBadge = (item) => {
    const stock = item.total_stock ?? 0;
    if (stock === 0 || item.stock_status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Hết hàng (0)</span>
        </span>
      );
    }
    if (stock <= 5 || item.stock_status === 'low_stock') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Sắp hết ({stock})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" />
        <span>Còn hàng ({stock})</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ==========================================================
          1. HEADER TRANG & NÚT THÊM SẢN PHẨM MỚI
         ========================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-semibold mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>KHO DỮ LIỆU SẢN PHẨM & QUẢN TRỊ TỒN KHO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Theo dõi danh mục đồ nội thất, bộ sưu tập hình ảnh, quy cách biến thể và tình trạng xuất nhập kho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setProductModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* ==========================================================
          2. TABS BỘ ĐẾM NHANH (QUICK COUNTS TABS)
         ========================================================== */}
      <div className="flex items-center space-x-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'all', label: 'Tất cả', count: counts.total },
          { id: 'active', label: 'Đang hiển thị', count: counts.active, isGreen: true },
          { id: 'inactive', label: 'Đang ẩn', count: counts.inactive, isGray: true },
          { id: 'low_stock', label: 'Sắp hết hàng', count: counts.low_stock, isOrange: true },
          { id: 'out_of_stock', label: 'Hết hàng', count: counts.out_of_stock, isRed: true },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${isActive
                  ? 'border-[#8C6A48] text-[#8C6A48] font-semibold bg-stone-50/50'
                  : 'border-transparent text-stone-500 hover:text-neutral-900 hover:border-stone-300'
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold transition-colors ${isActive
                    ? 'bg-[#8C6A48] text-white'
                    : tab.isGreen
                      ? 'bg-emerald-100 text-emerald-800'
                      : tab.isOrange
                        ? 'bg-amber-100 text-amber-800'
                        : tab.isRed
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-600'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==========================================================
          3. THANH TOOLBAR: TÌM KIẾM, LỌC DANH MỤC & TỒN KHO, SẮP XẾP
         ========================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Ô tìm kiếm từ khóa (tên, thương hiệu, sku) */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, thương hiệu, SKU..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all text-neutral-800 placeholder:text-stone-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Lọc theo Danh mục */}
        <div className="flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 transition-all cursor-pointer font-medium"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Lọc theo Tồn kho */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 transition-all cursor-pointer font-medium"
          >
            <option value="all">Tất cả tình trạng kho</option>
            <option value="in_stock">Còn hàng (&gt; 5)</option>
            <option value="low_stock">Sắp hết hàng (1 - 5)</option>
            <option value="out_of_stock">Hết hàng (0)</option>
          </select>
        </div>

        {/* Dropdown Sắp xếp & Nút Làm mới */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 flex-1">
            <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'created_at_desc') {
                  setSortBy('created_at');
                  setSortOrder('desc');
                } else if (val === 'name_asc') {
                  setSortBy('name');
                  setSortOrder('asc');
                } else if (val === 'name_desc') {
                  setSortBy('name');
                  setSortOrder('desc');
                } else if (val === 'id_desc') {
                  setSortBy('id');
                  setSortOrder('desc');
                }
              }}
              className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 transition-all cursor-pointer font-medium"
            >
              <option value="created_at_desc">Mới nhất</option>
              <option value="name_asc">Tên (A → Z)</option>
              <option value="name_desc">Tên (Z → A)</option>
              <option value="id_desc">ID giảm dần</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={loading || refreshing}
            title="Làm mới danh sách"
            className="p-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#8C6A48]' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* ==========================================================
          4. BẢNG DANH SÁCH SẢN PHẨM (PRODUCTS TABLE)
         ========================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                <th className="py-3.5 px-4 font-semibold">Ảnh & Tên Sản Phẩm</th>
                <th className="py-3.5 px-4 font-semibold">Khoảng Giá</th>
                <th className="py-3.5 px-4 font-semibold text-center">Tồn Kho & Biến Thể</th>
                <th className="py-3.5 px-4 font-semibold text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold">Ngày Tạo</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8C6A48] mb-3" />
                    <span>Đang nạp dữ liệu sản phẩm...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Không tìm thấy sản phẩm nào phù hợp
                      </p>
                      <p className="text-xs text-stone-500">
                        Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/60 transition-colors"
                    >
                      {/* Ảnh & Tên Sản Phẩm */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={getSafeImageUrl(item.thumbnail)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.jpg';
                              }}
                            />
                            {item.images_count > 1 && (
                              <span className="absolute bottom-0 right-0 bg-neutral-900/80 text-white font-mono text-[9px] px-1 rounded-tl-md">
                                +{item.images_count - 1}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <span className="font-bold text-neutral-900 block truncate text-xs">
                              {item.name}
                            </span>
                            <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-stone-500 font-light truncate">
                              <span className="text-[#8C6A48] font-medium">
                                {item.category?.name || 'Chưa phân loại'}
                              </span>
                              <span>•</span>
                              <span>{item.brand || 'Thương hiệu xưởng'}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-stone-400">
                                slug: {item.slug}
                              </span>
                              <a
                                href={`/san-pham/${item.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Xem sản phẩm trên website"
                                className="text-stone-400 hover:text-[#8C6A48] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Giá: price_display */}
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 text-xs whitespace-nowrap">
                        {item.price_display || 'Liên hệ'}
                      </td>

                      {/* Tồn kho & Biến thể */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center space-y-1">
                          {renderStockBadge(item)}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="text-[10.5px] text-stone-500 hover:text-[#8C6A48] transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <span>{item.variants_count} biến thể quy cách</span>
                            <Info className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Trạng thái: Switch toggle is_active */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.is_active}
                            disabled={updatingStatusId === item.id}
                            onClick={() => handleToggleStatus(item)}
                            title={
                              item.is_active
                                ? 'Bấm để ẩn sản phẩm'
                                : 'Bấm để kích hoạt hiển thị'
                            }
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${item.is_active ? 'bg-emerald-500' : 'bg-stone-300'
                              }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-0'
                                } flex items-center justify-center`}
                            >
                              {updatingStatusId === item.id && (
                                <Loader2 className="w-2.5 h-2.5 animate-spin text-stone-600" />
                              )}
                            </div>
                          </button>
                          <span
                            className={`text-[10.5px] font-medium hidden sm:inline-block ${item.is_active ? 'text-emerald-700' : 'text-stone-500'
                              }`}
                          >
                            {item.is_active ? 'Đang hiện' : 'Đang ẩn'}
                          </span>
                        </div>
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {item.created_at_display || item.created_at || '—'}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Nút Xem chi tiết / Quản lý kho nhanh */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            title="Xem chi tiết & tồn kho biến thể"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Sửa */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await adminProductApi.getById(item.id);
                                if (res.data?.status) {
                                  setEditingProduct(res.data.data);
                                  setProductModalOpen(true);
                                }
                              } catch {
                                setEditingProduct(item);
                                setProductModalOpen(true);
                              }
                            }}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-[#8C6A48] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa (thùng rác đỏ) */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProduct(item)}
                            title="Xóa sản phẩm"
                            className="p-1.5 hover:bg-rose-50 text-stone-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-stone-500 font-mono">
              Hiển thị trang <strong>{pagination.current_page}</strong> /{' '}
              {pagination.last_page} (Tổng số {pagination.total} sản phẩm)
            </span>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Trước
              </button>

              {Array.from({ length: pagination.last_page }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === pagination.current_page;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.last_page ||
                  Math.abs(pageNum - pagination.current_page) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${isCurrent
                          ? 'bg-[#2C241E] text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              <button
                type="button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
                }
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          MODAL: THÊM / CHỈNH SỬA SẢN PHẨM (ProductFormModal)
         ========================================================== */}
      <ProductFormModal
        isOpen={productModalOpen}
        product={editingProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          setProductModalOpen(false);
          setEditingProduct(null);
          fetchProducts();
        }}
      />

      {/* ==========================================================
          MODAL: CHI TIẾT SẢN PHẨM & CẬP NHẬT TỒN KHO BIẾN THỂ
         ========================================================== */}
      <AnimatePresence>
        {detailProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 shadow-2xl border border-stone-200 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-stone-200 overflow-hidden shrink-0">
                    <img
                      src={getSafeImageUrl(detailProduct.images?.[0]?.image_url || detailProduct.thumbnail)}
                      alt={detailProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-neutral-900 leading-tight">
                      {detailProduct.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-mono">
                      {detailProduct.category?.name} • Bảo hành {detailProduct.warranty_months} tháng
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thông tin thống kê */}
              <div className="grid grid-cols-3 gap-2.5 mb-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10.5px] block">Tổng Tồn Kho</span>
                  <span className="font-bold text-base font-mono text-neutral-900">
                    {detailProduct.stats?.total_stock ?? detailProduct.total_stock ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10.5px] block">Đã Bán Ra</span>
                  <span className="font-bold text-base font-mono text-emerald-700">
                    {detailProduct.stats?.sold_count ?? 0} món
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10.5px] block">Số Quy Cách</span>
                  <span className="font-bold text-base font-mono text-[#8C6A48]">
                    {detailProduct.variants?.length || 0} biến thể
                  </span>
                </div>
              </div>

              {/* Danh sách biến thể & Điều chỉnh tồn kho nhanh */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 text-xs">
                    Chi tiết các biến thể & Tồn kho thực tế:
                  </span>
                  <span className="text-[10px] text-stone-400 italic">
                    (Có thể chỉnh số và bấm lưu để cập nhật ngay)
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {detailProduct.variants && detailProduct.variants.length > 0 ? (
                    detailProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-neutral-900">{v.color}</span>
                            <span className="text-stone-400">•</span>
                            <span className="text-stone-600">{v.material}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-stone-400 font-mono">
                            <span>SKU: {v.sku}</span>
                            <span>•</span>
                            <span className="text-[#8C6A48] font-bold">
                              {v.price_display || `${Number(v.price).toLocaleString('vi-VN')}₫`}
                            </span>
                            {v.dimensions_display && (
                              <>
                                <span>•</span>
                                <span>{v.dimensions_display}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Ô chỉnh nhanh tồn kho */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-[10.5px] text-stone-400">Kho:</span>
                          <input
                            type="number"
                            min="0"
                            value={tempStockValue[v.id] ?? v.stock_quantity}
                            onChange={(e) =>
                              setTempStockValue((p) => ({ ...p, [v.id]: e.target.value }))
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold text-neutral-900 bg-white border border-stone-200 rounded-lg text-xs focus:border-[#8C6A48] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={quickStockUpdatingId === v.id}
                            onClick={() => handleQuickUpdateStock(detailProduct.id, v.id)}
                            className="px-2.5 py-1 bg-[#2C241E] hover:bg-[#8C6A48] text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {quickStockUpdatingId === v.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Lưu'
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      Chưa có biến thể nào.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================================
          MODAL: XÁC NHẬN XÓA (SAFEGUARD KHI CÓ ĐƠN HÀNG)
         ========================================================== */}
      <AnimatePresence>
        {deleteConfirmProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
              </div>

              <h2 className="text-center font-serif text-lg font-bold text-neutral-900 mb-2">
                Xác Nhận Xóa Sản Phẩm
              </h2>

              <p className="text-center text-xs text-stone-500 mb-4 leading-relaxed font-light">
                Bạn có chắc chắn muốn xóa sản phẩm{' '}
                <strong className="text-neutral-900">"{deleteConfirmProduct.name}"</strong>?
              </p>

              {/* Khối Cảnh báo Safeguard */}
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-amber-800">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Ràng buộc an toàn dữ liệu lịch sử đơn hàng:</span>
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed font-light">
                  Nếu sản phẩm này đã từng phát sinh trong bất kỳ đơn hàng nào của khách hàng, Backend sẽ tự động từ chối xóa (mã lỗi 400 Bad Request) để bảo toàn lịch sử kế toán và hóa đơn.
                </p>
                <p className="text-[11px] text-amber-700 italic">
                  Gợi ý: Quý khách có thể chọn <strong>"Chuyển sang Ẩn sản phẩm"</strong> để ngừng bán mà không ảnh hưởng đến đơn hàng cũ.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = deleteConfirmProduct;
                    setDeleteConfirmProduct(null);
                    if (target.is_active) {
                      handleToggleStatus(target);
                    } else {
                      showToast(`Sản phẩm "${target.name}" đã ở trạng thái Ẩn sẵn.`);
                    }
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ẩn Sản Phẩm Ngay</span>
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => handleDeleteProduct()}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác Nhận Xóa</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
