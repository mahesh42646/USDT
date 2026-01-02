const Investment = require('../schemas/investment');
const User = require('../schemas/user');

// Create Investment for User (Admin)
exports.createInvestment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, transactionHash, type = 'new', lockInDays = 90 } = req.body;

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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate lock-in end date
    const now = new Date();
    const lockInEndDate = new Date(now);
    lockInEndDate.setDate(lockInEndDate.getDate() + parseInt(lockInDays));

    const investment = new Investment({
      userId: user._id,
      amount: parseFloat(amount),
      transactionHash: transactionHash.trim(),
      type: type,
      status: 'confirmed', // Admin-created investments are auto-confirmed
      lockInEndDate: lockInEndDate,
      isAvailableForWithdrawal: parseInt(lockInDays) === 0, // Available if no lock-in
      confirmedAt: now,
    });

    await investment.save();

    // Update user balances
    user.totalInvestment = (user.totalInvestment || 0) + parseFloat(amount);
    user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + parseFloat(amount);
    await user.save();

    res.json({
      success: true,
      message: 'Investment created successfully',
      data: { investment },
    });
  } catch (error) {
    console.error('Admin create investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create investment',
    });
  }
};

// Update Investment (Admin)
exports.updateInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { amount, status, lockInDays, transactionHash, adminNotes } = req.body;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    const user = await User.findById(investment.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldAmount = investment.amount;
    const oldStatus = investment.status;

    // Update amount if provided
    if (amount !== undefined && amount !== oldAmount) {
      const amountDiff = parseFloat(amount) - oldAmount;
      investment.amount = parseFloat(amount);
      
      // Update user balances
      user.totalInvestment = (user.totalInvestment || 0) + amountDiff;
      user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + amountDiff;
    }

    // Update status if provided
    if (status && status !== oldStatus) {
      investment.status = status;
      if (status === 'confirmed' && !investment.confirmedAt) {
        investment.confirmedAt = new Date();
      }
    }

    // Update lock-in period if provided
    if (lockInDays !== undefined) {
      const lockInDaysNum = parseInt(lockInDays);
      if (lockInDaysNum >= 0) {
        const baseDate = investment.confirmedAt || investment.createdAt;
        const lockInEndDate = new Date(baseDate);
        lockInEndDate.setDate(lockInEndDate.getDate() + lockInDaysNum);
        investment.lockInEndDate = lockInEndDate;
        investment.isAvailableForWithdrawal = lockInDaysNum === 0 || new Date() >= lockInEndDate;
      }
    }

    // Update transaction hash if provided
    if (transactionHash) {
      // Check if new hash already exists
      if (transactionHash !== investment.transactionHash) {
        const existing = await Investment.findOne({ transactionHash: transactionHash.trim() });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'This transaction hash has already been used',
          });
        }
        investment.transactionHash = transactionHash.trim();
      }
    }

    // Update admin notes
    if (adminNotes !== undefined) {
      investment.adminNotes = adminNotes;
    }

    await investment.save();
    await user.save();

    res.json({
      success: true,
      message: 'Investment updated successfully',
      data: { investment },
    });
  } catch (error) {
    console.error('Admin update investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update investment',
    });
  }
};

// Delete Investment (Admin)
exports.deleteInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    const user = await User.findById(investment.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only allow deletion if investment is not confirmed or if confirmed, reduce user balances
    if (investment.status === 'confirmed') {
      user.totalInvestment = Math.max(0, (user.totalInvestment || 0) - investment.amount);
      user.currentInvestmentBalance = Math.max(0, (user.currentInvestmentBalance || 0) - investment.amount);
      await user.save();
    }

    await Investment.findByIdAndDelete(investmentId);

    res.json({
      success: true,
      message: 'Investment deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete investment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete investment',
    });
  }
};
