// One-off enrichment tool: for each place in src/data/mock.ts, asks Gemini
// (with Google Search grounding — same setup as api/gemini/ground.ts) to find
// the matching creatrip.com listing, and reports whether the answer is
// corroborated by an actual search result ("verified") or not.
//
// Read-only: this script never edits mock.ts. Review scripts/output/creatrip-links.json
// and apply "verified" results to the corresponding `bookingUrl` fields by hand.
//
// Usage: npm run resolve:creatrip   (reads GEMINI_API_KEY from .env.local)

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-3.6-flash'; // mirrors api/_lib/proxy.ts

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const mockPath = path.join(repoRoot, 'src', 'data', 'mock.ts');

function splitTopLevelObjects(text) {
  // Depth-tracks `{`/`}` only (not `[`/`]`), so nested arrays/objects (e.g.
  // nearbyWellness) don't confuse where one top-level place object ends and
  // the next begins. Assumes no `{`/`}` appear inside string literal values,
  // which holds for this dataset.
  const blocks = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        blocks.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return blocks;
}

function firstMatch(block, field) {
  const re = new RegExp(`\\b${field}:\\s*'((?:\\\\.|[^'\\\\])*)'`);
  const m = block.match(re);
  return m ? m[1].replace(/\\(.)/g, '$1') : null;
}

function isAlreadyResolved(bookingUrl) {
  if (!bookingUrl) return false;
  try {
    const u = new URL(bookingUrl);
    return u.hostname.endsWith('creatrip.com') && u.pathname.replace(/\/+$/, '') !== '/en';
  } catch {
    return false;
  }
}

function sameCreatripUrl(a, b) {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return (
      ua.hostname.replace(/^www\./, '') === ub.hostname.replace(/^www\./, '') &&
      ua.pathname.replace(/\/+$/, '') === ub.pathname.replace(/\/+$/, '')
    );
  } catch {
    return false;
  }
}

async function resolveCreatripUrl(apiKey, place) {
  const prompt = [
    'You are verifying whether a specific business has a page on the Korean travel/booking platform Creatrip (creatrip.com).',
    `Business name: "${place.name}"`,
    `Address: ${place.address}, South Korea`,
    '',
    'Search the web and find the exact, matching page for this business on creatrip.com (any language version, e.g. https://creatrip.com/en/spot/12345).',
    'Reply with ONLY the full URL if you can confirm a matching page exists.',
    "If you cannot confidently confirm a matching page (wrong business, no match, or you're unsure), reply with exactly: NOT_FOUND",
    'Do not guess or invent a URL.',
  ].join('\n');

  const res = await fetch(`${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { status: 'error', detail: `HTTP ${res.status}: ${errText.slice(0, 300)}` };
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
  const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((c) => c.web?.uri)
    .filter(Boolean);

  if (!text || /NOT_FOUND/i.test(text)) {
    return { status: 'not_found', sources };
  }

  const urlMatch = text.match(/https?:\/\/[^\s)"'<>]+creatrip\.com[^\s)"'<>]*/i);
  if (!urlMatch) {
    return { status: 'not_found', sources, rawText: text };
  }

  const candidateUrl = urlMatch[0].replace(/[.,)]+$/, '');
  const verified = sources.some((s) => sameCreatripUrl(s, candidateUrl));

  return {
    status: verified ? 'verified' : 'unverified',
    url: candidateUrl,
    sources,
    rawText: text,
  };
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      'GEMINI_API_KEY is not set. Run via `npm run resolve:creatrip` (reads .env.local) or export it manually.'
    );
    process.exit(1);
  }

  const source = readFileSync(mockPath, 'utf8');
  const startMarker = 'export const mockPlaces: Place[] = [';
  const endMarker = 'export const mockTreatments';
  const startIdx = source.indexOf(startMarker);
  const endIdx = source.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error('Could not locate mockPlaces array in src/data/mock.ts — has the file structure changed?');
    process.exit(1);
  }
  const arrayBody = source.slice(startIdx + startMarker.length, endIdx);

  const places = splitTopLevelObjects(arrayBody)
    .map((block) => ({
      id: firstMatch(block, 'id'),
      name: firstMatch(block, 'name'),
      address: firstMatch(block, 'address'),
      bookingUrl: firstMatch(block, 'bookingUrl'),
    }))
    .filter((p) => p.id && p.name);

  console.log(`Found ${places.length} place(s) in mock.ts.\n`);

  const results = [];
  for (const place of places) {
    if (isAlreadyResolved(place.bookingUrl)) {
      console.log(`skip  ${place.name} — already has a specific Creatrip URL (${place.bookingUrl})`);
      results.push({ ...place, status: 'skipped_already_resolved' });
      continue;
    }

    process.stdout.write(`query ${place.name} ... `);
    const result = await resolveCreatripUrl(apiKey, place);
    console.log(result.status);
    results.push({ ...place, ...result });

    await new Promise((r) => setTimeout(r, 1000));
  }

  const outDir = path.join(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'creatrip-links.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\nSaved full results to ${path.relative(repoRoot, outPath)}`);
  console.log('\nSummary:');
  for (const r of results) {
    console.log(`- [${r.status}] ${r.name}${r.url ? ` -> ${r.url}` : ''}`);
  }

  const verifiedCount = results.filter((r) => r.status === 'verified').length;
  console.log(
    `\n${verifiedCount} verified match(es). Review scripts/output/creatrip-links.json, then update the ` +
      'matching bookingUrl fields in src/data/mock.ts by hand (verified results only — this script never ' +
      'writes to mock.ts itself).'
  );
}

main();
