const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize daily interest cron job
const dailyInterestCron = require('./cron/dailyInterestCron');
// Initialize TRC20 verification cron job
const trc20VerificationCron = require('./cron/trc20VerificationCron');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/groandinvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/investment', require('./routes/investment'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/withdrawal', require('./routes/withdrawal'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start daily interest cron job
  dailyInterestCron.start();
  console.log('Daily interest cron job started (runs at midnight UTC)');
  
  // Start TRC20 auto-verification cron job (if enabled)
  if (process.env.AUTO_VERIFY_TRC20 === 'true') {
    trc20VerificationCron.start();
    console.log('TRC20 automatic verification cron job started (runs every 2 minutes)');
  } else {
    console.log('TRC20 auto-verification is disabled. Set AUTO_VERIFY_TRC20=true to enable.');
  }
});
