const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 10, // Minimum 10 USDT
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['new', 'referral'], // new = user's own investment, referral = from referral income
    default: 'new',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },
  // If this is a referral income investment, link to referral
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    default: null,
  },
  // Admin notes
  adminNotes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
    default: null,
  },
  // Lock-in period: 90 days from investment date
  lockInEndDate: {
    type: Date,
    default: null,
  },
  // Whether this investment is available for withdrawal
  isAvailableForWithdrawal: {
    type: Boolean,
    default: false,
  },
});

// Index for user investments query
investmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Investment', investmentSchema);
