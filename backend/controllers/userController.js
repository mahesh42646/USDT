const User = require('../schemas/user');
const Referral = require('../schemas/referral');
const ReferralWallet = require('../schemas/referralWallet');
const USDTWallet = require('../schemas/usdtWallet');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        // Add other Firebase Admin credentials if needed
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

exports.register = async (req, res) => {
  try {
    const { firebaseUID, mobile } = req.user; // From verifyFirebaseToken middleware
    const { fullName, email } = req.body;
    // Get referral code from body (sent as form field)
    const referralCode = req.body.referralCode || null;
    const profilePhoto = req.file ? `/uploads/profiles/${req.file.filename}` : '';

    // Check if user already exists
    let user = await User.findOne({ firebaseUID });

    if (user) {
      // User exists, update profile if provided
      if (fullName || email || profilePhoto) {
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (profilePhoto) user.profilePhoto = profilePhoto;
        user.isProfileComplete = !!(fullName && email);
        await user.save();
      }
      return res.json({
        success: true,
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          mobile: user.mobile,
          fullName: user.fullName,
          email: user.email,
          profilePhoto: user.profilePhoto,
          referralCode: user.referralCode,
          totalInvestment: user.totalInvestment,
          interestBalance: user.interestBalance,
          accountStatus: user.accountStatus,
          isProfileComplete: user.isProfileComplete,
        },
      });
    }

    // Create new user
    user = new User({
      firebaseUID,
      mobile,
      fullName: fullName || '',
      email: email || '',
      profilePhoto: profilePhoto || '',
      isProfileComplete: !!(fullName && email),
    });

    await user.save();

    // Handle referral code if provided
    if (referralCode) {
      try {
        // Find referrer by referral code
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        
        if (referrer && referrer._id.toString() !== user._id.toString()) {
          // Create referral relationship
          const referral = new Referral({
            referrerId: referrer._id,
            referredUserId: user._id,
            referralCode: referralCode.toUpperCase(),
            status: 'pending', // Will become active when user invests
          });
          await referral.save();

          // Update user's referrerId
          user.referrerId = referrer._id;
          await user.save();

          // Update referrer's direct referrals count
          referrer.directReferrals = (referrer.directReferrals || 0) + 1;
          await referrer.save();
        }
      } catch (refError) {
        console.error('Referral processing error:', refError);
        // Don't fail registration if referral fails
      }
    }

    // Create referral wallet for new user
    try {
      const referralWallet = new ReferralWallet({
        userId: user._id,
      });
      await referralWallet.save();
    } catch (walletError) {
      console.error('Referral wallet creation error:', walletError);
    }

    // Create USDT wallet for new user
    try {
      const usdtWallet = new USDTWallet({
        userId: user._id,
      });
      await usdtWallet.save();
    } catch (walletError) {
      console.error('USDT wallet creation error:', walletError);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUID: user.firebaseUID,
        mobile: user.mobile,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        referralCode: user.referralCode,
        totalInvestment: user.totalInvestment,
        interestBalance: user.interestBalance,
        platoCoins: user.platoCoins || 0,
        accountStatus: user.accountStatus,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { firebaseUID } = req.user;

    const user = await User.findOne({ firebaseUID }).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUID: user.firebaseUID,
        mobile: user.mobile,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        referralCode: user.referralCode,
        totalInvestment: user.totalInvestment,
        currentInvestmentBalance: user.currentInvestmentBalance,
        interestBalance: user.interestBalance,
        monthlyInterestAccumulated: user.monthlyInterestAccumulated,
        platoCoins: user.platoCoins || 0,
        directReferrals: user.directReferrals,
        directActiveReferrals: user.directActiveReferrals,
        lastWithdrawalDate: user.lastWithdrawalDate,
        accountStatus: user.accountStatus,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { fullName, email } = req.body;
    const profilePhoto = req.file ? `/uploads/profiles/${req.file.filename}` : '';

    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (profilePhoto) {
      // Delete old photo if exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      user.profilePhoto = profilePhoto;
    }
    user.isProfileComplete = !!(user.fullName && user.email);
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUID: user.firebaseUID,
        mobile: user.mobile,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
