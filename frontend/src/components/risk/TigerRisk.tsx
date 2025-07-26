'use client'

import React, { useState, useEffect } from 'react'

export default function TigerRisk() {
  const [portfolioValue, setPortfolioValue] = useState<string>('')
  const [riskPercentage, setRiskPercentage] = useState<string>('')
  const [entryPrice, setEntryPrice] = useState<string>('')
  const [stopLoss, setStopLoss] = useState<string>('')
  const [takeProfit, setTakeProfit] = useState<string>('')
  const [leverage, setLeverage] = useState<number>(1)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Convert strings to numbers for calculations
  const portfolioValueNum = parseFloat(portfolioValue) || 0
  const riskPercentageNum = parseFloat(riskPercentage) || 0
  const entryPriceNum = parseFloat(entryPrice) || 0
  const stopLossNum = parseFloat(stopLoss) || 0
  const takeProfitNum = parseFloat(takeProfit) || 0

  // Risk Calculations
  const maxRiskAmount = (portfolioValueNum * riskPercentageNum) / 100
  const priceDistance = Math.abs(entryPriceNum - stopLossNum)
  const riskPerUnit = priceDistance
  
  // Position size based on risk amount (leverage doesn't change this!)
  const positionSize = riskPerUnit > 0 ? maxRiskAmount / riskPerUnit : 0
  const notionalValue = positionSize * entryPriceNum
  
  // Margin required (with leverage you need less margin)
  const marginRequired = notionalValue / leverage
  const leveragedPosition = notionalValue // Total position value
  
  // Risk/Reward Ratio
  const profitDistance = Math.abs(takeProfitNum - entryPriceNum)
  const riskRewardRatio = riskPerUnit > 0 ? profitDistance / riskPerUnit : 0
  
  // Potential P&L (leverage doesn't change your risk amount!)
  const potentialLoss = maxRiskAmount  // Your actual loss stays the same
  const potentialProfit = (profitDistance * positionSize)  // Profit based on position

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals)
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          color: '#ffffff'
        }}>
          Loading Tiger RISK...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input[type="number"]:focus {
          outline: none !important;
          border: 1px solid rgba(255,255,255,0.4) !important;
          box-shadow: none !important;
        }
        select:focus {
          outline: none !important;
          border: 1px solid rgba(255,255,255,0.4) !important;
          box-shadow: none !important;
        }
        select option {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
        }
        select option:hover {
          background-color: #333333 !important;
        }
      `}</style>
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
              <div className="parasite-subtitle">Professional Risk Management Suite</div>
            </div>
          </div>

          {/* Page Navigation */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
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
                Tiger RISK
              </div>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Left Column - Position Size Calculator */}
            <div className="parasite-card">
              <h2 className="section-header">
                POSITION SIZE CALCULATOR
              </h2>

              {/* Portfolio Settings */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '16px' }}>
                  Portfolio Settings
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Portfolio Value ($)
                    </label>
                    <input
                      type="number"
                      value={portfolioValue}
                      onChange={(e) => setPortfolioValue(e.target.value)}
                      onFocus={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      onClick={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Risk Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={riskPercentage}
                      onChange={(e) => setRiskPercentage(e.target.value)}
                      onFocus={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      onClick={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Trade Parameters */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '16px' }}>
                  Trade Parameters
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Entry Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      onFocus={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      onClick={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Stop Loss ($)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      onFocus={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      onClick={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Take Profit ($)
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      onFocus={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      onClick={(e) => setTimeout(() => (e.target as HTMLInputElement).select(), 10)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#888888', 
                      marginBottom: '8px' 
                    }}>
                      Leverage
                    </label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    >
                      {[1, 2, 5, 10, 20, 25, 50, 75, 100, 125].map(lev => (
                        <option key={lev} value={lev} style={{
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff'
                        }}>{lev}x</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Risk Analysis */}
            <div className="parasite-card">
              <h2 className="section-header">
                RISK ANALYSIS
              </h2>

              {/* Key Metrics */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div className="stat-item">
                    <span className="stat-label">Max Risk Amount:</span>
                    <span className="stat-value">
                      {formatCurrency(maxRiskAmount)}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Position Size:</span>
                    <span className="stat-value">
                      {formatNumber(positionSize, 4)} units
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div className="stat-item">
                    <span className="stat-label">Notional Value:</span>
                    <span className="stat-value">
                      {formatCurrency(notionalValue)}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Leveraged Position:</span>
                    <span className="stat-value">
                      {formatCurrency(leveragedPosition)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk/Reward */}
              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.1)', 
                paddingTop: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '16px' }}>
                  Risk/Reward Analysis
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px'
                }}>
                  <div className="stat-item">
                    <span className="stat-label">Risk/Reward Ratio:</span>
                    <span className="stat-value">
                      1:{formatNumber(riskRewardRatio, 2)}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Risk Quality:</span>
                    <span className="stat-value">
                      {riskRewardRatio >= 2 ? 'EXCELLENT' : riskRewardRatio >= 1 ? 'GOOD' : 'POOR'}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  marginTop: '16px'
                }}>
                  <div className="stat-item">
                    <span className="stat-label">Potential Loss:</span>
                    <span className="stat-value" style={{ color: '#ff4444' }}>
                      -{formatCurrency(potentialLoss)}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Potential Profit:</span>
                    <span className="stat-value" style={{ color: '#00ff88' }}>
                      +{formatCurrency(potentialProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Status */}
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#cccccc'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#ffffff' }}>
                  {riskPercentageNum > 5 ? 'HIGH RISK WARNING' : 'RISK LEVEL ACCEPTABLE'}
                </div>
                {riskPercentageNum > 5 ? (
                  'Risk percentage above 5% is considered high risk. Consider reducing position size.'
                ) : (
                  'Risk percentage is within acceptable range for professional trading.'
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section - Risk Management Rules */}
          <div className="parasite-card" style={{ marginTop: '24px' }}>
            <h2 className="section-header">
              TIGER HUNT PRO RISK MANAGEMENT RULES
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px' 
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>
                  NEVER RISK MORE THAN 2%
                </div>
                <div style={{ color: '#888888', fontSize: '0.875rem' }}>
                  Professional traders never risk more than 2% of their portfolio on a single trade.
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>
                  MINIMUM 1:2 RISK/REWARD
                </div>
                <div style={{ color: '#888888', fontSize: '0.875rem' }}>
                  Always aim for at least 1:2 risk/reward ratio for profitable long-term trading.
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>
                  ALWAYS USE STOP LOSSES
                </div>
                <div style={{ color: '#888888', fontSize: '0.875rem' }}>
                  Every trade must have a predefined stop loss. No exceptions.
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>
                  TRACK YOUR STATISTICS
                </div>
                <div style={{ color: '#888888', fontSize: '0.875rem' }}>
                  Monitor win rate, average R:R, and maximum drawdown regularly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 