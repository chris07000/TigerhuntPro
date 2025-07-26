'use client'

import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { signalApi } from '@/services/api'
import { CreateSignalRequest } from '@/types/signal'
import AdminLogin from '@/components/AdminLogin'

export default function TradingPage() {
  const { signals, connectionStatus, isConnected } = useWebSocket()
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [analysis, setAnalysis] = useState('')
  const [isCreatingSignal, setIsCreatingSignal] = useState(false)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Trading parameters
  const [leverage, setLeverage] = useState(10)
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit1, setTakeProfit1] = useState('')
  const [takeProfit2, setTakeProfit2] = useState('')
  const [riskReward, setRiskReward] = useState('1:2')

  // Live crypto prices from Binance API
  const [livePrices, setLivePrices] = useState<{ [key: string]: { price: number, change: number } }>({})
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT']
  const leverageOptions = [1, 2, 5, 10, 20, 25, 50, 75, 100, 125]

  // Fix hydration issues with timestamps
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Fetch live prices from Binance API
  const fetchLivePrices = async () => {
    try {
      // Get 24hr ticker statistics for all symbols
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
      const data = await response.json()
      
      const priceData: { [key: string]: { price: number, change: number } } = {}
      
      symbols.forEach(symbol => {
        const ticker = data.find((item: any) => item.symbol === symbol)
        if (ticker) {
          priceData[symbol] = {
            price: parseFloat(ticker.lastPrice),
            change: parseFloat(ticker.priceChangePercent)
          }
        }
      })
      
      setLivePrices(priceData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching live prices:', error)
      // Fallback to previous prices if API fails
    }
  }

  // Update prices every 5 seconds
  useEffect(() => {
    // Initial fetch
    fetchLivePrices()
    
    // Set up interval for updates
    const interval = setInterval(fetchLivePrices, 5000) // 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Update current price when symbol changes or prices update
  useEffect(() => {
    const symbolData = livePrices[selectedSymbol]
    if (symbolData) {
      setCurrentPrice(symbolData.price)
      setPriceChange24h(symbolData.change)
    }
  }, [selectedSymbol, livePrices])

  const createSignal = async (action: 'BUY' | 'SELL' | 'HOLD') => {
    if (!currentPrice) return
    
    setIsCreatingSignal(true)
    try {
      const analysisText = analysis || `${action} signal based on technical analysis`
              const entryInfo = `Entry: $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      const leverageInfo = `⚡ Leverage: ${leverage}x`
      const stopLossInfo = `🛑 Stop Loss: ${stopLoss || 'Market based'}`
      const tp1Info = `🎯 TP1: ${takeProfit1 || 'TBA'}`
      const tp2Info = `🎯 TP2: ${takeProfit2 || 'TBA'}`
              const rrInfo = `R:R: ${riskReward}`
      const analysisInfo = analysis ? `📝 Analysis: ${analysis}` : ''

      const signalData: CreateSignalRequest = {
        action,
        symbol: selectedSymbol,
        price: currentPrice,
        strategy: 'Tiger Hunt Pro Analysis',
        timeframe: '1h',
        notes: [analysisText, '', entryInfo, leverageInfo, stopLossInfo, tp1Info, tp2Info, rrInfo, '', analysisInfo].filter(Boolean).join('\n')
      }

      await signalApi.createSignal(signalData)
      
      // Clear form
      setAnalysis('')
      setStopLoss('')
      setTakeProfit1('')
      setTakeProfit2('')
      
      // Show success feedback
      setTimeout(() => setIsCreatingSignal(false), 1000)
    } catch (error) {
      console.error('Failed to create signal:', error)
      setIsCreatingSignal(false)
    }
  }

  const calculateSuggestedLevels = (action: 'BUY' | 'SELL') => {
    if (!currentPrice) return
    
    if (action === 'BUY') {
      const sl = (currentPrice * 0.97).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      const tp1 = (currentPrice * 1.02).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      const tp2 = (currentPrice * 1.05).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      setStopLoss(sl)
      setTakeProfit1(tp1)
      setTakeProfit2(tp2)
      setRiskReward('1:2')
    } else {
      const sl = (currentPrice * 1.03).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      const tp1 = (currentPrice * 0.98).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      const tp2 = (currentPrice * 0.95).toFixed(selectedSymbol.includes('USDT') && currentPrice < 1 ? 4 : 2)
      setStopLoss(sl)
      setTakeProfit1(tp1)
      setTakeProfit2(tp2)
      setRiskReward('1:2')
    }
  }

  const recentSignals = signals
    .filter(s => s.symbol === selectedSymbol)
    .slice(0, 5)

  const getPriceColor = () => {
    if (priceChange24h > 0) return '#00ff88' // Green for positive
    if (priceChange24h < 0) return '#ff4444' // Red for negative
    return '#ffffff' // White for neutral
  }

  const formatPrice = (price: number) => {
    // American formatting: commas for thousands, dots for decimals
    if (price < 1) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
      })
    }
    if (price < 100) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    }
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const formatTime = (timestamp: string) => {
    if (!isHydrated) return '00:00:00' // Placeholder during SSR
    if (!timestamp) return 'N/A'
    
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleTimeString()
  }

  const formatTimeOnly = (date: Date) => {
    if (!isHydrated) return '00:00:00' // Placeholder during SSR
    if (!date) return 'N/A'
    
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleTimeString()
  }

  return (
      <AdminLogin>
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="parasite-header">
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src="/tigerlogo.png" 
                alt="Tiger Hunt Pro Logo"
                style={{
                  height: '8rem', // MEGA GROOT TIGER LOGO! 🐅
                  width: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Hide logo if file doesn't exist
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div>
                <h1 className="parasite-title">TIGER HUNT PRO</h1>
                <div className="parasite-subtitle">Signal Creation & Analysis Dashboard</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="status-indicator">
                <span>{isConnected ? '🟢' : '🔴'}</span>
                <span style={{ color: isConnected ? '#ffffff' : '#888888' }}>
                  {isConnected ? 'BROADCASTING LIVE' : 'OFFLINE'}
                </span>
              </div>
              <a href="/dashboard" className="btn-parasite">
                CLIENT DASHBOARD
              </a>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#666666',
                fontFamily: 'Consolas, monospace'
              }}>
                ADMIN MODE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            
            {/* Main Trading View */}
            <div>
              {/* Symbol Selection */}
              <div className="parasite-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>SYMBOL:</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {symbols.map(symbol => {
                      const symbolData = livePrices[symbol]
                      return (
                        <button
                          key={symbol}
                          onClick={() => setSelectedSymbol(symbol)}
                          className="btn-parasite"
                          style={{
                            backgroundColor: selectedSymbol === symbol ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                            border: selectedSymbol === symbol ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
                            fontSize: '0.875rem',
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span>{symbol}</span>
                          {symbolData && (
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: symbolData.change >= 0 ? '#00ff88' : '#ff4444' 
                            }}>
                              {symbolData.change >= 0 ? '+' : ''}{symbolData.change.toFixed(2)}%
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Real-time Price Display */}
              <div className="parasite-card" style={{ marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <h2 style={{ 
                    color: getPriceColor(), 
                    fontSize: '2.5rem', 
                    fontFamily: 'Consolas, monospace',
                    margin: '0 0 8px 0'
                  }}>
                    ${formatPrice(currentPrice)}
                  </h2>
                  <div style={{ color: '#888888', fontSize: '1rem', marginBottom: '8px' }}>
                    {selectedSymbol} • Live from Binance
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    color: getPriceColor(),
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#666666',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Last update: {formatTimeOnly(lastUpdate)}
                  </div>
                </div>
              </div>

              {/* Trading Parameters */}
              <div className="parasite-card" style={{ marginBottom: '20px' }}>
                <h3 className="section-header">⚙ TRADING PARAMETERS</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {/* Leverage */}
                  <div>
                    <label className="form-label">LEVERAGE</label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="parasite-input"
                      style={{ fontFamily: 'Consolas, monospace' }}
                    >
                      {leverageOptions.map(lev => (
                        <option key={lev} value={lev}>{lev}x</option>
                      ))}
                    </select>
                  </div>

                  {/* Risk/Reward */}
                  <div>
                    <label className="form-label">RISK:REWARD</label>
                    <select
                      value={riskReward}
                      onChange={(e) => setRiskReward(e.target.value)}
                      className="parasite-input"
                    >
                      <option value="1:1">1:1</option>
                      <option value="1:2">1:2</option>
                      <option value="1:3">1:3</option>
                      <option value="1:4">1:4</option>
                      <option value="1:5">1:5</option>
                    </select>
                  </div>

                  {/* Stop Loss */}
                  <div>
                    <label className="form-label">STOP LOSS</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="parasite-input"
                      placeholder="SL Price"
                      style={{ fontFamily: 'Consolas, monospace' }}
                    />
                  </div>

                  {/* Take Profit 1 */}
                  <div>
                    <label className="form-label">TAKE PROFIT 1</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={takeProfit1}
                      onChange={(e) => setTakeProfit1(e.target.value)}
                      className="parasite-input"
                      placeholder="TP1 Price"
                      style={{ fontFamily: 'Consolas, monospace' }}
                    />
                  </div>

                  {/* Take Profit 2 */}
                  <div>
                    <label className="form-label">TAKE PROFIT 2</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={takeProfit2}
                      onChange={(e) => setTakeProfit2(e.target.value)}
                      className="parasite-input"
                      placeholder="TP2 Price"
                      style={{ fontFamily: 'Consolas, monospace' }}
                    />
                  </div>
                </div>

                {/* Quick Calculation Buttons */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => calculateSuggestedLevels('BUY')}
                    className="btn-parasite"
                    style={{ fontSize: '0.875rem' }}
                  >
                    🧮 Calculate LONG Levels
                  </button>
                  <button
                    onClick={() => calculateSuggestedLevels('SELL')}
                    className="btn-parasite"
                    style={{ fontSize: '0.875rem' }}
                  >
                    🧮 Calculate SHORT Levels
                  </button>
                </div>
              </div>

              {/* Analysis Notes */}
              <div className="parasite-card">
                <h3 className="section-header">📝 TECHNICAL ANALYSIS</h3>
                <textarea
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="parasite-input"
                  placeholder="Enter your technical analysis, chart patterns, indicators, market sentiment..."
                  style={{ 
                    height: '120px', 
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Quick Signal Actions */}
              <div className="parasite-card">
                <h3 className="section-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                </svg>
                BROADCAST SIGNALS
              </h3>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#888888', 
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Send signals to all connected clients
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => createSignal('BUY')}
                    disabled={isCreatingSignal || !isConnected || !currentPrice}
                    className="btn-parasite"
                    style={{ 
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (isCreatingSignal || !isConnected || !currentPrice) ? 0.5 : 1
                    }}
                  >
                    🚀 SEND LONG SIGNAL
                  </button>
                  
                  <button
                    onClick={() => createSignal('SELL')}
                    disabled={isCreatingSignal || !isConnected || !currentPrice}
                    className="btn-parasite"
                    style={{ 
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (isCreatingSignal || !isConnected || !currentPrice) ? 0.5 : 1
                    }}
                  >
                    📉 SEND SHORT SIGNAL
                  </button>
                  
                  <button
                    onClick={() => createSignal('HOLD')}
                    disabled={isCreatingSignal || !isConnected || !currentPrice}
                    className="btn-parasite"
                    style={{ 
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (isCreatingSignal || !isConnected || !currentPrice) ? 0.5 : 1
                    }}
                  >
                    ⏸ SEND HOLD SIGNAL
                  </button>
                </div>
                
                {isCreatingSignal && (
                  <div style={{ 
                    marginTop: '16px', 
                    textAlign: 'center',
                    color: '#888888',
                    fontSize: '0.875rem'
                  }}>
                    Broadcasting signal to all clients...
                  </div>
                )}
              </div>

              {/* Signal Management */}
              <div className="parasite-card">
                <h3 className="section-header">🗑️ MANAGE SIGNALS</h3>
                <div style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '16px' }}>
                  Admin controls • Delete signals
                </div>
                
                {signals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {signals.slice(0, 10).map((signal) => (
                      <div 
                        key={signal.id}
                        style={{
                          padding: '12px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span>{signal.action === 'BUY' ? '🚀' : signal.action === 'SELL' ? '📉' : '⏸'}</span>
                              <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                                {signal.action} {signal.symbol}
                              </span>
                            </div>
                                                         <div style={{ color: '#888888', fontSize: '0.75rem', marginBottom: '4px' }}>
                               ${signal.price ? signal.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} • {formatTime(signal.createdAt)}
                             </div>
                            {signal.strategy && (
                              <div style={{ color: '#666666', fontSize: '0.75rem' }}>
                                {signal.strategy}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete ${signal.action} signal for ${signal.symbol}?`)) {
                                try {
                                  await signalApi.deleteSignal(signal.id)
                                  console.log(`Signal ${signal.id} deleted successfully`)
                                  // WebSocket will handle the UI update automatically
                                } catch (error) {
                                  console.error('Failed to delete signal:', error)
                                  console.error('Error details:', error)
                                  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                  alert(`Failed to delete signal: ${errorMessage}`)
                                }
                              }
                            }}
                            style={{
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                              border: '1px solid rgba(255, 68, 68, 0.3)',
                              color: '#ff4444',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 68, 68, 0.2)';
                              (e.target as HTMLElement).style.borderColor = 'rgba(255, 68, 68, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
                              (e.target as HTMLElement).style.borderColor = 'rgba(255, 68, 68, 0.3)'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {signals.length > 10 && (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#666666', 
                        padding: '8px',
                        fontSize: '0.75rem'
                      }}>
                        Showing latest 10 signals
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666666', 
                    padding: '20px',
                    fontSize: '0.875rem'
                  }}>
                    No signals to manage
                  </div>
                )}
              </div>

              {/* Live Market Overview */}
              <div className="parasite-card">
                <h3 className="section-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
                  </svg>
                  LIVE MARKET
                </h3>
                <div style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '16px' }}>
                  All symbols • 24h change
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {symbols.map(symbol => {
                    const symbolData = livePrices[symbol]
                    if (!symbolData) return null
                    
                    return (
                      <div 
                        key={symbol}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                          {symbol}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#ffffff', fontSize: '0.875rem', fontFamily: 'Consolas, monospace' }}>
                            ${formatPrice(symbolData.price)}
                          </div>
                          <div style={{ 
                            color: symbolData.change >= 0 ? '#00ff88' : '#ff4444',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {symbolData.change >= 0 ? '+' : ''}{symbolData.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Trading Stats */}
              <div className="parasite-card">
                <h3 className="section-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                  </svg>
                  TRADING STATS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="stat-item">
                    <span className="stat-label">Total Signals:</span>
                    <span className="stat-value">{signals.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Today's Signals:</span>
                    <span className="stat-value">
                      {signals.filter(s => {
                        const today = new Date().toDateString()
                        return new Date(s.createdAt).toDateString() === today
                      }).length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{selectedSymbol} Signals:</span>
                    <span className="stat-value">
                      {signals.filter(s => s.symbol === selectedSymbol).length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Current Leverage:</span>
                    <span className="stat-value">{leverage}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLogin>
  )
}