import axiosClient from './axiosClient';

/**
 * API Báo cáo & Thống kê Tổng quan (Dành cho Admin Dashboard)
 * Yêu cầu tài khoản có vai trò 'admin' (Bearer token được gắn tự động qua axiosClient)
 */
const adminDashboardApi = {
  /**
   * Lấy dữ liệu tổng quan theo chu kỳ
   * @param {'7_days'|'30_days'|'12_months'} period Chu kỳ thống kê
   */
  getOverview: (period = '7_days') => {
    return axiosClient.get(`/admin/dashboard/overview?period=${period}`);
  },
};

export default adminDashboardApi;
export { adminDashboardApi };
