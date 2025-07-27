# 🚀 BYDFI Dashboard Integration - Setup Guide

## ✅ **VOLTOOID: HYPERLIQUID → BYDFI**

Je dashboard toont nu **BYDFI positions** in plaats van Hyperliquid data!

---

## 📋 **HOE TE GEBRUIKEN:**

### **STAP 1: Open BYDFI Positions**
- Ga naar [BYDFI.com](https://www.bydfi.com)
- Log in op je account
- Navigeer naar **Positions** page (Futures → Positions)

### **STAP 2: Scraper Script Activeren**
1. Open **F12 Developer Tools** (of rechts-click → Inspect)
2. Ga naar **Console** tab
3. Kopieer en plak dit script:

```javascript
// Kopieer de hele inhoud van: frontend/public/bydfi-scraper.js
// Of ga naar: https://raw.githubusercontent.com/chris07000/TigerhuntPro/master/frontend/public/bydfi-scraper.js
```

### **STAP 3: Script Werkt Automatisch**
- Script start automatisch na 3 seconden
- Scant elke 10 seconden je BYDFI positions
- Stuurt data naar dashboard
- Console toont: `✅ Successfully sent X positions to dashboard`

### **STAP 4: Check Dashboard**
- Ga naar: [https://tigerhunt-pro-frontend-ivory.vercel.app/dashboard](https://tigerhunt-pro-frontend-ivory.vercel.app/dashboard)
- Je BYDFI positions verschijnen automatisch
- Tabel updates elke 15 seconden

---

## 🎯 **DASHBOARD FEATURES:**

**Live BYDFI Positions Tabel:**
- ✅ Symbol (BTCUSDT, ETHUSDT, etc.)
- ✅ Position Size 
- ✅ Entry Price
- ✅ Mark Price (real-time)
- ✅ Liquidation Price
- ✅ Unrealized PnL (groen/rood)
- ✅ ROI Percentage

**Status Indicators:**
- 🟢 **Connected** → Script werkt perfect
- 🟡 **Connecting** → Script start op
- 🔴 **Disconnected** → Script gestopt of error

---

## 🔧 **CONTROLS:**

**In Browser Console:**
```javascript
startBydfiScraper()  // Start scraping
stopBydfiScraper()   // Stop scraping
```

**In Dashboard:**
- **Refresh** button → Manual update
- **Last update** → Tijd van laatste sync

---

## ⚠️ **BELANGRIJK:**

1. **Browser Tab Open Houden** → BYDFI tab moet open blijven
2. **Console Script Actief** → Script moet draaien in BYDFI console
3. **Geen Manual Work** → Alles gaat automatisch!

---

## 🎉 **RESULTAAT:**

**Dashboard toont nu live je BYDFI trades:**
- Real-time position updates
- Automatic PnL tracking  
- Beautiful table display
- No manual input needed!

**Perfect voor Tiger Hunt Pro trading! 🐅💪** 