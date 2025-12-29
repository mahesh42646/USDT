const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Initiate gateway payment
router.post('/gateway/initiate', verifyFirebaseToken, paymentController.initiateGatewayPayment);

// Get payment status
router.get('/status/:orderId', verifyFirebaseToken, paymentController.getPaymentStatus);

// Webhook endpoints (no auth required - verified by signature)
router.post('/webhook/:provider', paymentController.handleWebhook);

module.exports = router;

