# 0001: ESLint + Prettier, and packages that export TypeScript source

- **Date:** 2026-09-29
- **Status:** Accepted

## Context

The monorepo needs linting, formatting and a way for packages to import each other. Most of the backend (poller, gateway, jobs) is async code that talks to feeds, Redis and Postgres, where a forgotten `await` silently drops an error. Phase 1 has 12 days, so setup cost matters.

## Options considered

1. **ESLint + typescript-eslint (type-aware) + Prettier:** two tools and more config. Type-aware rules such as `no-floating-promises` and `no-misused-promises` catch async bugs.
2. **Biome:** one fast tool for lint and format, with less config. Its type-aware rules are more limited, so the async-bug rules above are weaker or missing.

For internal packages:

1. **Export `.ts` source directly** (`"exports": "./src/index.ts"`): no build step. Vitest and `tsc` read it, and Node 24 runs it by stripping types.
2. **Compile each package to `dist/`** with TypeScript project references: faster incremental builds in a big repo, but a build step and more config before any app exists.

## Decision

ESLint with `typescript-eslint`'s `recommendedTypeChecked` rules, Prettier for formatting, and internal packages that export TypeScript source. `erasableSyntaxOnly` is on, so code avoids `enum` and namespaces that Node's type stripping can't run.

## Consequences

- Async bugs get caught at lint time, which matters most in the poller and gateway.
- Type-aware linting is slower than Biome. Turborepo's cache hides most of that.
- typescript-eslint supports TypeScript only up to 6.0, so TypeScript is pinned to `~6.0` even though 7.0 (the native Go compiler) is out. Revisit when typescript-eslint supports 7.
- Revisit source exports if typecheck times get slow or a package needs to be published.

## In an interview

"I chose ESLint's type-aware rules over Biome because a backend full of async feed and database calls needs `no-floating-promises`; the tradeoff is slower linting, which the Turborepo cache offsets. Internal packages ship TypeScript source, so there's no build step until an app needs one."
