const Payment = require('../schemas/payment');
const Investment = require('../schemas/investment');
const User = require('../schemas/user');
const paymentGateway = require('../services/paymentGateway');
const crypto = require('crypto');

// Initiate payment gateway payment
exports.initiateGatewayPayment = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { amount, currency = 'USD', provider = 'coingate' } = req.body;

    // Validate input
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment is 10 USDT',
      });
    }

    // Get user
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate unique order ID
    const orderId = `INV-${user._id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Create payment record
    const payment = new Payment({
      userId: user._id,
      amount: parseFloat(amount),
      currency: currency,
      paymentMethod: 'gateway',
      gatewayProvider: provider,
      gatewayOrderId: orderId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
    });

    await payment.save();

    // Create payment with gateway
    const callbackUrl = `${process.env.BACKEND_URL || 'http://localhost:3500'}/api/payment/webhook/${provider}`;
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/investment?payment=success&orderId=${orderId}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/investment?payment=cancelled&orderId=${orderId}`;

    const gatewayResponse = await paymentGateway.createPayment(
      amount,
      currency,
      orderId,
      callbackUrl,
      successUrl,
      cancelUrl,
      provider
    );

    if (!gatewayResponse.success) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({
        success: false,
        message: gatewayResponse.error || 'Failed to create payment',
      });
    }

    // Update payment with gateway details
    payment.gatewayPaymentId = gatewayResponse.orderId || gatewayResponse.paymentId;
    payment.gatewayPaymentUrl = gatewayResponse.paymentUrl;
    payment.status = 'processing';
    if (gatewayResponse.expiresAt) {
      payment.expiresAt = gatewayResponse.expiresAt;
    }
    payment.paymentData = gatewayResponse.data || {};
    await payment.save();

    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: orderId,
        paymentUrl: gatewayResponse.paymentUrl,
        amount: payment.amount,
        currency: payment.currency,
        expiresAt: payment.expiresAt,
      },
    });
  } catch (error) {
    console.error('Initiate gateway payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

// Handle payment webhook
exports.handleWebhook = async (req, res) => {
  try {
    const { provider } = req.params;
    const webhookData = req.body;
    const signature = req.headers['x-signature'] || req.headers['authorization'];

    // Verify webhook signature
    const isValid = paymentGateway.verifyWebhook(webhookData, signature, provider);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Extract order ID from webhook data
    const orderId = webhookData.order_id || webhookData.orderId || webhookData.payment_id;
    const status = webhookData.status || webhookData.payment_status;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID not found' });
    }

    // Find payment record
    const payment = await Payment.findOne({ gatewayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if already processed
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Payment already processed' });
    }

    // Update payment status
    if (status === 'paid' || status === 'confirmed' || status === 'completed') {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.paymentData = webhookData;
      await payment.save();

      // Create investment automatically
      const now = new Date();
      const lockInEndDate = new Date(now);
      lockInEndDate.setDate(lockInEndDate.getDate() + 90);

      const investment = new Investment({
        userId: payment.userId,
        amount: payment.amount,
        transactionHash: `GATEWAY-${orderId}`, // Gateway payment identifier
        type: 'new',
        status: 'confirmed',
        confirmedAt: now,
        lockInEndDate: lockInEndDate,
        isAvailableForWithdrawal: false,
      });

      await investment.save();

      // Update payment with investment ID
      payment.investmentId = investment._id;
      await payment.save();

      // Update user's total investment and PlatoCoins
      const user = await User.findById(payment.userId);
      if (user) {
        user.totalInvestment = (user.totalInvestment || 0) + investment.amount;
        user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + investment.amount;
        user.platoCoins = (user.platoCoins || 0) + investment.amount;
        await user.save();

        // Handle referral activation if applicable
        if (user.referrerId && user.totalInvestment >= 10) {
          const Referral = require('../schemas/referral');
          const referral = await Referral.findOne({
            referrerId: user.referrerId,
            referredUserId: user._id,
          });

          if (referral && referral.status === 'pending') {
            referral.status = 'active';
            referral.activatedAt = new Date();
            await referral.save();

            const referrer = await User.findById(user.referrerId);
            if (referrer) {
              referrer.directActiveReferrals = (referrer.directActiveReferrals || 0) + 1;
              await referrer.save();
            }
          }
        }
      }
    } else if (status === 'failed' || status === 'expired' || status === 'cancelled') {
      payment.status = status === 'cancelled' ? 'cancelled' : 'failed';
      payment.paymentData = webhookData;
      await payment.save();
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      gatewayOrderId: orderId,
      userId: (await User.findOne({ firebaseUID }))._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // If payment is still processing, check with gateway
    if (payment.status === 'processing' || payment.status === 'pending') {
      const gatewayStatus = await paymentGateway.getPaymentStatus(
        payment.gatewayPaymentId,
        payment.gatewayProvider
      );

      if (gatewayStatus.success) {
        const gatewayStatusValue = gatewayStatus.status;
        if (gatewayStatusValue === 'paid' || gatewayStatusValue === 'confirmed') {
          payment.status = 'completed';
          payment.completedAt = new Date();
          await payment.save();
        }
      }
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.gatewayOrderId,
        amount: payment.amount,
        status: payment.status,
        paymentUrl: payment.gatewayPaymentUrl,
        investmentId: payment.investmentId,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status',
    });
  }
};

