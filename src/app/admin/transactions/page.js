'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function TransactionHistory() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchTransactions();
  }, [isAuthenticated, typeFilter, statusFilter, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');

      const response = await adminApi.get(`/api/admin/transactions?${params.toString()}`);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      if (error.status === 401 || error.status === 403) {
        router.push('/admin/login');
      }
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

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'investment':
        return 'primary';
      case 'withdrawal':
        return 'warning';
      case 'referral':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Transaction History</h1>
          <p className="text-muted">Complete transaction history across the platform</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
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
            <div className="col-md-4">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="investment">Investment</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="referral">Referral</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="processed">Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No transactions found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction Hash</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.date)}</td>
                      <td>
                        <div>
                          <div className="fw-semibold">{tx.user?.fullName || 'N/A'}</div>
                          <small className="text-muted">{tx.user?.mobile || 'N/A'}</small>
                          {tx.referredUser && (
                            <div className="small text-muted">
                              Referred: {tx.referredUser.fullName || tx.referredUser.mobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getTypeBadgeColor(tx.type)}`}>
                          {tx.type}
                          {tx.investmentType && ` (${tx.investmentType})`}
                          {tx.withdrawalType && ` (${tx.withdrawalType})`}
                        </span>
                      </td>
                      <td className="fw-semibold">{formatNumber(tx.amount)} USDT</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        {tx.transactionHash ? (
                          <code className="small">{tx.transactionHash.substring(0, 20)}...</code>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {tx.processedDate && (
                          <div className="small text-muted">
                            Processed: {formatDate(tx.processedDate)}
                          </div>
                        )}
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

export default withAdminAuth(TransactionHistory);