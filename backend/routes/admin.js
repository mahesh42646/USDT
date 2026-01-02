const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminUserController = require('../controllers/adminUserController');
const adminWithdrawalController = require('../controllers/adminWithdrawalController');
const adminTransactionController = require('../controllers/adminTransactionController');
const adminSettingsController = require('../controllers/adminSettingsController');
const adminReferralController = require('../controllers/adminReferralController');
const adminInvestmentController = require('../controllers/adminInvestmentController');
const adminReferralManagementController = require('../controllers/adminReferralManagementController');
const { verifyAdminToken } = require('../middleware/admin');

// Public routes
router.post('/login', adminController.login);

// Protected routes (require admin token)
router.get('/dashboard', verifyAdminToken, adminController.getDashboardData);
router.get('/profile', verifyAdminToken, adminController.getProfile);

// User management routes
router.get('/users', verifyAdminToken, adminUserController.getAllUsers);
router.get('/users/:userId', verifyAdminToken, adminUserController.getUserDetails);
router.put('/users/:userId', verifyAdminToken, adminUserController.updateUser);
router.delete('/users/:userId', verifyAdminToken, adminUserController.deleteUser);
router.patch('/users/:userId/toggle-status', verifyAdminToken, adminUserController.toggleUserStatus);

// Withdrawal management routes
router.get('/withdrawals', verifyAdminToken, adminWithdrawalController.getAllWithdrawals);
router.get('/withdrawals/:withdrawalId', verifyAdminToken, adminWithdrawalController.getWithdrawalDetails);
router.patch('/withdrawals/:withdrawalId/approve', verifyAdminToken, adminWithdrawalController.approveWithdrawal);
router.patch('/withdrawals/:withdrawalId/reject', verifyAdminToken, adminWithdrawalController.rejectWithdrawal);
router.patch('/withdrawals/:withdrawalId/process', verifyAdminToken, adminWithdrawalController.processWithdrawal);
router.patch('/withdrawals/:withdrawalId/status', verifyAdminToken, adminWithdrawalController.updateWithdrawalStatus);

// Investment management routes (for user management)
router.post('/users/:userId/investments', verifyAdminToken, adminInvestmentController.createInvestment);
router.put('/investments/:investmentId', verifyAdminToken, adminInvestmentController.updateInvestment);
router.delete('/investments/:investmentId', verifyAdminToken, adminInvestmentController.deleteInvestment);

// Referral management routes (for user management)
router.post('/users/:userId/referrals', verifyAdminToken, adminReferralManagementController.addReferral);
router.patch('/referrals/:referralId/complete', verifyAdminToken, adminReferralManagementController.markReferralComplete);

// Transaction history routes
router.get('/transactions', verifyAdminToken, adminTransactionController.getAllTransactions);

// Referral management routes
router.get('/referrals', verifyAdminToken, adminReferralController.getAllReferrals);
router.get('/referrals/user/:userId/chain', verifyAdminToken, adminReferralController.getUserReferralChain);

// Settings routes
router.get('/settings', verifyAdminToken, adminSettingsController.getSettings);
router.put('/settings', verifyAdminToken, adminSettingsController.updateSettings);

module.exports = router;
