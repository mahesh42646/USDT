# Payment Gateway Setup Guide

This guide will help you set up payment gateway integration for the GroandInvest platform.

## Supported Payment Gateways

1. **Generic Payment Gateway** (Primary) - Supports most payment gateway APIs
2. **CoinGate** (Alternative) - Supports USDT and card payments
3. **NOWPayments** (Alternative) - Alternative gateway option

## Setup Instructions

### 1. Generic Payment Gateway Setup (Recommended)

1. **Get API Credentials**
   - Sign up with your payment gateway provider
   - Get your API Key and API Secret
   - Get your Webhook Secret for secure webhook verification

2. **Configure Environment Variables**
   Add to `backend/.env`:
   ```env
   # Primary Payment Gateway
   PAYMENT_GATEWAY_API_KEY=your_api_key_here
   PAYMENT_GATEWAY_API_SECRET=your_api_secret_here
   PAYMENT_GATEWAY_API_URL=https://api.paymentgateway.com/v1
   PAYMENT_GATEWAY_WEBHOOK_SECRET=your_webhook_secret_here
   DEFAULT_PAYMENT_GATEWAY=generic
   ```

3. **Set Webhook URL**
   - In your payment gateway dashboard, configure webhook URL:
   - Production: `https://yourdomain.com/api/payment/webhook/generic`
   - Development: Use ngrok or similar tool to expose localhost

### 2. CoinGate Setup (Alternative)

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
   ```

### 3. NOWPayments Setup (Alternative)

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

## Environment Variables Summary

Add these to your `backend/.env` file:

```env
# Payment Gateway Configuration (Primary)
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_api_key
PAYMENT_GATEWAY_API_SECRET=your_payment_gateway_api_secret
PAYMENT_GATEWAY_API_URL=https://api.paymentgateway.com/v1
PAYMENT_GATEWAY_WEBHOOK_SECRET=your_webhook_secret
DEFAULT_PAYMENT_GATEWAY=generic

# Alternative Gateways
COINGATE_API_KEY=your_coingate_api_key
COINGATE_API_URL=https://api.coingate.com/v2
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:3500

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong API secrets** - Generate secure random strings
3. **Enable webhook signature verification** - Always verify webhook signatures
4. **Use HTTPS in production** - All webhook URLs must use HTTPS
5. **Rotate API keys regularly** - Change API keys periodically
6. **Monitor webhook logs** - Check for suspicious activity

## Payment Flow

1. User initiates payment on investment page
2. Backend creates payment order with gateway
3. User is redirected to payment gateway
4. User completes payment
5. Gateway sends webhook to backend
6. Backend verifies webhook signature
7. Backend creates investment automatically
8. User is redirected back to investment page

## Testing

1. Use sandbox/test mode for development
2. Test with small amounts first
3. Verify webhook handling
4. Test payment cancellation flow
5. Test payment failure scenarios

## Troubleshooting

### Payment not processing
- Check API key is correct
- Verify webhook URL is accessible
- Check backend logs for errors
- Verify API endpoint URLs

### Webhook not received
- Check webhook URL is correct in gateway dashboard
- Verify webhook signature verification
- Check firewall/network settings
- Use ngrok for local testing

### Payment status not updating
- Check payment status polling
- Verify webhook is being processed
- Check database for payment records
- Review backend logs

## Support

For payment gateway specific issues, refer to:
- Your payment gateway's API documentation
- Payment gateway support team
- Backend logs for detailed error messages
