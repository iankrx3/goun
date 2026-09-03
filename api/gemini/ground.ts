import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GEMINI_BASE, GEMINI_MODEL } from '../../shared/apiProxy.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    res.status(503).json({ error: 'not_configured', service: 'gemini' });
    return;
  }

  const payload = (req.body ?? {}) as { prompt?: string };
  if (!payload.prompt) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const response = await fetch(`${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: payload.prompt }] }],
      tools: [{ google_search: {} }],
    }),
  });
  const text = await response.text();
  res.status(response.status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(text);
}
