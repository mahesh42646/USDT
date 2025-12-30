# Firebase Admin SDK Setup Guide

## Problem
The backend needs Firebase Admin SDK to verify Firebase ID tokens. Without proper credentials, you'll get "Invalid or expired token" errors.

## Solution Options

### Option 1: Use Service Account Key (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `connectmydesigner-com`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Add the JSON content to your `backend/.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"connectmydesigner-com",...}'
```

**OR** store the file securely and reference it:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Option 2: Use REST API (Alternative for Development)

If you can't set up service account, you can verify tokens using Firebase REST API instead of Admin SDK.

## Current Implementation

The middleware will try to initialize Firebase Admin in this order:
1. Service Account Key from `FIREBASE_SERVICE_ACCOUNT_KEY` env var
2. Project ID from `FIREBASE_PROJECT_ID` env var
3. Application Default Credentials (requires `GOOGLE_APPLICATION_CREDENTIALS`)

## Quick Fix for Development

For now, you can use the REST API approach. Update `backend/middleware/auth.js` to use REST API verification instead of Admin SDK.

## Testing

After setup, test by:
1. Login with OTP
2. Try to register/complete profile
3. Check backend logs for Firebase Admin initialization messages

