const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/trading_signals.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

/**
 * Initialize database and create tables
 */
async function initializeDatabase() {
  try {
    console.log('🗄️  Connecting to database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create data directory if it doesn't exist
    const fs = require('fs');
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Import models to ensure they're registered
    require('../models/Signal');
    require('../models/Trade');
    
    // Sync models (create tables)
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
  closeDatabase
}; 