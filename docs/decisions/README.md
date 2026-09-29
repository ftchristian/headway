# Decision log

One short file per real design choice: what was decided, what else was considered, and why. These become interview answers, so write them in plain words while the reasoning is fresh.

- Name files `NNNN-short-title.md`, numbered in order: `0001-snapshot-plus-delta-protocol.md`.
- Copy `0000-template.md` to start.
- Never edit an old decision to change it. Write a new one that supersedes it and link back.

## Decisions to expect

- Snapshot plus deltas instead of full state every update
- Latest-wins (drop deltas) for slow WebSocket clients
- TimescaleDB with short raw retention and an S3 archive
- Live positions kept out of React state
- Expand-then-contract migrations for blue-green deploys
- Prediction evaluation split by time to avoid leakage
