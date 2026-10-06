const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const officerRoutes = require('./routes/officerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const helpdeskRoutes = require('./routes/helpdeskRoutes');
const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allows images/PDFs to load across origins
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads & web client
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    institution: 'Institute of Engineering & Management (IEM), Kolkata',
    portal: 'Admission Management System REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation / Route Directory Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'IEM Admission Management System API',
    endpoints: {
      auth: '/api/auth (register, login, me, forgot-password, reset-password)',
      student: '/api/student (profile, dashboard-overview)',
      courses: '/api/courses (GET all, GET by id, POST, PUT, DELETE)',
      applications: '/api/applications (draft, submit, my, :id, :id/download-pdf, track/:applicationNumber)',
      officer: '/api/officer (applications, documents/:id/verify, applications/:id/status, reports)',
      admin: '/api/admin (dashboard-stats, students, officers, admission-cycles, audit-logs)',
      payments: '/api/payments (initialize, confirm, receipt/:receiptNumber)',
      documents: '/api/documents (upload, my, :id)',
      notifications: '/api/notifications (list, read, broadcast)',
    },
  });
});

// Apply rate limiting middleware
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/helpdesk', helpdeskRoutes);

// Fallback for API 404
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint ${req.originalUrl} not found.`,
  });
});

// Single Page Application Fallback for Frontend Routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` IEM Admission Management Server Running on Port ${PORT}`);
  console.log(` Web Portal:  http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
