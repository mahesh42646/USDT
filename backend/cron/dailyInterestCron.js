const cron = require('node-cron');
const { processDailyInterest } = require('../services/dailyInterestService');

// Run daily interest calculation at midnight (00:00) every day
// Cron format: minute hour day month day-of-week
// '0 0 * * *' = At 00:00 (midnight) every day
const dailyInterestJob = cron.schedule('0 0 * * *', async () => {
  console.log('=== Daily Interest Cron Job Started ===');
  try {
    await processDailyInterest();
    console.log('=== Daily Interest Cron Job Completed Successfully ===');
  } catch (error) {
    console.error('=== Daily Interest Cron Job Failed ===', error);
  }
}, {
  scheduled: false, // Don't start automatically, will be started in server.js
  timezone: 'UTC', // You can change this to your timezone
});

// Also run at 12:00 AM in local time (adjust timezone as needed)
// For testing, you can also run every hour: '0 * * * *'

module.exports = dailyInterestJob;

