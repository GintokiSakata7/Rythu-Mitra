# MandiMitra

**Find the best net realization — not the highest price.**

MandiMitra is a React + Node/Express web app for farmers that progressively searches only as many nearby markets and buyer opportunities as economically justified. It combines market price, transport, travel time and risk/spoilage into an expected net realization score.

## Stack

- React + Vite
- Express + Node.js 22+
- Supabase PostgreSQL
- Groq SDK for natural-language explanation and harvest-intent parsing
- Lucide React icons
- Responsive mobile-first web UI

Current package choices track the October 2026 ecosystem: React 19.3, Vite 8.3, Express 5.2, Supabase JS 2.117, Groq SDK 1.6 and Lucide React 1.53.

## Core optimization

The backend does not fetch every market.

1. Start with the nearest 5 candidate markets.
2. Calculate expected net realization.
3. Compute a break-even price for farther markets.
4. Expand the search only when a farther candidate could economically beat the current best.
5. Stop early once additional search is no longer justified.

### Objective

`Net Realization = Expected Sale Value - Transport Cost - Time Cost - Risk Cost`

The engine also records search metadata:

- candidate markets evaluated
- expansion levels used
- external-data calls
- markets skipped by break-even pruning
- stop reason

## Run locally

### 1. Requirements

- Node.js 22+
- A Supabase project (optional in demo mode)
- A Groq API key (optional; the app falls back to deterministic explanations)
- A data.gov.in API key (optional; the app falls back to seeded market data)

### 2. Install

From the root:

```bash
npm install
```

### 3. Environment

Copy:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`.

For a full Supabase setup provide:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service role key to the browser.

For Groq:

- `GROQ_API_KEY`
- optional `GROQ_MODEL` (default: `openai/gpt-oss-20b`)

For data.gov.in:

- `DATA_GOV_API_KEY`
- `DATA_GOV_RESOURCE_ID`

The data connector is intentionally adapter-based. When credentials are absent or the upstream response is unavailable, MandiMitra uses the included deterministic seed dataset.

### 4. Supabase

Open Supabase SQL Editor and run:

```text
supabase/schema.sql
supabase/seed.sql
```

### 5. Start

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Demo scenario

Use:

- Crop: Tomato
- Quantity: 5,000 kg
- Location: Nalgonda
- Quality: Grade A
- Transport: Not available

The seeded dataset is designed to demonstrate the optimization logic where the highest advertised price is not necessarily the best net realization.

## API

- `GET /api/health`
- `GET /api/markets/candidates?lat=&lng=&crop=&level=1`
- `POST /api/recommendations`
- `GET /api/buyers/requirements`
- `POST /api/buyers/requirements`
- `POST /api/ai/explain`
- `POST /api/ai/parse-harvest`

## Important production notes

- The seeded data is fictional/demo data. Do not present it as live pricing.
- Connect the data.gov.in adapter only after validating the exact resource schema for your API key/resource.
- The time/risk coefficients are configurable assumptions, not official farming economics.
- A production version should use authenticated Supabase roles and server-side authorization for farmer/buyer actions.
