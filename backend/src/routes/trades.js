const express = require('express');
const router = express.Router();
const {
  createTradeFromSignal,
  createManualTrade,
  closeTrade,
  getAllTrades,
  getPortfolioAnalytics
} = require('../controllers/tradeController');

// Trade management routes
router.post('/from-signal', createTradeFromSignal);
router.post('/manual', createManualTrade);
router.put('/:id/close', closeTrade);
router.get('/', getAllTrades);

// Analytics routes
router.get('/analytics', getPortfolioAnalytics);

module.exports = router; 