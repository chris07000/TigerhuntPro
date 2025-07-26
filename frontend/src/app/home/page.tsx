'use client'

import React from 'react'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <div className="parasite-header">
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
            <img 
              src="/tigerlogo.png" 
              alt="Tiger Hunt Pro Logo"
              style={{
                height: '10rem', // GIGANTISCH TIGER LOGO! 🐅💥
                width: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Hide logo if file doesn't exist
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div className="parasite-title">TIGER HUNT PRO</div>
              <div className="parasite-subtitle">Professional Trading Signals Platform</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            
            {/* Welcome Section */}
            <div className="parasite-card" style={{ marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
              <h2 style={{ 
                color: '#ffffff', 
                fontSize: '2rem', 
                fontWeight: '600',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                WELCOME TO TIGER HUNT PRO
              </h2>
              <p style={{ color: '#888888', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
                Advanced trading signals platform with real-time analysis, WebSocket connectivity, 
                and professional-grade tools for serious traders.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/dashboard" className="btn-parasite" style={{ 
                  padding: '16px 32px', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
                  </svg>
                  LIVE SIGNALS
                </a>

                <a href="/journey" className="btn-parasite" style={{ 
                  padding: '16px 32px', 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  TRADING JOURNEY
                </a>
              </div>
            </div>

            {/* Features Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              
              {/* Live Signals Feature */}
              <div className="parasite-card">
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
                <h3 className="section-header" style={{ marginBottom: '12px' }}>LIVE SIGNALS</h3>
                <p style={{ color: '#888888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Read-only dashboard for viewing live trading signals in real-time. 
                  Monitor signal flow, connection status, and signal details as they arrive.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <a href="/dashboard" className="btn-parasite">VIEW SIGNALS</a>
                </div>
              </div>

              {/* Trading Journey Feature */}
              <div className="parasite-card">
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
                    <path d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V8C2,6.89 2.9,6 4,6H8V4C8,2.89 8.9,2 10,2M14,6V4H10V6H14Z"/>
                  </svg>
                </div>
                <h3 className="section-header" style={{ marginBottom: '12px' }}>TRADING JOURNEY</h3>
                <p style={{ color: '#888888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Complete portfolio management with trade tracking, PnL analytics, 
                  risk management, performance metrics, and trading journal functionality.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <a href="/journey" className="btn-parasite">START JOURNEY</a>
                </div>
              </div>

              {/* Real-time Broadcasting */}
              <div className="parasite-card">
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
                    <path d="M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                  </svg>
                </div>
                <h3 className="section-header" style={{ marginBottom: '12px' }}>LIVE BROADCASTING</h3>
                <p style={{ color: '#888888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  WebSocket-powered real-time signal broadcasting. Signals created 
                  by admin instantly appear on all client dashboards worldwide.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    color: '#666666', 
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '6px 8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '3px'
                  }}>
                    Real-time signal distribution
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="parasite-card">
              <h3 className="section-header">PLATFORM FEATURES</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginTop: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                    5+
                  </div>
                  <div style={{ color: '#888888', fontSize: '0.875rem' }}>TRADING PAIRS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                    ∞
                  </div>
                  <div style={{ color: '#888888', fontSize: '0.875rem' }}>SIGNAL CAPACITY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                    &lt;1s
                  </div>
                  <div style={{ color: '#888888', fontSize: '0.875rem' }}>REAL-TIME LATENCY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                    24/7
                  </div>
                  <div style={{ color: '#888888', fontSize: '0.875rem' }}>UPTIME</div>
                </div>
              </div>
            </div>

            {/* About Bitcoin Tiger Collective */}
            <div className="parasite-card" style={{ marginTop: '60px' }}>
              <div style={{ textAlign: 'center' }}>
                {/* Tiger Logo & Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <img 
                    src="/tigerlogo.png" 
                    alt="Bitcoin Tiger Collective" 
                    style={{
                      height: '64px',
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div>
                    <h3 className="section-header" style={{ 
                      marginBottom: '4px',
                      fontSize: '1.4rem'
                    }}>
                      BITCOIN TIGER COLLECTIVE
                    </h3>
                    <p style={{ 
                      color: '#888888', 
                      fontSize: '0.9rem',
                      margin: '0'
                    }}>
                      Professional Bitcoin & Lightning Network Development
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ 
                    color: '#cccccc', 
                    fontSize: '1rem', 
                    lineHeight: '1.7', 
                    marginBottom: '16px',
                    maxWidth: '800px',
                    margin: '0 auto 16px auto'
                  }}>
                    Tiger Hunt Pro is proudly developed by <strong style={{ color: '#ffffff' }}>Bitcoin Tiger Collective</strong>, 
                    specializing in Bitcoin ecosystem development and Lightning Network innovation.
                  </p>
                  <p style={{ 
                    color: '#cccccc', 
                    fontSize: '1rem', 
                    lineHeight: '1.7',
                    maxWidth: '800px',
                    margin: '0 auto'
                  }}>
                    Built on our existing <strong style={{ color: '#ffffff' }}>Ordinals</strong> project foundation, 
                    this platform combines enterprise-grade trading infrastructure with real-time signal distribution technology.
                  </p>
                </div>

                {/* Creator Info */}
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h4 style={{ 
                    color: '#ffffff', 
                    fontSize: '1.2rem', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    CREATED BY HENKY
                  </h4>
                  <p style={{ 
                    color: '#cccccc', 
                    fontSize: '1rem', 
                    lineHeight: '1.6', 
                    marginBottom: '16px'
                  }}>
                    <strong style={{ color: '#ffffff' }}>Master in Lightning Network</strong> technologies 
                    and Bitcoin infrastructure development.
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ color: '#888888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M11,4L6,14H10L9,20L18,8H12L11,4Z"/>
                      </svg>
                      Lightning Network Specialist
                    </div>
                    <div style={{ color: '#888888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/>
                      </svg>
                      Bitcoin Ordinals Developer
                    </div>
                    <div style={{ color: '#888888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z"/>
                      </svg>
                      Full-Stack Trading Systems
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div style={{ 
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  borderLeft: '4px solid rgba(255,255,255,0.3)'
                }}>
                  <p style={{ 
                    color: '#ffffff', 
                    fontSize: '1.1rem', 
                    fontStyle: 'italic',
                    fontWeight: '500',
                    margin: '0'
                  }}>
                    "Professional trading tools built by Bitcoin maximalists, for serious traders."
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