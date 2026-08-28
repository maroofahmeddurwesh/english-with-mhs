const { pool } = require('../config/db');

// ── Public / Student: Get Active Announcements ───────────────
exports.getPublicAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query(
      'SELECT id, title, body, created_at FROM announcements WHERE is_active = 1 AND course_id IS NULL ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: { announcements } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load announcements.' });
  }
};

// ── Admin: Get All Announcements ──────────────────────────────
exports.adminGetAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    return res.json({ success: true, data: { announcements } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load announcements.' });
  }
};

// ── Admin: Create Announcement ────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, is_active } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }
    const isActive = is_active !== undefined ? is_active : 1;
    
    await pool.query(
      'INSERT INTO announcements (title, body, is_active) VALUES (?, ?, ?)',
      [title, body, isActive]
    );
    return res.status(201).json({ success: true, message: 'Announcement created successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

// ── Admin: Update Announcement ────────────────────────────────
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, body, is_active } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }
    
    await pool.query(
      'UPDATE announcements SET title = ?, body = ?, is_active = ? WHERE id = ?',
      [title, body, is_active, req.params.id]
    );
    return res.json({ success: true, message: 'Announcement updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
};

// ── Admin: Delete Announcement ────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
};
