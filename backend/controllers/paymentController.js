const Payment = require('../schemas/payment');
const Investment = require('../schemas/investment');
const User = require('../schemas/user');
const trc20PaymentService = require('../services/trc20PaymentService');
const trc20VerificationService = require('../services/trc20VerificationService');
const currencyConverter = require('../services/currencyConverter');
const crypto = require('crypto');

// Initiate payment with currency conversion (USD input, pay in any currency)
exports.initiateTRC20Payment = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { usdAmount, paymentCurrency = 'TRX' } = req.body; // USD amount, payment currency

    // Validate USD amount input
    const minUSD = 1; // Minimum $1 USD investment
    if (!usdAmount || usdAmount < minUSD) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is $${minUSD} USD`,
      });
    }

    // Convert USD to payment currency
    const conversion = await currencyConverter.convertUSDToCurrency(usdAmount, paymentCurrency);
    if (!conversion.success) {
      return res.status(400).json({
        success: false,
        message: `Failed to convert USD to ${paymentCurrency}: ${conversion.error}`,
      });
    }

    const amount = conversion.amount; // Amount in payment currency
    const currency = paymentCurrency;

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
    // Store both USD amount (for investment) and payment currency amount
    const paymentAmount = parseFloat(parseFloat(amount).toFixed(8)); // Payment amount in selected currency
    const usdAmountExact = parseFloat(parseFloat(usdAmount).toFixed(2)); // Investment amount in USD
    
    const payment = new Payment({
      userId: user._id,
      amount: paymentAmount, // Amount in payment currency (e.g., TRX)
      usdAmount: usdAmountExact, // Original USD amount for investment
      currency: currency, // Payment currency (TRX, USDT, etc.)
      paymentMethod: 'trc20',
      gatewayOrderId: orderId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      conversionRate: conversion.rate, // Store conversion rate for reference
    });

    await payment.save();

    // Generate QR code for payment
    const qrCodeResult = await trc20PaymentService.generateQRCode({
      amount: payment.amount, // Amount in payment currency
      currency: payment.currency, // Payment currency
      orderId: orderId,
    });

    if (!qrCodeResult.success) {
      payment.status = 'failed';
      await payment.save();
      return res.status(500).json({
        success: false,
        message: qrCodeResult.error || 'Failed to generate payment QR code',
      });
    }

    // Update payment with QR code data
    payment.paymentData = {
      qrCode: qrCodeResult.qrCode,
      paymentUri: qrCodeResult.paymentUri,
      paymentAddress: qrCodeResult.paymentAddress,
    };
    await payment.save();

    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: orderId,
        amount: payment.amount, // Amount in payment currency
        currency: payment.currency, // Payment currency
        usdAmount: payment.usdAmount, // Original USD amount
        conversionRate: conversion.rate,
        qrCode: qrCodeResult.qrCode,
        paymentAddress: qrCodeResult.paymentAddress,
        paymentUri: qrCodeResult.paymentUri,
        expiresAt: payment.expiresAt,
      },
    });
  } catch (error) {
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
    
    // NOWPayments uses x-nowpayments-sig header, others may use different headers
    let signature = null;
    let timestamp = null;
    
    if (provider === 'nowpayments') {
      signature = req.headers['x-nowpayments-sig'];
    } else {
      signature = req.headers['x-signature'] || req.headers['x-api-signature'] || req.headers['authorization'];
      timestamp = req.headers['x-timestamp'] || Date.now();
    }

    // Verify webhook signature
    const isValid = paymentGateway.verifyWebhook(webhookData, signature, provider, timestamp);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Extract order ID from webhook data (support multiple formats)
    // NOWPayments uses order_id, payment_id, or purchase_id
    const orderId = webhookData.order_id || webhookData.orderId || webhookData.payment_id || webhookData.purchase_id || webhookData.id;
    // NOWPayments uses payment_status, others may use status or state
    const status = webhookData.payment_status || webhookData.status || webhookData.state;

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

    // Update payment status (support multiple status formats)
    // NOWPayments statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, expired
    // Other gateways: pending, paid, confirmed, completed, success, successful
    if (status === 'finished' || status === 'paid' || status === 'confirmed' || status === 'completed' || status === 'success' || status === 'successful') {
      
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.paymentData = webhookData;
      await payment.save();

      // Check if investment already exists (prevent duplicates)
      if (!payment.investmentId) {
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
          const oldTotal = user.totalInvestment || 0;
          user.totalInvestment = oldTotal + investment.amount;
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
      } else {
      }
    } else if (status === 'failed' || status === 'expired' || status === 'cancelled') {
      payment.status = status === 'cancelled' ? 'cancelled' : 'failed';
      payment.paymentData = webhookData;
      await payment.save();
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment status and check for TRC20 transaction
exports.getPaymentStatus = async (req, res) => {
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

    const payment = await Payment.findOne({
      gatewayOrderId: orderId,
      userId: user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // If payment is pending, check for TRC20 transaction
    if (payment.status === 'pending' && payment.paymentMethod === 'trc20') {
      const Payment = require('../schemas/payment');
      const Investment = require('../schemas/investment');
      
      // CRITICAL: Get ALL recent transactions and match to correct payment
      const timeWindow = 20 * 60 * 1000; // 20 minutes
      const cutoffTime = new Date(Date.now() - timeWindow);
      
      // Get all pending payments within time window
      const pendingPayments = await Payment.find({
        status: 'pending',
        paymentMethod: 'trc20',
        createdAt: { $gte: cutoffTime },
      }).sort({ createdAt: -1 });
      
      // Get all recent transactions to admin wallet
      const allTransactions = await trc20PaymentService.getAllRecentTransactions();
      
      // Match each transaction to the correct payment
      for (const tx of allTransactions) {
        const txHash = tx.transactionHash;
        const txTimestamp = tx.timestamp;
        const senderAddress = tx.from;
        
        // Skip if transaction already used
        const alreadyUsed = await Payment.findOne({ 
          transactionHash: txHash, 
          status: 'completed'
        }) || await Investment.findOne({ transactionHash: txHash });
        
        if (alreadyUsed) continue;
        
        // CRITICAL SECURITY: Match ONLY by sender address - NO time-based guessing
        // This is the ONLY secure way - whoever's wallet sent the payment gets it
        let matchedPayment = null;
        
        // Step 1: Find which user actually paid by matching sender address to registered wallet
        const USDTWallet = require('../schemas/usdtWallet');
        const walletWithSender = await USDTWallet.findOne({ 
          walletAddress: { $regex: new RegExp(`^${senderAddress}$`, 'i') }
        });
        
        if (walletWithSender) {
          // Found user who paid - find their pending payment within time window
          for (const pendingPayment of pendingPayments) {
            if (pendingPayment.userId.toString() === walletWithSender.userId.toString()) {
              const paymentStart = new Date(pendingPayment.createdAt).getTime();
              const paymentEnd = paymentStart + timeWindow;
              
              // Transaction must be within this payment's time window
              if (txTimestamp >= paymentStart && txTimestamp <= paymentEnd) {
                matchedPayment = pendingPayment;
                break; // Found exact match - user who paid
              }
            }
          }
        }
        
        // SECURITY: If no sender address match, we CANNOT assign (too risky)
        // Payment stays pending until:
        // 1. User registers their wallet address in profile, OR
        // 2. Admin manually verifies and assigns
        
        // If found matching payment, assign transaction to it
        if (matchedPayment) {
          const actualPaidAmount = tx.amount;
          
          matchedPayment.status = 'completed';
          matchedPayment.completedAt = new Date();
          matchedPayment.transactionHash = txHash;
          matchedPayment.senderAddress = senderAddress;
          matchedPayment.paymentData = {
            ...matchedPayment.paymentData,
            verification: {
              valid: true,
              amount: actualPaidAmount,
              from: senderAddress,
              to: tx.to,
              transactionHash: txHash,
              timestamp: txTimestamp,
            },
          };
          await matchedPayment.save();
          
          // If this is the current payment being checked, update reference
          if (matchedPayment._id.toString() === payment._id.toString()) {
            payment = matchedPayment;
          }
        }
      }
      
      // Reload payment to get updated status
      await payment.populate('userId');
      const updatedPayment = await Payment.findById(payment._id);

      // Create investment if payment is completed
      if (updatedPayment.status === 'completed' && !updatedPayment.investmentId) {
        const now = new Date();
        const lockInEndDate = new Date(now);
        lockInEndDate.setDate(lockInEndDate.getDate() + 90);

        const actualPaidAmount = updatedPayment.paymentData?.verification?.amount || updatedPayment.amount;
        
        // Calculate USD investment based on actual paid amount
        const investmentAmountUSD = updatedPayment.conversionRate 
          ? actualPaidAmount / updatedPayment.conversionRate 
          : updatedPayment.usdAmount;

        const investment = new Investment({
          userId: updatedPayment.userId,
          amount: investmentAmountUSD,
          transactionHash: updatedPayment.transactionHash,
          type: 'new',
          status: 'confirmed',
          confirmedAt: now,
          lockInEndDate: lockInEndDate,
          isAvailableForWithdrawal: false,
          paymentCurrency: updatedPayment.currency,
          paymentAmount: actualPaidAmount,
        });

        await investment.save();
        updatedPayment.investmentId = investment._id;
        await updatedPayment.save();

        // Update user balance
        const updatedUser = await User.findById(updatedPayment.userId);
        if (updatedUser) {
          updatedUser.totalInvestment = (updatedUser.totalInvestment || 0) + investmentAmountUSD;
          updatedUser.currentInvestmentBalance = (updatedUser.currentInvestmentBalance || 0) + investmentAmountUSD;
          updatedUser.platoCoins = (updatedUser.platoCoins || 0) + investmentAmountUSD;
          await updatedUser.save();

          // Handle referral activation
          if (updatedUser.referrerId && updatedUser.totalInvestment >= 10) {
            const Referral = require('../schemas/referral');
            const referral = await Referral.findOne({
              referrerId: updatedUser.referrerId,
              referredUserId: updatedUser._id,
            });

            if (referral && referral.status === 'pending') {
              referral.status = 'active';
              referral.activatedAt = new Date();
              await referral.save();

              const referrer = await User.findById(updatedUser.referrerId);
              if (referrer) {
                referrer.directActiveReferrals = (referrer.directActiveReferrals || 0) + 1;
                await referrer.save();
              }
            }
          }
        }
      }
    }

    // Get actual paid amount from verification if available
    const actualPaidAmount = payment.paymentData?.verification?.amount || payment.amount;
    const expectedAmount = payment.amount;
    const amountDiff = Math.abs(actualPaidAmount - expectedAmount);
    const tolerance = 0.01;
    const isWrongAmount = amountDiff > tolerance && payment.conversionRate;
    
    // Calculate actual USD investment
    let actualUSDInvestment = payment.usdAmount;
    if (isWrongAmount) {
      actualUSDInvestment = actualPaidAmount / payment.conversionRate;
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.gatewayOrderId,
        amount: actualPaidAmount, // ACTUAL paid amount (not expected)
        expectedAmount: expectedAmount, // Expected amount for comparison
        usdAmount: actualUSDInvestment, // ACTUAL USD investment (adjusted if wrong amount)
        originalUsdAmount: payment.usdAmount, // Original expected USD amount
        currency: payment.currency, // Payment currency
        conversionRate: payment.conversionRate, // Conversion rate
        status: payment.status,
        qrCode: payment.paymentData?.qrCode,
        paymentAddress: payment.paymentData?.paymentAddress,
        transactionHash: payment.transactionHash,
        investmentId: payment.investmentId,
        expiresAt: payment.expiresAt,
        isWrongAmount: isWrongAmount, // Flag to indicate wrong amount was paid
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status',
    });
  }
};

// Verify user-submitted transaction hash and process payment
exports.verifyUserTransaction = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { orderId, transactionHash } = req.body;

    if (!orderId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction hash are required',
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

    // Find payment record
    const payment = await Payment.findOne({
      gatewayOrderId: orderId,
      userId: user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check if payment already completed
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        payment: {
          id: payment._id,
          orderId: payment.gatewayOrderId,
          status: payment.status,
          transactionHash: payment.transactionHash,
        },
      });
    }

    // Check if transaction hash already used by another payment
    const Investment = require('../schemas/investment');
    const existingPayment = await Payment.findOne({
      transactionHash: transactionHash,
      status: 'completed',
      _id: { $ne: payment._id },
    });

    const existingInvestment = await Investment.findOne({
      transactionHash: transactionHash,
    });

    if (existingPayment || existingInvestment) {
      return res.status(400).json({
        success: false,
        message: 'This transaction hash has already been used by another payment',
      });
    }

    // Verify transaction on blockchain
    const trc20PaymentService = require('../services/trc20PaymentService');
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS || 'TGxinWnWkaczv8kCGe13Q81NMDcd5qtr8d';
    
    // Verify transaction (accepts any amount)
    const verification = await trc20PaymentService.verifyTransaction(
      transactionHash,
      0, // Accept any amount
      adminWallet,
      payment.currency || 'TRX'
    );

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error || 'Transaction verification failed',
        details: verification,
      });
    }

    // Verify transaction is to admin wallet
    const transferTo = verification.to || '';
    if (transferTo.toLowerCase() !== adminWallet.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not sent to the correct admin wallet address',
      });
    }

    // Transaction verified - process payment
    const actualPaidAmount = verification.amount || verification.receivedAmount || 0;
    
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.transactionHash = transactionHash;
    payment.senderAddress = verification.from || '';
    payment.paymentData = {
      ...payment.paymentData,
      verification: verification,
    };
    await payment.save();

    // Create investment
    if (!payment.investmentId) {
      const now = new Date();
      const lockInEndDate = new Date(now);
      lockInEndDate.setDate(lockInEndDate.getDate() + 90);

      // Calculate USD investment based on actual paid amount
      const investmentAmountUSD = payment.conversionRate 
        ? actualPaidAmount / payment.conversionRate 
        : payment.usdAmount;

      const investment = new Investment({
        userId: payment.userId,
        amount: investmentAmountUSD,
        transactionHash: transactionHash,
        type: 'new',
        status: 'confirmed',
        confirmedAt: now,
        lockInEndDate: lockInEndDate,
        isAvailableForWithdrawal: false,
        paymentCurrency: payment.currency,
        paymentAmount: actualPaidAmount,
      });

      await investment.save();
      payment.investmentId = investment._id;
      await payment.save();

      // Update user balance
      user.totalInvestment = (user.totalInvestment || 0) + investmentAmountUSD;
      user.currentInvestmentBalance = (user.currentInvestmentBalance || 0) + investmentAmountUSD;
      user.platoCoins = (user.platoCoins || 0) + investmentAmountUSD;
      await user.save();

      // Handle referral activation
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

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      payment: {
        id: payment._id,
        orderId: payment.gatewayOrderId,
        amount: actualPaidAmount,
        currency: payment.currency,
        usdAmount: payment.conversionRate ? actualPaidAmount / payment.conversionRate : payment.usdAmount,
        status: payment.status,
        transactionHash: transactionHash,
        investmentId: payment.investmentId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify transaction',
    });
  }
};
