import axiosClient from './axiosClient';

const productApi = {
  /**
   * Lấy danh sách sản phẩm có phân trang, lọc, tìm kiếm
   * @param {Object} params { category, search, min_price, max_price, sort, page, per_page }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/products', { params });
  },

  /**
   * Lấy danh sách sản phẩm nổi bật cho HomePage
   */
  getFeatured: () => {
    return axiosClient.get('/products/featured');
  },

  /**
   * Lấy gợi ý tìm kiếm tức thì (Live Autocomplete Dropdown)
   * @param {string} query
   * @param {number} limit
   */
  getSearchSuggestions: (query, limit = 6) => {
    return axiosClient.get('/products/search-suggestions', {
      params: { q: query, limit },
    });
  },

  /**
   * Lấy chi tiết sản phẩm theo ID hoặc Slug
   * @param {string|number} idOrSlug
   */
  getByIdOrSlug: (idOrSlug) => {
    return axiosClient.get(`/products/${idOrSlug}`);
  },

  getById: (idOrSlug) => {
    return axiosClient.get(`/products/${idOrSlug}`);
  },
};

export default productApi;
