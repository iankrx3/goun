import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Star, X } from 'lucide-react';
import { MapView } from '../components/MapView';
import { useSavedPlaces } from '../hooks/useSavedPlaces';
import type { Place } from '../types';

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { isSaved, toggleSave } = useSavedPlaces();

  return (
    <div className="relative">
      <MapView onSelectPlace={setSelectedPlace} />

      {selectedPlace && (
        <div className="absolute bottom-4 left-1/2 z-30 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-han-cream bg-white p-4 shadow-2xl">
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute right-3 top-3 text-warm-taupe/40 hover:text-warm-taupe"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-6 text-sm font-semibold text-warm-taupe">{selectedPlace.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-taupe/60">
            <Star className="h-3 w-3 fill-goun-rose text-goun-rose" /> {selectedPlace.rating} · {selectedPlace.priceRange} · {selectedPlace.area}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/place/${selectedPlace.id}`)}
              className="flex-1 rounded-full bg-warm-taupe px-4 py-2 text-xs font-bold text-white"
            >
              VIEW PLACE
            </button>
            <button
              onClick={() => toggleSave(selectedPlace.id)}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold ${
                isSaved(selectedPlace.id) ? 'border-goun-rose bg-goun-rose text-white' : 'border-han-cream text-warm-taupe'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={isSaved(selectedPlace.id) ? 'currentColor' : 'none'} />
              {isSaved(selectedPlace.id) ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
