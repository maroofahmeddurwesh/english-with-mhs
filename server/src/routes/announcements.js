const express = require('express');
const router = express.Router();
const { 
  getPublicAnnouncements, 
  adminGetAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/public', getPublicAnnouncements);
router.get('/admin', verifyToken, requireAdmin, adminGetAnnouncements);
router.post('/admin', verifyToken, requireAdmin, createAnnouncement);
router.put('/admin/:id', verifyToken, requireAdmin, updateAnnouncement);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteAnnouncement);

module.exports = router;
