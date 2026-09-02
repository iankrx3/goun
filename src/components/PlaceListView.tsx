import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Place } from '../types';
import { fetchPlaces } from '../services/places';
import { ENABLED_MAP_CATEGORIES } from '../data/mapCategories';
import { hasCreatripListing } from '../lib/creatrip';
import { PlaceCard } from './PlaceCard';
import { AdBadge, SponsoredPlaceCard } from './SponsoredPlaceCard';

export const PlaceListView: React.FC = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlaces()
      .then((list) => {
        const filtered = list
          .filter((p) => ENABLED_MAP_CATEGORIES.includes(p.category))
          .sort((a, b) => b.rating - a.rating);
        setPlaces(filtered);
      })
      .finally(() => setLoading(false));
  }, []);

  const viewPlace = (place: Place) => navigate(`/place/${place.id}`);

  if (loading) {
    return <div className="px-4 py-10 text-sm text-miyeon-main/60">Loading…</div>;
  }
  if (places.length === 0) {
    return <div className="px-4 py-10 text-sm text-miyeon-main/60">No places found.</div>;
  }

  const sponsored = places.find(hasCreatripListing);
  const rest = sponsored ? places.filter((p) => p.id !== sponsored.id) : places;

  return (
    <div className="mx-auto h-[calc(100dvh-64px)] max-w-2xl overflow-y-auto px-4 py-4 pb-[calc(var(--bottom-nav-h)+16px)] sm:pb-4">
      {sponsored && (
        <div className="mb-4">
          <SponsoredPlaceCard place={sponsored} onView={viewPlace} />
        </div>
      )}

      <div className="space-y-4">
        {rest.map((place) => (
          <div key={place.id} className="relative">
            {hasCreatripListing(place) && (
              <div className="absolute left-2 top-2 z-10">
                <AdBadge label="광고" />
              </div>
            )}
            <PlaceCard place={place} onView={viewPlace} />
          </div>
        ))}
      </div>
    </div>
  );
};
