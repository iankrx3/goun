// Data model per Goun_PRD_v2_KTO_Design.md §8 (DATA & AI SYSTEM) and §4 (PLACE)

export type BeautyCategory = 'skin' | 'face' | 'hair' | 'nails' | 'makeup';

export type Downtime = 'none' | '1-3-days' | '3-7-days' | 'no-mind';
export type ResultTiming = 'asap' | 'within-week' | '1-2-weeks' | 'long-term';
export type Budget = 'under-100' | '100-300' | '300-500' | '500-plus';

export interface QuizAnswers {
  category: BeautyCategory | null;
  concerns: string[]; // Step 1 — WHAT (multi-select)
  vibes: string[]; // Step 2 — VIBE picks, one per pair
  downtime: Downtime | null;
  resultTiming: ResultTiming | null;
  budget: Budget | null;
  other: string[]; // English Friendly / Near Me / First Time / No Preference
}

export interface Treatment {
  id: string;
  name: string;
  category: BeautyCategory;
  concern: string[];
  expectedResult: string;
  downtime: Downtime;
  resultTiming: ResultTiming;
  price: { min: number; max: number; currency: 'USD' };
  treatmentType: string;
  intensity: 'low' | 'medium' | 'high';
  placeId: string;
  language: string[];
  foreignerFriendliness: number; // 0-1
  reviewCount: number;
  rating: number;
  creatripAvailable: boolean;
  creatripUrl?: string;
}

/** KTO 한국관광공사_웰니스관광정보 — PRD §7.2. Reference schema only; confirm against Swagger spec before build. */
export interface WellnessSpot {
  id: string;
  name: string;
  theme: 'beauty-spa' | 'nature-healing' | 'meditation';
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  intro?: string;
  contact?: string;
  regionCode?: string;
  distanceKm?: number;
}

/** KTO 한국관광공사_의료관광정보 — PRD §7.3. Reference schema only; confirm against Swagger spec before build. */
export interface MedicalTourismMatch {
  orgName: string;
  address: string;
  departments: string[];
  supportedLanguages: string[];
  contact?: string;
  registered?: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: BeautyCategory;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  photos?: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  representativeTreatment: string;
  treatmentIds: string[];
  language: string[];
  foreignerFriendly: boolean;
  aiPick?: boolean;
  creatorPick?: boolean;
  communityPick?: boolean;
  bookingUrl?: string;
  whyPeopleLikeIt?: string[];
  /** §7.2 — Nearby Wellness context, matched by radius during nightly batch. Absent → section hidden. */
  nearbyWellness?: WellnessSpot[];
  /** §7.3 — Medical tourism trust badge. Absent → badge silently hidden, never shown as "unverified". */
  medicalTourismMatch?: MedicalTourismMatch;
  source?: 'google' | 'kto' | 'merged' | 'mock';
  googlePlaceId?: string;
  ktoContentId?: string;
}

export interface MatchResult {
  treatment: Treatment;
  place: Place;
  matchScore: number; // 0-100
  reasons: string[];
}

export interface Creator {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  picks_count: number;
  created_at: string;
}

export interface CreatorPick {
  id: string;
  creator_id: string;
  creator: Creator;
  place_id: string;
  place: Place;
  personal_note: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  placeId?: string;
  placeName?: string;
  treatmentName?: string;
  category: 'trending' | 'treatment-reviews' | 'seoul-places' | 'questions';
  text: string;
  photos?: string[];
  rating?: number;
  createdAt: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  user?: {
    id: string;
    google_id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
  creator?: Creator;
}
