const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const pool = require('./models/db'); // ✅ updated

// Route Imports
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

const app = express();

// ================= GLOBAL MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use(express.static(path.join(__dirname, 'public')));

// ================= API VERSIONING =================
const API_PREFIX = '/api/v1';

// ================= ROUTES =================
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);
app.use(`${API_PREFIX}/shifts`, shiftRoutes);

// ================= HEALTH CHECK =================
app.get(`${API_PREFIX}/health`, async (req, res) => {
  try {
    await pool.query('SELECT 1'); // ✅ directly using pool
    res.json({
      status: 'OK',
      database: 'Connected',
      timezone: 'Asia/Karachi',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected'
    });
  }
});

// ================= HOME =================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 DreamsPOS SaaS Backend Running',
    version: '1.0.0',
    apiBase: `${API_PREFIX}`,
    health: `${API_PREFIX}/health`
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1'); // ✅ confirm DB before startup message
    console.log('✅ Database connected (PKT Timezone)');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}${API_PREFIX}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
});
