const express = require('express');
const router = express.Router();
const Settings = require('../schemas/settings');

// Public route to get settings (for frontend)
router.get('/public', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      data: {
        settings: {
          appName: settings.appName,
          appIcon: settings.appIcon,
          favicon: settings.favicon,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          primaryColor: settings.primaryColor,
          primaryDark: settings.primaryDark,
          primaryLight: settings.primaryLight,
          secondaryColor: settings.secondaryColor,
          secondaryLight: settings.secondaryLight,
          backgroundColor: settings.backgroundColor,
          backgroundSecondary: settings.backgroundSecondary,
          foregroundColor: settings.foregroundColor,
          foregroundSecondary: settings.foregroundSecondary,
          borderColor: settings.borderColor,
          borderLight: settings.borderLight,
          successColor: settings.successColor,
          errorColor: settings.errorColor,
          warningColor: settings.warningColor,
          infoColor: settings.infoColor,
          fontFamily: settings.fontFamily,
          isMaintenanceMode: settings.isMaintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
        },
      },
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settings',
    });
  }
});

module.exports = router;
