import axiosClient from './axiosClient';

/**
 * API Giỏ hàng kết nối trực tiếp với Laravel Backend
 */
const cartApi = {
  /**
   * Lấy giỏ hàng của người dùng đã đăng nhập (cần token)
   * GET /api/cart
   */
  getCart: () => {
    return axiosClient.get('/cart');
  },

  /**
   * Thêm sản phẩm (theo variant_id) vào giỏ hàng
   * POST /api/cart/add
   * @param {number} variant_id
   * @param {number} quantity
   */
  addItem: (variant_id, quantity = 1) => {
    return axiosClient.post('/cart/add', {
      variant_id: Number(variant_id),
      quantity: Number(quantity),
    });
  },

  /**
   * Cập nhật số lượng của 1 mục trong giỏ hàng
   * PUT /api/cart/items/{id}
   * @param {number} id - cart_item_id
   * @param {number} quantity
   */
  updateItem: (id, quantity) => {
    return axiosClient.put(`/cart/items/${id}`, {
      quantity: Number(quantity),
    });
  },

  /**
   * Xóa 1 mục khỏi giỏ hàng
   * DELETE /api/cart/items/{id}
   * @param {number} id - cart_item_id
   */
  removeItem: (id) => {
    return axiosClient.delete(`/cart/items/${id}`);
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   * DELETE /api/cart/clear
   */
  clearCart: () => {
    return axiosClient.delete('/cart/clear');
  },

  /**
   * Xem trước và tính toán giỏ hàng cho Khách vãng lai (Guest - Public route)
   * POST /api/cart/guest-preview
   * @param {Array<{variant_id: number, quantity: number}>} items
   */
  previewGuestCart: (items) => {
    return axiosClient.post('/cart/guest-preview', {
      items: Array.isArray(items) ? items : [],
    });
  },

  /**
   * Đồng bộ giỏ hàng từ Guest (LocalStorage) vào tài khoản khi người dùng Đăng nhập
   * POST /api/cart/sync
   * @param {Array<{variant_id: number, quantity: number}>} items
   */
  syncCart: (items) => {
    return axiosClient.post('/cart/sync', {
      items: Array.isArray(items) ? items : [],
    });
  },
};

export default cartApi;
