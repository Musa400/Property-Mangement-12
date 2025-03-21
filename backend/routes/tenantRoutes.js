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

module.exports = router;
