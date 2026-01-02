const Settings = require('../schemas/settings');
const fs = require('fs');
const path = require('path');

// Get Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
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
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settings',
    });
  }
};

// Update Settings
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update allowed fields
    if (updateData.appName !== undefined) settings.appName = updateData.appName;
    if (updateData.appIcon !== undefined) settings.appIcon = updateData.appIcon;
    if (updateData.favicon !== undefined) settings.favicon = updateData.favicon;
    if (updateData.metaTitle !== undefined) settings.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) settings.metaDescription = updateData.metaDescription;
    
    // Colors
    if (updateData.primaryColor !== undefined) settings.primaryColor = updateData.primaryColor;
    if (updateData.primaryDark !== undefined) settings.primaryDark = updateData.primaryDark;
    if (updateData.primaryLight !== undefined) settings.primaryLight = updateData.primaryLight;
    if (updateData.secondaryColor !== undefined) settings.secondaryColor = updateData.secondaryColor;
    if (updateData.secondaryLight !== undefined) settings.secondaryLight = updateData.secondaryLight;
    if (updateData.backgroundColor !== undefined) settings.backgroundColor = updateData.backgroundColor;
    if (updateData.backgroundSecondary !== undefined) settings.backgroundSecondary = updateData.backgroundSecondary;
    if (updateData.foregroundColor !== undefined) settings.foregroundColor = updateData.foregroundColor;
    if (updateData.foregroundSecondary !== undefined) settings.foregroundSecondary = updateData.foregroundSecondary;
    if (updateData.borderColor !== undefined) settings.borderColor = updateData.borderColor;
    if (updateData.borderLight !== undefined) settings.borderLight = updateData.borderLight;
    if (updateData.successColor !== undefined) settings.successColor = updateData.successColor;
    if (updateData.errorColor !== undefined) settings.errorColor = updateData.errorColor;
    if (updateData.warningColor !== undefined) settings.warningColor = updateData.warningColor;
    if (updateData.infoColor !== undefined) settings.infoColor = updateData.infoColor;
    
    // Typography
    if (updateData.fontFamily !== undefined) settings.fontFamily = updateData.fontFamily;
    
    // Project Status
    if (updateData.isMaintenanceMode !== undefined) settings.isMaintenanceMode = updateData.isMaintenanceMode;
    if (updateData.maintenanceMessage !== undefined) settings.maintenanceMessage = updateData.maintenanceMessage;

    settings.updatedAt = new Date();
    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: {
          appName: settings.appName,
          appIcon: settings.appIcon,
          favicon: settings.favicon,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          fontFamily: settings.fontFamily,
          isMaintenanceMode: settings.isMaintenanceMode,
        },
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings',
    });
  }
};
