// API Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Other configuration constants can be added here
export const APP_CONFIG = {
  // Add any other app-wide configuration here
  dateFormat: 'MMM dd, yyyy',
  currency: 'USD',
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
}; 