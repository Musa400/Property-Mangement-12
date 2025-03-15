const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['تجارتی', 'تاسيسات', 'للمی', 'زراعتی', 'office', 'warehouse', 'residential', 'training', 'security']
  },
  size: {
    type: Number,
    min: 0
  },
  propertyValue: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance', 'restricted', 'available'],
    default: 'vacant'
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    neighborhood: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    }
  },
  // Security-specific fields
  securityStatus: {
    type: String,
    enum: ['cleared', 'pending', 'restricted'],
    default: 'pending'
  },
  securityClearanceLevel: {
    type: String,
    enum: ['top_secret', 'secret', 'confidential', 'restricted', 'unclassified'],
    default: 'restricted'
  },
  complianceStatus: {
    isCompliant: {
      type: Boolean,
      default: false
    },
    lastChecked: Date,
    violations: [{
      type: String,
      date: Date,
      description: String,
      status: {
        type: String,
        enum: ['open', 'resolved', 'in_progress']
      }
    }]
  },
  securityIncidents: [{
    type: {
      type: String,
      enum: ['unauthorized_access', 'security_breach', 'maintenance_violation', 'compliance_issue']
    },
    date: Date,
    description: String,
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for improved query performance
propertySchema.index({ title: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ securityStatus: 1 });
propertySchema.index({ province: 1 });
propertySchema.index({ type: 1 });

// Pre-save middleware to ensure required security fields
propertySchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.securityClearanceLevel) {
      this.securityClearanceLevel = 'restricted';
    }
    if (!this.securityStatus) {
      this.securityStatus = 'pending';
    }
  }
  next();
});

// Method to check if property requires security review
propertySchema.methods.requiresSecurityReview = function() {
  if (!this.complianceStatus.lastChecked) return true;
  
  const daysSinceLastCheck = Math.floor((Date.now() - this.complianceStatus.lastChecked) / (1000 * 60 * 60 * 24));
  return daysSinceLastCheck > 90; // Review every 90 days
};

propertySchema.set('strictPopulate', false);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;