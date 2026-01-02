'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar({ isOpen }) {
  const pathname = usePathname();

  const menuItems = [
    {
      key: 'dashboard',
      name: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/admin/dashboard',
      type: 'link'
    },
    {
      key: 'users',
      name: 'Users',
      icon: 'bi-people',
      path: '/admin/users',
      type: 'link'
    },
    {
      key: 'referrals',
      name: 'Referrals',
      icon: 'bi-diagram-3',
      path: '/admin/referrals/direct',
      type: 'link'
    },
    {
      key: 'withdrawals',
      name: 'Withdrawals',
      icon: 'bi-cash-coin',
      path: '/admin/withdrawals',
      type: 'link'
    },
    {
      key: 'transactions',
      name: 'Transaction History',
      icon: 'bi-arrow-left-right',
      path: '/admin/transactions',
      type: 'link'
    },
    {
      key: 'settings',
      name: 'Settings',
      icon: 'bi-gear',
      path: '/admin/settings',
      type: 'link'
    }
  ];

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
          >
            <i className={`bi ${item.icon} ${styles.navIcon}`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

