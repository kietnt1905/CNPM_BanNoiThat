import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowUp, Phone, MessageCircle, Home } from 'lucide-react';

export default function MainLayout() {
  const { pathname } = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Tự động cuộn lên đầu trang khi chuyển route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hiển thị nút cuộn lên đầu trang khi scroll > 350px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#222222] font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* 1. Header chính */}
      <Header />

      {/* 2. Main Content (Outlet chứa các trang con như Home, Shop, Product Detail, Cart...) */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* 3. Footer chân trang */}
      <Footer />

      {/* 4. TIỆN ÍCH NỔI HIỆN ĐẠI (FLOATING LUXURY DOCK) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center space-y-2.5">
        {/* Nút Quay lại Trang Chủ (Hiện đại & tiện lợi) */}
        <Link
          to="/"
          className="group relative flex items-center justify-center w-12 h-12 bg-white/95 text-stone-800 border border-stone-200/90 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.12)] hover:bg-stone-900 hover:text-amber-400 hover:border-stone-900 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Quay lại Trang Chủ"
        >
          <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="absolute right-14 bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0 border border-stone-700/50">
            Quay lại Trang Chủ
          </span>
        </Link>

        {/* Nút Hotline gọi nhanh */}
        <a
          href="tel:18007200"
          className="group relative flex items-center justify-center w-12 h-12 bg-stone-900 text-white rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:bg-stone-800 transition-all duration-300 hover:scale-105 active:scale-95 border border-stone-800"
          title="Gọi Hotline 1800 7200"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <Phone className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute right-14 bg-stone-900/95 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0 border border-stone-700/50">
            Hotline: 1800 7200
          </span>
        </a>

        {/* Nút Zalo Chat nổi */}
        <a
          href="https://zalo.me/18007200"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 bg-[#0068ff] text-white rounded-full shadow-[0_8px_25px_rgba(0,104,255,0.3)] hover:bg-[#0058db] transition-all duration-300 hover:scale-105 active:scale-95 border border-blue-400/30"
          title="Chat qua Zalo"
        >
          <span className="font-bold text-[12px] tracking-tight">Zalo</span>
          <span className="absolute right-14 bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0 border border-stone-700/50">
            Chat tư vấn Zalo
          </span>
        </a>

        {/* Nút Cuộn lên đầu trang (Back to top) */}
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="group relative flex items-center justify-center w-11 h-11 bg-white text-stone-800 border border-stone-300/80 rounded-full shadow-lg hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 focus:outline-none hover:scale-105 active:scale-95"
            aria-label="Cuộn lên đầu trang"
            title="Lên đầu trang"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="absolute right-14 bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0 border border-stone-700/50">
              Lên đầu trang
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
