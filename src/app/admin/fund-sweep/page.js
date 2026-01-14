'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/utils/adminApi';
// import styles from './page.module.css';

export default function FundSweepPage() {
  const router = useRouter();
  const [unsweptBalances, setUnsweptBalances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sweepStatus, setSweepStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUnsweptBalances();
    fetchSweepStatus();
  }, []);

  const fetchUnsweptBalances = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/api/admin/fund-sweep/unswept');
      if (response.success) {
        setUnsweptBalances(response.data.addresses || []);
        setSummary(response.data.summary || {});
      } else {
        setError(response.message || 'Failed to fetch unswept balances');
      }
    } catch (error) {
      console.error('Fetch unswept balances error:', error);
      setError(error.response?.data?.message || 'Failed to fetch unswept balances');
    } finally {
      setLoading(false);
    }
  };

  const fetchSweepStatus = async () => {
    try {
      const response = await adminApi.get('/api/admin/fund-sweep/status');
      if (response.success) {
        setSweepStatus(response.data);
      }
    } catch (error) {
      console.error('Fetch sweep status error:', error);
    }
  };

  const handleTriggerSweep = async (address = null) => {
    try {
      setSweeping(true);
      setError('');
      setSuccess('');

      const response = await adminApi.post('/api/admin/fund-sweep/trigger', { address });

      if (response.success) {
        setSuccess(address 
          ? `Funds swept from ${address} successfully!`
          : 'Fund sweep triggered successfully!'
        );
        // Refresh balances after a short delay
        setTimeout(() => {
          fetchUnsweptBalances();
        }, 3000);
      } else {
        setError(response.message || 'Failed to trigger sweep');
      }
    } catch (error) {
      console.error('Trigger sweep error:', error);
      setError(error.response?.data?.message || 'Failed to trigger sweep');
    } finally {
      setSweeping(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-wallet2 me-2"></i>
          Fund Sweep Management
        </h2>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={fetchUnsweptBalances}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleTriggerSweep()}
            disabled={sweeping || loading}
          >
            {sweeping ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Sweeping...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right-circle me-1"></i>
                Sweep All Funds
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {/* Summary Card */}
      {summary && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Unswept Addresses</h6>
                <h3 className="mb-0">{summary.totalAddresses || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Unswept USDT</h6>
                <h3 className="mb-0">{summary.totalUnsweptUSDT || '0.000000'} USDT</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Admin Wallet</h6>
                <small className="text-muted d-block" style={{ wordBreak: 'break-all' }}>
                  {summary.adminWallet || 'N/A'}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sweep Status */}
      {sweepStatus && (
        <div className="alert alert-info mb-4">
          <strong>Sweep Service Status:</strong> {sweepStatus.isRunning ? 'Running' : 'Stopped'} 
          {' | '}
          <strong>Interval:</strong> Every {sweepStatus.sweepIntervalMinutes || 5} minutes
        </div>
      )}

      {/* Unswept Addresses Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Unswept Addresses</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : unsweptBalances.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-check-circle fs-1 d-block mb-2"></i>
              <p>No unswept balances found. All funds have been swept to admin wallet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>User</th>
                    <th>USD Amount</th>
                    <th>USDT Balance</th>
                    <th>TRX Balance</th>
                    <th>Paid At</th>
                    <th>Transaction Hash</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unsweptBalances.map((addr, index) => (
                    <tr key={index}>
                      <td>
                        <code style={{ fontSize: '0.85rem' }}>{addr.address}</code>
                        <br />
                        <small className="text-muted">Index: {addr.derivationIndex}</small>
                      </td>
                      <td>
                        {addr.userName || 'N/A'}
                        <br />
                        <small className="text-muted">{addr.userMobile}</small>
                      </td>
                      <td>${addr.usdAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <strong className="text-success">
                          {addr.usdtBalance?.toFixed(6) || '0.000000'} USDT
                        </strong>
                      </td>
                      <td>{addr.trxBalance?.toFixed(6) || '0.000000'} TRX</td>
                      <td>{formatDate(addr.paidAt)}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem' }}>
                          {addr.transactionHash?.substring(0, 20)}...
                        </code>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleTriggerSweep(addr.address)}
                          disabled={sweeping || addr.usdtBalance === 0}
                          title="Sweep this address"
                        >
                          <i className="bi bi-arrow-right-circle me-1"></i>
                          Sweep
                        </button>
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
