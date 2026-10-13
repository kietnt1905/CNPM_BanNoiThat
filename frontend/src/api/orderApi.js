import axiosClient from './axiosClient';

const orderApi = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} data { recipient_name, recipient_phone, shipping_address, payment_method, note, items, shipping_fee, discount_amount }
   */
  createOrder: (data) => {
    return axiosClient.post('/orders', data);
  },

  /**
   * Lấy danh sách đơn hàng đã mua của user đăng nhập
   * @param {Object} params { page, per_page, status }
   */
  getOrders: (params = {}) => {
    return axiosClient.get('/orders', { params });
  },

  /**
   * Lấy chi tiết đơn hàng theo ID hoặc Order Code
   * @param {string|number} id
   */
  getOrderDetail: (id) => {
    return axiosClient.get(`/orders/${id}`);
  },

  /**
   * Hủy đơn hàng (khi đơn đang ở trạng thái pending)
   * @param {string|number} id
   */
  cancelOrder: (id) => {
    return axiosClient.patch(`/orders/${id}/cancel`);
  },
};

export default orderApi;
