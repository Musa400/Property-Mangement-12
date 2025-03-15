const mongoose = require('mongoose');

const FinancialTransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Income', 'Expense', 'Rent Payment'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  },
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant' 
  }
}, { timestamps: true });

module.exports = mongoose.model('FinancialTransaction', FinancialTransactionSchema);