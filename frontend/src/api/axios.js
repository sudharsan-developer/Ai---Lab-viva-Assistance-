import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach JWT token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vivaToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — clear session and redirect to home
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vivaToken');
      localStorage.removeItem('vivaUser');
      localStorage.removeItem('vivaRole');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
