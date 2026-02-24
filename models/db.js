const mysql = require('mysql2/promise');

// dotenv already loaded in index.js

const {
  DB_HOST = 'localhost',
  DB_USER = '',
  DB_PASSWORD = '',
  DB_NAME = '',
  DB_PORT = 3306
} = process.env;

// Validate required variables
if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error('❌ Database environment variables are missing');
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:00',
  charset: 'utf8mb4'
});

// Test connection once on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;