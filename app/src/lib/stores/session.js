/**
 * stores/session.js — Session state management
 * Tracks the current reflection session: ID, mode, participant info,
 * timestamps, and all interactions for research data collection.
 *
 * Each session gets a UUID v4. Session data follows the schema
 * defined in CLAUDE.md for research traceability.
 *
 * Used by: barrier flow, conversation page, export
 */
import { writable, get } from 'svelte/store';
import { lang } from '$lib/i18n';

/** Generate a UUID v4 */
function uuid() {
  return crypto.randomUUID();
}

/** Create a fresh session object */
function createSession(mode = 'conversation') {
  return {
    sessionId: uuid(),
    timestamp: new Date().toISOString(),
    language: get(lang),
    mode,
    participant: {
      role: null,
      schoolType: null,
      canton: null,
      anonymousId: null,
    },
    visionStatement: null,
    barriers: [],
    messages: [],
    aiInteractions: [],
    voiceUsed: false,
    duration: { startTime: Date.now(), activeSeconds: 0 },
  };
}

/** The current session store */
export const session = writable(createSession());

/** Start a new session with the given mode */
export function startSession(mode = 'conversation') {
  session.set(createSession(mode));
}

/** Record a user/assistant message in the session */
export function addMessage(role, content, topics = []) {
  session.update((s) => {
    s.messages.push({ role, content, topics, timestamp: new Date().toISOString() });
    return s;
  });
}

/** Record an AI interaction (model call) for research tracking */
export function addAiInteraction(data) {
  session.update((s) => {
    s.aiInteractions.push({
      turn: s.aiInteractions.length + 1,
      timestamp: new Date().toISOString(),
      ...data,
    });
    return s;
  });
}

/** Set participant info */
export function setParticipant(info) {
  session.update((s) => {
    s.participant = { ...s.participant, ...info };
    return s;
  });
}

/** Set the vision statement (barrier lens mode) */
export function setVision(text) {
  session.update((s) => {
    s.visionStatement = text;
    return s;
  });
}

/** Add a barrier with its reflections */
export function addBarrier(barrier) {
  session.update((s) => {
    s.barriers.push(barrier);
    return s;
  });
}

/** Mark that voice was used in this session */
export function markVoiceUsed() {
  session.update((s) => {
    s.voiceUsed = true;
    return s;
  });
}

/** Finalize session duration */
export function finalizeSession() {
  session.update((s) => {
    const totalMs = Date.now() - s.duration.startTime;
    s.duration.totalSeconds = Math.round(totalMs / 1000);
    return s;
  });
}

/** Get a snapshot of the current session for export */
export function getSessionSnapshot() {
  const s = get(session);
  return {
    ...s,
    duration: {
      ...s.duration,
      totalSeconds: Math.round((Date.now() - s.duration.startTime) / 1000),
    },
  };
}
