const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const investmentController = require('../controllers/investmentController');

// Investment routes
router.post('/add', verifyFirebaseToken, investmentController.addInvestment);
router.get('/history', verifyFirebaseToken, investmentController.getInvestmentHistory);
router.put('/confirm/:investmentId', verifyFirebaseToken, investmentController.confirmInvestment);

module.exports = router;
