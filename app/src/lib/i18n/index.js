/**
 * i18n/index.js — Internationalisation module
 * Provides reactive language state and a translate function.
 * Loads UI strings from per-language JSON files.
 *
 * Usage: import { lang, t } from '$lib/i18n';
 *   t('compass.title') → returns translated string for current language
 */
import { writable, derived } from 'svelte/store';
import de from './de.json';
import en from './en.json';

const translations = { de, en };

/** Current language code ('de' or 'en') */
export const lang = writable('de');

/**
 * Translate a dot-separated key for the current language.
 * Falls back to German, then returns the key itself.
 * @param {string} key - Dot-separated path, e.g. 'compass.title'
 * @returns {string}
 */
function resolve(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/** Derived store: returns a translate function bound to current language */
export const t = derived(lang, ($lang) => {
  return (key) => {
    return resolve(translations[$lang], key)
      ?? resolve(translations.de, key)
      ?? key;
  };
});
