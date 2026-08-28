const { pool } = require('../config/db');

// ── Public: Submit Contact Message ────────────────────────────
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
    }
    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject, message]
    );
    return res.status(201).json({
      success: true,
      message: 'Your message has been sent! Sir Huzaifa will reply to you soon.'
    });
  } catch (err) {
    console.error('submitContact error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};

// ── Admin: Get All Messages ───────────────────────────────────
exports.adminGetMessages = async (req, res) => {
  try {
    const { read } = req.query;
    let where = '1=1';
    if (read === 'false') where = 'is_read = 0';
    if (read === 'true') where = 'is_read = 1';
    const [messages] = await pool.query(`SELECT * FROM contact_messages WHERE ${where} ORDER BY created_at DESC`);
    return res.json({ success: true, data: { messages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
};

// ── Admin: Mark Message as Read ───────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Message marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};

// ── Admin: Mark Message as Unread ─────────────────────────────
exports.markAsUnread = async (req, res) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = 0 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Message marked as unread.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};

// ── Admin: Delete Message ─────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};
