import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PLACES_BASE } from '../_lib/proxy.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!googleKey) {
    res.status(503).json({ error: 'not_configured', service: 'google' });
    return;
  }

  const nameParam = req.query.name;
  const name = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  if (!name) {
    res.status(400).json({ error: 'Missing photo name' });
    return;
  }

  const maxHeightPxParam = req.query.maxHeightPx;
  const maxHeightPx = (Array.isArray(maxHeightPxParam) ? maxHeightPxParam[0] : maxHeightPxParam) || '800';
  const mediaUrl = `${PLACES_BASE}/${name}/media?maxHeightPx=${encodeURIComponent(maxHeightPx)}&skipHttpRedirect=true`;

  const response = await fetch(mediaUrl, {
    headers: { 'X-Goog-Api-Key': googleKey },
  });
  if (!response.ok) {
    res.status(response.status).json({ error: 'Photo fetch failed' });
    return;
  }
  const data = (await response.json()) as { photoUri?: string };
  if (!data.photoUri) {
    res.status(502).json({ error: 'No photoUri in Places response' });
    return;
  }
  res.setHeader('Location', data.photoUri);
  res.status(302).end();
}
