'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar({ isOpen }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => {
      // If the clicked menu is already open, close it
      if (prev[menuKey]) {
        return { [menuKey]: false };
      }
      // Otherwise, close all menus and open only the clicked one
      return { [menuKey]: true };
    });
  };

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
      type: 'menu',
      children: [
        { name: 'Users List', path: '/admin/users', icon: 'bi-list-ul' },
        { name: 'User Details', path: '/admin/users/details', icon: 'bi-person' },
        { name: 'Freeze User', path: '/admin/users/freeze', icon: 'bi-lock' },
        { name: 'Unfreeze User', path: '/admin/users/unfreeze', icon: 'bi-unlock' },
        { name: 'Delete User', path: '/admin/users/delete', icon: 'bi-trash' },
        { name: 'Inactive Users', path: '/admin/users/inactive', icon: 'bi-clock-history' },
        { name: 'Investment', path: '/admin/users/investment', icon: 'bi-wallet2' },
        { name: 'Referrals', path: '/admin/users/referrals', icon: 'bi-diagram-3' }
      ]
    },
    {
      key: 'investments',
      name: 'Investments',
      icon: 'bi-wallet2',
      type: 'menu',
      children: [
        { name: 'Investment List', path: '/admin/investments', icon: 'bi-list-ul' },
        { name: 'User Investment Details', path: '/admin/investments/user-details', icon: 'bi-person' },
        { name: 'Total Investment Summary', path: '/admin/investments/summary', icon: 'bi-graph-up' },
        { name: 'Add Manual Investment', path: '/admin/investments/manual', icon: 'bi-plus-circle' },
        { name: 'Lock/Unlock Investment', path: '/admin/investments/lock', icon: 'bi-lock' }
      ]
    },
    {
      key: 'referrals',
      name: 'Referrals',
      icon: 'bi-diagram-3',
      type: 'menu',
      children: [
        { name: 'Referral Tree View', path: '/admin/referrals/tree', icon: 'bi-diagram-3-fill' },
        { name: 'Direct Referral List', path: '/admin/referrals/direct', icon: 'bi-people-fill' },
        { name: 'Referral Slab Check', path: '/admin/referrals/slab', icon: 'bi-bar-chart' },
        { name: 'Credit Logs', path: '/admin/referrals/logs', icon: 'bi-journal-text' }
      ]
    },
    {
      key: 'withdrawals',
      name: 'Withdrawals',
      icon: 'bi-cash-coin',
      type: 'menu',
      children: [
        { name: 'Withdrawal Requests', path: '/admin/withdrawals', icon: 'bi-list-ul' },
        { name: 'Approve Withdrawal', path: '/admin/withdrawals/approve', icon: 'bi-check-circle' },
        { name: 'Reject Withdrawal', path: '/admin/withdrawals/reject', icon: 'bi-x-circle' },
        { name: 'Manual Approval Queue', path: '/admin/withdrawals/queue', icon: 'bi-hourglass-split' },
        { name: 'Withdrawal History', path: '/admin/withdrawals/history', icon: 'bi-clock-history' }
      ]
    },
    {
      key: 'transactions',
      name: 'Transaction History',
      icon: 'bi-arrow-left-right',
      path: '/admin/transactions',
      type: 'link'
    },
    {
      key: 'payments',
      name: 'Payment History',
      icon: 'bi-credit-card',
      path: '/admin/payments',
      type: 'link'
    },
    {
      key: 'settings',
      name: 'Settings',
      icon: 'bi-gear',
      type: 'menu',
      children: [
        { name: 'Interest Rate Config', path: '/admin/settings/interest', icon: 'bi-percent' },
        { name: 'Withdrawal Limits Config', path: '/admin/settings/withdrawal-limits', icon: 'bi-slash-circle' },
        { name: 'Referral Slab Config', path: '/admin/settings/referral-slab', icon: 'bi-bar-chart-line' },
        { name: 'Lock Conditions Config', path: '/admin/settings/lock-conditions', icon: 'bi-lock-fill' },
        { name: 'Maintenance Mode', path: '/admin/settings/maintenance', icon: 'bi-tools' }
      ]
    }
  ];

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const isMenuExpanded = (key) => {
    return expandedMenus[key] || menuItems.find(item => item.key === key)?.children?.some(child => isActive(child.path));
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          if (item.type === 'link') {
            return (
              <Link
                key={item.key}
                href={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              >
                <i className={`bi ${item.icon} ${styles.navIcon}`}></i>
                <span>{item.name}</span>
              </Link>
            );
          } else {
            const expanded = isMenuExpanded(item.key);
            return (
              <div key={item.key} className={styles.menuGroup}>
                <button
                  className={`${styles.menuToggle} ${expanded ? styles.expanded : ''}`}
                  onClick={() => toggleMenu(item.key)}
                >
                  <i className={`bi ${item.icon} ${styles.navIcon}`}></i>
                  <span>{item.name}</span>
                  <i className={`bi bi-chevron-down ${styles.chevron}`}></i>
                </button>
                {expanded && (
                  <div className={styles.subMenu}>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`${styles.subNavLink} ${isActive(child.path) ? styles.active : ''}`}
                      >
                        <i className={`bi ${child.icon} ${styles.subNavIcon}`}></i>
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        })}
      </nav>
    </aside>
  );
}

