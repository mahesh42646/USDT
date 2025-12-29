'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DashboardPage() {
  const { userData, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userData) {
      fetchDashboardData();
    }
  }, [authLoading, userData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (dashboardData?.referralLink) {
      navigator.clipboard.writeText(dashboardData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || loading) {
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, investments, referrals, withdrawals, referralLink, charts } = dashboardData;

  // Prepare chart data
  // Investment Type Pie Chart
  const investmentTypeData = {
    labels: ['New Investment', 'Referral Income'],
    datasets: [{
      data: [
        investments?.filter(inv => inv.type === 'new').reduce((sum, inv) => sum + inv.amount, 0) || 0,
        investments?.filter(inv => inv.type === 'referral').reduce((sum, inv) => sum + inv.amount, 0) || 0,
      ],
      backgroundColor: ['#6B46C1', '#10B981'],
      borderColor: ['#5B21B6', '#059669'],
      borderWidth: 2,
    }],
  };

  // Referral Status Pie Chart
  const referralStatusData = {
    labels: ['Active', 'Pending', 'Inactive'],
    datasets: [{
      data: [
        referrals?.filter(ref => ref.status === 'active').length || 0,
        referrals?.filter(ref => ref.status === 'pending').length || 0,
        referrals?.filter(ref => ref.status === 'inactive').length || 0,
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#6B7280'],
      borderColor: ['#059669', '#D97706', '#4B5563'],
      borderWidth: 2,
    }],
  };

  // Investment History Line Chart
  const investmentHistoryLabels = charts?.investmentHistory && charts.investmentHistory.length > 0
    ? charts.investmentHistory.map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })
    : Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

  const investmentHistoryData = {
    labels: investmentHistoryLabels,
    datasets: [{
      label: 'Investment Amount (USDT)',
      data: charts?.investmentHistory && charts.investmentHistory.length > 0
        ? charts.investmentHistory.map(item => item.total)
        : Array(30).fill(0),
      borderColor: '#6B46C1',
      backgroundColor: 'rgba(107, 70, 193, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  // Interest History Line Chart
  const interestHistoryLabels = charts?.interestHistory && charts.interestHistory.length > 0
    ? charts.interestHistory.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })
    : Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

  const interestHistoryData = {
    labels: interestHistoryLabels,
    datasets: [{
      label: 'Daily Interest (USDT)',
      data: charts?.interestHistory && charts.interestHistory.length > 0
        ? charts.interestHistory.map(item => item.amount)
        : Array(30).fill(0),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  // Monthly Stats Bar Chart
  const monthlyStatsData = {
    labels: ['Investment', 'Interest', 'Referral Income'],
    datasets: [{
      label: 'Amount (USDT)',
      data: [
        stats.totalInvestment || 0,
        stats.interestBalance || 0,
        stats.referralIncome || 0,
      ],
      backgroundColor: ['#6B46C1', '#10B981', '#F59E0B'],
      borderColor: ['#5B21B6', '#059669', '#D97706'],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        displayColors: true,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="">
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="mb-2">Welcome back, {dashboardData.user.fullName || dashboardData.user.mobile}!</h1>
        <p className="text-muted">Here's your investment overview</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Investment</p>
                  <h3 className="mb-0">${stats.totalInvestment.toFixed(2)}</h3>
                </div>
                <div className={styles.statIcon}>
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Interest Balance</p>
                  <h3 className="mb-0">${stats.interestBalance.toFixed(2)}</h3>
                </div>
                <div className={styles.statIcon}>
                  <i className="bi bi-graph-up"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Daily Interest</p>
                  <h3 className="mb-0">${stats.dailyInterest.toFixed(2)}</h3>
                  <small className="text-muted">{stats.dailyInterestPercentage.toFixed(2)}%</small>
                </div>
                <div className={styles.statIcon}>
                  <i className="bi bi-calendar-day"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">PlatoCoins</p>
                  <h3 className="mb-0 text-info">
                    <i className="bi bi-coin me-1"></i>
                    {(dashboardData.user.platoCoins || 0).toFixed(2)}
                  </h3>
                  <small className="text-muted">1:1 with investments</small>
                </div>
                <div className={styles.statIcon}>
                  <i className="bi bi-coin"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Referrals</p>
                  <h3 className="mb-0">{stats.directReferrals}</h3>
                  <small className="text-muted">{stats.directActiveReferrals} active</small>
                </div>
                <div className={styles.statIcon}>
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="bi bi-share me-2"></i>
            Your Referral Link
          </h5>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={referralLink}
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
          <p className="text-muted small mt-2 mb-0">
            <i className="bi bi-info-circle me-1"></i>
            Share this link to earn referral income. Referral income is only credited when you have minimum 500 USDT investment.
          </p>
        </div>
      </div>

      {/* Withdrawal Lock Warning */}
      {stats.withdrawalLocked && (
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-lock me-2"></i>
          <strong>Withdrawal Locked:</strong> You need to invest minimum 500 USDT to unlock withdrawals and referral benefits.
        </div>
      )}

      {/* Special Plan Notice */}
      {stats.isSpecialPlan && (
        <div className="alert alert-info mb-4" role="alert">
          <i className="bi bi-star me-2"></i>
          <strong>Special Investor Plan:</strong> You're on the 1% fixed daily interest plan (10,000+ USDT).
        </div>
      )}

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Investment Type Pie Chart */}
        <div className="col-lg-4 col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Investment Breakdown
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={investmentTypeData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Referral Status Pie Chart */}
        <div className="col-lg-4 col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart-fill me-2"></i>
                Referral Status
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={referralStatusData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats Bar Chart */}
        <div className="col-lg-4 col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Monthly Overview
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar data={monthlyStatsData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Charts Section */}
      <div className="row g-4 mb-4">
        {/* Investment History Line Chart */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Investment History (Last 30 Days)
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Line data={investmentHistoryData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Interest History Line Chart */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up-arrow me-2"></i>
                Daily Interest History (Last 30 Days)
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Line data={interestHistoryData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-4">
        {/* Recent Investments */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Recent Investments
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => router.push('/user/investment')}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {investments && investments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.slice(0, 5).map((inv) => (
                        <tr key={inv._id}>
                          <td>${inv.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${inv.type === 'referral' ? 'bg-success' : 'bg-primary'}`}>
                              {inv.type}
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
                          <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No investments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Recent Referrals
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => router.push('/user/referrals')}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {referrals && referrals.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Status</th>
                        <th>Income</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.slice(0, 5).map((ref) => (
                        <tr key={ref.id}>
                          <td>{ref.referredUser?.fullName || ref.referredUser?.mobile || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              ref.status === 'active' ? 'bg-success' :
                              ref.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                          <td>${(ref.totalIncome || 0).toFixed(2)}</td>
                          <td>{new Date(ref.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No referrals yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
