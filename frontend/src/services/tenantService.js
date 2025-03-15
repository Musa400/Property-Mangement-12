import axios from "axios";

const API_URL = "http://localhost:5000/api/tenants";

// ✅ Add a new tenant
const createTenant = async (tenantData) => {
  // Ensure the user is authenticated before making the request
  const token = localStorage.getItem('token'); // Retrieve the token from local storage
  if (!token) {
    console.error('User is not authenticated.');
    alert('You need to log in to create a tenant.');
    return;
  }

  // Include the token in the request headers
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  // Ensure all required fields are present
  const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'nationalId', 'leaseStartDate', 'leaseEndDate', 'monthlyRent', 'paymentStatus', 'name'];
  for (const field of requiredFields) {
    if (!tenantData[field]) {
      console.error(`Missing required field: ${field}`);
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Make the API call to create a tenant
  return axios.post(API_URL, tenantData, config)
  .then(response => response.data)
  .catch(error => {
    console.error('Error creating tenant:', error.response ? error.response.data : error.message);
    console.error('Error details:', error.response ? error.response : error);
    console.log("Tenant Data:", tenantData); // Log tenant data for debugging
    console.log("Request Config:", error.config); // Log request config for debugging
    console.log("Request Headers:", error.config.headers); // Log request headers for debugging

    throw error;
  });
};

// ✅ Get all tenants
const getAllTenants = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('User is not authenticated.');
      alert('You need to log in to view tenants.');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching tenants:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get tenant by ID
const getTenantById = async (tenantId) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('User is not authenticated.');
      alert('You need to log in to view tenant details.');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(`${API_URL}/${tenantId}`, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching tenant:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update tenant information
const updateTenant = async (tenantId, tenantData) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('User is not authenticated.');
      alert('You need to log in to update a tenant.');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.put(`${API_URL}/${tenantId}`, tenantData, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating tenant:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a tenant
const deleteTenant = async (tenantId) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('User is not authenticated.');
      alert('You need to log in to delete a tenant.');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const tenant = await getTenantById(tenantId);
    await axios.delete(`${API_URL}/${tenantId}`, config);
    await propertyService.updatePropertyStatus(tenant.propertyId, 'Vacant');
    return { message: "Tenant deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting tenant:", error.response?.data || error.message);
    throw error;
  }
}

// ✅ Add a new tenant with property status update
const createTenantWithPropertyStatusUpdate = async (tenantData, propertyId) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('User is not authenticated.');
      alert('You need to log in to create a tenant.');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    // Ensure all required fields are present
    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'nationalId', 'leaseStartDate', 'leaseEndDate', 'monthlyRent', 'paymentStatus', 'name'];
    for (const field of requiredFields) {
      if (!tenantData[field]) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Make the API call to create a tenant
    const response = await axios.post(API_URL, tenantData, config);
    const Property = require("../models/Property"); // Import the Property model
    const property = await Property.findById(propertyId);
    property.status = 'Occupied';
    await property.save();
    return response.data;
  } catch (error) {
    console.error('Error creating tenant:', error.response ? error.response.data : error.message);
    console.error('Error details:', error.response ? error.response : error);
    console.log("Tenant Data:", tenantData); // Log tenant data for debugging
    console.log("Request Config:", error.config); // Log request config for debugging
    console.log("Request Headers:", error.config.headers); // Log request headers for debugging

    throw error;
  }
};

// Grouping functions into tenantService object
export const tenantService = {
  createTenant,
  createTenantWithPropertyStatusUpdate,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
};

// Default export
export default tenantService;