'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { withAuth } from '@/middleware/auth';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.css';

function ProfilePage() {
  const { userData, login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profilePhoto: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        profilePhoto: null,
      });
      if (userData.profilePhoto) {
        setPreview(userData.profilePhoto);
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }

      const response = await api.put('/api/user/profile', formDataToSend);
      const updatedUser = response.user || response;
      
      login(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-person me-2"></i>
          Profile
        </h1>
        <p className="text-muted">Manage your profile information and settings</p>
      </div>

      <div className="row g-4">
        {/* Profile Form */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="profilePhoto" className="form-label">
                    Profile Photo
                  </label>
                  <div className={styles.photoUpload}>
                    {preview ? (
                      <div className={styles.previewContainer}>
                        <img src={preview} alt="Preview" className={styles.previewImage} />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => {
                            setPreview(null);
                            setFormData(prev => ({ ...prev, profilePhoto: null }));
                          }}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="profilePhoto" className={styles.uploadLabel}>
                        <i className="bi bi-camera-fill"></i>
                        <span>Upload Photo</span>
                      </label>
                    )}
                    <input
                      type="file"
                      className="d-none"
                      id="profilePhoto"
                      name="profilePhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <small className="text-muted">Maximum file size: 5MB</small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Account Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="text-muted small mb-1">Mobile Number</p>
                <p className="mb-0"><strong>{userData?.mobile || 'N/A'}</strong></p>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1">Referral Code</p>
                <p className="mb-0">
                  <strong className="font-monospace text-primary">
                    {userData?.referralCode || 'N/A'}
                  </strong>
                </p>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1">Account Status</p>
                <p className="mb-0">
                  <span className={`badge ${
                    userData?.accountStatus === 'active' ? 'bg-success' :
                    userData?.accountStatus === 'frozen' ? 'bg-danger' : 'bg-secondary'
                  }`}>
                    {userData?.accountStatus || 'N/A'}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1">Profile Complete</p>
                <p className="mb-0">
                  {userData?.isProfileComplete ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-warning">No</span>
                  )}
                </p>
              </div>
              <div className="mb-0">
                <p className="text-muted small mb-1">Member Since</p>
                <p className="mb-0">
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Investment Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="text-muted small mb-1">Total Investment</p>
                <p className="mb-0 h5">${(userData?.totalInvestment || 0).toFixed(2)}</p>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1">Interest Balance</p>
                <p className="mb-0 h5 text-success">${(userData?.interestBalance || 0).toFixed(2)}</p>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1">Referral Income</p>
                <p className="mb-0 h5 text-primary">${(userData?.referralIncome || 0).toFixed(2)}</p>
              </div>
              <div className="mb-0">
                <p className="text-muted small mb-1">PlatoCoins</p>
                <p className="mb-0 h5 text-info">
                  <i className="bi bi-coin me-2"></i>
                  {(userData?.platoCoins || 0).toFixed(2)}
                </p>
                <small className="text-muted">1:1 ratio with investments</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
