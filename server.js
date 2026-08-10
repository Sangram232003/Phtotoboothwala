'use strict';
const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { initDb }   = require('./src/db/db');

// Initialize database
initDb();

const app  = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts for custom UI
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve main public website
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth',          require('./src/routes/auth'));
app.use('/api/bookings',      require('./src/routes/bookings'));
app.use('/api/leads',         require('./src/routes/leads'));
app.use('/api/customers',     require('./src/routes/customers'));
app.use('/api/packages',      require('./src/routes/packages'));
app.use('/api/gallery',       require('./src/routes/gallery'));
app.use('/api/reviews',       require('./src/routes/reviews'));
app.use('/api/partners',      require('./src/routes/partners'));
app.use('/api/faqs',          require('./src/routes/faqs'));
app.use('/api/availability',  require('./src/routes/availability').router);
app.use('/api/settings',      require('./src/routes/settings'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/admin',         require('./src/routes/reports'));

// Admin Fallback (SPA routing)
app.get(['/admin', '/admin/*path'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PHOTO BOOTH WALA SERVER IS RUNNING`);
  console.log(`🌐 Public Website : http://localhost:${PORT}`);
  console.log(`🔐 Admin Portal   : http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
