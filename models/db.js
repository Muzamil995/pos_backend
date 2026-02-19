const mysql = require('mysql2/promise');

// ⚠️ dotenv must ONLY be loaded in index.js
// Do NOT require('dotenv') here

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'pos_db'
} = process.env;

// Validate required variables
if (!DB_NAME) {
  throw new Error('❌ DB_NAME is not defined in environment variables');
}

// Create MySQL Pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:00', // 🇵🇰 Pakistan Standard Time
  charset: 'utf8mb4'
});

// Test connection once on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Stop server if DB fails
  }
}

testConnection();

module.exports = pool;
