# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive self-reflection tool for teachers, school leaders, and whole schools to foster awareness of where they stand in digital transformation. Based on the **Kompass Digitaler Wandel** framework developed by PHZH (Pädagogische Hochschule Zürich), Zentrum Medienbildung und Informatik.

**Key principle:** This is NOT an assessment tool. It asks questions that make people think — fostering self-awareness, not scoring or judging.

**Creator:** Tobias Schifferle (tobias@schifferle.ch), PHZH, Fachgruppe Didaktiken Mathematik und Informatik

**Original Kompass team:** Andrea Kern, Thomas Staub, Larissa Meyer, Reto Braun — Zentrum Medienbildung und Informatik, PHZH

**Website:** https://kompassdigitalerwandel.ch/
**YouTube intro:** https://www.youtube.com/watch?v=lZ1dQlO22KE
**License:** CC BY-SA

---

## Current Status (April 2026)

- [x] Phase 0: Content extraction, literature review, data structuring
- [x] Master data file: `data/navigator.json` (36 topics, 214 questions, DE+EN, tags, cross-links)
- [x] HTML prototype with compass view, quick pulse, barrier lens, topic detail, language switching
- [x] Technology stack decisions: SvelteKit + Hono + Docker + OpenAI-compatible API
- [x] Phase 1: SvelteKit scaffold, API proxy, Docker, ADRs, per-question versioning
- [ ] Phase 2: Barrier lens MVP (vision → AI barrier analysis → deeper reflection)
- [ ] Phase 3: Voice integration (TTS/STT spike, then integrate)
- [ ] Phase 4: Other modes, English translation, data export, polish

See `TODO.md` for detailed task breakdown per phase.

### Development Commands

```bash
# Frontend (SvelteKit dev server with hot reload)
cd app && npm run dev          # → http://localhost:5173

# API proxy (Hono with auto-restart)
cd api && npm run dev          # → http://localhost:3001

# Build static site
cd app && npm run build        # → app/build/

# Preview production build
cd app && npm run preview      # → http://localhost:4173

# API health check
curl http://localhost:3001/api/health
```

### Key Files

| What | Where |
|------|-------|
| SvelteKit frontend | `app/` — compass overview, topic detail, i18n |
| Hono API proxy | `api/` — LLM proxy, health endpoint |
| Master data | `data/navigator.json` — 36 topics, 214 questions, DE+EN, versioned |
| UI strings | `app/src/lib/i18n/{de,en}.json` |
| i18n module | `app/src/lib/i18n/index.js` — `lang` store + `t` translate function |
| Data helpers | `app/src/lib/data.js` — `getTopic()`, `getDimension()`, etc. |
| Components | `app/src/lib/components/` — Header, Footer, TopicCard |
| ADRs | `docs/adr/` — Architecture Decision Records |
| Research docs | `research/` — question mapping, literature review |
| Design docs | `docs/design/` — design plan, research insights |
| Docker | `Dockerfile` (production), `docker-compose.yml` (development) |
| Prototype | `prototype/index.html` — open directly in browser |
| Illustrations | `Unterlagen/KompassDigitalerWandel/Illustrationen_freigestellt/` (not in git) |

The prototype loads `data/navigator.json` and demonstrates all interaction modes: compass overview, quick pulse, barrier lens, topic detail, and language switching (DE/EN).

---

## The Kompass Framework

### 5 Dimensions (35 Topics)

#### 1. People & Skills (Personen/Kompetenzen) — Color: Pink/Magenta
| # | Topic (DE) | Topic (EN) | Illustration |
|---|-----------|-----------|--------------|
| 1 | Personale/soziale Kompetenzen | Personal/social skills | Personale-soziale-Kompetenzen.png |
| 2 | Fachkompetenz Medien Informatik | Professional skills in media and CS | Fachkompetenz-Medien-Informatik.png |
| 3 | Fachdidaktik Medien Informatik | Specialised didactics in media and CS | Fachdidaktik-Medien-Informatik.png |
| 4 | Mediendidaktik | Media didactics | Mediendidaktik.png |
| 5 | Anwendungskompetenzen LP | Application skills (teachers) | Anwendungskompetenzen.png |
| 6 | Haltungen | Mindsets | Haltungen.png |
| 7 | Zusammenarbeit mit Eltern | Parent participation | Elternzusammenarbeit.png |

