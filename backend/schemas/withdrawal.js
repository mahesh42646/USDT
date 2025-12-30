const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 20, // Minimum 20 USDT
  },
  requestedAmount: {
    type: Number,
    required: true,
  },
  networkFee: {
    type: Number,
    default: 0,
  },
  usdtAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: {
    type: Date,
    default: null,
  },
  transactionHash: {
    type: String,
    default: '',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  withdrawalType: {
    type: String,
    enum: ['interest', 'investment'],
    default: 'interest',
  },
});

// Index for user withdrawals query
withdrawalSchema.index({ userId: 1, requestDate: -1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
