'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const router = useRouter();
  const { isAuthenticated, userData, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && userData) {
      router.push('/user/dashboard');
    }
  }, [isAuthenticated, userData, authLoading, router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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

  if (isAuthenticated && userData) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      });
      
      setSuccess(true);
      setCooldown(60); // 60 seconds cooldown before resend
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if user exists for security
        setSuccess(true);
        setCooldown(60);
        return;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className="text-center mb-4">
          <div className={styles.iconWrapper}>
            <i className="bi bi-key"></i>
          </div>
          <h2 className="fw-bold mb-2">Forgot Password?</h2>
          <p className="text-muted">
            {success 
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"
            }
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <i className="bi bi-envelope-check"></i>
            </div>
            <h5>Email Sent!</h5>
            <p className="text-muted mb-3">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="text-muted small mb-4">
              <i className="bi bi-info-circle me-1"></i>
              Don't forget to check your spam folder.
            </p>
            
            <button
              type="button"
              className="btn btn-outline-primary w-100 mb-2"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? (
                <>
                  <i className="bi bi-clock me-2"></i>
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Resend Email
                </>
              )}
            </button>
            
            <Link href="/auth/login" className="btn btn-primary w-100">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send Reset Link
                </>
              )}
            </button>

            <Link href="/auth/login" className="btn btn-link w-100">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
