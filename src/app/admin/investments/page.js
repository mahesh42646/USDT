'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function InvestmentList() {
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
        { id: 1, userId: 1, amount: 1000, type: 'new', date: '2024-01-15', txHash: '0x123...abc', status: 'confirmed' },
        { id: 2, userId: 2, amount: 5000, type: 'new', date: '2024-02-20', txHash: '0x456...def', status: 'confirmed' },
        { id: 3, userId: 1, amount: 2000, type: 'referral', date: '2024-03-10', txHash: '0x789...ghi', status: 'confirmed' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Investment List</h1>
        <p className="text-muted">All platform investments</p>
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
                    <th>Type</th>
                    <th>Date</th>
                    <th>Transaction Hash</th>
                    <th>Status</th>
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
                        <span className={`badge bg-${inv.type === 'new' ? 'primary' : 'info'}`}>
                          {inv.type}
                        </span>
                      </td>
                      <td>{inv.date}</td>
                      <td><code className="small">{inv.txHash}</code></td>
                      <td><span className="badge bg-success">{inv.status}</span></td>
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
