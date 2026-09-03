export const KTO_BASE = 'https://apis.data.go.kr/B551011/MdclTursmService';
export const PLACES_BASE = 'https://places.googleapis.com/v1';
export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const KTO_OPS = new Set([
  'searchKeyword',
  'locationBasedList',
  'areaBasedList',
  'detailCommon',
  'detailMdclTursm',
  'detailIntro',
  'ldongCode',
]);

export const PLACES_FIELD_MASK = [
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

export function decodeServiceKey(raw: string): string {
  try {
    return raw.includes('%') ? decodeURIComponent(raw) : raw;
  } catch {
    return raw;
  }
}
