'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/utils/adminApi';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './ManageUserModal.module.css';

export default function ManageUserModal({ userData, onClose, onUpdate }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(userData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(null); // 'investment', 'referral', 'withdrawal'
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);

  useEffect(() => {
    if (userData?.user) {
      setUserDetails(userData);
      setFormData({
        fullName: userData.user.fullName || '',
        email: userData.user.email || '',
        totalInvestment: userData.user.totalInvestment || 0,
        currentInvestmentBalance: userData.user.currentInvestmentBalance || 0,
        interestBalance: userData.user.interestBalance || 0,
        accountStatus: userData.user.accountStatus || 'active',
        directReferrals: userData.user.directReferrals || 0,
        directActiveReferrals: userData.user.directActiveReferrals || 0,
      });
    }
  }, [userData]);

  const refreshUserData = async () => {
    if (!userDetails?.user?.id) return;
    try {
      const response = await adminApi.get(`/api/admin/users/${userDetails.user.id}`);
      if (response.success) {
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Investment') || name.includes('Balance') || name.includes('Referrals')
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await adminApi.put(`/api/admin/users/${userDetails.user.id}`, formData);
      if (response.success) {
        alert('User updated successfully');
        setEditMode(false);
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Update user error:', error);
      alert(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Investment Management
  const handleEditInvestment = (investment) => {
    setEditingItem(investment);
    setEditType('investment');
    setShowEditModal(true);
  };

  const handleDeleteInvestment = async (investmentId) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    try {
      const response = await adminApi.delete(`/api/admin/investments/${investmentId}`);
      if (response.success) {
        alert('Investment deleted successfully');
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Delete investment error:', error);
      alert(error.message || 'Failed to delete investment');
    }
  };

  const handleSaveInvestment = async (investmentData) => {
    try {
      setLoading(true);
      let response;
      if (editingItem) {
        // Update existing
        response = await adminApi.put(`/api/admin/investments/${editingItem._id}`, investmentData);
      } else {
        // Create new
        response = await adminApi.post(`/api/admin/users/${userDetails.user.id}/investments`, investmentData);
      }
      if (response.success) {
        alert(editingItem ? 'Investment updated successfully' : 'Investment created successfully');
        setShowEditModal(false);
        setEditingItem(null);
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Save investment error:', error);
      alert(error.message || 'Failed to save investment');
    } finally {
      setLoading(false);
    }
  };

  // Referral Management
  const handleAddReferral = () => {
    setAddType('referral');
    setShowAddModal(true);
  };

  const handleMarkReferralComplete = async (referralId) => {
    if (!confirm('Mark this referral as complete/active?')) return;
    try {
      const response = await adminApi.patch(`/api/admin/referrals/${referralId}/complete`);
      if (response.success) {
        alert('Referral marked as complete');
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Mark referral complete error:', error);
      alert(error.message || 'Failed to mark referral as complete');
    }
  };

  const handleSaveReferral = async (referralData) => {
    try {
      setLoading(true);
      const response = await adminApi.post(`/api/admin/users/${userDetails.user.id}/referrals`, referralData);
      if (response.success) {
        alert('Referral added successfully');
        setShowAddModal(false);
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Add referral error:', error);
      alert(error.message || 'Failed to add referral');
    } finally {
      setLoading(false);
    }
  };

  // Withdrawal Management
  const handleUpdateWithdrawalStatus = async (withdrawalId, status, additionalData = {}) => {
    try {
      setLoading(true);
      const response = await adminApi.patch(`/api/admin/withdrawals/${withdrawalId}/status`, {
        status,
        ...additionalData,
      });
      if (response.success) {
        alert('Withdrawal status updated successfully');
        await refreshUserData();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Update withdrawal status error:', error);
      alert(error.message || 'Failed to update withdrawal status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'pending',
      active: 'active',
      confirmed: 'confirmed',
      processed: 'processed',
      rejected: 'rejected',
      cancelled: 'cancelled',
      inactive: 'inactive',
    };
    return statusMap[status] || 'pending';
  };

  if (!userDetails?.user) {
    return null;
  }

  const { user, investments = [], referrals = [], withdrawals = [], referralWallet = {}, usdtWallet = {} } = userDetails;
  const userInitials = (user.fullName || user.mobile || 'U').charAt(0).toUpperCase();

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: 'bi-person', count: null },
    { id: 'investments', label: 'Investments', icon: 'bi-wallet2', count: investments.length },
    { id: 'referrals', label: 'Referrals', icon: 'bi-diagram-3', count: referrals.length },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'bi-cash-coin', count: withdrawals.length },
  ];

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              <i className="bi bi-person-circle me-2"></i>
              Manage User: {user.fullName || user.mobile}
            </h2>
            <button className={styles.closeBtn} onClick={onClose} title="Close">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body with Sidebar */}
          <div className={styles.modalBody}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              {sidebarItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.sidebarItem} ${activeSection === item.id ? styles.active : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <i className={`bi ${item.icon} ${styles.sidebarItemIcon}`}></i>
                  <span>{item.label}</span>
                  {item.count !== null && (
                    <span className={styles.sidebarItemBadge}>{item.count}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div>
                  <div className={styles.contentHeader}>
                    <h3 className={styles.contentTitle}>User Profile</h3>
                    {!editMode ? (
                      <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                        <i className="bi bi-pencil me-2"></i>Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button className="btn btn-success" onClick={handleSaveProfile} disabled={loading}>
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-check me-2"></i>
                          )}
                          Save
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                      <div className={styles.profileAvatar}>{userInitials}</div>
                      <div className={styles.profileInfo}>
                        <h4>{user.fullName || 'N/A'}</h4>
                        <p>{user.mobile} {user.email && `• ${user.email}`}</p>
                        <p className="text-muted small">Referral Code: {user.referralCode}</p>
                      </div>
                    </div>

                    <div className={styles.profileStats}>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Investment</div>
                        <div className={styles.statValue}>{formatNumber(user.totalInvestment)} USDT</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Current Balance</div>
                        <div className={styles.statValue}>{formatNumber(user.currentInvestmentBalance)} USDT</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Interest Balance</div>
                        <div className={styles.statValue}>{formatNumber(user.interestBalance)} USDT</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Direct Referrals</div>
                        <div className={styles.statValue}>{user.directReferrals || 0}</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Active Referrals</div>
                        <div className={styles.statValue}>{user.directActiveReferrals || 0}</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statLabel}>Account Status</div>
                        <div className={styles.statValue}>
                          <span className={`badge bg-${user.accountStatus === 'active' ? 'success' : 'danger'}`}>
                            {user.accountStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h5 className={styles.formSectionTitle}>Profile Information</h5>
                      <div className={styles.formRow}>
                        <div>
                          <label className="form-label">Mobile</label>
                          <input type="text" className="form-control" value={user.mobile} disabled />
                        </div>
                        <div>
                          <label className="form-label">Referral Code</label>
                          <input type="text" className="form-control" value={user.referralCode || 'N/A'} disabled />
                        </div>
                        <div>
                          <label className="form-label">Full Name</label>
                          {editMode ? (
                            <input
                              type="text"
                              className="form-control"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={user.fullName || 'N/A'} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Email</label>
                          {editMode ? (
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="email" className="form-control" value={user.email || 'N/A'} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Total Investment (USDT)</label>
                          {editMode ? (
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              name="totalInvestment"
                              value={formData.totalInvestment}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={formatNumber(user.totalInvestment)} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Current Investment Balance (USDT)</label>
                          {editMode ? (
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              name="currentInvestmentBalance"
                              value={formData.currentInvestmentBalance}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={formatNumber(user.currentInvestmentBalance)} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Interest Balance (USDT)</label>
                          {editMode ? (
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              name="interestBalance"
                              value={formData.interestBalance}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={formatNumber(user.interestBalance)} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Account Status</label>
                          {editMode ? (
                            <select
                              className="form-select"
                              name="accountStatus"
                              value={formData.accountStatus}
                              onChange={handleInputChange}
                            >
                              <option value="active">Active</option>
                              <option value="frozen">Frozen</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          ) : (
                            <input type="text" className="form-control" value={user.accountStatus || 'active'} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Direct Referrals</label>
                          {editMode ? (
                            <input
                              type="number"
                              className="form-control"
                              name="directReferrals"
                              value={formData.directReferrals}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={user.directReferrals || 0} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Direct Active Referrals</label>
                          {editMode ? (
                            <input
                              type="number"
                              className="form-control"
                              name="directActiveReferrals"
                              value={formData.directActiveReferrals}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <input type="text" className="form-control" value={user.directActiveReferrals || 0} disabled />
                          )}
                        </div>
                        <div>
                          <label className="form-label">Referral Wallet Balance</label>
                          <input type="text" className="form-control" value={formatNumber(referralWallet.currentBalance || 0)} disabled />
                        </div>
                        <div>
                          <label className="form-label">USDT Wallet Balance</label>
                          <input type="text" className="form-control" value={formatNumber(usdtWallet.currentBalance || 0)} disabled />
                        </div>
                        <div>
                          <label className="form-label">Created At</label>
                          <input type="text" className="form-control" value={formatDate(user.createdAt)} disabled />
                        </div>
                        <div>
                          <label className="form-label">Last Login</label>
                          <input type="text" className="form-control" value={formatDate(user.lastLogin)} disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investments Section */}
              {activeSection === 'investments' && (
                <div>
                  <div className={styles.contentHeader}>
                    <h3 className={styles.contentTitle}>Investment Management</h3>
                    <button className="btn btn-primary" onClick={() => {
                      setEditingItem(null);
                      setEditType('investment');
                      setShowEditModal(true);
                    }}>
                      <i className="bi bi-plus-circle me-2"></i>Add Investment
                    </button>
                  </div>

                  <div className={styles.dataTable}>
                    <div className={styles.tableHeader}>
                      <h5 className={styles.tableTitle}>Investment History</h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Lock-in Period</th>
                            <th>Transaction Hash</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investments.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 text-muted">No investments found</td>
                            </tr>
                          ) : (
                            investments.map((inv) => {
                              const lockInEndDate = inv.lockInEndDate ? new Date(inv.lockInEndDate) : null;
                              const now = new Date();
                              const daysRemaining = lockInEndDate ? Math.ceil((lockInEndDate - now) / (1000 * 60 * 60 * 24)) : null;
                              return (
                                <tr key={inv._id}>
                                  <td>{formatNumber(inv.amount)} USDT</td>
                                  <td><span className="badge bg-info">{inv.type || 'new'}</span></td>
                                  <td>
                                    <span className={`${styles.statusBadge} ${styles[getStatusBadgeClass(inv.status)]}`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                  <td>
                                    {lockInEndDate ? (
                                      <div>
                                        <div>{formatDate(lockInEndDate)}</div>
                                        {daysRemaining !== null && (
                                          <small className={daysRemaining > 0 ? 'text-warning' : 'text-success'}>
                                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Unlocked'}
                                          </small>
                                        )}
                                      </div>
                                    ) : (
                                      'N/A'
                                    )}
                                  </td>
                                  <td><code className="small">{inv.transactionHash?.substring(0, 20)}...</code></td>
                                  <td>{formatDate(inv.createdAt)}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button
                                        className={`${styles.btnIcon} ${styles.edit}`}
                                        onClick={() => handleEditInvestment(inv)}
                                        title="Edit"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button
                                        className={`${styles.btnIcon} ${styles.delete}`}
                                        onClick={() => handleDeleteInvestment(inv._id)}
                                        title="Delete"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Referrals Section */}
              {activeSection === 'referrals' && (
                <div>
                  <div className={styles.contentHeader}>
                    <h3 className={styles.contentTitle}>Referral Management</h3>
                    <button className="btn btn-primary" onClick={handleAddReferral}>
                      <i className="bi bi-plus-circle me-2"></i>Add Referral
                    </button>
                  </div>

                  <div className={styles.dataTable}>
                    <div className={styles.tableHeader}>
                      <h5 className={styles.tableTitle}>Referral Network</h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Referred User</th>
                            <th>Mobile</th>
                            <th>Total Investment</th>
                            <th>Status</th>
                            <th>Total Income</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 text-muted">No referrals found</td>
                            </tr>
                          ) : (
                            referrals.map((ref) => (
                              <tr key={ref._id || ref.id}>
                                <td>{ref.referredUserId?.fullName || ref.referredUser?.fullName || 'N/A'}</td>
                                <td>{ref.referredUserId?.mobile || ref.referredUser?.mobile || 'N/A'}</td>
                                <td>{formatNumber(ref.referredUserId?.totalInvestment || ref.referredUser?.totalInvestment || 0)} USDT</td>
                                <td>
                                  <span className={`${styles.statusBadge} ${styles[getStatusBadgeClass(ref.status)]}`}>
                                    {ref.status}
                                  </span>
                                </td>
                                <td>{formatNumber(ref.totalIncome || 0)} USDT</td>
                                <td>{formatDate(ref.createdAt)}</td>
                                <td>
                                  {ref.status === 'pending' && (
                                    <button
                                      className={`${styles.btnIcon} ${styles.complete}`}
                                      onClick={() => handleMarkReferralComplete(ref._id || ref.id)}
                                      title="Mark as Complete"
                                    >
                                      <i className="bi bi-check-circle"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Withdrawals Section */}
              {activeSection === 'withdrawals' && (
                <div>
                  <div className={styles.contentHeader}>
                    <h3 className={styles.contentTitle}>Withdrawal History</h3>
                  </div>

                  <div className={styles.dataTable}>
                    <div className={styles.tableHeader}>
                      <h5 className={styles.tableTitle}>Withdrawal Requests</h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>USDT Address</th>
                            <th>Request Date</th>
                            <th>Processed Date</th>
                            <th>Transaction Hash</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4 text-muted">No withdrawals found</td>
                            </tr>
                          ) : (
                            withdrawals.map((wd) => (
                              <tr key={wd._id}>
                                <td>{formatNumber(wd.amount)} USDT</td>
                                <td><span className="badge bg-info">{wd.withdrawalType || 'interest'}</span></td>
                                <td>
                                  <span className={`${styles.statusBadge} ${styles[getStatusBadgeClass(wd.status)]}`}>
                                    {wd.status}
                                  </span>
                                </td>
                                <td><code className="small">{wd.usdtAddress?.substring(0, 15)}...</code></td>
                                <td>{formatDate(wd.requestDate || wd.createdAt)}</td>
                                <td>{formatDate(wd.processedDate)}</td>
                                <td><code className="small">{wd.transactionHash?.substring(0, 15)}...</code></td>
                                <td>
                                  <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                      Change Status
                                    </button>
                                    <ul className="dropdown-menu">
                                      {wd.status !== 'pending' && (
                                        <li>
                                          <button className="dropdown-item" onClick={() => handleUpdateWithdrawalStatus(wd._id, 'pending')}>
                                            Set to Pending
                                          </button>
                                        </li>
                                      )}
                                      {wd.status !== 'approved' && (
                                        <li>
                                          <button className="dropdown-item" onClick={() => handleUpdateWithdrawalStatus(wd._id, 'approved')}>
                                            Approve
                                          </button>
                                        </li>
                                      )}
                                      {wd.status !== 'rejected' && (
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              const reason = prompt('Enter rejection reason:');
                                              if (reason) handleUpdateWithdrawalStatus(wd._id, 'rejected', { rejectionReason: reason });
                                            }}
                                          >
                                            Reject
                                          </button>
                                        </li>
                                      )}
                                      {wd.status === 'approved' && (
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              const txHash = prompt('Enter transaction hash:');
                                              if (txHash) handleUpdateWithdrawalStatus(wd._id, 'processed', { transactionHash: txHash });
                                            }}
                                          >
                                            Mark as Processed
                                          </button>
                                        </li>
                                      )}
                                      {wd.status !== 'cancelled' && (
                                        <li>
                                          <button className="dropdown-item text-danger" onClick={() => handleUpdateWithdrawalStatus(wd._id, 'cancelled')}>
                                            Cancel
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Investment Modal */}
      {showEditModal && editType === 'investment' && (
        <InvestmentEditModal
          investment={editingItem}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
            setEditType(null);
          }}
          onSave={handleSaveInvestment}
          loading={loading}
        />
      )}

      {/* Add Referral Modal */}
      {showAddModal && addType === 'referral' && (
        <AddReferralModal
          onClose={() => {
            setShowAddModal(false);
            setAddType(null);
          }}
          onSave={handleSaveReferral}
          loading={loading}
        />
      )}
    </>
  );
}

// Investment Edit Modal Component
function InvestmentEditModal({ investment, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    amount: investment?.amount || 0,
    status: investment?.status || 'pending',
    transactionHash: investment?.transactionHash || '',
    lockInDays: investment?.lockInEndDate
      ? Math.ceil((new Date(investment.lockInEndDate) - (investment.confirmedAt ? new Date(investment.confirmedAt) : new Date(investment.createdAt))) / (1000 * 60 * 60 * 24))
      : 90,
    adminNotes: investment?.adminNotes || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className={styles.editModalOverlay} onClick={onClose}></div>
      <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{investment ? 'Edit Investment' : 'Add New Investment'}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Amount (USDT)</label>
            <input
              type="number"
              step="0.01"
              min="10"
              className="form-control"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={formData.status} onChange={handleChange} required>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Transaction Hash</label>
            <input
              type="text"
              className="form-control"
              name="transactionHash"
              value={formData.transactionHash}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Lock-in Period (Days)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="lockInDays"
              value={formData.lockInDays}
              onChange={handleChange}
              required
            />
            <small className="text-muted">0 = No lock-in period</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Admin Notes</label>
            <textarea
              className="form-control"
              rows="3"
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleChange}
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {investment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Add Referral Modal Component
function AddReferralModal({ onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    referredUserId: '',
    referralCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className={styles.editModalOverlay} onClick={onClose}></div>
      <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Add New Referral</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Referred User ID</label>
            <input
              type="text"
              className="form-control"
              name="referredUserId"
              value={formData.referredUserId}
              onChange={handleChange}
              placeholder="Enter user ID"
              required
            />
            <small className="text-muted">Enter the MongoDB user ID of the referred user</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Referral Code (Optional)</label>
            <input
              type="text"
              className="form-control"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Leave empty to use referrer's code"
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Add Referral
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
