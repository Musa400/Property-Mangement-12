import axios from 'axios';

const BASE_URL = '/api/rent-receipts';

const rentReceiptService = {
  // Get all rent receipts
  getRentReceipts: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching rent receipts:', error);
      throw error;
    }
  },

  // Get single rent receipt by ID
  getRentReceiptById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rent receipt with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new rent receipt
  createRentReceipt: async (receiptData) => {
    try {
      const response = await axios.post(BASE_URL, receiptData);
      return response.data;
    } catch (error) {
      console.error('Error creating rent receipt:', error);
      throw error;
    }
  }
};

export default rentReceiptService;