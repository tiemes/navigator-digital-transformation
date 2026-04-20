/**
 * tts.js — Text-to-speech proxy route
 * Receives text from the frontend, forwards to TTS API,
 * and streams back the audio response.
 *
 * Body (all fields optional):
 *   text — required
 *   voice — overrides TTS_VOICE env (must be in allowlist)
 *   speed — overrides TTS_SPEED env (clamped to 0.5–1.5)
 *
 * Environment:
 *   TTS_BASE_URL, TTS_MODEL, TTS_VOICE, TTS_SPEED,
 *   TTS_INSTRUCTIONS (gpt-4o-mini-tts only), LLM_API_KEY
 *
 * Called by: app/src/lib/api.js → POST /api/tts
 */
import { Hono } from 'hono';

export const ttsRoute = new Hono();

const VOICE_ALLOWLIST = new Set([
  'alloy', 'ash', 'ballad', 'coral', 'echo',
  'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse',
]);

const SPEED_MIN = 0.5;
const SPEED_MAX = 1.5;

function clampSpeed(value, fallback) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, SPEED_MIN), SPEED_MAX);
}

ttsRoute.post('/tts', async (c) => {
  const baseUrl = process.env.TTS_BASE_URL || process.env.LLM_BASE_URL;
  const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
  const defaultVoice = process.env.TTS_VOICE || 'shimmer';
  const defaultSpeed = clampSpeed(process.env.TTS_SPEED, 1.0);
  const instructions = process.env.TTS_INSTRUCTIONS;
  const apiKey = process.env.LLM_API_KEY;

  if (!baseUrl) {
    return c.json({ error: 'TTS not configured', code: 'TTS_NOT_CONFIGURED' }, 500);
  }

  const body = await c.req.json();
  const text = body.text;

  if (!text) {
    return c.json({ error: 'No text provided', code: 'NO_TEXT' }, 400);
  }

  // Voice override: must be in allowlist; otherwise fall back to env default.
  let voice = defaultVoice;
  if (body.voice !== undefined) {
    if (!VOICE_ALLOWLIST.has(body.voice)) {
      return c.json({ error: 'Voice not allowed', code: 'INVALID_VOICE' }, 400);
    }
    voice = body.voice;
  }

  // Speed override: clamped silently.
  const speed = body.speed !== undefined ? clampSpeed(body.speed, defaultSpeed) : defaultSpeed;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const openaiBody = {
    model,
    voice,
    input: text,
    response_format: 'mp3',
    speed,
  };
  // `instructions` is only supported by gpt-4o-mini-tts.
  if (instructions && model === 'gpt-4o-mini-tts') {
    openaiBody.instructions = instructions;
  }

  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers,
    body: JSON.stringify(openaiBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TTS error:', response.status, errorText);
    return c.json({ error: 'Speech synthesis failed', code: 'TTS_ERROR' }, 502);
  }

  console.log(`[tts] model=${model} voice=${voice} speed=${speed} chars=${text.length}`);

  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  });
});
