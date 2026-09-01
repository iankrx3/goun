import type { Place } from '../types';
import { getApiHealth } from './googlePlaces';

export interface GroundedPlaceInfo {
  summary: string;
  sources: { title: string; uri: string }[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
    };
  }>;
  error?: { message?: string };
}

export async function isGeminiAvailable(): Promise<boolean> {
  const health = await getApiHealth();
  return health.gemini;
}

/**
 * On-demand enrichment for the place detail page: asks Gemini (with Google
 * Search grounding) for a short, current summary of a place — hours,
 * closures, recent notable reviews — that Google Places / KTO don't carry.
 * Fail-silent by design: missing key or a failed call returns null, and the
 * caller should simply omit the section (§7.6 pattern used across KTO badges).
 */
export async function groundPlaceInfo(place: Place): Promise<GroundedPlaceInfo | null> {
  const prompt =
    `Give a short (2-3 sentence) up-to-date summary in English for the business ` +
    `"${place.name}" located at ${place.address}, South Korea. ` +
    `Mention current opening hours or any recent closures/changes if you can find them, ` +
    `and note anything travelers should know before visiting. If you can't confirm it's ` +
    `still open, say so plainly.`;

  try {
    const response = await fetch('/api/gemini/ground', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (response.status === 503) return null;
    if (!response.ok) return null;

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const summary = candidate?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!summary) return null;

    const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
      .map((chunk) => ({ title: chunk.web?.title ?? chunk.web?.uri ?? '', uri: chunk.web?.uri ?? '' }))
      .filter((source) => source.uri);

    return { summary, sources };
  } catch (err) {
    console.warn('Gemini grounding failed', err);
    return null;
  }
}
