import axios from 'axios';

// Force production backend URL
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://tigerhunt-pro-backend-k742.vercel.app'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl();

export interface Trade {
  id: string;
  userId: string;
  signalId?: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED' | 'PARTIALLY_CLOSED';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  leverage: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  pnl: number;
  pnlPercentage: number;
  fees: number;
  notes?: string;
  entryDate: string;
  exitDate?: string;
  duration?: number;
  riskAmount?: number;
  riskPercentage?: number;
}

export interface CreateTradeFromSignalRequest {
  signalId: string;
  quantity: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  riskAmount?: number;
}

export interface CreateManualTradeRequest {
  symbol: string;
  action: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  riskAmount?: number;
  notes?: string;
}

export interface CloseTradeRequest {
  exitPrice: number;
  partialQuantity?: number;
}

export interface PortfolioAnalytics {
  overview: {
    totalTrades: number;
    closedTrades: number;
    openTrades: number;
    totalPnL: string;
    winRate: string;
    profitFactor: string;
  };
  performance: {
    winningTrades: number;
    losingTrades: number;
    avgWin: string;
    avgLoss: string;
    bestTrade: string;
    worstTrade: string;
  };
  risk: {
    totalRisk: string;
    avgRiskPerTrade: string;
    maxDrawdown: string;
    sharpeRatio: string;
  };
  symbolPerformance: {
    [symbol: string]: {
      trades: number;
      pnl: number;
      winRate: number;
    };
  };
}

const tradeApi = {
  // Create trade from signal
  createTradeFromSignal: async (data: CreateTradeFromSignalRequest): Promise<Trade> => {
    const response = await axios.post(`${API_BASE_URL}/api/trades/from-signal`, data);
    return response.data.data;
  },

  // Create manual trade
  createManualTrade: async (data: CreateManualTradeRequest): Promise<Trade> => {
    const response = await axios.post(`${API_BASE_URL}/api/trades/manual`, data);
    return response.data.data;
  },

  // Close trade
  closeTrade: async (tradeId: string, data: CloseTradeRequest): Promise<Trade> => {
    const response = await axios.put(`${API_BASE_URL}/api/trades/${tradeId}/close`, data);
    return response.data.data;
  },

  // Get all trades
  getAllTrades: async (params?: {
    status?: string;
    symbol?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Trade[]; total: number }> => {
    const response = await axios.get(`${API_BASE_URL}/api/trades`, { params });
    return {
      data: response.data.data,
      total: response.data.total
    };
  },

  // Get portfolio analytics
  getPortfolioAnalytics: async (timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<PortfolioAnalytics> => {
    const response = await axios.get(`${API_BASE_URL}/api/trades/analytics`, {
      params: { timeframe }
    });
    return response.data.data;
  },
};

export default tradeApi; 