# Navigator Digitaler Wandel

Interactive self-reflection tool for teachers, school leaders, and whole schools to foster awareness of where they stand in digital transformation.

Based on the **Kompass Digitaler Wandel** framework developed by [PHZH](https://phzh.ch/) — Zentrum Medienbildung und Informatik.

> **Key principle:** This is NOT an assessment tool. It asks questions that make people think — fostering self-awareness, not scoring or judging.

## What It Does

The Navigator provides five modes of interaction:

1. **Free Exploration** — Browse the compass, pick any topic, follow connections
2. **Quick Pulse** — 5 questions (one per dimension), 5–10 min, suggests a starting topic
3. **Barrier Lens** — Vision prompt → AI-assisted barrier identification → deeper reflection
4. **Guided Reflection** — Curated path through connected topics *(future)*
5. **Team/School Mode** — Collective reflection with perspective comparison *(future)*

The framework covers **5 dimensions** and **35 topics** spanning people, teaching, organisation, cooperation, and infrastructure — with 214 reflection questions in German and English.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- [Docker](https://www.docker.com/) (optional, for containerised deployment)

### Development

```bash
# Frontend (SvelteKit)
cd app && npm install && npm run dev

# API proxy (Hono) — in a separate terminal
cd api && npm install && npm run dev

# Or use Docker
docker compose up
```

The app runs at `http://localhost:5173`, the API at `http://localhost:3001`.

### Prototype

The original HTML prototype can be viewed without any build step:

```bash
open prototype/index.html
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit with adapter-static |
| API proxy | Hono (holds API keys, forwards LLM/voice requests) |
| LLM | OpenAI-compatible API (works with OpenAI, Ollama, Azure, LM Studio) |
| Voice | Whisper (STT) + OpenAI TTS; whisper.cpp + Piper for offline |
| Deployment | Docker (single container) |

## Project Structure

```
├── app/          # SvelteKit frontend
├── api/          # Hono API proxy
├── data/         # Master data: navigator.json, i18n, prompts
├── docs/         # ADRs and design documents
├── research/     # Literature review and question-research mapping
├── prototype/    # Original HTML prototype (archived reference)
└── CLAUDE.md     # Full project context for AI assistants
```

## The Kompass Framework

5 dimensions, 35 topics, 214 questions — see [kompassdigitalerwandel.ch](https://kompassdigitalerwandel.ch/) and the [introductory video](https://www.youtube.com/watch?v=lZ1dQlO22KE).

## Credits

**Navigator:** Tobias Schifferle — PHZH, Fachgruppe Didaktiken Mathematik und Informatik

**Original Kompass team:** Andrea Kern, Thomas Staub, Larissa Meyer, Reto Braun — Zentrum Medienbildung und Informatik, PHZH

## License

[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
