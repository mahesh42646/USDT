'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function WithdrawalLimitsConfig() {
  const router = useRouter();
  const [config, setConfig] = useState({
    unlockThreshold: 500,
    minWithdrawal: 20,
    maxWithdrawalPercent: 30,
    monthlyLimit: 1,
    processingTime: 24
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Withdrawal limits configuration will be saved');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Withdrawal Limits Configuration</h1>
        <p className="text-muted">Configure withdrawal rules and limits</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Unlock Threshold (USDT)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.unlockThreshold}
                  onChange={(e) => setConfig({...config, unlockThreshold: parseInt(e.target.value)})}
                  min="0"
                  required
                />
                <small className="text-muted">Default: 500 USDT</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Minimum Withdrawal (USDT)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.minWithdrawal}
                  onChange={(e) => setConfig({...config, minWithdrawal: parseInt(e.target.value)})}
                  min="0"
                  required
                />
                <small className="text-muted">Default: 20 USDT</small>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Max Withdrawal (% of monthly interest)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.maxWithdrawalPercent}
                  onChange={(e) => setConfig({...config, maxWithdrawalPercent: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  required
                />
                <small className="text-muted">Default: 30%</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Monthly Withdrawal Limit</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.monthlyLimit}
                  onChange={(e) => setConfig({...config, monthlyLimit: parseInt(e.target.value)})}
                  min="1"
                  required
                />
                <small className="text-muted">Default: 1 withdrawal per month</small>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Processing Time (Hours)</label>
              <input
                type="number"
                className="form-control"
                value={config.processingTime}
                onChange={(e) => setConfig({...config, processingTime: parseInt(e.target.value)})}
                min="1"
                required
              />
              <small className="text-muted">Default: 24 hours</small>
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

