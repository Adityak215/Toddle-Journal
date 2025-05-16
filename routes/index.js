// routes/index.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// No authentication needed for auth routes
router.use('/auth', require('./authRoutes'));

// All other routes require authentication
router.use('/journals', authenticateToken, require('./journalRoutes'));

module.exports = router;