/**
 * stores/settings.js — App settings store
 * Manages language preference and API endpoint configuration.
 * Persists language choice to localStorage.
 *
 * Used by: +layout.svelte, all components needing language state
 */
import { lang } from '$lib/i18n';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/** Initialize language from localStorage or browser default */
if (browser) {
  const saved = localStorage.getItem('navigator-lang');
  if (saved === 'de' || saved === 'en') {
    lang.set(saved);
  }
}

/** Persist language changes to localStorage */
if (browser) {
  lang.subscribe((value) => {
    localStorage.setItem('navigator-lang', value);
    document.documentElement.lang = value;
  });
}

/** API base URL for LLM proxy */
export const apiBaseUrl = writable(
  browser ? (localStorage.getItem('navigator-api-url') || '/api') : '/api'
);

/**
 * Auto-send after silence detection.
 * Default: OFF — user clicks mic to start, clicks again to stop + send.
 * When ON, the silence detector also stops recording after ~1.5s of silence
 * and sends the transcription automatically.
 */
const storedAutoSend = browser ? localStorage.getItem('navigator-auto-send') === 'true' : false;
export const autoSend = writable(storedAutoSend);

if (browser) {
  autoSend.subscribe((value) => {
    localStorage.setItem('navigator-auto-send', value ? 'true' : 'false');
  });
}

/** Curated TTS voices that handle German acceptably. */
export const VOICE_OPTIONS = ['shimmer', 'coral', 'sage'];
/** Curated speeds exposed in the UI. */
export const SPEED_OPTIONS = [0.85, 1.0, 1.15];

/** TTS voice — persists to localStorage. Default 'shimmer' (soft, warm). */
const storedVoice = browser ? localStorage.getItem('navigator-tts-voice') : null;
export const ttsVoice = writable(
  VOICE_OPTIONS.includes(storedVoice) ? storedVoice : 'shimmer'
);

/** TTS speed — persists to localStorage. Default 1.0. */
const storedSpeedRaw = browser ? parseFloat(localStorage.getItem('navigator-tts-speed')) : NaN;
export const ttsSpeed = writable(
  SPEED_OPTIONS.includes(storedSpeedRaw) ? storedSpeedRaw : 1.0
);

if (browser) {
  ttsVoice.subscribe((value) => {
    if (VOICE_OPTIONS.includes(value)) {
      localStorage.setItem('navigator-tts-voice', value);
    }
  });
  ttsSpeed.subscribe((value) => {
    if (SPEED_OPTIONS.includes(value)) {
      localStorage.setItem('navigator-tts-speed', String(value));
    }
  });
}
