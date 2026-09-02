import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Globe, Instagram, MapPin, Music2 } from 'lucide-react';
import type { Creator, CreatorPick, Place } from '../types';
import { fetchCreatorById, fetchCreatorPicksByCreatorId } from '../services/places';
import { PlaceCard } from '../components/PlaceCard';

export default function CuratorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [picks, setPicks] = useState<CreatorPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchCreatorById(id), fetchCreatorPicksByCreatorId(id)])
      .then(([c, p]) => {
        setCreator(c);
        setPicks(p);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const viewPlace = (place: Place) => navigate(`/place/${place.id}`);

  if (loading) return <div className="px-4 py-10 text-sm text-miyeon-main/60">Loading…</div>;
  if (!creator) return <div className="px-4 py-10 text-sm text-miyeon-main/60">Curator not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-[var(--bottom-nav-h)] sm:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-semibold text-miyeon-main/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="mt-4 flex flex-col items-center text-center">
        <img
          src={creator.avatar_url}
          alt={creator.display_name}
          referrerPolicy="no-referrer"
          className="h-24 w-24 rounded-full object-cover ring-2 ring-miyeon-sub1/30"
        />
        <h1 className="mt-3 font-display text-2xl text-miyeon-main">{creator.display_name}</h1>
        <p className="text-xs font-medium text-miyeon-main/50">@{creator.username}</p>
        {creator.bio && <p className="mt-3 max-w-md text-sm text-miyeon-main/80">{creator.bio}</p>}

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-miyeon-main/60">
          <MapPin className="h-3.5 w-3.5" /> {creator.picks_count} place{creator.picks_count === 1 ? '' : 's'} curated
        </div>

        {(creator.instagram_url || creator.tiktok_url || creator.website_url) && (
          <div className="mt-4 flex items-center gap-3">
            {creator.instagram_url && (
              <a
                href={creator.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-miyeon-neutral text-miyeon-main hover:border-miyeon-sub1/50 hover:text-miyeon-sub1"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {creator.tiktok_url && (
              <a
                href={creator.tiktok_url}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-miyeon-neutral text-miyeon-main hover:border-miyeon-sub1/50 hover:text-miyeon-sub1"
              >
                <Music2 className="h-4 w-4" />
              </a>
            )}
            {creator.website_url && (
              <a
                href={creator.website_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-miyeon-neutral text-miyeon-main hover:border-miyeon-sub1/50 hover:text-miyeon-sub1"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-miyeon-main">Places curated by {creator.display_name}</h2>
        {picks.length === 0 ? (
          <p className="mt-2 text-sm text-miyeon-main/60">No places curated yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {picks.map((pick) => (
              <div key={pick.id} className="space-y-1.5">
                <PlaceCard place={pick.place} onView={viewPlace} />
                {pick.personal_note && (
                  <p className="px-1 text-xs italic text-miyeon-main/60">"{pick.personal_note}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
