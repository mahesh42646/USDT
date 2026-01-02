'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminHeader from '@/components/shared/AdminHeader';
import AdminSidebar from '@/components/shared/AdminSidebar';
import styles from './layout.module.css';

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAdminAuth();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect routes (except login page)
  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    if (!loading && !isLoginPage && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991.98) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't show header and sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
