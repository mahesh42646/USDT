const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      console.log('Firebase Admin initialized with service account');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // For development, use project ID only (requires GOOGLE_APPLICATION_CREDENTIALS env var)
      // Or use the REST API approach
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin initialized with project ID');
    } else {
      // Fallback to application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin initialized with application default credentials');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Don't throw, let it fail gracefully and log errors during token verification
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
      
      // Check if admin is initialized
      if (admin.apps.length > 0) {
        // Use Admin SDK if available
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (adminError) {
          console.error('Admin SDK verification error:', adminError);
          // Fall through to REST API verification
          decodedToken = null;
        }
      }
      
      // Fallback to REST API verification if Admin SDK fails or not initialized
      if (!decodedToken) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.FIREBASE_API_KEY || ''}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken: token }),
            }
          );
          
          if (!response.ok) {
            throw new Error('Token verification failed');
          }
          
          const data = await response.json();
          if (data.users && data.users.length > 0) {
            const user = data.users[0];
            decodedToken = {
              uid: user.localId,
              phone_number: user.phoneNumber || '',
            };
          } else {
            throw new Error('User not found in token');
          }
        } catch (restError) {
          console.error('REST API verification error:', restError);
          throw new Error('Token verification failed');
        }
      }
      
      req.user = {
        firebaseUID: decodedToken.uid,
        mobile: decodedToken.phone_number || decodedToken.phoneNumber || '',
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
