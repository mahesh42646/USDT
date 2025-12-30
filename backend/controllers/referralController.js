const Referral = require('../schemas/referral');
const User = require('../schemas/user');
const ReferralWallet = require('../schemas/referralWallet');

// Get referral network
exports.getReferralNetwork = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const referrals = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'mobile fullName totalInvestment createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: referrals.map(ref => ({
        id: ref._id,
        referredUser: ref.referredUserId,
        status: ref.status,
        activatedAt: ref.activatedAt,
        totalIncome: ref.totalIncome,
        createdAt: ref.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get referral network error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch referral network',
    });
  }
};

// Get referral stats
exports.getReferralStats = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const referralWallet = await ReferralWallet.findOne({ userId: user._id });
    const referrals = await Referral.find({ referrerId: user._id });

    res.json({
      success: true,
      data: {
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter(r => r.status === 'active').length,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        totalIncome: referralWallet?.totalEarned || 0,
        totalInvested: referralWallet?.totalInvested || 0,
        pendingBalance: referralWallet?.pendingBalance || 0,
        totalInvestment: user.totalInvestment || 0,
      },
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch referral stats',
    });
  }
};

// Get referral income history
exports.getReferralIncomeHistory = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const referralWallet = await ReferralWallet.findOne({ userId: user._id });
    
    if (!referralWallet) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: referralWallet.transactions || [],
    });
  } catch (error) {
    console.error('Get referral income history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch referral income history',
    });
  }
};
