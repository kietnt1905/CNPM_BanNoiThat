import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="thiet-ke-noi-that" element={<HomePage />} />
          <Route path="cau-chuyen-thuong-hieu" element={<HomePage />} />
          <Route path="cau-chuyen" element={<HomePage />} />
          {/* Fallback routes chuyển về HomePage */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
