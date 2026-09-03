import type { Creator, CuratorList, ListSpot, Place, UserSession } from '../types';
import { supabase } from '../lib/supabase';
import { mapCreator, mapCuratorList, mapListSpot } from '../lib/mappers';
import { mockCreatorPicks } from '../data/mock';
import { fetchCreatorById as fetchRemoteCreatorById } from './places';
import { DEMO_USER } from './auth';
import {
  findLocalListById,
  readLocalCuratorById,
  readLocalLists,
  readLocalSpots,
  removeLocalList,
  removeLocalSpot,
  saveLocalCurator,
  saveLocalList,
  saveLocalSpot,
  updateLocalList,
} from '../lib/localCuratorStore';

export interface CuratorProfileInput {
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
}

function isDemoSession(session: UserSession): boolean {
  return session.user?.id === DEMO_USER.id;
}

function isMockListId(listId: string): boolean {
  return listId.startsWith('mock-list-');
}

function isLocalListId(listId: string): boolean {
  return listId.startsWith('local-list-') || isMockListId(listId);
}

export async function createCurator(session: UserSession, input: CuratorProfileInput): Promise<Creator> {
  if (!session.isLoggedIn || !session.user) throw new Error('Must be signed in to become a curator.');
  const user = session.user;

  if (supabase && !isDemoSession(session)) {
    try {
      const { data, error } = await supabase
        .from('creators')
        .insert({
          user_id: user.id,
          username: input.username,
          display_name: input.display_name,
          bio: input.bio ?? '',
          avatar_url: input.avatar_url || user.avatar_url,
          instagram_url: input.instagram_url || null,
          tiktok_url: input.tiktok_url || null,
          website_url: input.website_url || null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapCreator(data, 0);
    } catch {
      // fall through to local fallback (Supabase write failed unexpectedly)
    }
  }

  const creator: Creator = {
    id: `local-creator-${crypto.randomUUID()}`,
    user_id: user.id,
    username: input.username,
    display_name: input.display_name,
    bio: input.bio ?? '',
    avatar_url: input.avatar_url || user.avatar_url,
    instagram_url: input.instagram_url || undefined,
    tiktok_url: input.tiktok_url || undefined,
    website_url: input.website_url || undefined,
    picks_count: 0,
    created_at: new Date().toISOString(),
  };
  saveLocalCurator(creator);
  return creator;
}

export async function updateCurator(session: UserSession, patch: Partial<CuratorProfileInput>): Promise<Creator> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to edit a profile.');
  const current = session.creator;

  if (supabase && !current.id.startsWith('local-creator-') && !isDemoSession(session)) {
    try {
      const { data, error } = await supabase
        .from('creators')
        .update({
          username: patch.username ?? current.username,
          display_name: patch.display_name ?? current.display_name,
          bio: patch.bio ?? current.bio,
          avatar_url: patch.avatar_url ?? current.avatar_url,
          instagram_url: patch.instagram_url ?? current.instagram_url ?? null,
          tiktok_url: patch.tiktok_url ?? current.tiktok_url ?? null,
          website_url: patch.website_url ?? current.website_url ?? null,
        })
        .eq('id', current.id)
        .select()
        .single();
      if (error) throw error;
      return mapCreator(data, current.picks_count);
    } catch {
      // fall through to local fallback
    }
  }

  const updated: Creator = { ...current, ...patch };
  saveLocalCurator(updated);
  return updated;
}

export async function fetchCuratorById(id: string): Promise<Creator | null> {
  if (id.startsWith('local-creator-')) return readLocalCuratorById(id);
  return fetchRemoteCreatorById(id);
}

export async function fetchCuratorLists(curatorId: string): Promise<CuratorList[]> {
  if (curatorId.startsWith('local-creator-')) return readLocalLists(curatorId);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('creator_lists')
        .select('*, list_spots(count)')
        .eq('curator_id', curatorId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((row: any) => mapCuratorList(row, row.list_spots?.[0]?.count ?? 0));
      }
    } catch {
      // fall through
    }
  }

  const local = readLocalLists(curatorId);
  if (local.length > 0) return local;

  // Mock creators (from src/data/mock.ts) have no lists — wrap their existing
  // flat CreatorPicks into a single synthetic list so the profile page still
  // has something to show in demo mode.
  const picks = mockCreatorPicks.filter((pick) => pick.creator_id === curatorId);
  if (picks.length === 0) return [];
  return [
    {
      id: `mock-list-${curatorId}`,
      curator_id: curatorId,
      title: 'All Picks',
      cover_photo_url: picks[0].place.photoUrl,
      spot_count: picks.length,
      created_at: picks[0].created_at,
    },
  ];
}

