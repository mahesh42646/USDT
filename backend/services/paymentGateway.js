const axios = require('axios');
const crypto = require('crypto');

// Generic Payment Gateway Integration (Based on common payment gateway patterns)
class PaymentGatewayService {
  constructor() {
    this.apiKey = process.env.PAYMENT_GATEWAY_API_KEY;
    this.apiSecret = process.env.PAYMENT_GATEWAY_API_SECRET;
    this.apiUrl = process.env.PAYMENT_GATEWAY_API_URL || 'https://api.paymentgateway.com/v1';
    this.webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;
  }

  // Create payment order
  async createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl) {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Payment gateway API key is not configured');
      }

      // Prepare request payload
      const payload = {
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        order_id: orderId,
        callback_url: callbackUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        description: `Investment payment for order ${orderId}`,
        metadata: {
          orderId: orderId,
          type: 'investment',
        },
      };

      // Generate signature for request (if required by gateway)
      const timestamp = Date.now();
      const signature = this.generateSignature(payload, timestamp);

      const response = await axios.post(
        `${this.apiUrl}/payments/create`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data && response.data.success !== false) {
        return {
          success: true,
          orderId: response.data.order_id || response.data.id || orderId,
          paymentId: response.data.payment_id || response.data.id,
          paymentUrl: response.data.payment_url || response.data.url || response.data.checkout_url,
          status: response.data.status || 'pending',
          expiresAt: response.data.expires_at ? new Date(response.data.expires_at) : new Date(Date.now() + 30 * 60 * 1000),
          data: response.data,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment gateway create payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create payment',
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      if (!this.apiKey) {
        throw new Error('Payment gateway API key is not configured');
      }

      const timestamp = Date.now();
      const signature = this.generateSignature({ paymentId }, timestamp);

      const response = await axios.get(
        `${this.apiUrl}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
          },
          timeout: 15000,
        }
      );

      if (response.data) {
        return {
          success: true,
          status: response.data.status || response.data.payment_status,
          data: response.data,
        };
      } else {
        throw new Error('Invalid response from payment gateway');
      }
    } catch (error) {
      console.error('Payment gateway get status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get payment status',
      };
    }
  }

  // Verify webhook signature
  verifyWebhook(data, signature, timestamp) {
    try {
      if (!this.webhookSecret) {
        console.warn('Webhook secret not configured, skipping verification');
        return true; // Allow if no secret configured (for development)
      }

      // Create signature string
      const payloadString = JSON.stringify(data);
      const signatureString = `${timestamp}.${payloadString}`;

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signatureString)
        .digest('hex');

      // Compare signatures
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  // Generate request signature
  generateSignature(payload, timestamp) {
    if (!this.apiSecret) {
      return ''; // Return empty if no secret configured
    }

    const payloadString = JSON.stringify(payload);
    const signatureString = `${timestamp}.${payloadString}`;

    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureString)
      .digest('hex');
  }
}

// CoinGate Payment Gateway Integration (Legacy support)
class CoinGateService {
  constructor() {
    this.apiKey = process.env.COINGATE_API_KEY;
    this.apiUrl = process.env.COINGATE_API_URL || 'https://api.coingate.com/v2';
  }

  async createOrder(amount, currency, orderId, callbackUrl, successUrl, cancelUrl) {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'CoinGate API key is not configured' };
      }

      const response = await axios.post(
        `${this.apiUrl}/orders`,
        {
          order_id: orderId,
          price_amount: amount,
          price_currency: currency,
          receive_currency: 'USDT',
          receive_amount: amount,
          title: `Investment of ${amount} ${currency}`,
          description: `Investment payment for order ${orderId}`,
          callback_url: callbackUrl,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return {
        success: true,
        orderId: response.data.id,
        paymentUrl: response.data.payment_url,
        status: response.data.status,
        expiresAt: response.data.expires_at ? new Date(response.data.expires_at) : null,
        data: response.data,
      };
    } catch (error) {
      console.error('CoinGate create order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getOrderStatus(orderId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      console.error('CoinGate get order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  verifyWebhook(data, signature) {
    // CoinGate webhook verification
    // Implement based on CoinGate's documentation
    return true;
  }
}

// NOWPayments Payment Gateway Integration
class NOWPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || process.env.NOWPAYMENTS_API_KEY; // Use API key as fallback if IPN secret not set
    this.apiUrl = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
    this.minAmount = 9.69; // NOWPayments minimum (exact minimum for testing)
    this.minAmountCache = null;
    this.minAmountCacheTime = null;
  }

  // Get minimum payment amount from NOWPayments
  async getMinimumAmount() {
    try {
      // Cache for 1 hour
      if (this.minAmountCache && this.minAmountCacheTime && (Date.now() - this.minAmountCacheTime) < 3600000) {
        return this.minAmountCache;
      }

      const response = await axios.get(
        `${this.apiUrl}/min-amount?currency_from=usdttrc20&currency_to=usdttrc20`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.min_amount) {
        // Use exact minimum for testing (no buffer)
        // NOWPayments minimum already accounts for network fees
        const minAmount = parseFloat(response.data.min_amount);
        this.minAmountCache = minAmount;
        this.minAmountCacheTime = Date.now();
        return minAmount;
      }
    } catch (error) {
      console.warn('Failed to fetch minimum amount from NOWPayments, using default:', error.message);
    }
    
    // Return cached or default minimum
    return this.minAmountCache || this.minAmount;
  }

  async createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl) {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'NOWPayments API key is not configured' };
      }

      // NOWPayments: Use invoice method for better web interface experience
      // User enters USDT amount directly
      const usdtAmount = parseFloat(amount);
      
      // Create invoice first - this provides a web interface
      const invoiceResponse = await axios.post(
        `${this.apiUrl}/invoice`,
        {
          price_amount: usdtAmount,
          price_currency: 'usd', // Use USD as base currency
          pay_currency: 'usdttrc20', // User will pay in USDT TRC20
          order_id: orderId,
          order_description: `Investment payment for order ${orderId}`,
          ipn_callback_url: callbackUrl,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      // Invoice returns invoice_url which provides web interface
      // The invoice_url will show payment options with USDT TRC20 pre-selected
      return {
        success: true,
        orderId: orderId,
        paymentId: invoiceResponse.data.id || invoiceResponse.data.invoice_id,
        invoiceId: invoiceResponse.data.id, // Store invoice ID for reference
        paymentUrl: invoiceResponse.data.invoice_url, // Web interface URL
        payAddress: null, // Not needed for invoice method
        payAmount: usdtAmount,
        payCurrency: invoiceResponse.data.pay_currency || 'usdttrc20',
        status: 'waiting',
        expiresAt: invoiceResponse.data.updated_at ? new Date(invoiceResponse.data.updated_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        data: invoiceResponse.data,
      };
    } catch (error) {
      console.error('NOWPayments create payment error:', error.response?.data || error.message);
      console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
      
      // Extract detailed error message
      let errorMessage = 'Failed to create payment';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'NOWPayments API key is not configured' };
      }

      const response = await axios.get(
        `${this.apiUrl}/payment/${paymentId}`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        status: response.data.payment_status,
        data: response.data,
      };
    } catch (error) {
      console.error('NOWPayments get payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to get payment status',
      };
    }
  }

  verifyWebhook(data, signature) {
    try {
      if (!this.ipnSecret) {
        console.warn('NOWPayments IPN secret not configured, skipping verification');
        return true; // Allow if no secret configured (for development)
      }

      // NOWPayments uses HMAC-SHA512 (not SHA256)
      // Sort the data object by keys and convert to JSON string
      const sortObject = (obj) => {
        return Object.keys(obj)
          .sort()
          .reduce((result, key) => {
            result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key];
            return result;
          }, {});
      };

      const sortedData = sortObject(data);
      const sortedJson = JSON.stringify(sortedData);

      // Generate HMAC-SHA512 signature
      const hmac = crypto.createHmac('sha512', this.ipnSecret);
      hmac.update(sortedJson);
      const expectedSignature = hmac.digest('hex');

      // Compare signatures (use timing-safe comparison)
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('NOWPayments webhook verification error:', error);
      return false;
    }
  }
}

// Main Payment Gateway Service Router
class PaymentGatewayRouter {
  constructor() {
    this.genericGateway = new PaymentGatewayService();
    this.coingate = new CoinGateService();
    this.nowpayments = new NOWPaymentsService();
    this.defaultProvider = process.env.DEFAULT_PAYMENT_GATEWAY || 'generic';
  }

  async createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl, provider = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider.toLowerCase()) {
      case 'generic':
      case 'paymentgateway':
        return await this.genericGateway.createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl);
      case 'coingate':
        return await this.coingate.createOrder(amount, currency, orderId, callbackUrl, successUrl, cancelUrl);
      case 'nowpayments':
        return await this.nowpayments.createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl);
      default:
        // Try generic gateway as fallback
        return await this.genericGateway.createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl);
    }
  }

  async getPaymentStatus(paymentId, provider = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider.toLowerCase()) {
      case 'generic':
      case 'paymentgateway':
        return await this.genericGateway.getPaymentStatus(paymentId);
      case 'coingate':
        return await this.coingate.getOrderStatus(paymentId);
      case 'nowpayments':
        return await this.nowpayments.getPaymentStatus(paymentId);
      default:
        return await this.genericGateway.getPaymentStatus(paymentId);
    }
  }

  verifyWebhook(data, signature, provider = null, timestamp = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider.toLowerCase()) {
      case 'generic':
      case 'paymentgateway':
        return this.genericGateway.verifyWebhook(data, signature, timestamp);
      case 'coingate':
        return this.coingate.verifyWebhook(data, signature);
      case 'nowpayments':
        return this.nowpayments.verifyWebhook(data, signature);
      default:
        return this.genericGateway.verifyWebhook(data, signature, timestamp);
    }
  }
}

module.exports = new PaymentGatewayRouter();
