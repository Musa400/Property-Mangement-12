import axios from 'axios';
import { API_BASE_URL } from '../config';

class RentPaymentService {
  constructor() {
    // Configure axios to send cookies with requests
    axios.defaults.withCredentials = true;

    // Set default authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Initialize interceptors
    this.setupAxiosInterceptors();
  }

  // Get authentication token
  getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    return token;
  }

  // Set authentication token
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set successfully:', token.substring(0, 20) + '...');
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      console.log('Token removed');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    try {
      const token = this.getAuthToken();
      const user = localStorage.getItem('user');
      if (!token || !user) {
        console.warn('Authentication check failed:', { hasToken: !!token, hasUser: !!user });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current user data
  getCurrentUser() {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        return null;
      }
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  // Function to initialize session
  initializeSession(token, userData) {
    try {
      if (!token || !userData) {
        throw new Error('Token and user data are required');
      }

      // Store token
      this.setAuthToken(token);
      
      // Store user data in localStorage only
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Error initializing session:', error);
      this.clearSession();
      throw error;
    }
  }

  // Interceptor to handle authentication errors
  setupAxiosInterceptors() {
    // Initialize Set to track pending requests
    this.pendingRequests = new Set();

    // Request interceptor
    axios.interceptors.request.use(
      async config => {
        try {
          const publicEndpoints = ['/auth/register', '/auth/login'];
          const url = config.url || '';
          
          if (publicEndpoints.some(endpoint => url.includes(endpoint))) {
            return config;
          }

          const token = this.getAuthToken();
          if (!token) {
            console.warn('No token available for request:', url);
            return Promise.reject(new Error('No token available'));
          }

          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
          
          // Log request details for debugging
          console.log('Request details:', {
            url,
            method: config.method,
            hasToken: !!token,
            tokenPreview: token.substring(0, 20) + '...',
            headers: config.headers
          });
          
          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          return Promise.reject(error);
        }
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      response => {
        // Log successful response
        console.log('Response received:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      async error => {
        // Log error details
        console.error('Response interceptor error:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
          headers: error.response?.headers
        });

        if (error.response?.status === 401) {
          console.warn('Received 401 Unauthorized response');
          // Log the token that was used
          const token = this.getAuthToken();
          console.log('Token used:', token ? token.substring(0, 20) + '...' : 'No token');
          
          // Clear the invalid token
          this.clearSession();
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
        return Promise.reject(error);
      }
    );
  }

  // Method to check for potential duplicate payments before submission
  async checkDuplicatePayment(paymentData) {
    try {
      console.log('🔍 Checking for duplicate payment with data:', paymentData);

      const response = await axios.post(
        `${API_BASE_URL}/rent-payments/check-duplicate`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error checking for duplicate payment:', error);
      throw error;
    }
  }

  // Enhanced createRentPayment method with transaction support
  async createRentPayment(paymentData) {
    try {
      console.log('📤 Sending payment request with data:', paymentData);
      console.log('Creating rent payment with data:', paymentData);
      
      // Validate required fields
      const requiredFields = ['tenant', 'property', 'amount', 'rentPeriod', 'paymentMethod'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate amount is a positive number
      if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      // Get current user
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Format payment data
      const formattedData = {
        ...paymentData,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        createdBy: currentUser._id,
        status: 'Completed'
      };

      console.log('Formatted payment data:', formattedData);

      // Create the payment
      const response = await axios.post(
        `${API_BASE_URL}/rent-payments`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the complete response including payment history
      console.log('✅ Payment created successfully:', {
        payment: response.data.data.payment,
        history: response.data.data.paymentHistory
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Payment Creation Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Invalid payment data';
        throw new Error(errorMessage);
      }
      if (error.response?.status === 404) {
        throw new Error('Tenant or property not found');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error while creating payment. Please try again.');
      }
      if (error.message.includes('already exists')) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create payment: ' + (error.message || 'Unknown error'));
    }
  }

  // Method to get tenant payment history with detailed filtering
  async getTenantPaymentHistory(tenantId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        paymentMethod,
        minAmount,
        maxAmount
      } = options;

      console.log('Fetching tenant payment history for:', tenantId);
      console.log('With options:', options);

      const response = await axios.get(
        `${API_BASE_URL}/rent-payments/tenant/${tenantId}/history`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          params: {
            page,
            limit,
            startDate,
            endDate,
            paymentMethod,
            minAmount,
            maxAmount
          }
        }
      );

      console.log('Tenant payment history response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tenant payment history:', error);
      if (error.response?.status === 404) {
        // Return empty history instead of throwing error
        return {
          tenant: tenantId,
          paymentTransactions: [],
          totalPaidAmount: 0,
          firstPaymentDate: null,
          lastPaymentDate: null,
          pagination: {
            total: 0,
            page: parseInt(page),
            pages: 0
          }
        };
      }
      throw error;
    }
  }

  // Filter and search payment history
  filterPaymentHistory(history, filters) {
    let filteredTransactions = history.transactions;

    if (filters.minAmount) {
      filteredTransactions = filteredTransactions.filter(
        transaction => transaction.amount >= filters.minAmount
      );
    }

    if (filters.maxAmount) {
      filteredTransactions = filteredTransactions.filter(
        transaction => transaction.amount <= filters.maxAmount
      );
    }

    if (filters.paymentMethod) {
      filteredTransactions = filteredTransactions.filter(
        transaction => transaction.paymentMethod === filters.paymentMethod
      );
    }

    return {
      ...history,
      transactions: filteredTransactions,
      transactionCount: filteredTransactions.length
    };
  }

  async getRentPayments(options = {}) {
    try {
      const token = this.getAuthToken();
      const currentUser = this.getCurrentUser();

      if (!token || !currentUser) {
        console.warn('No authenticated user found');
        throw new Error('Authentication required');
      }

      const defaultOptions = {
        limit: 50,
        page: 1,
        sortBy: 'paymentDate',
        sortOrder: 'desc'
      };

      // Ensure limit and page are numbers
      const queryParams = {
        ...defaultOptions,
        ...options,
        limit: parseInt(options.limit || defaultOptions.limit, 10),
        page: parseInt(options.page || defaultOptions.page, 10)
      };

      // If user is not an admin, only show their own payments
      if (currentUser.role !== 'admin') {
        queryParams.tenant = currentUser.tenantId;
      }

      console.log('Fetching Rent Payments with Options:', queryParams);

      const response = await axios.get(`${API_BASE_URL}/rent-payments`, {
        params: queryParams
      });

      // Handle the new response structure with unique tenants
      let rentPayments = [];
      let pagination = {};

      if (response.data?.data) {
        rentPayments = response.data.data.payments || [];
        pagination = response.data.data.pagination || {};
      }

      // Process each payment to ensure unique tenant display
      const processedPayments = rentPayments.map(payment => ({
        ...payment,
        tenantName: payment.tenant ? 
          `${payment.tenant.firstName || ''} ${payment.tenant.lastName || ''}`.trim() : 
          'Unknown Tenant',
        totalAmount: payment.totalAmount || payment.amount || 0,
        paymentCount: payment.paymentCount || 1
      }));

      console.log('Processed Rent Payments:', processedPayments);

      return {
        rentPayments: processedPayments,
        pagination
      };
    } catch (error) {
      console.error('Rent Payments Fetch Error', error);

      // Detailed error logging
      if (error.response) {
        console.error('Server Response Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  }

  // Get a specific rent payment by ID
  async getRentPaymentById(paymentId) {
    try {
      const token = this.getAuthToken();

      console.group(' Fetching Rent Payment Details');
      console.log(' Payment ID:', paymentId);

      const response = await axios.get(`${API_BASE_URL}/rent-payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      console.log(' Rent Payment Details:', response.data);
      console.groupEnd();

      return response.data;
    } catch (error) {
      console.group(' Error Fetching Rent Payment Details');

      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Server Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        // Throw a more informative error
        throw new Error(
          error.response.data.details ||
          error.response.data.message ||
          `Failed to fetch rent payment. Status: ${error.response.status}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
        throw new Error(`Request setup error: ${error.message}`);
      }

      console.groupEnd();
    }
  }

  // Add payment transaction to tenant history
  async addPaymentTransaction(paymentData) {
    try {
      const token = this.getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/rent-payments/tenant/transaction`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      console.log('Transaction Added:', response.data);
      console.groupEnd();

      return response.data;
    } catch (error) {
      console.error('Error adding payment transaction:', error);
      throw new Error(
        error.response?.data?.message ||
        'Failed to add payment transaction'
      );
    }
  }

  // Delete a rent payment
  async deleteRentPayment(paymentId) {
    try {
      console.group('Deleting Rent Payment');
      console.log('Payment ID:', paymentId);

      const token = this.getAuthToken();

      // First, get the payment details to check if it exists
      const paymentDetails = await axios.get(`${API_BASE_URL}/rent-payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentDetails.data.success) {
        throw new Error('Payment not found');
      }

      // Delete the payment
      const response = await axios.delete(`${API_BASE_URL}/rent-payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete Payment Response:', response.data);

      // Ensure a consistent response format
      const deleteResponse = {
        message: response.data.message || 'Payment deleted successfully',
        deletedPaymentId: paymentId,
        warnings: response.data.warnings || []
      };

      // Log any warnings from the backend
      if (deleteResponse.warnings.length > 0) {
        console.warn('Backend Warnings:', deleteResponse.warnings);
      }

      console.log('Formatted Delete Response:', deleteResponse);
      console.groupEnd();

      return deleteResponse;
    } catch (error) {
      console.group('Comprehensive Error Deleting Rent Payment');

      // More granular error handling
      const errorDetails = {
        message: error.response?.data?.message || error.message,
        serverError: error.response?.data?.error
      };

      console.error('Rent Payment Deletion Error:', errorDetails);

      // Detailed error logging
      if (error.response) {
        console.error('Server Response Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      // Throw a structured error for better frontend handling
      const detailedError = new Error(errorDetails.message);
      detailedError.details = errorDetails;

      console.groupEnd();
      throw detailedError;
    }
  }

  // Add tenant payment transaction
  async addTenantPaymentTransaction(paymentData) {
    try {
      const token = this.getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/rent-payments/tenant-payment-history`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error('Add Tenant Payment Transaction Error:', error);
      throw error;
    }
  }

  async addTenant(tenantName, propertyId) {
    try {
      const token = this.getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/tenants`, { tenantName, propertyId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update property status to 'Occupied' in the property list
      await this.updatePropertyStatus(propertyId, 'Occupied');

      return response.data;
    } catch (error) {
      console.error('Add Tenant Error:', error);
      throw error;
    }
  }

  async addPayment(tenantName, paymentAmount) {
    try {
      const token = this.getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/rent-payments/tenant-payment-history`, { tenantName, paymentAmount }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Add Payment Error:', error);
      throw error;
    }
  }

  async updatePropertyStatus(propertyId, status) {
    try {
      const token = this.getAuthToken();
      const response = await axios.patch(`${API_BASE_URL}/properties/${propertyId}`, { status }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update Property Status Error:', error);
      throw error;
    }
  }

  async getPaymentStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/rent-payments/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  }
}

export default new RentPaymentService();