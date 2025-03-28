const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  leaseStartDate: {
    type: Date,
    required: true,
  },
  leaseEndDate: {
    type: Date,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, 
{ timestamps: true }
);

// Update updatedAt field on any update
tenantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
