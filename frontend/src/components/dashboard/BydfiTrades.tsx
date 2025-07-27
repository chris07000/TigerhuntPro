'use client'

import React, { useState, useEffect } from 'react'

interface BydfiPosition {
  id: string
  symbol: string
  qty: string
  entryPrice: string
  markPrice: string
  liqPrice: string
  unrealizedPnl: string
  unrealizedRoi: string
  positionPnl: string
  timestamp: string
}

interface BydfiTradesProps {
  walletAddress?: string
  onSignalCreated?: () => void | Promise<void>
}

export default function BydfiTrades({ walletAddress, onSignalCreated }: BydfiTradesProps) {
  const [positions, setPositions] = useState<BydfiPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

  // Fetch BYDFI positions data
  const fetchBydfiData = async () => {
    try {
      const response = await fetch('https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-positions')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.positions)) {
        setPositions(data.positions)
        setLastUpdate(new Date().toLocaleString())
        setConnectionStatus('connected')
      } else {
        setPositions([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch BYDFI data:', error)
      setConnectionStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBydfiData()
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchBydfiData, 15000)
    return () => clearInterval(interval)
  }, [])

  const formatPnL = (pnl: string) => {
    const numPnl = parseFloat(pnl?.replace(/[,$]/g, '') || '0')
    const color = numPnl >= 0 ? '#00ff88' : '#ff6b6b'
    const sign = numPnl >= 0 ? '+' : ''
    return { color, text: `${sign}$${numPnl.toFixed(2)}` }
  }

  const formatPrice = (price: string) => {
    return price?.replace(/[,$]/g, '') || '0'
  }

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffa500',
            animation: 'pulse 2s infinite'
          }} />
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            BYDFI Treasury Account
          </h3>
        </div>
        <div style={{ color: '#888888', textAlign: 'center', padding: '40px 0' }}>
          Loading BYDFI positions...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: connectionStatus === 'connected' ? '#00ff88' : 
                           connectionStatus === 'connecting' ? '#ffa500' : '#ff6b6b'
          }} />
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            BYDFI Treasury Account
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {lastUpdate && (
            <span style={{ color: '#888888', fontSize: '12px' }}>
              Last update: {lastUpdate}
            </span>
          )}
          <button
            onClick={fetchBydfiData}
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus === 'disconnected' && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          color: '#ff6b6b',
          fontSize: '14px'
        }}>
          ⚠️ Connection to BYDFI failed. Make sure the scraping script is running.
        </div>
      )}

      {/* Positions Table */}
      {positions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#888888',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Active Positions</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Open positions in BYDFI will appear here automatically
          </div>
        </div>
      ) : (
        <div style={{ 
          overflowX: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Size</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Entry Price</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Mark Price</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Liq.Price</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Unrealized PnL</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>ROI%</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => {
                const pnlFormatted = formatPnL(position.unrealizedPnl)
                const roiFormatted = formatPnL(position.unrealizedRoi)
                
                return (
                  <tr key={position.id || index} style={{ 
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                  }}>
                    <td style={{ padding: '12px', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                      {position.symbol}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '14px' }}>
                      {position.qty}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#888888', fontSize: '14px' }}>
                      ${formatPrice(position.entryPrice)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#888888', fontSize: '14px' }}>
                      ${formatPrice(position.markPrice)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#888888', fontSize: '14px' }}>
                      ${formatPrice(position.liqPrice)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      color: pnlFormatted.color, 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      {pnlFormatted.text}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      color: roiFormatted.color, 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      {position.unrealizedRoi}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructions for scraping */}
      {positions.length === 0 && connectionStatus === 'connected' && (
        <div style={{
          background: 'rgba(255, 165, 0, 0.1)',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          color: '#ffa500',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 Setup Instructions:</div>
          <div>1. Open BYDFI positions page in another tab</div>
          <div>2. Copy and paste the scraping script in browser console</div>
          <div>3. Positions will automatically appear here</div>
        </div>
      )}
    </div>
  )
} 