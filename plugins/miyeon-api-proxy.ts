import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';

const KTO_BASE = 'https://apis.data.go.kr/B551011/MdclTursmService';
const PLACES_BASE = 'https://places.googleapis.com/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.5-flash';
const KTO_OPS = new Set([
  'searchKeyword',
  'locationBasedList',
  'areaBasedList',
  'detailCommon',
  'detailMdclTursm',
  'detailIntro',
  'ldongCode',
]);

const PLACES_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.priceLevel',
  'places.types',
  'places.primaryType',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
].join(',');

export interface MiyeonApiProxyOptions {
  ktoKey?: string;
  googleKey?: string;
  geminiKey?: string;
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function decodeServiceKey(raw: string): string {
  try {
    return raw.includes('%') ? decodeURIComponent(raw) : raw;
  } catch {
    return raw;
  }
}

async function handleKto(url: URL, res: ServerResponse, ktoKey: string) {
  const op = url.pathname.replace(/^\/api\/kto\//, '').replace(/\/$/, '');
  if (!KTO_OPS.has(op)) {
    json(res, 400, { error: `Unknown KTO operation: ${op}` });
    return;
  }

  const upstream = new URL(`${KTO_BASE}/${op}`);
  url.searchParams.forEach((value, key) => {
    if (key === 'serviceKey') return;
    upstream.searchParams.set(key, value);
  });
  upstream.searchParams.set('serviceKey', decodeServiceKey(ktoKey));
  if (!upstream.searchParams.has('MobileOS')) upstream.searchParams.set('MobileOS', 'ETC');
  if (!upstream.searchParams.has('MobileApp')) upstream.searchParams.set('MobileApp', 'Miyeon');
  if (!upstream.searchParams.has('_type')) upstream.searchParams.set('_type', 'json');
  if (!upstream.searchParams.has('langDivCd')) upstream.searchParams.set('langDivCd', 'ENG');

  const response = await fetch(upstream);
  const text = await response.text();
  res.statusCode = response.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(text);
}

async function handlePlacesSearch(req: IncomingMessage, res: ServerResponse, googleKey: string) {
  const raw = await readBody(req);
  let payload: { mode?: string } & Record<string, unknown>;
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    json(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const mode = payload.mode === 'text' ? 'text' : 'nearby';
  delete payload.mode;
  const path = mode === 'text' ? 'places:searchText' : 'places:searchNearby';

  const response = await fetch(`${PLACES_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': PLACES_FIELD_MASK,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  res.statusCode = response.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(text);
}

async function handlePlacesPhoto(url: URL, res: ServerResponse, googleKey: string) {
  const name = url.searchParams.get('name');
  if (!name) {
    json(res, 400, { error: 'Missing photo name' });
    return;
  }
  const maxHeightPx = url.searchParams.get('maxHeightPx') || '800';
  const mediaUrl = `${PLACES_BASE}/${name}/media?maxHeightPx=${encodeURIComponent(maxHeightPx)}&skipHttpRedirect=true`;
  const response = await fetch(mediaUrl, {
    headers: { 'X-Goog-Api-Key': googleKey },
  });
  if (!response.ok) {
    json(res, response.status, { error: 'Photo fetch failed' });
    return;
  }
  const data = (await response.json()) as { photoUri?: string };
  if (!data.photoUri) {
    json(res, 502, { error: 'No photoUri in Places response' });
    return;
  }
  res.statusCode = 302;
  res.setHeader('Location', data.photoUri);
  res.end();
}

async function handleGeminiGround(req: IncomingMessage, res: ServerResponse, geminiKey: string) {
  const raw = await readBody(req);
  let payload: { prompt?: string };
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    json(res, 400, { error: 'Invalid JSON body' });
    return;
  }
  if (!payload.prompt) {
    json(res, 400, { error: 'Missing prompt' });
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
  res.statusCode = response.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(text);
}

function attach(server: ViteDevServer, options: MiyeonApiProxyOptions) {
  server.middlewares.use(async (req, res, next) => {
    const rawUrl = req.url || '';
    if (!rawUrl.startsWith('/api/')) {
      next();
      return;
    }

    try {
      const url = new URL(rawUrl, 'http://localhost');

      if (url.pathname === '/api/health') {
        json(res, 200, {
          kto: Boolean(options.ktoKey),
          google: Boolean(options.googleKey),
          gemini: Boolean(options.geminiKey),
        });
        return;
      }

      if (url.pathname.startsWith('/api/kto/')) {
        if (!options.ktoKey) {
          json(res, 503, { error: 'not_configured', service: 'kto' });
          return;
        }
        await handleKto(url, res, options.ktoKey);
        return;
      }

      if (url.pathname === '/api/places/search' && req.method === 'POST') {
        if (!options.googleKey) {
          json(res, 503, { error: 'not_configured', service: 'google' });
          return;
        }
        await handlePlacesSearch(req, res, options.googleKey);
        return;
      }

      if (url.pathname === '/api/places/photo') {
        if (!options.googleKey) {
          json(res, 503, { error: 'not_configured', service: 'google' });
          return;
        }
        await handlePlacesPhoto(url, res, options.googleKey);
        return;
      }

      if (url.pathname === '/api/gemini/ground' && req.method === 'POST') {
        if (!options.geminiKey) {
          json(res, 503, { error: 'not_configured', service: 'gemini' });
          return;
        }
        await handleGeminiGround(req, res, options.geminiKey);
        return;
      }

      next();
    } catch (err) {
      json(res, 500, { error: err instanceof Error ? err.message : 'Proxy failed' });
    }
  });
}

export function miyeonApiProxy(options: MiyeonApiProxyOptions): Plugin {
  return {
    name: 'miyeon-api-proxy',
    configureServer(server) {
      attach(server, options);
    },
    configurePreviewServer(server) {
      attach(server as unknown as ViteDevServer, options);
    },
  };
}
