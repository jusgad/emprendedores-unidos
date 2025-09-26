import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {\n  login: (credentials) => api.post('/auth/login', credentials),\n  register: (userData) => api.post('/auth/register', userData),\n  getProfile: () => api.get('/auth/profile'),\n  updateProfile: (profileData) => api.put('/auth/profile', profileData),\n  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),\n  refreshToken: () => api.post('/auth/refresh-token')\n};\n\nexport const productsAPI = {\n  getAll: (params) => api.get('/products', { params }),\n  getById: (id) => api.get(`/products/${id}`),\n  getByCategory: (category, params) => api.get(`/products/categoria/${category}`, { params }),\n  getMyProducts: (params) => api.get('/products/my-products', { params }),\n  create: (productData) => api.post('/products', productData),\n  update: (id, productData) => api.put(`/products/${id}`, productData),\n  delete: (id) => api.delete(`/products/${id}`)\n};\n\nexport const tiendasAPI = {\n  getAll: (params) => api.get('/tiendas', { params }),\n  getById: (id) => api.get(`/tiendas/${id}`),\n  getByUrl: (url) => api.get(`/tiendas/url/${url}`),\n  getMyTienda: () => api.get('/tiendas/my-tienda'),\n  getStats: () => api.get('/tiendas/stats'),\n  updateMyTienda: (tiendaData) => api.put('/tiendas/my-tienda', tiendaData)\n};\n\nexport const pedidosAPI = {\n  getMyPedidos: (params) => api.get('/pedidos/my-pedidos', { params }),\n  getVentas: (params) => api.get('/pedidos/ventas', { params }),\n  getById: (id) => api.get(`/pedidos/${id}`),\n  create: (pedidoData) => api.post('/pedidos', pedidoData),\n  updateEstado: (id, estadoData) => api.put(`/pedidos/${id}/estado`, estadoData)\n};\n\nexport const socialAPI = {\n  getFeed: (params) => api.get('/social/feed', { params }),\n  getMyPosts: (params) => api.get('/social/my-posts', { params }),\n  getPostById: (id) => api.get(`/social/posts/${id}`),\n  createPost: (postData) => api.post('/social/posts', postData),\n  likePost: (id) => api.post(`/social/posts/${id}/like`),\n  addComment: (id, commentData) => api.post(`/social/posts/${id}/comment`, commentData),\n  followTienda: (tiendaId) => api.post(`/social/follow/${tiendaId}`),\n  deletePost: (id) => api.delete(`/social/posts/${id}`)\n};\n\nexport const pagosAPI = {\n  createPaymentIntent: (pedidoData) => api.post('/pagos/create-payment-intent', pedidoData),\n  confirmPayment: (paymentData) => api.post('/pagos/confirm-payment', paymentData),\n  getHistory: (params) => api.get('/pagos/history', { params }),\n  refund: (refundData) => api.post('/pagos/refund', refundData)\n};\n\nexport const uploadAPI = {\n  uploadImage: (formData) => {\n    return api.post('/upload/image', formData, {\n      headers: {\n        'Content-Type': 'multipart/form-data',\n      },\n    });\n  },\n  uploadImages: (formData) => {\n    return api.post('/upload/images', formData, {\n      headers: {\n        'Content-Type': 'multipart/form-data',\n      },\n    });\n  }\n};\n\nexport default api;