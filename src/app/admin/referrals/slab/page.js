'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ReferralSlabCheck() {
  const router = useRouter();
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setSlabs([
        { userId: 1, name: 'John Doe', referrals: 45, slab: '10-49', percentage: 0.5 },
        { userId: 2, name: 'Jane Smith', referrals: 75, slab: '50-90', percentage: 1.0 },
        { userId: 3, name: 'Bob Johnson', referrals: 105, slab: '91-120', percentage: 1.5 },
        { userId: 4, name: 'Alice Brown', referrals: 135, slab: '121-150', percentage: 2.0 },
        { userId: 5, name: 'Charlie Wilson', referrals: 180, slab: '151+', percentage: 3.0 },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Referral Slab Check</h1>
        <p className="text-muted">User referral counts and income percentage slabs</p>
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
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Direct Referrals</th>
                    <th>Slab</th>
                    <th>Income %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slabs.map((slab) => (
                    <tr key={slab.userId}>
                      <td>{slab.userId}</td>
                      <td>{slab.name}</td>
                      <td><strong>{slab.referrals}</strong></td>
                      <td><span className="badge bg-primary">{slab.slab}</span></td>
                      <td><strong>{slab.percentage}%</strong></td>
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

