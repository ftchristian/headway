# 0003: One pinned TimescaleDB-HA image for Postgres, dev and production

- **Date:** 2026-09-29
- **Status:** Accepted

## Context

Postgres needs two extensions: TimescaleDB (hypertables, compression, continuous aggregates) and PostGIS (route shapes, distance along a route). It runs in Docker on an Apple-silicon Mac for development and on an ARM EC2 t4g.large in production, and both should run the same database so a query that works locally works in production.

## Options considered

1. **`timescale/timescaledb-ha`:** TimescaleDB and PostGIS prebuilt, ARM and Intel. Large download (about 640 MB for ARM), and data lives under `/home/postgres/pgdata` instead of the usual path.
2. **`timescale/timescaledb`:** small Alpine image, but no PostGIS; we would build PostGIS into our own image and maintain it.
3. **`postgis/postgis`:** PostGIS only; we would build TimescaleDB ourselves.
4. **A managed database (RDS):** less to run, but TimescaleDB isn't available on RDS, and it adds cost the plan avoids.

## Decision

`timescale/timescaledb-ha:pg18.6-ts2.30.1`: Postgres 18.6, TimescaleDB 2.30.1 and PostGIS 3.6.4, pinned to that exact tag in both environments. The standard (Timescale License) edition, not "OSS", because compression and continuous aggregates are only in the standard edition. Its license allows self-hosting; it only forbids offering TimescaleDB as a hosted database service.

Redis is `redis:8.10.2` with `maxmemory-policy noeviction`, which BullMQ requires so queued jobs are never evicted.

## Consequences

- No custom image to build or patch; both extensions come from one maintained image.
- Upgrades are deliberate: change the tag, test locally, deploy.
- The first pull is slow and the image uses more disk than an Alpine build.
- Revisit if the image stops publishing ARM builds, or if disk on the server gets tight.

## In an interview

"I used Timescale's HA image because it ships TimescaleDB and PostGIS prebuilt for ARM, pinned to one exact tag so my laptop and the ARM server run the same database; the tradeoff is a bigger image instead of maintaining my own build."
