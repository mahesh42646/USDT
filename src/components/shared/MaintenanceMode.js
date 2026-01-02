'use client';

import { useSettings } from '@/context/SettingsContext';
import { usePathname } from 'next/navigation';

export default function MaintenanceMode() {
  const { settings, loading } = useSettings();
  const pathname = usePathname();

  // Don't show maintenance mode on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (loading || !settings?.isMaintenanceMode) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div>
        <i className="bi bi-tools" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
        <h1 className="h2 mb-3">Under Maintenance</h1>
        <p className="lead">{settings.maintenanceMessage || 'We are currently under maintenance. Please check back later.'}</p>
      </div>
    </div>
  );
}
