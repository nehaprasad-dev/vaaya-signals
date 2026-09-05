Vaaya Signals is a V1 company watch product that tracks a company over time and surfaces only meaningful changes:

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000/watches](http://localhost:3000/watches).

V1 flow:

- Add a company URL and choose the signals to watch
- First run creates a baseline snapshot
- Manual reruns create a fresh snapshot, compare it with the previous one, and surface the top 3 meaningful changes
- Each change includes what changed, why it matters, and what you could do next

Core endpoints:

- `POST /api/watches`
- `GET /api/watches`
- `GET /api/watches/:id`
- `DELETE /api/watches/:id`
- `POST /api/watches/:id/run`
- `GET /api/watches/:id/changes`
- `GET /api/watches/:id/snapshots`

Useful scripts:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Provider modes:

- `vaaya` is the intended runtime mode for this project. If `VAAYA_API_KEY` is present, the app uses Vaaya's real HTTP API by default.
- `demo` still exists as an explicit fallback mode, but the primary product path is real Vaaya-backed data collection.
