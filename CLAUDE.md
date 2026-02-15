# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TRON NSE** — AI-Powered Intelligence for Indian Equities. A production-ready web app that lets users search any NSE-listed stock and view comprehensive financial data (price, financials, earnings, historical OHLCV) with an AI-powered 0–100 investment scoring engine. Visual identity is TRON: Legacy inspired (dark void + neon orange glow).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + custom CSS (TRON glow utilities) |
| Price Charts | TradingView Lightweight Charts v4 |
| Stat Charts | Recharts (EPS/Revenue bar charts) |
| Database | SQLite via better-sqlite3 |
| Cache | node-cache (in-memory TTL) |
| Animation | Framer Motion |
| Validation | Zod (API inputs, env vars, Perplexity responses) |
| Data Source | Perplexity API (sonar model) — sole data provider |

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check (tsc --noEmit)
npm run db:init      # Initialize SQLite schema
npm run db:seed      # Seed popular NSE tickers
npm run test:api     # Test Perplexity API connectivity
```

## Architecture

### Data Flow

```
Client → Next.js Route Handler → node-cache check
  → HIT: return cached JSON
  → MISS: build prompt → Perplexity API (sonar) → parse with Zod → cache with TTL → return JSON
```

All stock data is sourced exclusively via Perplexity API. The backend proxies all requests — no direct client-side calls to Perplexity.

### API Routes (all under `src/app/api/`)

| Route | Purpose | Cache TTL |
|-------|---------|-----------|
| `GET /api/stock/search?q=` | Ticker/name search | 5 min |
| `GET /api/stock/popular` | Trending tickers | 15 min |
| `GET /api/stock/[ticker]/overview` | Price, stats, profile, news, bull/bear | 2 min |
| `GET /api/stock/[ticker]/financials?period=annual\|quarterly\|ttm` | Financial statements | 30 min |
| `GET /api/stock/[ticker]/earnings` | EPS/Revenue history | 30 min |
| `GET /api/stock/[ticker]/historical?range=1D\|5D\|1M\|6M\|1Y\|5Y\|MAX` | OHLCV data | 5 min (1D), 1 hr (others) |
| `GET /api/stock/[ticker]/ai-score` | AI investment score | 1 hr |

### Route Handler Pattern

Every route handler follows: rate-limit → validate input (Zod) → check cache → fetch from Perplexity → validate response (Zod) → cache with TTL → log to SQLite → return JSON. Error responses use structured `{ error: string }` format.

### AI Scoring Engine (`src/lib/ai-scoring/`)

Weighted 0–100 score computed deterministically from Perplexity-fetched metrics:
- 30% Valuation (P/E vs sector, P/B, EV/EBITDA, dividend yield)
- 25% Growth (revenue, EPS, profit growth YoY)
- 20% Profitability (ROE, operating margin, debt/equity)
- 15% Technical (price vs 52W range, RSI, price vs 200 DMA)
- 10% Sentiment (analyst consensus, news sentiment)

Raw metrics fetched via single Perplexity call; scoring is pure deterministic code. A second Perplexity call generates the institutional-grade reasoning paragraph. Score maps to grade: ≥80 Strong Buy, ≥65 Buy, ≥45 Hold, ≥25 Sell, <25 Strong Sell.

### Perplexity Integration (`src/lib/perplexity/`)

- `client.ts` — fetch wrapper for `POST https://api.perplexity.ai/chat/completions`
- `prompts.ts` — parameterized prompt templates per endpoint (overview, financials, earnings, historical, scoring)
- `schemas.ts` — Zod schemas matching expected structured output
- `parse.ts` — response parsing with fallback for missing fields (null, not hallucinated)

Uses `response_format: { type: "json_schema" }` for structured output.

### Database (`src/lib/db/`)

