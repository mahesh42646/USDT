'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function TransactionHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setTransactions([
        { id: 1, userId: 1, type: 'investment', amount: 1000, date: '2024-12-10', status: 'completed', txHash: '0x123...abc' },
        { id: 2, userId: 2, type: 'withdrawal', amount: 500, date: '2024-12-11', status: 'pending', txHash: '0x456...def' },
        { id: 3, userId: 3, type: 'referral', amount: 50, date: '2024-12-12', status: 'completed', txHash: '0x789...ghi' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Transaction History</h1>
        <p className="text-muted">Complete transaction history across the platform</p>
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
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Transaction Hash</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.userId}</td>
                      <td>
                        <span className={`badge bg-${tx.type === 'investment' ? 'primary' : tx.type === 'withdrawal' ? 'warning' : 'info'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>{tx.amount.toLocaleString()} USDT</td>
                      <td>{tx.date}</td>
                      <td><code className="small">{tx.txHash}</code></td>
                      <td>
                        <span className={`badge bg-${tx.status === 'completed' ? 'success' : 'warning'}`}>
                          {tx.status}
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

