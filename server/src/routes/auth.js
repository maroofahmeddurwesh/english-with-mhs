const express = require('express');
const router = express.Router();
const { studentRegister, studentLogin, adminLogin, getMe, updateSettings, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/student/register', authLimiter, studentRegister);
router.post('/student/login',    authLimiter, studentLogin);
router.post('/admin/login',      authLimiter, adminLogin);
router.get('/me',                verifyToken, getMe);
router.put('/settings',          verifyToken, updateSettings);
router.put('/change-password',   verifyToken, changePassword);

module.exports = router;
