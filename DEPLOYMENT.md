# 🚀 Tiger Hunt Pro - Vercel Deployment Guide

## 📋 Environment Variables

Add these environment variables in your Vercel dashboard:

### Frontend Variables:
```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_WS_URL=https://your-domain.vercel.app/api  
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_ADMIN_PASSWORD=YourSecureAdminPassword123!
```

### Backend Variables:
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.vercel.app
JWT_SECRET=your-super-secure-jwt-key-minimum-32-characters-long
WEBHOOK_SECRET=your-tradingview-webhook-secret-key
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
LOG_LEVEL=error
```

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Set Environment Variables
Go to your Vercel dashboard → Project → Settings → Environment Variables

### 5. Update Domain
After deployment, update `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` with your actual domain.

## 🔐 Security Checklist

- [ ] Change `NEXT_PUBLIC_ADMIN_PASSWORD`
- [ ] Generate secure `JWT_SECRET` (32+ characters)
- [ ] Set your Discord webhook URL
- [ ] Verify Bitcoin Tiger Ordinal verification is working
- [ ] Test wallet connect functionality

## 🐅 Features Included

- ✅ Bitcoin Tiger Ordinal Verification
- ✅ Wallet Connect (Xverse/Magic Eden)
- ✅ Auto-Signal Generation from Hyperliquid
- ✅ Target Hit Detection
- ✅ Discord Notifications
- ✅ Protected Admin Routes
- ✅ Tiger RISK Calculator
- ✅ Trading Journey Analytics

## 📞 Support

Tiger Hunt Pro Team - Premium AI Market Maker Dashboard 