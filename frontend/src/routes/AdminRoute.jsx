import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token) {
    return <Navigate to={`/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    user = null;
  }

  // Nếu vai trò không phải Admin hoặc tài khoản đã bị khóa
  if (!user || user.role !== 'admin' || user.is_active === false) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2C241E] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-5 shadow-sm">
          <ShieldAlert className="w-10 h-10 stroke-[1.8]" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-rose-600 font-bold mb-1">
          TRUY CẬP BỊ TỪ CHỐI • 403 FORBIDDEN
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-2.5">
          Quyền Hạn Không Đủ
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-8 leading-relaxed font-light">
          Khu vực này chỉ dành riêng cho tài khoản Quản trị viên (Admin) của TK House. Vui lòng đăng nhập bằng tài khoản có vai trò hợp lệ để tiếp tục.
        </p>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = `/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`;
            }}
            className="px-5 py-2.5 bg-white border border-[#D5CDC2] hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Đăng nhập tài khoản khác
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-[#2C241E] hover:bg-[#8C6A48] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </a>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
