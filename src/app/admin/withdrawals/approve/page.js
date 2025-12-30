'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ApproveWithdrawal() {
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
        { id: 1, userId: 1, amount: 500, requestDate: '2024-12-10', status: 'pending' },
        { id: 2, userId: 2, amount: 1000, requestDate: '2024-12-11', status: 'pending' },
        { id: 3, userId: 3, amount: 750, requestDate: '2024-12-12', status: 'pending' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  const handleApprove = (id) => {
    alert(`Approve withdrawal ${id} functionality will be implemented`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Approve Withdrawal</h1>
        <p className="text-muted">Review and approve withdrawal requests</p>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => (
                    <tr key={wd.id}>
                      <td>{wd.id}</td>
                      <td>{wd.userId}</td>
                      <td>{wd.amount.toLocaleString()} USDT</td>
                      <td>{wd.requestDate}</td>
                      <td><span className="badge bg-warning">{wd.status}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(wd.id)}>
                            <i className="bi bi-check-circle me-1"></i>Approve
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

