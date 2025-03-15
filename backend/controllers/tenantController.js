const Tenant = require("../models/Tenant");
const Property = require("../models/Property");

// ✅ Add a new tenant
const createTenant = async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Incoming request body:', req.body);

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
      name
    });
    // Log the new tenant object for debugging
    console.log('New tenant object:', newTenant);
    const savedTenant = await newTenant.save();

    // Update the property status to 'Occupied'
    await Property.findByIdAndUpdate(propertyId, { status: 'Occupied' });

    res.status(201).json(savedTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'National ID or name already exists. Please use a different one.' });
    }
    res.status(500).json({ message: 'Failed to create tenant', error });
  }
};

// ✅ Get all tenants
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tenants", error });
  }
};

// ✅ Get a single tenant by ID
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenant", error });
  }
};

// ✅ Update tenant details
const updateTenant = async (req, res) => {
  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, {
      ...req.body,
      paymentStatus: req.body.paymentStatus
    }, { new: true });
    if (!updatedTenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error); 
    res.status(500).json({ message: "Failed to update tenant", error });
  }
};

// ✅ Delete a tenant
const deleteTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findByIdAndDelete(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    console.log('Tenant found:', tenant);
    const updatedProperty = await Property.findByIdAndUpdate(tenant.propertyId, { status: 'Vacant' });
    console.log('Updated Property:', updatedProperty);

    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tenant", error });
  }
};

// ✅ Search tenant by name or national ID
const searchTenant = async (req, res) => {
  const { query } = req.query; // Assuming the search term is passed as a query parameter
  try {
    const tenants = await Tenant.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { nationalId: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Error searching tenants", error });
  }
};

// ✅ Export all functions
module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  searchTenant,
};
