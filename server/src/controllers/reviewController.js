const { pool } = require('../config/db');

// ── Public: Get Approved Reviews ──────────────────────────────
exports.getApprovedReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      'SELECT id, student_name, course_title, rating, comment, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: { reviews } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load reviews.' });
  }
};

// ── Public: Submit Review ─────────────────────────────────────
exports.submitReview = async (req, res) => {
  try {
    const { student_name, course_title, rating, comment } = req.body;
    if (!student_name || !course_title || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    await pool.query(
      'INSERT INTO reviews (student_name, course_title, rating, comment) VALUES (?, ?, ?, ?)',
      [student_name, course_title, parseInt(rating), comment]
    );
    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and will appear on the website after admin approval.'
    });
  } catch (err) {
    console.error('submitReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// ── Admin: Get All Reviews (pending + approved) ───────────────
exports.adminGetReviews = async (req, res) => {
  try {
    const { status } = req.query;
    let where = '1=1';
    const params = [];
    if (status === 'pending') { where = 'is_approved = 0'; }
    if (status === 'approved') { where = 'is_approved = 1'; }
    const [reviews] = await pool.query(`SELECT * FROM reviews WHERE ${where} ORDER BY created_at DESC`, params);
    return res.json({ success: true, data: { reviews } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load reviews.' });
  }
};

// ── Admin: Approve Review ─────────────────────────────────────
exports.approveReview = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    return res.json({ success: true, message: 'Review approved and is now live on the website!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to approve review.' });
  }
};

// ── Admin: Unapprove Review ───────────────────────────────────
exports.unapproveReview = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE reviews SET is_approved = 0 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    return res.json({ success: true, message: 'Review unapproved and removed from the website.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to unapprove review.' });
  }
};

// ── Admin: Delete Review ──────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};
