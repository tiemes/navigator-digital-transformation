/**
 * server.js — API proxy entry point
 * Lightweight Hono server that forwards LLM and voice requests
 * to the configured backend (OpenAI, Ollama, etc.).
 * Keeps API keys server-side, never exposed to the browser.
 *
 * Environment: PORT (default 3001)
 * Routes: /api/chat, /api/transcribe, /api/tts, /api/health
 */
import { existsSync } from 'node:fs';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { chatRoute } from './routes/chat.js';
import { transcribeRoute } from './routes/transcribe.js';
import { ttsRoute } from './routes/tts.js';

const app = new Hono();

app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}));

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', model: process.env.LLM_MODEL || 'not configured' });
});

app.route('/api', chatRoute);
app.route('/api', transcribeRoute);
app.route('/api', ttsRoute);

// In production (Docker), serve the built SvelteKit static files
if (existsSync('./public')) {
  app.use('/*', serveStatic({ root: './public' }));
  // SPA fallback for client-side routing
  app.use('/*', serveStatic({ root: './public', path: '404.html' }));
}

const port = parseInt(process.env.PORT || '3001', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API proxy running at http://localhost:${info.port}`);
});
