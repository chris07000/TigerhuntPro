'use client'

import React, { useState, useEffect } from 'react'
import { Signal } from '@/types/signal'

interface SignalCardProps {
  signal: Signal
  onClick?: () => void
}

export default function SignalCard({ signal, onClick }: SignalCardProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Fix hydration issues with timestamps
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const getActionClass = (action: string) => {
    switch (action) {
      case 'BUY': return 'signal-action-buy'
      case 'SELL': return 'signal-action-sell'
      case 'HOLD': return 'signal-action-hold'
      default: return 'signal-action-hold'
    }
  }

  const getCardClass = (action: string) => {
    switch (action) {
      case 'BUY': return 'signal-card signal-card-buy'
      case 'SELL': return 'signal-card signal-card-sell'
      case 'HOLD': return 'signal-card signal-card-hold'
      default: return 'signal-card'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7,14L5,12L10,7L15,12L13,14L10,11L7,14Z"/></svg>
      case 'SELL': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7,10L12,15L17,10L15,8L12,11L9,8L7,10Z"/></svg>
      case 'HOLD': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>
      default: return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/></svg>
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'tradingview_webhook': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/></svg>
      case 'manual': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3A2,2 0 0,1 21,5V9A2,2 0 0,1 19,11H5A2,2 0 0,1 3,9V5A2,2 0 0,1 5,3H19M19,5H5V9H19V5Z"/></svg>
      case 'api': return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59,13.41C11,13.8 11,14.4 10.59,14.81C10.2,15.2 9.6,15.2 9.19,14.81L7.78,13.4L6.37,14.81C6,15.2 5.4,15.2 5,14.81C4.6,14.4 4.6,13.8 5,13.41L6.41,12L5,10.59C4.6,10.2 4.6,9.6 5,9.19C5.4,8.8 6,8.8 6.37,9.19L7.78,10.6L9.19,9.19C9.6,8.8 10.2,8.8 10.59,9.19C11,9.6 11,10.2 10.59,10.59L9.18,12L10.59,13.41M21.19,14.81L19.78,13.4L18.37,14.81C18,15.2 17.4,15.2 17,14.81C16.6,14.4 16.6,13.8 17,13.41L18.41,12L17,10.59C16.6,10.2 16.6,9.6 17,9.19C17.4,8.8 18,8.8 18.37,9.19L19.78,10.6L21.19,9.19C21.6,8.8 22.2,8.8 22.59,9.19C23,9.6 23,10.2 22.59,10.59L21.18,12L22.59,13.41C23,13.8 23,14.4 22.59,14.81C22.2,15.2 21.6,15.2 21.19,14.81Z"/></svg>
      default: return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/></svg>
    }
  }

  const formatTime = (timestamp: string) => {
    if (!isHydrated) return 'Loading...' // Placeholder during SSR
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'NOW'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className={getCardClass(signal.action)} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        {/* Left side - Main info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              {getActionIcon(signal.action)}
            </div>
            <div>
              <h3 className="signal-symbol">
                {signal.symbol}
              </h3>
              <div className={getActionClass(signal.action)}>
                {signal.action}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#888888' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                </svg>
              </span>
                              <span className="signal-price">${signal.price ? signal.price.toLocaleString('en-US') : 'N/A'}</span>
            </div>
            {signal.strategy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                <span>🎯</span>
                <span>{signal.strategy}</span>
              </div>
            )}
            {signal.timeframe && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                <span>⏰</span>
                <span>{signal.timeframe}</span>
              </div>
            )}
          </div>
          
          {/* Trading Parameters - TP/SL */}
          {(signal.takeProfit1 || signal.stopLoss || signal.leverage) && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {signal.leverage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                  <span>Leverage: {signal.leverage}x</span>
                </div>
              )}
              {signal.stopLoss && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                  <span>Stop Loss: ${signal.stopLoss.toLocaleString('en-US')}</span>
                </div>
              )}
              {signal.takeProfit1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                  <span>TP1: ${signal.takeProfit1.toLocaleString('en-US')}</span>
                </div>
              )}
              {signal.takeProfit2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="signal-meta">
                  <span>TP2: ${signal.takeProfit2.toLocaleString('en-US')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Status and time */}
        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <span>{getSourceIcon(signal.source)}</span>
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              {signal.status}
            </span>
          </div>
          
          <p className="signal-meta" style={{ margin: 0 }}>
            {formatTime(signal.createdAt)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {signal.notes && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <p className="signal-meta" style={{ margin: 0, fontSize: '0.75rem' }}>
            💬 {signal.notes}
          </p>
        </div>
      )}
    </div>
  )
} 