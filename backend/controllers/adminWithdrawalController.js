const Withdrawal = require('../schemas/withdrawal');
const User = require('../schemas/user');

// Get All Withdrawals
exports.getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { mobile: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'mobile fullName email')
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      success: true,
      data: {
        withdrawals: withdrawals.map(wd => ({
          id: wd._id,
          userId: wd.userId?._id,
          user: wd.userId ? {
            mobile: wd.userId.mobile,
            fullName: wd.userId.fullName,
            email: wd.userId.email,
          } : null,
          amount: wd.amount,
          requestedAmount: wd.requestedAmount,
          networkFee: wd.networkFee,
          usdtAddress: wd.usdtAddress,
          status: wd.status,
          withdrawalType: wd.withdrawalType,
          requestDate: wd.requestDate,
          processedDate: wd.processedDate,
          transactionHash: wd.transactionHash,
          adminNotes: wd.adminNotes,
          rejectionReason: wd.rejectionReason,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch withdrawals',
    });
  }
};

// Get Withdrawal Details
exports.getWithdrawalDetails = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId', 'mobile fullName email totalInvestment interestBalance');

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    res.json({
      success: true,
      data: {
        withdrawal: {
          id: withdrawal._id,
          userId: withdrawal.userId?._id,
          user: withdrawal.userId ? {
            mobile: withdrawal.userId.mobile,
            fullName: withdrawal.userId.fullName,
            email: withdrawal.userId.email,
            totalInvestment: withdrawal.userId.totalInvestment,
            interestBalance: withdrawal.userId.interestBalance,
          } : null,
          amount: withdrawal.amount,
          requestedAmount: withdrawal.requestedAmount,
          networkFee: withdrawal.networkFee,
          usdtAddress: withdrawal.usdtAddress,
          status: withdrawal.status,
          withdrawalType: withdrawal.withdrawalType,
          requestDate: withdrawal.requestDate,
          processedDate: withdrawal.processedDate,
          transactionHash: withdrawal.transactionHash,
          adminNotes: withdrawal.adminNotes,
          rejectionReason: withdrawal.rejectionReason,
        },
      },
    });
  } catch (error) {
    console.error('Get withdrawal details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch withdrawal details',
    });
  }
};

// Approve Withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionHash, adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId');

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      });
    }

    withdrawal.status = 'approved';
    if (transactionHash) {
      withdrawal.transactionHash = transactionHash;
    }
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    withdrawal.processedDate = new Date();
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        withdrawal: {
          id: withdrawal._id,
          status: withdrawal.status,
          transactionHash: withdrawal.transactionHash,
        },
      },
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve withdrawal',
    });
  }
};

// Reject Withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      });
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = rejectionReason;
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    withdrawal.processedDate = new Date();
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal rejected successfully',
      data: {
        withdrawal: {
          id: withdrawal._id,
          status: withdrawal.status,
        },
      },
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject withdrawal',
    });
  }
};

// Process Withdrawal (Mark as processed after payment)
exports.processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required',
      });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId');

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal must be approved before processing',
      });
    }

    withdrawal.status = 'processed';
    withdrawal.transactionHash = transactionHash;
    withdrawal.processedDate = new Date();
    await withdrawal.save();

    // Deduct from user balance
    if (withdrawal.userId) {
      if (withdrawal.withdrawalType === 'interest') {
        withdrawal.userId.interestBalance = Math.max(0, (withdrawal.userId.interestBalance || 0) - withdrawal.amount);
      }
      await withdrawal.userId.save();
    }

    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
      data: {
        withdrawal: {
          id: withdrawal._id,
          status: withdrawal.status,
          transactionHash: withdrawal.transactionHash,
        },
      },
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal',
    });
  }
};

// Update Withdrawal Status (Admin - General status update)
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, transactionHash, networkFee, adminNotes, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'processed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    const oldStatus = withdrawal.status;

    // Prevent invalid status transitions
    if (oldStatus === 'processed' && status !== 'processed') {
      return res.status(400).json({ success: false, message: 'Cannot change status of processed withdrawal' });
    }

    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot change status of cancelled withdrawal' });
    }

    withdrawal.status = status;

    if (status === 'approved' || status === 'processed') {
      withdrawal.processedDate = new Date();
    }

    if (status === 'rejected' && rejectionReason) {
      withdrawal.rejectionReason = rejectionReason;
    }

    if (transactionHash) {
      withdrawal.transactionHash = transactionHash;
    }

    if (networkFee !== undefined) {
      withdrawal.networkFee = networkFee;
    }

    if (adminNotes !== undefined) {
      withdrawal.adminNotes = adminNotes;
    }

    await withdrawal.save();

    // Update user balances if status changed to processed
    if (status === 'processed' && oldStatus !== 'processed') {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        if (withdrawal.withdrawalType === 'interest') {
          user.interestBalance = Math.max(0, (user.interestBalance || 0) - withdrawal.amount);
        } else if (withdrawal.withdrawalType === 'investment') {
          user.currentInvestmentBalance = Math.max(0, (user.currentInvestmentBalance || 0) - withdrawal.amount);
        }
        user.lastWithdrawalDate = new Date();
        await user.save();
      }
    }

    res.json({ success: true, message: 'Withdrawal status updated successfully', data: { withdrawal } });
  } catch (error) {
    console.error('Admin update withdrawal status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update withdrawal status',
    });
  }
};
