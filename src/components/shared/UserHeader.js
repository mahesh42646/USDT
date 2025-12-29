'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './UserHeader.module.css';

export default function UserHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status (will be replaced with actual auth context)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);
    // Set user name from auth context when available
    setUserName('User');
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/auth/login';
  };

  const navItems = [
    { name: 'Home', path: '/', icon: 'bi-house-door' },
    { name: 'About', path: '/about', icon: 'bi-info-circle' },
    { name: 'Contact', path: '/contact', icon: 'bi-envelope' },
  ];

  const userNavItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: 'bi-speedometer2' },
    { name: 'Investment', path: '/user/investment', icon: 'bi-wallet2' },
    { name: 'Referrals', path: '/user/referrals', icon: 'bi-people' },
    { name: 'Withdrawal', path: '/user/withdrawal', icon: 'bi-cash-coin' },
    { name: 'Profile', path: '/user/profile', icon: 'bi-person' },
  ];

  return (
    <>
      <header className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm  ${styles.userHeader}`}>
        <div className="container">
          {/* Logo */}
          <Link href={isLoggedIn ? '/user/dashboard' : '/'} className="navbar-brand d-flex align-items-center">
            <i className="bi bi-graph-up-arrow text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
            <span className={`${styles.logoText} fw-bold`}>GroandInvest</span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop Navigation */}
          <div className={`collapse navbar-collapse ${styles.desktopNav}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    href={item.path}
                    className={`nav-link d-flex align-items-center ${pathname === item.path ? 'active' : ''}`}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="d-flex align-items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link href="/user/dashboard" className={`btn btn-outline-primary ${styles.actionBtn}`}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                  <div className="dropdown">
                    <button
                      className={`btn btn-link p-0 ${styles.profileBtn}`}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <div className={`${styles.profileCircle} d-flex align-items-center justify-content-center`}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" href="/user/profile">
                          <i className="bi bi-person me-2"></i>Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" href="/user/dashboard">
                          <i className="bi bi-speedometer2 me-2"></i>Dashboard
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <Link href="/auth/login" className={`btn btn-primary ${styles.loginBtn}`}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <>
          <div
            className={styles.sidebarOverlay}
            onClick={closeSidebar}
          ></div>
          <div className={`${styles.mobileSidebar} ${showSidebar ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <div className="d-flex align-items-center">
                <i className="bi bi-graph-up-arrow text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                <h5 className="mb-0">GroandInvest</h5>
              </div>
              <button
                className={styles.closeBtn}
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <nav className={styles.sidebarNav}>
              {/* Public Nav Items */}
              <div className="mb-3">
                <h6 className="text-muted small px-3 mb-2">Navigation</h6>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.sidebarLink} ${pathname === item.path ? styles.active : ''}`}
                    onClick={closeSidebar}
                  >
                    <i className={`${item.icon} ${styles.sidebarIcon}`}></i>
                    {item.name}
                  </Link>
                ))}
              </div>
              {/* User Nav Items (if logged in) */}
              {isLoggedIn && (
                <div>
                  <h6 className="text-muted small px-3 mb-2">My Account</h6>
                  {userNavItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`${styles.sidebarLink} ${pathname === item.path ? styles.active : ''}`}
                      onClick={closeSidebar}
                    >
                      <i className={`${item.icon} ${styles.sidebarIcon}`}></i>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
            <div className={styles.sidebarFooter}>
              {isLoggedIn ? (
                <>
                  <div className={`${styles.profileCircle} ${styles.sidebarProfile} d-flex align-items-center justify-content-center mb-3`}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-center mb-2">{userName}</p>
                  <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="btn btn-primary w-100" onClick={closeSidebar}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
