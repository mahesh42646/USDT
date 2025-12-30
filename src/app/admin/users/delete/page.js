'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function DeleteUser() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    alert('User deletion functionality will be implemented');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2 text-danger">Delete User</h1>
        <p className="text-muted">Permanently delete a user account (This action cannot be undone)</p>
      </div>

      <div className="card border-0 shadow-sm border-danger" style={{ maxWidth: '600px' }}>
        <div className="card-body p-4">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Warning:</strong> This action is permanent and cannot be undone.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
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
            <div className="mb-4">
              <label className="form-label fw-semibold">Type "DELETE" to confirm</label>
              <input
                type="text"
                className="form-control"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-danger">
                <i className="bi bi-trash me-2"></i>Delete User
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

