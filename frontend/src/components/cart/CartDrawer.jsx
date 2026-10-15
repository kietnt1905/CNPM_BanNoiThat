import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    summary,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    loading,
    selectedIds,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedItems,
    selectedSummary,
  } = useCart();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const availableItems = items.filter((item) => !item.is_out_of_stock);
  const isAllSelected = availableItems.length > 0 && selectedItems.length === availableItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleViewCart = () => {
    handleClose();
    navigate('/gio-hang');
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    handleClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop tối mờ phong cách Kinfolk */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer trượt từ bên phải */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col pointer-events-auto border-l border-[#E8E2D8]"
            >
              {/* 1. Header của Drawer */}
              <div className="px-6 py-5 bg-white border-b border-[#E8E2D8] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#E5DACD] flex items-center justify-center text-[#8C6A48]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-normal tracking-wide text-neutral-900 uppercase">
                      Giỏ Hàng Kiến Trúc
                    </h2>
                    <p className="text-[11px] text-neutral-500 font-light">
                      {summary.total_items} tác phẩm được tuyển chọn
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Đóng giỏ hàng"
                >
                  <X className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>

              {/* 2. Thông báo ưu đãi vận chuyển */}
              <div className="bg-[#F5F1EB] px-6 py-2.5 border-b border-[#E8E2D8] flex items-center space-x-2 text-xs text-[#8C6A48]">
                <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">Miễn phí giao hàng & lắp đặt tận nơi toàn quốc</span>
              </div>

              {/* 2.1. Thanh Chọn tất cả sản phẩm */}
              {!isEmpty && (
                <div className="bg-[#FAF8F5] px-6 py-2.5 border-b border-[#E8E2D8] flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-[#D1C7BA] text-[#8C6A48] focus:ring-[#8C6A48] cursor-pointer accent-[#8C6A48]"
                    />
                    <span className="font-medium text-neutral-800">
                      Chọn tất cả ({selectedItems.length}/{availableItems.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-[11px] text-[#8C6A48] font-mono font-medium">
                      {selectedSummary.total_amount_display}
                    </span>
                  )}
                </div>
              )}

              {/* 3. Danh sách sản phẩm trong giỏ */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {isEmpty ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-neutral-400 shadow-sm">
                      <ShoppingBag className="w-7 h-7 stroke-[1.25]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-normal text-neutral-900">
                        Giỏ hàng của bạn đang trống
                      </h3>
                      <p className="text-xs text-neutral-500 font-light max-w-xs leading-relaxed">
                        Hãy khám phá những kiệt tác nội thất thủ công chuẩn mực để tô điểm cho không gian sống của bạn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        navigate('/san-pham');
                      }}
                      className="mt-2 px-6 py-2.5 rounded-full bg-[#8C6A48] hover:bg-[#734b2f] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                      Khám phá bộ sưu tập
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 divide-y divide-[#E8E2D8]/60">
                    {items.map((item, idx) => {
                      const itemKey = item.id || `variant-${item.variant_id}-${idx}`;
                      const isOutOfStock = item.is_out_of_stock;
                      const exceedsStock = item.exceeds_stock;
                      const isChecked = selectedIds.includes(item.variant_id);

                      return (
                        <div key={itemKey} className="pt-3.5 first:pt-0 flex space-x-3 group items-center">
                          {/* Checkbox chọn sản phẩm */}
                          <div className="flex items-center justify-center pt-0.5">
                            <input
                              type="checkbox"
                              disabled={isOutOfStock}
                              checked={isChecked}
                              onChange={() => toggleSelectItem(item.variant_id)}
                              className="w-4 h-4 rounded border-[#D1C7BA] text-[#8C6A48] focus:ring-[#8C6A48] cursor-pointer accent-[#8C6A48] disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Chọn sản phẩm'}
                            />
                          </div>

                          {/* Ảnh sản phẩm */}
                          <Link
                            to={`/san-pham/${item.product_slug || item.product_id}`}
                            onClick={handleClose}
                            className="w-20 h-20 rounded-xl bg-white border border-[#E8E2D8] overflow-hidden flex-shrink-0 relative group-hover:border-[#8C6A48] transition-colors"
                          >
                            <img
                              src={item.thumbnail || item.image || '/images/products/sofa-3-cho-victoria.jpg'}
                              alt={item.product_name}
                              className="w-full h-full object-cover object-center"
                            />
                          </Link>

                          {/* Thông tin sản phẩm */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  to={`/san-pham/${item.product_slug || item.product_id}`}
                                  onClick={handleClose}
                                  className="font-serif text-xs sm:text-sm font-medium text-neutral-900 hover:text-[#8C6A48] transition-colors leading-snug line-clamp-1"
                                >
                                  {item.product_name}
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item)}
                                  className="text-neutral-400 hover:text-rose-600 p-1 -mr-1 rounded-md transition-colors"
                                  title="Xóa khỏi giỏ"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                                </button>
                              </div>

                              {/* Biến thể: Màu sắc, Chất liệu, Kích thước */}
                              <div className="mt-1 flex flex-wrap gap-1 text-[10.5px] text-neutral-500 font-light">
                                {item.color && (
                                  <span className="bg-white border border-[#E8E2D8] px-2 py-0.5 rounded">
                                    {item.color}
                                  </span>
                                )}
                                {item.material && (
                                  <span className="bg-white border border-[#E8E2D8] px-2 py-0.5 rounded truncate max-w-[120px]">
                                    {item.material}
                                  </span>
                                )}
                                {item.dimensions && (
                                  <span className="bg-white border border-[#E8E2D8] px-2 py-0.5 rounded font-mono text-[9.5px]">
                                    {item.dimensions}
                                  </span>
                                )}
                              </div>

                              {/* Cảnh báo kho */}
                              {isOutOfStock && (
                                <p className="mt-1 flex items-center space-x-1 text-[10.5px] text-rose-600 font-medium">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                  <span>Tạm thời hết hàng</span>
                                </p>
                              )}
                              {exceedsStock && !isOutOfStock && (
                                <p className="mt-1 flex items-center space-x-1 text-[10.5px] text-amber-600 font-medium">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                  <span>Tồn kho chỉ còn {item.stock_quantity}</span>
                                </p>
                              )}
                            </div>

                            {/* Cụm điều chỉnh số lượng & Giá tiền */}
                            <div className="mt-2.5 flex items-center justify-between pt-1">
                              {/* Bộ tăng giảm số lượng */}
                              <div className="flex items-center border border-[#E8E2D8] rounded-lg bg-white overflow-hidden shadow-xs">
                                <button
                                  type="button"
                                  disabled={loading || item.quantity <= 1}
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F0] hover:text-[#8C6A48] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                  title="Giảm số lượng"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-semibold font-mono text-neutral-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={loading || (item.stock_quantity && item.quantity >= item.stock_quantity)}
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-[#FAF6F0] hover:text-[#8C6A48] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                  title="Tăng số lượng"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Thành tiền */}
                              <div className="text-right">
                                <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-900">
                                  {item.line_total_display || item.price_display}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="block text-[10px] text-neutral-400 font-mono">
                                    {item.price_display} / chiếc
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Footer của Drawer */}
              {!isEmpty && (
                <div className="p-6 bg-white border-t border-[#E8E2D8] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  {/* Tạm tính & Tổng cộng */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Đã chọn ({selectedSummary.total_items} món):</span>
                      <span className="font-mono text-neutral-800 font-medium">
                        {selectedSummary.total_amount_display}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Vận chuyển & Lắp đặt:</span>
                      <span className="text-emerald-700 font-semibold uppercase text-[10.5px]">
                        Miễn phí
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#E8E2D8] flex items-baseline justify-between">
                      <span className="font-serif text-sm font-medium text-neutral-900">
                        Tổng thanh toán:
                      </span>
                      <span className="font-mono text-lg font-bold text-neutral-900">
                        {selectedSummary.total_amount_display}
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleViewCart}
                      className="w-full py-3 rounded-xl border border-[#2C241E] text-[#2C241E] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center"
                    >
                      Xem giỏ hàng
                    </button>
                    <button
                      type="button"
                      disabled={selectedItems.length === 0}
                      onClick={handleCheckout}
                      className="w-full py-3 rounded-xl bg-[#2C241E] hover:bg-[#8C6A48] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>{selectedItems.length > 0 ? `Thanh toán (${selectedSummary.total_items})` : 'Chọn sản phẩm'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cam kết tiêu chuẩn TK House */}
                  <div className="flex items-center justify-center space-x-3 text-[10.5px] text-neutral-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A48]" />
                      <span>Bảo hành 5 năm</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <RotateCcw className="w-3.5 h-3.5 text-[#8C6A48]" />
                      <span>Đổi trả 30 ngày</span>
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
