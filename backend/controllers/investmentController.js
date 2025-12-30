const Investment = require('../schemas/investment');
const User = require('../schemas/user');
const Referral = require('../schemas/referral');
const ReferralWallet = require('../schemas/referralWallet');

// Add new investment
exports.addInvestment = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { amount, transactionHash } = req.body;

    // Validate input
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment is 10 USDT',
      });
    }

    if (!transactionHash || transactionHash.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required',
      });
    }

    // Check if transaction hash already exists
    const existing = await Investment.findOne({ transactionHash: transactionHash.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This transaction hash has already been used',
      });
    }

    // Get user
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create investment - TRC20 payments are pending until admin verification
    const now = new Date();
    const lockInEndDate = new Date(now);
    lockInEndDate.setDate(lockInEndDate.getDate() + 90); // 90 days lock-in

    const investment = new Investment({
      userId: user._id,
      amount: parseFloat(amount),
      transactionHash: transactionHash.trim(),
      type: 'new',
      status: 'pending', // Pending until admin verifies TRC20 payment
      lockInEndDate: lockInEndDate,
      isAvailableForWithdrawal: false, // Locked for 90 days
    });

    await investment.save();

    // DO NOT update user balance or award PlatoCoins until investment is confirmed by admin
    // This will be done in the confirmInvestment function

    res.json({
      success: true,
      message: 'Investment request submitted successfully! It will be pending until admin verifies your TRC20 payment.',
      investment: {
        id: investment._id,
        amount: investment.amount,
        transactionHash: investment.transactionHash,
        status: investment.status,
        createdAt: investment.createdAt,
      },
    });
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add investment',
    });
  }
};

// Get investment history
exports.getInvestmentHistory = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const investments = await Investment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('amount type status transactionHash createdAt');

    res.json({
      success: true,
      data: investments,
    });
  } catch (error) {
    console.error('Get investment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch investment history',
    });
  }
};

// Confirm investment (Admin function - can be called manually for testing)
exports.confirmInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    if (investment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Investment already confirmed',
      });
    }

    // Update investment status
    investment.status = 'confirmed';
    investment.confirmedAt = new Date();
    
    // Set lock-in end date if not already set
    if (!investment.lockInEndDate) {
      const lockInEndDate = new Date(investment.confirmedAt);
      lockInEndDate.setDate(lockInEndDate.getDate() + 90);
      investment.lockInEndDate = lockInEndDate;
    }
    
    await investment.save();

    // Update user's total investment and award PlatoCoins
    const user = await User.findById(investment.userId);
    if (user) {
      user.totalInvestment = (user.totalInvestment || 0) + investment.amount;
      user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + investment.amount;
      
      // Award PlatoCoins (1:1 ratio with investment amount)
      user.platoCoins = (user.platoCoins || 0) + investment.amount;
      
      await user.save();

      // If this is user's first investment and they have a referrer, activate referral
      if (user.referrerId && user.totalInvestment >= 10) {
        const referral = await Referral.findOne({
          referrerId: user.referrerId,
          referredUserId: user._id,
        });

        if (referral && referral.status === 'pending') {
          referral.status = 'active';
          referral.activatedAt = new Date();
          await referral.save();

          // Update referrer's active referrals count
          const referrer = await User.findById(user.referrerId);
          if (referrer) {
            referrer.directActiveReferrals = (referrer.directActiveReferrals || 0) + 1;
            await referrer.save();
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Investment confirmed successfully',
      investment: {
        id: investment._id,
        amount: investment.amount,
        status: investment.status,
      },
    });
  } catch (error) {
    console.error('Confirm investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm investment',
    });
  }
};

// Reject investment (Admin function)
exports.rejectInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { reason } = req.body;
    
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    if (investment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a confirmed investment',
      });
    }

    if (investment.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Investment already rejected',
      });
    }

    // Update investment status
    investment.status = 'rejected';
    if (reason) {
      investment.adminNotes = reason;
    }
    await investment.save();

    res.json({
      success: true,
      message: 'Investment rejected successfully',
      investment: {
        id: investment._id,
        amount: investment.amount,
        status: investment.status,
      },
    });
  } catch (error) {
    console.error('Reject investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject investment',
    });
  }
};
