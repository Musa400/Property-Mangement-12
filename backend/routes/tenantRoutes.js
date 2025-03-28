const express = require("express");
const router = express.Router();
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateTenantStatus,
  updateTenantToPaid,
  searchTenant
} = require("../controllers/tenantController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new tenant (requires basic authentication)
router.post('/', authMiddleware, createTenant);

// Get all tenants (requires basic authentication)
router.get('/', authMiddleware, getAllTenants);

// Get tenant by ID (requires basic authentication)
router.get('/:id', authMiddleware, getTenantById);

// Update tenant (requires basic authentication)
router.put('/:id', authMiddleware, updateTenant);

// Delete tenant (requires basic authentication)
router.delete('/:id', authMiddleware, deleteTenant);

// Update tenant status (requires basic authentication)
router.put('/:id/status', authMiddleware, updateTenantStatus);

// Update tenant to Paid status (requires basic authentication)
router.put('/:id/paid', authMiddleware, updateTenantToPaid);

// Search tenant by name or national ID (requires basic authentication)
router.get('/search', authMiddleware, searchTenant);

// Generate financial report for tenant (requires basic authentication)
router.get('/:id/financial-report', authMiddleware, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Check if user has access to this tenant
    if (tenant.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await RentPayment.find({ tenantId: tenant._id });
    res.status(200).json({ tenant, payments });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate financial report", error });
  }
});

// Generate total financial report (requires basic authentication)
router.get('/financial-report/total', authMiddleware, async (req, res) => {
  try {
    const tenants = await Tenant.find();
    const payments = await RentPayment.find();
    res.status(200).json({ tenants, payments });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate total financial report", error });
  }
});

module.exports = router;
