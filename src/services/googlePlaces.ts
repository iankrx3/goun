export interface GooglePlaceHit {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  priceLevel?: string;
  types: string[];
  primaryType?: string;
  photoName?: string;
  phone?: string;
  website?: string;
}

interface PlacesSearchResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    types?: string[];
    primaryType?: string;
    photos?: Array<{ name?: string }>;
    nationalPhoneNumber?: string;
    websiteUri?: string;
  }>;
  error?: { message?: string; status?: string };
}

export function placesPhotoUrl(photoName: string): string {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&maxHeightPx=800`;
}

function mapHit(place: NonNullable<PlacesSearchResponse['places']>[number]): GooglePlaceHit | null {
  if (!place.id || !place.displayName?.text) return null;
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (lat == null || lng == null) return null;
  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress || '',
    latitude: lat,
    longitude: lng,
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    priceLevel: place.priceLevel,
    types: place.types ?? [],
    primaryType: place.primaryType,
    photoName: place.photos?.[0]?.name,
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
  };
}

async function search(body: Record<string, unknown>): Promise<GooglePlaceHit[]> {
  const response = await fetch('/api/places/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 503) return [];
  const data = (await response.json()) as PlacesSearchResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || `Places search failed (${response.status})`);
  }
  return (data.places ?? []).map(mapHit).filter((hit): hit is GooglePlaceHit => hit !== null);
}

export async function searchNearby(opts: {
  includedTypes: string[];
  origin: { lat: number; lng: number };
  radiusM?: number;
  maxResultCount?: number;
}): Promise<GooglePlaceHit[]> {
  return search({
    mode: 'nearby',
    includedTypes: opts.includedTypes,
    maxResultCount: Math.min(opts.maxResultCount ?? 20, 20),
    rankPreference: 'POPULARITY',
    languageCode: 'en',
    regionCode: 'KR',
    locationRestriction: {
      circle: {
        center: { latitude: opts.origin.lat, longitude: opts.origin.lng },
        radius: opts.radiusM ?? 5000,
      },
    },
  });
}

export async function searchText(opts: {
  textQuery: string;
  includedType?: string;
  origin: { lat: number; lng: number };
  radiusM?: number;
  maxResultCount?: number;
}): Promise<GooglePlaceHit[]> {
  return search({
    mode: 'text',
    textQuery: opts.textQuery,
    includedType: opts.includedType,
    languageCode: 'en',
    regionCode: 'KR',
    maxResultCount: Math.min(opts.maxResultCount ?? 15, 20),
    locationBias: {
      circle: {
        center: { latitude: opts.origin.lat, longitude: opts.origin.lng },
        radius: opts.radiusM ?? 6000,
      },
    },
  });
}

let healthCache: { kto: boolean; google: boolean; gemini: boolean } | null = null;

export async function getApiHealth(): Promise<{ kto: boolean; google: boolean; gemini: boolean }> {
  if (healthCache) return healthCache;
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      healthCache = { kto: false, google: false, gemini: false };
      return healthCache;
    }
    healthCache = (await response.json()) as { kto: boolean; google: boolean; gemini: boolean };
    return healthCache;
  } catch (err) {
    console.warn('getApiHealth: /api/health request failed, treating all APIs as unhealthy', err);
    healthCache = { kto: false, google: false, gemini: false };
    return healthCache;
  }
}
