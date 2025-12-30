'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function LockUnlockInvestment() {
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setInvestments([
        { id: 1, userId: 1, amount: 5000, status: 'unlocked', lockReason: '' },
        { id: 2, userId: 2, amount: 12000, status: 'locked', lockReason: 'Suspicious activity' },
        { id: 3, userId: 3, amount: 2500, status: 'unlocked', lockReason: '' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  const toggleLock = (id) => {
    alert(`Lock/Unlock functionality for investment ${id} will be implemented`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Lock/Unlock Investment</h1>
        <p className="text-muted">Manage investment lock status</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Lock Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.id}</td>
                      <td>{inv.userId}</td>
                      <td>{inv.amount.toLocaleString()} USDT</td>
                      <td>
                        <span className={`badge bg-${inv.status === 'locked' ? 'danger' : 'success'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>{inv.lockReason || '-'}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${inv.status === 'locked' ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => toggleLock(inv.id)}
                        >
                          <i className={`bi bi-${inv.status === 'locked' ? 'unlock' : 'lock'} me-1`}></i>
                          {inv.status === 'locked' ? 'Unlock' : 'Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

