'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function WithdrawalRequests() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [actionData, setActionData] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchWithdrawals();
  }, [isAuthenticated, statusFilter, searchTerm]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');

      const response = await adminApi.get(`/api/admin/withdrawals?${params.toString()}`);
      
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
      if (error.status === 401 || error.status === 403) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    try {
      setActionLoading({ ...actionLoading, [`approve-${withdrawalId}`]: true });
      const response = await adminApi.patch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        transactionHash: actionData[`tx-${withdrawalId}`] || '',
        adminNotes: actionData[`notes-${withdrawalId}`] || '',
      });
      
      if (response.success) {
        alert('Withdrawal approved successfully');
        await fetchWithdrawals();
        setShowModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      alert(error.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${withdrawalId}`]: false });
    }
  };

  const handleReject = async (withdrawalId) => {
    const reason = actionData[`reason-${withdrawalId}`] || '';
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`reject-${withdrawalId}`]: true });
      const response = await adminApi.patch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        rejectionReason: reason,
        adminNotes: actionData[`notes-${withdrawalId}`] || '',
      });
      
      if (response.success) {
        alert('Withdrawal rejected successfully');
        await fetchWithdrawals();
        setShowModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      alert(error.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [`reject-${withdrawalId}`]: false });
    }
  };

  const handleProcess = async (withdrawalId) => {
    const txHash = actionData[`process-tx-${withdrawalId}`] || '';
    if (!txHash) {
      alert('Please provide transaction hash');
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`process-${withdrawalId}`]: true });
      const response = await adminApi.patch(`/api/admin/withdrawals/${withdrawalId}/process`, {
        transactionHash: txHash,
      });
      
      if (response.success) {
        alert('Withdrawal processed successfully');
        await fetchWithdrawals();
        setShowModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      console.error('Process withdrawal error:', error);
      alert(error.message || 'Failed to process withdrawal');
    } finally {
      setActionLoading({ ...actionLoading, [`process-${withdrawalId}`]: false });
    }
  };

  const handleViewDetails = async (withdrawalId) => {
    try {
      const response = await adminApi.get(`/api/admin/withdrawals/${withdrawalId}`);
      if (response.success && response.data) {
        setSelectedWithdrawal(response.data.withdrawal);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Get withdrawal details error:', error);
      alert(error.message || 'Failed to fetch withdrawal details');
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

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Withdrawal Requests</h1>
          <p className="text-muted">Manage all withdrawal requests</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by user mobile or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No withdrawals found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>USDT Address</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => (
                    <tr key={wd.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{wd.user?.fullName || 'N/A'}</div>
                          <small className="text-muted">{wd.user?.mobile || 'N/A'}</small>
                        </div>
                      </td>
                      <td>{formatNumber(wd.amount)} USDT</td>
                      <td>
                        <span className="badge bg-info">{wd.withdrawalType || 'interest'}</span>
                      </td>
                      <td>
                        <code className="small">{wd.usdtAddress?.substring(0, 20)}...</code>
                      </td>
                      <td>{formatDate(wd.requestDate)}</td>
                      <td>
                        <span className={`badge bg-${
                          wd.status === 'approved' ? 'success' :
                          wd.status === 'pending' ? 'warning' :
                          wd.status === 'rejected' ? 'danger' :
                          'info'
                        }`}>
                          {wd.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(wd.id)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {wd.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setSelectedWithdrawal(wd);
                                  setShowModal(true);
                                }}
                                title="Approve"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setSelectedWithdrawal(wd);
                                  setShowModal(true);
                                }}
                                title="Reject"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </>
                          )}
                          {wd.status === 'approved' && (
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => {
                                setSelectedWithdrawal(wd);
                                setShowModal(true);
                              }}
                              title="Process"
                            >
                              <i className="bi bi-check2-all"></i>
                            </button>
                          )}
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

      {/* Action Modal */}
      {showModal && selectedWithdrawal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Withdrawal Details</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">User</label>
                    <div>
                      <div>{selectedWithdrawal.user?.fullName || 'N/A'}</div>
                      <small className="text-muted">{selectedWithdrawal.user?.mobile || 'N/A'}</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Amount</label>
                    <div className="fw-bold">{formatNumber(selectedWithdrawal.amount)} USDT</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Type</label>
                    <div><span className="badge bg-info">{selectedWithdrawal.withdrawalType || 'interest'}</span></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <div>
                      <span className={`badge bg-${
                        selectedWithdrawal.status === 'approved' ? 'success' :
                        selectedWithdrawal.status === 'pending' ? 'warning' :
                        selectedWithdrawal.status === 'rejected' ? 'danger' :
                        'info'
                      }`}>
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">USDT Address</label>
                    <code className="d-block p-2 bg-light rounded">{selectedWithdrawal.usdtAddress}</code>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Request Date</label>
                    <div>{formatDate(selectedWithdrawal.requestDate)}</div>
                  </div>
                  {selectedWithdrawal.processedDate && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Processed Date</label>
                      <div>{formatDate(selectedWithdrawal.processedDate)}</div>
                    </div>
                  )}
                  {selectedWithdrawal.transactionHash && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Transaction Hash</label>
                      <code className="d-block p-2 bg-light rounded">{selectedWithdrawal.transactionHash}</code>
                    </div>
                  )}
                  {selectedWithdrawal.rejectionReason && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Rejection Reason</label>
                      <div className="p-2 bg-light rounded">{selectedWithdrawal.rejectionReason}</div>
                    </div>
                  )}
                  {selectedWithdrawal.adminNotes && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Admin Notes</label>
                      <div className="p-2 bg-light rounded">{selectedWithdrawal.adminNotes}</div>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.status === 'pending' && (
                  <>
                    <hr />
                    <h6 className="fw-bold mb-3">Actions</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Transaction Hash (Optional for approval)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter transaction hash"
                          value={actionData[`tx-${selectedWithdrawal.id}`] || ''}
                          onChange={(e) => setActionData({
                            ...actionData,
                            [`tx-${selectedWithdrawal.id}`]: e.target.value,
                          })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Rejection Reason (Required for rejection)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Enter rejection reason"
                          value={actionData[`reason-${selectedWithdrawal.id}`] || ''}
                          onChange={(e) => setActionData({
                            ...actionData,
                            [`reason-${selectedWithdrawal.id}`]: e.target.value,
                          })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Admin Notes (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Enter admin notes"
                          value={actionData[`notes-${selectedWithdrawal.id}`] || ''}
                          onChange={(e) => setActionData({
                            ...actionData,
                            [`notes-${selectedWithdrawal.id}`]: e.target.value,
                          })}
                        />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(selectedWithdrawal.id)}
                          disabled={actionLoading[`approve-${selectedWithdrawal.id}`]}
                        >
                          {actionLoading[`approve-${selectedWithdrawal.id}`] ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-check-circle me-2"></i>
                          )}
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(selectedWithdrawal.id)}
                          disabled={actionLoading[`reject-${selectedWithdrawal.id}`]}
                        >
                          {actionLoading[`reject-${selectedWithdrawal.id}`] ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-x-circle me-2"></i>
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedWithdrawal.status === 'approved' && (
                  <>
                    <hr />
                    <h6 className="fw-bold mb-3">Process Withdrawal</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Transaction Hash (Required)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter transaction hash"
                          value={actionData[`process-tx-${selectedWithdrawal.id}`] || ''}
                          onChange={(e) => setActionData({
                            ...actionData,
                            [`process-tx-${selectedWithdrawal.id}`]: e.target.value,
                          })}
                        />
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-info"
                          onClick={() => handleProcess(selectedWithdrawal.id)}
                          disabled={actionLoading[`process-${selectedWithdrawal.id}`]}
                        >
                          {actionLoading[`process-${selectedWithdrawal.id}`] ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-check2-all me-2"></i>
                          )}
                          Mark as Processed
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(WithdrawalRequests);
