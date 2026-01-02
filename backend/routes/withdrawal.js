const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const withdrawalController = require('../controllers/withdrawalController');

// Withdrawal routes
router.post('/request', verifyFirebaseToken, withdrawalController.requestWithdrawal);
router.get('/history', verifyFirebaseToken, withdrawalController.getWithdrawalHistory);
router.get('/stats', verifyFirebaseToken, withdrawalController.getWithdrawalStats);

module.exports = router;