export async function fetchListById(listId: string): Promise<CuratorList | null> {
  if (listId.startsWith('local-list-')) return findLocalListById(listId);
  if (isMockListId(listId)) {
    const curatorId = listId.replace('mock-list-', '');
    const lists = await fetchCuratorLists(curatorId);
    return lists.find((l) => l.id === listId) ?? null;
  }
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('creator_lists')
      .select('*, list_spots(count)')
      .eq('id', listId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return findLocalListById(listId);
    return mapCuratorList(data, data.list_spots?.[0]?.count ?? 0);
  } catch {
    return findLocalListById(listId);
  }
}

export async function createList(
  session: UserSession,
  input: { title: string; description?: string }
): Promise<CuratorList> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to create a list.');
  const curator = session.creator;

  if (supabase && !curator.id.startsWith('local-creator-') && !isDemoSession(session)) {
    try {
      const { data, error } = await supabase
        .from('creator_lists')
        .insert({ curator_id: curator.id, title: input.title, description: input.description ?? null })
        .select()
        .single();
      if (error) throw error;
      return mapCuratorList(data, 0);
    } catch {
      // fall through to local fallback
    }
  }

  const list: CuratorList = {
    id: `local-list-${crypto.randomUUID()}`,
    curator_id: curator.id,
    title: input.title,
    description: input.description,
    spot_count: 0,
    created_at: new Date().toISOString(),
  };
  saveLocalList(list);
  return list;
}

export async function updateList(
  session: UserSession,
  listId: string,
  patch: { title?: string; description?: string }
): Promise<void> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to edit a list.');
  if (isLocalListId(listId)) {
    updateLocalList(session.creator.id, listId, patch);
    return;
  }
  if (!supabase) throw new Error('Unable to update list.');
  const { error } = await supabase
    .from('creator_lists')
    .update(patch)
    .eq('id', listId)
    .eq('curator_id', session.creator.id);
  if (error) throw error;
}

export async function deleteList(session: UserSession, listId: string): Promise<void> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to delete a list.');
  if (isLocalListId(listId)) {
    removeLocalList(session.creator.id, listId);
    return;
  }
  if (!supabase) throw new Error('Unable to delete list.');
  const { error } = await supabase.from('creator_lists').delete().eq('id', listId).eq('curator_id', session.creator.id);
  if (error) throw error;
}

export async function fetchListSpots(listId: string): Promise<ListSpot[]> {
  if (listId.startsWith('local-list-')) return readLocalSpots(listId);
  if (isMockListId(listId)) {
    const curatorId = listId.replace('mock-list-', '');
    return mockCreatorPicks
      .filter((pick) => pick.creator_id === curatorId)
      .map((pick, index) => ({
        id: `mock-spot-${pick.id}`,
        list_id: listId,
        place_id: pick.place_id,
        place: pick.place,
        note: pick.personal_note,
        position: index,
        created_at: pick.created_at,
      }));
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('list_spots')
        .select('*, place:places(*)')
        .eq('list_id', listId)
        .order('position', { ascending: true });
      if (error) throw error;
      if (data) return data.map(mapListSpot);
    } catch {
      // fall through
    }
  }

  return readLocalSpots(listId);
}

export async function addSpotToList(
  session: UserSession,
  listId: string,
  place: Place,
  note?: string
): Promise<ListSpot> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to add a spot.');

  if (supabase && !isLocalListId(listId) && !isDemoSession(session)) {
    try {
      const { count } = await supabase
        .from('list_spots')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId);
      const { data, error } = await supabase
        .from('list_spots')
        .insert({ list_id: listId, place_id: place.id, note: note ?? null, position: count ?? 0 })
        .select('*, place:places(*)')
        .single();
      if (error) throw error;
      return mapListSpot({ ...data, place: data.place ?? place });
    } catch {
      // fall through to local fallback
    }
  }

  const existing = readLocalSpots(listId);
  const spot: ListSpot = {
    id: `local-spot-${crypto.randomUUID()}`,
    list_id: listId,
    place_id: place.id,
    place,
    note,
    position: existing.length,
    created_at: new Date().toISOString(),
  };
  saveLocalSpot(spot);
  return spot;
}

export async function removeSpotFromList(session: UserSession, listId: string, spotId: string): Promise<void> {
  if (!session.isLoggedIn || !session.creator) throw new Error('Must be a curator to remove a spot.');
  if (isLocalListId(listId) || spotId.startsWith('local-spot-')) {
    removeLocalSpot(listId, spotId);
    return;
  }
  if (!supabase) throw new Error('Unable to remove spot.');
  const { error } = await supabase.from('list_spots').delete().eq('id', spotId).eq('list_id', listId);
  if (error) throw error;
}
