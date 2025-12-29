# Firebase Phone Authentication Setup Guide

## Step-by-Step Configuration

### 1. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `connectmydesigner-com`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Toggle **Enable** to ON
6. Click **Save**

### 2. Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll down to **Authorized domains** section
3. Click **Add domain**
4. Add the following domains:
   - `localhost` (for local development)
   - `127.0.0.1` (alternative localhost)
   - Your production domain (when ready)

**Important**: `localhost` must be in the authorized domains list for local development to work.

### 3. Configure reCAPTCHA

Firebase automatically handles reCAPTCHA for phone authentication. However, you need to ensure:

1. **reCAPTCHA v2** is enabled (not Enterprise unless specifically configured)
2. Go to **Authentication** → **Settings** → **reCAPTCHA** section
3. Verify that reCAPTCHA is properly configured for your project

### 4. Verify Firebase Configuration

Check that your `.env` file has the correct values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBYP6l8qP75KLPD8hUoyOvofEDtx1_v4VE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=connectmydesigner-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=connectmydesigner-com
```

### 5. Test Phone Numbers (Optional - for Development)

For testing without sending real SMS:

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Click **Add phone number**
4. Add a test number (e.g., `+1 650-555-3434`)
5. Add a 6-digit verification code (e.g., `123456`)
6. Click **Add**

**Note**: Test numbers must be fictional (use 555 prefix for US numbers).

### 6. Enable Billing (Required for Production)

Phone authentication requires a paid Firebase plan (Blaze plan):
1. Go to **Project Settings** → **Usage and billing**
2. Upgrade to **Blaze plan** (pay-as-you-go)
3. Phone authentication has a free tier but requires billing enabled

## Troubleshooting

### Error: `auth/invalid-app-credential`

**Causes:**
- Domain not in authorized domains list
- reCAPTCHA configuration mismatch
- Firebase project configuration incorrect

**Solutions:**
1. Verify `localhost` is in authorized domains
2. Check Firebase project ID matches `.env` file
3. Ensure Phone provider is enabled
4. Clear browser cache and try again

### Error: `401 Unauthorized` from reCAPTCHA API

**Causes:**
- reCAPTCHA site key mismatch
- Domain not authorized in reCAPTCHA console

**Solutions:**
1. Verify authorized domains in Firebase Console
2. Check that you're using the correct Firebase project
3. Ensure reCAPTCHA is enabled for your project

### reCAPTCHA Not Rendering

**Solutions:**
1. Check browser console for errors
2. Verify container element exists in DOM
3. Ensure Firebase SDK is properly loaded
4. Check network tab for blocked requests

## Testing

### Manual Testing with Test Numbers

1. Add a test phone number in Firebase Console
2. Use that number in your app
3. Enter the test verification code
4. No actual SMS will be sent

### Production Testing

1. Use a real phone number
2. Receive SMS with verification code
3. Enter code to complete authentication

## Reference

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)

