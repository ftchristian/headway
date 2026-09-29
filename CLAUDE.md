# Headway

A live transit map plus a reliability scorecard. It shows every bus and train moving in real time (from GTFS-Realtime feeds) and measures how well each route actually keeps its schedule. Portfolio project on a 13-week plan: Sep 30 to Dec 31, 2026.

- Full spec: `docs/spec.md`
- Roadmap and checklists: `docs/roadmap.md`
- Design decisions: `docs/decisions/`
- Local machine setup (macOS): `docs/setup.md`

## Current phase

**Phase 1: Foundation** (Sep 30 to Oct 11). Gate: `GET /vehicles` live in production, deployed from CI.
Update this section whenever the phase changes.

## How to work with me

I'm building this to learn and to explain every part of it in job interviews. So:

- **Plan before coding.** For anything bigger than a small fix, propose a short plan and wait for my OK.
- **Explain the why.** When you pick a library, pattern or data structure, say why in 1 to 3 sentences and name the main alternative.
- **Small steps.** One roadmap checklist item per session. Keep diffs small enough to review.
- **The core pieces are mine to write.** For arrival detection, the snapshot-plus-delta WebSocket protocol, the caching layer and the metric formulas: guide me, review my code and point out bugs, but don't write the whole thing unless I ask.
- **Log decisions.** When a real design choice is made, add an entry in `docs/decisions/` using the template.
- **Track progress.** Tick items in `docs/roadmap.md` when they're done.
- **Be safe.** Never commit secrets. Ask before anything destructive: deleting files, dropping or resetting databases, `terraform apply` or `destroy`, force-pushing.
- **I'm new to macOS.** When you give me a terminal command, say where to run it.

## Stack

- TypeScript everywhere on Node.js 24 LTS (`.nvmrc`), pnpm workspaces + Turborepo monorepo
- API: Fastify, with OpenAPI docs generated from route schemas
- Live gateway: `ws` WebSocket server, Redis pub/sub between gateway instances
- Background jobs: BullMQ on Redis
- Database: PostgreSQL + TimescaleDB + PostGIS
- Cache and live state: Redis
- Raw archive: Amazon S3 as Parquet files
- Frontend: React + Vite, TanStack Router and Query, Zustand, deck.gl on MapLibre GL
- Infrastructure: AWS (EC2 t4g.large ARM, S3, CloudFront), Terraform, Docker Compose, Caddy
- CI/CD: GitHub Actions, images in GitHub Container Registry, blue-green deploys
- Tests: Vitest, Testcontainers, Playwright, k6
- Observability: Prometheus + Grafana, Sentry
- Python (uv + DuckDB) only for analysis notebooks in `analysis/`

## Planned repo layout

```
apps/
  web/        React frontend
  api/        Fastify REST API
  gateway/    WebSocket gateway
  poller/     GTFS-Realtime feed poller
  jobs/       BullMQ workers: static imports, arrival detection, rollups, archiving
packages/
  gtfs/       GTFS + GTFS-Realtime parsing, service-day time utilities
  db/         schema, migrations, query helpers
  shared/     shared types (API responses, WebSocket messages), config loading
infra/
  terraform/  AWS resources
  docker/     Compose files, Caddyfile
analysis/     Python notebooks
docs/         spec, roadmap, setup, decisions
```

This is the plan, not the current state. Create folders only when work needs them.

## Commands

Run from the repo root. Keep this list accurate as scripts are added.

- `pnpm install` installs every workspace package
- `pnpm lint` runs ESLint (type-aware) in every package, through Turborepo
- `pnpm typecheck` runs `tsc` (no emit) in every package
- `pnpm test` runs Vitest unit tests in every package
- `pnpm format` / `pnpm format:check` run Prettier on the whole repo (Markdown is excluded)
- CI (`.github/workflows/ci.yml`) runs `format:check`, then lint, typecheck and test, on every push and PR

Not yet:

- `pnpm dev` runs the local stack
- `pnpm test:integration`
- `docker compose -f infra/docker/compose.dev.yml up -d` starts Postgres and Redis locally

## Conventions

- TypeScript `strict` mode. No `any` without a comment explaining why.
- ESM modules only.
- Store all times in UTC (`timestamptz`). Convert to the agency's time zone only for display and GTFS service-day math.
- Database migrations must be backward compatible (expand, then contract): blue-green deploys run old and new code at the same time.
- Feed data inserts are idempotent (`ON CONFLICT DO NOTHING`) and batched per snapshot, never row by row.
- Queries on raw positions always filter by time first.
- Never poll a feed faster than it updates. One poller per feed across the system (Redis lock).
- Configuration comes from environment variables, validated at startup. `.env.example` lists every variable; `.env` is never committed.
- Conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Every bug fix comes with a test that would have caught it.

## Domain facts to get right

- City 1 is Orange County, California (OCTA). Realtime feeds need no key and work over HTTPS only (plain HTTP is refused): `https://api.octa.net/GTFSRealTime/protoBuf/VehiclePositions.aspx`, `tripupdates.aspx`, `servicealerts.aspx`. Static GTFS: `https://www.octa.net/current/google_transit.zip`. Time zone: `America/Los_Angeles`.
- OCTA's feed header advances about every 5 s, but each bus reports far less often. Skip unchanged vehicles by their own timestamp, not just the header.
- OCTA data is free for non-commercial use only; commercial use needs OCTA's written permission. Credit OCTA in the map footer.
- Other Southern California feeds, tested: `docs/feeds/socal.md`.
- Backup city: Boston (MBTA), kept for a future improvement or if OCTA's feed fails. Realtime feeds need no key: `https://cdn.mbta.com/realtime/VehiclePositions.pb`, `TripUpdates.pb`, `Alerts.pb` (JSON versions: swap `.pb` for `.json`). Docs: https://github.com/mbta/gtfs-documentation
- GTFS schedule times can pass 24:00:00. `25:30:00` means 1:30 AM the next calendar day, but it belongs to the previous service day.
- Vehicles can appear with no trip (out of service); keep them on the map but out of the analytics.
- Trip IDs can stop matching after a schedule change. Static GTFS is re-imported daily and versioned.
- Feed outages are recorded as gaps. An outage must never be counted as missing buses.
- Metric definitions (on-time performance, headway regularity, bunching, missing trips, excess wait) live in `docs/spec.md` under "Reliability analytics".
