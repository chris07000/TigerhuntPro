# 🎯 Tiger Hunt Pro Target Hit Detection

## 🚀 **Automatische Target Monitoring + Discord Notifications**

Deze feature monitort live prijzen via Binance API en detecteert automatisch wanneer je target prices worden geraakt. Bij een hit wordt het signal automatisch verwijderd en krijg je een Discord notification!

## 📊 **Hoe het werkt:**

### **1. Signal met Targets aanmaken:**
```javascript
// In admin dashboard (/trading):
{
  "symbol": "ADAUSDT",
  "action": "SHORT", 
  "price": 0.85,
  "takeProfit1": 0.81,  // Target 1
  "takeProfit2": 0.78,  // Target 2  
  "stopLoss": 0.89,     // Stop Loss
  "leverage": 10
}
```

### **2. Live Price Monitoring:**
- ✅ **Binance API** monitort elke 10 seconden
- ✅ **Automatische symbol mapping** (ADAUSD → ADAUSDT)
- ✅ **Target hit detection** voor LONG/SHORT posities
- ✅ **Intelligent prioritering** (TP1 → TP2 → SL)

### **3. Target Hit Detection:**

#### **LONG Posities (BUY):**
- **Take Profit:** Prijs ≥ TP level
- **Stop Loss:** Prijs ≤ SL level

#### **SHORT Posities (SELL):**
- **Take Profit:** Prijs ≤ TP level  
- **Stop Loss:** Prijs ≥ SL level

### **4. Automatische Acties bij Hit:**
1. 🎯 **Signal wordt gemarkeerd** als `executed` (TP) of `cancelled` (SL)
2. 🗑️ **Auto-removal** van dashboard
3. 📱 **Discord notification** met profit/loss berekening
4. 📊 **Live monitoring stopt** voor dit signal

## 🔧 **Technical Implementation:**

### **Database Schema Update:**
```sql
-- Nieuwe velden in Signal model:
takeProfit1 DECIMAL(15,8)    -- Target 1 prijs
takeProfit2 DECIMAL(15,8)    -- Target 2 prijs  
stopLoss DECIMAL(15,8)       -- Stop Loss prijs
leverage INTEGER             -- Leverage multiplier
targetHit ENUM               -- 'none', 'tp1', 'tp2', 'sl'
targetHitAt DATETIME         -- Timestamp van hit
targetPrice DECIMAL(15,8)    -- Exacte hit prijs
```

### **Price Monitor Service:**
```javascript
// Auto-start bij server boot
priceMonitorService.start()

// Monitoring status
{
  "isRunning": true,
  "activeSignals": 5,
  "trackedPrices": 10,
  "updateInterval": "10 seconds"
}
```

## 🎯 **Voorbeeld Gebruik:**

### **Scenario: ADA SHORT Trade**
```
📊 Signal Created:
- Symbol: ADAUSDT
- Action: SHORT
- Entry: $0.85
- TP1: $0.81 (4.7% profit met 10x leverage = 47%)
- TP2: $0.78 (8.2% profit met 10x leverage = 82%) 
- SL: $0.89 (4.7% loss met 10x leverage = 47%)
- Leverage: 10x

🎯 Target Hit Detection:
Current Price: $0.81 → TP1 HIT!

✅ Automatic Actions:
1. Signal marked as 'executed'
2. Removed from dashboard
3. Discord notification sent:
   "🎯✅ TARGET HIT - PROFIT SECURED!
    ADA SHORT position hit Take Profit 1
    Entry: $0.85 → Target: $0.81
    Profit: +47% (10x leverage)
    Trade Duration: 2 hours"
```

## 📱 **Discord Notifications:**

### **Take Profit Hit:**
```
🎯✅ TARGET HIT - PROFIT SECURED!
ADAUSDT SHORT position has hit Take Profit 1

📊 TRADE DETAILS
Symbol: ADAUSDT
Entry Price: $0.85
Target Price: $0.81
Current Price: $0.81

💰 PERFORMANCE  
Profit: +47%
Leverage: 10x
Status: ✅ PROFIT

⏰ TIMING
Trade Duration: 2 hours
Auto-Closed: YES
Signal Removed: YES
```

### **Stop Loss Hit:**
```
🛑❌ STOP LOSS HIT
ADAUSDT SHORT position has hit Stop Loss

📊 TRADE DETAILS
Symbol: ADAUSDT
Entry Price: $0.85
Target Price: $0.89
Current Price: $0.89

💰 PERFORMANCE
Loss: -47%
Leverage: 10x  
Status: ❌ LOSS

⏰ TIMING
Trade Duration: 45 minutes
Auto-Closed: YES
Signal Removed: YES
```

## 🔄 **Frontend Integration:**

### **Admin Signal Form:**
- ✅ **Leverage selector** (1x - 125x)
- ✅ **Take Profit 1 & 2** input velden
- ✅ **Stop Loss** input veld
- ✅ **Auto-monitoring info** met uitleg

### **Dashboard Updates:**
- ✅ **Signals auto-verwijderd** bij target hit
- ✅ **Real-time status updates**
- ✅ **Target hit indicators** in signal cards

## 🚨 **Belangrijk:**

### **Environment Variables:**
```bash
# In backend/.env:
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Binance API (public, geen key vereist)
# Automatisch: https://api.binance.com/api/v3
```

### **Monitoring Limitations:**
- 📊 **Alleen crypto pairs** die op Binance beschikbaar zijn
- 🕒 **10 seconden interval** (aanpasbaar in code)
- 🔄 **Auto-restart** bij server reboot
- ⚠️ **Fallback logic** bij API failures

## 🔧 **Manual Controls:**

### **Service Management:**
```javascript
// Start monitoring
priceMonitorService.start()

// Stop monitoring  
priceMonitorService.stop()

// Get status
priceMonitorService.getStatus()

// Add signal to monitoring
priceMonitorService.addSignalToMonitor(signal)

// Remove signal from monitoring
priceMonitorService.removeSignalFromMonitor(signalId)
```

## 🎯 **Perfect voor Tiger Hunt Pro:**

✅ **Volledig geautomatiseerd** - geen handmatige checks meer nodig
✅ **Real-time Discord alerts** - iedereen weet direct van target hits  
✅ **Accurate profit/loss berekening** - inclusief leverage
✅ **Clean dashboard** - oude signals worden automatisch opgeruimd
✅ **Professional appearance** - ziet er super pro uit voor volgers
✅ **Zero maintenance** - draait automatisch op de achtergrond

**Nu kunnen jullie volledig focussen op het maken van signals, terwijl het systeem automatisch target hits detecteert en iedereen op de hoogte houdt! 🔥💪** 