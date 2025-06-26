import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
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
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'Error en el servidor';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/login';
  },
};

export const usuariosAPI = {
  getAll: () => api.get('/usuarios'),
  getById: (id: number) => api.get(`/usuarios/${id}`),
  create: (data: any) => api.post('/usuarios', data),
  update: (id: number, data: any) => api.put(`/usuarios/${id}`, data),
  delete: (id: number) => api.delete(`/usuarios/${id}`),
};

export const solicitudesAPI = {
  getAll: () => api.get('/solicitudes'),
  getById: (id: number) => api.get(`/solicitudes/${id}`),
  create: (data: any) => api.post('/solicitudes', data),
  updateEstado: (id: number, data: { estado: string; comentario_aprobador?: string }) =>
    api.put(`/solicitudes/${id}/estado`, data),
  delete: (id: number) => api.delete(`/solicitudes/${id}`),
};

export default api;
