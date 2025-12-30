'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function PaymentHistory() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setPayments([
        { id: 1, userId: 1, type: 'investment', amount: 1000, date: '2024-12-10', method: 'USDT TRC20', status: 'completed' },
        { id: 2, userId: 2, type: 'withdrawal', amount: 500, date: '2024-12-11', method: 'USDT TRC20', status: 'pending' },
        { id: 3, userId: 3, type: 'investment', amount: 2000, date: '2024-12-12', method: 'USDT TRC20', status: 'completed' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Payment History</h1>
        <p className="text-muted">All payment transactions and records</p>
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
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{payment.userId}</td>
                      <td>
                        <span className={`badge bg-${payment.type === 'investment' ? 'primary' : 'warning'}`}>
                          {payment.type}
                        </span>
                      </td>
                      <td>{payment.amount.toLocaleString()} USDT</td>
                      <td>{payment.method}</td>
                      <td>{payment.date}</td>
                      <td>
                        <span className={`badge bg-${payment.status === 'completed' ? 'success' : 'warning'}`}>
                          {payment.status}
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

