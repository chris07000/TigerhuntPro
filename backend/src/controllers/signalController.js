const { Signal } = require('../models/Signal');
const { broadcastSignal } = require('../services/websocketService');
const discordService = require('../services/discordService');
const priceMonitorService = require('../services/priceMonitorService');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/**
 * Alle signalen ophalen met paginatie en filtering
 */
async function getAllSignals(req, res) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      symbol, 
      action, 
      status = 'active',
      strategy,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause voor filtering
    const whereClause = {};
    if (symbol) whereClause.symbol = symbol.toUpperCase();
    if (action) whereClause.action = action.toUpperCase();
    if (status) whereClause.status = status;
    if (strategy) whereClause.strategy = strategy;
    
    // Datum filtering
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }
    
    const signals = await Signal.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: signals.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(signals.count / limit),
        totalItems: signals.count,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signals',
      error: error.message
    });
  }
}

/**
 * Specifiek signaal ophalen
 */
async function getSignalById(req, res) {
  try {
    const { id } = req.params;
    
    const signal = await Signal.findByPk(id);
    
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }
    
    res.json({
      success: true,
      data: signal
    });
    
  } catch (error) {
    console.error('Error fetching signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signal',
      error: error.message
    });
  }
}

/**
 * Handmatig signaal aanmaken
 */
async function createManualSignal(req, res) {
  try {
    const signalData = {
      id: uuidv4(),
      ...req.body,
      source: 'manual',
      status: 'active',
      createdAt: new Date()
    };
    
    const signal = await Signal.create(signalData);
    
    // Broadcast naar alle clients
    broadcastSignal('new_signal', signal);
    
    // Send to Discord
    try {
      await discordService.sendNewSignal(signal);
    } catch (discordError) {
      console.error('Discord notification failed:', discordError.message);
      // Don't fail the signal creation if Discord fails
    }

    // Add to price monitoring if has targets
    try {
      await priceMonitorService.addSignalToMonitor(signal);
    } catch (monitorError) {
      console.error('Price monitor add failed:', monitorError.message);
      // Don't fail signal creation if monitoring fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Signal created successfully',
      data: signal
    });
    
  } catch (error) {
    console.error('Error creating signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create signal',
      error: error.message
    });
  }
}

/**
 * Signaal updaten
 */
async function updateSignal(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const signal = await Signal.findByPk(id);
    
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }
    
    await signal.update(updateData);
    
    // Broadcast update
    broadcastSignal('signal_updated', signal);
    
    res.json({
      success: true,
      message: 'Signal updated successfully',
      data: signal
    });
    
  } catch (error) {
    console.error('Error updating signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update signal',
      error: error.message
    });
  }
}

/**
 * Signaal verwijderen
 */
async function deleteSignal(req, res) {
  try {
    const { id } = req.params;
    
    const signal = await Signal.findByPk(id);
    
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }

    // Store signal info for Discord notification before deletion
    const signalInfo = {
      symbol: signal.symbol,
      action: signal.action,
      id: signal.id
    };
    
    await signal.destroy();
    
    // Remove from price monitoring
    priceMonitorService.removeSignalFromMonitor(id);
    
    // Broadcast deletion
    broadcastSignal('signal_deleted', { id });
    
    // Send Discord deletion notification
    try {
      await discordService.sendSignalDeleted(signalInfo);
    } catch (discordError) {
      console.error('Discord deletion notification failed:', discordError.message);
    }
    
    res.json({
      success: true,
      message: 'Signal deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete signal',
      error: error.message
    });
  }
}

module.exports = {
  getAllSignals,
  getSignalById,
  createManualSignal,
  updateSignal,
  deleteSignal
}; 