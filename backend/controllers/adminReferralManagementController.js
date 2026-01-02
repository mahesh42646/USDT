const Referral = require('../schemas/referral');
const User = require('../schemas/user');
const Investment = require('../schemas/investment');

// Add New Referral (Admin)
exports.addReferral = async (req, res) => {
  try {
    const { userId } = req.params;
    const { referredUserId, referralCode } = req.body;

    if (!referredUserId) {
      return res.status(400).json({
        success: false,
        message: 'Referred user ID is required',
      });
    }

    const referrer = await User.findById(userId);
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Referrer user not found',
      });
    }

    const referredUser = await User.findById(referredUserId);
    if (!referredUser) {
      return res.status(404).json({
        success: false,
        message: 'Referred user not found',
      });
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({ referredUserId });
    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'This user is already referred by someone else',
      });
    }

    // Check if user is trying to refer themselves
    if (userId === referredUserId) {
      return res.status(400).json({
        success: false,
        message: 'User cannot refer themselves',
      });
    }

    // Create referral
    const referral = new Referral({
      referrerId: referrer._id,
      referredUserId: referredUser._id,
      referralCode: referralCode || referrer.referralCode,
      status: 'pending', // Will be active when referred user invests
    });

    await referral.save();

    // Update referrer's direct referrals count
    referrer.directReferrals = (referrer.directReferrals || 0) + 1;
    await referrer.save();

    // Update referred user's referrerId
    referredUser.referrerId = referrer._id;
    await referredUser.save();

    res.json({
      success: true,
      message: 'Referral added successfully',
      data: { referral },
    });
  } catch (error) {
    console.error('Admin add referral error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add referral',
    });
  }
};

// Mark Referral as Complete/Active (Admin)
exports.markReferralComplete = async (req, res) => {
  try {
    const { referralId } = req.params;

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    if (referral.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Referral is already active',
      });
    }

    // Check if referred user has any confirmed investments
    const hasInvestment = await Investment.findOne({
      userId: referral.referredUserId,
      status: 'confirmed',
    });

    if (!hasInvestment) {
      return res.status(400).json({
        success: false,
        message: 'Referred user must have at least one confirmed investment to activate referral',
      });
    }

    // Update referral status
    referral.status = 'active';
    referral.activatedAt = new Date();
    await referral.save();

    // Update referrer's active referrals count
    const referrer = await User.findById(referral.referrerId);
    if (referrer) {
      referrer.directActiveReferrals = (referrer.directActiveReferrals || 0) + 1;
      await referrer.save();
    }

    res.json({
      success: true,
      message: 'Referral marked as active successfully',
      data: { referral },
    });
  } catch (error) {
    console.error('Admin mark referral complete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark referral as complete',
    });
  }
};
