import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to get the authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Function to get the current user's ID from the token
const getCurrentUserId = () => {
  const token = getAuthToken();
  if (!token) {
    console.warn('No authentication token found');
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const payload = JSON.parse(window.atob(base64));
    
    console.log('Token Payload:', payload);
    return payload.id || payload.userId || payload._id;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const tenantService = {
  // Get all tenants
  getAllTenants: async () => {
    try {
      const response = await api.get('/tenants');
      console.log('Raw tenants response:', response.data);
      const tenants = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      return tenants;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Get tenant by ID
  getTenantById: async (id) => {
    try {
      const response = await api.get(`/tenants/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching tenant:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new tenant
  createTenant: async (tenantData) => {
    try {
      const response = await api.post('/tenants', tenantData);
      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update tenant information
  updateTenant: async (id, tenantData) => {
    try {
      const response = await api.put(`/tenants/${id}`, tenantData);
      return response.data;
    } catch (error) {
      console.error('Error updating tenant:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a tenant
  deleteTenant: async (id) => {
    try {
      await api.delete(`/tenants/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting tenant:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search tenants
  searchTenants: async (query) => {
    try {
      const response = await api.get(`/tenants/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching tenants:', error);
      throw error;
    }
  },

  // Get tenant financial report
  getTenantFinancialReport: async (id) => {
    try {
      const response = await api.get(`/tenants/${id}/financial-report`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  },

  // Get total financial report
  getTotalFinancialReport: async () => {
    try {
      const response = await api.get('/tenants/financial-report/total');
      return response.data;
    } catch (error) {
      console.error('Error fetching total financial report:', error);
      throw error;
    }
  },

  // Update tenant status
  updateTenantStatus: async (id, status) => {
    try {
      const response = await api.put(`/tenants/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating tenant status:', error);
      throw error;
    }
  },

  // Update tenant to paid status
  updateTenantToPaid: async (id, paymentData) => {
    try {
      const response = await api.put(`/tenants/${id}/paid`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error updating tenant to paid status:', error);
      throw error;
    }
  }
};

export default tenantService;