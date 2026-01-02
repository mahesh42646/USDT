'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function AdminSettings() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    appName: '',
    appIcon: '',
    favicon: '',
    metaTitle: '',
    metaDescription: '',
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
  });
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchSettings();
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/api/admin/settings');
      
      if (response.success && response.data) {
        setSettings(response.data.settings || settings);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      if (error.status === 401 || error.status === 403) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminApi.put('/api/admin/settings', settings);
      
      if (response.success) {
        alert('Settings saved successfully! The changes will be applied after page refresh.');
        // Apply CSS variables immediately
        applyCSSVariables();
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applyCSSVariables = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', settings.primaryColor);
      root.style.setProperty('--primary-dark', settings.primaryDark);
      root.style.setProperty('--primary-light', settings.primaryLight);
      root.style.setProperty('--accent', settings.secondaryColor);
      root.style.setProperty('--accent-light', settings.secondaryLight);
      root.style.setProperty('--background', settings.backgroundColor);
      root.style.setProperty('--background-secondary', settings.backgroundSecondary);
      root.style.setProperty('--foreground', settings.foregroundColor);
      root.style.setProperty('--foreground-secondary', settings.foregroundSecondary);
      root.style.setProperty('--border', settings.borderColor);
      root.style.setProperty('--border-light', settings.borderLight);
      root.style.setProperty('--success', settings.successColor);
      root.style.setProperty('--error', settings.errorColor);
      root.style.setProperty('--warning', settings.warningColor);
      root.style.setProperty('--info', settings.infoColor);
      root.style.setProperty('--font-primary', settings.fontFamily);
    }
  };

  useEffect(() => {
    if (settings.primaryColor) {
      applyCSSVariables();
    }
  }, [settings]);

  const fontOptions = [
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif", label: 'System Default' },
    { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", label: 'Inter' },
    { value: "'Roboto', sans-serif", label: 'Roboto' },
    { value: "'Open Sans', sans-serif", label: 'Open Sans' },
    { value: "'Lato', sans-serif", label: 'Lato' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat' },
    { value: "'Poppins', sans-serif", label: 'Poppins' },
    { value: "'Nunito', sans-serif", label: 'Nunito' },
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Settings</h1>
          <p className="text-muted">Customize your application settings</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-gear me-2"></i>General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'colors' ? 'active' : ''}`}
                onClick={() => setActiveTab('colors')}
              >
                <i className="bi bi-palette me-2"></i>Colors
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'typography' ? 'active' : ''}`}
                onClick={() => setActiveTab('typography')}
              >
                <i className="bi bi-type me-2"></i>Typography
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
              >
                <i className="bi bi-tools me-2"></i>Maintenance
              </button>
            </li>
          </ul>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">App Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="appName"
                  value={settings.appName}
                  onChange={handleInputChange}
                  placeholder="GroandInvest"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Meta Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="metaTitle"
                  value={settings.metaTitle}
                  onChange={handleInputChange}
                  placeholder="GroandInvest - USDT Investment Platform"
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Meta Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="metaDescription"
                  value={settings.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Invest in USDT and earn daily interest with referral bonuses"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">App Icon URL</label>
                <input
                  type="text"
                  className="form-control"
                  name="appIcon"
                  value={settings.appIcon}
                  onChange={handleInputChange}
                  placeholder="/logo.png"
                />
                <small className="text-muted">URL path to app icon</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Favicon URL</label>
                <input
                  type="text"
                  className="form-control"
                  name="favicon"
                  value={settings.favicon}
                  onChange={handleInputChange}
                  placeholder="/favicon.ico"
                />
                <small className="text-muted">URL path to favicon</small>
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="row g-3">
              <div className="col-12">
                <h6 className="fw-bold mb-3">Primary Colors</h6>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Primary Color</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Primary Dark</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="primaryDark"
                    value={settings.primaryDark}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="primaryDark"
                    value={settings.primaryDark}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Primary Light</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="primaryLight"
                    value={settings.primaryLight}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="primaryLight"
                    value={settings.primaryLight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Secondary Colors</h6>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Secondary Color</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Secondary Light</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="secondaryLight"
                    value={settings.secondaryLight}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="secondaryLight"
                    value={settings.secondaryLight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Background Colors</h6>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Background</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="backgroundColor"
                    value={settings.backgroundColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="backgroundColor"
                    value={settings.backgroundColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Background Secondary</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="backgroundSecondary"
                    value={settings.backgroundSecondary}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="backgroundSecondary"
                    value={settings.backgroundSecondary}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Foreground Colors</h6>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Foreground</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="foregroundColor"
                    value={settings.foregroundColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="foregroundColor"
                    value={settings.foregroundColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Foreground Secondary</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="foregroundSecondary"
                    value={settings.foregroundSecondary}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="foregroundSecondary"
                    value={settings.foregroundSecondary}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Border Colors</h6>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Border</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="borderColor"
                    value={settings.borderColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="borderColor"
                    value={settings.borderColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Border Light</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="borderLight"
                    value={settings.borderLight}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="borderLight"
                    value={settings.borderLight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Status Colors</h6>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Success</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="successColor"
                    value={settings.successColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="successColor"
                    value={settings.successColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Error</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="errorColor"
                    value={settings.errorColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="errorColor"
                    value={settings.errorColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Warning</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="warningColor"
                    value={settings.warningColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="warningColor"
                    value={settings.warningColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Info</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    name="infoColor"
                    value={settings.infoColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="infoColor"
                    value={settings.infoColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Font Family</label>
                <select
                  className="form-select"
                  name="fontFamily"
                  value={settings.fontFamily}
                  onChange={handleInputChange}
                >
                  {fontOptions.map((font, index) => (
                    <option key={index} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <small className="text-muted">Note: Make sure the selected font is loaded in your app</small>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Custom Font Family</label>
                <input
                  type="text"
                  className="form-control"
                  name="fontFamily"
                  value={settings.fontFamily}
                  onChange={handleInputChange}
                  placeholder="Enter custom font family CSS value"
                />
                <small className="text-muted">You can also enter a custom font family CSS value</small>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="row g-3">
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isMaintenanceMode"
                    checked={settings.isMaintenanceMode}
                    onChange={handleInputChange}
                    id="maintenanceMode"
                  />
                  <label className="form-check-label fw-semibold" htmlFor="maintenanceMode">
                    Enable Maintenance Mode
                  </label>
                </div>
                <small className="text-muted d-block mt-2">
                  When enabled, the application will be unavailable to users
                </small>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Maintenance Message</label>
                <textarea
                  className="form-control"
                  rows="4"
                  name="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={handleInputChange}
                  placeholder="We are currently under maintenance. Please check back later."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminSettings);