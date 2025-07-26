'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  walletAddress: string | null
  isVerified: boolean
  login: (address: string) => void
  logout: () => void
  setVerified: (verified: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('tiger-auth')
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth)
        if (authData.walletAddress && authData.isVerified) {
          setWalletAddress(authData.walletAddress)
          setIsAuthenticated(true)
          setIsVerified(authData.isVerified)
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error)
        localStorage.removeItem('tiger-auth')
      }
    }
  }, [])

  const login = (address: string) => {
    setWalletAddress(address)
    setIsAuthenticated(true)
    setIsVerified(false) // Will be set to true after Ordinal verification
    
    // Save to localStorage
    localStorage.setItem('tiger-auth', JSON.stringify({
      walletAddress: address,
      isVerified: false,
      timestamp: Date.now()
    }))
  }

  const logout = () => {
    setWalletAddress(null)
    setIsAuthenticated(false)
    setIsVerified(false)
    localStorage.removeItem('tiger-auth')
  }

  const setVerified = (verified: boolean) => {
    setIsVerified(verified)
    
    if (walletAddress) {
      localStorage.setItem('tiger-auth', JSON.stringify({
        walletAddress,
        isVerified: verified,
        timestamp: Date.now()
      }))
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      walletAddress,
      isVerified,
      login,
      logout,
      setVerified
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 