'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function WithdrawalPage() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('investment'); // Default tab
  const [interestFormData, setInterestFormData] = useState({
    amount: '',
    usdtAddress: '',
  });
  const [investmentFormData, setInvestmentFormData] = useState({
    amount: '',
    usdtAddress: '',
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStats, setWithdrawalStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination states
  const [investmentPage, setInvestmentPage] = useState(1);
  const [investmentPageSize, setInvestmentPageSize] = useState(12);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalPageSize, setWithdrawalPageSize] = useState(12);

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      setFetchLoading(true);
      const [historyRes, statsRes] = await Promise.all([
        api.get('/api/withdrawal/history'),
        api.get('/api/withdrawal/stats'),
      ]);
      setWithdrawals(historyRes.data || []);
      setWithdrawalStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      setError('Failed to load withdrawal data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInterestChange = (e) => {
    const { name, value } = e.target;
    setInterestFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvestmentChange = (e) => {
    const { name, value } = e.target;
    setInvestmentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, type = 'investment') => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = type === 'interest' ? interestFormData : investmentFormData;
    const amount = parseFloat(formData.amount);

    if (!amount || amount < 20) {
      setError(`Minimum withdrawal is 20 USDT`);
      setLoading(false);
      return;
    }

    if (!formData.usdtAddress || formData.usdtAddress.trim() === '') {
      setError('USDT address is required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/withdrawal/request', {
        amount: amount,
        usdtAddress: formData.usdtAddress.trim(),
        type: type,
      });

      setSuccess(`${type === 'interest' ? 'Interest' : 'Investment'} withdrawal request submitted successfully! It will be processed within 24 hours.`);

      // Clear the form for the submitted type
      if (type === 'interest') {
        setInterestFormData({ amount: '', usdtAddress: '' });
      } else {
        setInvestmentFormData({ amount: '', usdtAddress: '' });
      }

      fetchWithdrawalData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableInterestBalance = withdrawalStats?.availableInterestBalance || 0;
  const maxInterestWithdrawal = withdrawalStats?.maxInterestWithdrawal || 0;
  const availableInvestmentAmount = withdrawalStats?.availableInvestmentAmount || 0;
  const lockedInvestmentAmount = withdrawalStats?.lockedInvestmentAmount || 0;
  const investmentDetails = withdrawalStats?.investmentDetails || [];
  const isLocked = withdrawalStats?.isLocked || false;
  const hasMonthlyWithdrawal = withdrawalStats?.hasMonthlyWithdrawal || false;
  const canWithdrawInterest = (withdrawalStats?.canWithdrawInterest || false) && !hasMonthlyWithdrawal;
  const canWithdrawInvestment = withdrawalStats?.canWithdrawInvestment || false;

  // Pagination calculations
  const investmentStartIndex = (investmentPage - 1) * investmentPageSize;
  const investmentEndIndex = investmentStartIndex + investmentPageSize;
  const paginatedInvestmentDetails = investmentDetails.slice(investmentStartIndex, investmentEndIndex);
  const investmentTotalPages = Math.ceil(investmentDetails.length / investmentPageSize);

  const withdrawalStartIndex = (withdrawalPage - 1) * withdrawalPageSize;
  const withdrawalEndIndex = withdrawalStartIndex + withdrawalPageSize;
  const paginatedWithdrawals = withdrawals.slice(withdrawalStartIndex, withdrawalEndIndex);
  const withdrawalTotalPages = Math.ceil(withdrawals.length / withdrawalPageSize);

  return (
    <div className={styles.withdrawalPage}>
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-cash-coin me-2"></i>
          Withdrawal
        </h1>
        <p className="text-muted">Request withdrawals and view your withdrawal history</p>
      </div>

      {/* Withdrawal Lock Warning */}
      {isLocked && (
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-lock me-2"></i>
          <strong>Withdrawal Locked:</strong> You need to invest minimum 500 USDT to unlock withdrawals.
          Your current investment: ${withdrawalStats?.totalInvestment || 0}
        </div>
      )}

      {/* Balance Overview */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Interest Balance</p>
              <h4 className="text-primary mb-0">${availableInterestBalance.toFixed(2)}</h4>
              <small className="text-muted">Available for withdrawal</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Available Investment</p>
              <h4 className="text-success mb-0">${availableInvestmentAmount.toFixed(2)}</h4>
              <small className="text-muted">Unlocked (90 days passed)</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Locked Investment</p>
              <h4 className="text-warning mb-0">${lockedInvestmentAmount.toFixed(2)}</h4>
              <small className="text-muted">In 90-day lock-in period</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Max Interest Withdrawal</p>
              <h4 className="text-info mb-0">${maxInterestWithdrawal.toFixed(2)}</h4>
              <small className="text-muted">30% of monthly interest</small>
            </div>
          </div>
        </div>
      </div>

      {hasMonthlyWithdrawal && activeTab === 'interest' && (
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Note:</strong> You already have an interest withdrawal request this month. Only one interest withdrawal per month is allowed.
        </div>
      )}

      {/* Single Form with Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'investment' ? 'active' : ''}`}
                onClick={() => setActiveTab('investment')}
                type="button"
              >
                <i className="bi bi-wallet2 me-2"></i>
                Withdraw Investment
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'interest' ? 'active' : ''}`}
                onClick={() => setActiveTab('interest')}
                type="button"
              >
                <i className="bi bi-percent me-2"></i>
                Withdraw Interest
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {/* Investment Withdrawal Tab */}
          {activeTab === 'investment' && (
            <div className='d-lg-flex gap-3 pe-3'>


              {availableInvestmentAmount >= 20 ? (
                <div className='col-lg-6'>
                  <div className="mb-3">
                    <p className="text-muted small mb-2">
                      <strong>Available Investment:</strong> ${availableInvestmentAmount.toFixed(2)}
                    </p>
                    <p className="text-muted small mb-2">
                      <strong>Locked Investment:</strong> ${lockedInvestmentAmount.toFixed(2)} (90-day lock-in period)
                    </p>
                  </div>
                  <form onSubmit={(e) => handleSubmit(e, 'investment')}>
                    <div className="mb-3">
                      <label htmlFor="investmentAmount" className="form-label">
                        Withdrawal Amount (USDT)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          id="investmentAmount"
                          name="amount"
                          placeholder="20.00"
                          min="20"
                          max={availableInvestmentAmount}
                          step="0.01"
                          value={investmentFormData.amount}
                          onChange={handleInvestmentChange}
                          required
                          disabled={!canWithdrawInvestment || loading}
                        />
                      </div>
                      <small className="text-muted">
                        Minimum: 20 USDT | Maximum: ${availableInvestmentAmount.toFixed(2)}
                      </small>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="investmentUsdtAddress" className="form-label">
                        USDT Wallet Address (TRC20)
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        id="investmentUsdtAddress"
                        name="usdtAddress"
                        placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={investmentFormData.usdtAddress}
                        onChange={handleInvestmentChange}
                        required
                        disabled={!canWithdrawInvestment || loading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success w-100"
                      disabled={loading || !canWithdrawInvestment}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Request Investment Withdrawal
                        </>
                      )}
                    </button>
                  </form>
                </div>

              ) : (
                <div className="alert alert-warning mb-0" role="alert">
                  <i className="bi bi-lock me-2"></i>
                  No investment available for withdrawal. Investments are locked for 90 days from the investment date.
                </div>
              )}
              <div className="alert alert-info mt-3 mb-0 col-lg-6" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Investment Withdrawal Rules:</strong>
                <ul className="mb-0 mt-2 small">
                  <li>90-day lock-in period from investment date</li>
                  <li>Minimum: 20 USDT</li>
                  <li>Only unlocked investments can be withdrawn</li>
                  <li>Processed within 24 hours</li>
                </ul>
              </div>

            </div>
          )}

          {/* Interest Withdrawal Tab */}
          {activeTab === 'interest' && (
            <div className='d-lg-flex gap-3 pe-3'>
              <div className='col-lg-6'>
              <div className="mb-3">
                <p className="text-muted small mb-2">
                  <strong>Available Interest:</strong> ${availableInterestBalance.toFixed(2)}
                </p>
                <p className="text-muted small mb-2">
                  <strong>Maximum Withdrawal:</strong> ${maxInterestWithdrawal.toFixed(2)} (30% of monthly interest)
                </p>
              </div>

              <form onSubmit={(e) => handleSubmit(e, 'interest')}>
                <div className="mb-3">
                  <label htmlFor="interestAmount" className="form-label">
                    Withdrawal Amount (USDT)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="interestAmount"
                      name="amount"
                      placeholder="20.00"
                      min="20"
                      max={Math.min(availableInterestBalance, maxInterestWithdrawal)}
                      step="0.01"
                      value={interestFormData.amount}
                      onChange={handleInterestChange}
                      required
                      disabled={!canWithdrawInterest || loading || hasMonthlyWithdrawal}
                    />
                  </div>
                  <small className="text-muted">
                    Minimum: 20 USDT | Maximum: ${Math.min(availableInterestBalance, maxInterestWithdrawal).toFixed(2)}
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="interestUsdtAddress" className="form-label">
                    USDT Wallet Address (TRC20)
                  </label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    id="interestUsdtAddress"
                    name="usdtAddress"
                    placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={interestFormData.usdtAddress}
                    onChange={handleInterestChange}
                    required
                    disabled={!canWithdrawInterest || loading || hasMonthlyWithdrawal}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !canWithdrawInterest || hasMonthlyWithdrawal}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Request Interest Withdrawal
                    </>
                  )}
                </button>
              </form>
                </div>

              <div className="alert alert-info mt-3 mb-0 col-lg-6" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Interest Withdrawal Rules:</strong>
                <ul className="mb-0 mt-2 small">
                  <li>Minimum: 20 USDT</li>
                  <li>Maximum: 30% of monthly interest accumulated</li>
                  <li>One withdrawal per month only</li>
                  <li>Processed within 24 hours</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Lock-in Details */}
      {investmentDetails.length > 0 && (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Investment Lock-in Details
            </h5>
            <div className="d-flex align-items-center gap-2">
              <label className="small mb-0">Show:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={investmentPageSize}
                onChange={(e) => {
                  setInvestmentPageSize(Number(e.target.value));
                  setInvestmentPage(1);
                }}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Investment Date</th>
                    <th>Lock-in End Date</th>
                    <th>Days Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvestmentDetails.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong>${inv.amount.toFixed(2)}</strong>
                      </td>
                      <td>{new Date(inv.investmentDate).toLocaleDateString()}</td>
                      <td>{new Date(inv.lockInEndDate).toLocaleDateString()}</td>
                      <td>
                        {inv.isAvailable ? (
                          <span className="badge bg-success">Available</span>
                        ) : (
                          <span className="badge bg-warning">{inv.daysRemaining} days</span>
                        )}
                      </td>
                      <td>
                        {inv.isAvailable ? (
                          <span className="badge bg-success">
                            <i className="bi bi-unlock me-1"></i>Unlocked
                          </span>
                        ) : (
                          <span className="badge bg-warning">
                            <i className="bi bi-lock me-1"></i>Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {investmentTotalPages > 1 && (
              <nav aria-label="Investment pagination">
                <ul className="pagination pagination-sm justify-content-center mt-3 mb-0">
                  <li className={`page-item ${investmentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setInvestmentPage(prev => Math.max(1, prev - 1))}
                      disabled={investmentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(investmentTotalPages)].map((_, i) => (
                    <li key={i + 1} className={`page-item ${investmentPage === i + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setInvestmentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${investmentPage === investmentTotalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setInvestmentPage(prev => Math.min(investmentTotalPages, prev + 1))}
                      disabled={investmentPage === investmentTotalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Withdrawal History
              </h5>
              <div className="d-flex align-items-center gap-2">
                <label className="small mb-0">Show:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={withdrawalPageSize}
                  onChange={(e) => {
                    setWithdrawalPageSize(Number(e.target.value));
                    setWithdrawalPage(1);
                  }}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {fetchLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : withdrawals.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Request Date</th>
                          <th>Processed Date</th>
                          <th>Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal._id || withdrawal.id}>
                            <td>
                              <strong>${withdrawal.amount.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={`badge ${withdrawal.status === 'processed' ? 'bg-success' :
                                  withdrawal.status === 'approved' ? 'bg-info' :
                                    withdrawal.status === 'pending' ? 'bg-warning' :
                                      'bg-danger'
                                }`}>
                                {withdrawal.status}
                              </span>
                            </td>
                            <td>{new Date(withdrawal.requestDate).toLocaleString()}</td>
                            <td>
                              {withdrawal.processedDate
                                ? new Date(withdrawal.processedDate).toLocaleString()
                                : '-'
                              }
                            </td>
                            <td>
                              {withdrawal.transactionHash ? (
                                <small className="text-muted font-monospace">
                                  {withdrawal.transactionHash.substring(0, 10)}...
                                </small>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {withdrawalTotalPages > 1 && (
                    <nav aria-label="Withdrawal pagination">
                      <ul className="pagination pagination-sm justify-content-center mt-3 mb-0">
                        <li className={`page-item ${withdrawalPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setWithdrawalPage(prev => Math.max(1, prev - 1))}
                            disabled={withdrawalPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(withdrawalTotalPages)].map((_, i) => (
                          <li key={i + 1} className={`page-item ${withdrawalPage === i + 1 ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setWithdrawalPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${withdrawalPage === withdrawalTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setWithdrawalPage(prev => Math.min(withdrawalTotalPages, prev + 1))}
                            disabled={withdrawalPage === withdrawalTotalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-cash-coin" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">No withdrawals yet</p>
                  <p className="text-muted small">Your withdrawal history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(WithdrawalPage);
