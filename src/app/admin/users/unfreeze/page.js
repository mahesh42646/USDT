'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function UnfreezeUser() {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('User unfreeze functionality will be implemented');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Unfreeze User</h1>
        <p className="text-muted">Restore access to a frozen user account</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '600px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">User ID or Mobile</label>
              <input
                type="text"
                className="form-control"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID or mobile number"
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-unlock me-2"></i>Unfreeze User
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

