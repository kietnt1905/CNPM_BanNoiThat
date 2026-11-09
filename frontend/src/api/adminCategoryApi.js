import axiosClient from './axiosClient';

/**
 * Service API Quản lý Danh mục Admin (Admin Categories Management)
 * Tự động gắn Bearer Token & Base URL qua axiosClient
 * Bám sát Mục 2 & Mục 6 trong category.docs
 */
const adminCategoryApi = {
  /**
   * 1. Lấy danh sách danh mục (hỗ trợ các param: is_active, q, sort_by, sort_order, page, per_page)
   * GET /api/admin/categories
   * @param {Object} params
   */
  getAll: (params = {}) => {
    return axiosClient.get('/admin/categories', { params });
  },

  /**
   * 2. Lấy toàn bộ mảng danh mục không phân trang (dùng cho các dropdown chọn danh mục)
   * GET /api/admin/categories?all=true
   */
  getAllNoPagination: () => {
    return axiosClient.get('/admin/categories', { params: { all: true } });
  },

  /**
   * 3. Lấy chi tiết danh mục kèm 5 sản phẩm gần nhất
   * GET /api/admin/categories/${id} (hỗ trợ cả ID hoặc Slug)
   * @param {number|string} id
   */
  getById: (id) => {
    return axiosClient.get(`/admin/categories/${id}`);
  },

  /**
   * 4. Tạo mới danh mục
   * POST /api/admin/categories
   * @param {Object} data { name, slug, description, is_active }
   */
  create: (data) => {
    return axiosClient.post('/admin/categories', data);
  },

  /**
   * 5. Cập nhật thông tin danh mục
   * PUT /api/admin/categories/${id}
   * @param {number|string} id
   * @param {Object} data { name, slug, description, is_active }
   */
  update: (id, data) => {
    return axiosClient.put(`/admin/categories/${id}`, data);
  },

  /**
   * 6. Cập nhật nhanh trạng thái hiển thị (Bật / Tắt is_active)
   * PATCH /api/admin/categories/${id}/status
   * @param {number|string} id
   * @param {boolean} isActive
   */
  updateStatus: (id, isActive) => {
    return axiosClient.patch(`/admin/categories/${id}/status`, { is_active: isActive });
  },

  /**
   * 7. Xóa danh mục (Backend tự động chặn nếu còn sản phẩm liên kết)
   * DELETE /api/admin/categories/${id}
   * @param {number|string} id
   */
  delete: (id) => {
    return axiosClient.delete(`/admin/categories/${id}`);
  },

  // Aliases hỗ trợ tương thích ngược
  getCategories: (params = {}) => axiosClient.get('/admin/categories', { params }),
  getAllCategories: () => axiosClient.get('/admin/categories', { params: { all: true } }),
  getCategoryDetail: (id) => axiosClient.get(`/admin/categories/${id}`),
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
};

export const {
  getAll,
  getAllNoPagination,
  getById,
  create,
  update,
  updateStatus,
  delete: deleteCategory,
} = adminCategoryApi;

export default adminCategoryApi;
