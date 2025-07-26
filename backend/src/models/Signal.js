const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Signal = sequelize.define('Signal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  action: {
    type: DataTypes.ENUM('BUY', 'SELL', 'HOLD'),
    allowNull: false,
    validate: {
      isIn: [['BUY', 'SELL', 'HOLD']]
    }
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  price: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  strategy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'TradingView'
  },
  timeframe: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: '1h',
    validate: {
      isIn: [['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']]
    }
  },
  source: {
    type: DataTypes.ENUM('tradingview_webhook', 'manual', 'api'),
    allowNull: false,
    defaultValue: 'manual'
  },
  status: {
    type: DataTypes.ENUM('active', 'executed', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  takeProfit1: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  takeProfit2: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  stopLoss: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  leverage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 125
    }
  },
  targetHit: {
    type: DataTypes.ENUM('none', 'tp1', 'tp2', 'sl'),
    allowNull: false,
    defaultValue: 'none'
  },
  targetHitAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  targetPrice: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'signals',
  timestamps: true,
  indexes: [
    {
      fields: ['symbol']
    },
    {
      fields: ['action']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['symbol', 'action']
    }
  ]
});

module.exports = { Signal }; 