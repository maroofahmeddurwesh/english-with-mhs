const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'english_portal',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: (process.env.DATABASE_SSL === 'true' || (process.env.DATABASE_HOST && process.env.DATABASE_HOST.includes('tidbcloud.com'))) ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:00',
  charset: 'utf8mb4',
});

async function testConnection() {
  const conn = await pool.getConnection();
  console.log('✅ MySQL connected successfully.');
  conn.release();
}

module.exports = { pool, testConnection };
