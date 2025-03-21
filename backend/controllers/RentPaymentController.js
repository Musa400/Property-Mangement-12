const mongoose = require('mongoose');
const RentPayment = require('../models/RentPayment');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const TenantPaymentHistory = require('../models/TenantPaymentHistory');
const { runTransactionWithRetry } = require('../config/db');
const { validateObjectId } = require('../utils/validation');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Helper function to normalize rent period
function normalizeRentPeriod(period) {
  if (!period) {
    // Default to current month/year if no period provided
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getFullYear()}`;
  }

  // If already in MM/YYYY format
  if (/^\d{1,2}\/\d{4}$/.test(period)) {
    return period;
  }

  // If in YYYY-MM format, convert to MM/YYYY
  const parts = period.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = parts[1];
    if (month >= 1 && month <= 12) {
      return `${month}/${year}`;
    }
  }

  // Month name to number mapping
  const monthMap = {
    'حمل': 1, 'حمل': 1,
    'ثور': 2, 'ثور': 2,
    'جوزا': 3, 'جوزا': 3,
    'سرطان': 4, 'سرطان': 4,
    'اسد': 5, 'اسد': 5,
    'سنبله': 6, 'سنبله': 6,
    'میزان': 7, 'میزان': 7,
    'عقرب': 8, 'عقرب': 8,
    'قوس': 9, 'قوس': 9,
    'جدی': 10, 'جدی': 10,
    'دلو': 11, 'دلو': 11,
    'حوت': 12, 'حوت': 12
  };

  // Try parsing different formats
  const currentYear = new Date().getFullYear();
  
  // If month name is provided
  const lowercasePeriod = period.toLowerCase().trim();
  if (monthMap[lowercasePeriod]) {
    return `${monthMap[lowercasePeriod]}/${currentYear}`;
  }
  
  // If month is a number
  const monthNum = parseInt(period);
  if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
    return `${monthNum}/${currentYear}`;
  }
  
  // Fallback to current month/year
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getFullYear()}`;
}

// Helper function to extract detailed validation errors
function extractValidationErrors(error) {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
  }
  return [];
}

// Helper function to find a default admin ID
const findDefaultAdminId = async () => {
  try {
    const defaultAdmin = await User.findOne({ 
      userType: { $in: ['admin', 'superadmin'] } 
    });

    if (!defaultAdmin) {
      throw new Error('No admin user found to create payment');
    }

    return defaultAdmin._id;
  } catch (error) {
    console.error('Error finding default admin:', error);
    throw new Error('Unable to find a default admin for payment creation');
  }
};

// Get all rent payments with advanced filtering and pagination
exports.getRentPayments = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const {
      page = 1,
      limit = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
      tenant,
      property,
      startDate,
      endDate,
      status
    } = req.query;

    // Parse limit and page as numbers
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    // Build query
    let query = {};
    if (userType !== 'admin') {
      query.tenant = userId;
    }
    if (tenant) query.tenant = tenant;
    if (property) query.property = property;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    // Execute query with pagination and get unique tenants
    const payments = await RentPayment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$tenant',
          latestPayment: { $last: '$$ROOT' },
          totalAmount: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'tenants',
          localField: '_id',
          foreignField: '_id',
          as: 'tenantDetails'
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'latestPayment.property',
          foreignField: '_id',
          as: 'propertyDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'latestPayment.createdBy',
          foreignField: '_id',
          as: 'creatorDetails'
        }
      },
      {
        $project: {
          _id: '$latestPayment._id',
          tenant: { $arrayElemAt: ['$tenantDetails', 0] },
          property: { $arrayElemAt: ['$propertyDetails', 0] },
          createdBy: { $arrayElemAt: ['$creatorDetails', 0] },
          amount: '$latestPayment.amount',
          rentPeriod: '$latestPayment.rentPeriod',
          paymentDate: '$latestPayment.paymentDate',
          paymentMethod: '$latestPayment.paymentMethod',
          status: '$latestPayment.status',
          totalAmount: 1,
          paymentCount: 1
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: (parsedPage - 1) * parsedLimit },
      { $limit: parsedLimit }
    ]);

    // Get total count of unique tenants
    const total = await RentPayment.distinct('tenant', query).then(tenants => tenants.length);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getRentPayments:', error);
    return next(new ApiError('Error retrieving rent payments: ' + error.message, 500));
  }
});

