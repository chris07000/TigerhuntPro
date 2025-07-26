'use client'

import React from 'react'
import { Signal } from '@/types/signal'
import SignalCard from './SignalCard'

interface SignalListProps {
  signals: Signal[]
  onSignalClick?: (signal: Signal) => void
}

export default function SignalList({ signals, onSignalClick }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '16px', 
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
          </svg>
        </div>
        <h3>NO SIGNALS AVAILABLE</h3>
        <p>Waiting for new signals from TradingView or create a manual signal.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {signals.map((signal, index) => (
        <SignalCard
          key={signal.id || `signal-${index}`}
          signal={signal}
          onClick={() => onSignalClick?.(signal)}
        />
      ))}
    </div>
  )
} 