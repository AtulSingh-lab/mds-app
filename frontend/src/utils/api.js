import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add token (if using localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      original: error,
    };
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/auth/');
      if (!isAuthEndpoint && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(customError);
  }
);

export default api;