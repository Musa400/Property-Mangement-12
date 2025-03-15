const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  rentPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentPayment',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  rentPeriod: {
    type: String,
    default: function() {
      // Generate default rent period based on payment date
      const paymentDate = this.paymentDate || new Date();
      return `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
    },
    trim: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }
}, { 
  _id: false,  // Prevent creating additional _id for subdocuments
  timestamps: true 
});

const TenantPaymentHistorySchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  paymentTransactions: [{
    rentPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentPayment'
    },
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    rentPeriod: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed'
    }
  }],
  totalPaidAmount: {
    type: Number,
    default: 0
  },
  firstPaymentDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
  tenantDetails: {
    name: String,
    
    phone: String,
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create a compound unique index on tenant and propertyId
TenantPaymentHistorySchema.index({ tenant: 1, propertyId: 1 }, { unique: true });

// Pre-save middleware to handle payment history updates
TenantPaymentHistorySchema.pre('save', async function(next) {
  try {
    // If this is a new document
    if (this.isNew) {
      // Check for existing payment history for this tenant-property combination
      const existingHistory = await this.constructor.findOne({
        tenant: this.tenant,
        propertyId: this.propertyId
      });

      if (existingHistory) {
        // If exists, merge the transactions
        existingHistory.paymentTransactions.push(...this.paymentTransactions);
        
        // Sort transactions by date (oldest to newest)
        existingHistory.paymentTransactions.sort((a, b) => 
          new Date(a.paymentDate) - new Date(b.paymentDate)
        );

        // Update total amount and payment dates
        existingHistory.totalPaidAmount += this.totalPaidAmount;
        existingHistory.firstPaymentDate = existingHistory.paymentTransactions[0].paymentDate;
        existingHistory.lastPaymentDate = existingHistory.paymentTransactions[existingHistory.paymentTransactions.length - 1].paymentDate;

        // Save the updated history
        await existingHistory.save();
        
        // Skip saving this document
        return next(new Error('Document merged with existing history'));
      }
    }

    // If this is an existing document being updated
    if (this.isModified('paymentTransactions')) {
      // Sort transactions by date
      this.paymentTransactions.sort((a, b) => 
        new Date(a.paymentDate) - new Date(b.paymentDate)
      );

      // Update total amount and payment dates
      this.totalPaidAmount = this.paymentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      this.firstPaymentDate = this.paymentTransactions[0].paymentDate;
      this.lastPaymentDate = this.paymentTransactions[this.paymentTransactions.length - 1].paymentDate;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to add a payment transaction
TenantPaymentHistorySchema.statics.addPaymentTransaction = async function(data) {
  const { tenant, propertyId, rentPayment, amount, paymentDate, rentPeriod, paymentMethod, createdBy } = data;

  try {
    // Find existing payment history for this tenant-property combination
    let history = await this.findOne({ tenant, propertyId });

    if (!history) {
      // Create new history if it doesn't exist
      history = new this({
        tenant,
        propertyId,
        paymentTransactions: [{
          rentPayment,
          amount,
          paymentDate,
          rentPeriod,
          paymentMethod,
          property: propertyId,
          createdBy,
          status: 'Completed'
        }],
        totalPaidAmount: amount,
        firstPaymentDate: paymentDate,
        lastPaymentDate: paymentDate,
        createdBy
      });
    } else {
      // Add new transaction to existing history
      history.paymentTransactions.push({
        rentPayment,
        amount,
        paymentDate,
        rentPeriod,
        paymentMethod,
        property: propertyId,
        createdBy,
        status: 'Completed'
      });

      // Sort transactions by date
      history.paymentTransactions.sort((a, b) => 
        new Date(a.paymentDate) - new Date(b.paymentDate)
      );

      // Update total amount and payment dates
      history.totalPaidAmount += amount;
      history.lastPaymentDate = paymentDate;
    }

    await history.save();
    return history;
  } catch (error) {
    throw error;
  }
};

const TenantPaymentHistory = mongoose.model('TenantPaymentHistory', TenantPaymentHistorySchema);

module.exports = TenantPaymentHistory;