#### 2. Teaching & Learning (Unterricht) — Color: Red
| # | Topic (DE) | Topic (EN) | Illustration |
|---|-----------|-----------|--------------|
| 8 | Lernkultur | Learning culture | Lernkultur.png |
| 9 | (über-)fachliche Kompetenzen | (Inter-)disciplinary skills | Ueberfachliche_Kompetenzen.png |
| 10 | Beurteilung | Assessment | Beurteilung.png |
| 11 | Arrangements | Teaching/learning units | Arrangements.jpg.png |
| 12 | Lernplattformen, Lehrmittel, Tools | Learning platforms, teaching resources, tools | Lernplattformen_Lehrmittel-Tools.png |
| 13 | Modullehrplan Medien Informatik | Media and CS curriculum | Modullehrplan_Medien-Informatik.png |
| 14 | Medienerziehung, Regeln | Media education and rules | Medienerziehung.png |
| 15 | Klassenadministration | Class administration | Klassenadministration.png |

#### 3. Organisation & Structures (Organisation/Strukturen) — Color: Green
| # | Topic (DE) | Topic (EN) | Illustration |
|---|-----------|-----------|--------------|
| 16 | Vision | Vision | Vision.png |
| 17 | Strukturen und Prozesse | Structures and processes | Strukturen-Prozesse.png |
| 18 | Konzept | Concept | Konzept.png |
| 19 | Support | Support | Support.png |
| 20 | Führung | Leadership | Fuehrung.png |
| 21 | Lernorte | Learning spaces | Lernorte.png |
| 22 | Innovation | Innovation | Innovation.png |
| 23 | Öffentlichkeitsarbeit | Public relations | Oeffentlichkeitsarbeit.png |

#### 4. Cooperation & Team (Kooperation/Team) — Color: Blue
| # | Topic (DE) | Topic (EN) | Illustration |
|---|-----------|-----------|--------------|
| 24 | Kooperation | Cooperation | Kooperation.png |
| 25 | Wissensmanagement | Knowledge management | Wissensmanagement.png |
| 26 | Kommunikation | Communication | Kommunikation.png |
| 27 | Teamkultur | Team culture | Teamkultur.png |
| 28 | Dynamiken und Emotionen | Dynamics and emotions | Dynamiken_Emotionen.png |

#### 5. Infrastructure (Infrastruktur) — Color: Yellow/Orange
| # | Topic (DE) | Topic (EN) | Illustration |
|---|-----------|-----------|--------------|
| 29 | Arbeitsgeräte | Working devices | Arbeitsgeräte.png |
| 30 | Basisinfrastruktur | Basic infrastructure | Basisinfrastruktur.png |
| 31 | Software/Dienste | Software/services | Software-Dienste.png |
| 32 | Sicherheit | Security | Sicherheit.png |
| 33 | Dienstleister | Services | Dienstleister.png |
| 34 | Rechtliche Aspekte | Legal aspects | Rechtliche_Aspekte.png |
| 35 | Finanzierung | Funding | Finanzierung.png |

### Dimension Overview Illustrations
| Dimension | File |
|-----------|------|
| People & Skills | _Personen-Kompetenzen.png |
| Teaching & Learning | _Unterricht.png |
| Organisation & Structures | _Organisation-Strukturen.png |
| Cooperation & Team | _Kooperation-Team.png |
| Infrastructure | _Infrastruktur.png |

### Cross-Links Between Topics
Each topic has defined connections to related topics in `data/navigator.json`. These connections form a network graph that enables non-linear navigation and shows systemic interdependencies.

---

## Architecture Principles

### Multi-Language First
All content is separated from logic. The architecture follows:
- **Content layer:** `navigator.json` contains all text in all languages inline (i18n per item)
- **Logic layer:** Language-agnostic application code
- **UI layer:** Separate i18n files for UI strings (`app/src/lib/i18n/{lang}.json`)
- Primary language: `de` (German). Secondary: `en` (English)
- Designed for easy addition of `fr`, `it`, etc.

