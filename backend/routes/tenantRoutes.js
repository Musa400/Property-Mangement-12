const express = require("express");
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenantController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Define API routes
router.post("/", authMiddleware, createTenant);
router.get("/", authMiddleware, getAllTenants);
router.get("/:id", authMiddleware, getTenantById);
router.put("/:id", authMiddleware, updateTenant);
router.delete("/:id", authMiddleware, deleteTenant);

// Update tenant status to Paid
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!updatedTenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res.status(200).json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tenant status", error });
  }
});

module.exports = router;
