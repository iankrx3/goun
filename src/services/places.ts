import { Creator, CreatorPick, Place, Treatment } from '../types';
import { mapCreator, mapPlace } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import {
  mockCreatorPicks,
  mockCreators,
  mockPlaces,
  mockTreatments,
} from '../data/mock';

// Every fetcher below tries live Supabase tables first (places, creators,
// creator_picks, treatments — see Goun_PRD_v2_KTO_Design.md §8 for the
// intended schema) and falls back to the bundled demo dataset whenever
// Supabase isn't configured or the query errors. Swap this file over to a
// dedicated API layer once the real Place/Treatment DB and KTO batch tables
// (§7.6: wellness_spots, medical_tourism_orgs) exist.

export async function fetchPlaces(): Promise<Place[]> {
  if (!supabase) return mockPlaces;
  try {
    const { data, error } = await supabase.from('places').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return mockPlaces;
    return data.map(mapPlace);
  } catch {
    return mockPlaces;
  }
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const places = await fetchPlaces();
  return places.find((p) => p.id === id) ?? null;
}

export async function fetchTreatments(): Promise<Treatment[]> {
  if (!supabase) return mockTreatments;
  try {
    const { data, error } = await supabase.from('treatments').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return mockTreatments;
    return data as Treatment[];
  } catch {
    return mockTreatments;
  }
}

export async function fetchTreatmentById(id: string): Promise<Treatment | null> {
  const treatments = await fetchTreatments();
  return treatments.find((t) => t.id === id) ?? null;
}

export async function fetchCreators(): Promise<Creator[]> {
  if (!supabase) return mockCreators;
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*, creator_picks(id)')
      .order('created_at', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return mockCreators;
    return data.map((row: any) => mapCreator(row, row.creator_picks?.length || 0));
  } catch {
    return mockCreators;
  }
}

export async function fetchCreatorByUserId(userId: string): Promise<Creator | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*, creator_picks(id)')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapCreator(data, data.creator_picks?.length || 0);
  } catch {
    return null;
  }
}

export async function fetchCreatorPicks(): Promise<CreatorPick[]> {
  if (!supabase) return mockCreatorPicks;
  try {
    const { data, error } = await supabase
      .from('creator_picks')
      .select('*, creator:creators(*), place:places(*)');
    if (error) throw error;
    if (!data || data.length === 0) return mockCreatorPicks;
    return data.map((row: any) => ({
      id: row.id,
      creator_id: row.creator_id,
      creator: mapCreator(row.creator),
      place_id: row.place_id,
      place: mapPlace(row.place),
      personal_note: row.personal_note || '',
      created_at: row.created_at,
    }));
  } catch {
    return mockCreatorPicks;
  }
}
