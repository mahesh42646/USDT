# Webhook Setup for Localhost - Quick Guide

## Quick Setup Steps

### Step 1: Install ngrok (if not already installed)

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**Or download from:** https://ngrok.com/download

**Or use npm:**
```bash
npm install -g ngrok
```

### Step 2: Start Your Backend Server

Make sure your backend is running on port 3500:
```bash
cd backend
npm start
```

### Step 3: Expose Localhost with ngrok

**Option A: Use the setup script (Easiest)**
```bash
cd backend
./setup-webhook-localhost.sh
```

**Option B: Manual ngrok command**
```bash
ngrok http 3500
```

You'll see output like:
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:3500
```

### Step 4: Copy Your Webhook URL

From the ngrok output, copy the HTTPS URL and add the webhook path:
```
https://abc123xyz.ngrok.io/api/payment/webhook/nowpayments
```

### Step 5: Configure in NOWPayments Dashboard

1. Go to: https://account.nowpayments.io
2. Login to your account
3. Navigate to: **Settings** → **Payment Settings** → **Instant Payment Notifications**
4. In the **IPN Callback URL** field, paste your webhook URL:
   ```
   https://abc123xyz.ngrok.io/api/payment/webhook/nowpayments
   ```
5. Make sure **IPN Secret Key** is set (you already have it: `DYtfq8LaxzHiK/z2wkfVcYt5ux+Ym/fh`)
6. Click **Save**

### Step 6: Test the Webhook

1. Keep ngrok running (don't close the terminal)
2. Make a test payment from your app
3. Check your backend console for webhook logs
4. Check ngrok web interface: http://localhost:4040 (shows all requests)

## Important Notes

⚠️ **ngrok URL Changes**: 
- Free ngrok URLs change every time you restart ngrok
- For testing, you'll need to update the webhook URL in NOWPayments dashboard each time
- For production, use a permanent domain

⚠️ **Keep ngrok Running**:
- ngrok must be running for webhooks to work
- If you close ngrok, webhooks will fail
- Keep the ngrok terminal window open while testing

⚠️ **ngrok Free Plan Limitations**:
- URLs expire after 2 hours
- You may need to restart ngrok and update the webhook URL

## Alternative: Use ngrok with Fixed Domain (Paid)

If you have ngrok paid plan, you can use a fixed domain:
```bash
ngrok http 3500 --domain=your-fixed-domain.ngrok.io
```

This way, you only need to configure the webhook URL once.

## Testing Webhook

After setting up, you can test if webhooks are working:

1. Make a test payment
2. Check backend logs for webhook requests
3. Visit http://localhost:4040 to see ngrok request inspector
4. Look for POST requests to `/api/payment/webhook/nowpayments`

## Troubleshooting

### Webhook not receiving requests?

1. **Check ngrok is running**: Make sure ngrok terminal is open
2. **Check webhook URL**: Verify it's correct in NOWPayments dashboard
3. **Check backend is running**: Make sure backend server is on port 3500
4. **Check ngrok URL**: Visit http://localhost:4040 to see active tunnel
5. **Test manually**: Try accessing `https://your-ngrok-url.ngrok.io/api/payment/webhook/nowpayments` in browser (should show method not allowed, which is expected)

### ngrok not working?

1. **Check if port is correct**: Make sure backend is on port 3500
2. **Check firewall**: Make sure port 3500 is not blocked
3. **Try different port**: If 3500 is busy, change backend port and update ngrok command

### Webhook signature verification failing?

1. **Check IPN secret**: Make sure it's correct in `.env` file
2. **Check webhook data**: Look at ngrok inspector (http://localhost:4040) to see what data is being sent
3. **Check backend logs**: Look for signature verification errors

## Quick Reference

**Your Configuration:**
- API Key: `FPW0X8T-7WG4T0W-JZDF8DC-ZAS6K2F`
- IPN Secret: `DYtfq8LaxzHiK/z2wkfVcYt5ux+Ym/fh`
- Backend Port: `3500`
- Webhook Path: `/api/payment/webhook/nowpayments`

**Commands:**
```bash
# Start backend
cd backend && npm start

# Start ngrok (in another terminal)
ngrok http 3500

# Or use the script
cd backend && ./setup-webhook-localhost.sh
```

**Dashboard:**
- NOWPayments: https://account.nowpayments.io
- ngrok Inspector: http://localhost:4040
