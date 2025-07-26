const { Signal } = require('../models/Signal');
const { broadcastSignal } = require('../services/websocketService');
const { v4: uuidv4 } = require('uuid');

/**
 * Webhook handler voor TradingView signalen
 * Dit wordt aangeroepen wanneer TradingView een signaal stuurt
 */
async function createSignal(req, res) {
  try {
    console.log('📩 Webhook signaal ontvangen:', req.body);
    
    const { action, symbol, price, timestamp, strategy, timeframe } = req.body;
    
    // Signaal data voorbereiden
    const signalData = {
      id: uuidv4(),
      action: action?.toUpperCase(),
      symbol: symbol?.toUpperCase(),
      price: parseFloat(price),
      timestamp: timestamp || new Date().toISOString(),
      strategy: strategy || 'TradingView',
      timeframe: timeframe || '1h',
      source: 'tradingview_webhook',
      status: 'active',
      createdAt: new Date()
    };
    
    // Signaal opslaan in database
    const signal = await Signal.create(signalData);
    console.log('✅ Signaal opgeslagen:', signal.id);
    
    // Real-time broadcast naar alle connected clients
    broadcastSignal('new_signal', signal);
    console.log('📡 Signaal broadcasted naar dashboard');
    
    // Success response naar TradingView
    res.status(201).json({
      success: true,
      message: 'Signal received and processed',
      signal: {
        id: signal.id,
        action: signal.action,
        symbol: signal.symbol,
        price: signal.price,
        timestamp: signal.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process signal',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

module.exports = {
  createSignal
}; 