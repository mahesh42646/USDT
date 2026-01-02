require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../schemas/admin');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groandinvest';

async function createAdmin() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists with email: admin@gmail.com');
      console.log('Updating password...');
      existingAdmin.password = 'pass@123';
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin
      const admin = new Admin({
        email: 'admin@gmail.com',
        password: 'pass@123',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
      });

      await admin.save();
      console.log('✅ Admin created successfully!');
      console.log('Email: admin@gmail.com');
      console.log('Password: pass@123');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
