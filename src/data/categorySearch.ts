import type { BeautyCategory } from '../types';

export const GANGNAM_ORIGIN = { lat: 37.5172, lng: 127.0473 };

export const KOREA_BOUNDS = { minLat: 33, maxLat: 39, minLng: 124, maxLng: 132 };

export interface CategorySearchSpec {
  googleTypes: string[];
  textQuery: string;
  ktoKeywords: string[];
  representativeTreatment: string;
  fallbackPhoto: string;
  defaultPrice: { min: number; max: number };
}

export const categorySearch: Record<BeautyCategory, CategorySearchSpec> = {
  skin: {
    googleTypes: ['skin_care_clinic', 'spa', 'medical_clinic'],
    textQuery: 'dermatology clinic 피부과 Gangnam Seoul',
    ktoKeywords: ['dermatology', 'skin', '피부'],
    representativeTreatment: 'Laser / Skin Care',
    fallbackPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200',
    defaultPrice: { min: 80, max: 250 },
  },
  face: {
    googleTypes: ['medical_clinic', 'spa'],
    textQuery: 'plastic surgery clinic 성형외과 Gangnam Seoul',
    ktoKeywords: ['plastic', '성형'],
    representativeTreatment: 'Facial Contouring',
    fallbackPhoto: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=1200',
    defaultPrice: { min: 200, max: 600 },
  },
  hair: {
    googleTypes: ['hair_salon', 'hair_care'],
    textQuery: 'hair salon 헤어살롱 Gangnam Seoul',
    ktoKeywords: [],
    representativeTreatment: 'Cut & Styling',
    fallbackPhoto: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=1200',
    defaultPrice: { min: 60, max: 180 },
  },
  nails: {
    googleTypes: ['nail_salon'],
    textQuery: 'nail salon 네일샵 Hongdae Seoul',
    ktoKeywords: [],
    representativeTreatment: 'Gel Set',
    fallbackPhoto: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200',
    defaultPrice: { min: 30, max: 80 },
  },
  makeup: {
    googleTypes: ['makeup_artist', 'beauty_salon'],
    textQuery: 'makeup studio 메이크업 Seoul',
    ktoKeywords: [],
    representativeTreatment: 'Makeup Session',
    fallbackPhoto: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200',
    defaultPrice: { min: 70, max: 180 },
  },
};

export function isInKorea(lat: number, lng: number): boolean {
  return (
    lat >= KOREA_BOUNDS.minLat &&
    lat <= KOREA_BOUNDS.maxLat &&
    lng >= KOREA_BOUNDS.minLng &&
    lng <= KOREA_BOUNDS.maxLng
  );
}

export function resolveOrigin(origin?: { lat: number; lng: number }): { lat: number; lng: number } {
  if (origin && isInKorea(origin.lat, origin.lng)) return origin;
  return GANGNAM_ORIGIN;
}
