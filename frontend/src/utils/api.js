import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUserById: (userId) => api.get(`/users/${userId}`),
  addPrimaryHelper: (data) => api.post('/users/primary-helper', data),
  getPrimaryHelpers: () => api.get('/users/primary-helpers'),
  updateLocation: (data) => api.put('/users/location', data),
  getNearbyHelpers: (params) => api.get('/users/nearby-helpers', { params }),
};

export const emergencyAPI = {
  createEmergency: (data) => api.post('/emergency', data),
  getActiveEmergencies: () => api.get('/emergency/active'),
  helpEmergency: (emergencyId) => api.post(`/emergency/${emergencyId}/help`),
  resolveEmergency: (emergencyId) => api.put(`/emergency/${emergencyId}/resolve`),
  getUserEmergencies: () => api.get('/emergency/user'),
};

export const chatAPI = {
  getUserChats: () => api.get('/chat'),
  getChat: (userId) => api.get(`/chat/${userId}`),
  sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
};

export const bloodAPI = {
  bookDonation: (data) => api.post('/blood/book', data),
  getUserDonations: () => api.get('/blood/donations'),
  getRequests: () => api.get('/blood/requests'),
  completeDonation: (donationId) => api.put(`/blood/${donationId}/complete`),
};

export const communityAPI = {
  createPost: (data) => api.post('/community', data),
  getPosts: (params) => api.get('/community', { params }),
  likePost: (postId) => api.post(`/community/${postId}/like`),
  addComment: (postId, data) => api.post(`/community/${postId}/comments`, data),
};

export const paymentAPI = {
  getWallet: () => api.get('/payment/wallet'),
  initiatePayment: (data) => api.post('/payment/pay', data),
};

export default api;