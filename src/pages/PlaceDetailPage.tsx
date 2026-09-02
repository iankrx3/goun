import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, ChevronLeft, Navigation, Star } from 'lucide-react';
import type { CommunityPost, Place, Treatment } from '../types';
import { fetchPlaceById, fetchTreatments } from '../services/places';
import { fetchCommunityPosts } from '../services/community';
import { useSavedPlaces } from '../hooks/useSavedPlaces';
import { MedicalTourismSection, NearbyWellnessSection } from '../components/badges/KtoBadges';
import { GroundedInfo } from '../components/GroundedInfo';
import { getDirectionsLinks } from '../lib/directions';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [reviews, setReviews] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedPlaces();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchPlaceById(id), fetchTreatments(), fetchCommunityPosts()])
      .then(([p, allTreatments, posts]) => {
        setPlace(p);
        setTreatments(allTreatments.filter((t) => p?.treatmentIds.includes(t.id)));
        setReviews(posts.filter((post) => post.placeId === id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="px-4 py-10 text-sm text-miyeon-main/60">Loading…</div>;
  if (!place) return <div className="px-4 py-10 text-sm text-miyeon-main/60">Place not found.</div>;

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <img src={place.photoUrl} alt={place.name} className="h-64 w-full object-cover sm:h-80" />

      <div className="space-y-6 px-4 py-6">
        <Link to="/map" className="flex items-center gap-1 text-xs font-semibold text-miyeon-main/60">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to map
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-miyeon-main">{place.name}</h1>
            <p className="mt-1 text-xs text-miyeon-main/60">{place.address}</p>
          </div>
          <button
            onClick={() => toggleSave(place.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold ${
              isSaved(place.id) ? 'border-miyeon-sub1 bg-miyeon-sub1 text-white' : 'border-miyeon-neutral text-miyeon-main'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={isSaved(place.id) ? 'currentColor' : 'none'} />
            {isSaved(place.id) ? 'Saved' : 'Save to My Map'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-miyeon-main">
          <span className="flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-miyeon-sub1 text-miyeon-sub1" /> {place.rating}
          </span>
          <span className="text-miyeon-main/50">({place.reviewCount} reviews)</span>
          <span>·</span>
          <span>{place.priceRange}</span>
          <span>·</span>
          <span>{place.language.join(', ')}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {getDirectionsLinks(place).map((link) => (
            <a
              key={link.provider}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-miyeon-neutral px-3.5 py-1.5 text-xs font-semibold text-miyeon-main hover:border-miyeon-sub1/50"
            >
              <Navigation className="h-3.5 w-3.5" /> {link.label}
            </a>
          ))}
        </div>

        {place.whyPeopleLikeIt && place.whyPeopleLikeIt.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-miyeon-main">Why people like it</h2>
            <ul className="mt-2 space-y-1 text-sm text-miyeon-main/80">
              {place.whyPeopleLikeIt.map((reason) => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
          </section>
        )}

        {treatments.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-miyeon-main">Treatments</h2>
            <div className="mt-2 space-y-2">
              {treatments.map((t) => (
                <Link
                  key={t.id}
                  to={`/treatment/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-miyeon-neutral px-3.5 py-3 text-sm"
                >
                  <span className="font-medium text-miyeon-main">{t.name}</span>
                  <span className="text-xs text-miyeon-main/60">
                    ${t.price.min}–${t.price.max}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <NearbyWellnessSection spots={place.nearbyWellness} />
        <MedicalTourismSection match={place.medicalTourismMatch} />
        <GroundedInfo place={place} />

        {reviews.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-miyeon-main">Community Reviews</h2>
            <div className="mt-2 space-y-2">
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  to={`/community/${r.id}`}
                  className="block rounded-xl border border-miyeon-neutral px-3.5 py-3 text-sm text-miyeon-main/80 hover:border-miyeon-sub1/50"
                >
                  <p className="font-medium text-miyeon-main">{r.authorName}</p>
                  <p className="mt-1">{r.text}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <a
          href={place.bookingUrl || 'https://www.creatrip.com/en'}
          target="_blank"
          rel="noreferrer"
          className="block rounded-full bg-miyeon-sub1 py-3.5 text-center text-sm font-bold text-white shadow-sm shadow-miyeon-sub1/30"
        >
          BOOK WITH CREATRIP →
        </a>
      </div>
    </div>
  );
}
