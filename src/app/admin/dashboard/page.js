'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestment: 0,
    totalInterestGenerated: 0,
    pendingWithdrawals: 0,
    totalReferralsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    // Simulate loading stats data
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        activeUsers: 892,
        totalInvestment: 2450000,
        totalInterestGenerated: 125000,
        pendingWithdrawals: 45000,
        totalReferralsCount: 3420
      });
      setLoading(false);
    }, 500);
  }, [router]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'bi-people-fill',
      color: 'primary',
      suffix: '',
      link: '/admin/users',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: 'bi-person-check-fill',
      color: 'success',
      suffix: '',
      link: '/admin/users',
      trend: '+8.3%',
      trendUp: true
    },
    {
      title: 'Total Investment',
      value: stats.totalInvestment,
      icon: 'bi-wallet2',
      color: 'info',
      suffix: ' USDT',
      link: '/admin/investments',
      trend: '+15.2%',
      trendUp: true
    },
    {
      title: 'Total Interest Generated',
      value: stats.totalInterestGenerated,
      icon: 'bi-graph-up-arrow',
      color: 'warning',
      suffix: ' USDT',
      link: '/admin/investments',
      trend: '+22.1%',
      trendUp: true
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: 'bi-clock-history',
      color: 'danger',
      suffix: ' USDT',
      link: '/admin/withdrawals',
      trend: '5 requests',
      trendUp: false
    },
    {
      title: 'Total Referrals',
      value: stats.totalReferralsCount,
      icon: 'bi-diagram-3-fill',
      color: 'primary',
      suffix: '',
      link: '/admin/referrals/direct',
      trend: '+18.7%',
      trendUp: true
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const quickActions = [
    { title: 'View Users', icon: 'bi-people', link: '/admin/users', color: 'primary' },
    { title: 'Manage Investments', icon: 'bi-wallet2', link: '/admin/investments', color: 'info' },
    { title: 'Process Withdrawals', icon: 'bi-cash-coin', link: '/admin/withdrawals', color: 'warning' },
    { title: 'View Referrals', icon: 'bi-diagram-3', link: '/admin/referrals/direct', color: 'success' }
  ];

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
                            {card.trend && (
                              <div className={`mt-2 ${styles.trend} ${card.trendUp ? styles.trendUp : styles.trendNeutral}`}>
                                <i className={`bi ${card.trendUp ? 'bi-arrow-up' : 'bi-dash'} me-1`}></i>
                                <small>{card.trend}</small>
                              </div>
                            )}
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

            {/* Quick Actions Section */}
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pb-0">
                    <h5 className="fw-bold mb-0">Quick Actions</h5>
                    <p className="text-muted small mb-0">Frequently used admin functions</p>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {quickActions.map((action, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                          <Link href={action.link} className={styles.quickActionCard}>
                            <div className={`card h-100 border ${styles.quickAction} border-${action.color} border-opacity-25`}>
                              <div className="card-body text-center p-4">
                                <div className={`${styles.quickActionIcon} text-${action.color} mb-3`}>
                                  <i className={`bi ${action.icon}`}></i>
                                </div>
                                <h6 className="fw-semibold mb-0">{action.title}</h6>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
