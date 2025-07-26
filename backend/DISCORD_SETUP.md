# 🐅 Tiger Hunt Pro - Discord Integration Setup

Deze guide laat zien hoe je Discord webhook integratie kunt instellen zodat trading signals automatisch naar een Discord channel gestuurd worden.

## 📋 Prerequisites

- Discord account
- Discord server waar je admin/manage webhooks permissies hebt
- Tiger Hunt Pro backend draaiend

## 🔧 Stap 1: Discord Webhook maken

### 1.1 Ga naar je Discord Server
1. Open Discord en ga naar de server waar je signals wilt ontvangen
2. Ga naar het channel waar signals gepost moeten worden (bijv. `#trading-signals`)

### 1.2 Maak een Webhook
1. Klik op het **tandwiel ⚙️** naast de channel naam
2. Ga naar **Integrations** → **Webhooks**
3. Klik op **Create Webhook**
4. Geef de webhook een naam: `Tiger Hunt Pro`
5. Upload eventueel het Tiger logo als avatar
6. **Kopieer de Webhook URL** - deze heb je nodig!

## 🔧 Stap 2: Backend Configuratie

### 2.1 Environment Variabelen
1. Ga naar je backend directory: `cd backend`
2. Kopieer `example.env` naar `.env` als je dat nog niet hebt gedaan:
   ```bash
   cp example.env .env
   ```
3. Open `.env` en voeg je Discord webhook URL toe:
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnop
   ```

### 2.2 Backend Herstarten
```bash
# Stop de backend (Ctrl+C)
# Start opnieuw
npm start
# of met nodemon
npm run dev
```

## ✅ Stap 3: Testen

1. Ga naar je admin dashboard (`http://localhost:3000/trading`)
2. Maak een test signal aan
3. Check je Discord channel - je zou een mooi embed bericht moeten zien! 🎉

## 📱 Wat krijg je in Discord?

### 🚨 Nieuwe Signals
Rich embed berichten met:
- 🐅 **Tiger Hunt Pro branding**
- 📊 **Symbol** (bijv. BTC/USDT)
- 🎯 **Action** (LONG/SHORT) 
- 💰 **Current Price** (live Binance data)
- ⚡ **Leverage** (indien opgegeven)
- 🛑 **Stop Loss** levels
- 🎯 **Take Profit** levels (TP1, TP2)
- 📈 **Risk:Reward** ratio
- 📋 **Strategy** notes
- 🕐 **Timestamp**

### 🗑️ Signal Deletions
Eenvoudige notificaties wanneer signals verwijderd worden.

## 🎨 Voorbeeld Discord Bericht

```
🚨 NEW TRADING SIGNAL 🚨

🐅 TIGER HUNT PRO - LONG SIGNAL
BTC/USDT trading signal is now live!

📊 Symbol: BTC/USDT
🎯 Action: LONG
💰 Current Price: $116,234
⚡ Leverage: 10x
🛑 Stop Loss: $114,500
🎯 Take Profit 1: $118,000
🎯 Take Profit 2: $120,000
📈 Risk:Reward: 1:2.5

🐅 Tiger Hunt Pro Trading Signals
```

## 🔧 Troubleshooting

### Discord berichten komen niet aan?
1. **Check de webhook URL** - zorg dat hij correct is in `.env`
2. **Check permissies** - zorg dat de webhook nog actief is in Discord
3. **Check backend logs** - kijk naar console errors
4. **Test de webhook** handmatig met een tool zoals Postman

### Backend errors?
1. **Missing axios?** - Run `npm install axios` in de backend directory
2. **Environment variables** - Zorg dat `.env` correct geladen wordt

### Discord rate limiting?
- Discord heeft rate limits voor webhooks
- Tiger Hunt Pro respecteert deze automatisch
- Bij veel signals kan er een kleine vertraging optreden

## 🚀 Extra Features

### Custom Domain
Update de `avatar_url` en `icon_url` in `discordService.js` naar je eigen domain:
```javascript
avatar_url: 'https://yourdomain.com/tigerlogo.png'
```

### Multiple Channels
Je kunt meerdere webhooks configureren voor verschillende signal types door de `discordService.js` uit te breiden.

### Mentions & Roles
Voeg Discord mentions toe aan belangrijke signals door het `content` veld aan te passen.

## 🎯 Resultaat

Nu krijg je **real-time** Discord notificaties voor:
- ✅ **Nieuwe signals** → Rich embeds met alle details
- ✅ **Signal deletions** → Eenvoudige notificaties  
- ✅ **Professional appearance** → Tiger Hunt Pro branding
- ✅ **Mobile notifications** → Discord push notifications op je phone

Perfect voor teams die Discord gebruiken voor trading communicatie! 🚀🐅 