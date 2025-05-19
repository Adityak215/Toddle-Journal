// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (if any)
// router.post('/logout', authenticateToken, authController.logout);
// router.post('/refresh-token', authenticateToken, authController.refreshToken);

module.exports = router;