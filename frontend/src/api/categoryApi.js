import axiosClient from './axiosClient';

const categoryApi = {
  // Lấy danh sách toàn bộ danh mục sản phẩm kèm số lượng sản phẩm
  getAll: () => {
    return axiosClient.get('/categories');
  },

  // Lấy chi tiết một danh mục theo ID hoặc slug
  getByIdOrSlug: (idOrSlug) => {
    return axiosClient.get(`/categories/${idOrSlug}`);
  },
};

export default categoryApi;
