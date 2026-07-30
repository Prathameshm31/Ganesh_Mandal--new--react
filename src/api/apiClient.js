import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ganeshMandalUserToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('ganeshMandalUser');
      localStorage.removeItem('ganeshMandalUserToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error) => {
  if (!error.response) {
    return 'Server is currently down. Please try again later.';
  }
  const status = error.response.status;
  if (status >= 502 && typeof error.response.data === 'string' && error.response.data.includes('<html')) {
    return 'Server is currently down. Please try again later.';
  }
  if (error.response.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.errors && typeof data.errors === 'object') {
      return Object.values(data.errors).flat().join(', ');
    }
  }
  return 'An unexpected error occurred';
};

export default apiClient;
