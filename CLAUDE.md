# Headway

A live transit map plus a reliability scorecard. It shows every vehicle moving in real time (from GTFS-Realtime feeds) and measures how well each route actually keeps its schedule. Portfolio project. The original 13-week plan (Sep 30 to Dec 31, 2026) slipped, so the schedule was reset on Nov 12, 2026. The plan below is the one to follow.

- Full spec: `docs/spec.md`
- Roadmap and checklists: `docs/roadmap.md` (its dates are from the original plan; see "Plan from Nov 12, 2026" below)
- Design decisions: `docs/decisions/`
- Local machine setup (Windows): `docs/setup.md`
- Public project page: `README.md`

## Current phase

**Phase 1: Foundation** (Nov 12 to Nov 29). Gate: `GET /v1/cities/octa/vehicles` live on the EC2 server, deployed from CI, with raw data recording running.

Done: monorepo with type-aware lint, type checks and Vitest running in GitHub Actions on every push; Docker Compose for local Postgres (TimescaleDB + PostGIS) and Redis.

Left in this phase, in order:

1. Import OCTA's static GTFS into versioned tables
2. Poller for OCTA VehiclePositions and TripUpdates: latest state to Redis, raw snapshots to Postgres
3. Start recording raw data as soon as the poller works. History that was never recorded can't be analyzed later.
4. Terraform for the VPC, EC2, S3, IAM role and a $50 Budgets alert
5. `GET /v1/cities/octa/vehicles` on EC2, deployed from GitHub Actions (a simple pull-and-restart deploy is fine for now; blue-green waits until Phase 5)

Update this section whenever the phase changes, and tick items in `docs/roadmap.md`.

## Plan from Nov 12, 2026

This plan assumes about 20 hours a week during the semester and more over winter break. If my hours change, adjust the dates and use the cut list instead of letting every gate slip.

| Phase | Dates | Gate |
| --- | --- | --- |
| 1. Foundation | Nov 12 to Nov 29 | Vehicles API live on EC2 from CI, raw recording running |
| 2. Live map | Nov 30 to Dec 20 | Public URL with the live OCTA map, freshness measured, first k6 load test run |
| 3. Reliability analytics | Dec 21 to Jan 17 | Arrival detection validated against OCTA's data, route scorecards live |
| 4. Scale | Jan 18 to Feb 7 | 3 cities live, final load test published in the README |
| 5. Polish | Feb 8 to Feb 21 | README filled with measured numbers, demo GIF, blue-green deploys, write-up |

**Why this order:** I'm applying to internships now, and my resume already describes this project. The phases go in the order that turns those claims into measured facts the fastest: the live map, then the freshness number, then the load test, then the scorecards, then 3 cities.

**Phase details**

- **Phase 2:** WebSocket gateway with the snapshot-plus-delta protocol, heartbeats and resync. React map with MapLibre and deck.gl, smooth motion between updates, route filter, vehicle panel and freshness badge. CloudFront in front. Instrument feed-to-screen freshness (see the table below). Run a first k6 test against the gateway to get baseline numbers.
- **Phase 3:** compression and retention on raw data. Arrival detection job with replay tests. Check arrivals against OCTA's past arrival times and record the error rate. Metrics: on-time performance, headway regularity, bunching, missing trips, excess wait. Route scorecard and rankings pages, plus a methodology page.
- **Phase 4:** per-agency adapters and a feed registry. Second city: Boston (MBTA), since its feeds are open and need no key. Third city: New York (MTA Bus Time, free key) for scale, or Foothill Transit if the key is slow to arrive. City switcher and status page. Final k6 test to 1,000+ clients after fixing whatever the first test exposed.
- **Phase 5:** performance pass (60 fps target, bundle size), accessible list views, blue-green deploys, demo GIF and video, published analysis.

**Cut list** (cut in this order if a gate slips more than 3 days):

1. Day-replay timelapse
2. Headway's own prediction model (keep showing the agency's predictions)
3. Blue-green deploys (keep the simple deploy)
4. The third city

## Resume numbers to back with real measurements

My resume (where this project is listed as "Transport Tracker") quotes these numbers, and interviewers will ask how each one was measured. Treat measuring them as part of the gate for the phase that owns them.

| Resume claim | How to measure it | Phase |
| --- | --- | --- |
| Feed-to-screen latency p95 under 5 s | Each delta carries the vehicle's feed timestamp. The browser records when it drew the update and reports a sample of the gaps to the API as a Prometheus histogram. Report p95 over at least 7 days of live traffic. | 2 |
| 1,000 concurrent WebSocket clients at p95 broadcast under 250 ms | k6 script run from a separate machine. The server stamps each delta's send time and the virtual clients record receive time. Ramp to 1,000 clients, hold for 10 minutes, report p95. | 2 (baseline), 4 (final) |
| Every bus in 3 cities | Distinct vehicle IDs per city per day from the poller's data, shown on the status page | 4 |
| Route on-time rate, bunching and excess wait | Scorecard job output, with arrival detection checked against the agency's past arrival times and the error rate published | 3 |

**Rules for these numbers:**

- When a number is measured, add it to the "Measured" column in `README.md` along with one line on how it was measured.
- If a measurement misses its target, say so plainly in the README and tell me right away, so I can update my resume to match. Never round a result toward the target.
- Keep the raw results (k6 summaries, Grafana screenshots) in `docs/results/` so I can show them in an interview.

