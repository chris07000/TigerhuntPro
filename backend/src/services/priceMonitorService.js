const axios = require('axios');
const { Signal } = require('../models/Signal');
const discordService = require('./discordService');

/**
 * Price Monitoring Service voor Target Hit Detection
 * Monitort live prijzen via Binance API en detecteert target hits
 */
class PriceMonitorService {
  constructor() {
    this.isRunning = false;
    this.monitorInterval = null;
    this.prices = new Map(); // Cache voor live prijzen
    this.activeSignals = new Map(); // Cache voor actieve signals
    this.updateInterval = 10000; // 10 seconden
    this.binanceApiUrl = 'https://api.binance.com/api/v3';
  }

  /**
   * Start de price monitoring service
   */
  async start() {
    if (this.isRunning) {
      console.log('🎯 Price Monitor is already running');
      return;
    }

    console.log('🎯 Starting Tiger Hunt Pro Price Monitor...');
    this.isRunning = true;
    
    // Load actieve signals
    await this.loadActiveSignals();
    
    // Start monitoring loop
    this.monitorInterval = setInterval(async () => {
      await this.monitorPrices();
    }, this.updateInterval);
    
    console.log('✅ Price Monitor started - monitoring target hits every 10 seconds');
  }

  /**
   * Stop de price monitoring service
   */
  stop() {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping Price Monitor...');
    this.isRunning = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    console.log('✅ Price Monitor stopped');
  }

  /**
   * Load alle actieve signals met targets
   */
  async loadActiveSignals() {
    try {
      const signals = await Signal.findAll({
        where: {
          status: 'active',
          targetHit: 'none'
        }
      });

      this.activeSignals.clear();
      
      signals.forEach(signal => {
        if (signal.takeProfit1 || signal.takeProfit2 || signal.stopLoss) {
          this.activeSignals.set(signal.id, {
            id: signal.id,
            symbol: signal.symbol,
            action: signal.action,
            entryPrice: parseFloat(signal.price),
            takeProfit1: signal.takeProfit1 ? parseFloat(signal.takeProfit1) : null,
            takeProfit2: signal.takeProfit2 ? parseFloat(signal.takeProfit2) : null,
            stopLoss: signal.stopLoss ? parseFloat(signal.stopLoss) : null,
            leverage: signal.leverage || 1,
            createdAt: signal.createdAt
          });
        }
      });

      console.log(`📊 Loaded ${this.activeSignals.size} signals with targets for monitoring`);
    } catch (error) {
      console.error('❌ Failed to load active signals:', error.message);
    }
  }

  /**
   * Monitor alle prijzen en check voor target hits
   */
  async monitorPrices() {
    if (this.activeSignals.size === 0) {
      await this.loadActiveSignals(); // Reload als geen signals
      return;
    }

    try {
      // Haal alle unique symbols op
      const symbols = [...new Set([...this.activeSignals.values()].map(s => s.symbol.toUpperCase()))];
      
      // Haal live prijzen op van Binance
      await this.fetchLivePrices(symbols);
      
      // Check elke signal voor target hits
      for (const [signalId, signal] of this.activeSignals) {
        await this.checkTargetHit(signalId, signal);
      }
      
    } catch (error) {
      console.error('❌ Error in price monitoring:', error.message);
    }
  }

