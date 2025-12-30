'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function DirectReferralList() {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setReferrals([
        { id: 1, referrerId: 1, referredId: 2, date: '2024-01-20', status: 'active' },
        { id: 2, referrerId: 1, referredId: 3, date: '2024-02-15', status: 'active' },
        { id: 3, referrerId: 2, referredId: 4, date: '2024-03-10', status: 'active' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Direct Referral List</h1>
        <p className="text-muted">All direct referral relationships</p>
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
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id}>
                      <td>{ref.id}</td>
                      <td>{ref.referrerId}</td>
                      <td>{ref.referredId}</td>
                      <td>{ref.date}</td>
                      <td><span className="badge bg-success">{ref.status}</span></td>
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

