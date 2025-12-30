const User = require('../schemas/user');
const Investment = require('../schemas/investment');
const Referral = require('../schemas/referral');
const ReferralWallet = require('../schemas/referralWallet');
const USDTWallet = require('../schemas/usdtWallet');
const Withdrawal = require('../schemas/withdrawal');

// Calculate daily interest based on PROJECT_RULES.md
function calculateDailyInterest(user) {
  const baseInterest = 0.50; // 0.50%
  const activeReferrals = user.directActiveReferrals || 0;
  const bonusInterest = Math.floor(activeReferrals / 10) * 0.05;
  const totalInterest = Math.min(baseInterest + bonusInterest, 2.00); // Cap at 2.00%
  
  // Special Investor Plan (10,000+ USDT)
  if (user.totalInvestment >= 10000) {
    return {
      percentage: 1.00,
      amount: (user.totalInvestment * 1.00) / 100,
      isSpecialPlan: true,
    };
  }
  
  return {
    percentage: totalInterest,
    amount: (user.totalInvestment * totalInterest) / 100,
    isSpecialPlan: false,
  };
}

exports.getDashboardData = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    
    // Get user with populated data
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get investments
    const investments = await Investment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type status createdAt transactionHash');

    // Get total investments
    const totalInvestments = await Investment.aggregate([
      { $match: { userId: user._id, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalInvested = totalInvestments[0]?.total || 0;

    // Get referrals
    const referrals = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'mobile fullName totalInvestment createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get referral wallet
    const referralWallet = await ReferralWallet.findOne({ userId: user._id });
    
    // Get USDT wallet
    const usdtWallet = await USDTWallet.findOne({ userId: user._id });

    // Get withdrawals
    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount status createdAt processedAt');

    // Calculate interest
    const interestData = calculateDailyInterest(user);

    // Calculate monthly interest (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyInterest = interestData.amount * 30; // Approximate

    // Investment history for chart (last 30 days)
    const investmentHistory = await Investment.aggregate([
      {
        $match: {
          userId: user._id,
          status: 'confirmed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Interest history (calculated daily)
    const interestHistory = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      interestHistory.push({
        date: date.toISOString().split('T')[0],
        amount: interestData.amount,
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          email: user.email,
          referralCode: user.referralCode,
          accountStatus: user.accountStatus,
          platoCoins: user.platoCoins || 0,
        },
        stats: {
          totalInvestment: user.totalInvestment || 0,
          currentInvestmentBalance: user.currentInvestmentBalance || 0,
          interestBalance: user.interestBalance || 0,
          monthlyInterestAccumulated: user.monthlyInterestAccumulated || 0,
          dailyInterest: interestData.amount,
          dailyInterestPercentage: interestData.percentage,
          isSpecialPlan: interestData.isSpecialPlan,
          directReferrals: user.directReferrals || 0,
          directActiveReferrals: user.directActiveReferrals || 0,
          referralIncome: referralWallet?.totalEarned || 0,
          usdtBalance: usdtWallet?.currentBalance || 0,
          withdrawalLocked: user.totalInvestment < 500,
        },
        investments: investments,
        referrals: referrals.map(ref => ({
          id: ref._id,
          referredUser: ref.referredUserId,
          status: ref.status,
          activatedAt: ref.activatedAt,
          totalIncome: ref.totalIncome,
          createdAt: ref.createdAt,
        })),
        withdrawals: withdrawals,
        charts: {
          investmentHistory: investmentHistory.map(item => ({
            _id: item._id,
            total: item.total || 0,
          })),
          interestHistory: interestHistory.map(item => ({
            date: item.date,
            amount: item.amount || 0,
          })),
        },
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?ref=${user.referralCode}`,
      },
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};

