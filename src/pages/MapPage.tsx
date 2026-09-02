import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, List, Map as MapIcon, Star, X } from 'lucide-react';
import { MapView } from '../components/MapView';
import { PlaceListView } from '../components/PlaceListView';
import { useSavedPlaces } from '../hooks/useSavedPlaces';
import type { Place } from '../types';

export default function MapPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { isSaved, toggleSave } = useSavedPlaces();

  return (
    <div className="relative">
      {viewMode === 'map' ? <MapView onSelectPlace={setSelectedPlace} /> : <PlaceListView />}

      <button
        onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        aria-label={viewMode === 'map' ? 'Switch to list view' : 'Switch to map view'}
        title={viewMode === 'map' ? 'Switch to list view' : 'Switch to map view'}
        className="absolute left-3 bottom-[84px] z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-miyeon-main shadow-lg border border-black/5 transition-all hover:scale-105 active:scale-95 hover:text-miyeon-sub1 sm:bottom-5"
      >
        {viewMode === 'map' ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
      </button>

      {viewMode === 'map' && selectedPlace && (
        <div className="absolute bottom-[80px] left-1/2 z-30 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-miyeon-neutral bg-white p-4 shadow-2xl sm:bottom-4">
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute right-3 top-3 text-miyeon-main/40 hover:text-miyeon-main"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-6 text-sm font-semibold text-miyeon-main">{selectedPlace.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-miyeon-main/60">
            <Star className="h-3 w-3 fill-miyeon-sub1 text-miyeon-sub1" /> {selectedPlace.rating} · {selectedPlace.priceRange} · {selectedPlace.area}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/place/${selectedPlace.id}`)}
              className="flex-1 rounded-full bg-miyeon-main px-4 py-2 text-xs font-bold text-white"
            >
              VIEW PLACE
            </button>
            <button
              onClick={() => toggleSave(selectedPlace.id)}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold ${
                isSaved(selectedPlace.id) ? 'border-miyeon-sub1 bg-miyeon-sub1 text-white' : 'border-miyeon-neutral text-miyeon-main'
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