// Helper function to generate a unique receipt number
async function generateUniqueReceiptNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `RCP-${currentYear}-`;
  
  // Find the highest receipt number for the current year
  const lastPayment = await RentPayment.findOne({
    receiptNumber: new RegExp(`^${prefix}`)
  }).sort({ receiptNumber: -1 });

  let nextNumber = 1;
  if (lastPayment && lastPayment.receiptNumber) {
    // Extract the number from the last receipt number
    const lastNumber = parseInt(lastPayment.receiptNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Pad the number with zeros
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `${prefix}${paddedNumber}`;
}

// Create a new rent payment with comprehensive validation and error handling
exports.createRentPayment = catchAsync(async (req, res, next) => {
  console.log('Create Rent Payment Request:', {
    userId: req.user._id,
    requestBody: req.body
  });

  try {
    const {
      tenant,
      property,
      amount,
      rentPeriod,
      paymentDate,
      paymentMethod,
      notes,
      status
    } = req.body;

    console.log('Incoming payment data:', req.body);
    console.log('Creating rent payment with data:', {
      tenant,
      property,
      amount,
      rentPeriod,
      paymentDate,
      paymentMethod,
      notes,
      createdBy: req.user
    });

    console.log('User ID:', req.user._id);

    // Validate required fields
    if (!tenant || !property || !amount || !rentPeriod || !paymentMethod) {
      console.error('Missing required fields:', { tenant, property, amount, rentPeriod, paymentMethod });
      return next(new ApiError('Missing required fields', 400));
    }

    // Validate ObjectIds
    if (!validateObjectId(tenant) || !validateObjectId(property)) {
      console.error('Invalid ObjectIds:', { tenant, property });
      return next(new ApiError('Invalid tenant or property ID', 400));
    }

    // Check if user is authorized to create this payment
    if (req.user.userType === 'tenant' && req.user._id.toString() !== tenant) {
      return next(new ApiError('You can only create payments for yourself', 403));
    }

    // Normalize rent period
    const normalizedRentPeriod = normalizeRentPeriod(rentPeriod);
    console.log('Normalized Rent Period:', normalizedRentPeriod);

    // Check for duplicate payment
    const existingPayment = await RentPayment.findOne({
      tenant,
      property,
      rentPeriod: normalizedRentPeriod
    });

    if (existingPayment) {
      const formattedDate = new Date(existingPayment.paymentDate).toLocaleDateString();
      console.error('Duplicate payment found:', {
        existingPayment,
        formattedDate
      });
      return next(new ApiError(
        `A payment of ${existingPayment.amount} already exists for period ${normalizedRentPeriod} (paid on ${formattedDate})`,
        400
      ));
    }

    // Generate unique receipt number
    const receiptNumber = await generateUniqueReceiptNumber();

    // Create new rent payment
    const newPayment = new RentPayment({
      tenant,
      property,
      amount,
      rentPeriod: normalizedRentPeriod,
      paymentDate,
      paymentMethod,
      notes,
      status,
      createdBy: req.user._id // Ensure createdBy is set
    });

    console.log('New payment object:', newPayment);

    // Save the new payment
    const savedPayment = await newPayment.save();

    // Update tenant's payment history
    let tenantHistory = await TenantPaymentHistory.findOne({
      tenant,
      propertyId: property
    });

    if (!tenantHistory) {
      tenantHistory = new TenantPaymentHistory({
        tenant,
        propertyId: property,
        paymentTransactions: []
      });
    }

    tenantHistory.paymentTransactions.push({
      rentPayment: savedPayment._id,
      amount,
      paymentMethod,
      paymentDate,
      rentPeriod: normalizedRentPeriod
    });

    tenantHistory.totalPaidAmount = tenantHistory.paymentTransactions.reduce(
      (total, transaction) => total + (transaction.amount || 0),
      0
    );

    tenantHistory.firstPaymentDate = tenantHistory.paymentTransactions[0].paymentDate;
    tenantHistory.lastPaymentDate = tenantHistory.paymentTransactions[tenantHistory.paymentTransactions.length - 1].paymentDate;

    await tenantHistory.save();

    // Populate references for response
    const populatedPayment = await RentPayment.findById(savedPayment._id).populate('createdBy');

    res.status(201).json({ success: true, data: populatedPayment });
  } catch (error) {
    console.error('Error creating rent payment:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      tenantId: tenant,
      propertyId: property,
      amount,
      rentPeriod,
      paymentDate
    });
    return next(new ApiError('Error creating rent payment: ' + error.message, 500));
  }
});

