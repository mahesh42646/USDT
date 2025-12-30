'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function InactiveUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setUsers([
        { id: 1, mobile: '+1234567890', name: 'John Doe', lastActive: '2024-10-15', daysInactive: 61 },
        { id: 2, mobile: '+1234567891', name: 'Jane Smith', lastActive: '2024-10-10', daysInactive: 66 },
        { id: 3, mobile: '+1234567892', name: 'Bob Johnson', lastActive: '2024-09-20', daysInactive: 87 },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Inactive Users (60+ Days)</h1>
        <p className="text-muted">Users inactive for more than 60 days - Interest paused</p>
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
                    <th>Mobile</th>
                    <th>Name</th>
                    <th>Last Active</th>
                    <th>Days Inactive</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.mobile}</td>
                      <td>{user.name}</td>
                      <td>{user.lastActive}</td>
                      <td>
                        <span className="badge bg-warning">{user.daysInactive} days</span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">Interest Paused</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1"></i>View
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

