# Headway

**See every bus in the city right now, and which routes you can actually trust.**

Headway is a live transit map plus a reliability scorecard. It streams every bus and train from public GTFS-Realtime feeds onto a WebGL map, detects when each vehicle reaches each stop, and turns that history into route scorecards: on-time performance, bunching, missing trips, and the extra wait riders actually face.

> Status: in development. Phase 1 (Foundation) of 5. Live demo coming November 2026.

<!-- Replace with a 20-second demo GIF: vehicles moving, click a route, scorecard opens -->

## Numbers

<!-- Fill with measured values: cities, vehicles tracked, GPS updates ingested per day, concurrent clients load-tested, p95 latencies -->

## Architecture

<!-- Architecture diagram: see docs/spec.md, "System architecture" -->

Live positions flow from a feed poller through Redis to a WebSocket gateway within seconds. History flows into PostgreSQL (TimescaleDB + PostGIS), where background jobs turn raw GPS pings into stop arrivals and reliability metrics. Everything runs on AWS, defined in Terraform and deployed with zero-downtime blue-green releases from GitHub Actions.

**Stack:** TypeScript, Node.js, Fastify, WebSockets, Redis, PostgreSQL + TimescaleDB + PostGIS, BullMQ, React, deck.gl, MapLibre, Docker, Terraform, AWS (EC2, S3, CloudFront), GitHub Actions.

## Key decisions

See [docs/decisions](docs/decisions/) for the full log.

## Run it locally

<!-- One command, using a recorded day of feed data. Fill in once it exists. -->

See [docs/setup.md](docs/setup.md) for the tools you need.

## Docs

- [Spec](docs/spec.md)
- [Roadmap](docs/roadmap.md)
- [Decision log](docs/decisions/)

## Data

Transit data is provided by the agencies listed on the in-app attribution page, under their respective licenses. Headway is not affiliated with or endorsed by any transit agency.
