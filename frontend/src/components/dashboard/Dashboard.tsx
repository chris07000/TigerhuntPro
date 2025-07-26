'use client'

import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import SignalList from './SignalList'
import RealTimeStatus from './RealTimeStatus'
import HyperliquidTrades from './HyperliquidTrades'
import { Signal } from '@/types/signal'
import tradeApi, { Trade, PortfolioAnalytics, CreateTradeFromSignalRequest } from '@/services/tradeApi'

export default function Dashboard() {
  const { signals, connectionStatus, refreshSignals, isConnected } = useWebSocket()
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Trade management state
  const [trades, setTrades] = useState<Trade[]>([])
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState<'signals' | 'trades' | 'analytics'>('signals')
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isCreatingTrade, setIsCreatingTrade] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeQuantity, setTradeQuantity] = useState('1')
  const [tradeLeverage, setTradeLeverage] = useState('1')
  const [riskAmount, setRiskAmount] = useState('100')

  // Fix hydration issues with timestamps
  useEffect(() => {
    setIsHydrated(true)
    fetchTrades()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  // Fetch functions
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
      
    } catch (error) {
      console.error('Failed to create trade:', error)
      alert('Failed to create trade from signal')
    } finally {
      setIsCreatingTrade(false)
    }
  }

  const closeTrade = async (tradeId: string, exitPrice: number) => {
    try {
      await tradeApi.closeTrade(tradeId, { exitPrice })
      await fetchTrades()
      await fetchAnalytics()
    } catch (error) {
      console.error('Failed to close trade:', error)
      alert('Failed to close trade')
    }
  }

  const handleSignalClick = (signal: Signal) => {
    setSelectedSignal(signal)
  }

  const formatTime = (timestamp: string) => {
    if (!isHydrated) return '00:00:00' // Placeholder during SSR
    return new Date(timestamp).toLocaleTimeString()
  }

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
              <div className="parasite-title">TIGER HUNT PRO</div>
              <div className="parasite-subtitle">Live Trading Signals Dashboard</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
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
                Live Signals
              </div>
              <a
                href="/journey"
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
                Trading Journey
              </a>
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
            
            {/* Referral Button */}
            <a
              href="https://app.hyperliquid.xyz/join/TIGERHUNTPRO"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(255,165,0,0.4)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,165,0,0.1)',
                color: '#ffa500',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement
                target.style.backgroundColor = 'rgba(255,165,0,0.15)'
                target.style.borderColor = 'rgba(255,165,0,0.6)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement
                target.style.backgroundColor = 'rgba(255,165,0,0.1)'
                target.style.borderColor = 'rgba(255,165,0,0.4)'
              }}
            >
              Start Trading on Hyperliquid
            </a>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <RealTimeStatus 
              status={connectionStatus.status}
              clientId={connectionStatus.clientId}
            />
            

            
            <div style={{ 
              marginLeft: 'auto', 
              fontSize: '0.875rem', 
              color: '#666666',
              fontFamily: 'Consolas, monospace'
            }}>
              Signals by Tiger Hunt Pro • Read-Only
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container mx-auto px-6">
          {/* Hyperliquid Trades - Full Width */}
          <HyperliquidTrades onSignalCreated={refreshSignals} />
          
          <div className="charts-grid">
            {/* Signals List */}
            <div>
              <div className="parasite-card">
                <h2 className="section-header">
                  🔴 LIVE SIGNALS ({signals.length})
                </h2>
                
                <div className="status-indicator" style={{ marginBottom: '24px' }}>
                  <div className="status-dot"></div>
                  <span style={{ color: isConnected ? '#ffffff' : '#888888' }}>
                    {isConnected ? 'RECEIVING LIVE SIGNALS' : 'CONNECTION LOST'}
                  </span>
                  {isConnected && (
                    <span style={{ color: '#666666', fontSize: '0.75rem', marginLeft: '8px' }}>
                      • Real-time from Tiger Hunt Pro
                    </span>
                  )}
                </div>
                
                <SignalList 
                  signals={signals}
                  onSignalClick={handleSignalClick}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Connection Status */}
              <div className="parasite-card">
                <h3 className="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
          </svg>
          CONNECTION STATUS
        </h3>
                
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className="stat-value" style={{ 
                    color: connectionStatus.status === 'connected' ? '#ffffff' : '#888888' 
                  }}>
                    {connectionStatus.status === 'connected' && '🟢 CONNECTED'}
                    {connectionStatus.status === 'connecting' && '🟡 CONNECTING...'}
                    {connectionStatus.status === 'disconnected' && '🔴 DISCONNECTED'}
                  </span>
                </div>
                
                {connectionStatus.clientId && (
                  <div className="stat-item">
                    <span className="stat-label">Session ID:</span>
                    <span className="stat-value">
                      {connectionStatus.clientId.slice(0, 8)}...
                    </span>
                  </div>
                )}
                
                <div className="stat-item">
                  <span className="stat-label">Last Update:</span>
                  <span className="stat-value">
                    {formatTime(connectionStatus.timestamp)}
                  </span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Signal Source:</span>
                  <span className="stat-value">Tiger Hunt Pro</span>
                </div>
              </div>

              {/* Signal Details */}
              {selectedSignal && (
                <div className="parasite-card">
                  <h3 className="section-header">📋 SIGNAL DETAILS</h3>
                  
                  <div className="stat-item">
                    <span className="stat-label">Symbol:</span>
                    <span className="stat-value">{selectedSignal.symbol}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Action:</span>
                    <span className="stat-value">
                      {selectedSignal.action === 'BUY' && '🚀 BUY'}
                      {selectedSignal.action === 'SELL' && '📉 SELL'}  
                      {selectedSignal.action === 'HOLD' && '⏸ HOLD'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Entry Price:</span>
                    <span className="stat-value">
                      ${selectedSignal.price ? selectedSignal.price.toLocaleString('en-US') : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Strategy:</span>
                    <span className="stat-value">{selectedSignal.strategy}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Timeframe:</span>
                    <span className="stat-value">{selectedSignal.timeframe}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Signal Time:</span>
                    <span className="stat-value">
                      {formatTime(selectedSignal.createdAt)}
                    </span>
                  </div>
                  {selectedSignal.notes && (
                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '16px' }}>
                      <span className="stat-label" style={{ display: 'block', marginBottom: '8px' }}>Analysis:</span>
                      <p style={{ color: '#ffffff', fontSize: '0.875rem', lineHeight: '1.4' }}>{selectedSignal.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics */}
              <div className="parasite-card">
                <h3 className="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
          </svg>
          SIGNAL STATISTICS
        </h3>
                
                <div className="stat-item">
                  <span className="stat-label">Total Signals:</span>
                  <span className="stat-value">{signals.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">BUY Signals:</span>
                  <span className="stat-value">
                    {signals.filter(s => s.action === 'BUY').length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">SELL Signals:</span>
                  <span className="stat-value">
                    {signals.filter(s => s.action === 'SELL').length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">HOLD Signals:</span>
                  <span className="stat-value">
                    {signals.filter(s => s.action === 'HOLD').length}
                  </span>
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
              </div>

              {/* Disclaimer */}
              <div className="parasite-card">
                <h3 className="section-header">⚠ DISCLAIMER</h3>
                <div style={{ color: '#888888', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  <p style={{ margin: '0 0 12px 0' }}>
                    These signals are provided by Tiger Hunt Pro for informational purposes only.
                  </p>
                  <p style={{ margin: '0' }}>
                    Trading involves risk. Always do your own research and never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 