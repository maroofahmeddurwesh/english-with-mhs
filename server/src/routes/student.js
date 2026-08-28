const express = require('express');
const router = express.Router();
const { getMyDashboard, getStudentsList, deleteStudent } = require('../controllers/studentController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Student dashboard — accessible by both student role AND admin (admin can view as student)
router.get('/dashboard', verifyToken, getMyDashboard);

// Admin endpoints
router.get('/admin/list', verifyToken, requireAdmin, getStudentsList);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteStudent);

module.exports = router;
