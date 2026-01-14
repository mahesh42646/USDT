'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, clearRecaptcha, googleProvider } from '@/config/firebase';
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

// Loading fallback component
function LoginLoading() {
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

// Main login page wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  // Auth method tab state
  const [authMethod, setAuthMethod] = useState('mobile'); // 'mobile', 'email', 'google'
  
  // Mobile OTP states
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  
  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setAction, isAuthenticated, userData, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && userData) {
      const action = searchParams.get('action');
      if (action) {
        router.push(action);
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [isAuthenticated, userData, authLoading, router, searchParams]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action) {
      setAction(action);
    }

    const referralCode = searchParams.get('ref');
    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }

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

  // Loading state
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

  // Clear error when switching auth methods
  const handleAuthMethodChange = (method) => {
    setAuthMethod(method);
    setError('');
    setStep('mobile');
    setOtp('');
  };

  // Handle backend user check/creation
  const handleBackendAuth = async (firebaseUser, authType) => {
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('firebase_token', token);
      
      // Check if user exists in backend
      try {
        const response = await api.get('/api/user/profile');
        const userData = response.user || response;
        localStorage.removeItem('firebase_token');
        login(userData);
      } catch (error) {
        // User doesn't exist, redirect to complete profile
        console.log('User not found in backend, redirecting to register page');
        // Store auth type for register page
        localStorage.setItem('auth_type', authType);
        router.push('/auth/register');
      }
    } catch (error) {
      console.error('Backend auth error:', error);
      throw error;
    }
  };

  // ==================== MOBILE OTP HANDLERS ====================
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
      
      clearRecaptcha();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }
      
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
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!auth) {
        throw new Error('Firebase authentication not initialized. Please refresh the page.');
      }
      
      let recaptchaVerifier;
      
      try {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            if (container) container.style.display = 'none';
          },
          'expired-callback': () => {
            if (container) container.style.display = 'block';
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error callback:', error);
          }
        });
      } catch (initError) {
        console.error('reCAPTCHA verifier creation error:', initError);
        if (container) container.style.display = 'none';
        throw new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
      }
      
      let widgetId;
      try {
        widgetId = await recaptchaVerifier.render();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (widgetId === null || widgetId === undefined) {
          widgetId = recaptchaVerifier._widgetId;
        }
        
        if (widgetId === null || widgetId === undefined) {
          if (container) container.style.display = 'none';
          throw new Error('reCAPTCHA widget ID not available');
        }
      } catch (renderError) {
        console.error('reCAPTCHA render error:', renderError);
        if (container) container.style.display = 'none';
        throw new Error('Failed to render reCAPTCHA. Please refresh the page and try again.');
      }
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setStep('otp');
      setResendCooldown(10);
      setOtpExpiry(300);
      
      const successContainer = document.getElementById('recaptcha-container');
      if (successContainer) successContainer.style.display = 'none';
      try {
        recaptchaVerifier.clear();
      } catch (e) {}
    } catch (error) {
      console.error('OTP send error:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      const errorContainer = document.getElementById('recaptcha-container');
      if (errorContainer) errorContainer.style.display = 'none';
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
      clearRecaptcha();
      await handleBackendAuth(result.user, 'mobile');
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
    if (resendCooldown > 0) return;

    setError('');
    setLoading(true);

    try {
      const phoneNumber = `${countryCode}${mobile.replace(/\D/g, '')}`;
      
      clearRecaptcha();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }
      
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
      
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {},
        'error-callback': () => {}
      });
      
      try {
        await recaptchaVerifier.render();
      } catch (renderError) {
        console.error('reCAPTCHA render error:', renderError);
        throw new Error('Failed to initialize reCAPTCHA. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setResendCooldown(10);
      setOtpExpiry(300);
      
      try {
        recaptchaVerifier.clear();
      } catch (e) {}
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ==================== EMAIL/PASSWORD HANDLERS ====================
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleBackendAuth(result.user, 'email');
    } catch (error) {
      console.error('Email login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== GOOGLE AUTH HANDLER ====================
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleBackendAuth(result.user, 'google');
    } catch (error) {
      console.error('Google login error:', error);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = '';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      }
      
      if (errorMessage) setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Welcome Back</h2>
          <p className="text-muted">Choose your preferred login method</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Auth Method Tabs */}
        <div className={styles.authTabs}>
          <button
            type="button"
            className={`${styles.authTab} ${authMethod === 'mobile' ? styles.active : ''}`}
            onClick={() => handleAuthMethodChange('mobile')}
          >
            <i className="bi bi-phone me-2"></i>
            Mobile
          </button>
          <button
            type="button"
            className={`${styles.authTab} ${authMethod === 'email' ? styles.active : ''}`}
            onClick={() => handleAuthMethodChange('email')}
          >
            <i className="bi bi-envelope me-2"></i>
            Email
          </button>
        </div>

        {/* Mobile OTP Form */}
        {authMethod === 'mobile' && (
          <>
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
          </>
        )}

        {/* Email/Password Form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailLogin}>
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <Link href="/auth/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link href="/auth/register-email" className={styles.registerLink}>
                Register
              </Link>
            </div>
          </form>
        )}

        {/* Divider */}
        <div className={styles.divider}>
          <span>OR</span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* reCAPTCHA container */}
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
}
