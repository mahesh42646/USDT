const Admin = require('../schemas/admin');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const Investment = require('../schemas/investment');
const Withdrawal = require('../schemas/withdrawal');
const Referral = require('../schemas/referral');

// Generate JWT token for admin
const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'admin' },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '24h' }
  );
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login',
    });
  }
};

// Get Admin Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });

    // Get total investment
    const totalInvestmentResult = await Investment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalInvestment = totalInvestmentResult[0]?.total || 0;

    // Get total interest generated (sum of all interest balances)
    const totalInterestResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$interestBalance' } } },
    ]);
    const totalInterestGenerated = totalInterestResult[0]?.total || 0;

    // Get pending withdrawals
    const pendingWithdrawalsResult = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingWithdrawals = pendingWithdrawalsResult[0]?.total || 0;
    const pendingWithdrawalsCount = await Withdrawal.countDocuments({ status: 'pending' });

    // Get total referrals count
    const totalReferralsCount = await Referral.countDocuments();

    // Get recent activities (last 10)
    const recentInvestments = await Investment.find()
      .populate('userId', 'mobile fullName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type status createdAt transactionHash userId');

    const recentWithdrawals = await Withdrawal.find()
      .populate('userId', 'mobile fullName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount status createdAt processedAt userId');

    // Get statistics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const investmentsLast30Days = await Investment.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const investmentLast30Days = investmentsLast30Days[0]?.total || 0;

    // Get inactive users count
    const inactiveUsers = totalUsers - activeUsers;

    // Get withdrawal status breakdown
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
    const rejectedWithdrawals = await Withdrawal.countDocuments({ status: 'rejected' });

    // Get investment status breakdown
    const confirmedInvestments = await Investment.countDocuments({ status: 'confirmed' });
    const pendingInvestments = await Investment.countDocuments({ status: 'pending' });
    const rejectedInvestments = await Investment.countDocuments({ status: 'rejected' });

    // Get daily data for last 30 days (for charts)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayUsers = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      const dayInvestments = await Investment.aggregate([
        {
          $match: {
            status: 'confirmed',
            createdAt: { $gte: date, $lt: nextDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const dayWithdrawals = await Withdrawal.aggregate([
        {
          $match: {
            status: 'approved',
            createdAt: { $gte: date, $lt: nextDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      dailyData.push({
        date: date.toISOString().split('T')[0],
        users: dayUsers,
        investments: dayInvestments[0]?.total || 0,
        withdrawals: dayWithdrawals[0]?.total || 0,
      });
    }

    // Get monthly investment trend (last 6 months)
    const monthlyInvestmentData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);

      const monthInvestments = await Investment.aggregate([
        {
          $match: {
            status: 'confirmed',
            createdAt: { $gte: date, $lt: nextDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      monthlyInvestmentData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: monthInvestments[0]?.total || 0,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalInvestment,
          totalInterestGenerated,
          pendingWithdrawals,
          pendingWithdrawalsCount,
          totalReferralsCount,
          newUsersLast30Days,
          investmentLast30Days,
        },
        charts: {
          userStatus: {
            active: activeUsers,
            inactive: inactiveUsers,
          },
          withdrawalStatus: {
            pending: pendingWithdrawalsCount,
            approved: approvedWithdrawals,
            rejected: rejectedWithdrawals,
          },
          investmentStatus: {
            confirmed: confirmedInvestments,
            pending: pendingInvestments,
            rejected: rejectedInvestments,
          },
          dailyTrends: dailyData,
          monthlyInvestment: monthlyInvestmentData,
        },
        recentActivities: {
          investments: recentInvestments,
          withdrawals: recentWithdrawals,
        },
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin profile',
    });
  }
};