### Technology Stack (decided April 2026)
- **Frontend:** SvelteKit with adapter-static (builds to plain HTML/CSS/JS)
- **API proxy:** Hono (lightweight Node server) — holds API keys, forwards LLM/voice requests
- **LLM:** OpenAI-compatible API (works with OpenAI, Ollama, Azure, LM Studio, vLLM)
- **Voice:** TTS/STT pipeline — Whisper for speech-to-text, OpenAI TTS for text-to-speech; whisper.cpp + Piper for offline
- **Deployment:** Docker (single container: static files + API proxy)
- **Offline mode:** Ollama for LLM, whisper.cpp + Piper for voice — same app, different env vars

### Data Architecture

**`navigator.json` is the single source of truth.** All topics and questions live here with per-item versioning for research traceability.

#### Per-Question Versioning
Every question carries its own version number. When question text changes in any language, the version bumps and the old text is preserved in a `history` array. This ensures research data can always be linked to the exact wording shown to the participant.

Structure per question:
```json
{
  "id": "mindsets-q3",
  "version": 2,
  "lastModified": "2026-05-15",
  "source": "kompass-original",
  "tags": ["growth-mindset", "openness"],
  "roles": ["teacher", "leader", "team"],
  "quickPulse": false,
  "i18n": {
    "de": "Wie offen sind wir für neue Ansätze?",
    "en": "How open are we to new approaches?"
  },
  "history": [
    {
      "version": 1,
      "validFrom": "2026-04-01",
      "validUntil": "2026-05-15",
      "i18n": {
        "de": "Sind wir offen für Neues?",
        "en": "Are we open to new things?"
      },
      "changeNote": "Reworded for specificity based on pilot feedback"
    }
  ]
}
```

Rules for question versioning:
- `version` starts at 1 for every question and increments on ANY text change in ANY language
- `lastModified` is the ISO date of the most recent change
- `history` preserves all prior versions with date ranges and change notes
- When text is unchanged, version stays the same — even across file-level releases
- New questions added later start at version 1 with empty history
- Questions must NEVER be deleted — mark as `"retired": true` with a retirement date

#### Per-Topic Versioning
Topics follow the same pattern — if a topic is renamed, reframed, or its links change:
```json
{
  "id": "mindsets",
  "version": 1,
  "lastModified": "2026-04-01",
  "number": 6,
  "dimension": "people-skills",
  "i18n": {
    "de": { "name": "Haltungen" },
    "en": { "name": "Mindsets" }
  },
  "links": ["personal-social-skills", "learning-culture", ...],
  "history": [],
  "questions": [...]
}
```

#### Research Session Tracking
Every reflection session captures structured data for later analysis:
```json
{
  "sessionId": "uuid-v4",
  "timestamp": "2026-06-10T14:30:00Z",
  "language": "de",
  "mode": "barrier-lens",
  "participant": {
    "role": "teacher|leader|team",
    "schoolType": "primary|secondary|gymnasium",
    "canton": "ZH",
    "anonymousId": "optional-self-assigned"
  },
  "visionStatement": "free text...",
  "barriers": [
    {
      "level": "teacher-level",
      "topicId": "mindsets",
      "topicVersion": 1,
      "selectedByUser": true,
      "suggestedByAI": true,
      "reflections": [
        {
          "questionId": "mindsets-q3",
          "questionVersion": 2,
          "response": "free text or null",
          "skipped": false,
          "timestamp": "2026-06-10T14:32:15Z"
        }
      ]
    }
  ],
  "aiInteractions": [
    {
      "turn": 1,
      "promptTemplate": "barrier-analysis-v1",
      "model": "gpt-4.1-mini",
      "inputTokens": 847,
      "outputTokens": 234,
      "latencyMs": 1200,
      "suggestedTopics": ["mindsets", "vision", "cooperation"]
    }
  ],
  "voiceUsed": false,
  "duration": { "totalSeconds": 480, "activeSeconds": 390 }
}
```

Session data is stored client-side (IndexedDB) and exportable as JSON/CSV. The `questionVersion` and `topicVersion` fields ensure every response can be traced to the exact wording shown, regardless of later edits. No separate mapping file needed — the version travels with the data.

### Modes of Interaction
1. **Free Exploration:** Browse the compass, pick any topic, follow connections — connection-based navigation
2. **Quick Pulse:** 5 questions (one per dimension), 5-10 min, suggests a starting topic
3. **Barrier Lens (primary mode):** Vision prompt → AI-assisted barrier identification → deeper reflection per barrier. Uses Gkrimpizi's three-level framework (teacher / school / system). AI suggests relevant topics from free-text answers.
4. **Guided Reflection:** Curated path through 6-8 connected topics (future)
5. **Team/School Mode:** Collective reflection with perspective comparison (future)

