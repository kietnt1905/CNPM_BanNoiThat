import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import CategoryPage, { PRODUCTS_CATALOG } from './pages/CategoryPage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartContext';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './routes/AdminRoute';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ProductsPage from './pages/admin/ProductsPage';

const KNOWN_CATEGORY_SLUGS = [
  'ban-an',
  'sofa-ban-tra',
  'phong-khach',
  'phong-an',
  'ban-lam-viec',
  'ghe-thu-gian',
  'phong-ngu',
  'giuong-ngu',
  'ban',
  'sofa',
  'ban-tra',
  'ghe-an',
  'sofa-da',
  'sofa-vai',
  'ban-trang-diem',
  'den-trang-tri',
  'tu-ke',
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-[#2C241E]">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-stone-200">
            <h2 className="font-serif text-2xl mb-3 text-[#8C6A48]">Nội Thất TK House</h2>
            <p className="text-sm text-stone-600 mb-6 font-light">
              Trang web đang được tải lại để cập nhật phiên bản mới nhất.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => (window.location.href = '/')}
                className="px-5 py-2.5 bg-[#2C241E] text-white text-xs font-medium uppercase tracking-wider rounded-full hover:bg-[#8C6A48] transition-colors"
              >
                Về Trang Chủ
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#8C6A48] text-white text-xs font-medium uppercase tracking-wider rounded-full hover:bg-[#725436] transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProductOrCategoryRoute() {
  const params = useParams();
  const raw = params.idOrSlug || params.categorySlug || params['*'];
  let slug = '';
  try {
    slug = raw ? decodeURIComponent(raw).trim().toLowerCase().replace(/\s+/g, '-') : '';
  } catch {
    slug = raw ? String(raw).trim().toLowerCase().replace(/\s+/g, '-') : '';
  }

  // Nếu param là category slug đã biết -> CategoryPage
  if (slug && KNOWN_CATEGORY_SLUGS.includes(slug)) {
    return <CategoryPage />;
  }

  // Ngược lại (ID hoặc slug sản phẩm) -> ProductDetailPage
  return <ProductDetailPage />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Dedicated Auth Routes (Full split screen) */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dang-nhap" element={<AuthPage defaultMode="login" />} />
        <Route path="/dang-ky" element={<AuthPage defaultMode="register" />} />
        <Route path="/login" element={<AuthPage defaultMode="login" />} />

        {/* Admin Management Routes (Protected by AdminRoute) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tong-quan" element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="danh-muc" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="san-pham" element={<ProductsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="nguoi-dung" element={<UsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrdersPage />} />
          <Route path="don-hang" element={<AdminOrdersPage />} />
          <Route path="don-hang/:id" element={<AdminOrdersPage />} />
        </Route>

        {/* Main Store Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="gio-hang" element={<CartPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="thanh-toan" element={<CheckoutPage />} />
          <Route path="checkout" element={<CheckoutPage />} />

          <Route path="sofa-ban-tra" element={<CategoryPage categoryId="02" />} />
          <Route path="phong-khach" element={<CategoryPage categoryId="02" />} />
          <Route path="ban-an" element={<CategoryPage categoryId="01" />} />
          <Route path="phong-an" element={<CategoryPage categoryId="01" />} />
          <Route path="ban-lam-viec" element={<CategoryPage categoryId="03" />} />
          <Route path="ghe-thu-gian" element={<CategoryPage categoryId="04" />} />
          <Route path="phong-ngu" element={<CategoryPage categoryId="05" />} />
          <Route path="giuong-ngu" element={<CategoryPage categoryId="05" />} />

          {/* Đường dẫn sản phẩm */}
          <Route path="san-pham" element={<CategoryPage />} />
          <Route path="tim-kiem" element={<CategoryPage />} />
          <Route path="search" element={<CategoryPage />} />
          <Route path="san-pham-moi" element={<CategoryPage />} />
          <Route path="san pham" element={<CategoryPage />} />
          <Route path="san-pham/chi-tiet/:idOrSlug" element={<ProductDetailPage />} />
          <Route path="san-pham/chi-tiet/:id" element={<ProductDetailPage />} />
          <Route path="chi-tiet-san-pham/:idOrSlug" element={<ProductDetailPage />} />
          <Route path="chi-tiet-san-pham/:id" element={<ProductDetailPage />} />
          <Route path="san-pham/:idOrSlug" element={<ProductOrCategoryRoute />} />
          <Route path="san-pham/:categorySlug" element={<ProductOrCategoryRoute />} />
          <Route path="san pham/:idOrSlug" element={<ProductOrCategoryRoute />} />
          <Route path="san pham/:categorySlug" element={<ProductOrCategoryRoute />} />
          <Route path="san-pham/*" element={<ProductDetailPage />} />
          <Route path="san pham/*" element={<ProductDetailPage />} />

          <Route path="bo-suu-tap" element={<CollectionsPage />} />
          <Route path="bo-suu-tap/:collectionSlug" element={<CollectionsPage />} />
          <Route path="thiet-ke-noi-that" element={<HomePage />} />
          <Route path="cau-chuyen-thuong-hieu" element={<HomePage />} />
          <Route path="cau-chuyen" element={<HomePage />} />
          {/* Fallback routes chuyển về HomePage */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <AnimatedRoutes />
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
