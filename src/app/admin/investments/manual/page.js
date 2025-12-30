'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function AddManualInvestment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    type: 'new',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Manual investment functionality will be implemented');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Add Manual Investment</h1>
        <p className="text-muted">Manually credit investment to user account (Admin only)</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '600px' }}>
        <div className="card-body p-4">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            This action will directly add investment to user balance. Use with caution.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">User ID</label>
              <input
                type="text"
                className="form-control"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Amount (USDT)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                min="10"
                step="0.01"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Investment Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="new">New Investment</option>
                <option value="referral">Referral Income</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Reason</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Add Investment
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

