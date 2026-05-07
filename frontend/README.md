# Ceres Frontend

Space-themed dark purple dashboard for the Ceres AI Options Analysis Agent.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
app/
  page.tsx          ← Main dashboard
  layout.tsx        ← Root layout
  globals.css       ← Space theme styles

components/
  Stars.tsx         ← Animated star background
  Logo.tsx          ← Orbiting logo
  MetricCard.tsx    ← Price/IV/HV/PCR cards
  AgentPipeline.tsx ← 5-agent status panel
  ContractsTable.tsx← Options contracts table

lib/
  api.ts            ← FastAPI backend calls
```

## Environment

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend.
Default: `http://127.0.0.1:8000`

For production: update to your Render deployment URL.
