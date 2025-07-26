const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const signalRoutes = require('./routes/signals');
const webhookRoutes = require('./routes/webhook');
const tradeRoutes = require('./routes/trades');
const { initializeDatabase } = require('./utils/database');
const { initializeWebSocket } = require('./services/websocketService');
const priceMonitorService = require('./services/priceMonitorService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Request logging (production-ready)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100 // Limit elke IP tot 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/signals', signalRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/trades', tradeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WebSocket initialization
initializeWebSocket(io);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    server.listen(PORT, () => {
      console.log(`🚀 Trading Signals Server running on port ${PORT}`);
      console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
      console.log(`🔗 WebSocket ready for real-time signals`);
      
      // Start Price Monitor Service
      priceMonitorService.start();
      console.log(`🎯 Price Monitor started for target hit detection`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  priceMonitorService.stop();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io }; 