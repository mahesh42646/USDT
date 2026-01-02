const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // App Information
  appName: {
    type: String,
    default: 'GroandInvest',
  },
  appIcon: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  metaTitle: {
    type: String,
    default: 'GroandInvest - USDT Investment Platform',
  },
  metaDescription: {
    type: String,
    default: 'Invest in USDT and earn daily interest with referral bonuses',
  },

  // Colors
  primaryColor: {
    type: String,
    default: '#4A5568',
  },
  primaryDark: {
    type: String,
    default: '#2D3748',
  },
  primaryLight: {
    type: String,
    default: '#718096',
  },
  secondaryColor: {
    type: String,
    default: '#46239a',
  },
  secondaryLight: {
    type: String,
    default: '#6e34e1',
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF',
  },
  backgroundSecondary: {
    type: String,
    default: '#F7FAFC',
  },
  foregroundColor: {
    type: String,
    default: '#1A202C',
  },
  foregroundSecondary: {
    type: String,
    default: '#4A5568',
  },
  borderColor: {
    type: String,
    default: '#E2E8F0',
  },
  borderLight: {
    type: String,
    default: '#EDF2F7',
  },
  successColor: {
    type: String,
    default: '#10B981',
  },
  errorColor: {
    type: String,
    default: '#EF4444',
  },
  warningColor: {
    type: String,
    default: '#F59E0B',
  },
  infoColor: {
    type: String,
    default: '#3B82F6',
  },

  // Typography
  fontFamily: {
    type: String,
    default: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },

  // Project Status
  isMaintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently under maintenance. Please check back later.',
  },

  // Timestamps
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
