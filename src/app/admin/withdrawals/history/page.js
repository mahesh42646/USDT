'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function WithdrawalHistory() {
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
        { id: 1, userId: 1, amount: 500, requestDate: '2024-11-10', processedDate: '2024-11-11', status: 'approved' },
        { id: 2, userId: 2, amount: 1000, requestDate: '2024-11-15', processedDate: '2024-11-16', status: 'approved' },
        { id: 3, userId: 3, amount: 750, requestDate: '2024-11-20', processedDate: '2024-11-21', status: 'rejected' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Withdrawal History</h1>
        <p className="text-muted">Complete history of all withdrawal requests</p>
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
                    <th>Processed Date</th>
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
                      <td>{wd.processedDate}</td>
                      <td>
                        <span className={`badge bg-${wd.status === 'approved' ? 'success' : 'danger'}`}>
                          {wd.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye"></i>
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

