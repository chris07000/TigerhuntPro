let io;

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(socketIo) {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log(`📡 New client connected: ${socket.id}`);
    
    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Trading Signals Dashboard',
      clientId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    // Handle client requests for latest signals
    socket.on('request_signals', async () => {
      try {
        const { Signal } = require('../models/Signal');
        const recentSignals = await Signal.findAll({
          limit: 20,
          order: [['createdAt', 'DESC']]
        });
        
        socket.emit('signals_data', recentSignals);
      } catch (error) {
        console.error('Error fetching signals for client:', error);
        socket.emit('error', { message: 'Failed to fetch signals' });
      }
    });
    
    // Handle client subscription to specific symbols
    socket.on('subscribe_symbol', (symbol) => {
      socket.join(`symbol:${symbol.toUpperCase()}`);
      console.log(`Client ${socket.id} subscribed to ${symbol}`);
    });
    
    socket.on('unsubscribe_symbol', (symbol) => {
      socket.leave(`symbol:${symbol.toUpperCase()}`);
      console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`📡 Client disconnected: ${socket.id}`);
    });
    
    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  });
  
  console.log('🔗 WebSocket server initialized');
}

/**
 * Broadcast signal to all connected clients
 */
function broadcastSignal(eventType, signal) {
  if (!io) {
    console.warn('WebSocket not initialized');
    return;
  }
  
  // Broadcast to all clients
  io.emit(eventType, {
    ...signal,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to symbol-specific rooms
  if (signal.symbol) {
    io.to(`symbol:${signal.symbol}`).emit(`${eventType}_symbol`, signal);
  }
  
  console.log(`📡 Broadcasted ${eventType} to all clients`);
}

/**
 * Get connection stats
 */
function getConnectionStats() {
  if (!io) return { connected: 0 };
  
  return {
    connected: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Send message to specific client
 */
function sendToClient(clientId, eventType, data) {
  if (!io) return false;
  
  io.to(clientId).emit(eventType, data);
  return true;
}

module.exports = {
  initializeWebSocket,
  broadcastSignal,
  getConnectionStats,
  sendToClient
}; 