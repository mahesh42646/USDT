'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ReferralTreeView() {
  const router = useRouter();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }

    setTimeout(() => {
      setTreeData({
        rootUser: { id: 1, name: 'John Doe', referrals: 15 },
        levels: [
          { level: 1, users: [{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }] },
          { level: 2, users: [{ id: 4, name: 'User 4' }, { id: 5, name: 'User 5' }] }
        ]
      });
      setLoading(false);
    }, 500);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2">Referral Tree View</h1>
        <p className="text-muted">Visual representation of referral network</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className={styles.treeContainer}>
              <div className={styles.treeNode}>
                <div className={styles.nodeCard}>
                  <i className="bi bi-person-circle"></i>
                  <div className="mt-2">
                    <strong>{treeData.rootUser.name}</strong>
                    <p className="small mb-0">ID: {treeData.rootUser.id}</p>
                    <span className="badge bg-primary">{treeData.rootUser.referrals} Referrals</span>
                  </div>
                </div>
                <div className={styles.treeChildren}>
                  {treeData.levels[0]?.users.map((user, idx) => (
                    <div key={idx} className={styles.treeNode}>
                      <div className={styles.nodeCard}>
                        <i className="bi bi-person"></i>
                        <div className="mt-2">
                          <strong>{user.name}</strong>
                          <p className="small mb-0">ID: {user.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

