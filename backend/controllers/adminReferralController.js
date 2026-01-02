const Referral = require('../schemas/referral');
const User = require('../schemas/user');

// Get All Referrals with Full Details
exports.getAllReferrals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      status = 'all',
      sortBy = 'newest', // newest, oldest, incomeHigh, incomeLow
      referrerId = null
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Search filter
    if (search) {
      const users = await User.find({
        $or: [
          { mobile: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { referralCode: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.$or = [
        { referrerId: { $in: userIds } },
        { referredUserId: { $in: userIds } },
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Referrer filter
    if (referrerId) {
      query.referrerId = referrerId;
    }

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'incomeHigh':
        sortObj = { totalIncome: -1 };
        break;
      case 'incomeLow':
        sortObj = { totalIncome: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const referrals = await Referral.find(query)
      .populate('referrerId', 'mobile fullName email referralCode totalInvestment directReferrals directActiveReferrals createdAt')
      .populate('referredUserId', 'mobile fullName email referralCode totalInvestment directReferrals directActiveReferrals createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReferrals = await Referral.countDocuments(query);

    // Get referral chain for each referral (nth level)
    // First, get all referrals to build a map for efficient lookup
    const allReferrals = await Referral.find({})
      .populate('referredUserId', 'mobile fullName email referralCode')
      .select('referrerId referredUserId');

    // Build a map: referrerId -> array of referrals
    const referralMap = new Map();
    allReferrals.forEach(ref => {
      if (ref.referrerId && ref.referredUserId) {
        if (!referralMap.has(ref.referrerId.toString())) {
          referralMap.set(ref.referrerId.toString(), []);
        }
        referralMap.get(ref.referrerId.toString()).push(ref);
      }
    });

    const referralsWithChain = referrals.map((referral) => {
      // Find the referral chain (referrer -> referred -> nth level)
      const chain = [];
      const visited = new Set(); // Prevent infinite loops
      let currentUserId = referral.referredUserId?._id?.toString();
      let level = 1;
      const maxLevel = 10; // Prevent infinite loops

      while (currentUserId && level < maxLevel && !visited.has(currentUserId)) {
        visited.add(currentUserId);
        const nextReferrals = referralMap.get(currentUserId) || [];
        
        if (nextReferrals.length > 0) {
          // Get the first referral (oldest)
          const nextReferral = nextReferrals[0];
          if (nextReferral && nextReferral.referredUserId) {
            chain.push({
              level: level + 1,
              userId: nextReferral.referredUserId._id,
              user: {
                mobile: nextReferral.referredUserId.mobile,
                fullName: nextReferral.referredUserId.fullName,
                email: nextReferral.referredUserId.email,
                referralCode: nextReferral.referredUserId.referralCode,
              },
            });
            currentUserId = nextReferral.referredUserId._id?.toString();
            level++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return {
        id: referral._id,
        referrer: {
          id: referral.referrerId?._id,
          mobile: referral.referrerId?.mobile,
          fullName: referral.referrerId?.fullName,
          email: referral.referrerId?.email,
          referralCode: referral.referrerId?.referralCode,
          totalInvestment: referral.referrerId?.totalInvestment || 0,
          directReferrals: referral.referrerId?.directReferrals || 0,
          directActiveReferrals: referral.referrerId?.directActiveReferrals || 0,
          joinDate: referral.referrerId?.createdAt,
        },
        referred: {
          id: referral.referredUserId?._id,
          mobile: referral.referredUserId?.mobile,
          fullName: referral.referredUserId?.fullName,
          email: referral.referredUserId?.email,
          referralCode: referral.referredUserId?.referralCode,
          totalInvestment: referral.referredUserId?.totalInvestment || 0,
          directReferrals: referral.referredUserId?.directReferrals || 0,
          directActiveReferrals: referral.referredUserId?.directActiveReferrals || 0,
          joinDate: referral.referredUserId?.createdAt,
        },
        referralCode: referral.referralCode,
        status: referral.status,
        totalIncome: referral.totalIncome || 0,
        activatedAt: referral.activatedAt,
        lastIncomeDate: referral.lastIncomeDate,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt,
        chain: chain, // Referral chain (nth level referrals)
      };
    });

    res.json({
      success: true,
      data: {
        referrals: referralsWithChain,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReferrals,
          pages: Math.ceil(totalReferrals / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch referrals',
    });
  }
};

// Get Referral Chain for a Specific User
exports.getUserReferralChain = async (req, res) => {
  try {
    const { userId } = req.params;
    const { maxLevel = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Build referral chain starting from this user
    const chain = [];
    let currentUserId = user._id;
    let level = 0;

    // Add the starting user
    chain.push({
      level: level,
      userId: user._id,
      user: {
        mobile: user.mobile,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        totalInvestment: user.totalInvestment || 0,
      },
    });

    // Find all referrals made by this user and their chain
    while (currentUserId && level < parseInt(maxLevel)) {
      const referrals = await Referral.find({ referrerId: currentUserId })
        .populate('referredUserId', 'mobile fullName email referralCode totalInvestment')
        .sort({ createdAt: 1 });

      if (referrals.length === 0) {
        break;
      }

      // For each referral, add to chain and continue
      for (const referral of referrals) {
        if (referral.referredUserId) {
          level++;
          chain.push({
            level: level,
            referralId: referral._id,
            userId: referral.referredUserId._id,
            user: {
              mobile: referral.referredUserId.mobile,
              fullName: referral.referredUserId.fullName,
              email: referral.referredUserId.email,
              referralCode: referral.referredUserId.referralCode,
              totalInvestment: referral.referredUserId.totalInvestment || 0,
            },
            status: referral.status,
            totalIncome: referral.totalIncome || 0,
            createdAt: referral.createdAt,
          });

          // Continue chain from this referred user
          currentUserId = referral.referredUserId._id;
        }
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          mobile: user.mobile,
          fullName: user.fullName,
          email: user.email,
          referralCode: user.referralCode,
        },
        chain: chain,
      },
    });
  } catch (error) {
    console.error('Get user referral chain error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch referral chain',
    });
  }
};
