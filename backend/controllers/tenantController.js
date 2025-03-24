const Tenant = require("../models/Tenant");
const Property = require("../models/Property");
const RentPayment = require("../models/RentPayment");

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
    
    // Update property status to 'vacant'
    const updatedProperty = await Property.findByIdAndUpdate(
      tenant.propertyId, 
      { status: 'vacant' },
      { new: true }  // Return the updated document
    );
    
    console.log('Updated Property:', updatedProperty);

    // Return both the deletion message and the updated property
    res.status(200).json({ 
      message: "Tenant deleted successfully",
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
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

// Update tenant status based on lease end date and payment history
const updateTenantStatus = async () => {
  try {
    const today = new Date();
    
    // Find all tenants
    const tenants = await Tenant.find();
    
    for (const tenant of tenants) {
      // Check if lease has ended
      if (tenant.leaseEndDate < today) {
        // Check if there's a recent payment
        const recentPayment = await RentPayment.findOne({
          tenantId: tenant._id,
          createdAt: { $gte: tenant.leaseEndDate }
        });
        
        // If no recent payment, set to Overdue
        if (!recentPayment) {
          await Tenant.findByIdAndUpdate(tenant._id, {
            paymentStatus: 'Overdue'
          });
        }
      } else {
        // If lease is still active, check for recent payments
        const lastPayment = await RentPayment.findOne({
          tenantId: tenant._id
        }).sort({ createdAt: -1 });
        
        // If there's no payment or last payment is before lease start, set to Pending
        if (!lastPayment || lastPayment.createdAt < tenant.leaseStartDate) {
          await Tenant.findByIdAndUpdate(tenant._id, {
            paymentStatus: 'Pending'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating tenant status:', error);
  }
};

// Update tenant status to Paid when payment is made
const updateTenantToPaid = async (tenantId) => {
  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { paymentStatus: 'Paid' },
      { new: true }
    );
    if (!updatedTenant) {
      throw new Error('Tenant not found');
    }
    return updatedTenant;
  } catch (error) {
    console.error('Error updating tenant to Paid:', error);
    throw error;
  }
};

// Run status update every day
const scheduleStatusUpdate = () => {
  const updateStatus = () => {
    updateTenantStatus();
    // Schedule next update for tomorrow
    setTimeout(updateStatus, 24 * 60 * 60 * 1000);
  };
  
  // Start the first update
  updateStatus();
};

// ✅ Export all functions
module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  searchTenant,
  scheduleStatusUpdate,
  updateTenantToPaid
};