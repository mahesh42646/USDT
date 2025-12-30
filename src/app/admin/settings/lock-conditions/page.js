'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function LockConditionsConfig() {
  const router = useRouter();
  const [config, setConfig] = useState({
    inactivityDays: 60,
    largeWithdrawalThreshold: 5000,
    requireManualApproval: true,
    suspiciousActivityCheck: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Lock conditions configuration will be saved');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Lock Conditions Configuration</h1>
        <p className="text-muted">Configure account lock and freeze conditions</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Inactivity Days (Interest Pause)</label>
              <input
                type="number"
                className="form-control"
                value={config.inactivityDays}
                onChange={(e) => setConfig({...config, inactivityDays: parseInt(e.target.value)})}
                min="1"
                required
              />
              <small className="text-muted">Default: 60 days</small>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Large Withdrawal Threshold (USDT)</label>
              <input
                type="number"
                className="form-control"
                value={config.largeWithdrawalThreshold}
                onChange={(e) => setConfig({...config, largeWithdrawalThreshold: parseInt(e.target.value)})}
                min="0"
                required
              />
              <small className="text-muted">Default: 5,000 USDT</small>
            </div>
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.requireManualApproval}
                  onChange={(e) => setConfig({...config, requireManualApproval: e.target.checked})}
                />
                <label className="form-check-label fw-semibold">
                  Require Manual Approval for Large Withdrawals
                </label>
              </div>
            </div>
            <div className="mb-4">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.suspiciousActivityCheck}
                  onChange={(e) => setConfig({...config, suspiciousActivityCheck: e.target.checked})}
                />
                <label className="form-check-label fw-semibold">
                  Enable Suspicious Activity Detection
                </label>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save me-2"></i>Save Configuration
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

