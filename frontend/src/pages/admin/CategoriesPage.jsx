import React, { useState, useEffect } from 'react';
import {
  Layers,
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
  Package,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminCategoryApi from '../../api/adminCategoryApi';
import CategoryModal from '../../components/admin/CategoryModal';
import cacheHelper from '../../utils/cache';

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
      className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium backdrop-blur-md max-w-md ${
        isSuccess
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // 1. Tabs bộ đếm nhanh: 'all' | '1' | '0'
  const [activeTab, setActiveTab] = useState('all');

  // 2. Toolbar state: search có debounce 300ms & sort
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState('created_at_desc'); // created_at_desc | name_asc | products_count_desc | name_desc | created_at_asc
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Modals & Actions state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Xem chi tiết danh mục kèm sản phẩm
  const [detailCategory, setDetailCategory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Debounce tìm kiếm từ khóa 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Nạp danh sách danh mục từ API
  const fetchCategories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Map sortKey sang sort_by và sort_order
      let sort_by = 'created_at';
      let sort_order = 'desc';

      if (sortKey === 'name_asc') {
        sort_by = 'name';
        sort_order = 'asc';
      } else if (sortKey === 'name_desc') {
        sort_by = 'name';
        sort_order = 'desc';
      } else if (sortKey === 'products_count_desc') {
        sort_by = 'products_count';
        sort_order = 'desc';
      } else if (sortKey === 'created_at_asc') {
        sort_by = 'created_at';
        sort_order = 'asc';
      }

      const params = {
        page: currentPage,
        per_page: 15,
        sort_by,
        sort_order,
      };

      // Param tìm kiếm theo tên hoặc slug
      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }

      // Param lọc trạng thái is_active
      if (activeTab !== 'all') {
        params.is_active = activeTab; // '1' hoặc '0'
      }

      const res = await adminCategoryApi.getAll(params);
      if (res.data?.status) {
        setCategories(res.data.data || []);
        if (res.data.counts) {
          setCounts({
            total: res.data.counts.total ?? 0,
            active: res.data.counts.active ?? 0,
            inactive: res.data.counts.inactive ?? res.data.counts.hidden ?? 0,
          });
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi khi nạp danh mục:', err);
      showToast(
        err.response?.data?.message || 'Không thể tải danh sách danh mục sản phẩm.',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, activeTab, debouncedSearch, sortKey]);

  // Bật / Tắt trạng thái is_active trực tiếp trên bảng
  const handleToggleStatus = async (cat) => {
    const nextStatus = !cat.is_active;
    try {
      setUpdatingStatusId(cat.id);
      const res = await adminCategoryApi.updateStatus(cat.id, nextStatus);

      if (res.data?.status) {
        // Thông báo Toast thành công theo quy tắc UX
        if (nextStatus) {
          showToast(`Đã hiển thị danh mục "${cat.name}" trên thanh menu website.`);
        } else {
          showToast(
            `Danh mục "${cat.name}" sẽ không hiển thị trên thanh điều hướng của khách hàng.`
          );
        }

        // Cập nhật state danh mục tại chỗ
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id ? { ...c, is_active: nextStatus, status_label: nextStatus ? 'Đang hiển thị' : 'Đang ẩn' } : c
          )
        );

        // Xóa cache danh mục và bắn event đồng bộ toàn app (Header, CategoryPage, ...)
        cacheHelper.remove('categories');
        window.dispatchEvent(new Event('categories-updated'));
        try {
          localStorage.setItem('tk_categories_updated_at', Date.now().toString());
        } catch {}

        // Cập nhật bộ đếm counts
        setCounts((prev) => ({
          ...prev,
          active: nextStatus ? prev.active + 1 : Math.max(0, prev.active - 1),
          inactive: nextStatus ? Math.max(0, prev.inactive - 1) : prev.inactive + 1,
        }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi khi cập nhật trạng thái danh mục.';
      showToast(errMsg, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Xem chi tiết danh mục kèm 5 sản phẩm gần nhất
  const handleViewDetail = async (cat) => {
    setDetailLoading(true);
    try {
      const res = await adminCategoryApi.getById(cat.id);
      if (res.data?.status) {
        setDetailCategory(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể lấy thông tin chi tiết.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // Xóa danh mục - Safeguard bắt lỗi 400 nếu có sản phẩm
  const handleDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;

    setDeleteLoading(true);
    try {
      const res = await adminCategoryApi.delete(deleteConfirmCategory.id);
      if (res.data?.status) {
        showToast(res.data.message || `Xóa danh mục "${deleteConfirmCategory.name}" thành công!`);
        setDeleteConfirmCategory(null);
        cacheHelper.remove('categories');
        window.dispatchEvent(new Event('categories-updated'));
        try {
          localStorage.setItem('tk_categories_updated_at', Date.now().toString());
        } catch {}
        fetchCategories();
      }
    } catch (err) {
      // Bắt chính xác lỗi 400 Bad Request kèm message tiếng Việt từ Backend
      const errMsg =
        err.response?.data?.message ||
        `Không thể xóa danh mục "${deleteConfirmCategory.name}". Vui lòng thử lại.`;
      showToast(errMsg, 'error');
    } finally {
      setDeleteLoading(false);
    }
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

      {/* 1. Header Trang & Nút Thêm Mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#8C6A48] font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>QUẢN TRỊ DANH MỤC & PHÂN LOẠI SẢN PHẨM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            Quản Lý Danh Mục
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Tổ chức cây phân loại đồ nội thất, điều khiển hiển thị trên thanh menu và quản lý sản phẩm liên kết.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setCategoryModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* 2. Tabs bộ đếm nhanh */}
      <div className="flex items-center space-x-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'all', label: 'Tất cả', count: counts.total },
          { id: '1', label: 'Đang hiển thị', count: counts.active, isBadgeActive: true },
          { id: '0', label: 'Đang ẩn', count: counts.inactive, isBadgeInactive: true },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#8C6A48] text-[#8C6A48] font-semibold bg-stone-50/50'
                  : 'border-transparent text-stone-500 hover:text-neutral-900 hover:border-stone-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold transition-colors ${
                  isActive
                    ? 'bg-[#8C6A48] text-white'
                    : tab.isBadgeActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : tab.isBadgeInactive
                    ? 'bg-stone-200 text-stone-700'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Thanh Toolbar: Ô tìm kiếm debounce & Dropdown sắp xếp */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Ô tìm kiếm từ khóa (tên danh mục hoặc slug) */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
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

        {/* Nhóm Dropdown sắp xếp & Nút Làm mới */}
        <div className="flex items-center space-x-2.5 justify-between sm:justify-end">
          {/* Dropdown sắp xếp */}
          <div className="flex items-center space-x-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-3 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 transition-all cursor-pointer font-medium"
            >
              <option value="created_at_desc">Mới nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="products_count_desc">Số sản phẩm nhiều nhất</option>
              <option value="created_at_asc">Cũ nhất</option>
            </select>
          </div>

          {/* Nút Làm mới */}
          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={loading || refreshing}
            title="Làm mới danh sách"
            className="p-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? 'animate-spin text-[#8C6A48]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Bảng Danh sách Danh mục (Table) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                <th className="py-3.5 px-4 font-semibold">Tên & Đường dẫn</th>
                <th className="py-3.5 px-4 font-semibold">Mô tả</th>
                <th className="py-3.5 px-4 font-semibold text-center">Số sản phẩm</th>
                <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-semibold">Ngày tạo</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8C6A48] mb-3" />
                    <span>Đang nạp dữ liệu danh mục...</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                        <Layers className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Không tìm thấy danh mục nào phù hợp
                      </p>
                      <p className="text-xs text-stone-500">
                        Hãy thử thay đổi từ khóa tìm kiếm hoặc chuyển sang tab lọc khác.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/60 transition-colors"
                    >
                      {/* Tên & Đường dẫn */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[#8C6A48] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <Layers className="w-4 h-4 stroke-[1.8]" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 block truncate">
                              {item.name}
                            </span>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[10.5px] text-stone-400">
                                slug: {item.slug}
                              </span>
                              <a
                                href={`/danh-muc/${item.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở trang danh mục trên cửa hàng"
                                className="text-stone-400 hover:text-[#8C6A48] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mô tả */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-stone-600 line-clamp-2 leading-relaxed">
                          {item.description ? (
                            item.description
                          ) : (
                            <span className="text-stone-400 italic">Chưa có mô tả</span>
                          )}
                        </p>
                      </td>

                      {/* Số sản phẩm: Badge ${item.products_count} sản phẩm kèm ${item.active_products_count} đang bán */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                            <Package className="w-3 h-3 text-[#8C6A48]" />
                            <span>{item.products_count} sản phẩm</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 mt-1 font-medium">
                            {item.active_products_count} đang bán
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái: Switch toggle bật/tắt is_active trực tiếp trên từng dòng */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.is_active}
                            disabled={updatingStatusId === item.id}
                            onClick={() => handleToggleStatus(item)}
                            title={item.is_active ? 'Bấm để ẩn danh mục' : 'Bấm để hiển thị danh mục'}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                              item.is_active ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                item.is_active ? 'translate-x-5' : 'translate-x-0'
                              } flex items-center justify-center`}
                            >
                              {updatingStatusId === item.id && (
                                <Loader2 className="w-2.5 h-2.5 animate-spin text-stone-600" />
                              )}
                            </div>
                          </button>
                          <span
                            className={`text-[10.5px] font-medium hidden sm:inline-block ${
                              item.is_active ? 'text-emerald-700' : 'text-stone-500'
                            }`}
                          >
                            {item.is_active ? 'Đang hiển thị' : 'Đang ẩn'}
                          </span>
                        </div>
                      </td>

                      {/* Ngày tạo: item.created_at_display */}
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {item.created_at_display || item.created_at || '—'}
                      </td>

                      {/* Thao tác: Nút Sửa & Nút Xóa */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleViewDetail(item)}
                            title="Xem chi tiết & sản phẩm gần nhất"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Sửa */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(item);
                              setCategoryModalOpen(true);
                            }}
                            title="Chỉnh sửa danh mục"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-[#8C6A48] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa (thùng rác đỏ) */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCategory(item)}
                            title="Xóa danh mục"
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
              {pagination.last_page} (Tổng số {pagination.total} danh mục)
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
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                        isCurrent
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

      {/* ==========================================
          MODAL: THÊM / SỬA DANH MỤC
         ========================================== */}
      <CategoryModal
        isOpen={categoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          setCategoryModalOpen(false);
          setEditingCategory(null);
          cacheHelper.remove('categories');
          window.dispatchEvent(new Event('categories-updated'));
          try {
            localStorage.setItem('tk_categories_updated_at', Date.now().toString());
          } catch {}
          fetchCategories();
        }}
      />

      {/* ==========================================
          MODAL: CHI TIẾT DANH MỤC & SẢN PHẨM MẪU (GET /api/admin/categories/:id)
         ========================================== */}
      <AnimatePresence>
        {detailCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[#8C6A48] flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-neutral-900">
                      {detailCategory.name}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-400">
                      slug: {detailCategory.slug} • {detailCategory.status_label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailCategory(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs mb-4">
                <div>
                  <span className="font-semibold text-stone-600 block mb-0.5">Mô tả:</span>
                  <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 leading-relaxed">
                    {detailCategory.description || 'Chưa có mô tả chi tiết.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-700">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 text-[10.5px] block">Tổng số sản phẩm</span>
                    <span className="font-bold text-base font-mono text-neutral-900">
                      {detailCategory.products_count}
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 text-[10.5px] block">Đang mở bán</span>
                    <span className="font-bold text-base font-mono text-emerald-700">
                      {detailCategory.active_products_count}
                    </span>
                  </div>
                </div>

                {detailCategory.recent_products && detailCategory.recent_products.length > 0 && (
                  <div>
                    <span className="font-semibold text-stone-600 block mb-1.5">
                      Sản phẩm gần nhất ({detailCategory.recent_products.length}):
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {detailCategory.recent_products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/80"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover bg-stone-200 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.jpg';
                              }}
                            />
                            <div className="truncate">
                              <span className="font-medium text-neutral-900 block truncate text-xs">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {p.brand} • {p.variants_count} biến thể
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#8C6A48] shrink-0 ml-2">
                            {p.price_from_display}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDetailCategory(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: XÁC NHẬN XÓA (SAFEGUARD NẾU CÓ SẢN PHẨM)
         ========================================== */}
      <AnimatePresence>
        {deleteConfirmCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
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
                Xác Nhận Xóa Danh Mục
              </h2>

              <p className="text-center text-xs text-stone-500 mb-4 leading-relaxed font-light">
                Bạn có chắc chắn muốn xóa danh mục{' '}
                <strong className="text-neutral-900">"{deleteConfirmCategory.name}"</strong>?
              </p>

              {/* Ràng buộc toàn vẹn dữ liệu khi có sản phẩm liên kết */}
              {deleteConfirmCategory.products_count > 0 ? (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-amber-800">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Ràng buộc toàn vẹn dữ liệu (Safeguard):</span>
                  </div>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed font-light">
                    Danh mục này đang có{' '}
                    <strong className="font-semibold text-neutral-900 font-mono">
                      {deleteConfirmCategory.products_count} sản phẩm liên kết
                    </strong>
                    . Backend sẽ chặn xóa vĩnh viễn (mã lỗi 400 Bad Request) để bảo vệ tính toàn vẹn của dữ liệu bán hàng.
                  </p>
                  <p className="text-[11px] text-amber-700 italic">
                    Gợi ý an toàn: Vui lòng chuyển các sản phẩm sang danh mục khác hoặc chuyển trạng thái sang <strong>"Đang ẩn"</strong> thay vì xóa.
                  </p>
                </div>
              ) : (
                <div className="mb-5 p-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 text-xs">
                  <p className="text-[11.5px] leading-relaxed">
                    Danh mục này hiện không có sản phẩm nào liên kết. Sau khi xóa, danh mục sẽ bị xóa hoàn toàn khỏi hệ thống.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeleteConfirmCategory(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                {deleteConfirmCategory.products_count > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = deleteConfirmCategory;
                      setDeleteConfirmCategory(null);
                      if (target.is_active) {
                        handleToggleStatus(target);
                      } else {
                        showToast(`Danh mục "${target.name}" đã ở trạng thái Ẩn sẵn.`);
                      }
                    }}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Chuyển sang Ẩn danh mục</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={handleDeleteCategory}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center space-x-2"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang xóa...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Vĩnh Viễn</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
