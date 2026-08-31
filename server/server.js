require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  async function startServer() {
    try {
      await testConnection();
      app.listen(PORT, () => {
        console.log(`✅ English With MHS Server running on http://localhost:${PORT}`);
        console.log(`📦 Environment: ${process.env.NODE_ENV}`);
        console.log(`🗄️  Database: ${process.env.DATABASE_NAME}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }
  startServer();
}

// Required for Vercel Serverless Functions
module.exports = app;
