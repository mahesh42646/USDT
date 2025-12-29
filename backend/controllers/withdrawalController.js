const Withdrawal = require('../schemas/withdrawal');
const User = require('../schemas/user');
const Investment = require('../schemas/investment');

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { amount, usdtAddress, type = 'interest' } = req.body; // type: 'interest' or 'investment'

    // Validate input
    if (!amount || amount < 20) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal is 20 USDT',
      });
    }

    if (!usdtAddress || usdtAddress.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'USDT address is required',
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

    // Check if withdrawal is locked
    if (user.totalInvestment < 500) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal is locked. You need to invest minimum 500 USDT to unlock withdrawals.',
      });
    }

    // Check if user has already withdrawn this month (only for interest withdrawals)
    if (type === 'interest') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyWithdrawal = await Withdrawal.findOne({
        userId: user._id,
        withdrawalType: 'interest',
        status: { $in: ['pending', 'approved', 'processed'] },
        requestDate: { $gte: startOfMonth },
      });

      if (monthlyWithdrawal) {
        return res.status(400).json({
          success: false,
          message: 'You can only withdraw interest once per month. You already have a withdrawal request this month.',
        });
      }
    }

    if (type === 'interest') {
      // Check maximum withdrawal (30% of monthly interest)
      const maxWithdrawal = (user.monthlyInterestAccumulated * 30) / 100;
      if (amount > maxWithdrawal) {
        return res.status(400).json({
          success: false,
          message: `Maximum withdrawal is ${maxWithdrawal.toFixed(2)} USDT (30% of monthly interest)`,
        });
      }

      // Check if user has enough interest balance
      if (amount > user.interestBalance) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient interest balance',
        });
      }
    } else if (type === 'investment') {
      // Get available investments (unlocked after 90 days)
      const now = new Date();
      const availableInvestments = await Investment.find({
        userId: user._id,
        status: 'confirmed',
        type: 'new',
        $or: [
          { isAvailableForWithdrawal: true },
          { lockInEndDate: { $lte: now } },
        ],
      });

      const availableAmount = availableInvestments.reduce((sum, inv) => sum + inv.amount, 0);

      if (amount > availableAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient available investment. Available: ${availableAmount.toFixed(2)} USDT`,
        });
      }
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      amount: parseFloat(amount),
      requestedAmount: parseFloat(amount),
      usdtAddress: usdtAddress.trim(),
      withdrawalType: type, // 'interest' or 'investment'
      status: 'pending',
    });

    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestDate: withdrawal.requestDate,
      },
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit withdrawal request',
    });
  }
};

// Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ requestDate: -1 })
      .select('amount status requestDate processedDate transactionHash');

    res.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch withdrawal history',
    });
  }
};

// Get withdrawal stats
exports.getWithdrawalStats = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if withdrawal is locked
    const isLocked = user.totalInvestment < 500;
    
    // Calculate max withdrawal from interest (30% of monthly interest)
    const maxInterestWithdrawal = (user.monthlyInterestAccumulated * 30) / 100;
    
    // Get all investments with lock-in information
    const investments = await Investment.find({
      userId: user._id,
      status: 'confirmed',
      type: 'new', // Only new investments have lock-in, not referral income
    }).sort({ createdAt: -1 });

    const now = new Date();
    let availableInvestmentAmount = 0;
    let lockedInvestmentAmount = 0;
    const investmentDetails = investments.map(inv => {
      // Use existing lockInEndDate if available, otherwise calculate from investment date
      let lockInEndDate;
      if (inv.lockInEndDate) {
        lockInEndDate = new Date(inv.lockInEndDate); // Create a copy to avoid modifying original
      } else {
        // Calculate from investment date (confirmedAt or createdAt) + 90 days
        const investmentDate = new Date(inv.confirmedAt || inv.createdAt);
        lockInEndDate = new Date(investmentDate);
        lockInEndDate.setDate(lockInEndDate.getDate() + 90);
      }
      
      const isAvailable = lockInEndDate <= now || inv.isAvailableForWithdrawal;
      const daysRemaining = Math.max(0, Math.ceil((lockInEndDate - now) / (1000 * 60 * 60 * 24)));
      
      if (isAvailable) {
        availableInvestmentAmount += inv.amount;
      } else {
        lockedInvestmentAmount += inv.amount;
      }
      
      return {
        id: inv._id,
        amount: inv.amount,
        investmentDate: inv.confirmedAt || inv.createdAt,
        lockInEndDate: lockInEndDate,
        isAvailable: isAvailable,
        daysRemaining: daysRemaining,
        transactionHash: inv.transactionHash,
      };
    });
    
    // Check if user can withdraw this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyWithdrawal = await Withdrawal.findOne({
      userId: user._id,
      status: { $in: ['pending', 'approved', 'processed'] },
      requestDate: { $gte: startOfMonth },
    });

    const canWithdrawInterest = !isLocked && !monthlyWithdrawal && user.interestBalance >= 20;
    const canWithdrawInvestment = !isLocked && availableInvestmentAmount >= 20;

    res.json({
      success: true,
      data: {
        // Interest withdrawal info
        availableInterestBalance: user.interestBalance || 0,
        maxInterestWithdrawal: maxInterestWithdrawal,
        canWithdrawInterest: canWithdrawInterest,
        
        // Investment withdrawal info
        totalInvestment: user.totalInvestment || 0,
        availableInvestmentAmount: availableInvestmentAmount,
        lockedInvestmentAmount: lockedInvestmentAmount,
        canWithdrawInvestment: canWithdrawInvestment,
        investmentDetails: investmentDetails,
        
        // General info
        isLocked: isLocked,
        monthlyInterestAccumulated: user.monthlyInterestAccumulated || 0,
        hasMonthlyWithdrawal: !!monthlyWithdrawal,
      },
    });
  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch withdrawal stats',
    });
  }
};
