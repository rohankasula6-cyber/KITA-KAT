# Kita Kat — TradeLog + MeroShare

A combined investment journal and live MeroShare portfolio tracker.

## Project Structure

```
Kita_kat_combined/
├── backend/          Express API server (proxies MeroShare CDSC API)
│   ├── index.js      All API routes
│   ├── .env          Credentials fallback (fill before running)
│   └── package.json
├── frontend/         Vite + React app
│   └── src/
│       ├── App.jsx                   Root — all tabs wired here
│       ├── context/
│       │   └── MeroShareContext.jsx  Auth state + API helpers
│       ├── components/
│       │   └── LoginScreen.jsx       MeroShare login UI
│       └── tabs/
│           ├── Dashboard.jsx         P&L charts
│           ├── Journal.jsx           Trade log
│           ├── Investment.jsx        Long-term investments
│           ├── Watchlist.jsx         Watchlist
│           ├── Losing.jsx            Losing trades filter
│           ├── MSPortfolio.jsx  🆕   Live MeroShare portfolio
│           ├── MSIpos.jsx       🆕   Open IPO / FPO issues
│           └── MSWacc.jsx       🆕   WACC purchase history
└── package.json      Root scripts (runs both with concurrently)
```

## Quick Start

### 1. Install dependencies

```bash
# From repo root
npm install          # installs concurrently
npm run install:all  # installs backend + frontend deps
```

### 2. Configure backend credentials (optional — you can also login via the UI)

Edit `backend/.env`:

```env
MS_CLIENT_ID=156          # Your DP's numeric ID
MS_USERNAME=your_username
MS_PASSWORD=your_password
PORT=5000
```

### 3. Run both servers

```bash
npm run dev
```

- Backend  →  http://localhost:5000
- Frontend →  http://localhost:5173

## How It Works

| What | Where |
|---|---|
| Trade Journal, Investments, Watchlist | Stored in browser `localStorage` (no backend needed) |
| MS Portfolio, Open IPOs, WACC | Fetched live from `cdsc.com.np` via the Express backend |

### Authentication flow

1. Click any **MeroShare tab** (🏦 MS Portfolio, 📋 Open IPOs, ⚖ WACC)
2. A **login screen** appears — enter your DP Client ID, username, password
3. OR click **"Use .env Credentials"** to use the values in `backend/.env`
4. On success, a session token is stored in `sessionStorage` (browser tab only, never on disk)
5. Your name appears in the topbar; click it to **logout**

## API Endpoints (backend)

| Method | Path | Description |
|---|---|---|
| POST | `/api/login` | Login → returns JWT token |
| GET | `/api/profile` | Own details (name, BOID, etc.) |
| GET | `/api/shares` | Current demat holdings |
| GET | `/api/portfolio` | Portfolio with LTP and market value |
| GET | `/api/ipos` | Open IPO / FPO issues |
| GET | `/api/wacc` | WACC purchase records for all scrips |
| GET | `/api/health` | Health check |

All GET routes require the `x-meroshare-token` header (handled automatically by the frontend).

## Security Notes

- Credentials typed in the login screen are sent to `cdsc.com.np` and never persisted anywhere
- The MeroShare session token lives only in `sessionStorage` (cleared on tab close)
- Never commit `backend/.env` with real credentials to a public repo — add it to `.gitignore`
