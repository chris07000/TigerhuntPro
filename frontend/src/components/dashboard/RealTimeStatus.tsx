'use client'

import React from 'react'

interface RealTimeStatusProps {
  status: 'connected' | 'connecting' | 'disconnected'
  clientId?: string
}

export default function RealTimeStatus({ status, clientId }: RealTimeStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'ONLINE'
      case 'connecting': return 'CONNECTING...'
      case 'disconnected': return 'OFFLINE'
      default: return 'UNKNOWN'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '🟢'
      case 'connecting': return '🟡'
      case 'disconnected': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="status-indicator">
      <span>{getStatusIcon()}</span>
      <span style={{ 
        color: status === 'connected' ? '#ffffff' : '#888888',
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: '0.875rem'
      }}>
        {getStatusText()}
      </span>
      {clientId && (
        <span style={{ 
          color: '#666666',
          fontSize: '0.75rem',
          fontFamily: 'Consolas, monospace'
        }}>
          {clientId.slice(0, 6)}...
        </span>
      )}
    </div>
  )
} 