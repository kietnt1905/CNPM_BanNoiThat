import axiosClient from './axiosClient';

/**
 * Service API Quản lý Sản phẩm Admin (Admin Products Management)
 * Tự động gắn Bearer Token & Base URL qua axiosClient
 * Bám sát Mục 2 & Mục 6 trong products.docs
 */
const adminProductApi = {
  /**
   * 1. Lấy danh sách sản phẩm (kèm bộ lọc, thống kê tabs, phân trang)
   * GET /api/admin/products
   * @param {Object} params { category_id, is_active, stock_status, q, sort_by, sort_order, page, per_page }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/admin/products', { params });
  },

  /**
   * 2. Lấy chi tiết sản phẩm theo ID hoặc Slug (toàn bộ ảnh, biến thể, số lượng đã bán)
   * GET /api/admin/products/${id}
   * @param {number|string} id
   */
  getById: (id) => {
    return axiosClient.get(`/admin/products/${id}`);
  },

  /**
   * 3. Tạo mới sản phẩm kèm biến thể & hình ảnh (Database Transaction)
   * POST /api/admin/products
   * @param {Object} data { category_id, name, slug, brand, warranty_months, description, is_active, images, variants }
   */
  create: (data) => {
    return axiosClient.post('/admin/products', data);
  },

  /**
   * 4. Cập nhật sản phẩm, đồng bộ hình ảnh và các biến thể
   * PUT /api/admin/products/${id}
   * @param {number|string} id
   * @param {Object} data { category_id, name, slug, brand, warranty_months, description, is_active, images, variants }
   */
  update: (id, data) => {
    return axiosClient.put(`/admin/products/${id}`, data);
  },

  /**
   * 5. Bật / Tắt nhanh trạng thái hiển thị của sản phẩm (is_active: true | false)
   * PATCH /api/admin/products/${id}/status
   * @param {number|string} id
   * @param {boolean} isActive
   */
  updateStatus: (id, isActive) => {
    return axiosClient.patch(`/admin/products/${id}/status`, { is_active: isActive });
  },

  /**
   * 6. Cập nhật nhanh số lượng tồn kho của một biến thể
   * PATCH /api/admin/products/${productId}/variants/${variantId}/stock
   * @param {number|string} productId
   * @param {number|string} variantId
   * @param {number} stockQuantity
   */
  updateVariantStock: (productId, variantId, stockQuantity) => {
    return axiosClient.patch(
      `/admin/products/${productId}/variants/${variantId}/stock`,
      { stock_quantity: stockQuantity }
    );
  },

  /**
   * 7. Xóa sản phẩm (Backend tự động chặn xóa nếu đã có đơn hàng)
   * DELETE /api/admin/products/${id}
   * @param {number|string} id
   */
  delete: (id) => {
    return axiosClient.delete(`/admin/products/${id}`);
  },

  /**
   * 8. Upload hình ảnh sản phẩm từ máy tính lên server
   * POST /api/admin/products/upload-image
   * @param {File} imageFile
   */
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return axiosClient.post('/admin/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Aliases hỗ trợ tương thích ngược với tài liệu products.docs
  getProducts: (params = {}) => axiosClient.get('/admin/products', { params }),
  getProductDetail: (id) => axiosClient.get(`/admin/products/${id}`),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
};

export const {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  updateVariantStock,
  delete: deleteProduct,
  uploadImage,
} = adminProductApi;

export default adminProductApi;
