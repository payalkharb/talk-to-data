# Talk to Data (Supabase + Hugging Face + React + Express)

A minimal full‑stack starter that converts natural‑language questions into SQL,
executes against a **Supabase Postgres** database, and returns results +
a monthly chart.

## Stack
- **Backend:** Node.js + Express + `pg` (direct Postgres, faster than REST)
- **DB:** Supabase (Postgres)
- **NL→SQL:** Hugging Face Inference API (fallback rule-based parser included)
- **Frontend:** React + Vite + Recharts

## Quick Start

### 1) Create tables in Supabase (SQL editor)
Paste `server/schema.sql`, then `server/seed.sql` (optional demo data).

### 2) Configure environment
Copy `.env.example` → `.env` (for backend) and fill values:
```
SUPABASE_DB_URL=postgres://USER:PASSWORD@HOST:5432/postgres
HF_API_KEY=hf_********************************
PORT=5000
```
> TIP: In Supabase, go to **Project Settings → Database** and copy the **Direct Connection** string.

For the frontend, create `client/.env` with:
```
VITE_API_URL=http://localhost:5000
```

### 3) Install & run
```
# Backend
cd server
npm install
npm start

# Frontend
cd ../client
npm install
npm run dev
```
Open http://localhost:5173

## API
`POST /api/query`
```json
{ "prompt": "give me sales in 2023 in sonipat" }
```
Response:
```json
{
  "answer": "Total sales for Sonipat in 2023: ₹6,78,900. Monthly breakdown attached.",
  "sql": "SELECT ...",
  "rows": [ { "month": "2023-01-01", "total": 12345 }, ... ]
}
```

## Notes
- If the Hugging Face model is unavailable, the server uses a **fallback** parser
  (handles patterns like: "sales in <year> in <city>" and returns monthly totals).
- Adjust table/column names in `schema.sql` if you already have your own schema.
