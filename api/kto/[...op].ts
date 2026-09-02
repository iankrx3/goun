import type { VercelRequest, VercelResponse } from '@vercel/node';
import { KTO_BASE, KTO_OPS, decodeServiceKey } from '../_lib/proxy.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ktoKey = process.env.KTO_SERVICE_KEY;
  if (!ktoKey) {
    res.status(503).json({ error: 'not_configured', service: 'kto' });
    return;
  }

  const opParam = req.query.op;
  const op = Array.isArray(opParam) ? opParam.join('/') : opParam;
  if (!op || !KTO_OPS.has(op)) {
    res.status(400).json({ error: `Unknown KTO operation: ${op}` });
    return;
  }

  const upstream = new URL(`${KTO_BASE}/${op}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'op' || key === 'serviceKey') continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v !== undefined) upstream.searchParams.set(key, v);
  }
  upstream.searchParams.set('serviceKey', decodeServiceKey(ktoKey));
  if (!upstream.searchParams.has('MobileOS')) upstream.searchParams.set('MobileOS', 'ETC');
  if (!upstream.searchParams.has('MobileApp')) upstream.searchParams.set('MobileApp', 'Miyeon');
  if (!upstream.searchParams.has('_type')) upstream.searchParams.set('_type', 'json');
  if (!upstream.searchParams.has('langDivCd')) upstream.searchParams.set('langDivCd', 'ENG');

  const response = await fetch(upstream);
  const text = await response.text();
  res.status(response.status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(text);
}
