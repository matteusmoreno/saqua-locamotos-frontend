import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://152.67.34.202:9292';

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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch event so AuthContext can clear React state without a hard page reload
      window.dispatchEvent(new Event('saqua:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
