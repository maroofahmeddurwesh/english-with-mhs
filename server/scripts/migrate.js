const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql2 = require('mysql2/promise');

async function migrate() {
  // Connect WITHOUT specifying a database — we create it in the SQL file
  const conn = await mysql2.createConnection({
    host:     process.env.DATABASE_HOST     || 'localhost',
    port:     parseInt(process.env.DATABASE_PORT || '3306'),
    user:     process.env.DATABASE_USER     || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  console.log('🔗 Connected to MySQL.');

  const sqlPath = path.join(__dirname, '../migrations/001_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('⚙️  Running migration...');
  await conn.query(sql);

  console.log('');
  console.log('✅ Migration completed successfully!');
  console.log('');
  console.log('📋 Tables created:');
  console.log('   • users (admin/teacher accounts)');
  console.log('   • students (student accounts)');
  console.log('   • courses');
  console.log('   • slots');
  console.log('   • bookings');
  console.log('   • payment_methods');
  console.log('   • reviews');
  console.log('   • contact_messages');
  console.log('   • announcements');
  console.log('');
  console.log('🌱 Seed data inserted:');
  console.log('   • 4 courses (Spoken English, IELTS, Business, Grammar)');
  console.log('   • 5 batch slots');
  console.log('   • 2 payment methods (NayaPay, Meezan Bank)');
  console.log('   • 9 approved student reviews');
  console.log('   • 1 global announcement');
  console.log('');
  console.log('🔐 Admin account:');
  console.log('   Email:    huzaifa@englishwithmhs.com');
  console.log('   Password: Admin@1234');
  console.log('');

  await conn.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  console.error('   Code:', err.code);
  console.error('   SQL State:', err.sqlState);
  if (err.sql) console.error('   SQL:', err.sql.slice(0, 200));
  process.exit(1);
});
