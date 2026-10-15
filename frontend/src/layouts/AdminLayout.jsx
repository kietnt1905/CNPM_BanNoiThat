import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  Layers,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronDown,
  Shield,
  Sparkles,
  ArrowLeft,
  Search
} from 'lucide-react';
import authApi from '../api/authApi';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isNonAdminWarning, setIsNonAdminWarning] = useState(false);

  // Kiểm tra quyền Admin khi vào Layout
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role !== 'admin') {
          setIsNonAdminWarning(true);
        }
      } catch {
        setUser({ name: 'Quản trị viên', role: 'admin' });
      }
    } else if (token) {
      // Có token nhưng chưa có cache user profile -> gọi getProfile
      authApi.getProfile()
        .then((res) => {
          if (res.data?.status) {
            setUser(res.data.data);
            if (res.data.data.role !== 'admin') {
              setIsNonAdminWarning(true);
            }
          }
        })
        .catch(() => {
          // Giao diện demo nếu server chưa sẵn sàng auth
        });
    } else {
      // Không có token -> cảnh báo đăng nhập
      setIsNonAdminWarning(true);
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/dang-nhap');
  };

  const navItems = [
    {
      label: 'Tổng Quan',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      match: ['/admin', '/admin/dashboard'],
    },
    {
      label: 'Người Dùng & Phân Quyền',
      path: '/admin/users',
      icon: Users,
      match: ['/admin/users'],
    },
    {
      label: 'Quản Lý Đơn Hàng',
      path: '/admin/orders',
      icon: Package,
      match: ['/admin/orders'],
    },
    {
      label: 'Về Trang Chủ Bán Hàng',
      path: '/',
      icon: ShoppingBag,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex text-[#2C241E] font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1B1816] text-[#E8E2D8] flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#2E2824]`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2E2824] flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group" title="Về trang chủ TK House">
            {/* Logo chính thức TK House (đồng bộ với Header ngoài trang bán lẻ) */}
            <img
              src="/images/logo/logo.png"
              alt="TK House Logo"
              className="h-10 sm:h-11 w-auto max-w-[46px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(201,169,130,0.25)] flex-shrink-0"
            />
            <div>
              <span className="font-serif font-bold text-sm tracking-wider text-white block uppercase leading-tight">
                TK House
              </span>
              <span className="text-[10px] text-[#C9A982] font-medium uppercase tracking-widest block mt-0.5">
                Atelier Admin
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-stone-400 hover:text-white p-1 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest px-3 mb-2">
            Quản Trị Bán Hàng
          </div>

          {navItems.map((item) => {
            const isMatch = item.match
              ? item.match.some((m) => location.pathname === m || (m !== '/admin' && location.pathname.startsWith(m)))
              : location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isMatch
                    ? 'bg-[#8C6A48] text-white shadow-sm font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2420] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isMatch ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isMatch ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.external && (
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: User & Back to site */}
        <div className="p-4 border-t border-[#2E2824] bg-[#161311] space-y-2.5">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#26201C] hover:bg-[#332B25] text-stone-300 hover:text-white text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Website Bán Hàng</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#8C6A48] text-white flex items-center justify-center font-serif text-xs font-bold flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate text-left">
                <span className="block text-xs font-medium text-white truncate">
                  {user?.name || 'Quản trị viên'}
                </span>
                <span className="block text-[10px] text-amber-400">
                  {user?.role === 'admin' ? 'Super Admin' : 'Admin Session'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#2A2420] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-stone-500 font-light">
              <Link to="/admin/orders" className="hover:text-stone-800">Admin</Link>
              <span>/</span>
              <span className="text-stone-800 font-medium">Quản lý đơn hàng</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Tag vai trò Admin */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] text-amber-800 font-medium">
              <Shield className="w-3.5 h-3.5 text-[#8C6A48]" />
              <span>TK House Management</span>
            </div>

            <Link
              to="/"
              className="text-xs text-stone-600 hover:text-[#8C6A48] font-medium flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <span>Cửa hàng</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Non-admin / Not-logged-in notice banner (vẫn cho phép demo để tiện xem & test) */}
        {isNonAdminWarning && (
          <div className="bg-amber-500/10 border-b border-amber-300/60 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Lưu ý:</strong> API quản trị yêu cầu đăng nhập tài khoản có quyền Admin. Bạn có thể đăng nhập tài khoản Admin hoặc kiểm tra giao diện trực tiếp tại đây.
              </span>
            </div>
            <Link
              to="/dang-nhap"
              className="px-3 py-1 bg-[#8C6A48] hover:bg-[#725436] text-white text-[11px] font-semibold rounded-lg shadow-2xs whitespace-nowrap transition-colors"
            >
              Đăng nhập Admin
            </Link>
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
