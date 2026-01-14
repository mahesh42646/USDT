const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const currencyConverter = require('../services/currencyConverter');

// Get currency conversion rate
router.post('/convert', verifyFirebaseToken, async (req, res) => {
  try {
    const { usdAmount, currency } = req.body;
    
    if (!usdAmount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'USD amount and currency are required',
      });
    }

    const conversion = await currencyConverter.convertUSDToCurrency(usdAmount, currency);
    
    if (!conversion.success) {
      return res.status(400).json({
        success: false,
        message: conversion.error,
      });
    }

    res.json({
      success: true,
      amount: conversion.amount,
      currency: conversion.currency,
      usdAmount: conversion.usdAmount,
      rate: conversion.rate,
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert currency',
    });
  }
});

// HD Wallet Payment System (New)
const hdPaymentController = require('../controllers/hdPaymentController');
router.post('/hd/initiate', verifyFirebaseToken, hdPaymentController.createPaymentIntent);
router.get('/hd/status/:orderId', verifyFirebaseToken, hdPaymentController.getPaymentIntentStatus);

// Legacy TRC20 payment (keeping for backward compatibility)
router.post('/trc20/initiate', verifyFirebaseToken, paymentController.initiateTRC20Payment);
router.get('/status/:orderId', verifyFirebaseToken, paymentController.getPaymentStatus);

// Verify and process user-submitted transaction hash
router.post('/trc20/verify', verifyFirebaseToken, paymentController.verifyUserTransaction);

// Webhook endpoints (no auth required - verified by signature)
router.post('/webhook/:provider', paymentController.handleWebhook);

module.exports = router;

