const express = require('express');
const router = express.Router();
const {
  createBooking,

  adminGetBookings, adminGetBooking, approveBooking, rejectBooking,
  getAnalytics, getPaymentMethods, updatePaymentMethod
} = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { upload, processReceiptImage } = require('../middleware/upload');
const { bookingLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/submit',  bookingLimiter, upload.single('receipt'), processReceiptImage, createBooking);

// Admin routes
router.get('/admin',                verifyToken, requireAdmin, adminGetBookings);
router.get('/admin/analytics',      verifyToken, requireAdmin, getAnalytics);
router.get('/admin/payment-methods',verifyToken, requireAdmin, getPaymentMethods);
router.put('/admin/payment-methods/:id', verifyToken, requireAdmin, updatePaymentMethod);
router.get('/admin/:id',            verifyToken, requireAdmin, adminGetBooking);
router.post('/admin/:id/approve',   verifyToken, requireAdmin, approveBooking);
router.post('/admin/:id/reject',    verifyToken, requireAdmin, rejectBooking);

module.exports = router;
