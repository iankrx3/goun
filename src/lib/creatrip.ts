const CREATRIP_AFF_PARAMS = { utm_source: 'AFF-e2873zu', aff_id: 'AFF-e2873zu' };

export const CREATRIP_BASE_URL = 'https://creatrip.com/en';

export const CREATRIP_DISCLOSURE =
  'Booking through this link may earn Miyeon a small commission — at no extra cost to you.';

/** Appends the Creatrip affiliate tracking params to any creatrip.com URL. */
export function withCreatripAffiliate(url: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', CREATRIP_AFF_PARAMS.utm_source);
  u.searchParams.set('aff_id', CREATRIP_AFF_PARAMS.aff_id);
  return u.toString();
}

/** True when bookingUrl points at a specific Creatrip listing, not just the generic homepage. */
export function hasCreatripListing(place: { bookingUrl?: string }): boolean {
  if (!place.bookingUrl) return false;
  try {
    const u = new URL(place.bookingUrl);
    return u.hostname.endsWith('creatrip.com') && u.pathname.replace(/\/+$/, '') !== '/en';
  } catch {
    return false;
  }
}
