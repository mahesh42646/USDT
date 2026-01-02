'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: 'bi-speedometer2' },
    { name: 'Investment', path: '/user/investment', icon: 'bi-wallet2' },
    { name: 'Referrals', path: '/user/referrals', icon: 'bi-people' },
    { name: 'Withdrawal', path: '/user/withdrawal', icon: 'bi-cash-coin' },
    { name: 'Profile', path: '/user/profile', icon: 'bi-person' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`${styles.mobileToggle} d-lg-none`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
        

          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <i className={`${item.icon} ${styles.navIcon}`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

