const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addTenantToProperty,
  removeTenantFromProperty
} = require('../controllers/propertyController');
const financialReportController = require('../controllers/financialReportController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new property (requires administrator + secret clearance)
router.post('/', authMiddleware, createProperty);

// Get all properties (requires basic authentication)
router.get('/', authMiddleware, getProperties);

// Get property by ID (requires basic authentication)
router.get('/:id', authMiddleware, getPropertyById);

// Update property (requires administrator + secret clearance)
router.put('/:id', authMiddleware, updateProperty);

// Delete property (requires admin + top_secret clearance)
router.delete('/:id', authMiddleware, deleteProperty);

// Add tenant to property (requires administrator + secret clearance)
router.post('/:id/add-tenant', authMiddleware, addTenantToProperty);

// Remove tenant from property (requires administrator + secret clearance)
router.post('/:id/remove-tenant', authMiddleware, removeTenantFromProperty);

// Generate financial report for property (requires administrator + secret clearance)
router.get('/:id/financial-report', authMiddleware, financialReportController.generateFinancialReport);

// Generate total financial report (requires administrator + secret clearance)
router.get('/financial-report/total', authMiddleware, financialReportController.generateTotalFinancialReport);

module.exports = router;