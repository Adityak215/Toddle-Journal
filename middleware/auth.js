// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists in database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const isTeacher = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Teachers only.' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  authenticateToken,
  isTeacher
};