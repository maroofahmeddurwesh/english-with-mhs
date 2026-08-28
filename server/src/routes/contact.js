const express = require('express');
const router = express.Router();
const { submitContact, adminGetMessages, markAsRead, markAsUnread, deleteMessage } = require('../controllers/contactController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/submit',          submitContact);
router.get('/admin',            verifyToken, requireAdmin, adminGetMessages);
router.put('/admin/:id/read',   verifyToken, requireAdmin, markAsRead);
router.put('/admin/:id/unread', verifyToken, requireAdmin, markAsUnread);
router.delete('/admin/:id',     verifyToken, requireAdmin, deleteMessage);

module.exports = router;
