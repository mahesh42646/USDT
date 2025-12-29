const mongoose = require('mongoose');

const usdtWalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  // USDT wallet address (TRC20)
  walletAddress: {
    type: String,
    default: '',
  },
  // Total USDT deposited
  totalDeposited: {
    type: Number,
    default: 0,
  },
  // Total USDT withdrawn
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  // Current balance (deposited - withdrawn)
  currentBalance: {
    type: Number,
    default: 0,
  },
  // Transaction history
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'investment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionHash: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
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
usdtWalletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('USDTWallet', usdtWalletSchema);

