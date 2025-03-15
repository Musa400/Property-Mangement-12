const RentPayment = require('../models/rentPayment');
const mongoose = require('mongoose');
const TenantPaymentHistory = require('../models/TenantPaymentHistory');

// Get all rent receipts
exports.getAllRentReceipts = async (req, res) => {
  try {
    // Fetch all rent payments with populated property details
    const rentReceipts = await RentPayment.aggregate([
      {
        $lookup: {
          from: 'properties', // Assuming the collection name is 'properties'
          localField: 'propertyId',
          foreignField: '_id',
          as: 'propertyDetails'
        }
      },
      {
        $unwind: '$propertyDetails'
      },
      {
        $project: {
          tenantName: 1,
          rentAmount: 1,
          paymentDate: 1,
          paymentStatus: 1,
          rentPeriod: 1,
          paymentMethod: 1,
          propertyAddress: '$propertyDetails.address',
          bankCheckNumber: 1,
          bankName: 1,
          checkIssueDate: 1
        }
      }
    ]);

    res.status(200).json(rentReceipts);
  } catch (error) {
    console.error('Error fetching rent receipts:', error);
    res.status(500).json({ 
      message: 'Error fetching rent receipts', 
      error: error.message 
    });
  }
};

// Get single rent receipt by ID
exports.getRentReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid receipt ID' });
    }

    const rentReceipt = await RentPayment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'propertyDetails'
        }
      },
      {
        $unwind: '$propertyDetails'
      },
      {
        $project: {
          tenantName: 1,
          rentAmount: 1,
          paymentDate: 1,
          paymentStatus: 1,
          rentPeriod: 1,
          paymentMethod: 1,
          propertyAddress: '$propertyDetails.address',
          bankCheckNumber: 1,
          bankName: 1,
          checkIssueDate: 1
        }
      }
    ]);

    if (!rentReceipt.length) {
      return res.status(404).json({ message: 'Rent receipt not found' });
    }

    res.status(200).json(rentReceipt[0]);
  } catch (error) {
    console.error('Error fetching rent receipt:', error);
    res.status(500).json({ 
      message: 'Error fetching rent receipt', 
      error: error.message 
    });
  }
};

// Create a new rent receipt (optional, but useful)
exports.createRentReceipt = async (req, res) => {
  try {
    const {
      tenantName,
      rentAmount,
      paymentDate,
      rentPeriod,
      propertyId,
      paymentMethod,
      bankCheckNumber,
      bankName,
      checkIssueDate
    } = req.body;

    const newRentReceipt = new RentPayment({
      tenantName,
      rentAmount,
      paymentDate,
      paymentStatus: 'Paid',
      rentPeriod,
      propertyId,
      paymentMethod,
      bankCheckNumber,
      bankName,
      checkIssueDate
    });

    const savedReceipt = await newRentReceipt.save();

    res.status(201).json(savedReceipt);
  } catch (error) {
    console.error('Error creating rent receipt:', error);
    res.status(500).json({ 
      message: 'Error creating rent receipt', 
      error: error.message 
    });
  }
};

// Add a new tenant
exports.addTenant = async (req, res) => {
  try {
    const { tenantName } = req.body;

    // Validate tenant name
    if (!tenantName || tenantName.trim() === '') {
      return res.status(400).json({ message: 'Tenant name is required' });
    }

    // Check if tenant already exists
    const existingTenant = await TenantPaymentHistory.findOne({ tenant: tenantName });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant already exists' });
    }

    // Create a new tenant entry
    const newTenant = new TenantPaymentHistory({ tenant: tenantName, paymentTransactions: [] });
    await newTenant.save();

    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error adding tenant:', error.stack); // Improved logging
    res.status(500).json({ message: 'Error adding tenant', error: error.message });
  }
};

// Add payment for a tenant
exports.addPayment = async (req, res) => {
  try {
    const { tenantName, rentPayment } = req.body;

    // Find the tenant's payment history
    const tenantHistory = await TenantPaymentHistory.findOne({ tenant: tenantName });
    if (!tenantHistory) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Add payment transaction
    await tenantHistory.addPaymentTransaction(rentPayment);

    res.status(200).json({ message: 'Payment added successfully', tenantHistory });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Error adding payment', error: error.message });
  }
};