const axios = require('axios');

// CoinGate Payment Gateway Integration
class CoinGateService {
  constructor() {
    this.apiKey = process.env.COINGATE_API_KEY;
    this.apiUrl = process.env.COINGATE_API_URL || 'https://api.coingate.com/v2';
    this.appId = process.env.COINGATE_APP_ID;
  }

  // Create a payment order
  async createOrder(amount, currency, orderId, callbackUrl, successUrl, cancelUrl) {
    try {
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

  // Get order status
  async getOrderStatus(orderId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
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

  // Verify webhook signature
  verifyWebhook(data, signature) {
    // CoinGate webhook verification logic
    // This should be implemented based on CoinGate's webhook documentation
    return true; // Placeholder - implement actual verification
  }
}

// NOWPayments Payment Gateway Integration
class NOWPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.apiUrl = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
  }

  async createPayment(amount, currency, orderId, callbackUrl, successUrl) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payment`,
        {
          price_amount: amount,
          price_currency: currency,
          pay_currency: 'USDTTRC20',
          order_id: orderId,
          order_description: `Investment payment for order ${orderId}`,
          ipn_callback_url: callbackUrl,
          success_url: successUrl,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        paymentId: response.data.payment_id,
        paymentUrl: response.data.invoice_url || response.data.pay_url,
        status: response.data.payment_status,
        data: response.data,
      };
    } catch (error) {
      console.error('NOWPayments create payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payment/${paymentId}`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
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
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

// Main Payment Gateway Service
class PaymentGatewayService {
  constructor() {
    this.coingate = new CoinGateService();
    this.nowpayments = new NOWPaymentsService();
    this.defaultProvider = process.env.DEFAULT_PAYMENT_GATEWAY || 'coingate';
  }

  // Create payment based on provider
  async createPayment(amount, currency, orderId, callbackUrl, successUrl, cancelUrl, provider = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case 'coingate':
        return await this.coingate.createOrder(amount, currency, orderId, callbackUrl, successUrl, cancelUrl);
      case 'nowpayments':
        return await this.nowpayments.createPayment(amount, currency, orderId, callbackUrl, successUrl);
      default:
        return {
          success: false,
          error: 'Invalid payment gateway provider',
        };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId, provider = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case 'coingate':
        return await this.coingate.getOrderStatus(paymentId);
      case 'nowpayments':
        return await this.nowpayments.getPaymentStatus(paymentId);
      default:
        return {
          success: false,
          error: 'Invalid payment gateway provider',
        };
    }
  }

  // Verify webhook
  verifyWebhook(data, signature, provider = null) {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case 'coingate':
        return this.coingate.verifyWebhook(data, signature);
      case 'nowpayments':
        return true; // Implement NOWPayments webhook verification
      default:
        return false;
    }
  }
}

module.exports = new PaymentGatewayService();

