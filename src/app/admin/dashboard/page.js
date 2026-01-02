'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi } from '@/utils/adminApi';
import { withAdminAuth } from '@/middleware/admin';
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

function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalInvestment: 0,
    totalInterestGenerated: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalsCount: 0,
    totalReferralsCount: 0,
    newUsersLast30Days: 0,
    investmentLast30Days: 0
  });
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminApi.get('/api/admin/dashboard');
        
        if (response.success && response.data) {
          setStats(response.data.stats || {});
          setCharts(response.data.charts || null);
        } else {
          throw new Error(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
        if (err.status === 401 || err.status === 403) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, router]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'bi-people-fill',
      color: 'primary',
      suffix: '',
      link: '/admin/users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: 'bi-person-check-fill',
      color: 'success',
      suffix: '',
      link: '/admin/users',
    },
    {
      title: 'Total Investment',
      value: stats.totalInvestment,
      icon: 'bi-wallet2',
      color: 'info',
      suffix: ' USDT',
      link: '/admin/investments',
    },
    {
      title: 'Total Interest Generated',
      value: stats.totalInterestGenerated,
      icon: 'bi-graph-up-arrow',
      color: 'warning',
      suffix: ' USDT',
      link: '/admin/investments',
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: 'bi-clock-history',
      color: 'danger',
      suffix: ' USDT',
      link: '/admin/withdrawals',
    },
    {
      title: 'Total Referrals',
      value: stats.totalReferralsCount,
      icon: 'bi-diagram-3-fill',
      color: 'primary',
      suffix: '',
      link: '/admin/referrals/direct',
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  // Chart data preparation
  const userStatusData = charts ? {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [{
      data: [charts.userStatus?.active || 0, charts.userStatus?.inactive || 0],
      backgroundColor: ['#28a745', '#dc3545'],
      borderColor: ['#28a745', '#dc3545'],
      borderWidth: 2,
    }],
  } : null;

  const withdrawalStatusData = charts ? {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [
        charts.withdrawalStatus?.pending || 0,
        charts.withdrawalStatus?.approved || 0,
        charts.withdrawalStatus?.rejected || 0,
      ],
      backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
      borderColor: ['#ffc107', '#28a745', '#dc3545'],
      borderWidth: 2,
    }],
  } : null;

  const investmentStatusData = charts ? {
    labels: ['Confirmed', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        charts.investmentStatus?.confirmed || 0,
        charts.investmentStatus?.pending || 0,
        charts.investmentStatus?.rejected || 0,
      ],
      backgroundColor: ['#17a2b8', '#ffc107', '#dc3545'],
      borderColor: ['#17a2b8', '#ffc107', '#dc3545'],
      borderWidth: 2,
    }],
  } : null;

  const dailyTrendsData = charts?.dailyTrends ? {
    labels: charts.dailyTrends.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'New Users',
        data: charts.dailyTrends.map(d => d.users),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Investments (USDT)',
        data: charts.dailyTrends.map(d => d.investments),
        borderColor: '#17a2b8',
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Withdrawals (USDT)',
        data: charts.dailyTrends.map(d => d.withdrawals),
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const monthlyInvestmentData = charts?.monthlyInvestment ? {
    labels: charts.monthlyInvestment.map(d => d.month),
    datasets: [{
      label: 'Monthly Investment (USDT)',
      data: charts.monthlyInvestment.map(d => d.total),
      backgroundColor: 'rgba(23, 162, 184, 0.8)',
      borderColor: '#17a2b8',
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
          },
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
        position: 'left',
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatNumber(value) + ' USDT';
          },
        },
        grid: {
          drawOnChartArea: false,
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
            return formatNumber(value) + ' USDT';
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
    <div className={styles.dashboardContainer}>
      <div className="container-fluid py-4">
        {/* Header Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className={`h3 fw-bold mb-2 ${styles.pageTitle}`}>Dashboard Overview</h1>
              <p className="text-muted mb-0">Welcome back! Here's what's happening with your platform today.</p>
            </div>
            <div className={styles.headerActions}>
              <button className="btn btn-outline-primary">
                <i className="bi bi-download me-2"></i>Export Report
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              {statCards.map((card, index) => (
                <div key={index} className="col-md-6 col-xl-4">
                  <Link href={card.link} className={styles.cardLink}>
                    <div className={`card h-100 border-0 ${styles.statCard} ${styles[`statCard${card.color}`]}`}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className={`${styles.statIcon} ${styles[`statIcon${card.color}`]}`}>
                            <i className={`bi ${card.icon}`}></i>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${styles.statBadge} bg-${card.color} bg-opacity-10 text-${card.color}`}>
                              {card.title}
                            </span>
                          </div>
                        </div>
                        <div className={styles.statValueContainer}>
                          <h2 className={`${styles.statValue} mb-0`}>
                            {formatNumber(card.value)}
                            {card.suffix && <span className={styles.statSuffix}>{card.suffix}</span>}
                          </h2>
                        </div>
                        <div className="mt-3">
                          <small className="text-muted">
                            View details <i className="bi bi-arrow-right ms-1"></i>
                          </small>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            {charts && (
              <div className="row g-4 mb-4">
                {/* User Status Pie Chart */}
                <div className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="fw-bold mb-0">User Status Distribution</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        {userStatusData && <Pie data={userStatusData} options={chartOptions} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Status Pie Chart */}
                <div className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="fw-bold mb-0">Withdrawal Status</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        {withdrawalStatusData && <Pie data={withdrawalStatusData} options={chartOptions} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Status Pie Chart */}
                <div className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="fw-bold mb-0">Investment Status</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        {investmentStatusData && <Pie data={investmentStatusData} options={chartOptions} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Trends Line Chart */}
                <div className="col-md-12 col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="fw-bold mb-0">Daily Trends (Last 30 Days)</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '350px' }}>
                        {dailyTrendsData && <Line data={dailyTrendsData} options={lineChartOptions} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Investment Bar Chart */}
                <div className="col-md-12 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="fw-bold mb-0">Monthly Investment (Last 6 Months)</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '350px' }}>
                        {monthlyInvestmentData && <Bar data={monthlyInvestmentData} options={barChartOptions} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
