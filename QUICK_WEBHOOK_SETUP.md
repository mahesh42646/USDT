# 🚀 Quick Webhook Setup for Localhost

## Your Credentials (Already Configured ✅)
- **API Key**: `FPW0X8T-7WG4T0W-JZDF8DC-ZAS6K2F`
- **IPN Secret**: `DYtfq8LaxzHiK/z2wkfVcYt5ux+Ym/fh`
- **Backend Port**: `3500`

## Step-by-Step Setup (5 minutes)

### Step 1: Install ngrok

**Option A: Using Homebrew (macOS) - Recommended**
```bash
brew install ngrok/ngrok/ngrok
```

**Option B: Using npm**
```bash
npm install -g ngrok
```

**Option C: Download directly**
1. Go to: https://ngrok.com/download
2. Download for macOS
3. Unzip and move to `/usr/local/bin/` or add to PATH

### Step 2: Start Your Backend Server

Open Terminal 1:
```bash
cd /Users/mahesh/Desktop/groandinvest/backend
npm start
```

Keep this running! ✅

### Step 3: Start ngrok Tunnel

Open Terminal 2 (new terminal window):
```bash
ngrok http 3500
```

You'll see something like:
```
Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:3500
```

**Copy the HTTPS URL** (the one starting with `https://`) - you'll need it in the next step!

### Step 4: Configure Webhook in NOWPayments Dashboard

1. **Open browser** and go to: https://account.nowpayments.io
2. **Login** to your account
3. Go to: **Settings** → **Payment Settings** → **Instant Payment Notifications**
4. In **IPN Callback URL**, paste:
   ```
   https://YOUR-NGROK-URL/api/payment/webhook/nowpayments
   ```
   Replace `YOUR-NGROK-URL` with the URL from Step 3 (e.g., `abc123xyz.ngrok-free.app`)
   
   **Example:**
   ```
   https://abc123xyz.ngrok-free.app/api/payment/webhook/nowpayments
   ```
5. **Click Save** ✅

### Step 5: Test It!

1. Keep both terminals running (backend + ngrok)
2. Make a test payment from your app
3. Check backend console for webhook logs
4. Visit http://localhost:4040 to see ngrok request inspector

## 🎯 Quick Commands Summary

```bash
# Terminal 1: Start Backend
cd backend && npm start

# Terminal 2: Start ngrok
ngrok http 3500

# Then configure webhook URL in NOWPayments dashboard:
# https://YOUR-NGROK-URL/api/payment/webhook/nowpayments
```

## ⚠️ Important Notes

1. **Keep ngrok running**: Don't close the ngrok terminal while testing
2. **URL changes**: Free ngrok URLs change each time you restart. You'll need to update the webhook URL in NOWPayments dashboard if you restart ngrok
3. **ngrok Inspector**: Visit http://localhost:4040 to see all webhook requests in real-time

## 🔍 Verify It's Working

1. Make a test payment
2. Check ngrok inspector: http://localhost:4040
3. Look for POST request to `/api/payment/webhook/nowpayments`
4. Check backend console for "Webhook processed" message

## 🆘 Troubleshooting

**ngrok not found?**
```bash
# Install via Homebrew
brew install ngrok/ngrok/ngrok

# Or via npm
npm install -g ngrok
```

**Port 3500 already in use?**
- Check if backend is already running
- Or change backend port in `.env` and update ngrok command

**Webhook not receiving?**
- Make sure ngrok is running
- Check webhook URL is correct in NOWPayments dashboard
- Verify backend is running on port 3500
- Check ngrok inspector at http://localhost:4040

## 📝 Your Webhook URL Format

```
https://[ngrok-url]/api/payment/webhook/nowpayments
```

Example:
```
https://abc123xyz.ngrok-free.app/api/payment/webhook/nowpayments
```

---

**That's it!** Once configured, webhooks will work automatically when payments are made. 🎉
