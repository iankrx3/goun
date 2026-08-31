import type { User } from '@supabase/supabase-js';
import { Creator, Place, UserSession } from '../types';

export function mapPlace(row: any): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    area: row.area,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoUrl: row.photo_url,
    photos: row.photos || undefined,
    priceRange: row.price_range,
    rating: Number(row.rating),
    reviewCount: row.review_count ?? 0,
    representativeTreatment: row.representative_treatment,
    treatmentIds: row.treatment_ids || [],
    language: row.language || [],
    foreignerFriendly: Boolean(row.foreigner_friendly),
    aiPick: row.ai_pick ?? undefined,
    creatorPick: row.creator_pick ?? undefined,
    communityPick: row.community_pick ?? undefined,
    bookingUrl: row.booking_url ?? undefined,
    whyPeopleLikeIt: row.why_people_like_it || undefined,
    nearbyWellness: row.nearby_wellness || undefined,
    medicalTourismMatch: row.medical_tourism_match || undefined,
  };
}

export function mapCreator(row: any, picksCount?: number): Creator {
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    display_name: row.display_name,
    bio: row.bio || '',
    avatar_url: row.avatar_url || '',
    instagram_url: row.instagram_url ?? undefined,
    tiktok_url: row.tiktok_url ?? undefined,
    website_url: row.website_url ?? undefined,
    picks_count: picksCount ?? row.picks_count ?? 0,
    created_at: row.created_at,
  };
}

export function mapAuthSession(user: User, creator?: Creator | null): UserSession {
  const meta = user.user_metadata || {};
  const googleIdentity = user.identities?.find((identity) => identity.provider === 'google');
  const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'Guest';
  const avatar =
    meta.avatar_url ||
    meta.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B98278&color=fff`;

  return {
    isLoggedIn: true,
    user: {
      id: user.id,
      google_id: String(googleIdentity?.id || meta.sub || user.id),
      email: user.email || '',
      name,
      avatar_url: avatar,
    },
    creator: creator || undefined,
  };
}
