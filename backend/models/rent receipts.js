const mongoose = require('mongoose');

const RentReceiptSchema = new mongoose.Schema({
  tenantName: {
    type: String,
    required: true,
    trim: true
  },
  propertyAddress: {
    type: String,
    required: true,
    trim: true
  },
  rentPeriod: {
    type: String,
    required: true
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Check', 'Online Transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Paid'
  },
  bankCheckDetails: {
    bankName: {
      type: String,
      trim: true
    },
    bankCheckNumber: {
      type: String,
      trim: true
    },
    checkIssueDate: {
      type: Date
    }
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RentReceipt', RentReceiptSchema);