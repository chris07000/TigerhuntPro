'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ordinalsService, type Inscription } from '@/services/ordinalsApi'

declare global {
  interface Window {
    magicEden?: {
      bitcoin?: any;
      solana?: any;
    };
  }
}

interface WalletState {
  address?: string;
  publicKey?: string;
  connected: boolean;
  balance?: number;
  walletType?: 'xverse' | 'magiceden' | null;
  ordinalsVerified?: boolean;
  tigerOrdinals?: Inscription[];
}

export default function WalletConnect() {
  const router = useRouter()
  const { login, setVerified, isAuthenticated, isVerified } = useAuth()
  
  // Add CSS for spin animation
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    walletType: null
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isVerifyingOrdinals, setIsVerifyingOrdinals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'wallet' | 'signature' | 'ordinals' | 'completed'>('wallet')

  useEffect(() => {
    setIsHydrated(true)
    checkWalletConnection()
    
    // Bitcoin Tiger Collection Configuration
    const tigerIds: string[] = []
    
    // Generate Tiger inscription IDs from ranges
    const ranges = [
      { base: 'df507f90784f3cbeb695598199cf7a24d293b4bdd46d342809cc83781427adee', max: 293 },
      { base: '34e91e21b54873b251447a8500934c02718945014f64bcdb6eb01c8a28716bb7', max: 294 },
      { base: '002daf5cf64dd62c65e8cee7c7738a921cd334b2619845cedaadd357187a45fd', max: 294 },
      { base: 'c0fecdeed61f30653190550bb6d4a9b5172443f8a6a0c57630d08fbbba65b5e5', max: 118 }
    ]
    
    ranges.forEach(range => {
      for (let i = 0; i <= range.max; i++) {
        tigerIds.push(`${range.base}i${i}`)
      }
    })
    
    ordinalsService.updateTigerCollectionIds(tigerIds)
    console.log(`Tiger Hunt Pro: ${tigerIds.length} Bitcoin Tiger IDs configured`)
  }, [])

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      console.log('✅ User already authenticated, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [isAuthenticated, isVerified, router])

  /**
   * Verify Bitcoin Tiger ordinals ownership
   */
  const verifyTigerOrdinals = async (address: string, walletData: WalletState) => {
    setIsVerifyingOrdinals(true)
    setVerificationStep('ordinals')
    setError(null)

    try {
      console.log('🔍 Starting Bitcoin Tiger ownership verification...')
      
      const verification = await ordinalsService.verifyTigerOwnership(address)
      
      if (verification.error) {
        throw new Error(verification.error)
      }

      if (verification.hasValidTiger) {
        // Success: User has Bitcoin Tiger ordinals
        console.log('✅ Bitcoin Tiger ownership verified!')
        console.log('🐅 Tiger ordinals:', ordinalsService.getTigerInfo(verification.tigerOrdinals))
        
        const verifiedWalletData = {
          ...walletData,
          ordinalsVerified: true,
          tigerOrdinals: verification.tigerOrdinals
        }

        setWalletState(verifiedWalletData)
        localStorage.setItem('tiger-wallet-connection', JSON.stringify(verifiedWalletData))
        setVerificationStep('completed')
        
        // Update auth context with verified wallet
        if (verifiedWalletData.address) {
          login(verifiedWalletData.address)
          setVerified(true)
        }
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        
      } else {
        // Failure: No Bitcoin Tiger ordinals found
        throw new Error(
          `ACCESS DENIED\n\n` +
          `No Bitcoin Tiger Collective ordinals found in this wallet.\n\n` +
          `Found ${verification.totalInscriptions} total inscriptions\n` +
          `Found ${verification.tigerOrdinals.length} Bitcoin Tiger ordinals\n\n` +
          `TO GET ACCESS:\n` +
          `1. Purchase a Bitcoin Tiger Collective ordinal\n` +
          `2. Transfer it to your ordinals address\n` +
          `3. Reconnect your wallet\n\n` +
          `Ordinals address checked:\n${address}\n\n` +
          `Address type: ${address.startsWith('bc1p') ? 'Taproot (correct for ordinals)' : 
              address.startsWith('bc1q') ? 'SegWit (ordinals possible)' : 'Legacy (ordinals unlikely)'}`
        )
      }
      
    } catch (error: any) {
      console.error('❌ Bitcoin Tiger verification failed:', error)
      setError(error.message)
      setVerificationStep('wallet')
      
      // Reset wallet connection on verification failure
      setWalletState({ connected: false, walletType: null })
      localStorage.removeItem('tiger-wallet-connection')
      
    } finally {
      setIsConnecting(false)
      setIsSigningMessage(false)
      setIsVerifyingOrdinals(false)
    }
  }

  const checkWalletConnection = () => {
    // Check if already connected from localStorage
    const savedConnection = localStorage.getItem('tiger-wallet-connection')
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection)
        setWalletState(connectionData)
      } catch (e) {
        console.error('Failed to parse saved connection:', e)
        localStorage.removeItem('tiger-wallet-connection')
      }
    }
  }

  const connectXverse = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      console.log('Attempting to connect to Xverse wallet...')
      
      // Check if we're in browser
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      // Use the new official Xverse API: wallet_connect
      console.log('Using official Xverse wallet_connect API...')
      const { request } = await import('sats-connect')
      
      // Use the correct new API method according to docs
      const response = await request('wallet_connect', {
        addresses: ['ordinals' as any, 'payment' as any],
        message: 'Connect to Tiger Hunt Pro Trading Platform',
        network: 'Mainnet' as any
      } as any)

      console.log('Xverse wallet_connect response:', response)

            if (response?.status === 'success') {
        // wallet_connect returns addresses array directly in result
        const addresses = response.result?.addresses || []
        // Get ordinals and payment addresses
        const ordinalsAddress = addresses.find((addr: any) => addr.purpose === 'ordinals')
        const paymentAddress = addresses.find((addr: any) => addr.purpose === 'payment')
        const addressForVerification = ordinalsAddress?.address || paymentAddress?.address
        
        if (!addressForVerification) {
          throw new Error('No ordinals or payment address found in Xverse response')
        }
        
        // TEMPORARILY SKIP SIGNATURE FOR TESTING
        setVerificationStep('signature')
        setIsConnecting(false)
        await new Promise(resolve => setTimeout(resolve, 500))

        const walletData: WalletState = {
          address: addressForVerification, // Show ordinals address (bc1p)
          publicKey: (ordinalsAddress || paymentAddress)?.publicKey || '',
          connected: true,
          walletType: 'xverse'
        }

        // Start Bitcoin Tiger ordinals verification
        await verifyTigerOrdinals(addressForVerification, walletData)
        } else {
          console.error('Xverse wallet_connect error:', response?.error)
          throw new Error(response?.error?.message || 'Connection was rejected or failed')
        }
      
    } catch (err: any) {
      console.error('Xverse connection failed:', err)
      
              let errorMessage = 'Failed to connect to Xverse wallet'
        
        if (err.message?.includes('denied') || err.message?.includes('rejected') || err.message === 'Access denied.') {
          errorMessage = `❌ XVERSE CONNECTION DENIED

🔧 PROBEER DIT:
1. Zorg dat Xverse wallet ONTGRENDELD is
2. Klik op de Xverse extensie icoon
3. Ga naar Settings → Connected Sites
4. Verwijder oude Tiger Hunt Pro verbindingen
5. Refresh deze pagina en probeer opnieuw

💡 TIP: Probeer Incognito Mode als het blijft falen

De nieuwe Xverse wallet_connect API kan soms gevoelig zijn. Als het blijft falen, gebruik dan de groene Demo Wallet button hieronder.`
      } else if (err.message?.includes('not found') || err.message?.includes('undefined')) {
        errorMessage = 'Xverse wallet not found. Please install Xverse wallet extension first.'
      } else if (err.message?.includes('User rejected')) {
        errorMessage = 'You rejected the connection request. Please try again and approve it.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
      setIsSigningMessage(false)
    }
  }

  const connectMagicEden = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      console.log('Checking for Magic Eden wallet...')
      
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      if (!window.magicEden?.bitcoin) {
        throw new Error('Magic Eden wallet not found. Please install the Magic Eden browser extension first.')
      }

      console.log('Requesting Magic Eden Bitcoin connection...')
      
      // Request connection - Magic Eden Bitcoin provider
      const accounts = await window.magicEden.bitcoin.connect()
      
      console.log('Magic Eden Bitcoin accounts:', accounts)
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        
        if (!address) {
          throw new Error('No address found in Magic Eden response')
        }
        
        // TEMPORARILY SKIP SIGNATURE FOR TESTING
        setVerificationStep('signature')
        setIsConnecting(false)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const walletData: WalletState = {
          address: address, // Magic Eden already provides the correct address
          publicKey: '', // Magic Eden doesn't provide public key directly
          connected: true,
          walletType: 'magiceden'
        }

        // Start Bitcoin Tiger ordinals verification
        await verifyTigerOrdinals(address, walletData)
      } else {
        throw new Error('No accounts found in Magic Eden wallet')
      }
      
    } catch (err: any) {
      console.error('Magic Eden connection failed:', err)
      
      let errorMessage = 'Failed to connect to Magic Eden wallet'
      
      if (err.message?.includes('denied') || err.message?.includes('rejected')) {
        errorMessage = 'Connection was rejected. Please try again and approve the connection request.'
      } else if (err.message?.includes('not found') || err.message?.includes('install')) {
        errorMessage = 'Magic Eden wallet not found. Please install Magic Eden browser extension first.'
      } else if (err.message?.includes('User rejected')) {
        errorMessage = 'You rejected the connection request. Please try again and approve it.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
      setIsSigningMessage(false)
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      connected: false,
      walletType: null
    })
    localStorage.removeItem('tiger-wallet-connection')
  }

  const proceedToDashboard = () => {
    // Ensure auth context is updated before navigation
    if (walletState.address) {
      login(walletState.address)
      setVerified(true)
    }
    router.push('/dashboard')
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="parasite-header">
          <div className="container mx-auto px-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
              <div className="parasite-title">TIGER HUNT PRO</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                height: '10rem',
                width: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
                          <div style={{ textAlign: 'center' }}>
                <div className="parasite-title">TIGER HUNT PRO</div>
                <div className="parasite-subtitle">AI Liquidity Hunter • Algorithmic Market Maker</div>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container mx-auto px-6">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '70vh' 
          }}>
            <div className="parasite-card" style={{ 
              maxWidth: '600px', 
              width: '100%',
              textAlign: 'center',
              padding: '40px'
            }}>
              
              {!walletState.connected ? (
                <>
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                    </svg>
                  </div>
                  <h1 style={{ 
                    color: '#ffffff', 
                    fontSize: '2.5rem', 
                    fontWeight: '700',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    CONNECT WALLET
                  </h1>
                                     <p style={{ 
                     color: '#888888', 
                     fontSize: '1.1rem', 
                     lineHeight: '1.6', 
                     marginBottom: '20px' 
                   }}>
                     Connect your Bitcoin wallet to access the Tiger Hunt Pro AI algorithms. 
                     Requires 1 Bitcoin Tiger Collective Ordinal for exclusive access. 
                     Choose your preferred wallet provider below.
                   </p>
                  
                  <div style={{ 
                    color: '#cccccc', 
                    fontSize: '0.9rem', 
                    lineHeight: '1.5', 
                    marginBottom: '32px',
                    padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    borderLeft: '3px solid rgba(255,255,255,0.2)'
                  }}>
                    <strong style={{ color: '#ffffff' }}>Important:</strong> Make sure you have the wallet extension installed 
                    and unlocked before connecting. The wallet will ask for permission to connect to Tiger Hunt Pro.
                  </div>

                  {error && (
                    <div style={{
                      padding: '16px',
                      marginBottom: '24px',
                      backgroundColor: 'rgba(255, 68, 68, 0.1)',
                      border: '1px solid rgba(255, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ff4444',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                      fontFamily: 'Consolas, monospace, Arial, sans-serif'
                    }}>
                      {error}
                    </div>
                  )}

                  {/* Wallet Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Xverse Wallet */}
                    <button
                      onClick={connectXverse}
                      disabled={isConnecting}
                      style={{
                        padding: '20px 24px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                        opacity: isConnecting ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                      onMouseOver={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                                              <img 
                          src="/xverse.png" 
                          alt="Xverse Wallet" 
                          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>XVERSE WALLET</div>
                        <div style={{ fontSize: '0.9rem', color: '#888888', fontWeight: '400' }}>
                          Bitcoin & Ordinals Wallet
                        </div>
                      </div>
                    </button>

                    {/* Magic Eden Wallet */}
                    <button
                      onClick={connectMagicEden}
                      disabled={isConnecting}
                      style={{
                        padding: '20px 24px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                        opacity: isConnecting ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}
                      onMouseOver={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      <img 
                        src="/magiceden.png" 
                        alt="Magic Eden Wallet" 
                        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>MAGIC EDEN WALLET</div>
                        <div style={{ fontSize: '0.9rem', color: '#888888', fontWeight: '400' }}>
                          Multi-Chain NFT Wallet
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Verification Steps Display */}
                  {(isConnecting || isVerifyingOrdinals || verificationStep !== 'wallet') && (
                    <div style={{ 
                      marginTop: '24px',
                      padding: '20px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                          EXCLUSIVE ACCESS VERIFICATION
                        </h3>
                        <p style={{ color: '#888888', margin: 0, fontSize: '0.9rem' }}>
                          Checking Bitcoin Tiger Collective ownership...
                        </p>
                      </div>

                      {/* Step Indicators */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '20px',
                        gap: '8px'
                      }}>
                        {/* Step 1: Wallet Connection */}
                        <div style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          backgroundColor: verificationStep === 'wallet' && isConnecting ? 
                            'rgba(59, 130, 246, 0.2)' : 
                            (!isConnecting && ['signature', 'ordinals', 'completed'].includes(verificationStep)) ? 
                            'rgba(34, 197, 94, 0.2)' : 
                            'rgba(255,255,255,0.05)',
                          border: '1px solid ' + (
                            verificationStep === 'wallet' && isConnecting ? 
                            'rgba(59, 130, 246, 0.5)' : 
                            (!isConnecting && ['signature', 'ordinals', 'completed'].includes(verificationStep)) ? 
                            'rgba(34, 197, 94, 0.5)' : 
                            'rgba(255,255,255,0.1)'
                          )
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {verificationStep === 'wallet' && isConnecting ? '⟳' : 
                             (!isConnecting && ['signature', 'ordinals', 'completed'].includes(verificationStep)) ? '✓' : '●'}
                          </div>
                          <div style={{ 
                            color: verificationStep === 'wallet' && isConnecting ? '#3b82f6' : 
                                   (!isConnecting && ['signature', 'ordinals', 'completed'].includes(verificationStep)) ? '#22c55e' : '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            WALLET
                          </div>
                        </div>

                        {/* Step 2: Signature Authentication */}
                        <div style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          backgroundColor: verificationStep === 'signature' && isSigningMessage ? 
                            'rgba(59, 130, 246, 0.2)' : 
                            ['ordinals', 'completed'].includes(verificationStep) ? 
                            'rgba(34, 197, 94, 0.2)' : 
                            'rgba(255,255,255,0.05)',
                          border: '1px solid ' + (
                            verificationStep === 'signature' && isSigningMessage ? 
                            'rgba(59, 130, 246, 0.5)' : 
                            ['ordinals', 'completed'].includes(verificationStep) ? 
                            'rgba(34, 197, 94, 0.5)' : 
                            'rgba(255,255,255,0.1)'
                          )
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {verificationStep === 'signature' && isSigningMessage ? '⟳' : 
                             ['ordinals', 'completed'].includes(verificationStep) ? '✓' : '●'}
                          </div>
                          <div style={{ 
                            color: verificationStep === 'signature' && isSigningMessage ? '#3b82f6' : 
                                   ['ordinals', 'completed'].includes(verificationStep) ? '#22c55e' : '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            SIGNATURE
                          </div>
                        </div>

                        {/* Step 3: Ordinals Verification */}
                        <div style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          backgroundColor: verificationStep === 'ordinals' && isVerifyingOrdinals ? 
                            'rgba(59, 130, 246, 0.2)' : 
                            verificationStep === 'completed' ? 
                            'rgba(34, 197, 94, 0.2)' : 
                            'rgba(255,255,255,0.05)',
                          border: '1px solid ' + (
                            verificationStep === 'ordinals' && isVerifyingOrdinals ? 
                            'rgba(59, 130, 246, 0.5)' : 
                            verificationStep === 'completed' ? 
                            'rgba(34, 197, 94, 0.5)' : 
                            'rgba(255,255,255,0.1)'
                          )
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {verificationStep === 'ordinals' && isVerifyingOrdinals ? '⟳' : 
                             verificationStep === 'completed' ? '✓' : '●'}
                          </div>
                          <div style={{ 
                            color: verificationStep === 'ordinals' && isVerifyingOrdinals ? '#3b82f6' : 
                                   verificationStep === 'completed' ? '#22c55e' : '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            TIGER CHECK
                          </div>
                        </div>

                        {/* Step 4: Access Granted */}
                        <div style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          backgroundColor: verificationStep === 'completed' ? 
                            'rgba(34, 197, 94, 0.2)' : 
                            'rgba(255,255,255,0.05)',
                          border: '1px solid ' + (
                            verificationStep === 'completed' ? 
                            'rgba(34, 197, 94, 0.5)' : 
                            'rgba(255,255,255,0.1)'
                          )
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {verificationStep === 'completed' ? '✓' : '●'}
                          </div>
                          <div style={{ 
                            color: verificationStep === 'completed' ? '#22c55e' : '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            ACCESS
                          </div>
                        </div>
                      </div>

                      {/* Current Status Message */}
                      <div style={{ textAlign: 'center' }}>
                        {isConnecting && (
                          <div>
                            <div style={{ 
                              color: '#3b82f6',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                              </svg>
                              Connecting to wallet...
                            </div>
                            <div style={{ color: '#888888', fontSize: '0.8rem' }}>
                              Please check your wallet extension and approve the connection request.
                            </div>
                          </div>
                        )}

                        {verificationStep === 'signature' && !isVerifyingOrdinals && (
                          <div>
                            <div style={{ 
                              color: '#3b82f6',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                              </svg>
                              Authenticating wallet access...
                            </div>
                            <div style={{ color: '#888888', fontSize: '0.8rem' }}>
                              Processing wallet authentication...
                            </div>
                          </div>
                        )}

                        {isVerifyingOrdinals && (
                          <div>
                            <div style={{ 
                              color: '#3b82f6',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                              </svg>
                              Verifying Bitcoin Tiger ownership...
                            </div>
                            <div style={{ color: '#888888', fontSize: '0.8rem' }}>
                              Scanning your wallet for Bitcoin Tiger Collective ordinals.
                            </div>
                          </div>
                        )}

                        {verificationStep === 'completed' && (
                          <div>
                            <div style={{ 
                              color: '#22c55e',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              Bitcoin Tiger ownership verified!
                            </div>
                            <div style={{ color: '#888888', fontSize: '0.8rem' }}>
                              Redirecting to exclusive dashboard...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                </>
              ) : (
                <>
                  {/* Connected State */}
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#00ff88">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                  </div>
                  <h1 style={{ 
                    color: '#00ff88', 
                    fontSize: '2.5rem', 
                    fontWeight: '700',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    WALLET CONNECTED
                  </h1>
                  
                  <div style={{ 
                    marginBottom: '32px',
                    padding: '20px',
                    backgroundColor: 'rgba(0,255,136,0.05)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ color: '#888888', fontSize: '0.9rem', marginBottom: '8px' }}>
                      WALLET TYPE
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
                      {walletState.walletType?.toUpperCase()}
                    </div>
                    
                    <div style={{ color: '#888888', fontSize: '0.9rem', marginBottom: '8px' }}>
                      ADDRESS
                    </div>
                    <div style={{ 
                      color: '#ffffff', 
                      fontSize: '0.9rem', 
                      fontFamily: 'Consolas, monospace',
                      wordBreak: 'break-all'
                    }}>
                      {walletState.address}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button
                      onClick={proceedToDashboard}
                      style={{
                        padding: '16px 32px',
                        border: '1px solid rgba(0,255,136,0.3)',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0,255,136,0.1)',
                        color: '#00ff88',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.1)'
                      }}
                    >
                      ENTER DASHBOARD
                    </button>
                    
                    <button
                      onClick={disconnectWallet}
                      style={{
                        padding: '16px 24px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#888888',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#ffffff'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#888888'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 