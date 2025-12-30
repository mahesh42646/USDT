'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ManualApprovalQueue() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setWithdrawals([
        { id: 1, userId: 1, amount: 5000, requestDate: '2024-12-10', reason: 'Large withdrawal', requiresApproval: true },
        { id: 2, userId: 2, amount: 8000, requestDate: '2024-12-11', reason: 'Large withdrawal', requiresApproval: true },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Manual Approval Queue</h1>
        <p className="text-muted">Large withdrawals requiring manual admin approval</p>
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
                    <th>Request Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => (
                    <tr key={wd.id}>
                      <td>{wd.id}</td>
                      <td>{wd.userId}</td>
                      <td><strong>{wd.amount.toLocaleString()} USDT</strong></td>
                      <td>{wd.requestDate}</td>
                      <td><span className="badge bg-warning">{wd.reason}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success">
                            <i className="bi bi-check-circle me-1"></i>Approve
                          </button>
                          <button className="btn btn-sm btn-danger">
                            <i className="bi bi-x-circle me-1"></i>Reject
                          </button>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
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

