const paymentIntentService = require('../services/paymentIntentService');
const User = require('../schemas/user');

/**
 * Create payment intent with HD wallet derived address
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { usdAmount, currency = 'USDT', convertedAmount } = req.body;

    // Validate USD amount
    const minUSD = 1;
    if (!usdAmount || usdAmount < minUSD) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is $${minUSD} USD`,
      });
    }

    // Validate currency - Only USDT supported
    if (currency !== 'USDT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Only USDT (TRC20) is supported.',
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

    // Create payment intent
    const result = await paymentIntentService.createPaymentIntent({
      userId: user._id,
      usdAmount: parseFloat(usdAmount),
      currency: currency,
      convertedAmount: convertedAmount ? parseFloat(convertedAmount) : null,
      expiresInMinutes: 15,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create payment intent',
      });
    }

    res.json({
      success: true,
      payment: result.paymentIntent,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
};

/**
 * Get payment intent status
 */
exports.getPaymentIntentStatus = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { orderId } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const intent = await paymentIntentService.getPaymentIntent(orderId, user._id);
    
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found',
      });
    }

    res.json({
      success: true,
      payment: {
        id: intent._id,
        orderId: intent._id.toString(),
        derivedAddress: intent.derivedAddress,
        usdAmount: intent.usdAmount,
        amountReceived: intent.amountReceived,
        status: intent.status,
        txHash: intent.txHash,
        investmentId: intent.investmentId,
        expiresAt: intent.expiresAt,
        createdAt: intent.createdAt,
        paidAt: intent.paidAt,
      },
    });
  } catch (error) {
    console.error('Get payment intent status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status',
    });
  }
};