  /**
   * Haal live prijzen op van Binance API
   */
  async fetchLivePrices(symbols) {
    try {
      // Symbol mapping voor bekende crypto's
      const symbolMapping = {
        'AAVE': 'AAVEUSDT',
        'ADA': 'ADAUSDT', 
        'ETH': 'ETHUSDT',
        'BTC': 'BTCUSDT',
        'XRP': 'XRPUSDT',
        'SOL': 'SOLUSDT',
        'DOT': 'DOTUSDT',
        'MATIC': 'MATICUSDT',
        'AVAX': 'AVAXUSDT',
        'LINK': 'LINKUSDT'
      };

      // Converteer naar Binance formaat (bijv. ADAUSDT)
      const binanceSymbols = symbols.map(symbol => {
        const upperSymbol = symbol.toUpperCase();
        
        // If already USDT pair, use as-is
        if (upperSymbol.endsWith('USDT')) {
          return upperSymbol;
        }
        
        // Check explicit mapping for short symbols
        if (symbolMapping[upperSymbol]) {
          return symbolMapping[upperSymbol];
        }
        
        if (upperSymbol.includes('USD') && !upperSymbol.includes('USDT')) {
          return upperSymbol.replace('USD', 'USDT');
        }
        return `${upperSymbol}USDT`;
      });

      // Batch request voor alle prijzen
      const response = await axios.get(`${this.binanceApiUrl}/ticker/price`, {
        timeout: 5000
      });

      // Filter relevante prijzen
      response.data.forEach(ticker => {
        if (binanceSymbols.includes(ticker.symbol)) {
          // Find the matching original symbol
          const matchingSymbol = symbols.find(symbol => {
            const upperSymbol = symbol.toUpperCase();
            
            // Direct match for USDT pairs
            if (upperSymbol === ticker.symbol) return true;
            
            // Check mapping
            const mapped = symbolMapping[upperSymbol];
            if (mapped === ticker.symbol) return true;
            
            // Check USD conversion
            if (upperSymbol.replace('USD', 'USDT') === ticker.symbol) return true;
            
            // Check simple append
            if (`${upperSymbol}USDT` === ticker.symbol) return true;
            
            return false;
          });
          
          if (matchingSymbol) {
            this.prices.set(matchingSymbol.toUpperCase(), parseFloat(ticker.price));
          }
        }
      });

      console.log(`📈 Updated ${this.prices.size} live prices from Binance`);
      
    } catch (error) {
      console.error('❌ Failed to fetch Binance prices:', error.message);
      
      // Fallback: probeer individual calls
      for (const symbol of symbols) {
        await this.fetchSinglePrice(symbol);
      }
    }
  }

  /**
   * Haal één prijs op (fallback)
   */
  async fetchSinglePrice(symbol) {
    try {
      // Symbol mapping voor bekende crypto's
      const symbolMapping = {
        'AAVE': 'AAVEUSDT',
        'ADA': 'ADAUSDT', 
        'ETH': 'ETHUSDT',
        'BTC': 'BTCUSDT',
        'XRP': 'XRPUSDT',
        'SOL': 'SOLUSDT',
        'DOT': 'DOTUSDT',
        'MATIC': 'MATICUSDT',
        'AVAX': 'AVAXUSDT',
        'LINK': 'LINKUSDT'
      };

      const upperSymbol = symbol.toUpperCase();
      
      // Determine Binance symbol
      let binanceSymbol;
      if (upperSymbol.endsWith('USDT')) {
        binanceSymbol = upperSymbol;
      } else if (symbolMapping[upperSymbol]) {
        binanceSymbol = symbolMapping[upperSymbol];
      } else if (upperSymbol.includes('USD') && !upperSymbol.includes('USDT')) {
        binanceSymbol = upperSymbol.replace('USD', 'USDT');
      } else {
        binanceSymbol = `${upperSymbol}USDT`;
      }

      const response = await axios.get(`${this.binanceApiUrl}/ticker/price?symbol=${binanceSymbol}`, {
        timeout: 3000
      });

      this.prices.set(upperSymbol, parseFloat(response.data.price));
      
    } catch (error) {
      console.error(`❌ Failed to fetch price for ${symbol}:`, error.message);
    }
  }

