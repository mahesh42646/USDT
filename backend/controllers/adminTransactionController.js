const Investment = require('../schemas/investment');
const Withdrawal = require('../schemas/withdrawal');
const Referral = require('../schemas/referral');
const User = require('../schemas/user');

// Get All Transactions (Combined)
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let transactions = [];

    // Get investments
    if (!type || type === 'all' || type === 'investment') {
      let investmentQuery = {};
      if (status && status !== 'all') {
        investmentQuery.status = status;
      }
      if (search) {
        const users = await User.find({
          $or: [
            { mobile: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');
        const userIds = users.map(u => u._id);
        investmentQuery.userId = { $in: userIds };
      }

      const investments = await Investment.find(investmentQuery)
        .populate('userId', 'mobile fullName email')
        .sort({ createdAt: -1 })
        .select('amount type status createdAt transactionHash userId');

      transactions.push(...investments.map(inv => ({
        id: inv._id,
        type: 'investment',
        userId: inv.userId?._id,
        user: inv.userId ? {
          mobile: inv.userId.mobile,
          fullName: inv.userId.fullName,
          email: inv.userId.email,
        } : null,
        amount: inv.amount,
        status: inv.status,
        transactionHash: inv.transactionHash,
        date: inv.createdAt,
        investmentType: inv.type,
      })));
    }

    // Get withdrawals
    if (!type || type === 'all' || type === 'withdrawal') {
      let withdrawalQuery = {};
      if (status && status !== 'all') {
        withdrawalQuery.status = status;
      }
      if (search) {
        const users = await User.find({
          $or: [
            { mobile: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');
        const userIds = users.map(u => u._id);
        withdrawalQuery.userId = { $in: userIds };
      }

      const withdrawals = await Withdrawal.find(withdrawalQuery)
        .populate('userId', 'mobile fullName email')
        .sort({ requestDate: -1 })
        .select('amount status requestDate processedDate transactionHash userId withdrawalType');

      transactions.push(...withdrawals.map(wd => ({
        id: wd._id,
        type: 'withdrawal',
        userId: wd.userId?._id,
        user: wd.userId ? {
          mobile: wd.userId.mobile,
          fullName: wd.userId.fullName,
          email: wd.userId.email,
        } : null,
        amount: wd.amount,
        status: wd.status,
        transactionHash: wd.transactionHash,
        date: wd.requestDate,
        withdrawalType: wd.withdrawalType,
        processedDate: wd.processedDate,
      })));
    }

    // Get referrals (referral income)
    if (!type || type === 'all' || type === 'referral') {
      let referralQuery = {};
      if (search) {
        const users = await User.find({
          $or: [
            { mobile: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');
        const userIds = users.map(u => u._id);
        referralQuery.referrerId = { $in: userIds };
      }

      const referrals = await Referral.find(referralQuery)
        .populate('referrerId', 'mobile fullName email')
        .populate('referredUserId', 'mobile fullName')
        .sort({ createdAt: -1 })
        .select('referrerId referredUserId totalIncome status createdAt');

      transactions.push(...referrals.map(ref => ({
        id: ref._id,
        type: 'referral',
        userId: ref.referrerId?._id,
        user: ref.referrerId ? {
          mobile: ref.referrerId.mobile,
          fullName: ref.referrerId.fullName,
          email: ref.referrerId.email,
        } : null,
        referredUser: ref.referredUserId ? {
          mobile: ref.referredUserId.mobile,
          fullName: ref.referredUserId.fullName,
        } : null,
        amount: ref.totalIncome || 0,
        status: ref.status,
        transactionHash: null,
        date: ref.createdAt,
      })));
    }

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions',
    });
  }
};
