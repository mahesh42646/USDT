# NOWPayments Integration Setup Guide

## Overview
This project is integrated with NOWPayments payment gateway for processing cryptocurrency payments. Users can invest using various cryptocurrencies which are automatically converted to USDT (TRC20).

## Configuration

### Environment Variables
The following environment variables are configured in `backend/.env`:

```env
# NOWPayments Configuration
NOWPAYMENTS_API_KEY=FPW0X8T-7WG4T0W-JZDF8DC-ZAS6K2
NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1
NOWPAYMENTS_IPN_SECRET=FPW0X8T-7WG4T0W-JZDF8DC-ZAS6K2
DEFAULT_PAYMENT_GATEWAY=nowpayments
```

**Important Notes:**
- `NOWPAYMENTS_API_KEY`: Your API key (currently set to the provided secret)
- `NOWPAYMENTS_IPN_SECRET`: IPN (Instant Payment Notification) secret key for webhook verification
  - Currently using the API key as a fallback
  - **For production, you MUST get a separate IPN secret key from your NOWPayments dashboard**
  - The IPN secret is shown only once when generated - save it immediately!

### Getting Your IPN Secret Key

1. Log in to your NOWPayments account: https://account.nowpayments.io
2. Go to **Settings** → **Payment Settings** → **Instant Payment Notifications**
3. Click **Generate IPN Secret Key** (if you haven't already)
4. **Copy and save the secret key immediately** (it's only shown once)
5. Update `NOWPAYMENTS_IPN_SECRET` in `backend/.env` with the actual IPN secret

## Webhook Configuration

### Webhook URL
Your webhook endpoint is:
- **Development**: `http://localhost:3500/api/payment/webhook/nowpayments`
- **Production**: `https://yourdomain.com/api/payment/webhook/nowpayments`

### Setting Up Webhook in NOWPayments Dashboard

1. Log in to your NOWPayments account
2. Go to **Settings** → **Payment Settings** → **Instant Payment Notifications**
3. Enter your webhook URL in the **IPN Callback URL** field
4. Make sure the IPN secret key is generated and saved
5. Save the settings

**Important:**
- NOWPayments cannot send callbacks to localhost unless it has a dedicated IP address
- For development, use a service like **ngrok** to expose your local server:
  ```bash
  ngrok http 3500
  ```
  Then use the ngrok URL (e.g., `https://abc123.ngrok.io/api/payment/webhook/nowpayments`)

### Webhook Security

The webhook endpoint verifies requests using HMAC-SHA512 signature verification:
- NOWPayments sends the signature in the `x-nowpayments-sig` header
- The webhook handler verifies this signature using your IPN secret key
- Invalid signatures are rejected with a 401 error

## Payment Flow

1. **User initiates payment** on `/user/investment` page
2. **Backend creates payment** via NOWPayments API
3. **User receives payment address** (crypto address where they should send payment)
4. **User sends cryptocurrency** to the provided address
5. **NOWPayments processes payment** and converts to USDT (TRC20)
6. **Webhook notification** is sent to your backend when payment status changes
7. **Backend automatically creates investment** when payment status is `finished`
8. **User's account is updated** with the new investment

## Payment Statuses

NOWPayments uses the following payment statuses:
- `waiting` - Waiting for customer to send payment
- `confirming` - Transaction being processed on blockchain
- `confirmed` - Transaction confirmed by blockchain
- `sending` - Funds being sent to your wallet
- `partially_paid` - Customer sent less than required amount
- `finished` - Payment completed successfully ✅
- `failed` - Payment failed
- `expired` - Payment expired (7 days)

## API Endpoints

### Create Payment
- **Endpoint**: `POST /api/payment/gateway/initiate`
- **Auth**: Required (Firebase token)
- **Body**:
  ```json
  {
    "amount": 100,
    "currency": "USD",
    "provider": "nowpayments"
  }
  ```

### Get Payment Status
- **Endpoint**: `GET /api/payment/status/:orderId`
- **Auth**: Required (Firebase token)

### Webhook Endpoint
- **Endpoint**: `POST /api/payment/webhook/nowpayments`
- **Auth**: Not required (verified by signature)
- **Headers**: `x-nowpayments-sig` (HMAC-SHA512 signature)

## Testing

### Test Payment Flow

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. For local webhook testing, use ngrok:
   ```bash
   ngrok http 3500
   ```
   Update the webhook URL in NOWPayments dashboard with the ngrok URL

4. Make a test payment:
   - Go to `/user/investment`
   - Select "Payment Gateway"
   - Enter amount (minimum 10 USDT)
   - Click "Invest via Payment Gateway"
   - You'll receive a payment address
   - Send test cryptocurrency to that address
   - Wait for webhook notification

### Testing Webhook Locally

You can test webhook signature verification using the Node.js example from NOWPayments documentation:

```javascript
const crypto = require('crypto');

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object') 
      ? sortObject(obj[key]) 
      : obj[key];
    return result;
  }, {});
}

const ipnSecret = 'your_ipn_secret_here';
const webhookData = { /* your webhook data */ };
const sortedData = sortObject(webhookData);
const sortedJson = JSON.stringify(sortedData);

const hmac = crypto.createHmac('sha512', ipnSecret);
hmac.update(sortedJson);
const signature = hmac.digest('hex');

console.log('Expected signature:', signature);
```

## Troubleshooting

### Webhook Not Receiving Notifications

1. **Check webhook URL** in NOWPayments dashboard
2. **Verify IPN secret** is correct in `.env`
3. **Check server logs** for webhook errors
4. **Ensure firewall** allows NOWPayments IP addresses (contact support@nowpayments.io for IP list)
5. **Test webhook endpoint** manually using Postman or curl

### Payment Status Not Updating

1. Check payment status manually via API:
   ```bash
   curl -X GET "https://api.nowpayments.io/v1/payment/{payment_id}" \
     -H "x-api-key: YOUR_API_KEY"
   ```

2. Check webhook logs in backend console
3. Verify webhook signature verification is working

### Signature Verification Failing

1. Ensure IPN secret is correct
2. Check that webhook data is being sorted correctly
3. Verify HMAC-SHA512 is being used (not SHA256)
4. Check that `x-nowpayments-sig` header is being read correctly

## Production Checklist

- [ ] Get separate IPN secret key from NOWPayments dashboard
- [ ] Update `NOWPAYMENTS_IPN_SECRET` in production `.env`
- [ ] Configure webhook URL in NOWPayments dashboard (production URL)
- [ ] Test webhook with real payment
- [ ] Whitelist NOWPayments IP addresses in firewall (if applicable)
- [ ] Monitor webhook logs for errors
- [ ] Set up error alerts for failed webhooks

## Support

- NOWPayments Documentation: https://documenter.getpostman.com/view/7907941/2s93JusNJt
- NOWPayments Support: support@nowpayments.io
- NOWPayments Dashboard: https://account.nowpayments.io

## Security Notes

1. **Never commit** `.env` file to version control
2. **Use separate IPN secret** for production (not API key)
3. **Always verify webhook signatures** before processing
4. **Use HTTPS** for production webhook URLs
5. **Monitor webhook logs** for suspicious activity
6. **Rotate API keys** periodically if compromised
