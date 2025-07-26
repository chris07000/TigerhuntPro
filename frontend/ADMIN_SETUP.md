# 🔐 Tiger Hunt Pro Admin Setup

## Environment Variables Setup

Voor de admin login functionaliteit moet je een `.env.local` file aanmaken in de `frontend/` folder.

### 1. Kopieer example.env.local naar .env.local
```bash
cp example.env.local .env.local
```

### 2. Update je .env.local file
Zorg dat je `.env.local` deze variabelen bevat:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000

# Development Configuration
NEXT_PUBLIC_ENV=development 

# Admin Authentication
NEXT_PUBLIC_ADMIN_PASSWORD=TigerHunt2024Admin!
```

## Admin Login Beveiliging

### 🎯 **Beveiligde Pagina's:**
- `/trading` - Admin signal creation dashboard

### 🔑 **Default Admin Wachtwoord:**
```
TigerHunt2024Admin!
```

### 🛡️ **Beveiliging Features:**
- ✅ Wachtwoord opgeslagen in environment variables (niet in code)
- ✅ Session-based login met localStorage
- ✅ Automatische logout button in admin mode
- ✅ Redirect naar public dashboard als niet ingelogd
- ✅ Clean login interface met Tiger Hunt Pro branding

### 🔄 **Login Flow:**
1. Ga naar `/trading`
2. Login scherm verschijnt automatisch
3. Voer admin wachtwoord in
4. Access tot admin dashboard
5. "Logout Admin" button rechtsboven

### 🚨 **Belangrijk voor Productie:**
- **Verander het default wachtwoord** in productie!
- Gebruik een sterk, uniek wachtwoord
- Voeg `.env.local` toe aan `.gitignore` (is al gedaan)

### 🔧 **Wachtwoord wijzigen:**
Edit het `NEXT_PUBLIC_ADMIN_PASSWORD` in je `.env.local` file:
```bash
NEXT_PUBLIC_ADMIN_PASSWORD=JouwNieuweSterkWachtwoord123!
```

## Gebruikshandleiding

### Voor Admin (Jij):
1. Ga naar `/trading`
2. Log in met admin wachtwoord
3. Maak signals aan
4. Log uit met "Logout Admin" button

### Voor Publiek:
- `/dashboard` - Publieke live signals (geen login vereist)
- `/journey` - Trading journey (geen login vereist)
- `/` - Homepage (geen login vereist)

**Perfect beveiligd! 🛡️ Alleen jij hebt toegang tot de admin functionaliteit!** 