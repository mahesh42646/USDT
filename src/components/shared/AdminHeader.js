'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { PLATFORM_NAME } from '@/utils/constants';
import styles from './AdminHeader.module.css';

export default function AdminHeader({ onMenuClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    setAdminEmail(email || 'Admin');
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };


  return (
    <>
      <header className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm ${styles.adminHeader}`}>
        <div className="container-fluid">
          <Link href="/admin/dashboard" className="navbar-brand d-flex align-items-center">
            <i className="bi bi-shield-lock text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
            <span className={`${styles.logoText} fw-bold`}>{PLATFORM_NAME} Admin</span>
          </Link>

          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${styles.desktopNav}`}>

            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <button
                  className={`btn btn-link p-0 ${styles.profileBtn}`}
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className={`${styles.profileCircle} d-flex align-items-center justify-content-center`}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <div className="dropdown-item-text">
                      <small className="text-muted">Logged in as</small>
                      <div className="fw-semibold">{adminEmail}</div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
