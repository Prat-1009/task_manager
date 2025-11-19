import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE || '/api';
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
