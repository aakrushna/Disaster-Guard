import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for the token
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const token = localToken || sessionToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData)
};

// Disasters API
export const disastersAPI = {
  getAllDisasters: (filters = {}) => api.get('/disasters', { params: filters }),
  getDisasterById: (id) => api.get(`/disasters/${id}`),
  getDisastersInRadius: (lat, lng, distance) => api.get(`/disasters/radius/${lat}/${lng}/${distance}`),
  getDisasterStats: () => api.get('/disasters/stats'),
  createDisaster: (disasterData) => api.post('/disasters', disasterData),
  updateDisaster: (id, disasterData) => api.put(`/disasters/${id}`, disasterData),
  deleteDisaster: (id) => api.delete(`/disasters/${id}`)
};

export default api; 