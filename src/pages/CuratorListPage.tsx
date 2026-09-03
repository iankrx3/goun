import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Plus, X } from 'lucide-react';
import type { CuratorList, ListSpot, Place, UserSession } from '../types';
import { addSpotToList, fetchListById, fetchListSpots, removeSpotFromList } from '../services/curator';
import { PlaceCard } from '../components/place/PlaceCard';
import { PlaceSearchPicker } from '../components/place/PlaceSearchPicker';

interface CuratorListPageProps {
  session: UserSession;
}

export default function CuratorListPage({ session }: CuratorListPageProps) {
  const { id, listId } = useParams<{ id: string; listId: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<CuratorList | null>(null);
  const [spots, setSpots] = useState<ListSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  const [pendingPlace, setPendingPlace] = useState<Place | null>(null);
  const [note, setNote] = useState('');

  const isOwner = Boolean(id && session.creator?.id === id);

  useEffect(() => {
    if (!listId) return;
    setLoading(true);
    Promise.all([fetchListById(listId), fetchListSpots(listId)])
      .then(([l, s]) => {
        setList(l);
        setSpots(s);
      })
      .finally(() => setLoading(false));
  }, [listId]);

  const confirmAddSpot = async () => {
    if (!pendingPlace || !listId) return;
    const spot = await addSpotToList(session, listId, pendingPlace, note.trim() || undefined);
    setSpots((prev) => [...prev, spot]);
    setList((prev) => (prev ? { ...prev, spot_count: prev.spot_count + 1 } : prev));
    setPendingPlace(null);
    setNote('');
  };

  const handleRemove = async (spotId: string) => {
    if (!listId) return;
    await removeSpotFromList(session, listId, spotId);
    setSpots((prev) => prev.filter((s) => s.id !== spotId));
    setList((prev) => (prev ? { ...prev, spot_count: Math.max(0, prev.spot_count - 1) } : prev));
  };

  if (loading) return <div className="px-4 py-10 text-sm text-miyeon-main/60">Loading…</div>;
  if (!list) return <div className="px-4 py-10 text-sm text-miyeon-main/60">List not found.</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <button
        onClick={() => navigate(`/curator/${id}`)}
        className="flex items-center gap-1 text-xs font-semibold text-miyeon-main/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to profile
      </button>

      <div>
        <h1 className="font-display text-2xl text-miyeon-main">{list.title}</h1>
        {list.description && <p className="mt-1 text-sm text-miyeon-main/70">{list.description}</p>}
        <p className="mt-1 text-xs font-semibold text-miyeon-main/50">
          {list.spot_count} spot{list.spot_count === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/map?list=${list.id}`}
          className="flex items-center gap-1.5 rounded-full border border-miyeon-neutral px-3.5 py-1.5 text-xs font-semibold text-miyeon-main hover:border-miyeon-sub1/50"
        >
          <MapPin className="h-3.5 w-3.5" /> View on map
        </Link>
        {isOwner && (
          <button
            onClick={() => setIsPicking((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full bg-miyeon-sub1 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-miyeon-sub1/30"
          >
            <Plus className="h-3.5 w-3.5" /> Add spot
          </button>
        )}
      </div>

      {isOwner && isPicking && (
        <div className="rounded-2xl border border-miyeon-neutral bg-miyeon-neutral/20 p-3">
          <PlaceSearchPicker
            onSelect={(place) => {
              setPendingPlace(place);
              setIsPicking(false);
            }}
            onClose={() => setIsPicking(false)}
          />
        </div>
      )}

      {isOwner && pendingPlace && (
        <div className="space-y-2 rounded-2xl border border-miyeon-sub1/40 bg-white p-3">
          <p className="text-sm font-semibold text-miyeon-main">Add "{pendingPlace.name}"</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a personal note (optional)…"
            rows={2}
            className="w-full resize-none rounded-xl border border-miyeon-neutral bg-white px-3 py-2 text-sm text-miyeon-main placeholder:text-miyeon-main/40 focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={confirmAddSpot} className="rounded-full bg-miyeon-sub1 px-4 py-1.5 text-xs font-bold text-white">
              Add to list
            </button>
            <button
              onClick={() => {
                setPendingPlace(null);
                setNote('');
              }}
              className="rounded-full border border-miyeon-neutral px-4 py-1.5 text-xs font-semibold text-miyeon-main"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {spots.length === 0 ? (
        <p className="text-sm text-miyeon-main/60">No spots in this list yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {spots.map((spot) => (
            <div key={spot.id} className="space-y-1.5">
              <div className="relative">
                <PlaceCard place={spot.place} onView={(place) => navigate(`/place/${place.id}`)} />
                {isOwner && (
                  <button
                    onClick={() => handleRemove(spot.id)}
                    aria-label="Remove spot"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-miyeon-main shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {spot.note && <p className="px-1 text-xs italic text-miyeon-main/60">"{spot.note}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
