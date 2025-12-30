'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, clearRecaptcha } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import styles from './page.module.css';

const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
];

export default function LoginPage() {
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setAction, isAuthenticated, userData, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && userData) {
      // User is already logged in, redirect to dashboard
      const action = searchParams.get('action');
      if (action) {
        router.push(action);
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [isAuthenticated, userData, authLoading, router, searchParams]);

  useEffect(() => {
    // Check if there's a pending action
    const action = searchParams.get('action');
    if (action) {
      setAction(action);
    }

    // Check for referral code in URL
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      // Store referral code in localStorage for later use during registration
      localStorage.setItem('pending_referral_code', referralCode);
    }

    // Cleanup on unmount
    return () => {
      clearRecaptcha();
    };
  }, [searchParams, setAction]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => {
        setOtpExpiry(otpExpiry - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpExpiry === 0 && step === 'otp') {
      setError('OTP expired. Please request a new one.');
    }
  }, [otpExpiry, step]);

  // Don't render login form if already authenticated (AFTER all hooks)
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
    return null; // Will redirect in useEffect
  }

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    try {
      const phoneNumber = `${countryCode}${mobile.replace(/\D/g, '')}`;
      
      // Always create a fresh reCAPTCHA verifier right before sending
      // Clear any existing one first
      clearRecaptcha();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ensure container exists and prepare it - make it visible for initialization
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        // Create container if it doesn't exist
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }
      
      // Clear container and set it up for invisible reCAPTCHA (hidden but accessible)
      container.innerHTML = '';
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '304px';
      container.style.height = '78px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1';
      container.style.overflow = 'hidden';
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify auth is ready
      if (!auth) {
        throw new Error('Firebase authentication not initialized. Please refresh the page.');
      }
      
      // Create new verifier with INVISIBLE reCAPTCHA (more reliable for phone auth)
      // Invisible reCAPTCHA verifies automatically without user interaction
      let recaptchaVerifier;
      let recaptchaVerified = false;
      
      try {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible', // Use invisible for automatic verification
          callback: (response) => {
            console.log('reCAPTCHA verified automatically', response);
            recaptchaVerified = true;
            // Hide container after verification
            if (container) {
              container.style.display = 'none';
            }
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            recaptchaVerified = false;
            // Show container again if expired
            if (container) {
              container.style.display = 'block';
            }
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error callback:', error);
            recaptchaVerified = false;
          }
        });
      } catch (initError) {
        console.error('reCAPTCHA verifier creation error:', initError);
        // Hide container on error
        if (container) {
          container.style.display = 'none';
        }
        throw new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
      }
      
      // Render reCAPTCHA and wait for it to be ready
      let widgetId;
      try {
        widgetId = await recaptchaVerifier.render();
        console.log('reCAPTCHA rendered successfully with widget ID:', widgetId);
        
        // Wait for reCAPTCHA to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Additional validation - check if widget ID is valid (0 is a valid ID)
        if (widgetId === null || widgetId === undefined) {
          widgetId = recaptchaVerifier._widgetId;
        }
        
        // Widget ID 0 is valid, so only check for null/undefined
        if (widgetId === null || widgetId === undefined) {
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
          throw new Error('reCAPTCHA widget ID not available');
        }
        
        console.log('reCAPTCHA ready with widget ID:', widgetId);
      } catch (renderError) {
        console.error('reCAPTCHA render error:', renderError);
        console.error('Error details:', {
          message: renderError.message,
          code: renderError.code,
          stack: renderError.stack
        });
        // Hide container on error
        if (container) {
          container.style.display = 'none';
        }
        throw new Error('Failed to render reCAPTCHA. Please refresh the page and try again.');
      }
      
      console.log('Sending OTP to:', phoneNumber);
      console.log('Using verifier with widget ID:', widgetId);
      
      // Call signInWithPhoneNumber - invisible reCAPTCHA will verify automatically
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      console.log('OTP sent successfully');
      setConfirmationResult(confirmation);
      setStep('otp');
      setResendCooldown(10); // 10 seconds cooldown
      setOtpExpiry(300); // 5 minutes expiry
      
      // Hide and clear reCAPTCHA after successful send
      const successContainer = document.getElementById('recaptcha-container');
      if (successContainer) {
        successContainer.style.display = 'none';
      }
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear errors
      }
    } catch (error) {
      console.error('OTP send error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please check:\n\n1. Firebase Console → Authentication → Settings → Authorized domains\n   - Add "localhost" if missing\n\n2. Firebase Console → Authentication → Sign-in method\n   - Ensure Phone provider is ENABLED\n\n3. Verify Firebase project configuration matches your .env file\n\n4. Check FIREBASE_SETUP_GUIDE.md for detailed instructions';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later or contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Hide container and clear any verifier on error
      const errorContainer = document.getElementById('recaptcha-container');
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      // Clear reCAPTCHA after successful verification
      clearRecaptcha();

      // Store token temporarily
      localStorage.setItem('firebase_token', token);
      
      // Check if user exists in backend
      try {
        const response = await api.get('/api/user/profile');
        // Backend returns { success: true, user: {...} }
        const userData = response.user || response;
        
        // User exists, login successful
        localStorage.removeItem('firebase_token');
        login(userData);
        
        // Auth state is now managed by AuthContext, no need to redirect here
        // The AuthContext will handle the redirect
      } catch (error) {
        // User doesn't exist (404 or other error), redirect to complete profile
        // Token is already in localStorage, will be used in register page
        console.log('User not found in backend, redirecting to register page');
        router.push('/auth/register');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else {
        setError(error.message || 'Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const phoneNumber = `${countryCode}${mobile.replace(/\D/g, '')}`;
      
      // Clear any existing verifier
      clearRecaptcha();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure container exists
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }
      
      // Prepare container
      container.innerHTML = '';
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create fresh verifier with invisible reCAPTCHA
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA verified', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        },
        'error-callback': (error) => {
          console.error('reCAPTCHA error:', error);
        }
      });
      
      // Render and wait
      let widgetId;
      try {
        widgetId = await recaptchaVerifier.render();
      } catch (renderError) {
        console.error('reCAPTCHA render error:', renderError);
        throw new Error('Failed to initialize reCAPTCHA. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setResendCooldown(10); // 10 seconds cooldown
      setOtpExpiry(300); // Reset to 5 minutes
      
      // Clear verifier
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Welcome Back</h2>
          <p className="text-muted">Login with your mobile number</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">
                Mobile Number
              </label>
              <div className="input-group">
                <select
                  className="form-select"
                  style={{ maxWidth: '140px' }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="form-control"
                  id="mobile"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <small className="text-muted">Enter your mobile number without country code</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Enter OTP
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-shield-check"></i>
                </span>
                <input
                  type="text"
                  className="form-control text-center"
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
              <small className="text-muted">Enter the 6-digit code sent to {countryCode} {mobile}</small>
              {otpExpiry > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    OTP expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                  </small>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-2"
              disabled={loading || otpExpiry === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verifying...
                </>
              ) : otpExpiry === 0 ? (
                <>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  OTP Expired
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Verify OTP
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-link w-100"
              onClick={handleResendOTP}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? (
                <>
                  <i className="bi bi-clock me-2"></i>
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Resend OTP
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-link w-100"
              onClick={() => {
                setStep('mobile');
                setOtp('');
                setError('');
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Change Mobile Number
            </button>
          </form>
        )}

        {/* reCAPTCHA container - will be shown during OTP send */}
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
}
