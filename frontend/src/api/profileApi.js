import axiosClient from './axiosClient';

/**
 * API Quản lý hồ sơ cá nhân và mật khẩu
 * Theo chuẩn backend TK House (THINH_FRONTEND_GUIDE.md)
 */
const profileApi = {
  /**
   * Lấy thông tin hồ sơ người dùng đăng nhập
   * Endpoint: GET /api/profile
   */
  getProfile: () => {
    return axiosClient.get('/profile');
  },

  /**
   * Cập nhật thông tin hồ sơ (name, phone, address)
   * Endpoint: PUT /api/profile
   * @param {Object} data { name, phone, address }
   */
  updateProfile: (data) => {
    return axiosClient.put('/profile', data);
  },

  /**
   * Đổi mật khẩu tài khoản
   * Endpoint: PUT /api/profile/change-password
   * @param {Object} data { current_password, new_password, new_password_confirmation }
   */
  changePassword: (data) => {
    return axiosClient.put('/profile/change-password', data);
  },
};

export default profileApi;
