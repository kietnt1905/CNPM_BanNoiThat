import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import cartApi from '../api/cartApi';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'tk_guest_cart';

const DEFAULT_SUMMARY = {
  total_items: 0,
  total_unique_items: 0,
  total_amount: 0,
  total_amount_display: '0₫',
};

const DEFAULT_CART = {
  id: null,
  items: [],
  summary: DEFAULT_SUMMARY,
};

// Tự động làm sạch sản phẩm test cũ khỏi localStorage khi khởi động
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_CART_KEY);
  }
} catch {
  // ignore
}

// Helper tính toán preview cục bộ khi backend offline hoặc variant chưa có trong database
const buildLocalCartPreview = (guestItems) => {
  let totalAmount = 0;
  let totalItems = 0;

  const validItems = (guestItems || []).filter(
    (item) => item && item.product_name !== 'Sofa Băng Da Bò Ý Florence' && item.product_id !== 101
  );

  const items = validItems.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    totalItems += qty;
    const price = Number(item.price || 0);
    const itemTotal = price * qty;
    totalAmount += itemTotal;

    const variantNameParts = [item.color, item.dimensions, item.material].filter(Boolean);
    const variantName = item.variant_name || (variantNameParts.length > 0 ? variantNameParts.join(' • ') : 'Phiên bản tiêu chuẩn');

    return {
      id: item.id || `guest_${item.variant_id || idx}`,
      variant_id: item.variant_id,
      product_id: item.product_id,
      product_name: item.product_name || 'Sản phẩm nội thất',
      product_slug: item.product_slug || '',
      variant_name: variantName,
      sku: item.sku || `TK-VAR-${item.variant_id}`,
      color: item.color || '',
      material: item.material || '',
      dimensions: item.dimensions || '',
      price: price,
      price_display: `${new Intl.NumberFormat('vi-VN').format(price)}₫`,
      quantity: qty,
      total_price: itemTotal,
      total_price_display: `${new Intl.NumberFormat('vi-VN').format(itemTotal)}₫`,
      thumbnail: item.thumbnail || '/images/placeholder.jpg',
      stock_quantity: item.stock_quantity ?? 10,
      in_stock: true,
    };
  });

  return {
    id: 'guest_local_cart',
    items,
    summary: {
      total_items: totalItems,
      total_unique_items: items.length,
      total_amount: totalAmount,
      total_amount_display: `${new Intl.NumberFormat('vi-VN').format(totalAmount)}₫`,
    },
  };
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(DEFAULT_CART);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Tự động đồng bộ các ID sản phẩm được chọn khi giỏ hàng thay đổi
  useEffect(() => {
    const availableItems = (cart?.items || []).filter((item) => !item.is_out_of_stock);
    const availableIds = availableItems.map((item) => item.variant_id);

    setSelectedIds((prev) => {
      if (prev.length === 0) {
        return availableIds;
      }
      // Giữ lại các ID cũ vẫn còn hợp lệ trong giỏ
      const stillValid = prev.filter((id) => availableIds.includes(id));
      return stillValid.length > 0 ? stillValid : availableIds;
    });
  }, [cart?.items]);

  // Helper đọc guest cart từ localStorage (đã lọc bỏ sản phẩm test)
  const getGuestCartFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const validItems = Array.isArray(parsed)
        ? parsed.filter(
            (item) => item && item.product_name !== 'Sofa Băng Da Bò Ý Florence' && item.product_id !== 101
          )
        : [];
      return validItems;
    } catch {
      return [];
    }
  }, []);

  // Helper lưu guest cart vào localStorage
  const saveGuestCartToStorage = useCallback((items) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Không thể lưu giỏ hàng vào localStorage:', err);
    }
  }, []);

  // Kiểm tra trạng thái đăng nhập
  const isAuthenticated = useCallback(() => {
    return Boolean(localStorage.getItem('token'));
  }, []);

  // Tải giỏ hàng tùy theo trạng thái Auth
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        // 1. Trạng thái ĐÃ ĐĂNG NHẬP: Lấy giỏ hàng từ server
        const res = await cartApi.getCart();
        if (res.data?.status && res.data.data) {
          setCart(res.data.data);
        } else {
          setCart(DEFAULT_CART);
        }
      } else {
        // 2. Trạng thái GUEST: Lấy items từ localStorage và gọi previewGuestCart
        const guestItems = getGuestCartFromStorage();
        if (guestItems.length === 0) {
          setCart(DEFAULT_CART);
        } else {
          try {
            const res = await cartApi.previewGuestCart(guestItems);
            if (res.data?.status && res.data.data) {
              setCart(res.data.data);
            } else {
              setCart(buildLocalCartPreview(guestItems));
            }
          } catch {
            setCart(buildLocalCartPreview(guestItems));
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải giỏ hàng:', err);
      const guestItems = getGuestCartFromStorage();
      if (guestItems.length > 0) {
        setCart(buildLocalCartPreview(guestItems));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getGuestCartFromStorage]);

  // Xử lý đồng bộ giỏ hàng khi người dùng vừa đăng nhập
  const handleAuthChange = useCallback(async () => {
    if (isAuthenticated()) {
      const guestItems = getGuestCartFromStorage();
      if (guestItems.length > 0) {
        try {
          setLoading(true);
          const syncRes = await cartApi.syncCart(guestItems);
          if (syncRes.data?.status && syncRes.data.data) {
            setCart(syncRes.data.data);
            localStorage.removeItem(GUEST_CART_KEY);
          } else {
            await refreshCart();
          }
        } catch (err) {
          console.error('Lỗi khi đồng bộ giỏ hàng lên server:', err);
          await refreshCart();
        } finally {
          setLoading(false);
        }
      } else {
        await refreshCart();
      }
    } else {
      // Người dùng vừa đăng xuất: chuyển về guest cart
      await refreshCart();
    }
  }, [isAuthenticated, getGuestCartFromStorage, refreshCart]);

  // Khởi tạo và lắng nghe thay đổi đăng nhập / local storage
  useEffect(() => {
    refreshCart();

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refreshCart, handleAuthChange]);

  /**
   * Thêm sản phẩm (biến thể) vào giỏ hàng
   * @param {number} variantId
   * @param {number} quantity
   * @param {Object} options { openDrawer: true, productInfo: { ... } }
   */
  const addToCart = async (variantId, quantity = 1, options = { openDrawer: false }) => {
    setLoading(true);
    try {
      const vId = Number(variantId);
      const qty = Math.max(1, Number(quantity) || 1);
      const pInfo = options.productInfo || {};

      if (isAuthenticated()) {
        const res = await cartApi.addItem(vId, qty);
        if (res.data?.status && res.data.data) {
          setCart(res.data.data);
        } else {
          await refreshCart();
        }
      } else {
        // Cập nhật LocalStorage cho khách vãng lai
        const currentGuestItems = getGuestCartFromStorage();
        const existingIndex = currentGuestItems.findIndex((item) => Number(item.variant_id) === vId);

        let nextGuestItems;
        if (existingIndex > -1) {
          nextGuestItems = [...currentGuestItems];
          nextGuestItems[existingIndex].quantity += qty;
        } else {
          nextGuestItems = [
            ...currentGuestItems,
            {
              variant_id: vId,
              quantity: qty,
              ...pInfo,
            },
          ];
        }

        saveGuestCartToStorage(nextGuestItems);

        // Gọi preview để lấy dữ liệu chi tiết
        try {
          const previewRes = await cartApi.previewGuestCart(nextGuestItems);
          if (previewRes.data?.status && previewRes.data.data) {
            setCart(previewRes.data.data);
          } else {
            setCart(buildLocalCartPreview(nextGuestItems));
          }
        } catch {
          setCart(buildLocalCartPreview(nextGuestItems));
        }
      }

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm sản phẩm vào giỏ hàng.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật số lượng của một mục trong giỏ hàng
   * @param {number|Object} target - cart_item_id hoặc object { id, variant_id }
   * @param {number} newQuantity
   */
  const updateQuantity = async (target, newQuantity) => {
    const qty = Math.max(1, Number(newQuantity) || 1);
    setLoading(true);
    try {
      if (isAuthenticated()) {
        const itemId = typeof target === 'object' ? target.id : target;
        try {
          const res = await cartApi.updateItem(itemId, qty);
          if (res.data?.status && res.data.data) {
            setCart(res.data.data);
          }
        } catch (apiErr) {
          console.warn('API updateItem error:', apiErr.message);
        }
      } else {
        const variantId = typeof target === 'object' ? Number(target.variant_id) : Number(target);
        const currentGuestItems = getGuestCartFromStorage();
        const nextGuestItems = currentGuestItems.map((item) => {
          if (Number(item.variant_id) === variantId) {
            return { ...item, quantity: qty };
          }
          return item;
        });

        saveGuestCartToStorage(nextGuestItems);

        try {
          const previewRes = await cartApi.previewGuestCart(nextGuestItems);
          if (previewRes.data?.status && previewRes.data.data) {
            setCart(previewRes.data.data);
          } else {
            setCart(buildLocalCartPreview(nextGuestItems));
          }
        } catch {
          setCart(buildLocalCartPreview(nextGuestItems));
        }
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật số lượng.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa một mục khỏi giỏ hàng
   * @param {number|Object} target - cart_item_id hoặc object { id, variant_id }
   */
  const removeFromCart = async (target) => {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        const itemId = typeof target === 'object' ? target.id : target;
        try {
          const res = await cartApi.removeItem(itemId);
          if (res.data?.status && res.data.data) {
            setCart(res.data.data);
          }
        } catch (apiErr) {
          console.warn('API removeItem error:', apiErr.message);
        }
      } else {
        const variantId = typeof target === 'object' ? Number(target.variant_id) : Number(target);
        const currentGuestItems = getGuestCartFromStorage();
        const nextGuestItems = currentGuestItems.filter((item) => Number(item.variant_id) !== variantId);

        saveGuestCartToStorage(nextGuestItems);

        if (nextGuestItems.length === 0) {
          setCart(DEFAULT_CART);
        } else {
          try {
            const previewRes = await cartApi.previewGuestCart(nextGuestItems);
            if (previewRes.data?.status && previewRes.data.data) {
              setCart(previewRes.data.data);
            } else {
              setCart(buildLocalCartPreview(nextGuestItems));
            }
          } catch {
            setCart(buildLocalCartPreview(nextGuestItems));
          }
        }
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa sản phẩm khỏi giỏ.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  const clearAll = async () => {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        try {
          await cartApi.clearCart();
        } catch (apiErr) {
          console.warn('API clearCart error:', apiErr.message);
        }
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      setCart(DEFAULT_CART);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể làm trống giỏ hàng.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (variantId) => {
    setSelectedIds((prev) =>
      prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]
    );
  };

  const selectAllItems = () => {
    const availableIds = (cart?.items || [])
      .filter((item) => !item.is_out_of_stock)
      .map((item) => item.variant_id);
    setSelectedIds(availableIds);
  };

  const deselectAllItems = () => {
    setSelectedIds([]);
  };

  const selectedItems = useMemo(() => {
    return (cart?.items || []).filter((item) => selectedIds.includes(item.variant_id));
  }, [cart?.items, selectedIds]);

  const selectedSummary = useMemo(() => {
    const total_items = selectedItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const total_amount = selectedItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    return {
      total_items,
      total_unique_items: selectedItems.length,
      total_amount,
      total_amount_display: `${new Intl.NumberFormat('vi-VN').format(total_amount)}₫`,
    };
  }, [selectedItems]);

  /**
   * Xóa danh sách các biến thể đã đặt hàng thành công khỏi giỏ
   * @param {number[]} purchasedVariantIds
   */
  const removePurchasedItems = async (purchasedVariantIds = []) => {
    const ids = (purchasedVariantIds || []).map(Number);
    if (!isAuthenticated()) {
      const currentGuest = getGuestCartFromStorage();
      const remainingGuest = currentGuest.filter((item) => !ids.includes(Number(item.variant_id)));
      saveGuestCartToStorage(remainingGuest);
    }
    await refreshCart();
  };

  const value = {
    cart,
    summary: cart?.summary || DEFAULT_SUMMARY,
    items: cart?.items || [],
    loading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    removePurchasedItems,
    clearAll,
    refreshCart,
    selectedIds,
    setSelectedIds,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedItems,
    selectedSummary,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
}

export default CartContext;
