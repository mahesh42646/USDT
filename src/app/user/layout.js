'use client';

import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import styles from './layout.module.css';

export default function UserLayout({ children }) {
  return (
    <div className={styles.userLayout}>
      <UserHeader />
      <main className={styles.mainContent}>
        {children}
      </main>
      <UserFooter />
    </div>
  );
}
