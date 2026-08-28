const { pool } = require('../config/db');

// ── Student: Get My Chat Thread ───────────────────────────────
exports.getStudentChat = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [messages] = await pool.query(
      'SELECT * FROM chat_messages WHERE student_id = ? ORDER BY created_at ASC',
      [studentId]
    );
    
    // Mark admin messages as read
    await pool.query(
      'UPDATE chat_messages SET is_read = 1 WHERE student_id = ? AND sender_role = "admin" AND is_read = 0',
      [studentId]
    );

    return res.json({ success: true, data: { messages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load chat.' });
  }
};

// ── Student: Send Message ─────────────────────────────────────
exports.studentSendMessage = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { message_text } = req.body;
    
    if (!message_text) return res.status(400).json({ success: false, message: 'Message text is required.' });

    await pool.query(
      'INSERT INTO chat_messages (student_id, sender_role, message_text) VALUES (?, "student", ?)',
      [studentId, message_text]
    );

    return res.status(201).json({ success: true, message: 'Message sent.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

// ── Admin: Get Chat Threads (List of Students) ────────────────
exports.adminGetThreads = async (req, res) => {
  try {
    // Get latest message for each student and unread count
    const [threads] = await pool.query(`
      SELECT 
        s.id AS student_id, 
        s.name AS student_name, 
        s.email AS student_email,
        MAX(cm.created_at) AS last_activity,
        SUM(CASE WHEN cm.is_read = 0 AND cm.sender_role = 'student' THEN 1 ELSE 0 END) AS unread_count
      FROM students s
      JOIN chat_messages cm ON s.id = cm.student_id
      GROUP BY s.id
      ORDER BY last_activity DESC
    `);
    return res.json({ success: true, data: { threads } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load threads.' });
  }
};

// ── Admin: Get Specific Thread ────────────────────────────────
exports.adminGetStudentChat = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const [messages] = await pool.query(
      'SELECT * FROM chat_messages WHERE student_id = ? ORDER BY created_at ASC',
      [studentId]
    );

    // Mark student messages as read
    await pool.query(
      'UPDATE chat_messages SET is_read = 1 WHERE student_id = ? AND sender_role = "student" AND is_read = 0',
      [studentId]
    );

    return res.json({ success: true, data: { messages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load chat.' });
  }
};

// ── Admin: Send Reply ─────────────────────────────────────────
exports.adminSendReply = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { message_text } = req.body;

    if (!message_text) return res.status(400).json({ success: false, message: 'Message text is required.' });

    await pool.query(
      'INSERT INTO chat_messages (student_id, sender_role, message_text) VALUES (?, "admin", ?)',
      [studentId, message_text]
    );

    return res.status(201).json({ success: true, message: 'Reply sent.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send reply.' });
  }
};
