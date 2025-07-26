const Joi = require('joi');

// Validation schema voor TradingView webhook signalen
const webhookSignalSchema = Joi.object({
  action: Joi.string().valid('BUY', 'SELL', 'HOLD').required(),
  symbol: Joi.string().min(1).max(20).required(),
  price: Joi.number().positive().required(),
  timestamp: Joi.string().isoDate().optional(),
  strategy: Joi.string().max(50).optional(),
  timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w').optional(),
  notes: Joi.string().max(500).optional()
});

// Validation schema voor handmatige signalen
const manualSignalSchema = Joi.object({
  action: Joi.string().valid('BUY', 'SELL', 'HOLD').required(),
  symbol: Joi.string().min(1).max(20).required(),
  price: Joi.number().positive().required(),
  strategy: Joi.string().max(50).optional(),
  timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w').optional(),
  notes: Joi.string().max(500).optional(),
  metadata: Joi.object().optional(),
  // Trading parameters for auto-signals
  leverage: Joi.number().integer().min(1).max(125).optional(),
  takeProfit1: Joi.number().positive().optional(),
  takeProfit2: Joi.number().positive().optional(),
  stopLoss: Joi.number().positive().optional()
});

/**
 * Middleware voor TradingView webhook validatie
 */
function validateWebhookSignal(req, res, next) {
  const { error, value } = webhookSignalSchema.validate(req.body);
  
  if (error) {
    console.log('❌ Webhook validation error:', error.details);
    return res.status(400).json({
      success: false,
      message: 'Invalid signal data',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Normalize data
  req.body = {
    ...value,
    action: value.action.toUpperCase(),
    symbol: value.symbol.toUpperCase()
  };
  
  next();
}

/**
 * Middleware voor handmatige signaal validatie
 */
function validateSignal(req, res, next) {
  const { error, value } = manualSignalSchema.validate(req.body);
  
  if (error) {
    console.log('❌ Signal validation error:', error.details);
    return res.status(400).json({
      success: false,
      message: 'Invalid signal data',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Normalize data
  req.body = {
    ...value,
    action: value.action.toUpperCase(),
    symbol: value.symbol.toUpperCase()
  };
  
  next();
}

/**
 * Generieke error handler
 */
function handleValidationError(error, req, res, next) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }
  
  next(error);
}

module.exports = {
  validateWebhookSignal,
  validateSignal,
  handleValidationError,
  webhookSignalSchema,
  manualSignalSchema
}; 