import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Globe, Instagram, ListPlus, MapPin, Music2, Pencil } from 'lucide-react';
import type { Creator, CreatorPick, CuratorList, Place, UserSession } from '../types';
import { fetchCreatorPicksByCreatorId } from '../services/places';
import { createList, fetchCuratorById, fetchCuratorLists } from '../services/curator';
import { PlaceCard } from '../components/place/PlaceCard';

interface CuratorProfilePageProps {
  session: UserSession;
}

export default function CuratorProfilePage({ session }: CuratorProfilePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [lists, setLists] = useState<CuratorList[]>([]);
  const [picks, setPicks] = useState<CreatorPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const isOwner = Boolean(id && session.creator?.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchCuratorById(id), fetchCuratorLists(id), fetchCreatorPicksByCreatorId(id)])
      .then(([c, l, p]) => {
        setCreator(c);
        setLists(l);
        setPicks(p);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const viewPlace = (place: Place) => navigate(`/place/${place.id}`);

  const totalSpots = lists.reduce((sum, l) => sum + l.spot_count, 0);

  const handleCreateList = async () => {
    if (!newListTitle.trim() || !id) return;
    const list = await createList(session, { title: newListTitle.trim() });
    setNewListTitle('');
    setIsCreatingList(false);
    navigate(`/curator/${id}/lists/${list.id}`);
  };

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
        <motion.img
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          src={creator.avatar_url}
          alt={creator.display_name}
          referrerPolicy="no-referrer"
          className="h-24 w-24 rounded-full object-cover ring-2 ring-miyeon-sub1/30"
        />
        <h1 className="mt-3 font-display text-2xl text-miyeon-main">{creator.display_name}</h1>
        <p className="text-xs font-medium text-miyeon-main/70">@{creator.username}</p>
        {creator.bio && <p className="mt-3 max-w-md text-sm text-miyeon-main/80">{creator.bio}</p>}

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-miyeon-main/60">
          <MapPin className="h-3.5 w-3.5" /> {totalSpots} spot{totalSpots === 1 ? '' : 's'} curated
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

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            to={`/map?curator=${creator.id}`}
            className="flex items-center gap-1.5 rounded-full border border-miyeon-neutral px-3.5 py-1.5 text-xs font-semibold text-miyeon-main hover:border-miyeon-sub1/50"
          >
            <MapPin className="h-3.5 w-3.5" /> View on map
          </Link>
          {isOwner && (
            <>
              <Link
                to={`/curator/${creator.id}/edit`}
                className="flex items-center gap-1.5 rounded-full border border-miyeon-neutral px-3.5 py-1.5 text-xs font-semibold text-miyeon-main hover:border-miyeon-sub1/50"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit profile
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreatingList((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full bg-miyeon-sub1 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-miyeon-sub1/30"
              >
                <ListPlus className="h-3.5 w-3.5" /> New list
              </motion.button>
            </>
          )}
        </div>

        <AnimatePresence>
          {isOwner && isCreatingList && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full max-w-xs items-center gap-2 overflow-hidden"
            >
              <input
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List name…"
                className="w-full rounded-full border border-miyeon-neutral bg-white px-3.5 py-2 text-sm text-miyeon-main placeholder:text-miyeon-main/60 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateList}
                className="shrink-0 rounded-full bg-miyeon-sub1 px-3.5 py-2 text-xs font-bold text-white"
              >
                Create
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-miyeon-main">Lists</h2>
        {lists.length === 0 ? (
          <p className="mt-2 text-sm text-miyeon-main/60">No lists yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {lists.map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={`/curator/${creator.id}/lists/${list.id}`}
                  className="block overflow-hidden rounded-2xl border border-miyeon-neutral bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-miyeon-main/10"
                >
                  {list.cover_photo_url ? (
                    <img src={list.cover_photo_url} alt={list.title} className="h-24 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center bg-miyeon-neutral/50 text-miyeon-main/50">
                      <MapPin className="h-6 w-6" />
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="truncate text-sm font-semibold text-miyeon-main">{list.title}</p>
                    <p className="text-[11px] text-miyeon-main/70">
                      {list.spot_count} spot{list.spot_count === 1 ? '' : 's'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {picks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-miyeon-main">All picks</h2>
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
        </div>
      )}
    </div>
  );
}
