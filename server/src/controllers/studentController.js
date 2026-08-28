const { pool } = require('../config/db');

// ── Student: Get My Dashboard Data ───────────────────────────
exports.getMyDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentEmail = req.user.email;

    // Get student's bookings with course + slot info
    const [bookings] = await pool.query(
      `SELECT b.id, b.booking_ref, b.status, b.zoom_meeting_link, b.rejection_reason,
              b.transaction_id, b.payment_method, b.created_at, b.approved_at,
              c.title AS course_title, c.description AS course_description, c.fee, c.duration, c.level,
              s.days_of_week, s.start_time, s.end_time, s.batch_start_date, s.batch_end_date, s.zoom_link AS slot_zoom_link
       FROM bookings b
       JOIN courses c ON c.id = b.course_id
       JOIN slots s ON s.id = b.slot_id
       WHERE b.student_id = ? OR b.student_email = ?
       ORDER BY b.created_at DESC`,
      [studentId, studentEmail]
    );

    // Get global + course-specific announcements for enrolled courses
    const enrolledCourseIds = bookings
      .filter(b => b.status === 'approved')
      .map(b => b.course_id);

    let announcements = [];
    if (enrolledCourseIds.length > 0) {
      const placeholders = enrolledCourseIds.map(() => '?').join(',');
      [announcements] = await pool.query(
        `SELECT * FROM announcements WHERE is_active = 1 AND (course_id IS NULL OR course_id IN (${placeholders})) ORDER BY created_at DESC LIMIT 10`,
        enrolledCourseIds
      );
    } else {
      [announcements] = await pool.query(
        'SELECT * FROM announcements WHERE is_active = 1 AND course_id IS NULL ORDER BY created_at DESC LIMIT 5'
      );
    }

    return res.json({ success: true, data: { bookings, announcements } });
  } catch (err) {
    console.error('getMyDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

// ── Admin: Get Students Directory ─────────────────────────────
exports.getStudentsList = async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.id, s.name, s.email, s.phone, s.is_active, s.created_at,
        COUNT(DISTINCT b.course_id) AS enrolled_courses_count
      FROM students s
      LEFT JOIN bookings b ON s.id = b.student_id AND b.status = 'approved'
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    return res.json({ success: true, data: { students } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load students.' });
  }
};

// ── Admin: Delete Student ─────────────────────────────────────
exports.deleteStudent = async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Student account deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};
