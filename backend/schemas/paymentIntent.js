const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  derivedAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  derivationIndex: {
    type: Number,
    required: true,
    index: true,
  },
  asset: {
    type: String,
    default: 'USDT',
    enum: ['USDT'], // Only USDT supported
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'failed'],
    default: 'pending',
    index: true,
  },
  usdAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  convertedAmount: {
    type: Number,
    default: 0,
  },
  amountReceived: {
    type: Number,
    default: 0,
  },
  txHash: {
    type: String,
    default: null,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    default: null,
  },
});

// Index for efficient queries
paymentIntentSchema.index({ status: 1, expiresAt: 1 });
paymentIntentSchema.index({ userId: 1, status: 1 });
paymentIntentSchema.index({ derivedAddress: 1, status: 1 });

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
