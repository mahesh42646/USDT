const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const referralController = require('../controllers/referralController');

// Referral routes
router.get('/network', verifyFirebaseToken, referralController.getReferralNetwork);
router.get('/stats', verifyFirebaseToken, referralController.getReferralStats);
router.get('/income', verifyFirebaseToken, referralController.getReferralIncomeHistory);

module.exports = router;
