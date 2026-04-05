/**
 * transcribe.js — Speech-to-text proxy route
 * Receives audio from the frontend, forwards to Whisper API,
 * and returns the transcribed text.
 *
 * Environment: STT_BASE_URL, STT_MODEL, LLM_API_KEY
 * Called by: app/src/lib/api.js → POST /api/transcribe
 */
import { Hono } from 'hono';

export const transcribeRoute = new Hono();

transcribeRoute.post('/transcribe', async (c) => {
  const baseUrl = process.env.STT_BASE_URL || process.env.LLM_BASE_URL;
  const model = process.env.STT_MODEL || 'whisper-1';
  const apiKey = process.env.LLM_API_KEY;

  if (!baseUrl) {
    return c.json({ error: 'STT not configured', code: 'STT_NOT_CONFIGURED' }, 500);
  }

  const formData = await c.req.formData();
  const audioFile = formData.get('file');

  if (!audioFile) {
    return c.json({ error: 'No audio file provided', code: 'NO_AUDIO' }, 400);
  }

  const sttForm = new FormData();
  sttForm.append('file', audioFile, 'recording.webm');
  sttForm.append('model', model);
  sttForm.append('language', formData.get('language') || 'de');

  const headers = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers,
    body: sttForm,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('STT error:', response.status, errorText);
    return c.json({ error: 'Transcription failed', code: 'STT_ERROR' }, 502);
  }

  const result = await response.json();
  console.log(`[stt] model=${model} text="${result.text?.substring(0, 50)}..."`);

  return c.json({ text: result.text });
});
