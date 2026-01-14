const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
        });
        console.log('Firebase Admin initialized with service account');
      } catch (parseError) {
        console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, using REST API fallback');
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use credentials file if specified
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        console.log('Firebase Admin initialized with application default credentials');
      } catch (credError) {
        console.warn('Failed to initialize with application default credentials, using REST API fallback');
      }
    } else {
      // No Firebase Admin credentials available - will use REST API verification
      console.log('Firebase Admin not initialized - will use REST API for token verification');
    }
  } catch (error) {
    // Silently fail - REST API will be used instead
    console.log('Firebase Admin initialization skipped - using REST API fallback');
  }
}

exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      let decodedToken;
      
      // Check if admin is initialized and working
      if (admin.apps.length > 0) {
        // Use Admin SDK if available
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (adminError) {
          // Only log if it's not a credential/initialization error
          if (!adminError.message?.includes('Failed to determine project ID') && 
              !adminError.message?.includes('ENOTFOUND metadata.google.internal')) {
            console.error('Admin SDK verification error:', adminError.message);
          }
          // Fall through to REST API verification
          decodedToken = null;
        }
      }
      
      // Fallback to REST API verification if Admin SDK fails or not initialized
      if (!decodedToken) {
        try {
          const apiKey = process.env.FIREBASE_API_KEY;
          if (!apiKey) {
            console.error('FIREBASE_API_KEY not configured!');
            throw new Error('Server configuration error: Firebase API key missing');
          }
          
          const response = await fetch(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken: token }),
            }
          );
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Firebase REST API error:', data.error?.message || 'Unknown error');
            throw new Error(data.error?.message || 'Token verification failed');
          }
          
          if (data.users && data.users.length > 0) {
            const user = data.users[0];
            decodedToken = {
              uid: user.localId,
              phone_number: user.phoneNumber || '',
              email: user.email || '',
              name: user.displayName || '',
              picture: user.photoUrl || '',
              // Determine auth type
              firebase: {
                sign_in_provider: user.providerUserInfo?.[0]?.providerId || 'password',
              },
            };
          } else {
            throw new Error('User not found in token');
          }
        } catch (restError) {
          console.error('REST API verification error:', restError.message);
          throw new Error(restError.message || 'Token verification failed');
        }
      }
      
      // Determine auth type from provider
      let authType = 'mobile';
      const signInProvider = decodedToken.firebase?.sign_in_provider || '';
      if (signInProvider === 'google.com') {
        authType = 'google';
      } else if (signInProvider === 'password') {
        authType = 'email';
      } else if (signInProvider === 'phone') {
        authType = 'mobile';
      }
      
      req.user = {
        firebaseUID: decodedToken.uid,
        mobile: decodedToken.phone_number || decodedToken.phoneNumber || '',
        email: decodedToken.email || '',
        name: decodedToken.name || '',
        picture: decodedToken.picture || '',
        authType,
      };
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      let errorMessage = 'Invalid or expired token';
      if (error.message.includes('expired')) {
        errorMessage = 'Token has expired. Please login again.';
      } else if (error.message.includes('revoked')) {
        errorMessage = 'Token has been revoked. Please login again.';
      }
      
      return res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};
