import { useCallback, useEffect, useState } from 'react';

// "Save to My Map" — Goun_PRD_v2_KTO_Design.md §3. Stored client-side for now;
// once user accounts persist server-side, swap this for a `saved_places` table
// keyed by session.user.id and keep the same hook signature.
const STORAGE_KEY = 'goun_my_map';

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useSavedPlaces() {
  const [savedIds, setSavedIds] = useState<string[]>(() => readSaved());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  const isSaved = useCallback((placeId: string) => savedIds.includes(placeId), [savedIds]);

  const toggleSave = useCallback((placeId: string) => {
    setSavedIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  }, []);

  return { savedIds, isSaved, toggleSave };
}
