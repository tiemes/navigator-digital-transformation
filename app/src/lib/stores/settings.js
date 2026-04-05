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
