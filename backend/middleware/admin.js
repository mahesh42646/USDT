const jwt = require('jsonwebtoken');
const Admin = require('../schemas/admin');

exports.verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No admin token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_key_here'
      );

      // Check if token is admin type
      if (decoded.type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token type. Admin token required.',
        });
      }

      // Verify admin exists and is active
      const admin = await Admin.findById(decoded.adminId);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
        });
      }

      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated',
        });
      }

      // Attach admin info to request
      req.adminId = admin._id;
      req.admin = {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      };

      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Admin token expired. Please login again.',
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token',
        });
      }
      throw tokenError;
    }
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify admin token',
    });
  }
};