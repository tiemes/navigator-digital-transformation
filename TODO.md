# Navigator Digitaler Wandel — Project Plan

## Decisions Made (April 2026)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-04 | Content extraction + literature review completed | 36 topics, 214 questions, 45+ papers |
| 2026-04-04 | Connection-based navigation, not chatbot-first | Research supports non-linear exploration |
| 2026-04-05 | SvelteKit + adapter-static for frontend | Simplest deployment (static files), clean DX, good i18n |
| 2026-04-05 | Hono API proxy for LLM/voice | Lightweight, holds API keys, ~50-100 lines per route |
| 2026-04-05 | OpenAI-compatible API (works with Ollama) | Single endpoint format for cloud + local, no vendor lock-in |
| 2026-04-05 | TTS/STT for voice (not Realtime API) | LLM-agnostic, works offline, full control over flow |
| 2026-04-05 | Docker for deployment | Single container, portable, works on any server |
| 2026-04-05 | Per-question/topic versioning in navigator.json | Research traceability — every response links to exact wording |
| 2026-04-05 | ADR-driven development + spikes where needed | Structured decisions, documented reasoning, test unknowns |
| 2026-04-05 | Barrier lens as primary mode | Most engaging interaction pattern, leverages LLM best |
| 2026-04-05 | GPT-4.1-nano (dev), GPT-4.1-mini (prod) | Best price/quality for German text analysis |
| 2026-04-05 | Qwen 2.5 / OpenEuroLLM-German for offline | Best open models for German via Ollama |

---

## Phase 0: Foundation & Content (COMPLETED)
- [x] Explore all source materials (Antrag, card sets DE/EN, illustrations, literature)
- [x] Create CLAUDE.md with full project context
- [x] Extract all content into structured data (`data/navigator.json` — 36 topics, 214 questions, DE+EN, tags, cross-links)
- [x] Literature review via Consensus (21 searches, 45+ papers, output: `literature-review-*.docx`)
- [x] Map research findings to questions (`question-research-mapping.md`)
- [x] HTML prototype with compass view, quick pulse, barrier lens, topic detail, language switching
- [x] Technology stack decisions documented in CLAUDE.md

---

## Phase 1: Project Setup & Scaffold

### 1.1 GitHub Repo & Structure
- [ ] Create GitHub repo `navigator-digital-transformation`
- [ ] Set up folder structure per CLAUDE.md spec
- [ ] Add .gitignore (node_modules, .env, dist, .DS_Store)
- [ ] Add LICENSE (CC BY-SA 4.0)
- [ ] Add README.md (project overview, setup instructions)
- [ ] Move research docs to `research/` folder
- [ ] Move design docs to `docs/design/`
- [ ] Keep `Unterlagen/` out of git (.gitignore) — too large, not open-licensable

### 1.2 Data: Per-Question Versioning
- [ ] Add `version`, `lastModified`, `history` fields to every question in navigator.json
- [ ] Add `version`, `lastModified`, `history` fields to every topic in navigator.json
- [ ] All questions start at version 1, empty history, lastModified = 2026-04-01
- [ ] Create `data/CHANGELOG.md` with initial entry
- [ ] Validate updated navigator.json (schema check script)

### 1.3 SvelteKit Frontend Scaffold
- [ ] Initialize SvelteKit project in `app/` with adapter-static
- [ ] Set up svelte-i18n or paraglide-js for multi-language
- [ ] Create `app/src/lib/i18n/de.json` and `en.json` for UI strings
- [ ] Copy navigator.json into app at build time (script or vite plugin)
- [ ] Create basic layout: header, nav, language switcher, back button
- [ ] Port compass overview from prototype to SvelteKit component
- [ ] Verify: `npm run build` produces static HTML/CSS/JS folder

### 1.4 API Proxy
- [ ] Initialize Hono project in `api/`
- [ ] Create `api/routes/chat.js` — POST /api/chat → forwards to LLM endpoint
- [ ] Create `api/.env.example` with all config vars
- [ ] Add CORS middleware for local dev
- [ ] Verify: can send a test message and get LLM response back

### 1.5 Docker
- [ ] Create `Dockerfile` (multi-stage: build SvelteKit, serve static + API in one image)
- [ ] Create `docker-compose.yml` for dev (app + api + ollama)
- [ ] Verify: `docker compose up` → compass overview at localhost:3000, API at localhost:3001

### 1.6 ADRs
- [ ] Write ADR-001: Frontend → SvelteKit with adapter-static
- [ ] Write ADR-002: LLM backend → OpenAI-compatible API
- [ ] Write ADR-004: Deployment → Docker
- [ ] Write ADR-005: Data versioning → per-question/topic versioning in navigator.json

### 1.7 Phase 1 Verification
- [ ] Compass overview renders all 36 topics from navigator.json
- [ ] Language switching (DE/EN) works
- [ ] API proxy successfully calls GPT-4.1-nano and returns response
- [ ] Docker build and run works end-to-end

---

