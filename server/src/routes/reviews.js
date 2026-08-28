const express = require('express');
const router = express.Router();
const { getApprovedReviews, submitReview, adminGetReviews, approveReview, unapproveReview, deleteReview } = require('../controllers/reviewController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/',             getApprovedReviews);
router.post('/submit',      submitReview);
router.get('/admin',        verifyToken, requireAdmin, adminGetReviews);
router.post('/admin/:id/approve', verifyToken, requireAdmin, approveReview);
router.post('/admin/:id/unapprove', verifyToken, requireAdmin, unapproveReview);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteReview);

module.exports = router;
