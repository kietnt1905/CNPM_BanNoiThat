import axiosClient from './axiosClient';

/**
 * API Quản lý đơn hàng khách hàng (TK House)
 * Theo tài liệu THINH_FRONTEND_GUIDE.md
 */
const orderApi = {
  /**
   * Tạo đơn hàng mới (Checkout)
   * @param {Object} data { recipient_name, recipient_phone, shipping_address, payment_method, note, items, shipping_fee, discount_amount }
   */
  createOrder: (data) => {
    return axiosClient.post('/orders', data);
  },

  /**
   * Thống kê số lượng đơn theo từng trạng thái (dùng cho badge trên Tabs)
   * Endpoint: GET /api/orders/counts
   */
  getOrderCounts: () => {
    return axiosClient.get('/orders/counts');
  },

  /**
   * Lấy danh sách đơn hàng của khách hàng (hỗ trợ lọc status, search/q, page, per_page)
   * Endpoint: GET /api/orders
   * @param {Object} params { status, search, q, page, per_page }
   */
  getMyOrders: (params = {}) => {
    return axiosClient.get('/orders', { params });
  },

  /**
   * Alias tương thích ngược cho getMyOrders
   */
  getOrders: (params = {}) => {
    return axiosClient.get('/orders', { params });
  },

  /**
   * Lấy chi tiết 1 đơn hàng theo ID hoặc Order Code
   * Endpoint: GET /api/orders/{idOrCode}
   * @param {string|number} idOrCode
   */
  getOrderDetail: (idOrCode) => {
    return axiosClient.get(`/orders/${idOrCode}`);
  },

  /**
   * Khách hàng tự hủy đơn hàng (khi đơn đang ở trạng thái pending)
   * Endpoint: PATCH /api/orders/{idOrCode}/cancel
   * @param {string|number} idOrCode
   * @param {string} [reason] Lý do hủy đơn (tùy chọn)
   */
  cancelOrder: (idOrCode, reason = '') => {
    const payload = reason ? { reason } : {};
    return axiosClient.patch(`/orders/${idOrCode}/cancel`, payload);
  },
};

export default orderApi;
