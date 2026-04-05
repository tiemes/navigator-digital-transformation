/**
 * tts.js — Text-to-speech proxy route
 * Receives text from the frontend, forwards to TTS API,
 * and streams back the audio response.
 *
 * Environment: TTS_BASE_URL, TTS_MODEL, TTS_VOICE, LLM_API_KEY
 * Called by: app/src/lib/api.js → POST /api/tts
 */
import { Hono } from 'hono';

export const ttsRoute = new Hono();

ttsRoute.post('/tts', async (c) => {
  const baseUrl = process.env.TTS_BASE_URL || process.env.LLM_BASE_URL;
  const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
  const voice = process.env.TTS_VOICE || 'nova';
  const apiKey = process.env.LLM_API_KEY;

  if (!baseUrl) {
    return c.json({ error: 'TTS not configured', code: 'TTS_NOT_CONFIGURED' }, 500);
  }

  const body = await c.req.json();
  const text = body.text;

  if (!text) {
    return c.json({ error: 'No text provided', code: 'NO_TEXT' }, 400);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TTS error:', response.status, errorText);
    return c.json({ error: 'Speech synthesis failed', code: 'TTS_ERROR' }, 502);
  }

  console.log(`[tts] model=${model} voice=${voice} chars=${text.length}`);

  // Stream the audio back
  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  });
});
