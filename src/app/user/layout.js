'use client';

import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import DashboardSidebar from '@/components/user/DashboardSidebar';
import styles from './layout.module.css';

export default function UserLayout({ children }) {
  return (
    <div className={styles.userLayout}>
      <UserHeader />
      <div className={styles.dashboardLayout}>
        <DashboardSidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
      <UserFooter />
    </div>
  );
}
