'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/shared/AdminHeader';
import AdminSidebar from '@/components/shared/AdminSidebar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show header and sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991.98) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.adminLayout}>
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.adminContent}>
        <div className={styles.sidebarWrapper}>
          <div className={styles.sidebarContainer}>
            <AdminSidebar isOpen={sidebarOpen} />
          </div>
          {sidebarOpen && (
            <div
              className={styles.sidebarOverlay}
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
        </div>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
