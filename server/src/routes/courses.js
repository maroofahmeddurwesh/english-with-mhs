const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse,
  createCourse, updateCourse, deleteCourse, adminGetCourses,
  getSlots, createSlot, updateSlot, deleteSlot,
} = require('../controllers/courseController');
const { getPaymentMethods } = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const { upload, processCourseImage } = require('../middleware/upload');

// Public routes
router.get('/',                  getCourses);
router.get('/payment-methods',   getPaymentMethods);
router.get('/:id',               getCourse);

// Admin routes
router.get(   '/admin/all',      verifyToken, requireAdmin, adminGetCourses);
router.post(  '/admin',          verifyToken, requireAdmin, upload.single('image'), processCourseImage, createCourse);
router.put(   '/admin/:id',      verifyToken, requireAdmin, upload.single('image'), processCourseImage, updateCourse);
router.delete('/admin/:id',      verifyToken, requireAdmin, deleteCourse);

// Slot management
router.get(   '/admin/slots',    verifyToken, requireAdmin, getSlots);
router.post(  '/admin/slots',    verifyToken, requireAdmin, createSlot);
router.put(   '/admin/slots/:id',verifyToken, requireAdmin, updateSlot);
router.delete('/admin/slots/:id',verifyToken, requireAdmin, deleteSlot);

module.exports = router;