## Spike 1: LLM Barrier Analysis Quality (before/during Phase 2)
- [ ] Write 5-10 sample vision statements in German (varied school types)
- [ ] Draft `data/prompts/barrier-analysis.md` system prompt
- [ ] Test with GPT-4.1-nano — does it identify relevant Kompass topics?
- [ ] Test with GPT-4.1-mini — quality comparison
- [ ] Test with Qwen 2.5 7B via Ollama — offline quality comparison
- [ ] Evaluate: do suggested barriers make sense against the 36 topics?
- [ ] Refine prompt based on results
- [ ] Document findings (what works, what doesn't, which model is minimum viable)

---

## Phase 2: Barrier Lens MVP

### 2.1 Session Management
- [ ] Create `app/src/lib/stores/session.js` — session state (id, timestamp, mode, participant info)
- [ ] Generate UUID v4 for each session
- [ ] Create `app/src/lib/stores/tracking.js` — research data collection per session schema
- [ ] IndexedDB integration for local session storage
- [ ] Session data includes all version references (questionVersion, topicVersion)

### 2.2 Barrier Flow: Vision Step
- [ ] Create `app/src/routes/barriers/+page.svelte` — entry point
- [ ] Vision prompt screen: one open-ended question ("Stell dir deine Schule in 3 Jahren vor...")
- [ ] Free text input (textarea, no character limit)
- [ ] Optional: voice input button (connects to STT later)
- [ ] Store vision statement in session data

### 2.3 Barrier Flow: AI Analysis
- [ ] Send vision text to API proxy → LLM with barrier-analysis prompt
- [ ] LLM returns structured JSON: suggested barriers per level (teacher/school/system) mapped to topic IDs
- [ ] Display suggested barriers grouped by three levels (Gkrimpizi framework)
- [ ] User can select/deselect barriers, add their own
- [ ] Track: which barriers AI suggested vs. user selected (for research)

### 2.4 Barrier Flow: Deeper Reflection
- [ ] For each selected barrier, show 2-3 curated questions from that topic
- [ ] Questions served one at a time, conversational feel
- [ ] Free text response per question
- [ ] After each barrier: option to "go deeper" (more questions / AI follow-up) or "next barrier"
- [ ] AI can suggest follow-up questions based on response (draft `reflection-deepening.md` prompt)
- [ ] AI can suggest connected topics ("You mentioned X — have you thought about Y?")

### 2.5 Barrier Flow: Summary
- [ ] End-of-session summary: vision, barriers identified, key reflections
- [ ] Suggested next steps or topics to explore further
- [ ] Option to export session as JSON (research) or PDF (personal)
- [ ] Save session to IndexedDB

### 2.6 Research Data Integration
- [ ] Every interaction logged per session schema (see CLAUDE.md)
- [ ] AI interactions tracked: prompt template, model, tokens, latency, suggestions
- [ ] Export function: JSON export of full session data
- [ ] Export function: CSV export (flattened, one row per question response)
- [ ] Write ADR-006: Research data tracking

### 2.7 Phase 2 Verification
- [ ] Complete barrier flow works end-to-end in German
- [ ] Session data captures all required fields including versions
- [ ] Export produces valid, complete research data
- [ ] Works with GPT-4.1-mini (cloud) and Qwen 2.5 (Ollama)
- [ ] Tested with 3+ realistic scenarios

---

## Spike 2: Voice Latency (before/during Phase 3)
- [ ] Browser audio capture via MediaRecorder API → send to Whisper API
- [ ] Measure STT latency (audio → text)
- [ ] Feed STT result to LLM, measure response latency
- [ ] Send LLM response to TTS API, measure TTS latency
- [ ] Measure total round-trip (user stops speaking → first audio plays)
- [ ] Target: <3 seconds for response to start
- [ ] Test same chain with whisper.cpp + Piper locally
- [ ] Document findings, write ADR-003

---

## Phase 3: Voice Integration
- [ ] Create `app/src/lib/components/VoiceInput.svelte` — microphone button, recording indicator
- [ ] Create `api/routes/transcribe.js` — POST /api/transcribe → Whisper
- [ ] Create `api/routes/tts.js` — POST /api/speak → TTS
- [ ] Integrate voice as alternative input in barrier flow (vision step + reflections)
- [ ] Audio playback for AI responses (optional, user can toggle)
- [ ] Track voiceUsed in session data
- [ ] Offline voice: whisper.cpp + Piper via Ollama or local binaries

---

## Phase 4: Other Modes & Polish
- [ ] Port topic detail view to SvelteKit (questions, connected topics, notes)
- [ ] Port quick pulse to SvelteKit (5 questions, one per dimension)
- [ ] Connection-based navigation from topic to topic (follow the links)
- [ ] Compass overview: visual indicator of explored topics
- [ ] Mobile responsive design
- [ ] English translation: verify all UI strings, test barrier flow in English
- [ ] Error states: friendly messages, never blank screens
- [ ] Loading states: skeleton UI during LLM calls
- [ ] Settings page: language, LLM endpoint (for advanced users / offline mode)
- [ ] Data export page: list past sessions, export individually or batch

---

## Future (not scoped yet)
- [ ] Guided Reflection mode: curated path through 6-8 connected topics
- [ ] Team/School mode: multiple participants, collective reflection, perspective comparison
- [ ] Analytics dashboard: aggregated research data across sessions (anonymized)
- [ ] Additional languages: `fr`, `it`
- [ ] LMS embedding (Moodle, ILIAS)
- [ ] Scenario/game mode: "Your school just received funding for 1:1 devices — what topics matter?"
- [ ] AI topic 36: AI competencies for teachers (from Ng et al., 2023)

---

## Open Questions
- [ ] Exactly which i18n library for SvelteKit? (svelte-i18n vs. paraglide-js vs. custom)
- [ ] How to handle offline detection? (auto-switch to Ollama if cloud unavailable)
- [ ] Ethics review needed for research data collection? (PHZH ethics board)
- [ ] Participant consent flow for research data? (opt-in, anonymization level)
- [ ] Extract additional content from Kompass-Handout.pdf?
- [ ] Scrape web resources from kompassdigitalerwandel.ch (QR code links)?
