import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Interceptor for uniform error reporting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const apiService = {
  // System Health
  getHealth: () => apiClient.get('/health'),

  // Predictive ML Inference
  predictChurn: (customerData) => apiClient.post('/predict', customerData),

  // Recent Predictions
  getPredictions: (params = {}) => apiClient.get('/predictions', { params }),

  // Customer Management & Explorer
  getCustomers: (params = {}) => apiClient.get('/customers', { params }),
  getCustomerDetails: (customerId) => apiClient.get(`/customers/${customerId}`),
  seedCustomers: (limit = 500) => apiClient.post(`/customers/seed?limit=${limit}`),

  // Business Analytics & KPIs
  getAnalytics: () => apiClient.get('/analytics'),

  // Trained Model Metadata, Confusion Matrix & SHAP
  getModelMetadata: () => apiClient.get('/model/metadata'),
};

export default apiService;
