'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function ReferralsPage() {
  const { userData } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const referralsRes = await api.get('/api/referral/network');
      setReferrals(referralsRes.data || []);
      
      // Get stats from dashboard or userData
      try {
        const statsRes = await api.get('/api/referral/stats');
        setReferralStats(statsRes.data || {});
      } catch (statsError) {
        // If stats endpoint fails, use userData
        setReferralStats({
          totalInvestment: userData?.totalInvestment || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setError('Failed to load referral data');
      // Set default stats
      setReferralStats({
        totalInvestment: userData?.totalInvestment || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (userData?.referralCode) {
      const link = `${window.location.origin}/auth/login?ref=${userData.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getReferralPercentage = (count) => {
    if (count >= 151) return 3.0;
    if (count >= 121) return 2.0;
    if (count >= 91) return 1.5;
    if (count >= 50) return 1.0;
    if (count >= 10) return 0.5;
    return 0;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const activeReferrals = referrals.filter(ref => ref.status === 'active');
  const pendingReferrals = referrals.filter(ref => ref.status === 'pending');
  const totalReferralIncome = referrals.reduce((sum, ref) => sum + (ref.totalIncome || 0), 0);

  return (
    <div className={styles.referralsPage}>
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-people me-2"></i>
          Referrals
        </h1>
        <p className="text-muted">Manage your referral network and track your referral income</p>
      </div>

      {/* Referral Link Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="bi bi-share me-2"></i>
            Your Referral Link
          </h5>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              value={userData?.referralCode ? `${window.location.origin}/auth/login?ref=${userData.referralCode}` : ''}
              readOnly
            />
            <button
              className="btn btn-primary"
              onClick={copyReferralLink}
            >
              {copied ? (
                <>
                  <i className="bi bi-check me-2"></i>Copied!
                </>
              ) : (
                <>
                  <i className="bi bi-clipboard me-2"></i>Copy
                </>
              )}
            </button>
          </div>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1"><strong>Your Referral Code:</strong></p>
              <p className="h4 text-primary font-monospace">{userData?.referralCode || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Current Referral Rate:</strong></p>
              <p className="h4 text-success">{getReferralPercentage(referrals.length)}%</p>
              <small className="text-muted">
                Based on {referrals.length} direct referrals
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Total Referrals</p>
              <h3 className="mb-0">{referrals.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Active Referrals</p>
              <h3 className="mb-0 text-success">{activeReferrals.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Pending Referrals</p>
              <h3 className="mb-0 text-warning">{pendingReferrals.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-muted small mb-1">Total Income</p>
              <h3 className="mb-0 text-primary">${totalReferralIncome.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Income Info */}
      {referralStats && referralStats.totalInvestment < 500 && (
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Referral Income Locked:</strong> You need to invest minimum 500 USDT to start earning referral income.
          Your referrals are being tracked and will be activated once you reach the threshold.
        </div>
      )}

      {/* Referral Percentage Slabs */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Referral Income Slabs
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Direct Referrals</th>
                  <th>Income Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className={referrals.length >= 10 && referrals.length < 50 ? 'table-primary' : ''}>
                  <td>10 - 49</td>
                  <td>0.5%</td>
                  <td>
                    {referrals.length >= 10 && referrals.length < 50 ? (
                      <span className="badge bg-success">Active</span>
                    ) : referrals.length >= 50 ? (
                      <span className="badge bg-secondary">Completed</span>
                    ) : (
                      <span className="badge bg-secondary">Not Reached</span>
                    )}
                  </td>
                </tr>
                <tr className={referrals.length >= 50 && referrals.length < 90 ? 'table-primary' : ''}>
                  <td>50 - 90</td>
                  <td>1.0%</td>
                  <td>
                    {referrals.length >= 50 && referrals.length < 90 ? (
                      <span className="badge bg-success">Active</span>
                    ) : referrals.length >= 90 ? (
                      <span className="badge bg-secondary">Completed</span>
                    ) : (
                      <span className="badge bg-secondary">Not Reached</span>
                    )}
                  </td>
                </tr>
                <tr className={referrals.length >= 91 && referrals.length < 120 ? 'table-primary' : ''}>
                  <td>91 - 120</td>
                  <td>1.5%</td>
                  <td>
                    {referrals.length >= 91 && referrals.length < 120 ? (
                      <span className="badge bg-success">Active</span>
                    ) : referrals.length >= 120 ? (
                      <span className="badge bg-secondary">Completed</span>
                    ) : (
                      <span className="badge bg-secondary">Not Reached</span>
                    )}
                  </td>
                </tr>
                <tr className={referrals.length >= 121 && referrals.length < 150 ? 'table-primary' : ''}>
                  <td>121 - 150</td>
                  <td>2.0%</td>
                  <td>
                    {referrals.length >= 121 && referrals.length < 150 ? (
                      <span className="badge bg-success">Active</span>
                    ) : referrals.length >= 150 ? (
                      <span className="badge bg-secondary">Completed</span>
                    ) : (
                      <span className="badge bg-secondary">Not Reached</span>
                    )}
                  </td>
                </tr>
                <tr className={referrals.length >= 151 ? 'table-primary' : ''}>
                  <td>151+</td>
                  <td>3.0% (Maximum)</td>
                  <td>
                    {referrals.length >= 151 ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Not Reached</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Referral Network */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-people-fill me-2"></i>
            Your Referral Network
          </h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {referrals.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Investment</th>
                    <th>Income Earned</th>
                    <th>Joined Date</th>
                    <th>Activated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id || ref._id}>
                      <td>
                        <strong>{ref.referredUser?.fullName || 'N/A'}</strong>
                      </td>
                      <td>{ref.referredUser?.mobile || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          ref.status === 'active' ? 'bg-success' :
                          ref.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td>${(ref.referredUser?.totalInvestment || 0).toFixed(2)}</td>
                      <td>
                        <strong className="text-success">${(ref.totalIncome || 0).toFixed(2)}</strong>
                      </td>
                      <td>{new Date(ref.createdAt).toLocaleDateString()}</td>
                      <td>
                        {ref.activatedAt ? new Date(ref.activatedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-people" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="text-muted mt-3">No referrals yet</p>
              <p className="text-muted small">Share your referral link to start building your network</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ReferralsPage);
