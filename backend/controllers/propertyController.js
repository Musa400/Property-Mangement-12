const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Get all properties
exports.getProperties = catchAsync(async (req, res) => {
  let properties;
  if (req.user.userType === 'admin' || req.user.userType === 'administrator') {
    properties = await Property.find();
  } else {
    properties = await Property.find({ createdBy: req.user.id });
  }
  res.status(200).json(properties);
});

// Get property by ID
exports.getPropertyById = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('createdBy', 'username email userType')
    .populate('tenants', 'username email userType');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Security check based on user type and ownership
  const isAuthorized = 
    req.user.userType === 'admin' || 
    req.user.userType === 'administrator' || 
    property.createdBy._id.toString() === req.user.id ||
    property.tenants.some(tenant => tenant._id.toString() === req.user.id);

  if (!isAuthorized) {
    throw new ApiError(403, 'Access denied');
  }

  res.status(200).json(property);
});

// Create a new property
exports.createProperty = catchAsync(async (req, res) => {
  // Validate required fields
  const requiredFields = ['title', 'province', 'description', 'address', 'type'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate property type
  const validTypes = ['تجارتی', 'تاسيسات', 'للمی', 'زراعتی', 'office', 'warehouse', 'residential', 'training', 'security'];
  if (!validTypes.includes(req.body.type)) {
    throw new ApiError(400, `Invalid property type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Log incoming property data
  console.log('Incoming property data:', req.body);

  const propertyData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  const property = new Property(propertyData);
  const savedProperty = await property.save();
  
  res.status(201).json(savedProperty);
});

// Update property
exports.updateProperty = catchAsync(async (req, res) => {
  const existingProperty = await Property.findById(req.params.id);
  
  if (!existingProperty) {
    throw new ApiError(404, 'Property not found');
  }

  // Security check based on user type and ownership
  const isAuthorized = 
    req.user.userType === 'admin' || 
    req.user.userType === 'administrator' || 
    existingProperty.createdBy.toString() === req.user.id;

  if (!isAuthorized) {
    throw new ApiError(403, 'Access denied');
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedProperty);
});

// Delete property
exports.deleteProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Only admin can delete properties
  if (req.user.userType !== 'admin') {
    throw new ApiError(403, 'Access denied. Only admin can delete properties.');
  }

  await Property.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: 'Property deleted successfully'
  });
});

// Add tenant to property
exports.addTenantToProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);
  
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Only administrator can add tenants
  if (req.user.userType !== 'administrator') {
    throw new ApiError(403, 'Access denied. Only administrator can add tenants.');
  }

  const { tenantId } = req.body;
  if (!tenantId) {
    throw new ApiError(400, 'Tenant ID is required');
  }

  if (property.tenants.includes(tenantId)) {
    throw new ApiError(400, 'Tenant is already assigned to this property');
  }

  property.tenants.push(tenantId);
  property.status = 'occupied';
  await property.save();

  console.log('Updated property after adding tenant:', property);
  console.log('Property status after adding tenant:', property.status);

  res.status(200).json({
    message: 'Tenant added successfully',
    property
  });
});

// Remove tenant from property
exports.removeTenantFromProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);
  
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Only administrator can remove tenants
  if (req.user.userType !== 'administrator') {
    throw new ApiError(403, 'Access denied. Only administrator can remove tenants.');
  }

  const { tenantId } = req.body;
  if (!tenantId) {
    throw new ApiError(400, 'Tenant ID is required');
  }

  const tenantIndex = property.tenants.indexOf(tenantId);
  if (tenantIndex === -1) {
    throw new ApiError(400, 'Tenant is not assigned to this property');
  }

  property.tenants.splice(tenantIndex, 1);
  if (property.tenants.length === 0) {
    property.status = 'vacant';
  }
  await property.save();

  res.status(200).json({
    message: 'Tenant removed successfully',
    property
  });
})
