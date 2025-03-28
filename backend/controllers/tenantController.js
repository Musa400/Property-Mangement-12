const Tenant = require("../models/Tenant");
const Property = require("../models/Property");
const RentPayment = require("../models/RentPayment");
const TenantPaymentHistory = require("../models/TenantPaymentHistory");
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// ✅ Add a new tenant
const createTenant = catchAsync(async (req, res) => {
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'nationalId', 'propertyId', 'leaseStartDate', 'leaseEndDate', 'rentAmount', 'paymentStatus'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }

  // Ensure required fields are present
  const { firstName, lastName, phoneNumber, nationalId, propertyId, leaseStartDate, leaseEndDate, rentAmount, paymentStatus } = req.body;
  if (!firstName || !lastName || !phoneNumber || !nationalId || !propertyId || !leaseStartDate || !leaseEndDate || !rentAmount || !paymentStatus) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Construct the name and contactInfo fields
  const name = `${firstName} ${lastName}`;
  const contactInfo = { phone: phoneNumber };

  // Create a new tenant with the name and contactInfo fields included
  const newTenant = new Tenant({ 
    firstName,
    lastName,
    contactInfo,
    nationalId,
    propertyId,
    leaseStartDate,
    leaseEndDate,
    rentAmount,
    paymentStatus,
    name,
    userId: req.user._id
  });
  const savedTenant = await newTenant.save();

  // Update the property status to 'Occupied'
  await Property.findByIdAndUpdate(propertyId, { status: 'Occupied' });

  res.status(201).json(savedTenant);
});

// ✅ Get all tenants
const getAllTenants = catchAsync(async (req, res) => {
  let tenants;
  if (req.user.userType === 'admin' || req.user.userType === 'administrator') {
    tenants = await Tenant.find();
  } else {
    tenants = await Tenant.find({ userId: req.user._id });
  }
  res.status(200).json(tenants);
});

// ✅ Get a single tenant by ID
const getTenantById = catchAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  // Security check based on user type and ownership
  const isAuthorized = 
    req.user.userType === 'admin' || 
    req.user.userType === 'administrator' || 
    tenant.userId.toString() === req.user._id.toString();

  if (!isAuthorized) {
    throw new ApiError(403, 'Access denied');
  }

  res.status(200).json(tenant);
});

// ✅ Update tenant details
const updateTenant = catchAsync(async (req, res) => {
  const existingTenant = await Tenant.findById(req.params.id);
  
  if (!existingTenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  // Security check based on user type and ownership
  const isAuthorized = 
    req.user.userType === 'admin' || 
    req.user.userType === 'administrator' || 
    existingTenant.userId.toString() === req.user._id.toString();

  if (!isAuthorized) {
    throw new ApiError(403, 'Access denied');
  }

  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  
  res.status(200).json(updatedTenant);
});

// ✅ Delete a tenant
const deleteTenant = catchAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  await Tenant.findByIdAndDelete(req.params.id);
  
  // Update property status to 'vacant'
  const updatedProperty = await Property.findByIdAndUpdate(
    tenant.propertyId, 
    { status: 'vacant' },
    { new: true }
  );

  res.status(200).json({ message: "Tenant deleted successfully" });
});

// ✅ Search tenant by name or national ID
const searchTenant = catchAsync(async (req, res) => {
  const { query } = req.query; // Assuming the search term is passed as a query parameter
  let tenants;
  if (req.user.userType === 'admin' || req.user.userType === 'administrator') {
    tenants = await Tenant.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { nationalId: { $regex: query, $options: 'i' } }
      ]
    });
  } else {
    tenants = await Tenant.find({
      userId: req.user._id,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { nationalId: { $regex: query, $options: 'i' } }
      ]
    });
  }
  res.status(200).json(tenants);
});

// ✅ Update tenant status
const updateTenantStatus = catchAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  // Only administrator can update tenant status
  if (req.user.userType !== 'administrator') {
    throw new ApiError(403, 'Access denied. Only administrator can update tenant status.');
  }

  const { status } = req.body;
  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.status(200).json(updatedTenant);
});

// ✅ Update tenant to Paid status
const updateTenantToPaid = catchAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  // Only administrator can update payment status
  if (req.user.userType !== 'administrator') {
    throw new ApiError(403, 'Access denied. Only administrator can update payment status.');
  }

  // Update tenant status to Paid
  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: 'Paid' },
    { new: true }
  );

  // Update payment history
  await TenantPaymentHistory.updateTenantPaymentHistory(tenant._id, {
    amount: tenant.rentAmount,
    paymentMethod: req.body.paymentMethod,
    paymentDate: new Date(),
    createdBy: req.user._id
  });

  res.status(200).json(updatedTenant);
});

// ✅ Export all functions
module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateTenantStatus,
  updateTenantToPaid,
  searchTenant
};