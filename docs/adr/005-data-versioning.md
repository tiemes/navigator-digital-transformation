# ADR-005: Per-Question and Per-Topic Versioning

## Status
Accepted (2026-04-05)

## Context
The Navigator is a research tool. Participants' responses must be traceable to the exact question wording they saw, even if questions are later reworded. This is essential for longitudinal research validity.

## Decision
Every question and every topic in `navigator.json` carries its own `version`, `lastModified`, and `history` fields. When text changes in any language, the version increments and the old text is preserved in the history array.

## Rationale
- **Research traceability** — Session data records `questionVersion` and `topicVersion` alongside each response
- **No separate mapping needed** — The version travels with the data, not in a separate lookup table
- **Safe refactoring** — Questions can be reworded to improve clarity without breaking historical data
- **Never delete** — Retired questions are marked `"retired": true`, never removed

## Rules
1. `version` starts at 1, increments on ANY text change in ANY language
2. `lastModified` is the ISO date of the most recent change
3. `history` preserves all prior versions with date ranges and change notes
4. Unchanged text keeps the same version across file-level releases
5. New questions start at version 1 with empty history

## Consequences
- `navigator.json` grows slightly larger over time (history accumulates)
- Every edit to question text requires a version bump and CHANGELOG entry
- Data analysis scripts must join on `(questionId, questionVersion)` pairs
