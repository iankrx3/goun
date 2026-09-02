const CREATRIP_AFF_PARAMS = { utm_source: 'AFF-e2873zu', aff_id: 'AFF-e2873zu' };

export const CREATRIP_BASE_URL = 'https://creatrip.com/en';

/** Appends the Creatrip affiliate tracking params to any creatrip.com URL. */
export function withCreatripAffiliate(url: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', CREATRIP_AFF_PARAMS.utm_source);
  u.searchParams.set('aff_id', CREATRIP_AFF_PARAMS.aff_id);
  return u.toString();
}
