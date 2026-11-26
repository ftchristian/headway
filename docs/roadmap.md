# Headway: Roadmap

Five phases, each ending at a gate you can show someone: the live map goes public November 1 and the finished platform launches December 31, 2026. The plan assumes about 30 hours a week. Raw data recording starts in week 2 so the analytics have history by November.

| Phase | Dates (2026) | Gate |
| --- | --- | --- |
| 1. Foundation | Sep 30 to Oct 11 | `GET /vehicles` live in production, deployed from CI |
| 2. Live map | Oct 12 to Nov 1 | Public v1 launch |
| 3. Reliability analytics | Nov 2 to Nov 22 | Route scorecards live |
| 4. Scale and predictions | Nov 23 to Dec 13 | 3 cities live, load-test report published |
| 5. Polish and launch | Dec 14 to Dec 31 | Portfolio launch |
| Raw data recording | From Oct 5, nonstop | Never stops |

**If a gate slips more than 3 days,** apply the cut list instead of pushing every later date. Cut in this order:

1. Day-replay timelapse
2. The third city
3. The Headway prediction model (keep the agency benchmark and the baselines)

Tick items as they're done. Claude Code: update the "Current phase" section in `CLAUDE.md` when a phase gate is reached.

## Phase 1: Foundation

- [x] Monorepo with lint, type checks and Vitest, running in GitHub Actions on every push
- [x] Docker Compose with Postgres (TimescaleDB, PostGIS) and Redis for local development
- [ ] Terraform for the VPC, EC2, S3, IAM role and Budgets alert
- [ ] Import OCTA's static GTFS into versioned tables
- [ ] Poller for OCTA VehiclePositions and TripUpdates, writing latest state to Redis and raw snapshots to S3
- [ ] Start recording raw data by the end of week 1
- [ ] `GET /vehicles` live in production, deployed from CI with the blue-green switch
- [ ] Request the 511 rate increase, email LA Metro's developer contact about individual access to its live feeds, register for an MTA Bus Time key

## Phase 2: Live map

- [ ] WebSocket gateway with the snapshot-plus-delta protocol, heartbeats and resync
- [ ] React app with the MapLibre base map, deck.gl vehicle layer and smooth motion
- [ ] Route filter, vehicle panel, freshness badge and feed-down banner
- [ ] Stop page with the agency's predictions
- [ ] CloudFront in front, with cache headers from the caching table in the spec
- [ ] Prometheus and Grafana dashboards, Sentry, alerts
- [ ] Record a full day of snapshots for replay tests
- [ ] Public launch; collect feedback from the first 20 users

## Phase 3: Reliability analytics

- [ ] Compression after 1 day, 14-day raw retention, nightly Parquet export
- [ ] Arrival detection job, with replay tests against expected outputs
- [ ] Validate arrivals against the agency's past times and publish the error rate
- [ ] Metrics: on-time performance, headway regularity, bunching, missing trips, excess wait
- [ ] Continuous aggregates; route scorecard, stop reliability and rankings pages
- [ ] Redis and CDN caching for stats, stampede lock, rate limits
- [ ] Methodology page

## Phase 4: Scale and predictions

- [ ] Per-agency adapters and feed registry; add New York and the Bay Area, plus LA Metro if access is granted
- [ ] City switcher and public status page
- [ ] Several gateway containers; k6 load test to 1,000+ clients; fix bottlenecks and publish results
- [ ] Prediction logging for the agency and baselines; the segment-time model; evaluation report
- [ ] Full restore drill from backups

## Phase 5: Polish and launch

- [ ] Day-replay timelapse (first on the cut list)
- [ ] Performance pass: 60 fps target, bundle size, mobile load time
- [ ] Accessible list views
- [ ] README, architecture diagram, decision log, 90-second video
- [ ] Publish the analysis write-up; Show HN and LinkedIn posts
- [ ] Fill in the resume bullets with real numbers

## After December (stretch)

- [ ] Accounts, saved stops, and delay alerts by web push
- [ ] Data export (CSV, Parquet) and a public API
- [ ] Detection of detours and service changes
