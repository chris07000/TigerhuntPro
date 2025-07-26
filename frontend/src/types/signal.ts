export interface Signal {
  id: string
  action: 'BUY' | 'SELL' | 'HOLD'
  symbol: string
  price: number
  timestamp: string
  strategy?: string
  timeframe?: string
  source: 'tradingview_webhook' | 'manual' | 'api'
  status: 'active' | 'executed' | 'cancelled' | 'expired'
  notes?: string
  takeProfit1?: number
  takeProfit2?: number
  stopLoss?: number
  leverage?: number
  targetHit?: 'none' | 'tp1' | 'tp2' | 'sl'
  targetHitAt?: string
  targetPrice?: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateSignalRequest {
  action: 'BUY' | 'SELL' | 'HOLD'
  symbol: string
  price: number
  strategy?: string
  timeframe?: string
  notes?: string
  takeProfit1?: number
  takeProfit2?: number
  stopLoss?: number
  leverage?: number
  metadata?: Record<string, any>
}

export interface SignalFilters {
  symbol?: string
  action?: 'BUY' | 'SELL' | 'HOLD'
  status?: 'active' | 'executed' | 'cancelled' | 'expired'
  strategy?: string
  startDate?: string
  endDate?: string
}

export interface PaginatedSignalResponse {
  success: boolean
  data: Signal[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface WebSocketSignalEvent {
  type: 'new_signal' | 'signal_updated' | 'signal_deleted'
  signal: Signal | { id: string }
  timestamp: string
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting'
  clientId?: string
  timestamp: string
} 