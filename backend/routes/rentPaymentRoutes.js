// routes/rentPaymentRoutes.js
const express = require('express');
const router = express.Router();
const RentPaymentController = require('../controllers/RentPaymentController');
const { protect, authorize } = require('../middleware/auth');
const { validateRentPayment } = require('../middleware/validation');

// Logging middleware for rent payment routes
const rentPaymentLogger = (req, res, next) => {
  console.group('Rent Payment Route Request');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('User:', req.user ? req.user.id : 'Not Authenticated');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.groupEnd();
  next();
};

// Apply authentication middleware to all routes
router.use(protect);

// Apply logging middleware to all rent payment routes
router.use(rentPaymentLogger);

// Routes accessible by all authenticated users
router.get('/stats', RentPaymentController.getPaymentStats);

// Get tenant payment history - accessible by all authenticated users
router.get('/tenant/:tenantId/history', RentPaymentController.getTenantPaymentHistory);

// Create a new rent payment - accessible by all authenticated users
router.post('/', validateRentPayment, RentPaymentController.createRentPayment);

// Get all rent payments - filtered based on user role
router.get('/', RentPaymentController.getRentPayments);

// Routes accessible by admin and property manager only
router.use(authorize('admin', 'property_manager'));

// Add payment transaction to tenant history
router.post('/tenant/transaction', RentPaymentController.addPaymentTransaction);

// Get a single rent payment
router.get('/:id', RentPaymentController.getRentPayment);

// Update a rent payment
router.put('/:id', validateRentPayment, RentPaymentController.updateRentPayment);

// Delete a rent payment
router.delete('/:id', RentPaymentController.deleteRentPayment);

// Check for duplicate payments
router.post('/check-duplicate', RentPaymentController.checkDuplicatePayment);

module.exports = router;