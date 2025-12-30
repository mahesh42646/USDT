import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize reCAPTCHA verifier
export const initializeRecaptcha = (containerId = 'recaptcha-container', onVerified = null) => {
  if (typeof window !== 'undefined') {
    // Clear existing verifier if any
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear errors
      }
      delete window.recaptchaVerifier;
    }
    
    // Wait for container to exist
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('reCAPTCHA container not found');
      return null;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create new verifier with invisible reCAPTCHA (more reliable for phone auth)
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved automatically
          console.log('reCAPTCHA verified', response);
          if (onVerified) {
            onVerified(response);
          }
        },
        'expired-callback': () => {
          // Response expired
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {
              // Ignore
            }
            delete window.recaptchaVerifier;
          }
          if (onVerified) {
            onVerified(null, 'expired');
          }
        },
        'error-callback': (error) => {
          console.log('reCAPTCHA error', error);
          if (onVerified) {
            onVerified(null, error);
          }
        }
      });
      
      // Render reCAPTCHA (invisible mode)
      window.recaptchaVerifier.render().then((widgetId) => {
        console.log('reCAPTCHA rendered with widget ID:', widgetId);
        window.recaptchaWidgetId = widgetId;
        // Store widget ID in verifier for later validation
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier._widgetId = widgetId;
        }
        // For invisible, we can mark as ready immediately
        if (onVerified) {
          onVerified('ready');
        }
      }).catch((error) => {
        console.error('reCAPTCHA render error:', error);
        if (onVerified) {
          onVerified(null, error);
        }
      });
    } catch (error) {
      console.error('reCAPTCHA initialization error:', error);
      return null;
    }
  }
  return window.recaptchaVerifier;
};

// Clear reCAPTCHA
export const clearRecaptcha = () => {
  if (typeof window !== 'undefined' && window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    delete window.recaptchaVerifier;
  }
};

export default app;

