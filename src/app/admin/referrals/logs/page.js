'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ReferralCreditLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setLogs([
        { id: 1, referrerId: 1, referredId: 2, amount: 50, date: '2024-01-20', status: 'credited' },
        { id: 2, referrerId: 1, referredId: 3, amount: 100, date: '2024-02-15', status: 'credited' },
        { id: 3, referrerId: 2, referredId: 4, amount: 75, date: '2024-03-10', status: 'credited' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Referral Investment Credit Logs</h1>
        <p className="text-muted">Track all referral income credits to investment balance</p>
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
                    <th>Referrer ID</th>
                    <th>Referred ID</th>
                    <th>Amount (USDT)</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.referrerId}</td>
                      <td>{log.referredId}</td>
                      <td>{log.amount.toLocaleString()} USDT</td>
                      <td>{log.date}</td>
                      <td><span className="badge bg-success">{log.status}</span></td>
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

