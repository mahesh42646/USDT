# Payment Gateway Setup Guide

This guide will help you set up USDT payment gateway integration for the GroandInvest platform.

## Supported Payment Gateways

1. **CoinGate** (Recommended) - Supports USDT and card payments
2. **NOWPayments** - Alternative gateway option

## Setup Instructions

### 1. CoinGate Setup

1. **Create Account**
   - Go to [CoinGate.com](https://coingate.com)
   - Sign up for a merchant account
   - Complete KYC verification

2. **Get API Credentials**
   - Log in to CoinGate dashboard
   - Go to **Settings** → **API**
   - Create a new API token
   - Copy the API token

3. **Configure Environment Variables**
   Add to `backend/.env`:
   ```env
   COINGATE_API_KEY=your_coingate_api_key_here
   COINGATE_API_URL=https://api.coingate.com/v2
   DEFAULT_PAYMENT_GATEWAY=coingate
   BACKEND_URL=http://localhost:3500
   ```

4. **Set Webhook URL**
   - In CoinGate dashboard, go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook/coingate`
   - For local testing: Use ngrok or similar tool to expose localhost

### 2. NOWPayments Setup (Alternative)

1. **Create Account**
   - Go to [NOWPayments.io](https://nowpayments.io)
   - Sign up and complete verification

2. **Get API Key**
   - Go to **API Settings**
   - Generate API key
   - Copy the API key

3. **Configure Environment Variables**
   Add to `backend/.env`:
   ```env
   NOWPAYMENTS_API_KEY=your_nowpayments_api_key_here
   NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1
   DEFAULT_PAYMENT_GATEWAY=nowpayments
   ```

### 3. Environment Variables Summary

Add these to your `backend/.env` file:

```env
# Payment Gateway Configuration
COINGATE_API_KEY=your_coingate_api_key
COINGATE_API_URL=https://api.coingate.com/v2
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1
DEFAULT_PAYMENT_GATEWAY=coingate

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:3500

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## Payment Flow

1. **User Initiates Payment**
   - User selects "Payment Gateway" method
   - Enters investment amount
   - Clicks "Pay with Gateway"

2. **Payment Gateway Opens**
   - User is redirected to payment gateway
   - Can pay with card, bank transfer, or crypto
   - Payment is converted to USDT automatically

3. **Payment Confirmation**
   - Gateway sends webhook to backend
   - Backend verifies payment
   - Investment is automatically created and confirmed
   - User receives PlatoCoins (1:1 ratio)

4. **User Redirected**
   - User is redirected back to investment page
   - Success message displayed
   - Investment appears in history

## Testing

### Test Mode
- CoinGate and NOWPayments both support test/sandbox mode
- Use test API keys for development
- Test payments won't charge real money

### Webhook Testing
- Use tools like ngrok to expose localhost for webhook testing
- Or use services like webhook.site for testing

## Security Notes

1. **Never commit API keys to git**
2. **Use environment variables for all sensitive data**
3. **Verify webhook signatures** (implemented in code)
4. **Use HTTPS in production**
5. **Monitor payment logs regularly**

## Support

For issues or questions:
- CoinGate Support: support@coingate.com
- NOWPayments Support: support@nowpayments.io
- Check gateway documentation for latest API changes

