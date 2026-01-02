'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function InvestmentPage() {
  const { userData } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('gateway'); // 'gateway', 'trc20', 'p2p'
  const [formData, setFormData] = useState({
    amount: '',
    transactionHash: '',
    currency: 'USDT',
  });
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchInvestments();
    
    // Check for payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');
    
    if (paymentStatus === 'success' && orderId) {
      setSuccess('Payment completed successfully! Your investment has been added.');
      fetchInvestments();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      setError('Payment was cancelled. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchInvestments = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get('/api/investment/history');
      setInvestments(response.data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to load investment history');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGatewayPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessingPayment(true);

    const amount = parseFloat(formData.amount);
    const minAmount = 9.69; // NOWPayments exact minimum for testing
    if (!amount || amount < minAmount) {
      setError(`Minimum investment is ${minAmount} USDT (NOWPayments minimum for testing)`);
      setProcessingPayment(false);
      return;
    }

    try {
      const response = await api.post('/api/payment/gateway/initiate', {
        amount: amount,
        currency: 'USDT', // Always use USDT
        provider: 'nowpayments', // NOWPayments payment gateway
      });

      if (response.success && response.payment && response.payment.paymentUrl) {
        // Redirect to payment gateway
        setSuccess('Redirecting to payment gateway...');
        setFormData({ amount: '', transactionHash: '', currency: 'USDT' });
        
        // Open payment gateway in new window/tab
        const paymentWindow = window.open(
          response.payment.paymentUrl,
          'payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        // Monitor payment window (optional - for better UX)
        if (paymentWindow) {
          const checkPayment = setInterval(async () => {
            try {
              if (paymentWindow.closed) {
                clearInterval(checkPayment);
                // Wait a bit for webhook to process
                await new Promise(resolve => setTimeout(resolve, 3000));
                // Check payment status and force update if needed
                const statusResponse = await api.get(`/api/payment/status/${response.payment.orderId}`);
                if (statusResponse.success) {
                  if (statusResponse.payment.status === 'completed') {
                    setSuccess('Payment completed successfully! Your investment has been added.');
                    fetchInvestments();
                  } else {
                    // Payment might be processing, check again after delay
                    setTimeout(async () => {
                      const retryResponse = await api.get(`/api/payment/status/${response.payment.orderId}`);
                      if (retryResponse.success && retryResponse.payment.status === 'completed') {
                        setSuccess('Payment completed successfully! Your investment has been added.');
                        fetchInvestments();
                      }
                    }, 5000);
                  }
                }
              }
            } catch (err) {
              console.error('Payment status check error:', err);
            }
          }, 2000);

          // Clear interval after 5 minutes
          setTimeout(() => clearInterval(checkPayment), 300000);
        } else {
          // If popup blocked, redirect in same window
          window.location.href = response.payment.paymentUrl;
        }
      } else {
        setError(response.message || 'Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Gateway payment error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const amount = parseFloat(formData.amount);
    const minAmount = 9.69; // NOWPayments exact minimum for testing
    if (!amount || amount < minAmount) {
      setError(`Minimum investment is ${minAmount} USDT (NOWPayments minimum for testing)`);
      setLoading(false);
      return;
    }

    // Handle different payment methods
    if (paymentMethod === 'gateway') {
      await handleGatewayPayment(e);
      setLoading(false);
      return;
    }

    // For TRC20, transaction hash is required
    if (paymentMethod === 'trc20') {
      if (!formData.transactionHash || formData.transactionHash.trim() === '') {
        setError('Transaction hash is required');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/api/investment/add', {
          amount: amount,
          transactionHash: formData.transactionHash.trim(),
        });

        setSuccess('Investment request submitted! It will be pending until admin verifies your TRC20 payment.');
        setFormData({ amount: '', transactionHash: '', currency: 'USDT' });
        fetchInvestments(); // Refresh list
      } catch (error) {
        console.error('Investment error:', error);
        setError(error.message || 'Failed to submit investment. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const totalInvested = investments
    .filter(inv => inv.status === 'confirmed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingInvestments = investments.filter(inv => inv.status === 'pending');
  const confirmedInvestments = investments.filter(inv => inv.status === 'confirmed');

  const handleConfirmPending = async (investmentId) => {
    try {
      setLoading(true);
      await api.put(`/api/investment/confirm/${investmentId}`);
      setSuccess('Investment confirmed successfully!');
      fetchInvestments(); // Refresh list
    } catch (error) {
      console.error('Confirm investment error:', error);
      setError(error.message || 'Failed to confirm investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.investmentPage}>
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-wallet2 me-2"></i>
          Investment
        </h1>
        <p className="text-muted">Add new investments and view your investment history</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="text-muted small mb-1">Total Invested</p>
              <h3 className="mb-0">${totalInvested.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="text-muted small mb-1">Confirmed</p>
              <h3 className="mb-0">{confirmedInvestments.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <p className="text-muted small mb-1">Pending</p>
              <h3 className="mb-0">{pendingInvestments.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Add Investment Form */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Add New Investment
              </h5>
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

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Payment Method</label>
                <div className="btn-group w-100" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="methodGateway"
                    value="gateway"
                    checked={paymentMethod === 'gateway'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="methodGateway">
                    <i className="bi bi-credit-card me-2"></i>
                    Payment Gateway
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="paymentMethod"
                    id="methodTRC20"
                    value="trc20"
                    checked={paymentMethod === 'trc20'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="methodTRC20">
                    <i className="bi bi-wallet2 me-2"></i>
                    TRC20 Transfer
                  </label>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Investment Amount (USDT)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">USDT</span>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      placeholder="9.69"
                      min="9.69"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Minimum investment: 9.69 USDT (NOWPayments exact minimum for testing)
                  </small>
                </div>

                {paymentMethod === 'trc20' && (
                  <>
                    <div className="alert alert-info mb-3" role="alert">
                      <h6 className="alert-heading">
                        <i className="bi bi-info-circle me-2"></i>
                        Send USDT (TRC20) to:
                      </h6>
                      <p className="mb-2">
                        <code className="font-monospace" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                          {process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || 'TYourWalletAddressHere'}
                        </code>
                      </p>
                      <small>
                        <strong>Network:</strong> TRC20 (TRON)<br />
                        <strong>Token:</strong> USDT (Tether)
                      </small>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="transactionHash" className="form-label">
                        Transaction Hash (TRC20)
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        id="transactionHash"
                        name="transactionHash"
                        placeholder="Enter TRC20 transaction hash"
                        value={formData.transactionHash}
                        onChange={handleChange}
                        required
                      />
                      <small className="text-muted">
                        Enter the TRC20 transaction hash from your USDT transfer. Your investment will be pending until admin verifies the payment.
                      </small>
                    </div>
                  </>
                )}

                {paymentMethod === 'gateway' && (
                  <div className="alert alert-info mb-3" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Payment Gateway:</strong> You'll be redirected to a secure payment page where you can pay using USDT (TRC20), card, bank transfer, or other cryptocurrency. Your investment will be added automatically after payment confirmation.
                    <br />
                    <small className="d-block mt-2">
                      <i className="bi bi-shield-check me-1"></i>
                      Secure payment processing. Your investment will be added automatically after payment confirmation.
                    </small>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || processingPayment}
                >
                  {loading || processingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {paymentMethod === 'gateway' ? 'Processing...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${paymentMethod === 'gateway' ? 'bi-credit-card' : 'bi-check-circle'} me-2`}></i>
                      {paymentMethod === 'gateway' ? 'Pay with Gateway' : 'Submit Investment'}
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>

        {/* Investment History */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Investment History
              </h5>
            </div>
            <div className="card-body">
              {fetchLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : investments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Hash</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv._id || inv.id}>
                          <td>
                            <strong>${inv.amount.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${inv.type === 'referral' ? 'bg-success' : 'bg-primary'}`}>
                              {inv.type === 'referral' ? 'Referral' : 'New'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              inv.status === 'confirmed' ? 'bg-success' :
                              inv.status === 'pending' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td>{new Date(inv.createdAt).toLocaleString()}</td>
                          <td>
                            <small className="text-muted font-monospace">
                              {inv.transactionHash ? `${inv.transactionHash.substring(0, 10)}...` : 'N/A'}
                            </small>
                          </td>
                          <td>
                            {inv.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleConfirmPending(inv._id || inv.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-wallet2" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">No investments yet</p>
                  <p className="text-muted small">Start investing to see your history here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}export default withAuth(InvestmentPage);