import axiosClient from './axiosClient';

/**
 * API Quản lý Người dùng & Phân quyền (Dành cho trang Admin)
 * Yêu cầu tài khoản có vai trò 'admin' (Bearer token được gắn tự động qua axiosClient)
 */
const adminUserApi = {
  /**
   * Lấy danh sách người dùng kèm bộ lọc, tìm kiếm, phân trang
   * @param {Object} params { search, role, status, tab, sort, page, per_page }
   */
  getUsers: (params = {}) => {
    return axiosClient.get('/admin/users', { params });
  },

  /**
   * Lấy chi tiết thông tin và lịch sử đơn hàng của 1 người dùng
   * @param {string|number} id
   */
  getUserDetail: (id) => {
    return axiosClient.get(`/admin/users/${id}`);
  },

  /**
   * Tạo tài khoản người dùng mới
   * @param {Object} data { name, email, phone, password, role, is_active }
   */
  createUser: (data) => {
    return axiosClient.post('/admin/users', data);
  },

  /**
   * Cập nhật thông tin tài khoản
   * @param {string|number} id
   * @param {Object} data { name, email, phone, role, is_active, password? }
   */
  updateUser: (id, data) => {
    return axiosClient.put(`/admin/users/${id}`, data);
  },

  /**
   * Cập nhật nhanh vai trò (Role: 'admin' | 'customer')
   * @param {string|number} id
   * @param {string} role
   */
  updateRole: (id, role) => {
    return axiosClient.patch(`/admin/users/${id}/role`, { role });
  },

  /**
   * Cập nhật nhanh trạng thái hoạt động (Khóa / Mở khóa)
   * @param {string|number} id
   * @param {boolean} isActive
   */
  updateStatus: (id, isActive) => {
    return axiosClient.patch(`/admin/users/${id}/status`, { is_active: isActive });
  },

  /**
   * Xóa tài khoản người dùng
   * @param {string|number} id
   */
  deleteUser: (id) => {
    return axiosClient.delete(`/admin/users/${id}`);
  },
};

export default adminUserApi;
export { adminUserApi };
