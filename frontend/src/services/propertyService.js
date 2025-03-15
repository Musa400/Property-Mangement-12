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

export const propertyService = {
  // Get all properties
  getAllProperties: async () => {
    try {
      const response = await api.get('/properties');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching properties:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching property:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new property
  createProperty: async (propertyData) => {
    try {
      // Add the current user's ID to the property data
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Authentication required. Please log in.');
      }

      // Transform property data to match backend schema
      const transformedData = {
        title: propertyData.title?.trim(),
        province: propertyData.province?.trim(),
        description: propertyData.description?.trim(),
        address: propertyData.address?.trim(),
        type: propertyData.type?.trim(),  // Ensure type is properly handled
        size: propertyData.size ? Number(propertyData.size) : undefined,
        propertyValue: propertyData.propertyValue ? Number(propertyData.propertyValue) : null,
        status: propertyData.status || 'vacant',
        location: {
          latitude: Number(propertyData.location.latitude),
          longitude: Number(propertyData.location.longitude),
          neighborhood: propertyData.location.neighborhood?.trim() || '',
          city: propertyData.location.city?.trim() || '',
          country: propertyData.location.country?.trim() || ''
        },
        securityClearanceLevel: propertyData.securityClearanceLevel || 'restricted',
        createdBy: userId
      };

      // Additional validation for type field
      if (!transformedData.type) {
        throw new Error('Property type is required');
      }

      // Validate against allowed types
      const validTypes = ['تجارتی', 'تاسيسات', 'للمی', 'زراعتی', 'office', 'warehouse', 'residential', 'training', 'security'];
      if (!validTypes.includes(transformedData.type)) {
        throw new Error(`Invalid property type. Must be one of: ${validTypes.join(', ')}`);
      }

      const response = await api.post('/properties', transformedData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update an existing property
  updateProperty: async (id, propertyData) => {
    try {
      // Transform property data similar to create
      const transformedData = {
        ...propertyData,
        size: propertyData.size ? Number(propertyData.size) : undefined,
        propertyValue: propertyData.propertyValue ? Number(propertyData.propertyValue) : null,
        location: {
          ...propertyData.location,
          latitude: Number(propertyData.location.latitude),
          longitude: Number(propertyData.location.longitude)
        }
      };

      const response = await api.put(`/properties/${id}`, transformedData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating property:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a property
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error deleting property:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default propertyService;