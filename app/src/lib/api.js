/**
 * api.js — Client-side API calls to the proxy server.
 * Sends requests to the Hono API proxy which forwards them
 * to the LLM, STT, and TTS endpoints.
 *
 * Used by: conversation view, VoiceButton
 */

const API_BASE = '/api';

/**
 * Send a chat completion request to the LLM via the API proxy.
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {object} [options] - Optional: temperature, max_tokens
 * @returns {Promise<object>} LLM response (OpenAI chat completions format)
 */
export async function chat(messages, options = {}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Send audio to the STT proxy for transcription.
 * @param {Blob} audioBlob - Audio data (webm/opus)
 * @param {string} [language] - Language hint (default: 'de')
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribe(audioBlob, language = 'de') {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('language', language);

  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Transcription failed' }));
    throw new Error(error.error || `STT error: ${res.status}`);
  }

  const result = await res.json();
  return result.text;
}

/**
 * Send text to the TTS proxy and get audio back.
 * @param {string} text - Text to speak
 * @param {object} [options] - Optional: voice, speed (proxy enforces allowlist)
 * @returns {Promise<Blob>} Audio blob (mp3)
 */
export async function speak(text, options = {}) {
  const body = { text };
  if (options.voice) body.voice = options.voice;
  if (options.speed !== undefined) body.speed = options.speed;

  const res = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'TTS failed' }));
    throw new Error(error.error || `TTS error: ${res.status}`);
  }

  return res.blob();
}

/** Check if the API proxy is running and configured */
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
