const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  referralCode: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending',
  },
  // Referral becomes active when referred user invests
  activatedAt: {
    type: Date,
    default: null,
  },
  // Total referral income earned from this referral
  totalIncome: {
    type: Number,
    default: 0,
  },
  // Last income credited date
  lastIncomeDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
referralSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Referral', referralSchema);
