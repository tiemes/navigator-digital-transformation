/**
 * api.js — Client-side API calls to the proxy server.
 * Sends requests to the Hono API proxy which forwards them to the LLM.
 *
 * Used by: barrier lens flow, future voice integration
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

/** Check if the API proxy is running and configured */
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
