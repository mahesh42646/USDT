const User = require('../schemas/user');
const Investment = require('../schemas/investment');
const Withdrawal = require('../schemas/withdrawal');
const Referral = require('../schemas/referral');
const ReferralWallet = require('../schemas/referralWallet');
const USDTWallet = require('../schemas/usdtWallet');

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { mobile: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { referralCode: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          mobile: user.mobile,
          fullName: user.fullName || 'N/A',
          email: user.email || 'N/A',
          referralCode: user.referralCode,
          totalInvestment: user.totalInvestment || 0,
          currentInvestmentBalance: user.currentInvestmentBalance || 0,
          interestBalance: user.interestBalance || 0,
          accountStatus: user.accountStatus || 'active',
          directReferrals: user.directReferrals || 0,
          directActiveReferrals: user.directActiveReferrals || 0,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

// Get User Details (Complete)
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user investments
    const investments = await Investment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('amount type status createdAt transactionHash');

    // Get user referrals
    const referrals = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'mobile fullName totalInvestment createdAt')
      .sort({ createdAt: -1 });

    // Get user withdrawals
    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('amount status createdAt processedAt transactionHash');

    // Get referral wallet
    const referralWallet = await ReferralWallet.findOne({ userId: user._id });

    // Get USDT wallet
    const usdtWallet = await USDTWallet.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          mobile: user.mobile,
          fullName: user.fullName,
          email: user.email,
          profilePhoto: user.profilePhoto,
          referralCode: user.referralCode,
          totalInvestment: user.totalInvestment || 0,
          currentInvestmentBalance: user.currentInvestmentBalance || 0,
          interestBalance: user.interestBalance || 0,
          monthlyInterestAccumulated: user.monthlyInterestAccumulated || 0,
          platoCoins: user.platoCoins || 0,
          directReferrals: user.directReferrals || 0,
          directActiveReferrals: user.directActiveReferrals || 0,
          accountStatus: user.accountStatus || 'active',
          isProfileComplete: user.isProfileComplete,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        investments,
        referrals: referrals.map(ref => ({
          id: ref._id,
          referredUser: ref.referredUserId,
          status: ref.status,
          activatedAt: ref.activatedAt,
          totalIncome: ref.totalIncome || 0,
          createdAt: ref.createdAt,
        })),
        withdrawals,
        referralWallet: {
          totalEarned: referralWallet?.totalEarned || 0,
          currentBalance: referralWallet?.currentBalance || 0,
        },
        usdtWallet: {
          currentBalance: usdtWallet?.currentBalance || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user details',
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
    if (updateData.email !== undefined) user.email = updateData.email;
    if (updateData.totalInvestment !== undefined) user.totalInvestment = parseFloat(updateData.totalInvestment);
    if (updateData.currentInvestmentBalance !== undefined) user.currentInvestmentBalance = parseFloat(updateData.currentInvestmentBalance);
    if (updateData.interestBalance !== undefined) user.interestBalance = parseFloat(updateData.interestBalance);
    if (updateData.accountStatus !== undefined) user.accountStatus = updateData.accountStatus;
    if (updateData.directReferrals !== undefined) user.directReferrals = parseInt(updateData.directReferrals);
    if (updateData.directActiveReferrals !== undefined) user.directActiveReferrals = parseInt(updateData.directActiveReferrals);

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          mobile: user.mobile,
          fullName: user.fullName,
          email: user.email,
          totalInvestment: user.totalInvestment,
          accountStatus: user.accountStatus,
        },
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete related data
    await Investment.deleteMany({ userId: user._id });
    await Referral.deleteMany({ referrerId: user._id });
    await Referral.deleteMany({ referredUserId: user._id });
    await Withdrawal.deleteMany({ userId: user._id });
    await ReferralWallet.deleteOne({ userId: user._id });
    await USDTWallet.deleteOne({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};

// Toggle User Status (Active/Inactive)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Toggle status
    user.accountStatus = user.accountStatus === 'active' ? 'frozen' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `User ${user.accountStatus === 'active' ? 'activated' : 'frozen'} successfully`,
      data: {
        user: {
          id: user._id,
          accountStatus: user.accountStatus,
        },
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle user status',
    });
  }
};