## How to work with me

I'm building this to learn and to explain every part of it in job interviews. So:

- **Plan before coding.** For anything bigger than a small fix, propose a short plan and wait for my OK.
- **Explain the why.** When you pick a library, pattern or data structure, say why in 1 to 3 sentences and name the main alternative.
- **Small steps.** One roadmap checklist item per session. Keep diffs small enough to review.
- **The core pieces are mine to write.** For arrival detection, the snapshot-plus-delta WebSocket protocol, the caching layer and the metric formulas: guide me, review my code and point out bugs, but don't write the whole thing unless I ask.
- **Log decisions.** When a real design choice is made, add an entry in `docs/decisions/` using the template.
- **Track progress.** Tick items in `docs/roadmap.md` when they're done, and keep the "Project status" table in `README.md` current.
- **Be safe.** Never commit secrets. Ask before anything destructive: deleting files, dropping or resetting databases, `terraform apply` or `destroy`, force-pushing.
- **I work on Windows.** Give terminal commands for PowerShell, not bash or zsh, and say where to run them. My PowerShell is Windows PowerShell 5.1, which doesn't support `&&`, so put each command on its own line.

**First task in the next session:** update the dates in `docs/roadmap.md` to match the plan above, then continue with the first unfinished item under "Current phase".

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
- CI/CD: GitHub Actions, images in GitHub Container Registry, blue-green deploys (Phase 5)
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
docs/         spec, roadmap, setup, decisions, results
```

This is the plan, not the current state. Create folders only when work needs them.

## Commands

Run from the repo root. Keep this list accurate as scripts are added.

- `pnpm install` installs every workspace package
- `pnpm lint` runs ESLint (type-aware) in every package, through Turborepo
- `pnpm typecheck` runs `tsc` (no emit) in every package
- `pnpm test` runs Vitest unit tests in every package
- `pnpm format` / `pnpm format:check` run Prettier on the whole repo (Markdown is excluded)
- `pnpm infra:up` starts local Postgres (TimescaleDB + PostGIS) and Redis in Docker and waits until both are healthy; needs `.env` (`Copy-Item .env.example .env` in PowerShell)
- `pnpm infra:down` stops them and keeps the data. `docker compose --env-file .env -f infra/docker/compose.dev.yml down -v` also deletes the data: ask first
- `pnpm infra:logs`, `pnpm infra:psql`, `pnpm infra:redis` follow logs, open a SQL prompt, open a Redis prompt
- CI (`.github/workflows/ci.yml`) runs `format:check`, validates the dev Compose file, then lint, typecheck and test, on every push and PR

Not yet:

- `pnpm dev` runs the local stack
- `pnpm test:integration`

## Conventions

- TypeScript `strict` mode. No `any` without a comment explaining why.
- ESM modules only.
- Store all times in UTC (`timestamptz`). Convert to the agency's time zone only for display and GTFS service-day math.
- Database migrations must be backward compatible (expand, then contract): blue-green deploys run old and new code at the same time.
- Feed data inserts are idempotent (`ON CONFLICT DO NOTHING`) and batched per snapshot, never row by row.
- Queries on raw positions always filter by time first.
- Never poll a feed faster than it updates. One poller per feed across the system (Redis lock).
- Configuration comes from environment variables, validated at startup. `.env.example` lists every variable; `.env` is never committed.
- `package.json` scripts must work on Windows and macOS/Linux. pnpm runs them through cmd.exe on Windows, so no single-quoted strings, `$VAR` expansion or other sh-only syntax; put shell logic in a Node script instead.
- Conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Every bug fix comes with a test that would have caught it.

## Domain facts to get right

- City 1 is Orange County, California (OCTA). Realtime feeds need no key and work over HTTPS only (plain HTTP is refused): `https://api.octa.net/GTFSRealTime/protoBuf/VehiclePositions.aspx`, `tripupdates.aspx`, `servicealerts.aspx`. Static GTFS: `https://www.octa.net/current/google_transit.zip`. Time zone: `America/Los_Angeles`.
- OCTA's feed header advances about every 5 s, but each bus reports far less often. Skip unchanged vehicles by their own timestamp, not just the header.
- OCTA data is free for non-commercial use only; commercial use needs OCTA's written permission. Credit OCTA in the map footer.
- Other Southern California feeds, tested: `docs/feeds/socal.md`.
- City 2 is Boston (MBTA), added in Phase 4. Realtime feeds need no key: `https://cdn.mbta.com/realtime/VehiclePositions.pb`, `TripUpdates.pb`, `Alerts.pb` (JSON versions: swap `.pb` for `.json`). Docs: https://github.com/mbta/gtfs-documentation
- City 3 is New York (MTA Bus Time, free developer key) for scale, or Foothill Transit (open feed, in `docs/feeds/socal.md`) as the fallback. Request the MTA key early.
- GTFS schedule times can pass 24:00:00. `25:30:00` means 1:30 AM the next calendar day, but it belongs to the previous service day.
- Vehicles can appear with no trip (out of service); keep them on the map but out of the analytics.
- Trip IDs can stop matching after a schedule change. Static GTFS is re-imported daily and versioned.
- Feed outages are recorded as gaps. An outage must never be counted as missing buses.
- Metric definitions (on-time performance, headway regularity, bunching, missing trips, excess wait) live in `docs/spec.md` under "Reliability analytics".
