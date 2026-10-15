import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Lock,
  Unlock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminUserApi from '../../api/adminUser';

// ==========================================
// TOAST NOTIFICATION COMPONENT
// ==========================================
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium backdrop-blur-md ${
        isSuccess
          ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
          : 'bg-rose-900/90 text-rose-100 border-rose-700/50'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ==========================================
// ROLE BADGE COMPONENT
// ==========================================
function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
        isAdmin
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-stone-50 text-stone-600 border-stone-200'
      }`}
    >
      {isAdmin ? (
        <Shield className="w-3 h-3 text-amber-600 shrink-0" />
      ) : (
        <Users className="w-3 h-3 text-stone-400 shrink-0" />
      )}
      <span>{isAdmin ? 'Quản trị viên' : 'Khách hàng'}</span>
    </span>
  );
}

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================
function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      <span>{isActive ? 'Hoạt động' : 'Đã khóa'}</span>
    </span>
  );
}

export default function UsersPage() {
  // Current user from local storage (for self protection safeguards)
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Main state
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    admins: 0,
    customers: 0,
    active: 0,
    locked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('total'); // 'total' | 'admins' | 'customers' | 'active' | 'locked'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Action status loaders
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Modals & Drawers
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailDrawerUser, setDetailDrawerUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (activeTab !== 'total') {
        params.tab = activeTab;
      }

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await adminUserApi.getUsers(params);
      if (res.data?.status) {
        setUsers(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp danh sách người dùng:', err);
      showToast(
        err.response?.data?.message || 'Không thể tải danh sách người dùng',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, activeTab, debouncedSearch, roleFilter, statusFilter]);

  // Quick Toggle Status
  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      showToast('Bạn không thể tự khóa tài khoản của chính mình!', 'error');
      return;
    }

    try {
      setUpdatingStatusId(user.id);
      const nextStatus = !user.is_active;
      const res = await adminUserApi.updateStatus(user.id, nextStatus);

      if (res.data?.status) {
        showToast(
          nextStatus
            ? `Đã mở khóa tài khoản cho ${user.name}`
            : `Đã tạm khóa tài khoản của ${user.name}`
        );
        // Cập nhật state nội bộ
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_active: nextStatus } : u
          )
        );
        // Refresh counts
        fetchUsers();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Lỗi khi cập nhật trạng thái người dùng',
        'error'
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Quick Update Role
  const handleUpdateRole = async (user, newRole) => {
    if (user.id === currentUser?.id && newRole !== 'admin') {
      showToast('Bạn không thể tự giáng chức tài khoản của chính mình!', 'error');
      return;
    }

    if (user.role === 'admin' && newRole === 'customer' && counts.admins <= 1) {
      showToast('Hệ thống phải duy trì ít nhất 1 Quản trị viên!', 'error');
      return;
    }

    try {
      setUpdatingRoleId(user.id);
      const res = await adminUserApi.updateRole(user.id, newRole);

      if (res.data?.status) {
        showToast(
          `Đã chuyển vai trò của ${user.name} thành "${
            newRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'
          }"`
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        fetchUsers();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Lỗi khi cập nhật vai trò',
        'error'
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Open Detail Drawer
  const handleOpenDetail = async (user) => {
    setDetailDrawerUser(user);
    setDetailLoading(true);
    try {
      const res = await adminUserApi.getUserDetail(user.id);
      if (res.data?.status && res.data?.data) {
        setDetailDrawerUser(res.data.data);
      }
    } catch (err) {
      console.warn('Lỗi lấy chi tiết người dùng:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete User Submit
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;

    if (deleteConfirmUser.id === currentUser?.id) {
      showToast('Bạn không thể tự xóa tài khoản của chính mình!', 'error');
      setDeleteConfirmUser(null);
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await adminUserApi.deleteUser(deleteConfirmUser.id);
      if (res.data?.status) {
        showToast(`Đã xóa tài khoản "${deleteConfirmUser.name}" thành công`);
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Không thể xóa người dùng này',
        'error'
      );
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#8C6A48] uppercase tracking-widest font-mono mb-1 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>QUẢN TRỊ BẢO MẬT & HỆ THỐNG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            Người Dùng & Phân Quyền
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Quản lý tài khoản quản trị, thành viên khách hàng và chính sách truy cập toàn diện.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setUserModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Thêm Người Dùng Mới</span>
        </button>
      </div>

      {/* Counter Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'total', label: 'Tất cả người dùng', count: counts.total },
          { id: 'admins', label: 'Quản trị viên', count: counts.admins },
          { id: 'customers', label: 'Khách hàng', count: counts.customers },
          { id: 'active', label: 'Đang hoạt động', count: counts.active },
          { id: 'locked', label: 'Đã khóa', count: counts.locked },
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
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-[#8C6A48] text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Search & Quick Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-neutral-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-stone-400 font-medium">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-stone-50 border border-stone-200 text-neutral-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48]"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-stone-400 font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-stone-50 border border-stone-200 text-neutral-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            title="Làm mới danh sách"
            className="p-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8C6A48]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                <th className="py-3.5 px-4 font-semibold">Người Dùng</th>
                <th className="py-3.5 px-4 font-semibold">Số Điện Thoại</th>
                <th className="py-3.5 px-4 font-semibold">Vai Trò</th>
                <th className="py-3.5 px-4 font-semibold text-right">Chi Tiêu & Đơn</th>
                <th className="py-3.5 px-4 font-semibold text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold">Ngày Tạo</th>
                <th className="py-3.5 px-4 font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8C6A48] mb-3" />
                    <span>Đang nạp dữ liệu người dùng...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Không tìm thấy người dùng phù hợp
                      </p>
                      <p className="text-xs text-stone-500">
                        Thử điều chỉnh lại từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isOnlyAdmin =
                    u.role === 'admin' && counts.admins <= 1;
                  const hasOrders = (u.orders_count || 0) > 0;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-stone-50/60 transition-colors ${
                        isSelf ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name & Email & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#8C6A48] flex items-center justify-center font-serif font-bold text-xs uppercase shadow-2xs shrink-0">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              (u.name || 'U').charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-neutral-900 truncate">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-mono font-bold px-1.5 py-0.2 rounded">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-stone-400 text-[11px] block truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {u.phone || '—'}
                      </td>

                      {/* Role & Quick Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <RoleBadge role={u.role} />
                          {/* Quick Role Switch */}
                          <select
                            disabled={
                              isSelf ||
                              isOnlyAdmin ||
                              updatingRoleId === u.id
                            }
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateRole(u, e.target.value)
                            }
                            title={
                              isSelf
                                ? 'Không thể tự giáng chức chính mình'
                                : isOnlyAdmin
                                ? 'Cần ít nhất 1 Quản trị viên'
                                : 'Đổi vai trò'
                            }
                            className="bg-transparent text-[11px] text-stone-500 hover:text-stone-800 border border-transparent hover:border-stone-200 rounded px-1.5 py-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            <option value="admin">Quản trị viên</option>
                            <option value="customer">Khách hàng</option>
                          </select>
                        </div>
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-semibold text-neutral-900 block">
                          {u.total_spent_display || '0₫'}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {u.orders_count || 0} đơn hàng
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            type="button"
                            disabled={isSelf || updatingStatusId === u.id}
                            onClick={() => handleToggleStatus(u)}
                            title={
                              isSelf
                                ? 'Không thể tự khóa tài khoản của bạn'
                                : u.is_active
                                ? 'Bấm để khóa tài khoản'
                                : 'Bấm để kích hoạt lại'
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.is_active ? 'bg-emerald-600' : 'bg-stone-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                u.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-[11px] text-stone-600 w-16 text-left">
                            {updatingStatusId === u.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#8C6A48]" />
                            ) : u.is_active ? (
                              'Hoạt động'
                            ) : (
                              'Đã khóa'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {u.created_at_display || u.created_at?.slice(0, 10)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Detail Button */}
                          <button
                            onClick={() => handleOpenDetail(u)}
                            title="Xem lịch sử & chi tiết"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserModalOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-[#8C6A48] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            disabled={isSelf || isOnlyAdmin || hasOrders}
                            onClick={() => setDeleteConfirmUser(u)}
                            title={
                              isSelf
                                ? 'Không thể tự xóa tài khoản của bạn'
                                : isOnlyAdmin
                                ? 'Không thể xóa Quản trị viên duy nhất'
                                : hasOrders
                                ? 'Không thể xóa người dùng đã có đơn hàng'
                                : 'Xóa tài khoản'
                            }
                            className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-stone-500 font-mono">
              Hiển thị trang <strong>{pagination.current_page}</strong> /{' '}
              {pagination.last_page} (Tổng số {pagination.total} tài khoản)
            </span>

            <div className="flex items-center space-x-1">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>

              {Array.from({ length: pagination.last_page }).map((_, idx) => {
                const pageNumber = idx + 1;
                const isCurrent = pageNumber === pagination.current_page;
                // Only show around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.last_page ||
                  Math.abs(pageNumber - pagination.current_page) <= 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                        isCurrent
                          ? 'bg-[#2C241E] text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
                }
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: THÊM / CHỈNH SỬA TÀI KHOẢN (UserModal)
         ========================================== */}
      <AnimatePresence>
        {userModalOpen && (
          <UserModal
            isOpen={userModalOpen}
            user={editingUser}
            currentUser={currentUser}
            isOnlyAdmin={editingUser?.role === 'admin' && counts.admins <= 1}
            onClose={() => {
              setUserModalOpen(false);
              setEditingUser(null);
            }}
            onSuccess={(msg) => {
              showToast(msg);
              setUserModalOpen(false);
              setEditingUser(null);
              fetchUsers();
            }}
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          DRAWER: CHI TIẾT NGƯỜI DÙNG & LỊCH SỬ ĐƠN
         ========================================== */}
      <AnimatePresence>
        {detailDrawerUser && (
          <UserDetailDrawer
            user={detailDrawerUser}
            loading={detailLoading}
            onClose={() => setDetailDrawerUser(null)}
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: XÁC NHẬN XÓA TÀI KHOẢN
         ========================================== */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-center text-neutral-900 mb-2">
                Xác Nhận Xóa Tài Khoản
              </h3>
              <p className="text-xs text-stone-500 text-center leading-relaxed mb-6 font-light">
                Hành động này sẽ xóa hoàn toàn thông tin của{' '}
                <strong className="text-neutral-900">{deleteConfirmUser.name}</strong> (
                {deleteConfirmUser.email}) khỏi hệ thống và không thể phục hồi.
              </p>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteUser}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Xóa</span>
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

// ==========================================
// SUB-COMPONENT: USER ADD / EDIT MODAL
// ==========================================
function UserModal({ isOpen, user, currentUser, isOnlyAdmin, onClose, onSuccess }) {
  const isEditing = Boolean(user);
  const isSelf = user?.id === currentUser?.id;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || 'customer',
    is_active: user ? Boolean(user.is_active) : true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Email không hợp lệ';
    }

    if (!isEditing && !formData.password) {
      errs.password = 'Vui lòng nhập mật khẩu (tối thiểu 6 ký tự)';
    } else if (formData.password && formData.password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        const res = await adminUserApi.updateUser(user.id, payload);
        if (res.data?.status) {
          onSuccess(`Cập nhật tài khoản ${formData.name} thành công`);
        }
      } else {
        const res = await adminUserApi.createUser(formData);
        if (res.data?.status) {
          onSuccess(`Thêm mới tài khoản ${formData.name} thành công`);
        }
      }
    } catch (err) {
      console.error('Lỗi lưu thông tin người dùng:', err);
      const msg =
        err.response?.data?.message ||
        'Không thể lưu thông tin tài khoản. Vui lòng thử lại!';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[#8C6A48] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                {isEditing ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Người Dùng Mới'}
              </h2>
              <p className="text-[11px] text-stone-400 font-light">
                {isEditing
                  ? 'Cập nhật phân quyền và thông tin người dùng'
                  : 'Tạo tài khoản quản trị hoặc khách hàng mới'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Ví dụ: Nguyễn Văn An"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.name
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-stone-200 bg-stone-50'
              } text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all`}
            />
            {errors.name && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="example@tkhouse.vn"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-stone-200 bg-stone-50'
                } text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all`}
              />
              {errors.email && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="0901234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              {isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu ban đầu'}{' '}
              {!isEditing && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((p) => ({ ...p, password: e.target.value }))
              }
              placeholder={isEditing ? '••••••••' : 'Tối thiểu 6 ký tự'}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.password
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-stone-200 bg-stone-50'
              } text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C6A48]/30 focus:border-[#8C6A48] transition-all`}
            />
            {errors.password && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Role & Status selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Role */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                Vai trò phân quyền
              </label>
              <div className="space-y-1.5">
                <label
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    formData.role === 'admin'
                      ? 'border-[#8C6A48] bg-amber-50/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={() =>
                      setFormData((p) => ({ ...p, role: 'admin' }))
                    }
                    className="text-[#8C6A48] focus:ring-[#8C6A48]"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs">
                      Quản trị viên
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Toàn quyền quản trị hệ thống
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    formData.role === 'customer'
                      ? 'border-[#8C6A48] bg-amber-50/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  } ${
                    isSelf || isOnlyAdmin ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    disabled={isSelf || isOnlyAdmin}
                    checked={formData.role === 'customer'}
                    onChange={() =>
                      setFormData((p) => ({ ...p, role: 'customer' }))
                    }
                    className="text-[#8C6A48] focus:ring-[#8C6A48]"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs">
                      Khách hàng
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Tài khoản mua sắm bán lẻ
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                Trạng thái tài khoản
              </label>
              <div className="space-y-1.5">
                <label
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    formData.is_active
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === true}
                    onChange={() =>
                      setFormData((p) => ({ ...p, is_active: true }))
                    }
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs">
                      Hoạt động
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Cho phép đăng nhập bình thường
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    !formData.is_active
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  } ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="is_active"
                    disabled={isSelf}
                    checked={formData.is_active === false}
                    onChange={() =>
                      setFormData((p) => ({ ...p, is_active: false }))
                    }
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs">
                      Tạm khóa
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Ngăn chặn đăng nhập vào hệ thống
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2C241E] hover:bg-[#8C6A48] text-white font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEditing ? 'Cập Nhật' : 'Tạo Tài Khoản'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: USER DETAIL & ORDERS DRAWER
// ==========================================
function UserDetailDrawer({ user, loading, onClose }) {
  const recentOrders = user?.recent_orders || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-stone-200/80 bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-[#8C6A48] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                {(user.name || 'U').charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-lg font-bold text-neutral-900">
                    {user.name}
                  </h2>
                  <RoleBadge role={user.role} />
                </div>
                <span className="text-xs text-stone-400 block font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center space-x-2 text-stone-400 font-mono text-[11px] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>TỔNG CHI TIÊU</span>
                </div>
                <span className="text-lg font-mono font-bold text-neutral-900 block">
                  {user.total_spent_display || '0₫'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center space-x-2 text-stone-400 font-mono text-[11px] mb-1">
                  <Package className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>TỔNG ĐƠN HÀNG</span>
                </div>
                <span className="text-lg font-mono font-bold text-neutral-900 block">
                  {user.orders_count || 0} đơn
                </span>
              </div>
            </div>

            {/* Profile Detail List */}
            <div className="bg-stone-50/70 rounded-xl p-4 border border-stone-200/60 space-y-2.5">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                Thông Tin Chi Tiết
              </h3>
              <div className="flex justify-between py-1 border-b border-stone-200/40">
                <span className="text-stone-400">Số điện thoại:</span>
                <span className="font-mono text-neutral-800">
                  {user.phone || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/40">
                <span className="text-stone-400">Trạng thái:</span>
                <StatusBadge isActive={user.is_active} />
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/40">
                <span className="text-stone-400">Ngày tham gia:</span>
                <span className="font-mono text-neutral-800">
                  {user.created_at_display || user.created_at?.slice(0, 10)}
                </span>
              </div>
            </div>

            {/* 10 Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                  <Package className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>10 Đơn Hàng Gần Nhất</span>
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">
                  {recentOrders.length} đơn hiển thị
                </span>
              </div>

              {recentOrders.length === 0 ? (
                <div className="py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400">
                  <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <span>Khách hàng chưa có đơn hàng nào phát sinh</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-stone-200/80 bg-white hover:border-[#8C6A48]/50 transition-colors shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-neutral-900">
                          {order.order_code || `ORD-${order.id}`}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.status_display || order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{order.created_at_display || order.created_at?.slice(0, 10)}</span>
                        </span>
                        <span className="font-mono font-bold text-[#8C6A48] text-xs">
                          {order.total_amount_display || `${Number(order.total_amount || 0).toLocaleString('vi-VN')}₫`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
