import axios from 'axios';

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz';

// Types for Hyperliquid API responses (based on official docs)
export interface HyperliquidPosition {
  coin: string;
  cumFunding: {
    allTime: string;
    sinceChange: string;
    sinceOpen: string;
  };
  entryPx: string;
  leverage: {
    rawUsd: string;
    type: 'cross' | 'isolated';
    value: number;
  };
  liquidationPx: string;
  marginUsed: string;
  maxLeverage: number;
  positionValue: string;
  returnOnEquity: string;
  szi: string; // size (positive = long, negative = short)
  unrealizedPnl: string;
}

export interface HyperliquidFill {
  coin: string;
  px: string; // price
  sz: string; // size
  side: 'B' | 'A'; // Buy or Ask (sell)
  time: number;
  startPosition: string;
  dir: string; // direction description
  closedPnl: string;
  hash: string;
  oid: number; // order id
  crossed: boolean; // was taker
  fee: string;
  feeToken: string;
  tid: number; // trade id
}

export interface HyperliquidAccountSummary {
  assetPositions: Array<{
    position: HyperliquidPosition;
    type: 'oneWay';
  }>;
  crossMaintenanceMarginUsed: string;
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string; // total notional position
    totalRawUsd: string;
  };
  withdrawable: string;
  time: number;
}

export interface HyperliquidPortfolioData {
  accountValueHistory: Array<[number, string]>;
  pnlHistory: Array<[number, string]>;
  vlm: string; // volume
}

const hyperliquidApi = {
  // Test API connectivity and log response
  testConnection: async (userAddress: string) => {
    try {
      console.log('🔍 Testing Hyperliquid API with address:', userAddress);
      
      const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
        type: 'clearinghouseState',
        user: userAddress
      });
      
      console.log('✅ API Response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ API Test Failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's current positions and account summary
  getAccountSummary: async (userAddress: string): Promise<HyperliquidAccountSummary> => {
    console.log('📊 Fetching clearinghouseState for:', userAddress);
    const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
      type: 'clearinghouseState',
      user: userAddress
    });
    console.log('Raw account response:', response.data);
    return response.data;
  },

  // Get user's recent fills (executed trades)
  getUserFills: async (userAddress: string, limit = 50): Promise<HyperliquidFill[]> => {
    try {
      const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
        type: 'userFills',
        user: userAddress
      });
      console.log('Raw userFills response:', response.data);
      // Return only the most recent fills based on limit
      return Array.isArray(response.data) ? response.data.slice(0, limit) : [];
    } catch (error) {
      console.error('Failed to fetch user fills:', error);
      return []; // Return empty array if fails
    }
  },

  // Get user's fills within a time range
  getUserFillsByTime: async (
    userAddress: string, 
    startTime: number, 
    endTime?: number
  ): Promise<HyperliquidFill[]> => {
    const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
      type: 'userFillsByTime',
      user: userAddress,
      startTime,
      endTime: endTime || Date.now()
    });
    return response.data;
  },

  // Get user's portfolio performance
  getPortfolio: async (userAddress: string): Promise<Record<string, HyperliquidPortfolioData>> => {
    const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
      type: 'portfolio',
      user: userAddress
    });
    
    // Convert array format to object for easier access
    const portfolioData: Record<string, HyperliquidPortfolioData> = {};
    response.data.forEach(([timeframe, data]: [string, HyperliquidPortfolioData]) => {
      portfolioData[timeframe] = data;
    });
    
    return portfolioData;
  },

  // Get current mid prices for all assets
  getAllMids: async (): Promise<Record<string, string>> => {
    const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
      type: 'allMids'
    });
    return response.data;
  },

  // Get user's open orders
  getOpenOrders: async (userAddress: string) => {
    const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
      type: 'openOrders',
      user: userAddress
    });
    return response.data;
  },

  // Get ALL order types (including trigger orders, stop orders, etc.)
  getAllOrders: async (userAddress: string) => {
    try {
      const [openOrders, frontendOpenOrders] = await Promise.all([
        // Standard open orders
        axios.post(`${HYPERLIQUID_API_URL}/info`, {
          type: 'openOrders',
          user: userAddress
        }),
        // Frontend open orders (includes trigger/conditional orders)
        axios.post(`${HYPERLIQUID_API_URL}/info`, {
          type: 'frontendOpenOrders',
          user: userAddress
        })
      ]);

              // Fetched open orders from Hyperliquid

      // Combine both order types
      const allOrders = [
        ...(openOrders.data || []),
        ...(frontendOpenOrders.data || [])
      ];

      console.log('📋 Combined orders:', allOrders);
      return allOrders;
    } catch (error) {
      console.error('Failed to fetch all orders:', error);
      // Fallback to standard open orders
      const response = await axios.post(`${HYPERLIQUID_API_URL}/info`, {
        type: 'openOrders',
        user: userAddress
      });
      return response.data;
    }
  },

  // Format utilities
  formatPosition: (position: HyperliquidPosition) => {
    const size = parseFloat(position.szi);
    const isLong = size > 0;
    const pnl = parseFloat(position.unrealizedPnl);
    
    return {
      symbol: position.coin,
      side: isLong ? 'LONG' : 'SHORT',
      size: Math.abs(size).toString(),
      entryPrice: parseFloat(position.entryPx),
      unrealizedPnl: pnl,
      pnlPercentage: parseFloat(position.returnOnEquity) * 100,
      leverage: position.leverage.value,
      marginType: position.leverage.type,
      liquidationPrice: parseFloat(position.liquidationPx),
      marginUsed: parseFloat(position.marginUsed),
      positionValue: parseFloat(position.positionValue)
    };
  },

  formatFill: (fill: HyperliquidFill) => {
    const isBuy = fill.side === 'B';
    
    return {
      symbol: fill.coin,
      side: isBuy ? 'BUY' : 'SELL',
      price: parseFloat(fill.px),
      size: parseFloat(fill.sz),
      value: parseFloat(fill.px) * parseFloat(fill.sz),
      time: new Date(fill.time),
      pnl: parseFloat(fill.closedPnl),
      fee: parseFloat(fill.fee),
      orderId: fill.oid,
      tradeId: fill.tid,
      direction: fill.dir,
      isTaker: fill.crossed
    };
  }
};

export default hyperliquidApi; 