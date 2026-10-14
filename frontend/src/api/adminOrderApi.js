import axiosClient from './axiosClient';

/**
 * API Quản trị Đơn hàng (Dành cho trang Admin)
 * Yêu cầu đăng nhập tài khoản có role = 'admin' (token gửi kèm qua Bearer Header)
 */
const adminOrderApi = {
  /**
   * Lấy danh sách đơn hàng có bộ lọc, tìm kiếm, phân trang
   * @param {Object} params { status, payment_status, payment_method, search, date_from, date_to, sort, page, per_page }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/admin/orders', { params });
  },

  /**
   * Lấy chi tiết 1 đơn hàng theo ID hoặc Order Code
   * @param {string|number} id
   */
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
   * Lấy số liệu thống kê doanh thu và báo cáo biểu đồ 7 ngày gần nhất
   */
  getStatistics: () => {
    return axiosClient.get('/admin/orders/statistics');
  },
};

export default adminOrderApi;