  /**
   * Check of target hit is voor een signal
   */
  async checkTargetHit(signalId, signal) {
    const currentPrice = this.prices.get(signal.symbol.toUpperCase());
    
    if (!currentPrice) {
      console.log(`⚠️ No price data for ${signal.symbol}`);
      return;
    }

    let targetHit = null;
    let targetType = null;
    let targetPrice = null;

    // Check target hits gebaseerd op action
    if (signal.action === 'BUY' || signal.action === 'LONG') {
      // Voor LONG posities: TP boven entry, SL onder entry
      
      // Check Take Profit 1
      if (signal.takeProfit1 && currentPrice >= signal.takeProfit1) {
        targetHit = 'tp1';
        targetType = 'Take Profit 1';
        targetPrice = signal.takeProfit1;
      }
      // Check Take Profit 2 (alleen als TP1 nog niet geraakt)
      else if (signal.takeProfit2 && currentPrice >= signal.takeProfit2) {
        targetHit = 'tp2';
        targetType = 'Take Profit 2';
        targetPrice = signal.takeProfit2;
      }
      // Check Stop Loss
      else if (signal.stopLoss && currentPrice <= signal.stopLoss) {
        targetHit = 'sl';
        targetType = 'Stop Loss';
        targetPrice = signal.stopLoss;
      }
      
    } else if (signal.action === 'SELL' || signal.action === 'SHORT') {
      // Voor SHORT posities: TP onder entry, SL boven entry
      
      // Check Take Profit 1
      if (signal.takeProfit1 && currentPrice <= signal.takeProfit1) {
        targetHit = 'tp1';
        targetType = 'Take Profit 1';
        targetPrice = signal.takeProfit1;
      }
      // Check Take Profit 2
      else if (signal.takeProfit2 && currentPrice <= signal.takeProfit2) {
        targetHit = 'tp2';
        targetType = 'Take Profit 2';
        targetPrice = signal.takeProfit2;
      }
      // Check Stop Loss
      else if (signal.stopLoss && currentPrice >= signal.stopLoss) {
        targetHit = 'sl';
        targetType = 'Stop Loss';
        targetPrice = signal.stopLoss;
      }
    }

    // Als target geraakt, update signal en stuur notificatie
    if (targetHit) {
      await this.handleTargetHit(signalId, signal, targetHit, targetType, targetPrice, currentPrice);
    }
  }

  /**
   * Handle target hit - update signal en stuur Discord notificatie
   */
  async handleTargetHit(signalId, signal, targetHit, targetType, targetPrice, currentPrice) {
    try {
      console.log(`🎯 TARGET HIT! ${signal.symbol} ${targetType} @ $${currentPrice}`);

      // Update signal in database
      await Signal.update({
        targetHit: targetHit,
        targetHitAt: new Date(),
        targetPrice: targetPrice,
        status: targetHit === 'sl' ? 'cancelled' : 'executed' // SL = cancelled, TP = executed
      }, {
        where: { id: signalId }
      });

      // Remove from active monitoring
      this.activeSignals.delete(signalId);

      // Stuur Discord notificatie
      await this.sendTargetHitNotification(signal, targetType, targetPrice, currentPrice);

      console.log(`✅ Signal ${signalId} marked as ${targetHit} and removed from monitoring`);
      
    } catch (error) {
      console.error(`❌ Failed to handle target hit for ${signalId}:`, error.message);
    }
  }

