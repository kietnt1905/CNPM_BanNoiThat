import axiosClient from './axiosClient';

/**
 * API Quản trị Đơn hàng (Dành cho trang Admin)
 * Yêu cầu tài khoản có vai trò 'admin' (Bearer token được gắn tự động qua axiosClient)
 */
const adminOrderApi = {
  /**
   * Lấy danh sách đơn hàng có bộ lọc, tìm kiếm, phân trang
   * @param {Object} params { status, payment_status, payment_method, search, date_from, date_to, sort, page, per_page }
   */
  getOrders: (params = {}) => {
    return axiosClient.get('/admin/orders', { params });
  },

  // Alias để tương thích cả 2 chuẩn gọi getAll / getOrders
  getAll: (params = {}) => {
    return axiosClient.get('/admin/orders', { params });
  },

  /**
   * Lấy chi tiết 1 đơn hàng theo ID hoặc Order Code (mã đơn)
   * @param {string|number} id
   */
  getOrderDetail: (id) => {
    return axiosClient.get(`/admin/orders/${id}`);
  },

  // Alias để tương thích cả 2 chuẩn gọi getById / getOrderDetail
  getById: (id) => {
    return axiosClient.get(`/admin/orders/${id}`);
  },

  /**
   * Cập nhật trạng thái đơn hàng (pending, confirmed, shipping, completed, cancelled)
   * @param {string|number} id
   * @param {Object} data { status: string, admin_note?: string }
   */
  updateStatus: (id, data) => {
    return axiosClient.patch(`/admin/orders/${id}/status`, data);
  },

  /**
   * Cập nhật trạng thái thanh toán (pending, success, failed, refunded)
   * @param {string|number} id
   * @param {Object} data { payment_status: string, transaction_code?: string }
   */
  updatePaymentStatus: (id, data) => {
    return axiosClient.patch(`/admin/orders/${id}/payment-status`, data);
  },

  /**
   * Lấy số liệu thống kê doanh thu và báo cáo 7 ngày gần nhất
   */
  getStatistics: () => {
    return axiosClient.get('/admin/orders/statistics');
  },
};

export default adminOrderApi;
