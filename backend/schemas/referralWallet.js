const mongoose = require('mongoose');

const referralWalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  // Total referral income earned (cumulative)
  totalEarned: {
    type: Number,
    default: 0,
  },
  // Total referral income added to investment
  totalInvested: {
    type: Number,
    default: 0,
  },
  // Pending referral income (not yet added to investment)
  pendingBalance: {
    type: Number,
    default: 0,
  },
  // Transaction history
  transactions: [{
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['earned', 'invested'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
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
referralWalletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReferralWallet', referralWalletSchema);

