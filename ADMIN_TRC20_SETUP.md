# Admin Guide: Automatic TRC20 Payment Verification Setup

This guide explains how to set up automatic TRC20 payment verification so investments are confirmed automatically without manual intervention.

## Prerequisites

1. **TRC20 USDT Wallet**
   - You need a TRON (TRC20) wallet to receive USDT payments
   - Recommended wallets: TronLink, Trust Wallet, or hardware wallets
   - Keep your wallet address and private key secure

2. **TRON API Access**
   - TronGrid API account (Free tier available): https://www.trongrid.io/
   - Free tier: 10,000 requests/day
   - Or use TronScan API as alternative

## Step 1: Get Your TRC20 Wallet Address

1. **Create/Use TRC20 Wallet**
   - Set up a TRON wallet that supports USDT (TRC20)
   - Your wallet address will look like: `Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - This is the address where users will send USDT payments

2. **Note Your Wallet Address**
   - Copy and save your wallet address securely
   - You'll need it for configuration in Step 3

## Step 2: Get TronGrid API Key

1. **Sign Up for TronGrid**
   - Go to https://www.trongrid.io/
   - Create a free account
   - Complete registration

2. **Get API Key**
   - Log in to TronGrid dashboard
   - Navigate to API section
   - Generate or copy your API key
   - Free tier provides 10,000 requests per day

3. **Note Your API Key**
   - Save your API key securely
   - You'll need it for configuration in Step 3

## Step 3: Configure Backend Environment

1. **Open Backend Environment File**
   - Navigate to `backend/.env` file
   - Open it in a text editor

2. **Add Configuration Variables**
   Add the following lines to your `backend/.env` file:
   ```
   AUTO_VERIFY_TRC20=true
   ADMIN_WALLET_ADDRESS=TYourActualWalletAddressHere
   TRONGRID_API_KEY=your_tron_grid_api_key_here
   TRONGRID_API_URL=https://api.trongrid.io
   ```

3. **Replace Placeholder Values**
   - Replace `TYourActualWalletAddressHere` with your actual TRC20 wallet address from Step 1
   - Replace `your_tron_grid_api_key_here` with your TronGrid API key from Step 2

4. **Save the File**
   - Save `backend/.env` after making changes

## Step 4: Configure Frontend Wallet Address

1. **Open Frontend Environment File**
   - Navigate to `.env` file in project root
   - Open it in a text editor

2. **Add Wallet Address**
   Add the following line:
   ```
   NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=TYourActualWalletAddressHere
   ```

3. **Replace Placeholder Value**
   - Replace `TYourActualWalletAddressHere` with your actual TRC20 wallet address (same as Step 3)

4. **Save the File**
   - Save `.env` after making changes

## Step 5: Verify Service Files Exist

The automatic verification system requires these files to be present:

1. **Verification Service**
   - File: `backend/services/trc20VerificationService.js`
   - This service verifies TRC20 transactions on the blockchain

2. **Cron Job File**
   - File: `backend/cron/trc20VerificationCron.js`
   - This runs automatic verification every 2 minutes

3. **Server Integration**
   - File: `backend/server.js` should include cron job initialization
   - Cron job starts automatically when `AUTO_VERIFY_TRC20=true`

If these files don't exist, they need to be created. Contact your developer or refer to the codebase.

## Step 6: Install Dependencies

1. **Navigate to Backend Directory**
   - Open terminal
   - Go to `backend` folder

2. **Install Required Packages**
   - Run: `npm install`
   - This installs all required dependencies including axios for API calls

3. **Verify Installation**
   - Check that installation completed without errors

## Step 7: Start Backend Server

1. **Start the Server**
   - In backend directory, run: `npm start`
   - Or for development: `npm run dev`

2. **Check Server Logs**
   - Look for message: "TRC20 automatic verification cron job started"
   - This confirms automatic verification is enabled

3. **Verify Cron Job is Running**
   - Every 2 minutes, you should see logs showing verification activity
   - Logs will show: "TRC20 Auto-Verification Started" and completion status

## Step 8: How Automatic Verification Works

1. **User Submits TRC20 Investment**
   - User enters investment amount and transaction hash
   - Investment is created with "pending" status

2. **Automatic Verification Process**
   - Every 2 minutes, the system checks all pending investments
   - For each pending investment, it verifies the transaction hash on TRON blockchain
   - Checks if:
     - Transaction exists and is confirmed
     - Amount matches investment amount (within 0.01 USDT tolerance)
     - Transaction is sent to your admin wallet address
     - Token is USDT (TRC20)

3. **Automatic Confirmation**
   - If all checks pass, investment is automatically confirmed
   - User balance is updated immediately
   - PlatoCoins are awarded (1:1 ratio)
   - Referral activation happens if applicable

4. **Failed Verifications**
   - If verification fails, investment remains pending
   - You can manually review and confirm/reject if needed
   - Check server logs for failure reasons

## Step 9: Monitor Automatic Verification

1. **Check Server Logs**
   - Monitor backend console output
   - Look for verification logs every 2 minutes
   - Logs show: processed count, confirmed count, failed count

2. **Verify Investments are Confirming**
   - Check investment history in user dashboard
   - Pending investments should change to "confirmed" automatically
   - Usually within 2-4 minutes of transaction submission

3. **Check for Issues**
   - If investments aren't auto-confirming:
     - Verify `AUTO_VERIFY_TRC20=true` in `.env`
     - Check API key is valid
     - Verify wallet address is correct
     - Check server logs for error messages

## Step 10: Configuration Options

### Verification Frequency
- **Default**: Every 2 minutes
- Can be adjusted in cron job configuration if needed
- More frequent = faster confirmation but more API calls
- Less frequent = slower confirmation but fewer API calls

### Amount Tolerance
- **Default**: 0.01 USDT difference allowed
- Small differences due to fees are automatically accepted
- Can be adjusted in verification service if needed

### API Rate Limits
- **Free Tier**: 10,000 requests/day
- If you exceed limits, upgrade to paid tier
- Or reduce verification frequency

## Step 11: Troubleshooting

### Issue: Investments Not Auto-Confirming

**Check These:**
1. Is `AUTO_VERIFY_TRC20=true` in `backend/.env`?
2. Is backend server running?
3. Is cron job starting? (check server logs)
4. Is API key valid and not expired?
5. Is wallet address correct in both `.env` files?
6. Is transaction hash correct and confirmed on blockchain?

**Solutions:**
- Verify all environment variables are set correctly
- Restart backend server after changing `.env`
- Check TronGrid dashboard for API key status
- Verify transaction on TronScan.org manually

### Issue: API Rate Limit Exceeded

**Solutions:**
- Reduce verification frequency (change cron to every 5 minutes)
- Upgrade to paid TronGrid tier
- Use multiple API keys with rotation

### Issue: Wrong Amount Verification

**Check:**
- Amount tolerance setting (default 0.01 USDT)
- USDT has 6 decimals (1000000 = 1 USDT)
- Transaction may include fees

**Solution:**
- Adjust tolerance in verification service if needed
- Or manually confirm if amount is close

### Issue: Wrong Wallet Address

**Check:**
- Verify `ADMIN_WALLET_ADDRESS` matches your actual wallet
- Check both backend and frontend `.env` files
- Ensure no typos in wallet address

## Step 12: Disable Automatic Verification (If Needed)

1. **Update Environment Variable**
   - Open `backend/.env`
   - Change: `AUTO_VERIFY_TRC20=false`

2. **Restart Server**
   - Stop backend server
   - Start again: `npm start`

3. **Manual Verification**
   - Investments will remain pending
   - You can manually confirm using admin panel or API

## Quick Reference

- **TRON Explorer**: https://tronscan.org
- **TronGrid API**: https://www.trongrid.io/
- **USDT Contract**: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
- **Verification Frequency**: Every 2 minutes
- **Amount Tolerance**: 0.01 USDT
- **API Rate Limit (Free)**: 10,000 requests/day

## Important Notes

1. **Security**
   - Never share your API keys or wallet private key
   - Keep `.env` files secure and never commit to git
   - Use environment variables for all sensitive data

2. **Monitoring**
   - Regularly check server logs for verification status
   - Monitor API usage to avoid rate limits
   - Review failed verifications periodically

3. **Backup Manual Option**
   - Even with auto-verification, you can manually confirm/reject investments
   - Failed auto-verifications remain pending for manual review
   - Large transactions may require manual verification for security

4. **Testing**
   - Test with small amounts first
   - Verify system works correctly before processing large investments
   - Monitor first few automatic confirmations closely

---

**Setup Complete**: Once configured, TRC20 investments will be automatically verified and confirmed within 2-4 minutes of submission. No manual intervention required.
