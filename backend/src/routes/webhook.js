const express = require('express');
const router = express.Router();
const { createSignal } = require('../controllers/webhookController');
const { validateWebhookSignal } = require('../middleware/validation');

// TradingView webhook endpoint
// Dit is waar TradingView je signalen naartoe stuurt
router.post('/tradingview', validateWebhookSignal, createSignal);

// Test endpoint voor handmatige signalen
router.post('/test', (req, res) => {
  const testSignal = {
    action: 'BUY',
    symbol: 'BTCUSDT',
    price: 45000,
    timestamp: new Date().toISOString(),
    source: 'manual_test'
  };
  
  req.body = testSignal;
  createSignal(req, res);
});

module.exports = router; 