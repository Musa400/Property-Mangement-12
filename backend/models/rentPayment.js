const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Payment amount must be greater than zero']
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: {
      values: ['Cash', 'Bank Paid', 'Credit Card', 'Debit Card', 'Cheque', 'Online Payment'],
      message: 'Invalid payment method'
    }
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const RentPaymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  rentPeriod: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Paid', 'Check', 'Online Payment', 'Other']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  transactions: [TransactionSchema],
  totalAmount: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  paymentHistory: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    status: String,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentPayment',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware for comprehensive validation
RentPaymentSchema.pre('save', async function(next) {
  console.group('RentPayment Pre-Save Validation');
  console.log('Document being saved:', this.toObject());

  try {
    // Additional validation checks
    if (!this.tenant) {
      const tenantError = new Error('Tenant is required');
      tenantError.name = 'ValidationError';
      throw tenantError;
    }

    if (!this.property) {
      const propertyError = new Error('Property is required');
      propertyError.name = 'ValidationError';
      throw propertyError;
    }

    // Check for duplicate payment with more flexible criteria
    const existingPayment = await this.constructor.findOne({
      tenant: this.tenant,
      property: this.property,
      rentPeriod: this.rentPeriod,
      $or: [
        // Exact amount match
        { amount: this.amount },
        // Within 1% tolerance to handle rounding or slight differences
        { 
          amount: { 
            $gte: this.amount * 0.99, 
            $lte: this.amount * 1.01 
          } 
        }
      ],
      // Check within the same day
      paymentDate: { 
        $gte: new Date(new Date(this.paymentDate).setHours(0,0,0,0)), 
        $lt: new Date(new Date(this.paymentDate).setHours(23,59,59,999)) 
      }
    });

    if (existingPayment && existingPayment._id.toString() !== this._id.toString()) {
      // Create a custom error for duplicate detection
      const duplicateError = new Error('Duplicate payment detected for this tenant, property, and period');
      duplicateError.name = 'DuplicatePaymentError';
      duplicateError.details = {
        existingPaymentId: existingPayment._id,
        tenant: this.tenant,
        property: this.property,
        rentPeriod: this.rentPeriod,
        amount: this.amount
      };

      // Optionally mark this payment as a duplicate
      this.status = 'Duplicate';
      this.duplicateOf = existingPayment._id;

      console.warn('Duplicate Payment Detected:', duplicateError.details);
      console.groupEnd();

      // Depending on your business logic, you might want to:
      // 1. Prevent save (throw error)
      // 2. Save with 'Duplicate' status
      // Here, we'll throw an error to allow custom handling
      throw duplicateError;
    }

    console.log('Pre-save validation passed');
    console.groupEnd();
    next();
  } catch (error) {
    console.error('Pre-save validation failed:', {
      message: error.message,
      name: error.name,
      details: error.details
    });
    console.groupEnd();
    next(error);
  }
});

// Pre-save middleware to update totalAmount
RentPaymentSchema.pre('save', function(next) {
  if (this.transactions && this.transactions.length > 0) {
    this.totalAmount = this.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }
  next();
});

// Pre-save middleware to generate receipt number
RentPaymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      paymentDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.receiptNumber = `RCP-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Method to check for duplicate payments
RentPaymentSchema.statics.checkDuplicate = async function(tenantId, propertyId, rentPeriod) {
  const existingPayment = await this.findOne({
    tenant: tenantId,
    property: propertyId,
    rentPeriod: rentPeriod
  });
  return !!existingPayment;
};

// Virtual for formatted amount
RentPaymentSchema.virtual('formattedAmount').get(function() {
  return this.amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
});

// Method to get payment statistics
RentPaymentSchema.statics.getPaymentStats = async function(propertyId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        property: propertyId,
        paymentDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        paymentCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Add a virtual to get formatted payment details
RentPaymentSchema.virtual('formattedPaymentDetails').get(function() {
  return {
    amount: `$${this.amount.toFixed(2)}`,
    period: this.rentPeriod,
    method: this.paymentMethod,
    date: this.paymentDate.toLocaleDateString(),
    status: this.status
  };
});

// Indexes for better query performance
RentPaymentSchema.index({ tenant: 1, property: 1, rentPeriod: 1 });
RentPaymentSchema.index({ paymentDate: 1 });
RentPaymentSchema.index({ status: 1 });

// Post-save middleware for logging
RentPaymentSchema.post('save', function(doc) {
  console.log('RentPayment saved:', {
    id: doc._id,
    tenant: doc.tenant,
    amount: doc.amount,
    rentPeriod: doc.rentPeriod,
    status: doc.status
  });
});

// Method to add a new payment record while preserving history
RentPaymentSchema.methods.addPaymentRecord = async function(paymentData) {
  // Create a new transaction
  const newTransaction = {
    amount: this.amount,
    paymentDate: this.paymentDate,
    paymentMethod: this.paymentMethod,
    notes: this.notes,
    createdBy: this.createdBy
  };

  // Add transaction to the transactions array
  this.transactions.push(newTransaction);

  // Add current payment to history before updating
  this.paymentHistory.push({
    amount: this.amount,
    paymentDate: this.paymentDate,
    paymentMethod: this.paymentMethod,
    status: this.status,
    notes: this.notes,
    createdBy: this.createdBy,
    transactionId: newTransaction._id
  });

  // Update current payment with new data
  Object.assign(this, paymentData);
  
  // Ensure the payment is marked as active
  this.isActive = true;
  
  // Save the updated payment
  return this.save();
};

// Method to get payment history
RentPaymentSchema.methods.getPaymentHistory = function() {
  return this.paymentHistory.sort((a, b) => b.paymentDate - a.paymentDate);
};

// Static method to find or create payment record
RentPaymentSchema.statics.findOrCreatePayment = async function(tenantId, propertyId, paymentData) {
  // Try to find an existing active payment for this tenant and property
  let payment = await this.findOne({
    tenant: tenantId,
    property: propertyId,
    isActive: true
  });

  if (payment) {
    // If payment exists, add new record to history
    await payment.addPaymentRecord(paymentData);
  } else {
    // If no payment exists, create new one
    payment = await this.create({
      ...paymentData,
      tenant: tenantId,
      property: propertyId,
      isActive: true
    });
  }

  return payment;
};

const RentPayment = mongoose.model('RentPayment', RentPaymentSchema);

module.exports = RentPayment;