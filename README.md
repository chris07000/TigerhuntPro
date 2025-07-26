# 🔥 PARASITE | Trading Signals Dashboard

A complete real-time trading signals dashboard where TradingView analyses are automatically sent to a dashboard where everyone can see the signals live!

## ✨ Features

### 🎯 Core Functionality
- **TradingView Webhook Integration** - Automatic signals from TradingView
- **Real-time Dashboard** - Live updates without page refresh
- **WebSocket Communication** - Instant signal updates
- **Signal Management** - Complete CRUD operations for signals
- **Historical Data** - History of all signals
- **Multi-user Support** - Multiple users can view signals simultaneously

### 📊 Dashboard Features
- **Live Signal Feed** - Real-time signals stream
- **Beautiful Signal Cards** - Clean display of each signal
- **Connection Status** - Real-time connection status
- **Manual Signal Creation** - Add signals manually
- **Responsive Design** - Works on all devices
- **PARASITE Theme** - Dark theme with green accents

## 🏗️ Architecture

```
trading-signals-dashboard/
├── backend/          # Node.js + Express + WebSocket
├── frontend/         # Next.js + React + TypeScript
├── shared/           # Shared types and utilities
└── docs/            # Documentation
```

### Backend (Node.js)
- **Express Server** with WebSocket support
- **SQLite Database** for signal storage
- **TradingView Webhook** endpoint
- **Real-time Broadcasting** via Socket.IO

### Frontend (Next.js)
- **Modern React** with TypeScript
- **PARASITE Theme** with Tailwind CSS
- **Real-time Updates** via WebSocket
- **Responsive Dashboard** design

## 🚀 Quick Start

### 1. Clone/Download Project
```bash
# Navigate to the project directory
cd trading-signals-dashboard
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the server
npm run dev
```

Backend now running on: `http://localhost:5000`

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start the frontend
npm run dev
```

Frontend now running on: `http://localhost:3000`

### 4. Test the Setup
1. Open `http://localhost:3000` in your browser
2. You'll see the PARASITE dashboard
3. Test the WebSocket connection (green status indicator)
4. Create a manual signal to test functionality

## 📡 TradingView Integration

### Webhook URL Setup
In TradingView, set your webhook URL as:
```
http://your-domain.com/api/webhook/tradingview
```

For local development:
```
http://localhost:5000/api/webhook/tradingview
```

### Pine Script Alert Message
Use this format in your TradingView alerts:
```json
{
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "price": {{close}},
  "timestamp": "{{time}}",
  "strategy": "Your Strategy Name",
  "timeframe": "{{interval}}"
}
```

Example:
```json
{
  "action": "BUY",
  "symbol": "BTCUSDT",
  "price": 45000,
  "timestamp": "2024-01-15T10:30:00Z",
  "strategy": "SFP Strategy",
  "timeframe": "1h"
}
```

## 🔧 Development

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
```

### Frontend Commands
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
npm run type-check  # TypeScript check
```

## 📋 API Endpoints

### Signals API
- `GET /api/signals` - Get all signals
- `POST /api/signals` - Create new signal
- `GET /api/signals/:id` - Get specific signal
- `PUT /api/signals/:id` - Update signal
- `DELETE /api/signals/:id` - Delete signal

### Webhook API
- `POST /api/webhook/tradingview` - TradingView webhook endpoint
- `POST /api/webhook/test` - Test webhook

### System API
- `GET /health` - Health check

## 🌐 WebSocket Events

### Client → Server
- `request_signals` - Request latest signals
- `subscribe_symbol` - Subscribe to specific symbol
- `unsubscribe_symbol` - Unsubscribe from symbol

### Server → Client
- `connected` - Connection established
- `signals_data` - Initial signals data
- `new_signal` - New signal received
- `signal_updated` - Signal updated
- `signal_deleted` - Signal deleted

## 🎨 PARASITE Theme

### Color Scheme
- **Background**: Deep black (#0a0a0a)
- **Cards**: Dark gray (#111111)
- **Primary**: Bright green (#00ff88)
- **Text**: White (#ffffff)
- **Muted**: Gray (#888888)

### Typography
- **Headers**: Inter font with green glow effects
- **Data**: JetBrains Mono for monospace display
- **Tracking**: Wide letter spacing for technical feel

### Effects
- **Glow**: Green glow on important elements
- **Animations**: Smooth transitions and pulse effects
- **Hover**: Border highlights and shadow effects

## 📱 Mobile Support

The dashboard is fully responsive and works perfectly on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers

## 🚀 Deployment

### Option 1: Docker (Recommended)
```bash
# Build and start containers
docker-compose up -d
```

### Option 2: Manual Deployment
1. Deploy backend on a server (e.g., DigitalOcean, AWS)
2. Deploy frontend on Vercel/Netlify
3. Update environment variables

### Environment Variables
Backend `.env`:
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=https://your-backend-domain.com
```

## 🔒 Security

- **Input Validation** - All inputs are validated
- **Rate Limiting** - API rate limiting enabled
- **CORS Protection** - Cross-origin request protection
- **Helmet Security** - Security headers applied

## 🛠️ Troubleshooting

### WebSocket Connection Issues
1. Check if backend is running on port 5000
2. Check firewall settings
3. Verify CORS configuration

### TradingView Webhook Issues
1. Verify webhook URL
2. Test webhook with `/api/webhook/test`
3. Check TradingView alert message format

### Database Issues
1. Database is created automatically
2. Check write permissions in `backend/data/` directory

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Contact the development team

## 🎉 Success!

You now have a complete PARASITE trading signals dashboard that:
- ✅ Automatically receives TradingView signals
- ✅ Shows real-time updates to all users
- ✅ Has a beautiful dark UI with green theme
- ✅ Works responsively on all devices
- ✅ Is professional and scalable

**Happy Trading! 📈📊💰** 