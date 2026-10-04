import axiosClient from './axiosClient';

const authApi = {
  register: (data) => {
    return axiosClient.post('/register', {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
  },

  login: (data) => {
    return axiosClient.post('/login', {
      email: data.email,
      password: data.password,
    });
  },

  verifyOtp: (data) => {
    return axiosClient.post('/verify-otp', {
      email: data.email,
      otp: data.otp,
    });
  },

  resendOtp: (data) => {
    return axiosClient.post('/resend-otp', {
      email: data.email,
    });
  },

  getProfile: () => {
    return axiosClient.get('/profile');
  },

  logout: () => {
    return axiosClient.post('/logout');
  },
};

export default authApi;
