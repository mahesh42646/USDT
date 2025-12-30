'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import styles from './page.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profilePhoto: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in and has profile, redirect to dashboard
    if (!authLoading && isAuthenticated && userData) {
      router.push('/user/dashboard');
      return;
    }

    // Check if Firebase user is authenticated
    const checkAuth = async () => {
      const { auth } = await import('@/config/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        // Check for stored token as fallback
        const token = localStorage.getItem('firebase_token');
        if (!token) {
          router.push('/auth/login');
        }
      }
    };
    
    checkAuth();
  }, [router, isAuthenticated, userData, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className={styles.authContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated && userData) {
    return null; // Will redirect in useEffect
  }

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
    setLoading(true);

    try {
      // Get fresh token from Firebase Auth
      const { auth } = await import('@/config/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        // Fallback to stored token
        const storedToken = localStorage.getItem('firebase_token');
        if (!storedToken) {
          setError('Invalid session. Please login again.');
          router.push('/auth/login');
          setLoading(false);
          return;
        }
      } else {
        // Get fresh token and update localStorage
        const freshToken = await user.getIdToken();
        localStorage.setItem('firebase_token', freshToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setError('Session expired. Please login again.');
      router.push('/auth/login');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }

      // Add referral code if available
      const pendingReferralCode = localStorage.getItem('pending_referral_code');
      if (pendingReferralCode) {
        formDataToSend.append('referralCode', pendingReferralCode);
        localStorage.removeItem('pending_referral_code');
      }

      const response = await api.post('/api/user/register', formDataToSend);
      
      // Backend returns { success: true, user: {...} }
      const userData = response.user || response;
      
      localStorage.removeItem('firebase_token');

      // Login will handle redirect via AuthContext
      login(userData);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');

    try {
      // Get fresh token from Firebase Auth
      const { auth } = await import('@/config/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        // Fallback to stored token
        const storedToken = localStorage.getItem('firebase_token');
        if (!storedToken) {
          setError('Invalid session. Please login again.');
          router.push('/auth/login');
          setLoading(false);
          return;
        }
      } else {
        // Get fresh token and update localStorage
        const freshToken = await user.getIdToken();
        localStorage.setItem('firebase_token', freshToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setError('Session expired. Please login again.');
      router.push('/auth/login');
      setLoading(false);
      return;
    }

    try {
      // Create user with minimal data (empty strings)
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', '');
      formDataToSend.append('email', '');

      // Add referral code if available
      const pendingReferralCode = localStorage.getItem('pending_referral_code');
      if (pendingReferralCode) {
        formDataToSend.append('referralCode', pendingReferralCode);
        localStorage.removeItem('pending_referral_code');
      }
      
      const response = await api.post('/api/user/register', formDataToSend);
      
      // Backend returns { success: true, user: {...} }
      const userData = response.user || response;
      
      localStorage.removeItem('firebase_token');

      // Login will handle redirect via AuthContext
      login(userData);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Complete Your Profile</h2>
          <p className="text-muted">Add your details or skip to complete later</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
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
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
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
          </div>

          <div className="mb-4">
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
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-fill"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Complete Profile
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
