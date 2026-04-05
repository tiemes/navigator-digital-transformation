# ADR-004: Docker for Deployment

## Status
Accepted (2026-04-05)

## Context
The Navigator needs to be deployable on various servers (PHZH infrastructure, personal servers, cloud VMs) with minimal configuration.

## Decision
Use Docker with a multi-stage build. Single container serves both the static frontend and the Hono API proxy.

## Rationale
- **Portable** — Works on any server with Docker installed
- **Self-contained** — One container, one port, includes everything
- **Reproducible** — Same image runs identically everywhere
- **Simple ops** — `docker run -p 3001:3001 -e LLM_API_KEY=... navigator`

## Build stages
1. **Build** — Node.js Alpine, runs `npm run build` in `app/` to produce static files
2. **Production** — Node.js Alpine, installs API dependencies, copies static files to `./public`, runs Hono server

## Docker Compose (development)
- `app` — SvelteKit dev server with hot reload
- `api` — Hono dev server with `--watch`
- `ollama` — Optional, for offline LLM testing

## Consequences
- Developers without Docker can still run `npm run dev` in `app/` and `api/` separately
- Production image is ~150MB (Node.js Alpine + dependencies)
- For offline mode, Ollama runs as a separate container or native installation
