import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log da resposta (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Log do erro
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
      url: originalRequest?.url
    });
    
    // Tratar erro de autenticação
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Remove token inválido
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirecionar para login se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }
    
    // Tratar outros erros HTTP
    if (error.response?.data?.detail) {
      return Promise.reject(new Error(error.response.data.detail));
    }
    
    // Tratar erros de rede
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Tempo limite da requisição excedido. Verifique sua conexão.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet e tente novamente.'));
    }
    
    return Promise.reject(error);
  }
);

// Métodos auxiliares para requisições específicas
export const apiHelpers = {
  // Autenticação
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  
  // Usuários
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  getBarbers: () => api.get('/users/barbeiros/list'),
  
  // Clientes
  getClients: (params = {}) => api.get('/clients', { params }),
  getClient: (id) => api.get(`/clients/${id}`),
  createClient: (clientData) => api.post('/clients', clientData),
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  deactivateClient: (id) => api.delete(`/clients/${id}`),
  
  // Serviços
  getServices: (params = {}) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  
  // Agendamentos
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  getCalendarAppointments: (year, month, barberId = null) => {
    const url = `/appointments/calendar/${year}/${month}`;
    const params = barberId ? { barbeiro_id: barberId } : {};
    return api.get(url, { params });
  },
  
  // POS
  createSale: (saleData) => api.post('/pos/sale', saleData),
  getSales: (params = {}) => api.get('/pos/sales', { params }),
  getPaymentMethods: () => api.get('/pos/payment-methods'),
  
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
};

// Configurar token inicial se existir
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
