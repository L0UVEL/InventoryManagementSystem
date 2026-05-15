import axios from 'axios';

// In development, Vite's proxy handles /api → http://localhost:8080
// In production, configure the baseURL to your deployed backend
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: attach JWT token from localStorage on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: auto-redirect to login on 401/403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid — clear and redirect
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
