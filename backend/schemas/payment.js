const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    min: 10,
  },
  currency: {
    type: String,
    default: 'USDT',
  },
  paymentMethod: {
    type: String,
    enum: ['gateway', 'trc20', 'p2p', 'other'],
    required: true,
  },
  // Gateway payment details
  gatewayProvider: {
    type: String,
    enum: ['coingate', 'nowpayments', 'other'],
    default: null,
  },
  gatewayOrderId: {
    type: String,
    default: null,
    index: true,
  },
  gatewayPaymentId: {
    type: String,
    default: null,
  },
  gatewayPaymentUrl: {
    type: String,
    default: null,
  },
  // TRC20/P2P payment details
  transactionHash: {
    type: String,
    default: null,
    index: true,
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  // Additional payment info
  paymentData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null, // For gateway payments that expire
  },
});

// Indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ transactionHash: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

