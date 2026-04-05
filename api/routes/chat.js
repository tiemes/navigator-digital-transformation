/**
 * chat.js — LLM proxy route
 * Receives chat messages from the frontend, forwards them to the
 * configured LLM endpoint (OpenAI or Ollama), and returns the response.
 *
 * Environment: LLM_BASE_URL, LLM_MODEL, LLM_API_KEY
 * Called by: app/src/lib/api.js → POST /api/chat
 */
import { Hono } from 'hono';

export const chatRoute = new Hono();

chatRoute.post('/chat', async (c) => {
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL;
  const apiKey = process.env.LLM_API_KEY;

  if (!baseUrl || !model) {
    return c.json(
      { error: 'LLM not configured', code: 'LLM_NOT_CONFIGURED' },
      500
    );
  }

  const body = await c.req.json();

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const llmResponse = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 1024,
    }),
  });

  if (!llmResponse.ok) {
    const errorText = await llmResponse.text();
    console.error('LLM error:', llmResponse.status, errorText);
    return c.json(
      { error: 'LLM request failed', code: 'LLM_ERROR', status: llmResponse.status },
      502
    );
  }

  const result = await llmResponse.json();

  // Log token usage for research cost tracking
  if (result.usage) {
    console.log(`[usage] model=${model} in=${result.usage.prompt_tokens} out=${result.usage.completion_tokens}`);
  }

  return c.json(result);
});
