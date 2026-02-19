const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./models/db');

// Import routes
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'POS Super Admin Backend API',
    // Yahan navigation link add kiya gaya hai 👇
    dashboardUI: 'http://localhost:3000/index.html',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getAllUsers: 'GET /api/subscription/users',
      createSubscription: 'POST /api/subscription/create',
      getUserSubscription: 'GET /api/subscription/user/:userId'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Serve static files (Yeh public folder se index.html ko serve karega)
app.use(express.static('public'));