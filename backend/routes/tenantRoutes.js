const express = require("express");
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenantController");

const router = express.Router();

// ✅ Define API routes
router.post("/", createTenant);
router.get("/", getAllTenants);
router.get("/:id", getTenantById);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

module.exports = router;
