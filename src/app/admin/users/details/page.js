'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function UserDetails() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setUser({
        id: 1,
        mobile: '+1234567890',
        name: 'John Doe',
        email: 'john@example.com',
        totalInvestment: 5000,
        interestBalance: 250,
        referralCode: 'JOHN123',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2024-12-15',
        directReferrals: 15,
        totalReferrals: 45
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
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">User Details</h1>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Personal Information</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">User ID:</div>
                <div className="col-sm-8">{user.id}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Mobile:</div>
                <div className="col-sm-8">{user.mobile}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Name:</div>
                <div className="col-sm-8">{user.name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Email:</div>
                <div className="col-sm-8">{user.email}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Status:</div>
                <div className="col-sm-8">
                  <span className={`badge bg-${user.status === 'active' ? 'success' : 'danger'}`}>
                    {user.status}
                  </span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Join Date:</div>
                <div className="col-sm-8">{user.joinDate}</div>
              </div>
              <div className="row">
                <div className="col-sm-4 fw-semibold">Last Active:</div>
                <div className="col-sm-8">{user.lastActive}</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Financial Information</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Total Investment:</div>
                <div className="col-sm-8">{user.totalInvestment.toLocaleString()} USDT</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Interest Balance:</div>
                <div className="col-sm-8">{user.interestBalance.toLocaleString()} USDT</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4 fw-semibold">Referral Code:</div>
                <div className="col-sm-8"><code>{user.referralCode}</code></div>
              </div>
              <div className="row">
                <div className="col-sm-4 fw-semibold">Direct Referrals:</div>
                <div className="col-sm-8">{user.directReferrals}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body d-grid gap-2">
              <button className="btn btn-outline-warning">
                <i className="bi bi-lock me-2"></i>Freeze User
              </button>
              <button className="btn btn-outline-success">
                <i className="bi bi-unlock me-2"></i>Unfreeze User
              </button>
              <button className="btn btn-outline-danger">
                <i className="bi bi-trash me-2"></i>Delete User
              </button>
              <button className="btn btn-outline-primary">
                <i className="bi bi-wallet2 me-2"></i>View Investments
              </button>
              <button className="btn btn-outline-info">
                <i className="bi bi-diagram-3 me-2"></i>View Referrals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

