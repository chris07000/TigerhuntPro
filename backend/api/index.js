// Simple serverless function for testing
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  if (url.startsWith('/api/signals')) {
    if (method === 'GET') {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Signals endpoint working - no backend database connected yet'
      });
    }
    if (method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Signal creation endpoint working',
        data: { id: 'test', ...req.body }
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