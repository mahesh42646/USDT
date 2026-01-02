'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function WithdrawalPage() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    usdtAddress: '',
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStats, setWithdrawalStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, type = 'interest') => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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
        type: type, // 'interest' or 'investment'
      });

      setSuccess(`${type === 'interest' ? 'Interest' : 'Investment'} withdrawal request submitted successfully! It will be processed within 24 hours.`);
      setFormData({ amount: '', usdtAddress: '' });
      fetchWithdrawalData(); // Refresh list
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError(error.message || 'Failed to submit withdrawal request. Please try again.');
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
  const canWithdrawInterest = withdrawalStats?.canWithdrawInterest || false;
  const canWithdrawInvestment = withdrawalStats?.canWithdrawInvestment || false;
  const hasMonthlyWithdrawal = withdrawalStats?.hasMonthlyWithdrawal || false;

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

      {hasMonthlyWithdrawal && (
        <div className="alert alert-info mb-4" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Note:</strong> You already have a withdrawal request this month. Only one withdrawal per month is allowed.
        </div>
      )}

      <div className="row g-4">
        {/* Interest Withdrawal Form */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-percent me-2"></i>
                Withdraw Interest
              </h5>
            </div>
            <div className="card-body">
              {error && error.includes('Interest') && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && success.includes('Interest') && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <div className="mb-3">
                <p className="text-muted small mb-2">
                  <strong>Available Interest:</strong> ${availableInterestBalance.toFixed(2)}
                </p>
                <p className="text-muted small mb-2">
                  <strong>Maximum Withdrawal:</strong> ${maxInterestWithdrawal.toFixed(2)} (30% of monthly interest)
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e, 'interest');
              }}>
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
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      disabled={!canWithdrawInterest}
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
                    value={formData.usdtAddress}
                    onChange={handleChange}
                    required
                    disabled={!canWithdrawInterest}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !canWithdrawInterest}
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

              <div className="alert alert-info mt-3 mb-0" role="alert">
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
          </div>
        </div>

        {/* Investment Withdrawal Form */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Withdraw Investment
              </h5>
            </div>
            <div className="card-body">
              {error && error.includes('Investment') && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && success.includes('Investment') && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <div className="mb-3">
                <p className="text-muted small mb-2">
                  <strong>Available Investment:</strong> ${availableInvestmentAmount.toFixed(2)}
                </p>
                <p className="text-muted small mb-2">
                  <strong>Locked Investment:</strong> ${lockedInvestmentAmount.toFixed(2)} (90-day lock-in period)
                </p>
              </div>

              {availableInvestmentAmount >= 20 ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e, 'investment');
                }}>
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
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        disabled={!canWithdrawInvestment}
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
                      value={formData.usdtAddress}
                      onChange={handleChange}
                      required
                      disabled={!canWithdrawInvestment}
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
              ) : (
                <div className="alert alert-warning mb-0" role="alert">
                  <i className="bi bi-lock me-2"></i>
                  No investment available for withdrawal. Investments are locked for 90 days from the investment date.
                </div>
              )}

              <div className="alert alert-info mt-3 mb-0" role="alert">
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
          </div>
        </div>
      </div>

      {/* Investment Lock-in Details */}
      {investmentDetails.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Investment Lock-in Details
            </h5>
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
                  {investmentDetails.map((inv) => (
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
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Withdrawal History
              </h5>
            </div>
            <div className="card-body">
              {fetchLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : withdrawals.length > 0 ? (
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
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id || withdrawal.id}>
                          <td>
                            <strong>${withdrawal.amount.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${
                              withdrawal.status === 'processed' ? 'bg-success' :
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
}export default withAuth(WithdrawalPage);