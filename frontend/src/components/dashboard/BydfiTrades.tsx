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

interface BydfiAccountData {
  balance: string
  pnl: string
  marginRatio: string
  maintenanceMargin: string
  marginBalance: string
  vipLevel: string
  makerFee: string
  takerFee: string
  timestamp: string
}

interface BydfiTradesProps {
  walletAddress?: string
  onSignalCreated?: () => void | Promise<void>
}

export default function BydfiTrades({ walletAddress, onSignalCreated }: BydfiTradesProps) {
  const [positions, setPositions] = useState<BydfiPosition[]>([])
  const [accountData, setAccountData] = useState<BydfiAccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

  // Fetch BYDFI positions and account data
  const fetchBydfiData = async () => {
    try {
      // Fetch positions
      const positionsResponse = await fetch('https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-positions')
      const positionsData = await positionsResponse.json()
      
      // Fetch account data
      const accountResponse = await fetch('https://tigerhunt-pro-backend-k742.vercel.app/api/bydfi-account')
      const accountResponseData = await accountResponse.json()
      
      if (positionsData.success && Array.isArray(positionsData.positions)) {
        setPositions(positionsData.positions)
        setLastUpdate(new Date().toLocaleString())
        setConnectionStatus('connected')
      } else {
        setPositions([])
      }
      
      if (accountResponseData.success && accountResponseData.account) {
        setAccountData(accountResponseData.account)
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

      {/* Account Summary */}
      {accountData && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Total Balance */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888888', fontSize: '12px', marginBottom: '4px' }}>Total Balance</div>
              <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
                ${parseFloat(accountData.balance || '0').toLocaleString()}
              </div>
              <div style={{ color: '#888888', fontSize: '11px' }}>USDT</div>
            </div>
            
            {/* Unrealized PnL */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888888', fontSize: '12px', marginBottom: '4px' }}>Unrealized PnL</div>
              <div style={{ 
                color: parseFloat(accountData.pnl || '0') >= 0 ? '#00ff88' : '#ff6b6b', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                {parseFloat(accountData.pnl || '0') >= 0 ? '+' : ''}${parseFloat(accountData.pnl || '0').toFixed(2)}
              </div>
              <div style={{ color: '#888888', fontSize: '11px' }}>USDT</div>
            </div>
            
            {/* Margin Ratio */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888888', fontSize: '12px', marginBottom: '4px' }}>Margin Ratio</div>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>
                {accountData.marginRatio || '0.00%'}
              </div>
              <div style={{ color: '#888888', fontSize: '11px' }}>Risk Level</div>
            </div>
            
            {/* VIP & Fees */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#888888', fontSize: '12px', marginBottom: '4px' }}>VIP Level</div>
              <div style={{ color: '#ffa500', fontSize: '16px', fontWeight: 'bold' }}>
                VIP {accountData.vipLevel || '0'}
              </div>
              <div style={{ color: '#888888', fontSize: '10px' }}>
                M: {accountData.makerFee || '0.02%'} | T: {accountData.takerFee || '0.06%'}
              </div>
            </div>
          </div>
        </div>
      )}

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


    </div>
  )
} 