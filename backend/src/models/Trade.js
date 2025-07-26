const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Trade = sequelize.define('Trade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'default_user' // For now, single user system
  },
  signalId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be null for manual trades
    references: {
      model: 'Signals',
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('BUY', 'SELL', 'LONG', 'SHORT'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED', 'PARTIALLY_CLOSED'),
    defaultValue: 'OPEN'
  },
  entryPrice: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false
  },
  exitPrice: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false
  },
  leverage: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  stopLoss: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  takeProfit1: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  takeProfit2: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  pnl: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0.00
  },
  pnlPercentage: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0.00
  },
  fees: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  entryDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  exitDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: true
  },
  riskAmount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  riskPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  }
}, {
  tableName: 'trades',
  timestamps: true
});

module.exports = { Trade }; 