SQLite with three tables:
- `search_history` — ticker, company_name, searched_at, ip_hash
- `popular_tickers` — ticker, company_name, search_count, last_price, price_change_pct
- `ai_score_logs` — ticker, total_score, grade, category scores, confidence, reasoning, scored_at

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, metadata
│   ├── page.tsx                      # Landing page (hero + search)
│   ├── globals.css                   # Tailwind + TRON theme variables + glow utilities
│   ├── stock/[ticker]/page.tsx       # Stock page (tabs + AI score)
│   └── api/stock/...                 # Route handlers (see API Routes above)
├── components/
│   ├── ui/                           # Primitives: Button, Card, Badge, Input, Tabs, Skeleton, GlowBorder
│   ├── layout/                       # Header (with search), Footer
│   ├── landing/                      # HeroSection, CurrencyRain, PerspectiveGrid, TronDisc, PopularTickers
│   ├── stock/                        # StockHeader, AIScoreCard, TabContainer
│   │   ├── overview/                 # PriceChart, KeyStats, CompanyProfile, NewsFeed, BullBearCase
│   │   ├── financials/               # FinancialTable, PeriodToggle
│   │   ├── earnings/                 # EPSChart, RevenueChart
│   │   └── historical/               # OHLCVTable, DateRangeFilter
│   └── common/                       # ErrorMessage, LoadingSpinner
├── lib/
│   ├── perplexity/                   # API client, prompts, schemas, parser
│   ├── ai-scoring/                   # engine.ts, weights.ts, per-category scorers
│   ├── db/                           # connection.ts, schema.sql, CRUD modules
│   ├── cache/                        # node-cache instance + TTL constants
│   ├── rate-limit/                   # Request rate limiter
│   ├── utils/                        # format.ts, sanitize.ts, constants.ts, env.ts
│   └── types/                        # stock.ts, financial.ts, ai-score.ts, api.ts
└── hooks/                            # use-stock-data.ts, use-search.ts, use-tab-data.ts
```

## Design System (TRON: Legacy Aesthetic)

### Color Palette (CSS custom properties in globals.css)

| Token | Value | Usage |
|-------|-------|-------|
| `--tron-orange` | `#FF6A00` | Primary accent, buttons, active states |
| `--tron-orange-dim` | `#CC5500` | Hover tint |
| `--tron-bg-primary` | `#0a0a0f` | Page background |
| `--tron-bg-secondary` | `#111118` | Section background |
| `--tron-bg-card` | `#16161f` | Card/panel background |
| `--tron-border` | `rgba(255,106,0,0.15)` | Subtle card borders |
| `--tron-text-primary` | `#e8e8ef` | Body text |
| `--tron-text-secondary` | `#8888a0` | Muted text |

### Glow Rules

- All primary buttons: soft outer `box-shadow` glow
- Active tabs: neon orange underglow
- Hover: glow intensity increases ~20%
- Cards: faint border glow (`--tron-glow`)
- Price change: green glow if positive, red glow if negative
- No flat UI — everything feels illuminated

### Typography

- Headings: Orbitron (futuristic, geometric)
- Data/numbers: Share Tech Mono (monospace)
- Body: Inter

### Key Visual Elements

- **Landing hero**: fullscreen dark background, perspective grid lines, falling currency symbols (₹ $ € £) with rotation/blur, neon orange glow, max 25 concurrent animated elements
- **TRON disc**: rotating concentric neon rings behind stock price, 25–40s rotation, pulsing glow every 4s, GPU-accelerated
- **Charts**: black background, neon orange lines, thin grid, glow line shadow, crosshair tooltip with glow border
- **Micro-interactions**: button ripple glow, tab slide animation, search bar expand on focus, count-up animation on metric values, AI score animates 0→final

## Hard Constraints

1. **No yfinance** — never import or use yfinance under any circumstances
2. **No Perplexity mention to users** — the data source must never be exposed in the UI, client-side code, or any user-visible text
3. **Perplexity API is the sole data source** — all stock data must flow through the Perplexity sonar model
4. **Footer must display**: "Built by Shriansh Jena"
5. **Compliance disclaimer** on every stock page: "For informational purposes only. Not investment advice."
6. **No price predictions or absolute guarantees** in AI analysis output
7. **All Perplexity calls server-side only** — no API keys in client bundles
8. **Input sanitization** on all ticker parameters (regex: `/^[A-Z0-9&.-]+$/`)
9. **Rate limiting** on all API routes

## Environment Variables

Required in `.env.local`:
```
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxx
```

Optional (with defaults):
```
PERPLEXITY_MODEL=sonar
DATABASE_PATH=./data/tron-nse.db
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW_MS=60000
CACHE_MAX_KEYS=5000
NEXT_PUBLIC_SITE_URL=https://tron-nse.example.com
```

All env vars validated at startup via Zod schema in `src/lib/utils/env.ts`.

## Stock Page Tabs

The stock page (`/stock/[ticker]`) has four lazy-loaded tabs:
1. **Overview** — price chart (1D–MAX), key stats grid, company profile sidebar, news feed, latest developments, key issues (bull/bear dual panel)
2. **Financials** — sub-tabs: Key Stats, Income Statement, Balance Sheet, Cash Flow; period toggle: Annual/Quarterly/TTM; multi-year historical table
3. **Earnings** — EPS chart, Revenue chart, beat/miss indicators, quarterly breakdown
4. **Historical Data** — OHLCV table with timeframe filters, sortable columns

## Deployment Notes

- Target: VPS deployment (Railway, Render, DigitalOcean) — SQLite needs persistent filesystem, not compatible with Vercel serverless
- Production build: `next build && next start`
- Must include: `robots.txt`, `sitemap.xml`, OpenGraph meta, SEO metadata
- Enable gzip compression in `next.config.ts`
- Lighthouse performance target: >90
