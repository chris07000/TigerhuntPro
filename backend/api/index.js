// Simple serverless function for testing
module.exports = async (req, res) => {
  // NUCLEAR CORS FIX - ALLOW EVERYTHING
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Basic routing
  const { url, method } = req;

  if (url === '/' || url === '/api') {
    return res.status(200).json({
      status: 'Tiger Hunt Pro API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      method: method,
      url: url
    });
  }

  if (url === '/health' || url === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  }

  if (url.startsWith('/api/signals') || url.startsWith('/signals')) {
    if (method === 'GET') {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10
        },
        message: 'Signals endpoint working - no backend database connected yet'
      });
    }
    if (method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Signal creation endpoint working',
        data: { 
          id: Date.now().toString(),
          action: req.body.action || 'BUY',
          symbol: req.body.symbol || 'BTCUSDT',
          price: req.body.price || 50000,
          timestamp: new Date().toISOString(),
          source: 'api',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...req.body 
        }
      });
    }
    if (method === 'DELETE') {
      const signalId = url.split('/').pop();
      return res.status(200).json({
        success: true,
        message: `Signal ${signalId} deleted successfully`
      });
    }
  }

  if (url.startsWith('/api/trades') || url.startsWith('/trades')) {
    if (method === 'GET') {
      if (url.includes('/analytics')) {
        return res.status(200).json({
          success: true,
          data: {
            overview: {
              totalTrades: 0,
              closedTrades: 0,
              openTrades: 0,
              totalPnL: '$0.00',
              winRate: '0%',
              profitFactor: '0'
            },
            performance: {
              winningTrades: 0,
              losingTrades: 0,
              avgWin: '$0.00',
              avgLoss: '$0.00',
              bestTrade: '$0.00',
              worstTrade: '$0.00'
            },
            risk: {
              totalRisk: '$0.00',
              avgRiskPerTrade: '$0.00',
              maxDrawdown: '0%',
              sharpeRatio: '0'
            }
          }
        });
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          total: 0,
          message: 'Trades endpoint working - no backend database connected yet'
        });
      }
    }
    if (method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Trade creation endpoint working',
        data: { id: Date.now().toString(), ...req.body }
      });
    }
  }

  // Default response
  res.status(404).json({
    error: 'Endpoint not found',
    url: url,
    method: method,
    availableEndpoints: ['/', '/health', '/api/signals']
  });
}; 