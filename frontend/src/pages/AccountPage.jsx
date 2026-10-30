import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  KeyRound,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Search,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Lock,
  Headphones,
  RefreshCw,
  Info,
  Award
} from 'lucide-react';
import profileApi from '../api/profileApi';
import orderApi from '../api/orderApi';
import OrderDetailModal from '../components/account/OrderDetailModal';
import CancelOrderModal from '../components/account/CancelOrderModal';

// Badge cấu hình cho từng trạng thái đơn hàng (Luxury styling)
const STATUS_STYLES = {
  pending: {
    label: 'Chờ xác nhận',
    bg: 'bg-amber-50/80',
    text: 'text-amber-800',
    border: 'border-amber-200/80',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-50/80',
    text: 'text-blue-800',
    border: 'border-blue-200/80',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
  },
  shipping: {
    label: 'Đang giao hàng',
    bg: 'bg-sky-50/80',
    text: 'text-sky-800',
    border: 'border-sky-200/80',
    dot: 'bg-sky-500',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-800',
    border: 'border-emerald-200/80',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-rose-50/80',
    text: 'text-rose-800',
    border: 'border-rose-200/80',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
};

export default function AccountPage({ defaultTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Xác định tab đang chọn
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    if (location.pathname === '/don-hang') return 'orders';
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders' || tabParam === 'don-hang') return 'orders';
    if (tabParam === 'password' || tabParam === 'security' || tabParam === 'mat-khau') return 'password';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Đồng bộ tab khi pathname hoặc searchParams thay đổi
  useEffect(() => {
    if (location.pathname === '/don-hang') {
      setActiveTab('orders');
    } else {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'orders' || tabParam === 'don-hang') {
        setActiveTab('orders');
      } else if (tabParam === 'password' || tabParam === 'security' || tabParam === 'mat-khau') {
        setActiveTab('password');
      } else if (tabParam === 'profile' || tabParam === 'ho-so') {
        setActiveTab('profile');
      }
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (location.pathname === '/don-hang' && newTab !== 'orders') {
      navigate(`/tai-khoan?tab=${newTab}`);
    } else {
      setSearchParams({ tab: newTab });
    }
  };

  // Toast feedback state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Auth check
  const token = localStorage.getItem('token');
  const [isAuth, setIsAuth] = useState(Boolean(token));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuth(Boolean(localStorage.getItem('token')));
    };
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // =========================================================================
  // STATE: TAB 1 - PROFILE
  // =========================================================================
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setProfileLoading(true);
      const res = await profileApi.getProfile();
      if (res.data?.status && res.data?.data) {
        const u = res.data.data;
        setProfile(u);
        setProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          address: u.address || '',
        });
        // Cập nhật lại user trong localStorage cho đồng bộ
        try {
          const currentStored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...currentStored, ...u }));
        } catch {
          localStorage.setItem('user', JSON.stringify(u));
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin hồ sơ:', err);
      showToast(err.response?.data?.message || 'Không thể tải thông tin tài khoản', 'error');
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuth) {
      fetchProfile();
    }
  }, [isAuth, fetchProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});

    if (!profileForm.name.trim()) {
      setProfileErrors({ name: 'Họ và tên không được để trống' });
      return;
    }

    try {
      setProfileUpdating(true);
      const res = await profileApi.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
      });

      if (res.data?.status) {
        showToast(res.data.message || 'Cập nhật thông tin hồ sơ thành công!', 'success');
        const updated = res.data.data;
        setProfile(updated);
        try {
          const currentStored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...currentStored, ...updated }));
        } catch {
          localStorage.setItem('user', JSON.stringify(updated));
        }
        window.dispatchEvent(new Event('auth-change'));
      }
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          backendErrors[k] = Array.isArray(v) ? v[0] : v;
        });
        setProfileErrors(backendErrors);
        showToast('Vui lòng kiểm tra lại thông tin nhập', 'error');
      } else {
        showToast(err.response?.data?.message || 'Không thể cập nhật hồ sơ', 'error');
      }
    } finally {
      setProfileUpdating(false);
    }
  };

  // =========================================================================
  // STATE: TAB 2 - ORDERS
  // =========================================================================
  const [orders, setOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  });
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderPagination, setOrderPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Modal Chi tiết & Hủy đơn
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Tải thống kê counts
  const fetchOrderCounts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await orderApi.getOrderCounts();
      if (res.data?.status && res.data?.data) {
        setOrderCounts(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi lấy số lượng đơn hàng:', err);
    }
  }, [token]);

  // Tải danh sách đơn hàng
  const fetchOrders = useCallback(
    async (page = 1) => {
      if (!token) return;
      try {
        setOrdersLoading(true);
        const params = {
          page,
          per_page: 10,
        };
        if (orderStatusFilter && orderStatusFilter !== 'all') {
          params.status = orderStatusFilter;
        }
        if (orderSearch.trim()) {
          params.search = orderSearch.trim();
        }

        const res = await orderApi.getMyOrders(params);
        if (res.data?.status) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          setOrders(list);
          if (res.data.pagination) {
            setOrderPagination(res.data.pagination);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách đơn hàng:', err);
        showToast('Không thể tải danh sách đơn hàng', 'error');
      } finally {
        setOrdersLoading(false);
      }
    },
    [token, orderStatusFilter, orderSearch]
  );

  useEffect(() => {
    if (isAuth && activeTab === 'orders') {
      fetchOrderCounts();
      fetchOrders(1);
    }
  }, [isAuth, activeTab, fetchOrderCounts, fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOrderSearch(orderSearchInput.trim());
  };

  const handleClearSearch = () => {
    setOrderSearchInput('');
    setOrderSearch('');
  };

  const handleOpenDetail = async (order) => {
    setSelectedOrderDetail(order);
    setIsDetailModalOpen(true);
    // Tải thông tin mới nhất từ API chi tiết
    try {
      const res = await orderApi.getOrderDetail(order.id || order.order_code);
      if (res.data?.status && res.data?.data) {
        setSelectedOrderDetail(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết đơn hàng:', err);
    }
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason) => {
    if (!orderToCancel) return;
    try {
      setIsCancelling(true);
      const res = await orderApi.cancelOrder(orderToCancel.id || orderToCancel.order_code, reason);
      if (res.data?.status) {
        showToast(res.data.message || 'Hủy đơn hàng thành công!', 'success');
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        // Refresh orders list và counts
        fetchOrderCounts();
        fetchOrders(orderPagination.current_page || 1);
        if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      showToast(err.response?.data?.message || 'Không thể hủy đơn hàng vào lúc này', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // =========================================================================
  // STATE: TAB 3 - CHANGE PASSWORD
  // =========================================================================
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors = {};
    if (profile?.has_password !== false && !passwordForm.current_password) {
      errors.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!passwordForm.new_password) {
      errors.new_password = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.new_password.length < 6) {
      errors.new_password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    if (!passwordForm.new_password_confirmation) {
      errors.new_password_confirmation = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      errors.new_password_confirmation = 'Xác nhận mật khẩu mới không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordUpdating(true);
      const payload = {
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      };
      if (profile?.has_password !== false) {
        payload.current_password = passwordForm.current_password;
      }

      const res = await profileApi.changePassword(payload);
      if (res.data?.status) {
        showToast(res.data.message || 'Đổi mật khẩu thành công!', 'success');
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
        if (profile) {
          setProfile((prev) => ({ ...prev, has_password: true }));
        }
      }
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          backendErrors[k] = Array.isArray(v) ? v[0] : v;
        });
        setPasswordErrors(backendErrors);
        showToast(err.response.data.message || 'Dữ liệu đổi mật khẩu không hợp lệ', 'error');
      } else {
        showToast(err.response?.data?.message || 'Không thể đổi mật khẩu lúc này', 'error');
      }
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    showToast('Đã đăng xuất tài khoản thành công', 'success');
    navigate('/');
  };

  // Copy mã đơn
  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // MÀN HÌNH CHƯA ĐĂNG NHẬP
  if (!isAuth) {
    return (
      <div className="min-h-[75vh] bg-[#FBF9F5] py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#ECE5DA] text-[#8C6A48] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C241E] mb-2">
            Yêu Cầu Đăng Nhập
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-8 leading-relaxed font-light">
            Quý khách vui lòng đăng nhập để xem thông tin hồ sơ tài khoản và quản lý trạng thái các đơn hàng tại TK House.
          </p>
          <div className="space-y-3">
            <Link
              to="/auth?redirect=/tai-khoan"
              className="w-full py-3.5 px-6 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 inline-block shadow-md hover:shadow-xl active:scale-95"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/"
              className="w-full py-3.5 px-6 rounded-xl border border-[#E5DFD7] hover:bg-[#FAF7F2] text-stone-700 text-xs font-medium uppercase tracking-wider transition-colors inline-block"
            >
              Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Danh sách các tab trạng thái đơn hàng
  const orderTabs = [
    { key: 'all', label: 'Tất cả', count: orderCounts.all || 0 },
    { key: 'pending', label: 'Chờ xác nhận', count: orderCounts.pending || 0 },
    { key: 'confirmed', label: 'Đã xác nhận', count: orderCounts.confirmed || 0 },
    { key: 'shipping', label: 'Đang giao', count: orderCounts.shipping || 0 },
    { key: 'completed', label: 'Hoàn thành', count: orderCounts.completed || 0 },
    { key: 'cancelled', label: 'Đã hủy', count: orderCounts.cancelled || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 sm:py-12 transition-colors">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50'
                : 'bg-rose-950/90 text-rose-100 border-rose-700/50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Tiêu đề trang */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2 font-light">
            <Link to="/" className="hover:text-stone-900 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#8C6A48] font-medium">Tài khoản cá nhân</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] tracking-tight">
                Không Gian Cá Nhân
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light mt-0.5">
                Quản lý thông tin hồ sơ, địa chỉ nhận hàng và theo dõi đơn hàng của Quý khách tại TK House
              </p>
            </div>
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FAF3E8] border border-[#E5D5BC] text-[#8C6A48] rounded-xl text-xs font-semibold hover:bg-[#F5EAD6] transition-colors self-start sm:self-auto shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C6A48]" />
                <span>Trang Quản Trị Hệ Thống</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bố cục chính: 2 Cột (Sidebar bên trái + Nội dung bên phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* =========================================================================
              SIDEBAR BÊN TRÁI (AVATAR NỔI BẬT & MENU LUXURY)
              ========================================================================= */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            {/* 1. Card Thông tin & Avatar Profile Nổi bật */}
            <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
              {/* Avatar tròn to bo viền đôi sang trọng */}
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8C6A48] to-[#C8A97E] text-white font-serif text-3xl font-bold shadow-lg ring-4 ring-[#F2ECE4] flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'TK'}</span>
                  )}
                </div>
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                  title="Tài khoản đang hoạt động"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <h2 className="font-serif font-bold text-lg text-[#2C241E] truncate">
                {profile?.name || 'Quý khách'}
              </h2>
              <p className="text-xs text-stone-500 truncate mt-0.5">{profile?.email || '—'}</p>

              {/* Tag VIP: Huy hiệu nền vàng đồng nhạt */}
              <div className="mt-4">
                <span className="bg-[#FAF3E8] text-[#8C6A48] border border-[#E5D5BC] px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-[#8C6A48]" />
                  <span>{profile?.role === 'admin' ? 'Quản trị viên' : 'Thành Viên VIP'}</span>
                </span>
              </div>
            </div>

            {/* 2. Menu Tabs điều hướng */}
            <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-5 space-y-2">
              {/* Tab 1: Hồ sơ cá nhân */}
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#2C241E] text-white shadow-md'
                    : 'text-[#554D45] hover:bg-[#F5F0E8] hover:text-[#2C241E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'profile' ? 'bg-white/10 text-white' : 'bg-[#FAF7F2] text-[#8C6A48]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <span>Hồ sơ cá nhân</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'profile' ? 'rotate-90 text-white/70' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Tab 2: Đơn hàng của tôi */}
              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#2C241E] text-white shadow-md'
                    : 'text-[#554D45] hover:bg-[#F5F0E8] hover:text-[#2C241E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'orders' ? 'bg-white/10 text-white' : 'bg-[#FAF7F2] text-[#8C6A48]'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Đơn hàng của tôi</span>
                </div>
                <div className="flex items-center space-x-2">
                  {orderCounts.all > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        activeTab === 'orders'
                          ? 'bg-[#8C6A48] text-white'
                          : 'bg-[#FAF3E8] text-[#8C6A48] border border-[#E5D5BC]'
                      }`}
                    >
                      {orderCounts.all}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      activeTab === 'orders' ? 'rotate-90 text-white/70' : 'text-stone-400'
                    }`}
                  />
                </div>
              </button>

              {/* Tab 3: Đổi mật khẩu */}
              <button
                type="button"
                onClick={() => handleTabChange('password')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-[#2C241E] text-white shadow-md'
                    : 'text-[#554D45] hover:bg-[#F5F0E8] hover:text-[#2C241E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'password' ? 'bg-white/10 text-white' : 'bg-[#FAF7F2] text-[#8C6A48]'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span>Bảo mật & Đổi mật khẩu</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'password' ? 'rotate-90 text-white/70' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Đăng xuất */}
              <div className="pt-2 mt-2 border-t border-[#EAE4DC]/80">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>

            {/* 3. Box hotline trợ giúp */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#ECE5DA] shadow-xs text-xs space-y-2">
              <div className="flex items-center space-x-2 text-[#8C6A48] font-semibold">
                <Headphones className="w-4 h-4" />
                <span>Trợ giúp & Tư vấn nội thất</span>
              </div>
              <p className="text-stone-600 leading-relaxed font-light">
                Quý khách cần hỗ trợ kiểm tra vận chuyển, bảo dưỡng hoặc tư vấn chất liệu?
              </p>
              <a
                href="tel:18007200"
                className="font-serif font-bold text-base text-[#2C241E] hover:text-[#8C6A48] block transition-colors mt-1"
              >
                1800 7200 <span className="text-[11px] font-sans font-normal text-stone-500">(Miễn cước 24/7)</span>
              </a>
            </div>
          </div>

          {/* =========================================================================
              NỘI DUNG CHÍNH BÊN PHẢI (THEO TỪNG TAB)
              ========================================================================= */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* =====================================================================
                TAB 1: HỒ SƠ CÁ NHÂN
                ===================================================================== */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2C241E]">
                    Hồ Sơ Cá Nhân
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
                    Xem và cập nhật thông tin liên hệ và địa chỉ nhận hàng mặc định của Quý khách
                  </p>
                </div>

                {profileLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8C6A48]" />
                    <span className="text-xs font-light">Đang tải thông tin hồ sơ...</span>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* 3. CÁC THẺ STATS MINI (Ngày tham gia, Hạng VIP, Xác thực) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Thẻ 1: Ngày tham gia */}
                      <div className="bg-[#FAF7F2] rounded-xl border border-[#ECE5DA] p-4 flex items-center space-x-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#ECE5DA] flex items-center justify-center text-[#8C6A48] flex-shrink-0 shadow-xs">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                            Ngày tham gia
                          </span>
                          <strong className="font-serif font-bold text-stone-900 text-sm sm:text-base block truncate mt-0.5">
                            {profile?.created_at_display || 'Thành viên mới'}
                          </strong>
                        </div>
                      </div>

                      {/* Thẻ 2: Hạng VIP */}
                      <div className="bg-[#FAF7F2] rounded-xl border border-[#ECE5DA] p-4 flex items-center space-x-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#ECE5DA] flex items-center justify-center text-[#8C6A48] flex-shrink-0 shadow-xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                            Hạng thành viên
                          </span>
                          <strong className="font-serif font-bold text-[#8C6A48] text-sm sm:text-base block truncate mt-0.5 uppercase">
                            {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng VIP'}
                          </strong>
                        </div>
                      </div>

                      {/* Thẻ 3: Trạng thái xác thực */}
                      <div className="bg-[#FAF7F2] rounded-xl border border-[#ECE5DA] p-4 flex items-center space-x-3.5 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#ECE5DA] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                            Xác thực tài khoản
                          </span>
                          <span className="font-serif font-bold text-emerald-800 text-sm sm:text-base block truncate mt-0.5">
                            Đã kích hoạt
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. FORM INPUTS (LUXURY FORM ELEMENTS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Họ và tên */}
                      <div>
                        <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, name: e.target.value });
                              if (profileErrors.name) setProfileErrors({ ...profileErrors, name: '' });
                            }}
                            placeholder="Nguyễn Tuấn Kiệt"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs bg-[#FCFBF9] border transition-all duration-200 ${
                              profileErrors.name
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                                : 'border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none'
                            }`}
                          />
                        </div>
                        {profileErrors.name && (
                          <p className="text-xs text-rose-500 mt-1.5 font-medium">{profileErrors.name}</p>
                        )}
                      </div>

                      {/* Email (Read-only tinh tế với icon ổ khóa xám) */}
                      <div>
                        <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                          Địa chỉ Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-xs border border-[#EAE4DC] bg-[#F7F5F1] text-stone-600 cursor-not-allowed select-none"
                          />
                          <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1.5">
                          Email là mã định danh bảo mật liên kết tài khoản và không thể tự thay đổi.
                        </p>
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, phone: e.target.value });
                              if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                            }}
                            placeholder="Ví dụ: 0912345678"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs bg-[#FCFBF9] border transition-all duration-200 ${
                              profileErrors.phone
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                                : 'border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none'
                            }`}
                          />
                        </div>
                        {profileErrors.phone && (
                          <p className="text-xs text-rose-500 mt-1.5 font-medium">{profileErrors.phone}</p>
                        )}
                      </div>

                      {/* Trạng thái bảo mật */}
                      <div>
                        <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                          Trạng thái bảo mật
                        </label>
                        <div className="p-3 rounded-xl border border-[#ECE5DA] bg-[#FAF7F2] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 text-stone-700">
                            <KeyRound className="w-4 h-4 text-[#8C6A48]" />
                            <span>
                              {profile?.has_password ? 'Đã thiết lập mật khẩu' : 'Đăng nhập Google'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTabChange('password')}
                            className="text-[#8C6A48] hover:text-[#2C241E] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Đổi mật khẩu →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Địa chỉ nhận hàng mặc định */}
                    <div>
                      <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                        Địa chỉ nhận hàng mặc định
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <textarea
                          rows={3}
                          value={profileForm.address}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, address: e.target.value });
                            if (profileErrors.address) setProfileErrors({ ...profileErrors, address: '' });
                          }}
                          placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-xs bg-[#FCFBF9] border border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none transition-all duration-200"
                        />
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1.5">
                        Địa chỉ này sẽ được tự động điền sẵn khi Quý khách tiến hành thanh toán đơn hàng mới.
                      </p>
                    </div>

                    {/* NÚT "LƯU THAY ĐỔI HỒ SƠ" (LUXURY BUTTON THEO YÊU CẦU) */}
                    <div className="pt-4 flex items-center justify-end border-t border-[#EAE4DC]/80">
                      <button
                        type="submit"
                        disabled={profileUpdating}
                        className="bg-[#2C241E] hover:bg-[#8C6A48] text-white px-8 py-3.5 rounded-xl font-medium tracking-wide shadow-md hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center space-x-2 text-xs uppercase disabled:opacity-50 cursor-pointer"
                      >
                        {profileUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang lưu thông tin...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>LƯU THAY ĐỔI HỒ SƠ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* =====================================================================
                TAB 2: ĐƠN HÀNG CỦA TÔI
                ===================================================================== */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Header Tab Đơn hàng */}
                <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2C241E]">
                        Đơn Hàng Của Tôi
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 font-light mt-0.5">
                        Theo dõi tiến độ vận chuyển và lịch sử mua sắm đồ nội thất của Quý khách
                      </p>
                    </div>

                    {/* Nút refresh */}
                    <button
                      type="button"
                      onClick={() => {
                        fetchOrderCounts();
                        fetchOrders(orderPagination.current_page || 1);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[#ECE5DA] hover:bg-[#FAF7F2] text-stone-700 text-xs font-medium transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
                      title="Làm mới danh sách"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-[#8C6A48]' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  {/* Thanh Tabs trạng thái có Badge số lượng lấy từ API counts */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                    {orderTabs.map((tab) => {
                      const isActive = orderStatusFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setOrderStatusFilter(tab.key)}
                          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-[#2C241E] text-white shadow-md'
                              : 'bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#554D45] border border-[#ECE5DA]'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-[#8C6A48] text-white'
                                : 'bg-white text-[#8C6A48] border border-[#E5DFD7]'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Thanh tìm kiếm theo mã đơn hoặc tên sản phẩm */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={orderSearchInput}
                      onChange={(e) => setOrderSearchInput(e.target.value)}
                      placeholder="Tìm theo mã đơn (TKH2026...) hoặc tên sản phẩm nội thất..."
                      className="w-full pl-10 pr-24 py-3.5 rounded-xl text-xs bg-[#FCFBF9] border border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none transition-all duration-200"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                      {orderSearchInput && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#8C6A48] hover:bg-[#725436] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Tìm kiếm
                      </button>
                    </div>
                  </form>
                </div>

                {/* Danh sách các card đơn hàng */}
                {ordersLoading ? (
                  <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8C6A48] mx-auto" />
                    <p className="text-xs text-stone-500 font-light">Đang tải danh sách đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  /* Giao diện Empty State khi không có đơn hàng */
                  <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 sm:p-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#ECE5DA] text-[#8C6A48] flex items-center justify-center mx-auto shadow-inner">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h4 className="font-serif font-bold text-lg text-[#2C241E]">
                        {orderSearch ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-light">
                        {orderSearch
                          ? `Không tìm thấy kết quả nào với từ khóa "${orderSearch}". Quý khách vui lòng thử tìm kiếm mã đơn khác.`
                          : 'Quý khách chưa có đơn hàng nào trong mục này. Hãy khám phá bộ sưu tập nội thất cao cấp của TK House để tô điểm cho không gian sống.'}
                      </p>
                    </div>
                    <div className="pt-2">
                      {orderSearch ? (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="px-6 py-2.5 rounded-xl border border-[#E5DFD7] hover:bg-[#FAF7F2] text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                        >
                          Xóa bộ lọc tìm kiếm
                        </button>
                      ) : (
                        <Link
                          to="/san-pham"
                          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl active:scale-95"
                        >
                          <span>Khám phá sản phẩm ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const statusCfg = STATUS_STYLES[order.status] || {
                        label: order.status_label || order.status,
                        bg: 'bg-stone-50',
                        text: 'text-stone-800',
                        border: 'border-stone-200',
                        dot: 'bg-stone-500',
                        icon: Clock,
                      };
                      const StatusIcon = statusCfg.icon;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)]"
                        >
                          {/* Header của từng đơn */}
                          <div className="px-6 py-4 bg-[#FAF7F2]/80 border-b border-[#ECE5DA] flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="text-stone-500">Mã đơn:</span>
                              <span className="font-mono font-bold text-stone-900 tracking-wide text-[13px]">
                                {order.order_code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(order.order_code)}
                                className="text-stone-400 hover:text-[#8C6A48] transition-colors p-1"
                                title="Sao chép mã đơn"
                              >
                                {copiedCode === order.order_code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <span className="text-stone-300">|</span>
                              <span className="text-stone-500 flex items-center space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                <span>{order.created_at_display}</span>
                              </span>
                            </div>

                            {/* Badge trạng thái đơn */}
                            <div
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{order.status_label || statusCfg.label}</span>
                            </div>
                          </div>

                          {/* Danh sách mặt hàng trong đơn */}
                          <div className="p-6 divide-y divide-[#EAE4DC]/60">
                            {order.items?.map((item) => (
                              <div
                                key={item.id}
                                className="py-4 first:pt-0 last:pb-0 flex items-start sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-center space-x-4 min-w-0">
                                  <img
                                    src={item.image || '/images/placeholder.jpg'}
                                    alt={item.product_name}
                                    onError={(e) => {
                                      e.currentTarget.src = '/images/placeholder.jpg';
                                    }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0 border border-[#ECE5DA] shadow-xs"
                                  />
                                  <div className="min-w-0 space-y-1">
                                    {item.product_slug ? (
                                      <Link
                                        to={`/san-pham/${item.product_slug}`}
                                        className="font-semibold text-xs sm:text-sm text-stone-900 hover:text-[#8C6A48] transition-colors line-clamp-1 block"
                                      >
                                        {item.product_name}
                                      </Link>
                                    ) : (
                                      <h5 className="font-semibold text-xs sm:text-sm text-stone-900 line-clamp-1">
                                        {item.product_name}
                                      </h5>
                                    )}

                                    {/* Biến thể: màu sắc, chất liệu, kích thước */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                                      {item.color && (
                                        <span className="bg-[#FAF7F2] border border-[#ECE5DA] px-2 py-0.5 rounded-md text-stone-700">
                                          Màu: {item.color}
                                        </span>
                                      )}
                                      {item.material && (
                                        <span className="bg-[#FAF7F2] border border-[#ECE5DA] px-2 py-0.5 rounded-md text-stone-700">
                                          {item.material}
                                        </span>
                                      )}
                                      {item.dimensions && (
                                        <span className="bg-[#FAF7F2] border border-[#ECE5DA] px-2 py-0.5 rounded-md text-stone-700">
                                          {item.dimensions}
                                        </span>
                                      )}
                                      {item.sku && (
                                        <span className="font-mono text-stone-400">
                                          SKU: {item.sku}
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-xs text-stone-600 sm:hidden">
                                      {item.unit_price_display} × {item.quantity} ={' '}
                                      <span className="font-semibold text-[#8C6A48]">
                                        {item.line_total_display}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="hidden sm:block text-right flex-shrink-0">
                                  <div className="font-mono font-bold text-sm text-stone-900">
                                    {item.line_total_display}
                                  </div>
                                  <div className="text-xs text-stone-500">
                                    {item.unit_price_display} × {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer của đơn: Tổng tiền, Trạng thái thanh toán & Nút tác vụ */}
                          <div className="px-6 py-4 bg-[#FAF7F2]/60 border-t border-[#ECE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              {/* Phương thức & Trạng thái thanh toán */}
                              <div className="flex items-center space-x-1.5 text-stone-600">
                                <span className="text-stone-400">Thanh toán:</span>
                                <span className="font-medium text-stone-800">
                                  {order.payment?.method_label || 'COD'}
                                </span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  order.payment?.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.payment?.status === 'failed'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.payment?.status_label || (order.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-5">
                              {/* Tổng số tiền */}
                              <div className="text-right">
                                <span className="text-[11px] text-stone-500 block">Tổng thanh toán:</span>
                                <span className="font-serif font-bold text-base sm:text-lg text-[#8C6A48]">
                                  {order.total_amount_display}
                                </span>
                              </div>

                              {/* Nhóm nút tác vụ */}
                              <div className="flex items-center space-x-2.5">
                                {/* Nút Hủy đơn chỉ hiển thị khi can_cancel: true */}
                                {order.can_cancel && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCancelModal(order)}
                                    className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Hủy đơn
                                  </button>
                                )}

                                {/* Nút Xem chi tiết */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(order)}
                                  className="px-5 py-2 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-medium uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
                                >
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Phân trang */}
                    {orderPagination.last_page > 1 && (
                      <div className="pt-4 flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          disabled={orderPagination.current_page <= 1}
                          onClick={() => fetchOrders(orderPagination.current_page - 1)}
                          className="p-2 rounded-xl border border-[#ECE5DA] bg-white text-stone-600 hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          title="Trang trước"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: orderPagination.last_page }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => fetchOrders(p)}
                            className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              p === orderPagination.current_page
                                ? 'bg-[#2C241E] text-white shadow-sm'
                                : 'bg-white border border-[#ECE5DA] text-stone-700 hover:bg-[#FAF7F2]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}

                        <button
                          type="button"
                          disabled={orderPagination.current_page >= orderPagination.last_page}
                          onClick={() => fetchOrders(orderPagination.current_page + 1)}
                          className="p-2 rounded-xl border border-[#ECE5DA] bg-white text-stone-600 hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          title="Trang sau"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================================
                TAB 3: ĐỔI MẬT KHẨU
                ===================================================================== */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2C241E]">
                    Bảo Mật & Đổi Mật Khẩu
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
                    Để đảm bảo an toàn cho tài khoản, Quý khách nên sử dụng mật khẩu mạnh kết hợp chữ, số và ký tự đặc biệt.
                  </p>
                </div>

                {profile?.has_password === false && (
                  <div className="p-4 bg-[#FAF3E8] border border-[#E5D5BC] rounded-xl flex items-start space-x-3 text-xs text-amber-950 leading-relaxed shadow-xs">
                    <Info className="w-5 h-5 text-[#8C6A48] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950 font-semibold mb-0.5">
                        Tài khoản liên kết Google
                      </strong>
                      Tài khoản của Quý khách hiện đang đăng nhập qua Google và chưa từng thiết lập mật khẩu riêng. Quý khách có thể nhập mật khẩu mới trực tiếp mà không cần mật khẩu hiện tại.
                    </div>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="max-w-xl space-y-6">
                  {/* Mật khẩu hiện tại (nếu có) */}
                  {profile?.has_password !== false && (
                    <div>
                      <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                        Mật khẩu hiện tại <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={passwordForm.current_password}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, current_password: e.target.value });
                            if (passwordErrors.current_password) {
                              setPasswordErrors({ ...passwordErrors, current_password: '' });
                            }
                          }}
                          placeholder="Nhập mật khẩu hiện tại"
                          className={`w-full pl-10 pr-10 py-3.5 rounded-xl text-xs bg-[#FCFBF9] border transition-all duration-200 ${
                            passwordErrors.current_password
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="text-stone-400 hover:text-stone-700 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.current_password && (
                        <p className="text-xs text-rose-500 mt-1.5 font-medium">
                          {passwordErrors.current_password}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                      Mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, new_password: e.target.value });
                          if (passwordErrors.new_password) {
                            setPasswordErrors({ ...passwordErrors, new_password: '' });
                          }
                        }}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className={`w-full pl-10 pr-10 py-3.5 rounded-xl text-xs bg-[#FCFBF9] border transition-all duration-200 ${
                          passwordErrors.new_password
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                            : 'border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="text-stone-400 hover:text-stone-700 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium">
                        {passwordErrors.new_password}
                      </p>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
                      Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => {
                          setPasswordForm({
                            ...passwordForm,
                            new_password_confirmation: e.target.value,
                          });
                          if (passwordErrors.new_password_confirmation) {
                            setPasswordErrors({ ...passwordErrors, new_password_confirmation: '' });
                          }
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        className={`w-full pl-10 pr-10 py-3.5 rounded-xl text-xs bg-[#FCFBF9] border transition-all duration-200 ${
                          passwordErrors.new_password_confirmation
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                            : 'border-[#E5DFD7] focus:border-[#8C6A48] focus:ring-2 focus:ring-[#8C6A48]/15 focus:bg-white focus:outline-none'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="text-stone-400 hover:text-stone-700 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.new_password_confirmation && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium">
                        {passwordErrors.new_password_confirmation}
                      </p>
                    )}
                  </div>

                  {/* Nút cập nhật mật khẩu */}
                  <div className="pt-4 border-t border-[#EAE4DC]/80 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={passwordUpdating}
                      className="bg-[#2C241E] hover:bg-[#8C6A48] text-white px-8 py-3.5 rounded-xl font-medium tracking-wide shadow-md hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center space-x-2 text-xs uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {passwordUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>CẬP NHẬT MẬT KHẨU</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedOrderDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderDetail(null);
        }}
        onOpenCancel={(order) => {
          handleOpenCancelModal(order);
        }}
      />

      {/* MODAL XÁC NHẬN HỦY ĐƠN */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={orderToCancel}
        onClose={() => {
          if (!isCancelling) {
            setIsCancelModalOpen(false);
            setOrderToCancel(null);
          }
        }}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
