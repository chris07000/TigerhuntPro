const { Trade } = require('../models/Trade');
const { Signal } = require('../models/Signal');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/**
 * Create a new trade from a signal
 */
async function createTradeFromSignal(req, res) {
  try {
    const { signalId, quantity, leverage, stopLoss, takeProfit1, takeProfit2, riskAmount } = req.body;
    
    // Get the signal
    const signal = await Signal.findByPk(signalId);
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    // Calculate risk percentage based on portfolio size (assuming $10k portfolio for now)
    const portfolioSize = 10000; // This should come from user settings
    const riskPercentage = riskAmount ? (riskAmount / portfolioSize) * 100 : 2;

    const tradeData = {
      id: uuidv4(),
      signalId,
      symbol: signal.symbol,
      action: signal.action,
      entryPrice: signal.price,
      quantity: quantity || 1,
      leverage: leverage || 1,
      stopLoss,
      takeProfit1,
      takeProfit2,
      riskAmount,
      riskPercentage,
      notes: `Trade from signal: ${signal.strategy || 'Tiger Hunt Pro'}`
    };

    const trade = await Trade.create(tradeData);

    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      data: trade
    });

  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trade',
      error: error.message
    });
  }
}

/**
 * Create manual trade
 */
async function createManualTrade(req, res) {
  try {
    const tradeData = {
      id: uuidv4(),
      ...req.body,
      entryDate: new Date()
    };

    const trade = await Trade.create(tradeData);

    res.status(201).json({
      success: true,
      message: 'Manual trade created successfully',
      data: trade
    });

  } catch (error) {
    console.error('Error creating manual trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual trade',
      error: error.message
    });
  }
}

/**
 * Close trade and calculate PnL
 */
async function closeTrade(req, res) {
  try {
    const { id } = req.params;
    const { exitPrice, partialQuantity } = req.body;

    const trade = await Trade.findByPk(id);
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    const entryPrice = parseFloat(trade.entryPrice);
    const quantity = parseFloat(trade.quantity);
    const leverage = parseInt(trade.leverage);
    const closeQuantity = partialQuantity || quantity;

    // Calculate PnL
    let pnl, pnlPercentage;
    
    if (trade.action === 'LONG' || trade.action === 'BUY') {
      pnl = (exitPrice - entryPrice) * closeQuantity * leverage;
      pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100 * leverage;
    } else {
      pnl = (entryPrice - exitPrice) * closeQuantity * leverage;
      pnlPercentage = ((entryPrice - exitPrice) / entryPrice) * 100 * leverage;
    }

    // Calculate duration
    const duration = Math.floor((new Date() - new Date(trade.entryDate)) / (1000 * 60));

    // Update trade
    const updateData = {
      exitPrice,
      exitDate: new Date(),
      duration,
      pnl: parseFloat(trade.pnl) + pnl,
      pnlPercentage: parseFloat(trade.pnlPercentage) + pnlPercentage,
      status: partialQuantity ? 'PARTIALLY_CLOSED' : 'CLOSED'
    };

    if (partialQuantity) {
      updateData.quantity = quantity - closeQuantity;
    }

    await trade.update(updateData);

    res.json({
      success: true,
      message: 'Trade closed successfully',
      data: trade
    });

  } catch (error) {
    console.error('Error closing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close trade',
      error: error.message
    });
  }
}

/**
 * Get all trades with filtering and analytics
 */
async function getAllTrades(req, res) {
  try {
    const { 
      status, 
      symbol, 
      startDate, 
      endDate,
      limit = 50,
      offset = 0 
    } = req.query;

    const whereClause = { userId: 'default_user' };
    
    if (status) whereClause.status = status;
    if (symbol) whereClause.symbol = symbol;
    if (startDate || endDate) {
      whereClause.entryDate = {};
      if (startDate) whereClause.entryDate[Op.gte] = new Date(startDate);
      if (endDate) whereClause.entryDate[Op.lte] = new Date(endDate);
    }

    const trades = await Trade.findAndCountAll({
      where: whereClause,
      order: [['entryDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: trades.rows,
      total: trades.count
    });

  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades',
      error: error.message
    });
  }
}

/**
 * Get portfolio analytics and performance metrics
 */
async function getPortfolioAnalytics(req, res) {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch(timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const trades = await Trade.findAll({
      where: {
        userId: 'default_user',
        entryDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      order: [['entryDate', 'ASC']]
    });

    // Calculate analytics
    const totalTrades = trades.length;
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const openTrades = trades.filter(t => t.status === 'OPEN');
    
    const totalPnL = closedTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => parseFloat(t.pnl) > 0);
    const losingTrades = closedTrades.filter(t => parseFloat(t.pnl) < 0);
    
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / losingTrades.length) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Risk metrics
    const totalRisk = trades.reduce((sum, trade) => sum + parseFloat(trade.riskAmount || 0), 0);
    const avgRiskPerTrade = totalTrades > 0 ? totalRisk / totalTrades : 0;
    const maxDrawdown = calculateMaxDrawdown(closedTrades);

    // Performance by symbol
    const symbolPerformance = {};
    closedTrades.forEach(trade => {
      if (!symbolPerformance[trade.symbol]) {
        symbolPerformance[trade.symbol] = { trades: 0, pnl: 0, winRate: 0 };
      }
      symbolPerformance[trade.symbol].trades += 1;
      symbolPerformance[trade.symbol].pnl += parseFloat(trade.pnl || 0);
    });

    Object.keys(symbolPerformance).forEach(symbol => {
      const symbolTrades = closedTrades.filter(t => t.symbol === symbol);
      const symbolWins = symbolTrades.filter(t => parseFloat(t.pnl) > 0);
      symbolPerformance[symbol].winRate = (symbolWins.length / symbolTrades.length) * 100;
    });

    const analytics = {
      overview: {
        totalTrades,
        closedTrades: closedTrades.length,
        openTrades: openTrades.length,
        totalPnL: totalPnL.toFixed(2),
        winRate: winRate.toFixed(1),
        profitFactor: profitFactor.toFixed(2)
      },
      performance: {
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2),
        bestTrade: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => parseFloat(t.pnl))).toFixed(2) : 0,
        worstTrade: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => parseFloat(t.pnl))).toFixed(2) : 0
      },
      risk: {
        totalRisk: totalRisk.toFixed(2),
        avgRiskPerTrade: avgRiskPerTrade.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2),
        sharpeRatio: calculateSharpeRatio(closedTrades).toFixed(2)
      },
      symbolPerformance
    };

    res.json({
      success: true,
      data: analytics,
      timeframe
    });

  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio analytics',
      error: error.message
    });
  }
}

/**
 * Helper function to calculate maximum drawdown
 */
function calculateMaxDrawdown(trades) {
  if (trades.length === 0) return 0;
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach(trade => {
    runningPnL += parseFloat(trade.pnl || 0);
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
}

/**
 * Helper function to calculate Sharpe ratio (simplified)
 */
function calculateSharpeRatio(trades) {
  if (trades.length === 0) return 0;
  
  const returns = trades.map(t => parseFloat(t.pnlPercentage || 0));
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  
  if (returns.length < 2) return 0;
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  return stdDev > 0 ? avgReturn / stdDev : 0;
}

module.exports = {
  createTradeFromSignal,
  createManualTrade,
  closeTrade,
  getAllTrades,
  getPortfolioAnalytics
}; 