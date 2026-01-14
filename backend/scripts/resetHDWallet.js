/**
 * Reset HD Wallet System
 * 
 * This script:
 * 1. Clears all old payment intents (expired, failed, or from old system)
 * 2. Resets the HD address index to start fresh
 * 3. Optionally keeps only paid intents if needed
 * 
 * Usage: node scripts/resetHDWallet.js [--keep-paid]
 * 
 * Run from backend directory: cd backend && node scripts/resetHDWallet.js
 */

// Load environment variables from backend/.env
// Use same approach as server.js - load from current working directory
require('dotenv').config();
const mongoose = require('mongoose');
const PaymentIntent = require('../schemas/paymentIntent');
const HDAddressIndex = require('../schemas/hdAddressIndex');

async function resetHDWallet(keepPaid = false) {
  try {
    // Connect to MongoDB - use same connection logic as server.js
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groandinvest';
    
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found, using default: mongodb://localhost:27017/groandinvest');
    } else {
      console.log(`📡 Using MongoDB URI: ${mongoURI.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
    }

    console.log(`📡 Connecting to MongoDB...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Get network
    const network = process.env.TRON_NETWORK || 'mainnet';
    console.log(`📡 Network: ${network}\n`);

    // Step 1: Delete ALL old payment intents to clear duplicate addresses
    // This is necessary because old addresses from previous admin wallet conflict
    console.log('🗑️  Deleting old payment intents to clear duplicate addresses...');
    
    // Delete expired and failed first
    const expiredResult = await PaymentIntent.deleteMany({
      status: { $in: ['expired', 'failed'] }
    });
    console.log(`   ✅ Deleted ${expiredResult.deletedCount} expired/failed intents`);

    // Delete old pending intents (older than 1 hour to be safe)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const oldPendingResult = await PaymentIntent.deleteMany({
      status: 'pending',
      createdAt: { $lt: oneHourAgo }
    });
    console.log(`   ✅ Deleted ${oldPendingResult.deletedCount} old pending intents (older than 1 hour)`);

    // If not keeping paid, delete all remaining (including paid)
    if (!keepPaid) {
      const allRemaining = await PaymentIntent.deleteMany({});
      console.log(`   ✅ Deleted ${allRemaining.deletedCount} remaining payment intents`);
    } else {
      const paidCount = await PaymentIntent.countDocuments({ status: 'paid' });
      console.log(`   ℹ️  Keeping ${paidCount} paid payment intents`);
    }

    // Step 2: Reset HD address index
    console.log('\n🔄 Resetting HD address index...');
    
    const indexDoc = await HDAddressIndex.findOne({ network });
    if (indexDoc) {
      indexDoc.lastUsedIndex = -1; // Start from 0 on next use
      indexDoc.updatedAt = new Date();
      await indexDoc.save();
      console.log(`   ✅ Reset index to -1 (next address will be index 0)`);
    } else {
      // Create new index document
      const newIndexDoc = new HDAddressIndex({
        network,
        lastUsedIndex: -1,
      });
      await newIndexDoc.save();
      console.log(`   ✅ Created new index document with value -1`);
    }

    // Step 3: Show summary
    const remainingIntents = await PaymentIntent.countDocuments({});
    const pendingIntents = await PaymentIntent.countDocuments({ status: 'pending' });
    const paidIntents = await PaymentIntent.countDocuments({ status: 'paid' });

    console.log('\n📊 Summary:');
    console.log(`   Total payment intents remaining: ${remainingIntents}`);
    console.log(`   - Pending: ${pendingIntents}`);
    console.log(`   - Paid: ${paidIntents}`);

    console.log('\n✅ HD Wallet reset complete!');
    console.log('   The next payment will use address index 0');
    console.log('   All old addresses have been cleared');
    console.log('\n💡 Restart your backend server to apply changes');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error resetting HD wallet:', error);
    if (error.message) {
      console.error(`   ${error.message}`);
    }
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const keepPaid = args.includes('--keep-paid');

console.log('🚀 Starting HD Wallet Reset...\n');
resetHDWallet(keepPaid);
