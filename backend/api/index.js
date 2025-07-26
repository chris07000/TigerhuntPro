const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const signalRoutes = require('../src/routes/signals');
const webhookRoutes = require('../src/routes/webhook');
const tradeRoutes = require('../src/routes/trades');
const { initializeDatabase } = require('../src/utils/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://tigerhunt-pro-frontend-a7pu.vercel.app",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Tiger Hunt Pro API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/signals', signalRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/trades', tradeRoutes);

// Initialize database for serverless
initializeDatabase().catch(console.error);

// Export for Vercel
module.exports = app; 