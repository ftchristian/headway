# Southern California feed survey

Tested on 2026-09-29 around 3:40 PM Pacific (a weekday afternoon). Feed list from the [Mobility Database](https://mobilitydatabase.org/about) catalog, then each VehiclePositions feed fetched live. "Buses reporting" is one snapshot, not a peak. Re-test before relying on any row: URLs move.

## Open feeds (no key)

| Agency | Area | Buses reporting | VehiclePositions URL |
| --- | --- | --- | --- |
| OCTA | Orange County | 322 | `https://api.octa.net/GTFSRealTime/protoBuf/VehiclePositions.aspx` (HTTPS only) |
| Foothill Transit | San Gabriel Valley | 214 | `https://foothill_3rdparty.rideralerts.com/myStop/GTFS-Realtime.ashx?&Type=VehiclePosition&` (returned an empty feed once, data on retry) |
| Riverside Transit Agency | Riverside County | 160 | `https://rtabus.com/gtfsrt/vehicles` |
| Torrance Transit | South Bay | 58 | `http://www.mybusinfo.com/gtfsrt/vehicles` |
| Santa Barbara MTD | Santa Barbara | 58 | `https://bustracker.sbmtd.gov/gtfsrt/vehicles` |
| Culver CityBus | Culver City | 48 | `https://nextccbus.org/gtfsrt/vehicles` |
| Antelope Valley Transit | Lancaster, Palmdale | 43 | `https://track-it.avta.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition` |
| Santa Clarita Transit | Santa Clarita | 40 | `http://apps.santaclaritatransit.com/rtt/public/utility/gtfsrealtime.aspx/vehicleposition` |
| Montebello Bus Lines | Montebello | 39 | `https://mbl.rideralerts.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition` |
| Pasadena Transit | Pasadena | 28 | `http://rt.pasadenatransit.net/rtt/public/utility/gtfsrealtime.aspx/vehicleposition` |
| Norwalk Transit | Norwalk | 24 | `https://nts.rideralerts.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition` |
| SLO Regional Transit | San Luis Obispo | 20 | `http://slo.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/vehicleposition` |
| Commerce Municipal Bus Lines | Commerce | 11 | `https://citycommbus.com/gtfs-rt/vehiclepositions` |
| City of Irvine | Irvine | 6 | `https://passio3.com/irvine/passioTransit/gtfs/realtime/vehiclePositions` |
| Spirit Bus | Monterey Park | 2 | `https://passio3.com/montereyp/passioTransit/gtfs/realtime/vehiclePositions` |

## Key required

| Agency | Provider | Result without a key |
| --- | --- | --- |
| LA Metro (bus and rail) | Swiftly (`api.goswift.ly`) | 401 |
| North County Transit District | Swiftly | 401 |
| Kern Transit | Swiftly | 401 |
| Banning Pass Transit | Swiftly | 401 |
| Metrolink | `metrolink-gtfsrt.gbsdigital.us` | 403 |

LA Metro's own API (`api.metro.net`) returned empty results for live vehicles when tested.

## Broken or unconfirmed

| Agency | Problem |
| --- | --- |
| Big Blue Bus | Feed responds but is empty; header timestamp over a year old |
| Long Beach Transit | Feed hostname no longer resolves |
| SunLine Transit | Connection times out |
| San Diego MTS | No public GTFS-Realtime feed found; ask MTS directly |

## OCTA details (city 1)

- All 322 buses carried `trip_id`, `route_id`, `start_date` and `current_stop_sequence`, across 51 routes.
- 304 of 322 live trip IDs matched the static GTFS `trips.txt`. The rest are the schedule-mismatch case the spec plans for.
- The feed header timestamp advanced about every 5 s. Individual bus timestamps were a median of 39 s old, so buses report much less often than the header changes.
- TripUpdates: 349 entities. Alerts: 4 entities.
- Static GTFS includes `shapes.txt`; `agency_timezone` is `America/Los_Angeles`; the latest stop time is `26:19:00` (past midnight).
- License: OCTA's [open data page](https://www.octa.net/about/about-octa/open-data/) offers the feeds free to developers, with no warranty; OCTA keeps ownership. Its [terms of use](https://www.octa.net/about/about-octa/terms-of-use) allow non-commercial, non-profit use and prohibit commercial use without written permission.