### Technical Considerations
- **LLM-agnostic:** OpenAI-compatible API — same endpoint format for cloud and local (Ollama)
- **Privacy-first:** Swiss data protection compliance. Data stored client-side. Offline mode available.
- **Research-ready:** All interactions tracked with versioned question references for longitudinal analysis
- **Deployable:** Docker container, works on any server. Static frontend can also be hosted separately.

---

## Project Structure

```
├── CLAUDE.md                         # This file
├── TODO.md                           # Detailed task breakdown
├── README.md                         # Public-facing project description
├── LICENSE                           # CC BY-SA 4.0
├── docker-compose.yml                # Dev: app + api + ollama
├── Dockerfile                        # Prod: multi-stage (build static + api image)
│
├── app/                              # SvelteKit frontend (adapter-static)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/           # Header, Footer, TopicCard, ...
│   │   │   ├── stores/               # settings.js (language persistence)
│   │   │   ├── i18n/                 # index.js, de.json, en.json
│   │   │   ├── data.js               # Data access helpers (getTopic, getDimension, ...)
│   │   │   └── api.js                # Client-side API calls to proxy
│   │   ├── routes/
│   │   │   ├── +page.svelte          # Compass overview (home)
│   │   │   └── topic/[id]/           # Topic detail page
│   │   └── data/
│   │       └── navigator.json        # Copy of master data (for build)
│   └── build/                        # Static output (after npm run build)
│
├── api/                              # Hono proxy server
│   ├── server.js                     # Entry point + static file serving
│   ├── routes/chat.js                # POST /api/chat → LLM
│   └── .env.example                  # Template for API keys + endpoints
│
├── data/                             # Master data
│   ├── navigator.json                # MASTER: versioned topics + questions (DE+EN)
│   ├── navigator.js                  # JS wrapper for browser (prototype)
│   ├── CHANGELOG.md                  # Log of question/topic changes
│   └── prompts/                      # LLM system prompts (future)
│
├── docs/
│   ├── adr/                          # Architecture Decision Records (001-005)
│   └── design/                       # Design plan, research insights
│
├── research/                         # Question-research mapping, literature review
├── Unterlagen/                       # Source materials (not in git)
└── prototype/                        # Original HTML prototype (archived)
    └── index.html
```

---

## Literature Base (COMPLETED)
Comprehensive literature review completed April 2026 via 21 Consensus searches (45+ papers). See `literature-review-digital-transformation-schools.docx` for full document.

Key frameworks/papers informing the Navigator design:
- **TPACK** (Mishra & Koehler, 2006, 7582 cit.) — teacher knowledge framework
- **DigCompEdu / DigCompOrg** — EU competence frameworks
- **SELFIE** (Costa et al., 2021) — closest existing tool; collective self-reflection for schools' digital capacity
- **Timotheou et al. (2022, 544 cit.)** — comprehensive factor model for digital capacity
- **Gkrimpizi et al. (2023, 149 cit.)** — three-level barrier taxonomy → barrier lens mode
- **Schmitz et al. (2023, 82 cit.)** — Swiss: transformational leadership → technology integration
- **Cachia et al. (2023)** — mini-SELFIE: 8 items capture full signal → quick pulse mode
- **Ng et al. (2023, 345 cit.)** — AI competencies extending DigCompEdu → AI topic (36)
- **Chiu et al. (2024)** — self-determination theory for tool design (autonomy, competence, relatedness)

See `question-research-mapping.md` for per-topic analysis of how each of the 214 questions maps to research.

---

## Development Notes
- The original Antrag describes a WFZ (Weiterbildungs-/Forschungszeit) project at PHZH, Feb-Apr 2026
- The Antrag mentions three strands; this project is Strand 1 (Navigator Digitaler Wandel)
- Strand 2 (dissertation on digital educational equity / DEEM framework) is separate but related
- The technical documentation (Dokumentation Navigator.docx) describes the original chatbot vision
- We are NOT bound to the Antrag's exact plan — the goal is to create the best possible tool for teachers in digital transformation
- Decision: **connection-based navigation** (not linear walkthrough, not chatbot-first)
- Design plan in `docs/design/navigator-design-plan.md`

