'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Signal, ConnectionStatus, WebSocketSignalEvent } from '@/types/signal'

const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tigerhunt-pro-backend-k742.vercel.app' 
  : (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000')

export function useWebSocket() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: process.env.NODE_ENV === 'production' ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
  const socketRef = useRef<Socket | null>(null)

  // Connect to WebSocket - DISABLE in production (Vercel serverless doesn't support WebSocket)
  const connect = useCallback(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log('🔗 Production: WebSocket disabled (serverless), using API polling')
      setConnectionStatus({
        status: 'connected',
        clientId: 'production-api-mode',
        timestamp: new Date().toISOString()
      })
      return
    }

    if (socketRef.current?.connected) return

    setConnectionStatus({
      status: 'connecting',
      timestamp: new Date().toISOString()
    })

    socketRef.current = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('🔗 WebSocket connected')
      setConnectionStatus({
        status: 'connected',
        clientId: socketRef.current?.id,
        timestamp: new Date().toISOString()
      })
      
      // Request latest signals on connect
      socketRef.current?.emit('request_signals')
    })

    socketRef.current.on('disconnect', () => {
      console.log('📡 WebSocket disconnected')
      setConnectionStatus({
        status: 'disconnected',
        timestamp: new Date().toISOString()
      })
    })

    // Signal events
    socketRef.current.on('signals_data', (signalsData: Signal[]) => {
      console.log('📊 Received signals data:', signalsData.length)
      setSignals(signalsData)
    })

    socketRef.current.on('new_signal', (signal: Signal) => {
      console.log('🆕 New signal received:', signal)
      setSignals(prev => [signal, ...prev.slice(0, 19)]) // Keep latest 20
    })

    socketRef.current.on('signal_updated', (signal: Signal) => {
      console.log('📝 Signal updated:', signal)
      setSignals(prev => prev.map(s => s.id === signal.id ? signal : s))
    })

    socketRef.current.on('signal_deleted', (data: { id: string }) => {
      console.log('🗑️ Signal deleted:', data.id)
      setSignals(prev => prev.filter(s => s.id !== data.id))
    })

    // Error handling
    socketRef.current.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
    })

  }, [])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  // Subscribe to specific symbol
  const subscribeToSymbol = useCallback((symbol: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_symbol', symbol)
      console.log(`📈 Subscribed to ${symbol}`)
    }
  }, [])

  // Unsubscribe from specific symbol
  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe_symbol', symbol)
      console.log(`📉 Unsubscribed from ${symbol}`)
    }
  }, [])

  // Request fresh signals data
  const refreshSignals = useCallback(async () => {
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch('https://tigerhunt-pro-backend-k742.vercel.app/api/signals')
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setSignals(data.data)
          console.log('✅ Signals refreshed from API:', data.data.length)
        }
      } catch (error) {
        console.error('❌ Failed to refresh signals:', error)
      }
    } else if (socketRef.current?.connected) {
      socketRef.current.emit('request_signals')
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    // In production, load initial signals via API
    if (process.env.NODE_ENV === 'production') {
      refreshSignals()
      
      // AUTO-REFRESH SIGNALS EVERY 5 SECONDS
      const interval = setInterval(() => {
        refreshSignals()
      }, 5000)
      
      return () => {
        disconnect()
        clearInterval(interval)
      }
    }
    
    return () => disconnect()
  }, [connect, disconnect, refreshSignals])

  return {
    signals,
    connectionStatus,
    connect,
    disconnect,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    refreshSignals,
    isConnected: connectionStatus.status === 'connected'
  }
} 