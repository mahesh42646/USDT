'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function UsersList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setUsers([
        { id: 1, mobile: '+1234567890', name: 'John Doe', totalInvestment: 5000, status: 'active', joinDate: '2024-01-15' },
        { id: 2, mobile: '+1234567891', name: 'Jane Smith', totalInvestment: 12000, status: 'active', joinDate: '2024-02-20' },
        { id: 3, mobile: '+1234567892', name: 'Bob Johnson', totalInvestment: 2500, status: 'frozen', joinDate: '2024-03-10' },
      ]);
      setLoading(false);
    }, 500);
  }, [router]);

  const filteredUsers = users.filter(user =>
    user.mobile.includes(searchTerm) || user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Users List</h1>
          <p className="text-muted">Manage all platform users</p>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add User
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by mobile or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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
                    <th>Total Investment</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.mobile}</td>
                      <td>{user.name}</td>
                      <td>{user.totalInvestment.toLocaleString()} USDT</td>
                      <td>
                        <span className={`badge bg-${user.status === 'active' ? 'success' : 'danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joinDate}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-warning">
                            <i className="bi bi-lock"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-trash"></i>
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
