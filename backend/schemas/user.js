const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  fullName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
    lowercase: true,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  referralCode: {
    type: String,
    unique: true,
    required: false, // Will be auto-generated in pre-save hook
  },
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  totalInvestment: {
    type: Number,
    default: 0,
  },
  currentInvestmentBalance: {
    type: Number,
    default: 0,
  },
  interestBalance: {
    type: Number,
    default: 0,
  },
  monthlyInterestAccumulated: {
    type: Number,
    default: 0,
  },
  directReferrals: {
    type: Number,
    default: 0,
  },
  directActiveReferrals: {
    type: Number,
    default: 0,
  },
  lastWithdrawalDate: {
    type: Date,
    default: null,
  },
  lastActivityDate: {
    type: Date,
    default: Date.now,
  },
  accountStatus: {
    type: String,
    enum: ['active', 'frozen', 'inactive'],
    default: 'active',
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  platoCoins: {
    type: Number,
    default: 0,
    min: 0,
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

// Generate unique 12-digit alphanumeric referral code before saving
userSchema.pre('save', async function(next) {
  // Always generate referralCode if it doesn't exist (for new users or updates)
  if (!this.referralCode) {
    let code;
    let isUnique = false;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Alphanumeric characters
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      // Generate 12-digit alphanumeric code
      code = '';
      for (let i = 0; i < 12; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Check if code is unique
      const existing = await mongoose.model('User').findOne({ referralCode: code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return next(new Error('Failed to generate unique referral code'));
    }
    
    this.referralCode = code;
  }
  this.updatedAt = Date.now();
  next();
});

// Update last activity on any update
userSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ lastActivityDate: Date.now() });
  next();
});

module.exports = mongoose.model('User', userSchema);
