import axiosClient from './axiosClient';

const paymentApi = {
  /**
   * Đối soát và xác thực kết quả trả về từ VNPAY Return URL
   * @param {Object|URLSearchParams} params Query params do VNPay chuyển hướng về
   */
  verifyVNPayCallback: (params) => {
    return axiosClient.get('/payment/vnpay/callback', { params });
  },
};

export default paymentApi;
