const cron = require('node-cron');
const trc20Verification = require('../services/trc20VerificationService');

// Run every 2 minutes to check for new TRC20 payments
// Cron format: minute hour day month day-of-week
// '*/2 * * * *' = Every 2 minutes
const trc20VerificationJob = cron.schedule('*/2 * * * *', async () => {
  if (process.env.AUTO_VERIFY_TRC20 === 'true') {
    console.log('=== TRC20 Auto-Verification Started ===');
    try {
      const result = await trc20Verification.processPendingInvestments();
      console.log('=== TRC20 Auto-Verification Completed ===');
      console.log(`Processed: ${result.processed}, Confirmed: ${result.confirmed}, Failed: ${result.failed}`);
    } catch (error) {
      console.error('=== TRC20 Auto-Verification Failed ===', error);
    }
  }
}, {
  scheduled: false, // Don't start automatically, will be started in server.js
  timezone: 'UTC',
});

module.exports = trc20VerificationJob;

