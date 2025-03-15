const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  passwordChangedAt: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['admin', 'administrator', 'tenant'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Method to check if password was changed after token was issued
UserSchema.methods.passwordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Pre-save middleware to update passwordChangedAt when password is modified
UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  
  // Set passwordChangedAt to current time
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

module.exports = mongoose.model('User', UserSchema);