// Get a single rent payment
exports.getRentPayment = catchAsync(async (req, res, next) => {
  try {
    const payment = await RentPayment.findById(req.params.id)
      .populate([
        { 
          path: 'tenant',
          select: 'firstName lastName username',
          options: { strictPopulate: false }
        },
        { 
          path: 'property',
          select: 'name address',
          options: { strictPopulate: false }
        },
        { 
          path: 'createdBy',
          select: 'username',
          options: { strictPopulate: false }
        }
      ]);

    if (!payment) {
      console.log('Payment not found:', req.params.id);
      return next(new ApiError('Rent payment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error in getRentPayment:', error);
    return next(new ApiError('Error retrieving rent payment: ' + error.message, 500));
  }
});

// Update a rent payment
exports.updateRentPayment = catchAsync(async (req, res, next) => {
  console.log('Update Rent Payment Request:', {
    userId: req.user._id,
    paymentId: req.params.id,
    requestBody: req.body
  });

  const payment = await RentPayment.findById(req.params.id);

  if (!payment) {
    return next(new ApiError('Rent payment not found', 404));
  }

  // Check if user has permission to update
  if (payment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to update this payment', 403));
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'createdBy') {
      payment[key] = req.body[key];
    }
  });

  payment.lastModifiedBy = req.user._id;
  payment.lastModifiedAt = new Date();

  await payment.save();

  // Populate references
  await payment.populate([
    { path: 'tenant', select: 'name username' },
    { path: 'property', select: 'name address' },
    { path: 'createdBy', select: 'name username' }
  ]);

  res.status(200).json({
    success: true,
    data: payment
  });
});

// Delete a rent payment
exports.deleteRentPayment = catchAsync(async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    console.log('Attempting to delete payment:', paymentId);

    // Validate payment ID format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return next(new ApiError('Invalid payment ID format', 400));
    }

    // Find the payment first
    const payment = await RentPayment.findById(paymentId);
    if (!payment) {
      console.log('Payment not found for deletion:', paymentId);
      return next(new ApiError('Rent payment not found', 404));
    }

    // Check if user has permission to delete
    if (payment.createdBy && payment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError('Not authorized to delete this payment', 403));
    }

    let updatedTenantStatus = null;
    let remainingPaymentsCount = 0;

    try {
      // 1. Delete the payment record
      const deletedPayment = await RentPayment.findByIdAndDelete(paymentId);
      if (!deletedPayment) {
        return next(new ApiError('Failed to delete payment', 500));
      }

      // 2. Update tenant's payment history if tenant exists
      if (payment.tenant) {
        let tenantHistory = await TenantPaymentHistory.findOne({
          tenant: payment.tenant,
          propertyId: payment.property
        });

        if (tenantHistory) {
          // Remove the payment transaction from history
          const originalLength = tenantHistory.paymentTransactions.length;
          tenantHistory.paymentTransactions = tenantHistory.paymentTransactions.filter(
            transaction => transaction.rentPayment && transaction.rentPayment.toString() !== paymentId
          );

          // Only proceed if we actually removed a transaction
          if (tenantHistory.paymentTransactions.length < originalLength) {
            // Recalculate total amount
            tenantHistory.totalPaidAmount = tenantHistory.paymentTransactions.reduce(
              (total, transaction) => total + (transaction.amount || 0),
              0
            );

            if (tenantHistory.paymentTransactions.length > 0) {
              // Sort transactions by date
              tenantHistory.paymentTransactions.sort((a, b) => 
                new Date(a.paymentDate || 0) - new Date(b.paymentDate || 0)
              );

              // Update first and last payment dates
              tenantHistory.firstPaymentDate = tenantHistory.paymentTransactions[0].paymentDate;
              tenantHistory.lastPaymentDate = tenantHistory.paymentTransactions[tenantHistory.paymentTransactions.length - 1].paymentDate;

              await tenantHistory.save();
              remainingPaymentsCount = tenantHistory.paymentTransactions.length;
            } else {
              // If no transactions left, delete the entire history
              await TenantPaymentHistory.findByIdAndDelete(tenantHistory._id);
              remainingPaymentsCount = 0;
            }
          }
        }

        // 3. Update tenant's payment status
        const tenant = await Tenant.findById(payment.tenant);
        if (tenant) {
          // Find the most recent payment for this tenant
          const lastPayment = await RentPayment.findOne({ 
            tenant: payment.tenant,
            _id: { $ne: paymentId }
          }).sort({ paymentDate: -1 });

          if (lastPayment) {
            tenant.lastPaymentDate = lastPayment.paymentDate;
            tenant.paymentStatus = 'Paid';
          } else {
            // No payments left
            tenant.lastPaymentDate = null;
            tenant.paymentStatus = 'Pending';
          }

          await tenant.save();
          updatedTenantStatus = {
            lastPaymentDate: tenant.lastPaymentDate,
            paymentStatus: tenant.paymentStatus
          };
        }
      }

      // 4. Return success response with details
      res.status(200).json({
        success: true,
        message: 'Rent payment and associated records deleted successfully',
        data: {
          deletedPaymentId: paymentId,
          updatedTenantStatus,
          remainingPayments: remainingPaymentsCount
        }
      });

    } catch (error) {
      console.error('Error during payment deletion process:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting rent payment:', error);
    return next(new ApiError('Error deleting rent payment: ' + error.message, 500));
  }
});

