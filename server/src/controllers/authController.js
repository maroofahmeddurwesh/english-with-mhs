const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

// ── Student Register ─────────────────────────────────────────
exports.studentRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    const [existing] = await pool.query('SELECT id FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO students (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hash]
    );
    const token = signToken({ id: result.insertId, role: 'student', name, email });
    return res.status(201).json({ success: true, message: 'Account created successfully!', data: { token, user: { id: result.insertId, name, email, phone, role: 'student' } } });
  } catch (err) {
    console.error('studentRegister error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Student Login ────────────────────────────────────────────
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const [rows] = await pool.query('SELECT * FROM students WHERE email = ? AND is_active = 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const student = rows[0];
    const match = await bcrypt.compare(password, student.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = signToken({ id: student.id, role: 'student', name: student.name, email: student.email });
    return res.json({ success: true, data: { token, user: { id: student.id, name: student.name, email: student.email, phone: student.phone, role: 'student' } } });
  } catch (err) {
    console.error('studentLogin error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Admin / Teacher Login ────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = signToken({ id: user.id, role: user.role, name: user.name, email: user.email });
    return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } } });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── Get Me ───────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const table = req.user.role === 'student' ? 'students' : 'users';
    const [rows] = await pool.query(`SELECT id, name, email, phone FROM ${table} WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: { user: { ...rows[0], role: req.user.role } } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Profile Settings ───────────────────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }
    
    const table = req.user.role === 'student' ? 'students' : 'users';
    
    // Check if email is taken by someone else
    const [existing] = await pool.query(`SELECT id FROM ${table} WHERE email = ? AND id != ?`, [email, req.user.id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already in use by another account.' });
    }

    await pool.query(
      `UPDATE ${table} SET name = ?, email = ?, phone = ? WHERE id = ?`,
      [name, email, phone || null, req.user.id]
    );

    // Get updated user data
    const [rows] = await pool.query(`SELECT id, name, email, phone FROM ${table} WHERE id = ?`, [req.user.id]);
    const updatedUser = { ...rows[0], role: req.user.role };
    
    // Sign new token with updated details
    const token = signToken({ id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, email: updatedUser.email });

    return res.json({ success: true, message: 'Profile updated successfully.', data: { token, user: updatedUser } });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ── Change Password ───────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
    }

    const table = req.user.role === 'student' ? 'students' : 'users';
    const [rows] = await pool.query(`SELECT password_hash FROM ${table} WHERE id = ?`, [req.user.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    
    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
