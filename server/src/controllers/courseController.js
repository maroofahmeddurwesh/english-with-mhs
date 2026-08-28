const { pool } = require('../config/db');

// ── Public: Get All Active Courses ───────────────────────────
exports.getCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.*, 
        COUNT(DISTINCT CASE WHEN s.is_active = 1 AND (s.booked_count < s.max_capacity) THEN s.id END) AS available_slots_count,
        COUNT(DISTINCT s.id) AS total_slots
       FROM courses c
       LEFT JOIN slots s ON s.course_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.id ASC`
    );
    return res.json({ success: true, data: { courses } });
  } catch (err) {
    console.error('getCourses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
};

// ── Public: Get Single Course ─────────────────────────────────
exports.getCourse = async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ? AND is_active = 1', [req.params.id]);
    if (courses.length === 0) return res.status(404).json({ success: false, message: 'Course not found.' });

    const [slots] = await pool.query(
      'SELECT * FROM slots WHERE course_id = ? AND is_active = 1 ORDER BY start_time ASC',
      [req.params.id]
    );

    return res.json({ success: true, data: { course: courses[0], slots } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load course.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, fee, duration, level, teacher_name } = req.body;
    const image_url = req.courseImageUrl || null;

    if (!title || !description || !fee || !duration) {
      return res.status(400).json({ success: false, message: 'Title, description, fee, and duration are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO courses (title, description, fee, duration, level, teacher_name, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, fee, duration, level || 'All Levels', teacher_name || 'Sir Muhammad Huzaifa Siddiqui', image_url]
    );
    return res.status(201).json({ success: true, message: 'Course created.', data: { id: result.insertId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
};

// ── Admin: Update Course ──────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, fee, duration, level, teacher_name, is_active } = req.body;
    
    // If a new image was uploaded, we update image_url. Otherwise keep it as is.
    let updateQuery = 'UPDATE courses SET title=?, description=?, fee=?, duration=?, level=?, teacher_name=?, is_active=?';
    let queryParams = [title, description, fee, duration, level || 'All Levels', teacher_name, is_active !== undefined ? is_active : 1];
    
    if (req.courseImageUrl) {
      updateQuery += ', image_url=?';
      queryParams.push(req.courseImageUrl);
    }
    
    updateQuery += ' WHERE id=?';
    queryParams.push(req.params.id);

    await pool.query(updateQuery, queryParams);
    return res.json({ success: true, message: 'Course updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
};

// ── Admin: Delete Course ──────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    // Soft delete: set is_active = 0
    await pool.query('UPDATE courses SET is_active = 0 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Course archived successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to archive course.' });
  }
};

// ── Admin: Get All Courses (including inactive) ────────────────
exports.adminGetCourses = async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    return res.json({ success: true, data: { courses } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
};

// ── Admin: Manage Slots ────────────────────────────────────────
exports.getSlots = async (req, res) => {
  try {
    const courseId = req.query.course_id;
    const [slots] = await pool.query(
      `SELECT s.*, c.title AS course_title FROM slots s 
       JOIN courses c ON c.id = s.course_id 
       ${courseId ? 'WHERE s.course_id = ?' : ''}
       ORDER BY s.created_at DESC`,
      courseId ? [courseId] : []
    );
    return res.json({ success: true, data: { slots } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load slots.' });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { course_id, days_of_week, start_time, end_time, batch_start_date, batch_end_date, max_capacity, zoom_link } = req.body;
    const [result] = await pool.query(
      'INSERT INTO slots (course_id, days_of_week, start_time, end_time, batch_start_date, batch_end_date, max_capacity, zoom_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [course_id, days_of_week, start_time, end_time, batch_start_date || null, batch_end_date || null, max_capacity || 10, zoom_link || null]
    );
    return res.status(201).json({ success: true, message: 'Slot created.', data: { id: result.insertId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create slot.' });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { days_of_week, start_time, end_time, batch_start_date, batch_end_date, max_capacity, zoom_link, is_active } = req.body;
    await pool.query(
      'UPDATE slots SET days_of_week=?, start_time=?, end_time=?, batch_start_date=?, batch_end_date=?, max_capacity=?, zoom_link=?, is_active=? WHERE id=?',
      [days_of_week, start_time, end_time, batch_start_date || null, batch_end_date || null, max_capacity, zoom_link || null, is_active !== undefined ? is_active : 1, req.params.id]
    );
    return res.json({ success: true, message: 'Slot updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update slot.' });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    await pool.query('UPDATE slots SET is_active = 0 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Slot deactivated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to deactivate slot.' });
  }
};
