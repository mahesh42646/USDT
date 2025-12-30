const User = require('../schemas/user');
const Investment = require('../schemas/investment');

// Calculate daily interest based on PROJECT_RULES.md
function calculateDailyInterest(user) {
  const baseInterest = 0.50; // 0.50%
  const activeReferrals = user.directActiveReferrals || 0;
  const bonusInterest = Math.floor(activeReferrals / 10) * 0.05;
  const totalInterest = Math.min(baseInterest + bonusInterest, 2.00); // Cap at 2.00%
  
  // Special Investor Plan (10,000+ USDT)
  if (user.totalInvestment >= 10000) {
    return {
      percentage: 1.00,
      amount: (user.totalInvestment * 1.00) / 100,
      isSpecialPlan: true,
    };
  }
  
  return {
    percentage: totalInterest,
    amount: (user.totalInvestment * totalInterest) / 100,
    isSpecialPlan: false,
  };
}

// Process daily interest for all active users
async function processDailyInterest() {
  try {
    console.log('Starting daily interest calculation at', new Date().toISOString());
    
    // Get all active users with investment >= 10 USDT
    const users = await User.find({
      accountStatus: 'active',
      totalInvestment: { $gte: 10 },
    });

    let processedCount = 0;
    let totalInterestAdded = 0;

    for (const user of users) {
      try {
        // Check if user has been inactive for 60 days
        const lastActivity = user.lastActivityDate || user.createdAt;
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceActivity >= 60) {
          console.log(`Skipping user ${user._id} - inactive for ${daysSinceActivity} days`);
          continue; // Skip inactive users (60 days rule)
        }

        // Calculate daily interest
        const interestData = calculateDailyInterest(user);
        
        if (interestData.amount > 0) {
          // Add to interest balance (no compounding)
          user.interestBalance = (user.interestBalance || 0) + interestData.amount;
          
          // Update monthly interest accumulated
          user.monthlyInterestAccumulated = (user.monthlyInterestAccumulated || 0) + interestData.amount;
          
          // Update last activity date
          user.lastActivityDate = new Date();
          
          await user.save();
          
          processedCount++;
          totalInterestAdded += interestData.amount;
          
          console.log(`Added ${interestData.amount.toFixed(2)} USDT interest to user ${user._id}`);
        }
      } catch (userError) {
        console.error(`Error processing interest for user ${user._id}:`, userError);
        // Continue with next user
      }
    }

    // Update investment lock-in status (check if 90 days have passed)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const updatedInvestments = await Investment.updateMany(
      {
        lockInEndDate: { $lte: new Date() },
        isAvailableForWithdrawal: false,
      },
      {
        $set: { isAvailableForWithdrawal: true },
      }
    );

    console.log(`Daily interest processing completed:`);
    console.log(`- Users processed: ${processedCount}`);
    console.log(`- Total interest added: ${totalInterestAdded.toFixed(2)} USDT`);
    console.log(`- Investments unlocked: ${updatedInvestments.modifiedCount}`);

    return {
      success: true,
      processedCount,
      totalInterestAdded,
      investmentsUnlocked: updatedInvestments.modifiedCount,
    };
  } catch (error) {
    console.error('Daily interest processing error:', error);
    throw error;
  }
}

module.exports = {
  calculateDailyInterest,
  processDailyInterest,
};

