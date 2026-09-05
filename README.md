# Vaaya Signals

Watch a company over time and only look at what actually changed.

You add a URL (Stripe, Adobe, whoever you care about). The first run saves the current picture: product news, hiring, pricing, leadership, and so on. Later runs compare against that picture and rank the few changes worth acting on - what moved, why it matters, and a next step.

## Setup

You need Node.js, a Postgres database (Neon works), and a Vaaya API key.

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Postgres connection string
- `VAAYA_API_KEY` — your Vaaya key
- `VAAYA_BASE_URL` — usually `https://vaaya.ai`
- `RESEARCH_PROVIDER_MODE` — `vaaya` for live data, or `demo` if you just want fixture data

Then:

```bash
npm run db:push
npm run dev
```

Open [http://localhost:3000/watches](http://localhost:3000/watches).

## How a watch works

1. Create a watch with a company URL and the signal types you care about (funding, hiring, product, pricing, leadership, news).
2. The first run stores a snapshot. That is the current state, not a “change.”
3. Click **Run now** later. The app fetches a fresh snapshot, diffs it with the last one, and shows the top meaningful changes.
4. Open the company page to see the live signals, the ranked diffs, run history, and sources.

## API

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/watches` | List watches |
| `POST` | `/api/watches` | Create a watch |
| `GET` | `/api/watches/:id` | Get one watch |
| `DELETE` | `/api/watches/:id` | Delete a watch |
| `POST` | `/api/watches/:id/run` | Run a watch now |
| `GET` | `/api/watches/:id/changes` | Latest ranked changes |
| `GET` | `/api/watches/:id/snapshots` | Snapshot history |

## Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
