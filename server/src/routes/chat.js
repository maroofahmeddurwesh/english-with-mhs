const express = require('express');
const router = express.Router();
const { 
  getStudentChat, 
  studentSendMessage, 
  adminGetThreads, 
  adminGetStudentChat, 
  adminSendReply 
} = require('../controllers/chatController');
const { verifyToken, requireStudent, requireAdmin } = require('../middleware/auth');

// Student endpoints
router.get('/student', verifyToken, requireStudent, getStudentChat);
router.post('/student/send', verifyToken, requireStudent, studentSendMessage);

// Admin endpoints
router.get('/admin/threads', verifyToken, requireAdmin, adminGetThreads);
router.get('/admin/:studentId', verifyToken, requireAdmin, adminGetStudentChat);
router.post('/admin/:studentId/reply', verifyToken, requireAdmin, adminSendReply);

module.exports = router;
