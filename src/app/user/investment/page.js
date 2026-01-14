'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function InvestmentPage() {
  const { userData } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('trc20'); // 'trc20' only now
  const [formData, setFormData] = useState({
    usdAmount: '', // Amount in USD
    paymentCurrency: 'USDT', // Default to USDT (HD wallet only supports USDT)
  });
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentData, setPaymentData] = useState(null); // QR code and payment info
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(null); // Timer in seconds
  const [wrongAmountInfo, setWrongAmountInfo] = useState(null); // Wrong amount payment info
  const [conversionRate, setConversionRate] = useState(null); // Conversion rate
  const [convertedAmount, setConvertedAmount] = useState(null); // Converted amount
  const [loadingRate, setLoadingRate] = useState(false); // Loading conversion rate

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

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // If USD amount or payment currency changed, fetch conversion rate
    if (name === 'usdAmount' || name === 'paymentCurrency') {
      const usdVal = name === 'usdAmount' ? value : formData.usdAmount;
      const currency = name === 'paymentCurrency' ? value : formData.paymentCurrency;
      fetchConversionRate(usdVal, currency);
    }
  };

  // Fetch conversion rate from USD to payment currency
  const fetchConversionRate = async (usdAmount, currency) => {
    if (!usdAmount || !currency || parseFloat(usdAmount) < 1) {
      setConversionRate(null);
      setConvertedAmount(null);
      return;
    }

    setLoadingRate(true);
    try {
      const response = await api.post('/api/payment/convert', {
        usdAmount: parseFloat(usdAmount),
        currency: currency,
      });

      if (response.success) {
        setConversionRate(response.rate);
        setConvertedAmount(response.amount);
      }
    } catch (error) {
      console.error('Conversion rate error:', error);
      setConversionRate(null);
      setConvertedAmount(null);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleTRC20Payment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessingPayment(true);
    setPaymentData(null);

    const usdAmount = parseFloat(formData.usdAmount);
    const minUSD = 1; // Minimum $1 USD
    if (!usdAmount || usdAmount < minUSD) {
      setError(`Minimum investment is $${minUSD} USD`);
      setProcessingPayment(false);
      return;
    }

    try {
      // Use HD wallet payment system
      const response = await api.post('/api/payment/hd/initiate', {
        usdAmount: usdAmount,
        currency: formData.paymentCurrency || 'USDT',
        convertedAmount: convertedAmount, // Pass the converted amount for QR code
      });

      if (response.success && response.payment) {
        const paymentInfo = {
          orderId: response.payment.orderId,
          qrCode: response.payment.qrCode,
          paymentAddress: response.payment.derivedAddress || response.payment.paymentAddress,
          usdAmount: response.payment.usdAmount,
          amount: response.payment.amount, // USDT amount
          currency: response.payment.currency || 'USDT',
          conversionRate: response.payment.conversionRate,
          expiresAt: response.payment.expiresAt,
        };
        setPaymentData(paymentInfo);

        // Open modal with 15 minute timer
        setPaymentTimer(900); // 15 minutes = 900 seconds
        setShowPaymentModal(true);
        setWrongAmountInfo(null);

        // Start countdown timer
        const timerInterval = setInterval(() => {
          setPaymentTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerInterval);
              handleClosePaymentModal();
              setError('Payment window expired. Please generate a new QR code.');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setFormData(prev => ({ ...prev, usdAmount: '' }));

        // Start polling for payment status
        startPaymentPolling(response.payment.orderId);
      } else {
        setError(response.message || 'Failed to generate payment QR code. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Close payment modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentTimer(null);
    setPaymentData(null);
    setWrongAmountInfo(null);
    setCheckingPayment(false);
  };

  // Format timer (MM:SS)
  const formatTimer = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle user-submitted transaction hash
  const handleSubmitTransactionHash = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.transactionHash || formData.transactionHash.trim().length === 0) {
      setError('Please enter your transaction hash');
      return;
    }

    if (!paymentData || !paymentData.orderId) {
      setError('Payment session not found. Please generate a new QR code.');
      return;
    }

    setSubmittingHash(true);

    try {
      const response = await api.post('/api/payment/trc20/verify', {
        orderId: paymentData.orderId,
        transactionHash: formData.transactionHash.trim(),
      });

      if (response.success) {
        const actualUSD = response.payment.usdAmount || paymentData.usdAmount;
        setSuccess(`✅ Payment verified successfully! $${actualUSD.toFixed(2)} USD investment has been added to your account.`);
        setFormData({ usdAmount: '', paymentCurrency: formData.paymentCurrency, transactionHash: '' });
        handleClosePaymentModal();
        fetchInvestments(); // Refresh investment list
      } else {
        setError(response.message || 'Transaction verification failed. Please check your transaction hash and try again.');
      }
    } catch (error) {
      console.error('Transaction verification error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to verify transaction. Please check your transaction hash and try again.');
    } finally {
      setSubmittingHash(false);
    }
  };

  // Poll for payment confirmation (HD wallet system - auto-detection)
  const startPaymentPolling = (orderId) => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 180; // Check for 15 minutes (180 * 5 seconds = 15 min)

    // Check immediately first time
    const checkPayment = async () => {
      attempts++;
      try {
        const statusResponse = await api.get(`/api/payment/hd/status/${orderId}`);
        if (statusResponse.success) {
          if (statusResponse.payment.status === 'paid') {
            clearInterval(pollInterval);
            setCheckingPayment(false);

            const actualUSDInvestment = statusResponse.payment.usdAmount || paymentData?.usdAmount || 0;
            const amountReceived = statusResponse.payment.amountReceived || 0;

            setSuccess(`✅ Payment detected! $${actualUSDInvestment.toFixed(2)} USD investment has been added to your account.`);

            // Close modal after 3 seconds
            setTimeout(() => {
              handleClosePaymentModal();
            }, 3000);

            fetchInvestments(); // Refresh investment list
            return true;
          } else if (statusResponse.payment.status === 'failed') {
            clearInterval(pollInterval);
            setCheckingPayment(false);
            setError('Payment failed. Please try again.');
            handleClosePaymentModal();
            return true;
          }
        }
      } catch (err) {
        console.error('Payment status check error:', err);
        // Don't stop polling on network errors, just log
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setCheckingPayment(false);
        setError('Payment timeout. If you have sent the payment, please refresh the page to check status.');
        return true;
      }
      return false;
    };

    // Check immediately
    checkPayment();

    // Then check every 5 seconds for faster detection
    const pollInterval = setInterval(() => {
      checkPayment();
    }, 5000); // Check every 5 seconds for faster response
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const usdAmount = parseFloat(formData.usdAmount);
    const minUSD = 1; // Minimum $1 USD
    if (!usdAmount || usdAmount < minUSD) {
      setError(`Minimum investment is $${minUSD} USD`);
      setLoading(false);
      return;
    }

    // Handle TRC20 payment with QR code
    if (paymentMethod === 'trc20') {
      await handleTRC20Payment(e);
      setLoading(false);
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

              {/* Payment Method - TRC20 Only */}
              <div className="mb-4">
                <label className="form-label fw-bold">Payment Method</label>
                <div className="alert alert-info mb-0" role="alert">
                  <i className="bi bi-wallet2 me-2"></i>
                  <strong>TRC20 USDT Payment</strong> - Scan QR code or copy address to pay
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Investment Amount in USD */}
                <div className="mb-3 border p-2 rounded bg-primary text-white">
                  <label htmlFor="usdAmount" className="form-label fw-bold">
                    Investment Amount (USD)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="usdAmount"
                      name="usdAmount"
                      value={formData.usdAmount}
                      onChange={handleChange}
                      min={1}
                      step="0.01"
                      required
                      placeholder="Enter amount in USD"
                    />
                  </div>
                  <small className="text-muted">
                    Minimum investment: $1 USD
                  </small>
                </div>

                {/* Conversion Rate Display */}
                {conversionRate && convertedAmount && formData.usdAmount && (
                  <div className="mb-3">
                    <div className="alert alert-success">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Conversion Rate:</strong>
                          <br />
                          <small>1 USD = {conversionRate.toFixed(8)} {formData.paymentCurrency}</small>
                        </div>
                        <div className="text-end">
                          <strong>You will pay:</strong>
                          <br />
                          <span className="fs-5">{convertedAmount.toFixed(6)} {formData.paymentCurrency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loadingRate && formData.usdAmount && (
                  <div className="mb-3">
                    <div className="alert alert-info">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Calculating conversion rate...
                    </div>
                  </div>
                )}

                {/* Payment Currency - USDT Only */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Payment Currency</label>
                  <div className="alert alert-info mb-0">
                    <i className="bi bi-currency-dollar me-2"></i>
                    <strong>USDT (TRC20)</strong> - Only USDT payments are accepted
                  </div>
                </div>


                {/* Payment Modal will be shown separately */}

                {!paymentData && (
                  <div className="" role="alert">

                  </div>
                )}

                {!paymentData ? (
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading || processingPayment}
                  >
                    {loading || processingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-qr-code me-2"></i>
                        Generate Payment QR Code
                      </>
                    )}
                  </button>
                ) : (
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-success w-100"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.paymentAddress);
                        setSuccess('Payment address copied to clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard me-2"></i>
                      Copy Payment Address
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setPaymentData(null);
                        setError('');
                        setSuccess('');
                        setCheckingPayment(false);
                      }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel Payment
                    </button>
                  </div>
                )}
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
                            <span className={`badge ${inv.status === 'confirmed' ? 'bg-success' :
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

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header px-3 py-2 border-bottom  text-white">
                <div className={`text-center d-flex p-2 w-100 rounded ${paymentTimer < 60 ? 'bg-danger text-white' : 'bg-primary'}`}>
                  <i className="bi bi-qr-code me-2"></i>
                  <span className="d-block fw-bold text-white fs-4" >Payment Window :  {formatTimer(paymentTimer)}</span>
                  <button
                    type="button"
                    className="btn  border text-white ms-auto"
                    onClick={handleClosePaymentModal}
                    aria-label="Close"
                  > Cancel
                  </button>
                </div>

              </div>
              <div className="modal-body ">
                <div className="row g-2">
                
                  {/* Payment Details */}
                  <div className="col-12">
                    <div className="text-center ">
                      <div className="text-muted ">Investment Amount</div>
                      <div className="fw-bold fs-5">${paymentData.usdAmount} USD</div>
                      {convertedAmount && conversionRate && (
                        <div className="text-muted  ">
                          Send: <strong>{convertedAmount.toFixed(6)} {formData.paymentCurrency || 'USDT'}</strong> {formData.paymentCurrency === 'TRX' ? '' : '(TRC20)'}

                          <div>Rate: 1 USD = {conversionRate.toFixed(8)} {formData.paymentCurrency || 'USDT'}</div>
                        </div>
                      )}
                      {!convertedAmount && (
                        <div className="text-muted small ">
                          Send: <strong>{paymentData.usdAmount} {formData.paymentCurrency || 'USDT'}</strong> {formData.paymentCurrency === 'TRX' ? '' : '(TRC20)'}
                        </div>
                      )}

                    </div>
                  </div>



                  {/* QR Code */}
                  <div className="col-12 text-center">
                    <div className="mb-2">
                      <p className="text-muted">Scan QR Code (or copy address manually)</p>
                    </div>
                    <img
                      src={paymentData.qrCode}
                      alt="QR Code"
                      className="img-fluid"
                      style={{
                        maxWidth: '240px',
                        border: '2px solid #dee2e6',
                        borderRadius: '6px',
                        padding: '6px',
                        backgroundColor: '#fff'
                      }}
                    />

                  </div>

                  {/* Recipient Address */}
                  <div className="col-12">
                    <label className="form-label mb-1  fw-bold">Payment Address (Copy this):</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control "
                        value={paymentData.paymentAddress}
                        readOnly

                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.paymentAddress);
                          setSuccess('Address copied! Paste it in your wallet Send screen.');
                        }}
                        title="Copy Address"
                        style={{ fontSize: '1rem', padding: '0.25rem 0.5rem' }}
                      >
                        <i className="bi bi-clipboard me-1"></i>Copy
                      </button>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {checkingPayment && (
                    <div className="col-12">
                      <div className="alert alert-info d-flex align-items-center mb-0">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <div>
                          <strong>Waiting for payment...</strong>
                          <br />

                        </div>

                      </div>
                      <p className="text-muted text-center pt-2">Payment will be detected automatically once you send USDT to the address above.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(InvestmentPage);