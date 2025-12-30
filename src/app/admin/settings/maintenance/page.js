'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function MaintenanceMode() {
  const router = useRouter();
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: 'System is under maintenance. Please check back later.',
    estimatedTime: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Maintenance mode ${maintenance.enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Maintenance Mode</h1>
        <p className="text-muted">Enable or disable system maintenance mode</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <div className={`alert alert-${maintenance.enabled ? 'warning' : 'success'}`}>
            <i className={`bi bi-${maintenance.enabled ? 'exclamation-triangle' : 'check-circle'} me-2`}></i>
            Maintenance mode is currently <strong>{maintenance.enabled ? 'ENABLED' : 'DISABLED'}</strong>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={maintenance.enabled}
                  onChange={(e) => setMaintenance({...maintenance, enabled: e.target.checked})}
                />
                <label className="form-check-label fw-semibold">
                  Enable Maintenance Mode
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Maintenance Message</label>
              <textarea
                className="form-control"
                rows="3"
                value={maintenance.message}
                onChange={(e) => setMaintenance({...maintenance, message: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Estimated Completion Time</label>
              <input
                type="text"
                className="form-control"
                value={maintenance.estimatedTime}
                onChange={(e) => setMaintenance({...maintenance, estimatedTime: e.target.value})}
                placeholder="e.g., 2 hours, Dec 20, 2024 3:00 PM"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className={`btn ${maintenance.enabled ? 'btn-warning' : 'btn-primary'}`}>
                <i className={`bi bi-${maintenance.enabled ? 'x-circle' : 'check-circle'} me-2`}></i>
                {maintenance.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

