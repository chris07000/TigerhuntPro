'use client'

import React, { useState, useEffect } from 'react'

interface AdminLoginProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AdminLogin({ children, redirectTo = '/dashboard' }: AdminLoginProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem('tiger-admin-auth')
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    if (!adminPassword) {
      setError('Admin password not configured')
      return
    }

    if (password === adminPassword) {
      localStorage.setItem('tiger-admin-auth', 'authenticated')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tiger-admin-auth')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          color: '#ffffff'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
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
                  height: '8rem',
                  width: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <div className="parasite-title">TIGER HUNT PRO</div>
                <div className="parasite-subtitle">Admin Access Required</div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 'calc(100vh - 200px)',
          padding: '20px'
        }}>
          <div className="parasite-card" style={{ maxWidth: '400px', width: '100%' }}>
            <h2 style={{ 
              color: '#ffffff', 
              marginBottom: '24px', 
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              🔐 Admin Login
            </h2>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#888888', 
                  marginBottom: '8px' 
                }}>
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>
              
              {error && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'rgba(255,68,68,0.1)', 
                  border: '1px solid rgba(255,68,68,0.3)',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#ff4444',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="btn-parasite"
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Access Admin Dashboard
              </button>
            </form>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              padding: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <a 
                href={redirectTo}
                style={{ 
                  color: '#888888', 
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                ← Back to Public Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Logout Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: '6px',
            color: '#ff4444',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Logout Admin
        </button>
      </div>
      
      {children}
    </div>
  )
} 