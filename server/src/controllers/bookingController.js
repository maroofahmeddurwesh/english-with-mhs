const { pool } = require('../config/db');
const { randomUUID: uuidv4 } = require('crypto');

function generateBookingRef() {
  return 'MHS-' + Math.floor(100000 + Math.random() * 900000);
}

// ── Public: Create Booking ────────────────────────────────────
exports.createBooking = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { student_name, student_email, student_phone, course_id, slot_id, transaction_id, payment_method } = req.body;
    const receiptUrl = req.receiptUrl;

    // Validate required fields
    if (!student_name || !student_email || !student_phone || !course_id || !slot_id || !transaction_id) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!receiptUrl) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Payment receipt image is required.' });
    }

    // Check slot exists and has capacity
    const [slots] = await conn.query(
      'SELECT * FROM slots WHERE id = ? AND course_id = ? AND is_active = 1 FOR UPDATE',
      [slot_id, course_id]
    );
    if (slots.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Invalid slot selected.' });
    }
    const slot = slots[0];
    if (slot.booked_count >= slot.max_capacity) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'This slot is full. Please choose another slot.' });
    }

    // Check transaction ID uniqueness
    const [existing] = await conn.query('SELECT id FROM bookings WHERE transaction_id = ?', [transaction_id]);
    if (existing.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ success: false, message: 'This transaction ID has already been submitted.' });
    }

    // Generate unique booking reference
    let bookingRef;
    let attempts = 0;
    do {
      bookingRef = generateBookingRef();
      const [refCheck] = await conn.query('SELECT id FROM bookings WHERE booking_ref = ?', [bookingRef]);
      if (refCheck.length === 0) break;
      attempts++;
    } while (attempts < 5);

    // Find student_id if logged in
    const studentId = req.user?.role === 'student' ? req.user.id : null;

    // Create booking
    const [result] = await conn.query(
      `INSERT INTO bookings (booking_ref, student_id, student_name, student_email, student_phone, course_id, slot_id, transaction_id, receipt_image_url, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingRef, studentId, student_name, student_email, student_phone, course_id, slot_id, transaction_id, receiptUrl, payment_method || 'Easypaisa']
    );

    await conn.commit();
    conn.release();

    return res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! Please wait for payment verification.',
      data: { booking_id: result.insertId, booking_ref: bookingRef, status: 'pending' }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('createBooking error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This transaction ID has already been submitted.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit booking. Please try again.' });
  }
};



// ── Admin: Get All Bookings ───────────────────────────────────
exports.adminGetBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '1=1';
    const params = [];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where += ' AND b.status = ?'; params.push(status);
    }
    if (search) {
      where += ' AND (b.student_name LIKE ? OR b.student_email LIKE ? OR b.booking_ref LIKE ? OR b.transaction_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const [bookings] = await pool.query(
      `SELECT b.*, c.title AS course_title, s.days_of_week, s.start_time, s.end_time
       FROM bookings b
       JOIN courses c ON c.id = b.course_id
       JOIN slots s ON s.id = b.slot_id
       WHERE ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings b WHERE ${where}`,
      params
    );

    return res.json({ success: true, data: { bookings, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (err) {
    console.error('adminGetBookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings.' });
  }
};

// ── Admin: Get Single Booking ─────────────────────────────────
exports.adminGetBooking = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, c.title AS course_title, c.fee, s.days_of_week, s.start_time, s.end_time
       FROM bookings b
       JOIN courses c ON c.id = b.course_id
       JOIN slots s ON s.id = b.slot_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });
    return res.json({ success: true, data: { booking: rows[0] } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load booking.' });
  }
};

// ── Admin: Approve Booking ────────────────────────────────────
exports.approveBooking = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { zoom_meeting_link } = req.body;
    if (!zoom_meeting_link) {
      conn.release();
      return res.status(400).json({ success: false, message: 'Zoom meeting link is required to approve.' });
    }

    const [rows] = await conn.query('SELECT * FROM bookings WHERE id = ? FOR UPDATE', [req.params.id]);
    if (rows.length === 0) { await conn.rollback(); conn.release(); return res.status(404).json({ success: false, message: 'Booking not found.' }); }

    const booking = rows[0];
    if (booking.status === 'approved') {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, message: 'Booking is already approved.' });
    }

    // Check slot capacity
    const [slots] = await conn.query('SELECT * FROM slots WHERE id = ? FOR UPDATE', [booking.slot_id]);
    const slot = slots[0];
    if (slot.booked_count >= slot.max_capacity) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, message: 'Slot is now full. Cannot approve.' });
    }

    await conn.query(
      `UPDATE bookings SET status='approved', zoom_meeting_link=?, approved_at=NOW(), updated_at=NOW() WHERE id=?`,
      [zoom_meeting_link, req.params.id]
    );
    await conn.query('UPDATE slots SET booked_count = booked_count + 1 WHERE id = ?', [booking.slot_id]);

    await conn.commit();
    conn.release();
    return res.json({ success: true, message: 'Booking approved! Student will receive the Zoom link.' });
  } catch (err) {
    await conn.rollback(); conn.release();
    console.error('approveBooking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve booking.' });
  }
};

// ── Admin: Reject Booking ─────────────────────────────────────
exports.rejectBooking = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }
    const [rows] = await pool.query('SELECT status FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });

    await pool.query(
      `UPDATE bookings SET status='rejected', rejection_reason=?, rejected_at=NOW(), updated_at=NOW() WHERE id=?`,
      [rejection_reason, req.params.id]
    );
    return res.json({ success: true, message: 'Booking rejected.' });
  } catch (err) {
    console.error('rejectBooking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject booking.' });
  }
};

// ── Admin: Analytics ──────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COALESCE(SUM(c.fee), 0) FROM bookings b JOIN courses c ON c.id = b.course_id WHERE b.status = 'approved') AS total_revenue,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_approvals,
        (SELECT COUNT(*) FROM slots WHERE is_active = 1) AS active_batches,
        (SELECT COUNT(*) FROM bookings WHERE status = 'approved') AS approved_bookings,
        (SELECT COUNT(*) FROM contact_messages WHERE is_read = 0) AS unread_messages,
        (SELECT COUNT(*) FROM reviews WHERE is_approved = 0) AS pending_reviews
    `);
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
};

// ── Admin: Payment Methods ─────────────────────────────────────
exports.getPaymentMethods = async (req, res) => {
  try {
    const [methods] = await pool.query('SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY display_order ASC');
    return res.json({ success: true, data: { payment_methods: methods } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load payment methods.' });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { name, account_title, account_number, iban, instructions, is_active } = req.body;
    await pool.query(
      'UPDATE payment_methods SET name=?, account_title=?, account_number=?, iban=?, instructions=?, is_active=? WHERE id=?',
      [name, account_title, account_number, iban || null, instructions, is_active !== undefined ? is_active : 1, req.params.id]
    );
    return res.json({ success: true, message: 'Payment method updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update payment method.' });
  }
};
