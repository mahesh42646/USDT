'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';
import ManageUserModal from './ManageUserModal';

function UsersList() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchUsers();
  }, [isAuthenticated, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/api/admin/users?search=${encodeURIComponent(searchTerm)}&limit=100`);
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      if (error.status === 401 || error.status === 403) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowManageModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      await adminApi.delete(`/api/admin/users/${userId}`);
      await fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.message || 'Failed to delete user');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      const response = await adminApi.patch(`/api/admin/users/${userId}/toggle-status`);
      if (response.success) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert(error.message || 'Failed to toggle user status');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleManage = async (userId) => {
    try {
      setActionLoading({ ...actionLoading, [`manage-${userId}`]: true });
      const response = await adminApi.get(`/api/admin/users/${userId}`);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowManageModal(true);
      }
    } catch (error) {
      console.error('Get user details error:', error);
      alert(error.message || 'Failed to fetch user details');
    } finally {
      setActionLoading({ ...actionLoading, [`manage-${userId}`]: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Users List</h1>
          <p className="text-muted">Manage all platform users</p>
        </div>
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
                placeholder="Search by mobile, name, email, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No users found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mobile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Investment</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.mobile}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.totalInvestment.toLocaleString()} USDT</td>
                      <td>
                        <span className={`badge bg-${user.accountStatus === 'active' ? 'success' : 'danger'}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className={`btn btn-sm btn-outline-${user.accountStatus === 'active' ? 'warning' : 'success'}`}
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={actionLoading[user.id]}
                            title={user.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {actionLoading[user.id] ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className={`bi bi-${user.accountStatus === 'active' ? 'lock' : 'unlock'}`}></i>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading[user.id]}
                            title="Delete"
                          >
                            {actionLoading[user.id] ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleManage(user.id)}
                            disabled={actionLoading[`manage-${user.id}`]}
                            title="Manage User"
                          >
                            {actionLoading[`manage-${user.id}`] ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className="bi bi-gear"></i>
                            )}
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

      {showManageModal && selectedUser && (
        <ManageUserModal
          userData={selectedUser}
          onClose={() => {
            setShowManageModal(false);
            setSelectedUser(null);
          }}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}

export default withAdminAuth(UsersList);
