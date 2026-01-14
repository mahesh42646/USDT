/**
 * Migration script to fix user indexes for multi-auth support
 * Run this script once to:
 * 1. Drop old unique index on mobile field
 * 2. Drop old unique index on email field
 * 3. Update existing users with empty mobile/email to null
 * 4. Recreate indexes with proper sparse/partial configuration
 * 
 * Usage: node scripts/fixUserIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixUserIndexes() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groandinvest';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Step 1: List existing indexes
    console.log('📋 Current indexes on users collection:');
    const existingIndexes = await usersCollection.indexes();
    existingIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    console.log('');

    // Step 2: Drop old mobile index if exists
    try {
      await usersCollection.dropIndex('mobile_1');
      console.log('✅ Dropped old mobile_1 index');
    } catch (e) {
      if (e.code === 27) {
        console.log('ℹ️  mobile_1 index does not exist (already dropped)');
      } else {
        console.log('⚠️  Error dropping mobile_1 index:', e.message);
      }
    }

    // Step 3: Drop old email index if exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('✅ Dropped old email_1 index');
    } catch (e) {
      if (e.code === 27) {
        console.log('ℹ️  email_1 index does not exist (already dropped)');
      } else {
        console.log('⚠️  Error dropping email_1 index:', e.message);
      }
    }

    // Step 4: Update existing users with empty mobile to null
    const mobileUpdateResult = await usersCollection.updateMany(
      { mobile: '' },
      { $set: { mobile: null } }
    );
    console.log(`✅ Updated ${mobileUpdateResult.modifiedCount} users with empty mobile to null`);

    // Step 5: Update existing users with empty email to null
    const emailUpdateResult = await usersCollection.updateMany(
      { email: '' },
      { $set: { email: null } }
    );
    console.log(`✅ Updated ${emailUpdateResult.modifiedCount} users with empty email to null`);

    // Step 6: Add authType field to existing users without it
    const authTypeResult = await usersCollection.updateMany(
      { authType: { $exists: false } },
      { $set: { authType: 'mobile' } }
    );
    console.log(`✅ Added authType field to ${authTypeResult.modifiedCount} users`);

    // Step 7: Create new sparse indexes
    console.log('\n📝 Creating new indexes...');
    
    // Create sparse index on mobile (allows multiple nulls)
    try {
      await usersCollection.createIndex(
        { mobile: 1 },
        { 
          unique: true, 
          sparse: true,
          partialFilterExpression: { 
            mobile: { $type: 'string', $ne: null }
          },
          name: 'mobile_sparse_unique'
        }
      );
      console.log('✅ Created mobile_sparse_unique index');
    } catch (e) {
      console.log('⚠️  Error creating mobile index:', e.message);
    }

    // Create sparse index on email (allows multiple nulls)
    try {
      await usersCollection.createIndex(
        { email: 1 },
        { 
          unique: true, 
          sparse: true,
          partialFilterExpression: { 
            email: { $type: 'string', $ne: null }
          },
          name: 'email_sparse_unique'
        }
      );
      console.log('✅ Created email_sparse_unique index');
    } catch (e) {
      console.log('⚠️  Error creating email index:', e.message);
    }

    // Step 8: List final indexes
    console.log('\n📋 Final indexes on users collection:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('   Users with mobile can now coexist with users without mobile.');
    console.log('   Users with email can now coexist with users without email.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixUserIndexes();