// Get payment statistics
exports.getPaymentStats = catchAsync(async (req, res) => {
  const stats = await RentPayment.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || { totalPayments: 0, totalAmount: 0, averageAmount: 0 }
  });
});

// Get tenant payment history with detailed filtering
exports.getTenantPaymentHistory = catchAsync(async (req, res) => {
  const tenantId = req.params.tenantId;
  const { 
    page = 1, 
    limit = 10,
    startDate,
    endDate,
    paymentMethod,
    minAmount,
    maxAmount
  } = req.query;

  // Build query
  const query = { tenant: tenantId };
  if (startDate || endDate) {
    query['paymentTransactions.paymentDate'] = {};
    if (startDate) query['paymentTransactions.paymentDate'].$gte = new Date(startDate);
    if (endDate) query['paymentTransactions.paymentDate'].$lte = new Date(endDate);
  }

  // Get payment history
  const history = await TenantPaymentHistory.findOne(query)
    .populate({
      path: 'paymentTransactions.rentPayment',
      populate: [
        { path: 'tenant', select: 'name username' },
        { path: 'property', select: 'name address' }
      ]
    });

  // If no history exists, return empty history instead of 404
  if (!history) {
    return res.json({
      success: true,
      data: {
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
      }
    });
  }

  // Filter transactions if needed
  let transactions = history.paymentTransactions;
  if (paymentMethod) {
    transactions = transactions.filter(t => t.paymentMethod === paymentMethod);
  }
  if (minAmount) {
    transactions = transactions.filter(t => t.amount >= parseFloat(minAmount));
  }
  if (maxAmount) {
    transactions = transactions.filter(t => t.amount <= parseFloat(maxAmount));
  }

  // Sort transactions by date (oldest to newest)
  transactions.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

  // Paginate transactions
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      ...history.toObject(),
      paymentTransactions: paginatedTransactions,
      pagination: {
        total: transactions.length,
        page: parseInt(page),
        pages: Math.ceil(transactions.length / limit)
      }
    }
  });
});

// Add payment transaction to tenant history
exports.addPaymentTransaction = catchAsync(async (req, res) => {
  const { tenant, rentPayment, amount, paymentMethod, paymentDate, rentPeriod, property } = req.body;

  const transaction = await TenantPaymentHistory.addPaymentTransaction({
    tenant,
    rentPayment,
    amount,
    paymentMethod,
    paymentDate,
    rentPeriod,
    property,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// Check for duplicate payments
exports.checkDuplicatePayment = catchAsync(async (req, res) => {
  const { tenant, property, rentPeriod } = req.body;

  const existingPayment = await RentPayment.findOne({
    tenant,
    property,
    rentPeriod
  });

  res.json({
    success: true,
    isDuplicate: !!existingPayment,
    existingPayment: existingPayment || null
  });
});

// Get all tenants
exports.getTenants = catchAsync(async (req, res) => {
  try {
    let tenants;
    if (req.user.role === 'admin') {
      tenants = await Tenant.find(); // Fetch all tenants
    } else {
      tenants = await Tenant.find({ createdBy: req.user.id }); // Fetch only the user's tenants
    }
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error });
  }
});

// Get all tenants
exports.getTenants = catchAsync(async (req, res) => {
  try {
    let tenants;
    if (req.user.role === 'admin') {
      tenants = await Tenant.find(); // Fetch all tenants
    } else {
      tenants = await Tenant.find({ createdBy: req.user.id }); // Fetch only the user's tenants
    }
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error });
  }
});