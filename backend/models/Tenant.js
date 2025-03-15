const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactInfo: {
      phone: { type: String, required: true}
    },
    nationalId: { type: String, required: true, unique: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    leaseStartDate: { type: Date, required: true },
    leaseEndDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Overdue', 'Pending'], default: 'Pending' },
    name: { type: String, required: true } // Ensure name field is included and unique
  },
  { timestamps: true }
);

const Tenant = mongoose.model("Tenant", tenantSchema);
module.exports = Tenant;