  /**
   * Stuur Discord notificatie voor target hit
   */
  async sendTargetHitNotification(signal, targetType, targetPrice, currentPrice) {
    try {
      const isProfit = targetType.includes('Take Profit');
      const isLoss = targetType.includes('Stop Loss');
      
      const profit = isProfit ? ((currentPrice - signal.entryPrice) / signal.entryPrice * 100 * signal.leverage).toFixed(2) : null;
      const loss = isLoss ? ((signal.entryPrice - currentPrice) / signal.entryPrice * 100 * signal.leverage).toFixed(2) : null;

      // Emoji en kleur gebaseerd op resultaat
      const emoji = isProfit ? '🎯✅' : isLoss ? '🛑❌' : '⚡';
      const color = isProfit ? 0x00ff88 : isLoss ? 0xff4444 : 0xffa500;
      const title = isProfit ? 'TARGET HIT - PROFIT SECURED!' : isLoss ? 'STOP LOSS HIT' : 'TARGET REACHED';

      const embed = {
        author: {
          name: '🎯 TIGER HUNT PRO TARGET ALERT',
          icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
        },
        title: `${emoji} ${title}`,
        description: `**${signal.symbol.toUpperCase()} ${signal.action.toUpperCase()} position has hit ${targetType}**\n` +
                     `\`\`\`🎯 TRADE COMPLETED\n` +
                     `💰 ${targetType.toUpperCase()} EXECUTED\n` +
                     `⚡ AUTO-CLOSED\`\`\``,
        color: color,
        fields: [
          {
            name: '📊 TRADE DETAILS',
            value: `**Symbol:** \`${signal.symbol.toUpperCase()}\`\n` +
                   `**Action:** \`${signal.action.toUpperCase()}\`\n` +
                   `**Entry Price:** \`$${signal.entryPrice.toLocaleString()}\`\n` +
                   `**Target Price:** \`$${targetPrice.toLocaleString()}\`\n` +
                   `**Current Price:** \`$${currentPrice.toLocaleString()}\``,
            inline: true
          },
          {
            name: '💰 PERFORMANCE',
            value: `**Target Type:** \`${targetType}\`\n` +
                   `**Leverage:** \`${signal.leverage}x\`\n` +
                   `${isProfit ? `**Profit:** \`+${profit}%\`\n` : ''}` +
                   `${isLoss ? `**Loss:** \`-${loss}%\`\n` : ''}` +
                   `**Status:** \`${isProfit ? '✅ PROFIT' : isLoss ? '❌ LOSS' : '⚡ CLOSED'}\``,
            inline: true
          },
          {
            name: '⏰ TIMING',
            value: `**Trade Duration:** \`${this.getTradeLength(signal.createdAt)}\`\n` +
                   `**Hit Time:** \`${new Date().toLocaleString()}\`\n` +
                   `**Auto-Closed:** \`YES\`\n` +
                   `**Signal Removed:** \`YES\``,
            inline: true
          }
        ],
        footer: {
          text: '🐅 Tiger Hunt Pro Auto Trading System • Target Hit Detection',
          icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
        },
        timestamp: new Date().toISOString()
      };

      // Stuur notificatie via Discord webhook
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        await axios.post(webhookUrl, {
          username: 'Tiger Hunt Pro Auto Trader',
          avatar_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&',
          content: `${emoji} **${title}**\n🤖 **Auto Trading System Alert** | ${signal.symbol.toUpperCase()} ${signal.action.toUpperCase()}\n<@&1397941347805036594>`,
          embeds: [embed]
        });
      }

    } catch (error) {
      console.error('❌ Failed to send target hit notification:', error.message);
    }
  }

  /**
   * Bereken trade length
   */
  getTradeLength(startTime) {
    const diffMs = Date.now() - new Date(startTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days`;
  }

  /**
   * Add nieuwe signal voor monitoring
   */
  async addSignalToMonitor(signal) {
    if (signal.takeProfit1 || signal.takeProfit2 || signal.stopLoss) {
      this.activeSignals.set(signal.id, {
        id: signal.id,
        symbol: signal.symbol,
        action: signal.action,
        entryPrice: parseFloat(signal.price),
        takeProfit1: signal.takeProfit1 ? parseFloat(signal.takeProfit1) : null,
        takeProfit2: signal.takeProfit2 ? parseFloat(signal.takeProfit2) : null,
        stopLoss: signal.stopLoss ? parseFloat(signal.stopLoss) : null,
        leverage: signal.leverage || 1,
        createdAt: signal.createdAt
      });
      
      console.log(`📊 Added signal ${signal.id} (${signal.symbol}) to price monitoring`);
    }
  }

  /**
   * Remove signal from monitoring
   */
  removeSignalFromMonitor(signalId) {
    if (this.activeSignals.has(signalId)) {
      this.activeSignals.delete(signalId);
      console.log(`📊 Removed signal ${signalId} from price monitoring`);
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSignals: this.activeSignals.size,
      trackedPrices: this.prices.size,
      updateInterval: this.updateInterval / 1000 + ' seconds'
    };
  }
}

module.exports = new PriceMonitorService(); 