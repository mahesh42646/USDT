'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

export default function ReferralSlabConfig() {
  const router = useRouter();
  const [slabs, setSlabs] = useState([
    { min: 10, max: 49, percentage: 0.5 },
    { min: 50, max: 90, percentage: 1.0 },
    { min: 91, max: 120, percentage: 1.5 },
    { min: 121, max: 150, percentage: 2.0 },
    { min: 151, max: null, percentage: 3.0 }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Referral slab configuration will be saved');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <h1 className="h3 fw-bold mb-2">Referral Slab Configuration</h1>
        <p className="text-muted">Configure referral income percentage slabs</p>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {slabs.map((slab, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">Slab {index + 1}</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Min Referrals</label>
                      <input
                        type="number"
                        className="form-control"
                        value={slab.min}
                        onChange={(e) => {
                          const newSlabs = [...slabs];
                          newSlabs[index].min = parseInt(e.target.value);
                          setSlabs(newSlabs);
                        }}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Max Referrals</label>
                      <input
                        type="number"
                        className="form-control"
                        value={slab.max || ''}
                        onChange={(e) => {
                          const newSlabs = [...slabs];
                          newSlabs[index].max = e.target.value ? parseInt(e.target.value) : null;
                          setSlabs(newSlabs);
                        }}
                        min="0"
                        placeholder="No limit"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Income Percentage (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={slab.percentage}
                        onChange={(e) => {
                          const newSlabs = [...slabs];
                          newSlabs[index].percentage = parseFloat(e.target.value);
                          setSlabs(newSlabs);
                        }}
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save me-2"></i>Save Configuration
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

