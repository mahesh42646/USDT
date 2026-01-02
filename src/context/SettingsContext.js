'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try to fetch settings from public endpoint (if available) or use defaults
      // For now, we'll use defaults and update via admin settings
      const defaultSettings = {
        appName: 'GroandInvest',
        appIcon: '',
        favicon: '/favicon.ico',
        metaTitle: 'GroandInvest - USDT Investment Platform',
        metaDescription: 'Invest in USDT and earn daily interest with referral bonuses',
        primaryColor: '#4A5568',
        primaryDark: '#2D3748',
        primaryLight: '#718096',
        secondaryColor: '#46239a',
        secondaryLight: '#6e34e1',
        backgroundColor: '#FFFFFF',
        backgroundSecondary: '#F7FAFC',
        foregroundColor: '#1A202C',
        foregroundSecondary: '#4A5568',
        borderColor: '#E2E8F0',
        borderLight: '#EDF2F7',
        successColor: '#10B981',
        errorColor: '#EF4444',
        warningColor: '#F59E0B',
        infoColor: '#3B82F6',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        isMaintenanceMode: false,
        maintenanceMessage: 'We are currently under maintenance. Please check back later.',
      };

      // Try to fetch from backend (public endpoint - we'll create this)
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data.settings);
            applySettings(data.data.settings);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('Using default settings');
      }

      // Use defaults
      setSettings(defaultSettings);
      applySettings(defaultSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults on error
      const defaultSettings = {
        appName: 'GroandInvest',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        primaryColor: '#4A5568',
        secondaryColor: '#46239a',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#1A202C',
      };
      setSettings(defaultSettings);
      applySettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (settingsData) => {
    if (typeof document === 'undefined' || !settingsData) return;

    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--primary', settingsData.primaryColor || '#4A5568');
    root.style.setProperty('--primary-dark', settingsData.primaryDark || '#2D3748');
    root.style.setProperty('--primary-light', settingsData.primaryLight || '#718096');
    root.style.setProperty('--accent', settingsData.secondaryColor || '#46239a');
    root.style.setProperty('--accent-light', settingsData.secondaryLight || '#6e34e1');
    root.style.setProperty('--background', settingsData.backgroundColor || '#FFFFFF');
    root.style.setProperty('--background-secondary', settingsData.backgroundSecondary || '#F7FAFC');
    root.style.setProperty('--foreground', settingsData.foregroundColor || '#1A202C');
    root.style.setProperty('--foreground-secondary', settingsData.foregroundSecondary || '#4A5568');
    root.style.setProperty('--border', settingsData.borderColor || '#E2E8F0');
    root.style.setProperty('--border-light', settingsData.borderLight || '#EDF2F7');
    root.style.setProperty('--success', settingsData.successColor || '#10B981');
    root.style.setProperty('--error', settingsData.errorColor || '#EF4444');
    root.style.setProperty('--warning', settingsData.warningColor || '#F59E0B');
    root.style.setProperty('--info', settingsData.infoColor || '#3B82F6');
    root.style.setProperty('--font-primary', settingsData.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif");

    // Update Bootstrap primary color
    root.style.setProperty('--bs-primary', settingsData.secondaryColor || '#46239a');
    root.style.setProperty('--bs-primary-rgb', hexToRgb(settingsData.secondaryColor || '#46239a'));

    // Update document title and meta
    if (settingsData.metaTitle) {
      document.title = settingsData.metaTitle;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settingsData.metaDescription || '');

    // Update favicon
    if (settingsData.favicon) {
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.setAttribute('href', settingsData.favicon);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '107, 70, 193';
  };

  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Return defaults if context not available
    return {
      settings: {
        appName: 'GroandInvest',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      },
      loading: false,
    };
  }
  return context;
}
