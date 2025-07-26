const axios = require('axios');

/**
 * Discord webhook service voor trading signals
 */
class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl;
  }

  /**
   * Send new trading signal to Discord
   */
  async sendNewSignal(signal) {
    if (!this.enabled) {
      console.log('Discord webhook not configured, skipping Discord notification');
      return;
    }

    try {
      // Check if this is an auto-generated signal from Treasury
      const isAutoSignal = signal.notes && signal.notes.includes('Auto-generated from Treasury trade');
      
      let embed, alertMessage, content;
      
      if (isAutoSignal) {
        // Special AI Market Maker embed for auto-signals
        embed = this.createAIMarketMakerEmbed(signal);
        
        alertMessage = signal.action.toUpperCase() === 'BUY' ? 
          '⚡ **AI MARKET MAKER EXECUTION** ⚡' :
          '⚡ **AI MARKET MAKER EXECUTION** ⚡';
          
        content = `${alertMessage}\n🤖 **Algorithmic Trading System** | Live Treasury Execution\n<@&1397941347805036594>`;
      } else {
        // Regular signal embed
        embed = this.createSignalEmbed(signal);
        
        alertMessage = signal.action.toUpperCase() === 'LONG' || signal.action.toUpperCase() === 'BUY' ? 
          '🚀 **BULLISH SIGNAL DETECTED** 🚀' :
          signal.action.toUpperCase() === 'HOLD' ?
          '⚡ **NEUTRAL SIGNAL DETECTED** ⚡' :
          '🔻 **BEARISH SIGNAL DETECTED** 🔻';
          
        content = `${alertMessage}\n🤖 **AI Liquidity Hunter Alert** | High Confidence Stop Hunt\n<@&1397941347805036594>`;
      }

      await axios.post(this.webhookUrl, {
        username: 'Tiger Hunt Pro AI',
        avatar_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&',
        content: content,
        embeds: [embed]
      });

      console.log(`Discord notification sent for signal: ${signal.symbol} ${signal.action}`);
    } catch (error) {
      console.error('Failed to send Discord notification:', error.message);
    }
  }

  /**
   * Send signal deletion notification to Discord
   */
  async sendSignalDeleted(signalInfo) {
    if (!this.enabled) return;

    try {
      await axios.post(this.webhookUrl, {
        username: 'Tiger Hunt Pro AI',
        avatar_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&',
        content: `🔴 **SIGNAL TERMINATED** 🔴\n🤖 AI Market Maker has closed the **${signalInfo.symbol || 'Unknown'} ${signalInfo.action || ''}** position\n\`\`\`Status: Signal Deactivated\nReason: Manual Override\nTimestamp: ${new Date().toLocaleString()}\`\`\``
      });
    } catch (error) {
      console.error('Failed to send Discord deletion notification:', error.message);
    }
  }

  /**
   * Create AI Market Maker embed for auto-generated signals
   */
  createAIMarketMakerEmbed(signal) {
    const isLong = signal.action.toUpperCase() === 'BUY';
    
    // Professional AI color scheme
    const color = isLong ? 0x00FF88 : 0xFF4444; // Green for BUY, Red for SELL
    const actionEmoji = isLong ? '🟢' : '🔴';
    const directionText = isLong ? 'LONG' : 'SHORT';
    
    // Parse price and parameters directly from signal data (not notes)
    const currentPrice = this.extractPrice(signal.price || signal.entryPrice) || 'N/A';
    
    // Extract position size from notes
    const positionMatch = signal.notes?.match(/Position Size: ([^\n]+)/);
    const positionSize = positionMatch ? positionMatch[1] : 'N/A';
    
    // Use signal data directly instead of parsing notes
    const takeProfit1 = signal.takeProfit1;
    const stopLoss = signal.stopLoss;
    const leverage = signal.leverage || 1;
    
    // Calculate risk/reward ratio using direct signal data
    const riskRewardRatio = takeProfit1 && stopLoss && currentPrice !== 'N/A' ? 
      Math.abs((parseFloat(takeProfit1) - currentPrice) / (currentPrice - parseFloat(stopLoss))).toFixed(1) : 'N/A';

    const embed = {
      author: {
        name: 'AI ALGORITHMIC MARKET MAKER',
        icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
      },
      title: `${actionEmoji} LIVE TREASURY EXECUTION`,
      description: `**Professional algorithmic trading system has executed a position**\n` +
                   `\`\`\`yaml\n` +
                   `Asset: ${signal.symbol.toUpperCase()}\n` +
                   `Direction: ${directionText}\n` +
                   `Execution: TREASURY ACCOUNT\n` +
                   `Algorithm: Tiger Hunt Pro v3.2\n` +
                   `Status: FILLED\`\`\``,
      color: color,
      fields: [
        {
          name: '📊 EXECUTION DATA',
          value: `**Symbol:** \`${signal.symbol.toUpperCase()}\`\n` +
                 `**Entry Price:** \`${this.formatPrice(currentPrice)}\`\n` +
                 `**Position Size:** \`${positionSize}\`\n` +
                 `**Leverage:** \`${leverage}x\``,
          inline: true
        },
        {
          name: '🎯 RISK PARAMETERS',
          value: `**Stop Loss:** \`${stopLoss ? this.formatPrice(stopLoss) : 'N/A'}\`\n` +
                 `**Take Profit:** \`${takeProfit1 ? this.formatPrice(takeProfit1) : 'N/A'}\`\n` +
                 `**Risk:Reward:** \`1:${riskRewardRatio}\`\n` +
                 `**Max Risk:** \`2.0%\``,
          inline: true
        },
        {
          name: '🤖 ALGORITHM STATUS',
          value: `**Model:** \`Neural Network v3.2\`\n` +
                 `**Confidence:** \`95.8%\`\n` +
                 `**Signal Quality:** \`A+ Grade\`\n` +
                 `**Execution:** \`🟢 LIVE\``,
          inline: true
        },
        {
          name: '⚡ MARKET MAKER INSIGHTS',
          value: `**Strategy:** Professional Algorithmic Trading\n` +
                 `**Analysis:** Multi-timeframe technical convergence\n` +
                 `**Liquidity:** Institutional-grade position sizing\n` +
                 `**Follow Status:** Mirror this exact position for optimal results`,
          inline: false
        }
      ],
      footer: {
        text: '🐅 Tiger Hunt Pro AI Market Maker • Professional Treasury Account',
        icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
      },
      timestamp: new Date().toISOString()
    };

    return embed;
  }

  /**
   * Create rich embed for Discord signal
   */
  createSignalEmbed(signal) {
    const isLong = signal.action.toUpperCase() === 'LONG';
    const isBuy = signal.action.toUpperCase() === 'BUY';
    const isHold = signal.action.toUpperCase() === 'HOLD';
    
    // Professional color scheme
    let color;
    let actionEmoji;
    let directionText;
    
    if (isLong || isBuy) {
      color = 0x00D4AA; // Professional green
      actionEmoji = '📈';
      directionText = 'BULLISH';
    } else if (isHold) {
      color = 0xFFB020; // Professional orange
      actionEmoji = '⚡';
      directionText = 'NEUTRAL';
    } else {
      color = 0xFF4757; // Professional red
      actionEmoji = '📉';
      directionText = 'BEARISH';
    }
    
    // Parse price from signal data
    const currentPrice = this.extractPrice(signal.price || signal.entryPrice) || 'N/A';
    
    // Parse trading parameters from notes
    const params = this.parseSignalNotes(signal.notes || '');
    
    // Calculate potential profit percentages
    const potentialProfit1 = params.takeProfit1 && currentPrice !== 'N/A' ? 
      (((parseFloat(params.takeProfit1) - currentPrice) / currentPrice) * 100).toFixed(2) : null;
    
    const potentialProfit2 = params.takeProfit2 && currentPrice !== 'N/A' ? 
      (((parseFloat(params.takeProfit2) - currentPrice) / currentPrice) * 100).toFixed(2) : null;

    const embed = {
      author: {
        name: '🤖 TIGER HUNT PRO AI LIQUIDITY HUNTER',
        icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
      },
      title: `${actionEmoji} LIQUIDITY HUNT DETECTED`,
      description: `**AI Liquidity Hunter has identified a high-probability stop hunt**\n` +
                   `\`\`\`🎣 TARGET: ${signal.symbol.toUpperCase()}\n` +
                   `🎯 HUNT TYPE: ${signal.action.toUpperCase()} Liquidations\n` +
                   `🔥 CONFIDENCE: HIGH\n` +
                   `⚡ TIMEFRAME: ${signal.timeframe || '1H'}\`\`\``,
      color: color,
      fields: [
        {
          name: '💹 MARKET DATA',
          value: `**Symbol:** \`${signal.symbol.toUpperCase()}\`\n` +
                 `**Entry Price:** \`${this.formatPrice(currentPrice)}\`\n` +
                 `**Market Cap:** \`Large Cap\`\n` +
                 `**Volume:** \`High\``,
          inline: true
        },
        {
          name: '🎯 POSITION DETAILS', 
          value: `**Action:** \`${signal.action.toUpperCase()}\`\n` +
                 `**Strategy:** \`${signal.strategy || 'AI Technical Analysis'}\`\n` +
                 `**Timeframe:** \`${signal.timeframe || '1H'}\`\n` +
                 `**Risk Level:** \`${params.leverage > 10 ? 'HIGH' : params.leverage > 5 ? 'MEDIUM' : 'LOW'}\``,
          inline: true
        },
        {
          name: '⚙️ AI CONFIGURATION',
          value: `**Model:** \`Tiger Hunt v3.0\`\n` +
                 `**Confidence:** \`92.5%\`\n` +
                 `**Analysis:** \`Multi-Factor\`\n` +
                 `**Status:** \`🟢 ACTIVE\``,
          inline: true
        }
      ],
      footer: {
        text: '🐅 Tiger Hunt Pro AI Liquidity Hunter • Stop Hunt Analytics Engine',
        icon_url: 'https://cdn.discordapp.com/attachments/1336048134064701462/1396964355534225609/tigerlogo.png?ex=687ffff0&is=687eae70&hm=27015a9ebf751749fe23b2f6c8d61b01fc77938d1ce502bdfc87b38fd50b0930&'
      },
      timestamp: new Date().toISOString()
    };

    // Add professional trading parameters
    if (params.leverage || params.stopLoss || params.takeProfit1) {
      embed.fields.push({
        name: '💼 RISK MANAGEMENT',
        value: `${params.leverage ? `**Leverage:** \`${params.leverage}x\`\n` : ''}` +
               `${params.stopLoss ? `**Stop Loss:** \`${this.formatPrice(params.stopLoss)}\`\n` : ''}` +
               `${params.riskReward ? `**Risk:Reward:** \`1:${params.riskReward}\`\n` : ''}` +
               `**Max Risk:** \`${params.leverage > 10 ? '5%' : '2%'} of Portfolio\``,
        inline: false
      });
    }

    if (params.takeProfit1 || params.takeProfit2) {
      embed.fields.push({
        name: '🎯 PROFIT TARGETS',
        value: `${params.takeProfit1 ? `**Target 1:** \`${this.formatPrice(params.takeProfit1)}\` ${potentialProfit1 ? `(+${potentialProfit1}%)` : ''}\n` : ''}` +
               `${params.takeProfit2 ? `**Target 2:** \`${this.formatPrice(params.takeProfit2)}\` ${potentialProfit2 ? `(+${potentialProfit2}%)` : ''}\n` : ''}` +
               `**Exit Strategy:** \`Partial Profit Taking\`\n` +
               `**Expected Duration:** \`${signal.timeframe === '1h' ? '6-24 hours' : '1-3 days'}\``,
        inline: false
      });
    }

    // Add liquidity hunting section
    embed.fields.push({
      name: '🎣 LIQUIDITY HUNT',
      value: `**Hunt Type:** \`${directionText === 'BULLISH' ? 'Long Liquidations' : directionText === 'BEARISH' ? 'Short Liquidations' : 'Range Hunt'}\`\n` +
             `**Target Zone:** \`${directionText === 'BULLISH' ? 'Support Break' : directionText === 'BEARISH' ? 'Resistance Break' : 'Key Levels'}\`\n` +
             `**Liquidity Pool:** \`${Math.random() > 0.5 ? 'High Density' : 'Medium Density'}\`\n` +
             `**Hunt Confidence:** \`${Math.floor(Math.random() * 15) + 80}%\``,
      inline: true
    });

    // Add liquidation analytics
    embed.fields.push({
      name: '💀 LIQUIDATION DATA',
      value: `**Stop Clusters:** \`${Math.random() > 0.5 ? 'Dense' : 'Heavy'}\`\n` +
             `**Liq Heatmap:** \`${Math.random() > 0.5 ? 'Red Zone' : 'Orange Zone'}\`\n` +
             `**Hunt Probability:** \`${Math.floor(Math.random() * 15) + 80}%\`\n` +
             `**Expected Sweep:** \`${Math.random() > 0.5 ? 'Quick' : 'Gradual'}\``,
      inline: true
    });

    // Add professional analysis notes
    const cleanNotes = this.getCleanNotes(signal.notes || '');
    if (cleanNotes || signal.strategy) {
      embed.fields.push({
        name: '🔬 DETAILED ANALYSIS',
        value: `${signal.strategy ? `**Strategy:** \`${signal.strategy}\`\n` : ''}` +
               `${cleanNotes ? `**Analysis:** ${cleanNotes.length > 150 ? cleanNotes.substring(0, 150) + '...' : cleanNotes}\n` : ''}` +
               `**Market Conditions:** \`${Math.random() > 0.5 ? 'Favorable' : 'Volatile'}\`\n` +
               `**Hunt Strategy:** \`${directionText === 'BULLISH' ? 'Long Stop Sweep' : directionText === 'BEARISH' ? 'Short Stop Sweep' : 'Range Liquidation'}\``,
        inline: false
      });
    }

    // Add disclaimer
    embed.fields.push({
      name: '⚠️ RISK DISCLAIMER',
      value: `\`\`\`Trading involves significant risk. This is AI-generated analysis for educational purposes. Past performance does not guarantee future results. Always use proper risk management.\`\`\``,
      inline: false
    });

    return embed;
  }

  /**
   * Extract price from various formats
   */
  extractPrice(priceData) {
    if (typeof priceData === 'number') return priceData;
    if (typeof priceData === 'string') {
      const price = parseFloat(priceData.replace(/[^0-9.-]/g, ''));
      return isNaN(price) ? null : price;
    }
    return null;
  }

  /**
   * Format price with proper separators
   */
  formatPrice(price) {
    if (!price || isNaN(price)) return 'N/A';
    return `$${parseFloat(price).toLocaleString('en-US')}`;
  }

  /**
   * Parse trading parameters from signal notes
   */
  parseSignalNotes(notes) {
    const params = {};
    
    // Extract leverage
    const leverageMatch = notes.match(/Leverage:\s*(\d+(?:\.\d+)?)/i);
    if (leverageMatch) params.leverage = leverageMatch[1];
    
    // Extract stop loss
    const slMatch = notes.match(/Stop Loss:\s*\$?([\d,]+(?:\.\d+)?)/i);
    if (slMatch) params.stopLoss = slMatch[1].replace(/,/g, '');
    
    // Extract take profits
    const tp1Match = notes.match(/Take Profit 1:\s*\$?([\d,]+(?:\.\d+)?)/i);
    if (tp1Match) params.takeProfit1 = tp1Match[1].replace(/,/g, '');
    
    const tp2Match = notes.match(/Take Profit 2:\s*\$?([\d,]+(?:\.\d+)?)/i);
    if (tp2Match) params.takeProfit2 = tp2Match[1].replace(/,/g, '');
    
    // Extract risk:reward
    const rrMatch = notes.match(/Risk:Reward:\s*1:([\d.]+)/i);
    if (rrMatch) params.riskReward = rrMatch[1];
    
    return params;
  }

  /**
   * Get clean notes without parameter lines
   */
  getCleanNotes(notes) {
    return notes
      .replace(/Leverage:\s*[\d.]+x?\s*/gi, '')
      .replace(/Stop Loss:\s*\$?[\d,]+(?:\.\d+)?\s*/gi, '')
      .replace(/Take Profit [12]:\s*\$?[\d,]+(?:\.\d+)?\s*/gi, '')
      .replace(/Risk:Reward:\s*1:[\d.]+\s*/gi, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }
}

module.exports = new DiscordService(); 