---

## LLM Configuration

### Models (OpenAI)
| Purpose | Model | Input/1M tokens | Output/1M tokens | Notes |
|---------|-------|-----------------|-------------------|-------|
| Development | gpt-4.1-nano | $0.05 | $0.20 | Fast, cheap, good for testing prompts |
| Production | gpt-4.1-mini | $0.40 | $1.60 | Good quality for German, barrier analysis |
| Premium | gpt-4.1 | $2.00 | $8.00 | Only if mini quality insufficient |
| STT | whisper-1 / gpt-4o-mini-transcribe | $0.006/min | — | Mini-transcribe at $0.003/min |
| TTS | gpt-4o-mini-tts | $0.60 input | $12/M audio tokens | ~$0.015/min of speech |

### Models (Offline via Ollama)
| Purpose | Model | Min RAM | Notes |
|---------|-------|---------|-------|
| LLM | Qwen 2.5 7B/14B | 4-8 GB | Best multilingual including German |
| LLM (German-optimized) | OpenEuroLLM-German | 4 GB | Fine-tuned Gemma3 for German |
| STT | whisper.cpp (large-v3) | 2 GB | Same model as OpenAI API, runs locally |
| TTS | Piper | <1 GB | Lightweight, good German voices |

### API Compatibility
All LLM calls use the OpenAI chat completions format. Switching between providers is done via environment variables:
```
LLM_BASE_URL=https://api.openai.com/v1      # Cloud
LLM_BASE_URL=http://localhost:11434/v1       # Ollama
LLM_MODEL=gpt-4.1-mini                      # or qwen2.5:14b
LLM_API_KEY=sk-...                           # empty for Ollama
```

---

## Code Standards & AI Maintainability

This project is developed with Claude AI assistance. Code must be written so that Claude (or any LLM) can understand, modify, and extend it reliably. These standards are non-negotiable.

### File Size & Structure
- **Max 150 lines per file.** If a file exceeds this, split it. No exceptions.
- **One component per file** (Svelte), **one route handler per file** (API), **one store per file**.
- **Flat imports preferred.** Avoid deep nesting (`../../../lib/utils/helpers/format.js`). Use `$lib/` alias in SvelteKit.

### Naming & Organization
- File names: `kebab-case.js`, `PascalCase.svelte`
- Functions: `camelCase`, descriptive verbs (`analyzeBarriers`, `formatSessionExport`)
- Constants: `UPPER_SNAKE_CASE`
- No abbreviations in names except universally known ones (`i18n`, `id`, `url`)

### Documentation
- **Every file starts with a comment block** explaining what it does, its inputs/outputs, and how it fits into the system. Example:
  ```js
  /**
   * chat.js — LLM proxy route
   * Receives chat messages from the frontend, forwards them to the
   * configured LLM endpoint (OpenAI or Ollama), and returns the response.
   * Logs token usage to usage-logger for research cost tracking.
   *
   * Environment: LLM_BASE_URL, LLM_MODEL, LLM_API_KEY
   * Called by: app/src/lib/api.js → POST /api/chat
   */
  ```
- **Functions get JSDoc comments** with `@param` and `@returns`
- **No "clever" code.** Prefer readable over concise. If a ternary is hard to read, use if/else.
- **Comments explain WHY, not WHAT.** The code shows what; comments explain intent and context.

### Data Handling
- **Never hardcode text strings** — all user-facing text in i18n files or navigator.json
- **Never hardcode topic/question IDs** in application logic — always look up from data
- **Always include version fields** when recording session data (questionVersion, topicVersion)
- **Validate data on load** — check navigator.json has expected structure before rendering

### Testing & Reliability
- Prefer explicit error handling over silent failures
- Every API route returns structured errors: `{ error: "message", code: "ERROR_CODE" }`
- Frontend shows user-friendly error states, never blank screens
- Log errors visibly during development (console + on-screen in dev mode)

### Git & Versioning
- Commit messages: imperative mood, explain why (`"Add per-question versioning to support longitudinal research"` not `"updated json"`)
- Feature branches, PRs for anything non-trivial
- ADRs for architectural decisions in `docs/adr/`
- navigator.json changes get a CHANGELOG.md entry explaining what changed and why
