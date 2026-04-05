# ADR-002: OpenAI-compatible API for LLM Backend

## Status
Accepted (2026-04-05)

## Context
The Navigator uses an LLM for barrier analysis, topic suggestion, and reflection deepening. It must work both online (cloud API) and offline (local model via Ollama).

## Decision
Use the OpenAI chat completions API format as the standard interface. All LLM calls go through a Hono API proxy that forwards to the configured endpoint.

## Rationale
- **Single interface** — OpenAI's `/v1/chat/completions` format is the de facto standard
- **Provider flexibility** — Works with OpenAI, Azure OpenAI, Ollama, LM Studio, vLLM, Groq
- **Offline support** — Ollama exposes the same endpoint format locally
- **API keys stay server-side** — The Hono proxy holds credentials; browser never sees them
- **Cost control** — Switch models via environment variable (nano for dev, mini for prod)

## Configuration
```
LLM_BASE_URL=https://api.openai.com/v1   # or http://localhost:11434/v1
LLM_MODEL=gpt-4.1-mini                    # or qwen2.5:14b
LLM_API_KEY=sk-...                         # empty for Ollama
```

## Consequences
- Cannot use provider-specific features (function calling variations, streaming formats differ slightly)
- Must test with multiple providers to ensure compatibility
- Token usage logging depends on providers returning `usage` field in responses
