const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyFirebaseToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const dashboardController = require('../controllers/dashboardController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Public routes
router.post('/register', verifyFirebaseToken, upload.single('profilePhoto'), userController.register);
router.get('/profile', verifyFirebaseToken, userController.getProfile);
router.put('/profile', verifyFirebaseToken, upload.single('profilePhoto'), userController.updateProfile);
router.get('/dashboard', verifyFirebaseToken, dashboardController.getDashboardData);

module.exports = router;
