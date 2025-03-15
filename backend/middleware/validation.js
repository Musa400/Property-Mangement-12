const Joi = require('joi');
const ApiError = require('../utils/ApiError');

// Payment method mapping
const PAYMENT_METHODS = {
  'bank paid': 'Bank Paid',
  'bank_paid': 'Bank Paid',
  'Bank Paid': 'Bank Paid',
  'Bank_Paid': 'Bank Paid',
  'cash': 'Cash',
  'Cash': 'Cash',
  'check': 'Cheque',
  'Check': 'Cheque',
  'cheque': 'Cheque',
  'Cheque': 'Cheque',
  'online': 'Online Payment',
  'Online': 'Online Payment',
  'credit card': 'Credit Card',
  'Credit Card': 'Credit Card',
  'debit card': 'Debit Card',
  'Debit Card': 'Debit Card'
};

// Validation schema for rent payment
const rentPaymentSchema = Joi.object({
  tenant: Joi.string().required().messages({
    'string.empty': 'Tenant ID is required',
    'any.required': 'Tenant ID is required'
  }),
  property: Joi.string().required().messages({
    'string.empty': 'Property ID is required',
    'any.required': 'Property ID is required'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount must be greater than or equal to 0',
    'any.required': 'Amount is required'
  }),
  rentPeriod: Joi.string().required().messages({
    'string.empty': 'Rent period is required',
    'any.required': 'Rent period is required'
  }),
  paymentDate: Joi.date().iso().messages({
    'date.base': 'Payment date must be a valid date',
    'date.format': 'Payment date must be in ISO format (YYYY-MM-DD)'
  }),
  paymentMethod: Joi.string().valid(...Object.keys(PAYMENT_METHODS)).required().messages({
    'string.empty': 'Payment method is required',
    'any.only': 'Payment method must be one of: Cash, Bank Paid, Credit Card, Debit Card, Cheque, Online Payment',
    'any.required': 'Payment method is required'
  }),
  notes: Joi.string().allow('').optional(),
  createdBy: Joi.string().optional()
});

// Middleware to validate rent payment data
const validateRentPayment = (req, res, next) => {
  const { error } = rentPaymentSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    return next(new ApiError('Validation Error', 400, errors));
  }

  // Convert payment method to standard format
  if (req.body.paymentMethod) {
    req.body.paymentMethod = PAYMENT_METHODS[req.body.paymentMethod.toLowerCase()];
  }

  next();
};

module.exports = {
  validateRentPayment
}; 