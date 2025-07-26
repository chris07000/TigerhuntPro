'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireVerification = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isVerified } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated at all, redirect to home (wallet connect)
    if (!isAuthenticated) {
      console.log('🚫 Access denied: Wallet not connected')
      router.push('/')
      return
    }

    // If authentication required but not verified (no Bitcoin Tiger Ordinal)
    if (requireVerification && !isVerified) {
      console.log('🚫 Access denied: Bitcoin Tiger Ordinal verification required')
      router.push('/')
      return
    }

    console.log('✅ Access granted: Wallet connected and verified')
  }, [isAuthenticated, isVerified, requireVerification, router])

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '10px' 
          }}>
            🔒 Checking Access...
          </div>
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.7 
          }}>
            Wallet verification required
          </div>
        </div>
      </div>
    )
  }

  // Show verification required message
  if (requireVerification && !isVerified) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '10px' 
          }}>
            🐅 Bitcoin Tiger Required
          </div>
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.7,
            marginBottom: '20px'
          }}>
            You need 1 Bitcoin Tiger Collective Ordinal for exclusive access
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Verification
          </button>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
} 