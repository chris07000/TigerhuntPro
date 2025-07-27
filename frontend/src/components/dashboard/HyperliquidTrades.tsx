'use client'

import React, { useState, useEffect, useRef } from 'react'
import hyperliquidApi, { HyperliquidAccountSummary, HyperliquidFill } from '@/services/hyperliquidApi'
import { signalApi } from '@/services/api'

interface HyperliquidTradesProps {
  walletAddress?: string;
  onSignalCreated?: () => void | Promise<void>;
}

export default function HyperliquidTrades({ walletAddress, onSignalCreated }: HyperliquidTradesProps) {
  const [accountSummary, setAccountSummary] = useState<HyperliquidAccountSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoSignalEnabled, setAutoSignalEnabled] = useState(true)
  
  // Store previous positions to detect new trades
  const previousPositionsRef = useRef<Set<string>>(new Set())
  const isFirstLoadRef = useRef(true)
  const hasInitializedRef = useRef(false)
  const recentSignalsRef = useRef(new Map<string, number>()) // Track recent signals with timestamps

  // Tiger Hunt Pro Treasury wallet address for live tracking
  const HYPERLIQUID_WALLET_ADDRESS = '0xB30d664f1df93d65425d833f434f4fbDc7ae7D63'
  const activeAddress = walletAddress || HYPERLIQUID_WALLET_ADDRESS



  // Function to detect new positions and auto-create signals
  const detectNewPositionsAndCreateSignals = async (currentSummary: HyperliquidAccountSummary, forceSignals = false) => {
    // Only log if forced or first load (reduce console spam)
    if (forceSignals || isFirstLoadRef.current) {
      console.log('🔍 AUTO-SIGNAL CHECK', {
        autoSignalEnabled,
        positionsCount: currentSummary.assetPositions?.length || 0,
        forceSignals,
        hasInitialized: hasInitializedRef.current,
        previousPositionsCount: previousPositionsRef.current.size
      })
    }

    if (!autoSignalEnabled || !currentSummary.assetPositions) {
      return
    }

    const currentPositions = new Set<string>()
    const newPositions: Array<{
      symbol: string
      rawSymbol: string
      side: 'LONG' | 'SHORT'
      size: string
      entryPrice: string
      leverage: string
    }> = []

    // Process current positions
    currentSummary.assetPositions.forEach(asset => {
      const formatted = hyperliquidApi.formatPosition(asset.position)
      
      // Create a more specific position key that includes entry price to avoid duplicates
      const entryPrice = asset.position.entryPx || '0'
      const positionKey = `${formatted.symbol}_${formatted.side}_${parseFloat(entryPrice).toFixed(4)}`
      currentPositions.add(positionKey)

      // Check if this is a new position 
      // Only create signals for truly NEW positions after initialization
      const isNewPosition = !previousPositionsRef.current.has(positionKey)
      const shouldCreateSignal = forceSignals || (isNewPosition && hasInitializedRef.current)

      // Only log position details if it's a new position or forced
      if (shouldCreateSignal || forceSignals) {
        console.log('📊 Position detected:', {
          symbol: formatted.symbol,
          side: formatted.side,
          entryPrice: entryPrice,
          positionKey: positionKey,
          isNewPosition,
          shouldCreateSignal,
          inPreviousSet: previousPositionsRef.current.has(positionKey)
        })
      }
      
      if (shouldCreateSignal) {
        newPositions.push({
          symbol: formatted.symbol,
          rawSymbol: asset.position.coin || formatted.symbol,
          side: formatted.side as 'LONG' | 'SHORT',
          size: formatted.size,
          entryPrice: entryPrice,
          leverage: formatted.leverage.toString()
        })
      }
    })

    // Create signals for new positions
    for (const position of newPositions) {
      try {
        // Check if we've recently sent a signal for this position (prevent duplicates)
        const signalKey = `${position.symbol}_${position.side}_${position.entryPrice}`
        const now = Date.now()
        const recentSignalTime = recentSignalsRef.current.get(signalKey)
        
        // If we sent a signal for this exact position in the last 5 minutes, skip it
        if (recentSignalTime && (now - recentSignalTime) < 5 * 60 * 1000) {
          const minutesAgo = Math.round((now - recentSignalTime) / (60 * 1000))
          console.log(`⏭️ Skipping duplicate signal for ${signalKey} (sent ${minutesAgo} minutes ago)`)
          continue
        }
        
        console.log('🎯 Creating auto-signal for new position:', position)
        
        // Get real TP/SL from your Hyperliquid orders
        console.log('🔍 Fetching real TP/SL orders for', position.symbol)
        
        const entryPrice = parseFloat(position.entryPrice)
        
        if (!entryPrice || entryPrice <= 0) {
          console.error('❌ Invalid entry price for', position.symbol, entryPrice)
          continue
        }
        
        let stopLoss = null
        let takeProfit = null
        
        try {
          // Fetch ALL orders (including trigger/conditional orders) to get real TP/SL
          const allOrders = await hyperliquidApi.getAllOrders(activeAddress)
          console.log('🔍 Looking for orders with coin =', position.rawSymbol)
          
          // Find TP/SL orders for this symbol (use rawSymbol for matching)
          // Prioritize reduce-only orders (these are typically TP/SL)
          const allPositionOrders = allOrders.filter((order: any) => 
            order.coin === position.rawSymbol
          )
          
          const reduceOnlyOrders = allPositionOrders.filter((order: any) => 
            order.reduceOnly || order.isReduceOnly
          )
          
          // Use reduce-only orders if available, otherwise use all orders
          const positionOrders = reduceOnlyOrders.length > 0 ? reduceOnlyOrders : allPositionOrders
          
                  // Debug: Found orders for position
          
          // Look for stop loss and take profit orders
          // Analyzing orders for TP/SL detection
          
          for (const order of positionOrders) {
            // Extract price from different order types
            // For trigger orders (Take Profit Market, Stop Market), ALWAYS use triggerPx
            let orderPrice = 0;
            
            if (order.isTrigger && order.triggerPx) {
              orderPrice = parseFloat(order.triggerPx);
            } else if (order.triggerPx) {
              orderPrice = parseFloat(order.triggerPx);
            } else if (order.limitPx) {
              orderPrice = parseFloat(order.limitPx);
            } else {
              orderPrice = parseFloat(order.px || order.price || 0);
            }
            
            if (orderPrice > 0) {
              // For SHORT positions: TP below entry, SL above entry  
              // For LONG positions: TP above entry, SL below entry
              const isShort = position.side === 'SHORT'
              
              // Check if this is a reduce-only order (typically TP/SL)
              const isReduceOnlyOrder = order.reduceOnly || order.isReduceOnly;
              
              if (isShort) {
                // SHORT: TP should be below entry, SL can be above OR below entry (depending on strategy)
                // Checking SHORT order for TP/SL
                
                // Check for Take Profit (below entry)
                if (orderPrice < entryPrice && !takeProfit) {
                  takeProfit = orderPrice
                  // Found Take Profit for SHORT position
                }
                // Check for Stop Loss (can be above OR below entry)
                else if (!stopLoss && isReduceOnlyOrder) {
                  // Filter out liquidation orders (usually very high prices)
                  const isLikelyLiquidation = orderPrice > entryPrice * 1.05; // 5% above entry = likely liquidation
                  
                  if (!isLikelyLiquidation) {
                    stopLoss = orderPrice
                    const direction = orderPrice > entryPrice ? 'above' : 'below';
                    // Found Stop Loss for SHORT position
                  }
                }
                // Handle remaining orders
                else if (orderPrice > entryPrice && !takeProfit && orderPrice > (stopLoss || 0)) {
                  // If no TP below entry found, use higher order as TP (but not liquidation)
                  const isLikelyLiquidation = orderPrice > entryPrice * 1.05;
                  if (!isLikelyLiquidation) {
                    takeProfit = orderPrice
                    console.log(`💰 Found TP for SHORT ${position.symbol}: $${takeProfit} (higher order used as TP)`)
                  } else {
                    console.log(`⚠️ Skipping likely liquidation order for TP: $${orderPrice}`)
                  }
                } else {
                  console.log(`⚠️ Order $${orderPrice} doesn't match TP/SL criteria for SHORT position`)
                }
              } else {
                // LONG: TP should be above entry, SL below entry
                console.log(`🔍 Checking LONG order: $${orderPrice} vs entry $${entryPrice}, reduceOnly: ${isReduceOnlyOrder}`)
                
                // Check for Take Profit (above entry)
                if (orderPrice > entryPrice && !takeProfit) {
                  takeProfit = orderPrice
                  console.log(`💰 Found TP for LONG ${position.symbol}: $${takeProfit} (above entry $${entryPrice})`)
                }
                // Check for Stop Loss (below entry)
                else if (orderPrice < entryPrice && !stopLoss && isReduceOnlyOrder) {
                  // Filter out liquidation orders for LONG (usually very low prices, >20% below entry)
                  const isLikelyLiquidation = orderPrice < entryPrice * 0.8; // 20% below entry = likely liquidation for LONG
                  
                  if (!isLikelyLiquidation) {
                    stopLoss = orderPrice
                    console.log(`🛑 Found SL for LONG ${position.symbol}: $${stopLoss} (below entry $${entryPrice})`)
                  } else {
                    console.log(`⚠️ Skipping likely liquidation order: $${orderPrice} (${((1-orderPrice/entryPrice)*100).toFixed(1)}% below entry)`)
                  }
                } else {
                  console.log(`⚠️ Order $${orderPrice} doesn't match TP/SL criteria for LONG position`)
                }
              }
            } else {
              console.log(`❌ Invalid order price: ${orderPrice}`)
            }
          }
          
        } catch (error) {
          console.error('❌ Failed to fetch open orders:', error)
        }
        
        // Create signal if we found at least one TP or SL order
        if (!stopLoss && !takeProfit) {
          console.log('⚠️ No TP/SL orders found for', position.symbol, '- skipping auto-signal creation')
          console.log('💡 Please set TP/SL orders in Hyperliquid to enable auto-signals')
          continue
        }
        
        if (!takeProfit) {
          console.log('💡 No TP order found for', position.symbol, '- signal will be created with SL only')
        }
        if (!stopLoss) {
          console.log('💡 No SL order found for', position.symbol, '- signal will be created with TP only')
        }

        console.log('✅ Found real TP/SL orders:', { 
          symbol: position.symbol,
          entry: entryPrice,
          takeProfit,
          stopLoss
        })

        // Convert Hyperliquid symbol to signal format (keep as USD pairs to match your trading)
        const symbolMapping: { [key: string]: string } = {
          'AAVE': 'AAVEUSD',
          'ADA': 'ADAUSD', 
          'ETH': 'ETHUSD',
          'BTC': 'BTCUSD',
          'XRP': 'XRPUSD',
          'SOL': 'SOLUSD',
          'DOT': 'DOTUSD',
          'MATIC': 'MATICUSD',
          'AVAX': 'AVAXUSD',
          'LINK': 'LINKUSD',
          'BNB': 'BNBUSD',
          'DOGE': 'DOGEUSD',
          'LTC': 'LTCUSD',
          'UNI': 'UNIUSD',
          'ATOM': 'ATOMUSD',
          'ICP': 'ICPUSD',
          'FIL': 'FILUSD',
          'APT': 'APTUSD',
          'NEAR': 'NEARUSD',
          'OP': 'OPUSD',
          'ARB': 'ARBUSD',
          'SUI': 'SUIUSD'
        };

        const hyperliquidSymbol = position.symbol?.toUpperCase() || '';
        console.log('🔄 Symbol conversion:', { 
          hyperliquidSymbol, 
          hasMapping: !!symbolMapping[hyperliquidSymbol] 
        });
        
        const signalSymbol = symbolMapping[hyperliquidSymbol];
        
        if (!signalSymbol) {
          console.error('❌ No symbol mapping found for', hyperliquidSymbol);
          console.log('💡 Add this symbol to symbolMapping:', `'${hyperliquidSymbol}': '${hyperliquidSymbol}USDT'`);
          continue;
        }
        
        console.log('✅ Symbol mapped:', hyperliquidSymbol, '→', signalSymbol);

        const signalData = {
          symbol: signalSymbol,
          action: (position.side === 'LONG' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
          price: parseFloat(entryPrice.toFixed(6)),
          leverage: Math.max(1, parseInt(position.leverage) || 1),
          ...(takeProfit && { takeProfit1: parseFloat(takeProfit.toFixed(6)) }),
          ...(stopLoss && { stopLoss: parseFloat(stopLoss.toFixed(6)) }),
          notes: `Auto-generated from Treasury trade\nPosition Size: ${position.size}\nLeverage: ${position.leverage}x\n✅ Using your real TP/SL orders from Hyperliquid`
        }

        console.log('📤 Sending signal data to backend:', signalData)

        const result = await signalApi.createSignal(signalData)

        // Track this signal to prevent duplicates
        recentSignalsRef.current.set(signalKey, now)
        
        // Clean old entries from recent signals map (older than 10 minutes)
        const keysToDelete: string[] = []
        recentSignalsRef.current.forEach((timestamp, key) => {
          if (now - timestamp > 10 * 60 * 1000) {
            keysToDelete.push(key)
          }
        })
        keysToDelete.forEach(key => recentSignalsRef.current.delete(key))

        console.log('✅ Auto-signal created successfully:', result)
        console.log('🎯 Signal should now appear in dashboard and Discord!')
        
        // Trigger signals refresh on Dashboard
        if (onSignalCreated) {
          try {
            await onSignalCreated()
            console.log('🔄 Dashboard signals refreshed!')
          } catch (refreshError) {
            console.error('❌ Failed to refresh signals:', refreshError)
          }
        }
        
      } catch (error: any) {
        console.error('❌ Failed to create auto-signal for', position.symbol, error)
        if (error.response) {
          console.error('❌ Response error:', error.response.data)
        }
      }
    }

    // Update the previous positions reference
    previousPositionsRef.current = currentPositions

    // Mark first load as complete and enable auto-signal detection
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false
      console.log('✅ Position tracking started')
      console.log(`📝 Initial positions tracked: ${currentPositions.size} positions`)
      
      // Enable auto-signals after a delay to prevent immediate signals on refresh
      setTimeout(() => {
        hasInitializedRef.current = true
        console.log('✅ Auto-signal detection ready - future new positions will trigger signals')
      }, 10000) // 10 second delay to ensure stability
    }

    if (newPositions.length > 0) {
      console.log(`🚀 Created ${newPositions.length} auto-signals from Treasury trades!`)
      console.log('📊 Previous positions:', Array.from(previousPositionsRef.current))
      console.log('📊 Current positions:', Array.from(currentPositions))
    }
  }


  const fetchHyperliquidData = async (forceSignals = false) => {
    if (!activeAddress) return

    setLoading(true)
    setError(null)

    try {
      // Fetching treasury data with auto-signals
      
      // Fetch account summary
      const summary = await hyperliquidApi.getAccountSummary(activeAddress)
      // Processing account data and detecting auto-signals
      await detectNewPositionsAndCreateSignals(summary, forceSignals)

      setAccountSummary(summary)
      setLastUpdate(new Date())
      
      // Treasury data loaded successfully
      
    } catch (err: any) {
      console.error('❌ Failed to fetch Tiger Hunt Pro treasury data:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch treasury data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeAddress) {
      fetchHyperliquidData()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchHyperliquidData, 30000)
      return () => clearInterval(interval)
    }
  }, [activeAddress])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price)
  }

  const formatPnL = (pnl: number) => {
    const isPositive = pnl >= 0
    return (
      <span style={{ color: isPositive ? '#00ff88' : '#ff4444' }}>
        {isPositive ? '+' : ''}{formatPrice(pnl)}
      </span>
    )
  }

  const formatPercentage = (pct: number) => {
    const isPositive = pct >= 0
    return (
      <span style={{ color: isPositive ? '#00ff88' : '#ff4444' }}>
        {isPositive ? '+' : ''}{pct.toFixed(2)}%
      </span>
    )
  }

  // Always show the component since we have a default address

  return (
    <div className="parasite-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
          </svg>
          HYPERLIQUID TRADES
        </h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem', 
          color: '#666666', 
          marginBottom: '16px',
          fontFamily: 'Consolas, monospace'
        }}>
          <span>Treasury Wallet: {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#00ff88',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: '#00ff88', fontSize: '0.75rem' }}>LIVE</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdate && (
            <span style={{ color: '#666666', fontSize: '0.8rem' }}>
              Last sync: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          

          
          <button
            onClick={() => fetchHyperliquidData()}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '6px',
              color: '#00ff88',
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'rgba(255,68,68,0.1)', 
          border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#ff4444'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Account Summary - Horizontal Layout */}
      {accountSummary && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h4 style={{ color: '#ffffff', margin: 0 }}>Tiger Hunt Pro Account</h4>
            <span style={{ 
              fontSize: '0.7rem', 
              backgroundColor: 'rgba(0,255,136,0.1)', 
              color: '#00ff88', 
              padding: '2px 6px', 
              borderRadius: '4px',
              border: '1px solid rgba(0,255,136,0.3)'
            }}>
              LIVE TRADING
            </span>
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                onClick={() => setAutoSignalEnabled(!autoSignalEnabled)}
                style={{
                  fontSize: '0.7rem',
                  backgroundColor: autoSignalEnabled ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                  color: autoSignalEnabled ? '#00ff88' : '#888888',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: autoSignalEnabled ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                AUTO-SIGNALS {autoSignalEnabled ? 'ON' : 'OFF'}
              </button>
              

            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div className="stat-item">
              <span className="stat-label">Account Value:</span>
              <span className="stat-value">{formatPrice(parseFloat(accountSummary.marginSummary.accountValue))}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Total Position:</span>
              <span className="stat-value">{formatPrice(parseFloat(accountSummary.marginSummary.totalNtlPos))}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Margin Used:</span>
              <span className="stat-value">{formatPrice(parseFloat(accountSummary.marginSummary.totalMarginUsed))}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Withdrawable:</span>
              <span className="stat-value">{formatPrice(parseFloat(accountSummary.withdrawable))}</span>
            </div>
          </div>

          {/* Live Positions */}
          <div>
            <h5 style={{ color: '#ffffff', marginBottom: '12px' }}>
              Live Positions {accountSummary.assetPositions.length > 0 && `(${accountSummary.assetPositions.length})`}
            </h5>
            
            {accountSummary.assetPositions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#888888' }}>Symbol</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#888888' }}>Side</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: '#888888' }}>Size</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: '#888888' }}>PnL</th>
                      <th style={{ textAlign: 'center', padding: '8px', color: '#888888' }}>Lev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountSummary.assetPositions.map((asset, index) => {
                      const formatted = hyperliquidApi.formatPosition(asset.position)
                      return (
                        <tr key={`${formatted.symbol}-${formatted.side}-${index}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '8px', fontWeight: '600' }}>{formatted.symbol}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ 
                              color: formatted.side === 'LONG' ? '#00ff88' : '#ff4444',
                              fontWeight: '600'
                            }}>
                              {formatted.side}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>{formatted.size}</td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>{formatPnL(formatted.unrealizedPnl)}</td>
                          <td style={{ textAlign: 'center', padding: '8px' }}>{formatted.leverage}x</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888888' }}>
                No active positions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 