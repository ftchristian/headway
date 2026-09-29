# 0002: Orange County (OCTA) as city 1, instead of Boston

- **Date:** 2026-09-29
- **Status:** Accepted

## Context

City 1 carries the whole pipeline: the GTFS import, the poller, and raw data recording from Oct 5. It needs a live feed with no signup wait, trip IDs on every vehicle (the reliability metrics depend on them), and a license that allows a public, non-commercial app. The plan had Boston's MBTA, but I live in Southern California and want data I can check from a real bus stop and share with local riders. LA Metro is the obvious local pick, but its live feeds need a Swiftly API key that isn't offered to individuals in any clear way.

## Options considered

1. **Boston (MBTA):** cleanest, best-documented open feed. Not local: I can't verify it in person or reach its riders easily.
2. **LA Metro:** largest fleet in the region, bus and rail. Needs a Swiftly key with no clear path for individuals, so recording could slip past Oct 5.
3. **OCTA (Orange County):** open feed over HTTPS, 322 buses reporting on a weekday afternoon, every bus tagged with a trip, shapes in the static GTFS. Smaller than LA Metro or Boston's bus network. Non-commercial use only.
4. **Foothill Transit or Riverside Transit:** also open and local, but smaller (214 and 160 buses).

## Decision

OCTA is city 1. Boston (MBTA) stays as the backup city and a later addition. Phase 4 still adds New York (the large-scale test) and the Bay Area; LA Metro joins too if Metro grants access. Foothill Transit and Riverside Transit are open local options if a city falls through.

## Consequences

- No signup wait, so recording can start on schedule.
- The data is local, so arrivals can be spot-checked on a real bus.
- About 320 buses is a modest load. The scale test needs a larger city: New York, or LA Metro if access comes through.
- If OCTA's feed fails for a long stretch, Boston's open feed is ready to swap in.
- Non-commercial license: fine for a portfolio project, but any paid version would need OCTA's written permission.
- The feed header changes every ~5 s while buses report less often, so the poller must dedupe on each vehicle's timestamp.
- Revisit if OCTA's feed goes down for long periods or its trip IDs stop matching the schedule badly.

## In an interview

"I picked Orange County's open feed over LA Metro because LA's live data sits behind a vendor key, and I needed to start recording in week 1; the tradeoff is a smaller fleet, so I added New York as the scale test."
