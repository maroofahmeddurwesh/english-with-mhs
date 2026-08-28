require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security Middleware ───────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:4173',
    'https://english-with-mhs.vercel.app',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Uploads ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate Limiting ─────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/courses',  require('./routes/courses'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/student',       require('./routes/student'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/chat',          require('./routes/chat'));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'English With MHS API', timestamp: new Date().toISOString() }));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.message?.includes('Only JPEG')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit.' });
  }
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
