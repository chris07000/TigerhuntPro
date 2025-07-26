'use client'

import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Signal } from '@/types/signal'
import tradeApi, { Trade, PortfolioAnalytics, CreateTradeFromSignalRequest } from '@/services/tradeApi'

export default function TradingJourney() {
  const { signals, connectionStatus, isConnected } = useWebSocket()
  const [trades, setTrades] = useState<Trade[]>([])
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'trades' | 'analytics'>('overview')
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isCreatingTrade, setIsCreatingTrade] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showManualTradeModal, setShowManualTradeModal] = useState(false)
  const [showCloseTradeModal, setShowCloseTradeModal] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [tradeQuantity, setTradeQuantity] = useState('1')
  const [tradeLeverage, setTradeLeverage] = useState('1')
  const [riskAmount, setRiskAmount] = useState('100')
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Manual trade form
  const [manualSymbol, setManualSymbol] = useState('BTCUSDT')
  const [manualAction, setManualAction] = useState<'BUY' | 'SELL' | 'LONG' | 'SHORT'>('BUY')
  const [manualEntryPrice, setManualEntryPrice] = useState('')
  const [manualNotes, setManualNotes] = useState('')
  
  // Close trade form
  const [exitPrice, setExitPrice] = useState('')

  useEffect(() => {
    setIsHydrated(true)
    fetchTrades()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchTrades = async () => {
    try {
      const result = await tradeApi.getAllTrades({ limit: 100 })
      setTrades(result.data)
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const result = await tradeApi.getPortfolioAnalytics(timeframe)
      setAnalytics(result)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const createTradeFromSignal = async (signal: Signal) => {
    if (isCreatingTrade) return
    
    setIsCreatingTrade(true)
    try {
      const tradeData: CreateTradeFromSignalRequest = {
        signalId: signal.id,
        quantity: parseFloat(tradeQuantity),
        leverage: parseInt(tradeLeverage),
        riskAmount: parseFloat(riskAmount)
      }
      
      await tradeApi.createTradeFromSignal(tradeData)
      await fetchTrades()
      await fetchAnalytics()
      setShowTradeModal(false)
      alert('Trade created successfully!')
      
    } catch (error) {
      console.error('Failed to create trade:', error)
      alert('Failed to create trade from signal')
    } finally {
      setIsCreatingTrade(false)
    }
  }

  const createManualTrade = async () => {
    if (isCreatingTrade) return
    
    setIsCreatingTrade(true)
    try {
      const tradeData = {
        symbol: manualSymbol,
        action: manualAction,
        entryPrice: parseFloat(manualEntryPrice),
        quantity: parseFloat(tradeQuantity),
        leverage: parseInt(tradeLeverage),
        riskAmount: parseFloat(riskAmount),
        notes: manualNotes
      }
      
      await tradeApi.createManualTrade(tradeData)
      await fetchTrades()
      await fetchAnalytics()
      setShowManualTradeModal(false)
      
      // Reset form
      setManualSymbol('BTCUSDT')
      setManualAction('BUY')
      setManualEntryPrice('')
      setManualNotes('')
      setTradeQuantity('1')
      setTradeLeverage('1')
      setRiskAmount('100')
      
      alert('Manual trade created successfully!')
      
    } catch (error) {
      console.error('Failed to create manual trade:', error)
      alert('Failed to create manual trade')
    } finally {
      setIsCreatingTrade(false)
    }
  }

  const closeTrade = async (tradeId: string, exitPrice: number) => {
    try {
      await tradeApi.closeTrade(tradeId, { exitPrice })
      await fetchTrades()
      await fetchAnalytics()
      setShowCloseTradeModal(false)
      setSelectedTrade(null)
      setExitPrice('')
      alert('Trade closed successfully!')
    } catch (error) {
      console.error('Failed to close trade:', error)
      alert('Failed to close trade')
    }
  }

  const formatTime = (timestamp: string) => {
    if (!isHydrated) return '00:00:00'
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDate = (timestamp: string) => {
    if (!isHydrated) return 'Loading...'
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercentage = (percent: number | string) => {
    const num = typeof percent === 'string' ? parseFloat(percent) : percent
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const openTrades = trades.filter(t => t.status === 'OPEN')
  const closedTrades = trades.filter(t => t.status === 'CLOSED')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="parasite-header">
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <img 
              src="/tigerlogo.png" 
              alt="Tiger Hunt Pro Logo"
              style={{
                height: '8rem',
                width: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <div className="parasite-title">TIGER HUNT PRO</div>
              <div className="parasite-subtitle">Trading Journey & Portfolio Management</div>
            </div>
          </div>

          {/* Page Navigation */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
            <a
              href="/dashboard"
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Live Signals
            </a>
            <div
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Trading Journey
            </div>
            <a
              href="/risk"
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Tiger RISK
            </a>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'signals', label: 'Live Signals' },
              { key: 'trades', label: 'My Trades' },
              { key: 'analytics', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '12px 24px',
                  border: activeTab === tab.key ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: activeTab === tab.key ? '#ffffff' : '#888888',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Portfolio Value */}
              <div className="parasite-card">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>Portfolio Value</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                    {analytics ? formatCurrency(analytics.overview.totalPnL) : '$0.00'}
                  </div>
                  <div style={{ fontSize: '12px', color: analytics && parseFloat(analytics.overview.totalPnL) >= 0 ? '#00ff88' : '#ff4444' }}>
                    {analytics ? formatPercentage(analytics.overview.totalPnL) : '+0.00%'}
                  </div>
                </div>
              </div>

              {/* Win Rate */}
              <div className="parasite-card">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>Win Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                    {analytics ? analytics.overview.winRate : '0.0'}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>
                    {analytics ? `${analytics.performance.winningTrades}W / ${analytics.performance.losingTrades}L` : '0W / 0L'}
                  </div>
                </div>
              </div>

              {/* Active Trades */}
              <div className="parasite-card">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>Active Trades</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                    {openTrades.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>
                    {analytics ? `${analytics.overview.totalTrades} Total` : '0 Total'}
                  </div>
                </div>
              </div>

              {/* Profit Factor */}
              <div className="parasite-card">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>Profit Factor</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                    {analytics ? analytics.overview.profitFactor : '0.00'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Risk Adjusted</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Trades */}
              <div className="parasite-card">
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>🔥 Recent Trades</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {trades.slice(0, 5).map(trade => (
                    <div key={trade.id} style={{ 
                      padding: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px', 
                      marginBottom: '8px',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ffffff' }}>
                            {trade.action} {trade.symbol}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888888' }}>
                            {formatDate(trade.entryDate)} • {formatTime(trade.entryDate)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: trade.pnl >= 0 ? '#00ff88' : '#ff4444' 
                          }}>
                            {formatCurrency(trade.pnl)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888888' }}>
                            {trade.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Signals */}
              <div className="parasite-card">
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>🎯 Live Signals</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {signals.slice(0, 5).map(signal => (
                    <div key={signal.id} style={{ 
                      padding: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px', 
                      marginBottom: '8px',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ffffff' }}>
                            {signal.action} {signal.symbol}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888888' }}>
                            {signal.price ? formatCurrency(signal.price) : 'N/A'} • {formatTime(signal.createdAt)}
                          </div>
                        </div>
                                                 <button
                           onClick={() => {
                             setSelectedSignal(signal)
                             setShowTradeModal(true)
                           }}
                           style={{
                             padding: '6px 12px',
                             border: '1px solid rgba(255,255,255,0.3)',
                             borderRadius: '4px',
                             backgroundColor: 'rgba(255,255,255,0.1)',
                             color: '#ffffff',
                             fontSize: '12px',
                             cursor: 'pointer'
                           }}
                         >
                           Trade
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div>
            {/* Add Manual Trade Button */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>My Trades</h2>
              <button
                onClick={() => setShowManualTradeModal(true)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                + Add Manual Trade
              </button>
            </div>

            {/* Open Trades */}
            {openTrades.length > 0 && (
              <div className="parasite-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>Open Trades ({openTrades.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {openTrades.map(trade => (
                    <div key={trade.id} style={{ 
                      padding: '16px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '16px' }}>
                              {trade.action} {trade.symbol}
                            </div>
                            <div style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              backgroundColor: 'rgba(255,165,0,0.1)', 
                              color: '#ffaa00', 
                              fontSize: '12px', 
                              fontWeight: '500' 
                            }}>
                              {trade.status}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#888888' }}>
                            <span>Entry: {formatCurrency(trade.entryPrice)}</span>
                            <span>Qty: {trade.quantity}</span>
                            <span>Leverage: {trade.leverage}x</span>
                            {trade.riskAmount && <span>Risk: {formatCurrency(trade.riskAmount)}</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
                            {formatDate(trade.entryDate)} • {formatTime(trade.entryDate)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: trade.pnl >= 0 ? '#00ff88' : '#ff4444',
                            fontSize: '16px',
                            marginBottom: '8px'
                          }}>
                            {formatCurrency(trade.pnl)}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTrade(trade)
                              setExitPrice('')
                              setShowCloseTradeModal(true)
                            }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid rgba(255,68,68,0.3)',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255,68,68,0.1)',
                              color: '#ff4444',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Close Trade
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closed Trades */}
            <div className="parasite-card">
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
                Trade History ({closedTrades.length})
              </h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {closedTrades.map(trade => (
                  <div key={trade.id} style={{ 
                    padding: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '16px' }}>
                            {trade.action} {trade.symbol}
                          </div>
                          <div style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: trade.pnl >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', 
                            color: trade.pnl >= 0 ? '#00ff88' : '#ff4444', 
                            fontSize: '12px', 
                            fontWeight: '500' 
                          }}>
                            {trade.pnl >= 0 ? 'WIN' : 'LOSS'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#888888' }}>
                          <span>Entry: {formatCurrency(trade.entryPrice)}</span>
                          {trade.exitPrice && <span>Exit: {formatCurrency(trade.exitPrice)}</span>}
                          <span>Qty: {trade.quantity}</span>
                          {trade.duration && <span>Duration: {Math.floor(trade.duration / 60)}h {trade.duration % 60}m</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
                          {formatDate(trade.entryDate)} → {trade.exitDate && formatDate(trade.exitDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: trade.pnl >= 0 ? '#00ff88' : '#ff4444',
                          fontSize: '18px'
                        }}>
                          {formatCurrency(trade.pnl)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888888' }}>
                          {formatPercentage(trade.pnlPercentage)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {closedTrades.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#888888', padding: '40px' }}>
                    No closed trades yet. Start trading to build your history!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div>
            {/* Timeframe Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {(['7d', '30d', '90d', '1y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                      padding: '8px 16px',
                      border: timeframe === tf ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      backgroundColor: timeframe === tf ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      color: timeframe === tf ? '#ffffff' : '#888888',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="parasite-card">
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
                  </svg>
                  Performance
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Total PnL:</span>
                    <span style={{ fontWeight: '600', color: parseFloat(analytics.overview.totalPnL) >= 0 ? '#00ff88' : '#ff4444' }}>
                      {formatCurrency(analytics.overview.totalPnL)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Win Rate:</span>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{analytics.overview.winRate}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Profit Factor:</span>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{analytics.overview.profitFactor}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Best Trade:</span>
                    <span style={{ fontWeight: '600', color: '#00ff88' }}>{formatCurrency(analytics.performance.bestTrade)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Worst Trade:</span>
                    <span style={{ fontWeight: '600', color: '#ff4444' }}>{formatCurrency(analytics.performance.worstTrade)}</span>
                  </div>
                </div>
              </div>

              <div className="parasite-card">
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>⚠️ Risk Management</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Max Drawdown:</span>
                    <span style={{ fontWeight: '600', color: '#ff4444' }}>{formatCurrency(analytics.risk.maxDrawdown)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Avg Risk/Trade:</span>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{formatCurrency(analytics.risk.avgRiskPerTrade)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Sharpe Ratio:</span>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{analytics.risk.sharpeRatio}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888888' }}>Total Risk:</span>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{formatCurrency(analytics.risk.totalRisk)}</span>
                  </div>
                </div>
              </div>

              <div className="parasite-card">
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                  </svg>
                  Symbol Performance
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(analytics.symbolPerformance).map(([symbol, perf]) => (
                    <div key={symbol} style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ffffff' }}>{symbol}</div>
                          <div style={{ fontSize: '12px', color: '#888888' }}>{perf.trades} trades</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600', color: perf.pnl >= 0 ? '#00ff88' : '#ff4444' }}>
                            {formatCurrency(perf.pnl)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888888' }}>
                            {perf.winRate.toFixed(1)}% win
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Modal */}
        {showTradeModal && selectedSignal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              maxWidth: '90vw'
            }}>
                             <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>
                 Create Trade from Signal
               </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  {selectedSignal.action} {selectedSignal.symbol}
                </div>
                <div style={{ fontSize: '14px', color: '#888888' }}>
                  Entry: {selectedSignal.price ? formatCurrency(selectedSignal.price) : 'N/A'}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                  Leverage
                </label>
                <input
                  type="number"
                  value={tradeLeverage}
                  onChange={(e) => setTradeLeverage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                  Risk Amount ($)
                </label>
                <input
                  type="number"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowTradeModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => createTradeFromSignal(selectedSignal)}
                  disabled={isCreatingTrade}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(0,255,136,0.3)',
                    backgroundColor: 'rgba(0,255,136,0.1)',
                    color: '#00ff88',
                    fontSize: '14px',
                    cursor: isCreatingTrade ? 'not-allowed' : 'pointer',
                    opacity: isCreatingTrade ? 0.6 : 1
                  }}
                >
                  {isCreatingTrade ? 'Creating...' : 'Create Trade'}
                </button>
              </div>
                         </div>
           </div>
         )}

        {/* Manual Trade Modal */}
        {showManualTradeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>
                Add Manual Trade
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={manualSymbol}
                    onChange={(e) => setManualSymbol(e.target.value.toUpperCase())}
                    placeholder="BTCUSDT"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Action
                  </label>
                  <select
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Entry Price ($)
                  </label>
                  <input
                    type="number"
                    value={manualEntryPrice}
                    onChange={(e) => setManualEntryPrice(e.target.value)}
                    placeholder="45000.00"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Leverage
                  </label>
                  <input
                    type="number"
                    value={tradeLeverage}
                    onChange={(e) => setTradeLeverage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Risk Amount ($)
                  </label>
                  <input
                    type="number"
                    value={riskAmount}
                    onChange={(e) => setRiskAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Trade notes, strategy, or reasoning..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowManualTradeModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createManualTrade}
                  disabled={isCreatingTrade || !manualSymbol || !manualEntryPrice}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: isCreatingTrade || !manualSymbol || !manualEntryPrice ? 'not-allowed' : 'pointer',
                    opacity: isCreatingTrade || !manualSymbol || !manualEntryPrice ? 0.6 : 1
                  }}
                >
                  {isCreatingTrade ? 'Creating...' : 'Create Trade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Trade Modal */}
        {showCloseTradeModal && selectedTrade && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>
                Close Trade
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  {selectedTrade.action} {selectedTrade.symbol}
                </div>
                <div style={{ fontSize: '14px', color: '#888888' }}>
                  Entry: {formatCurrency(selectedTrade.entryPrice)} | Qty: {selectedTrade.quantity}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                  Exit Price ($)
                </label>
                <input
                  type="number"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="Current market price"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowCloseTradeModal(false)
                    setSelectedTrade(null)
                    setExitPrice('')
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => closeTrade(selectedTrade.id, parseFloat(exitPrice))}
                  disabled={!exitPrice}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,68,68,0.3)',
                    backgroundColor: 'rgba(255,68,68,0.1)',
                    color: '#ff4444',
                    fontSize: '14px',
                    cursor: !exitPrice ? 'not-allowed' : 'pointer',
                    opacity: !exitPrice ? 0.6 : 1
                  }}
                >
                  Close Trade
                </button>
              </div>
            </div>
          </div>
        )}
       </div>
     </div>
   )
 } 