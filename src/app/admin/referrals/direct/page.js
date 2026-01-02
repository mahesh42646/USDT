'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function DirectReferralList() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedReferral, setExpandedReferral] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReferrals();
    }
  }, [isAuthenticated, currentPage, searchTerm, statusFilter, sortBy]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: sortBy,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await adminApi.get(`/api/admin/referrals?${params.toString()}`);
      
      if (response.success) {
        setReferrals(response.data.referrals || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch referrals');
      }
    } catch (err) {
      console.error('Fetch referrals error:', err);
      setError(err.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const toggleExpandReferral = (referralId) => {
    setExpandedReferral(expandedReferral === referralId ? null : referralId);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={styles.pageContainer}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-2">Direct Referral List</h1>
          <p className="text-muted">View all referral relationships and their chains</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by mobile, name, email, or referral code..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={sortBy} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="incomeHigh">Income: High to Low</option>
                <option value="incomeLow">Income: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading referrals...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : referrals.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              No referrals found.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Referrer</th>
                      <th>Referred User</th>
                      <th>Status</th>
                      <th>Income</th>
                      <th>Date</th>
                      <th>Chain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <>
                        <tr key={ref.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{ref.referrer?.fullName || 'N/A'}</div>
                              <small className="text-muted">{ref.referrer?.mobile}</small>
                              <br />
                              <small className="text-muted">Code: {ref.referrer?.referralCode}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{ref.referred?.fullName || 'N/A'}</div>
                              <small className="text-muted">{ref.referred?.mobile}</small>
                              <br />
                              <small className="text-muted">Code: {ref.referred?.referralCode}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${
                              ref.status === 'active' ? 'success' : 
                              ref.status === 'pending' ? 'warning' : 
                              'secondary'
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold">{formatCurrency(ref.totalIncome)} USDT</div>
                            {ref.activatedAt && (
                              <small className="text-muted">Activated: {formatDate(ref.activatedAt)}</small>
                            )}
                          </td>
                          <td>
                            <div>{formatDate(ref.createdAt)}</div>
                            {ref.lastIncomeDate && (
                              <small className="text-muted">Last income: {formatDate(ref.lastIncomeDate)}</small>
                            )}
                          </td>
                          <td>
                            {ref.chain && ref.chain.length > 0 ? (
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => toggleExpandReferral(ref.id)}
                                title="View referral chain"
                              >
                                <i className={`bi bi-${expandedReferral === ref.id ? 'chevron-up' : 'chevron-down'}`}></i>
                                {ref.chain.length} level{ref.chain.length !== 1 ? 's' : ''}
                              </button>
                            ) : (
                              <span className="text-muted">No chain</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => router.push(`/admin/users/${ref.referred?.id}`)}
                              title="View user details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                        {expandedReferral === ref.id && ref.chain && ref.chain.length > 0 && (
                          <tr>
                            <td colSpan="7" className="bg-light">
                              <div className="p-3">
                                <h6 className="fw-bold mb-3">
                                  <i className="bi bi-diagram-3 me-2"></i>
                                  Referral Chain (Nth Level Referrals)
                                </h6>
                                <div className="row g-3">
                                  {ref.chain.map((chainItem, index) => (
                                    <div key={index} className="col-md-6 col-lg-4">
                                      <div className="card border">
                                        <div className="card-body">
                                          <div className="d-flex align-items-center mb-2">
                                            <span className="badge bg-primary me-2">Level {chainItem.level}</span>
                                            <small className="text-muted">#{index + 1}</small>
                                          </div>
                                          <div className="fw-semibold">{chainItem.user?.fullName || 'N/A'}</div>
                                          <small className="text-muted d-block">{chainItem.user?.mobile}</small>
                                          <small className="text-muted d-block">Code: {chainItem.user?.referralCode}</small>
                                          {chainItem.user?.email && (
                                            <small className="text-muted d-block">{chainItem.user.email}</small>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(page)}>
                              {page}
                            </button>
                          </li>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(DirectReferralList);
