import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CategoryPage from './pages/CategoryPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Dedicated Auth Routes (Full split screen) */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dang-nhap" element={<AuthPage defaultMode="login" />} />
        <Route path="/dang-ky" element={<AuthPage defaultMode="register" />} />
        <Route path="/login" element={<AuthPage defaultMode="login" />} />

        {/* Main Store Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sofa-ban-tra" element={<CategoryPage categoryId="02" />} />
          <Route path="ban-an" element={<CategoryPage categoryId="01" />} />
          <Route path="ban-lam-viec" element={<CategoryPage categoryId="03" />} />
          <Route path="ghe-thu-gian" element={<CategoryPage categoryId="04" />} />
          <Route path="san-pham" element={<CategoryPage categoryId="02" />} />
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
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
