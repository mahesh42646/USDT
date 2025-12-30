'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function TotalInvestmentSummary() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setSummary({
        totalInvestment: 2450000,
        totalUsers: 1250,
        averageInvestment: 1960,
        newInvestments: 150000,
        referralInvestments: 45000
      });
      setLoading(false);
    }, 500);
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Total Investment Summary</h1>
        <p className="text-muted">Platform-wide investment statistics</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-wallet2 text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-3 mb-0">{summary.totalInvestment.toLocaleString()}</h3>
              <p className="text-muted mb-0">Total Investment (USDT)</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-people text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-3 mb-0">{summary.totalUsers.toLocaleString()}</h3>
              <p className="text-muted mb-0">Total Investors</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-graph-up text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-3 mb-0">{summary.averageInvestment.toLocaleString()}</h3>
              <p className="text-muted mb-0">Average Investment</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-cash-coin text-warning" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-3 mb-0">{summary.newInvestments.toLocaleString()}</h3>
              <p className="text-muted mb-0">New Investments (This Month)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Investment Breakdown</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>New Investments:</strong> {summary.newInvestments.toLocaleString()} USDT</p>
            </div>
            <div className="col-md-6">
              <p><strong>Referral Investments:</strong> {summary.referralInvestments.toLocaleString()} USDT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

