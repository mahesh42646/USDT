'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function InterestRateConfig() {
  const router = useRouter();
  const [config, setConfig] = useState({
    baseRate: 0.50,
    maxRate: 2.00,
    incrementPerReferral: 0.05,
    referralThreshold: 10,
    specialInvestorRate: 1.00,
    specialInvestorThreshold: 10000
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Interest rate configuration will be saved');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Interest Rate Configuration</h1>
        <p className="text-muted">Configure daily interest rates and referral bonuses</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Base Daily Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.baseRate}
                  onChange={(e) => setConfig({...config, baseRate: parseFloat(e.target.value)})}
                  step="0.01"
                  min="0"
                  required
                />
                <small className="text-muted">Default: 0.50%</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Maximum Daily Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.maxRate}
                  onChange={(e) => setConfig({...config, maxRate: parseFloat(e.target.value)})}
                  step="0.01"
                  min="0"
                  required
                />
                <small className="text-muted">Default: 2.00%</small>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Increment Per Referral (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.incrementPerReferral}
                  onChange={(e) => setConfig({...config, incrementPerReferral: parseFloat(e.target.value)})}
                  step="0.01"
                  min="0"
                  required
                />
                <small className="text-muted">Default: 0.05% per 10 referrals</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Referral Threshold</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.referralThreshold}
                  onChange={(e) => setConfig({...config, referralThreshold: parseInt(e.target.value)})}
                  min="1"
                  required
                />
                <small className="text-muted">Default: 10 referrals</small>
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Special Investor Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.specialInvestorRate}
                  onChange={(e) => setConfig({...config, specialInvestorRate: parseFloat(e.target.value)})}
                  step="0.01"
                  min="0"
                  required
                />
                <small className="text-muted">Default: 1.00%</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Special Investor Threshold (USDT)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.specialInvestorThreshold}
                  onChange={(e) => setConfig({...config, specialInvestorThreshold: parseInt(e.target.value)})}
                  min="0"
                  required
                />
                <small className="text-muted">Default: 10,000 USDT</small>
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

