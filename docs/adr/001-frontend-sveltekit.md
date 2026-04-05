# ADR-001: SvelteKit with adapter-static for Frontend

## Status
Accepted (2026-04-05)

## Context
The Navigator needs a frontend framework that produces static HTML/CSS/JS (no server required for the app itself), supports component-based development, and is straightforward to maintain with AI assistance.

## Decision
Use SvelteKit with `adapter-static`. The entire frontend compiles to a static site that can be served from any web server or CDN.

## Rationale
- **Static output** — No Node.js server needed for the frontend; simplifies deployment
- **Small bundle size** — Svelte compiles to vanilla JS, no runtime library shipped to the client
- **Clean DX** — Single-file components, reactive by default, good i18n ecosystem
- **AI-maintainable** — Svelte files are self-contained and easy to understand in isolation
- **Mature ecosystem** — SvelteKit 2.x is stable, well-documented, widely adopted

## Alternatives considered
- **Next.js** — Heavier, React overhead, SSR features we don't need
- **Astro** — Good for static, but weaker for interactive SPA-like flows (barrier lens)
- **Vanilla JS** — Prototype used this; doesn't scale for complex state management

## Consequences
- All pages must work as client-side rendered (no SSR in production)
- API calls go to a separate Hono proxy server, not SvelteKit endpoints
- `entries()` function needed for prerendering dynamic routes like `/topic/[id]`
