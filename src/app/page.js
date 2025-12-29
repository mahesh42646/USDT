'use client';

import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <UserHeader />
      <main className="container py-5" style={{ flex: 1 }}>
        <h1 className="mb-3">Next.js + Bootstrap</h1>
        <button className="btn btn-primary">
          Bootstrap Button
        </button>
      </main>
      <UserFooter />
    </div>
  )
}
