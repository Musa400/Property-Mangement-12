const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  incomeType: {
    type: String,
    enum: ['Rent', 'Services', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank', 'Online', 'Check'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Income', IncomeSchema);