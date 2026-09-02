import React from 'react';
import { Megaphone } from 'lucide-react';
import type { Place } from '../types';
import { PlaceCard } from './PlaceCard';

export const AdBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-miyeon-sub1 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
    <Megaphone className="h-3 w-3" /> {label}
  </span>
);

export const SponsoredPlaceCard: React.FC<{ place: Place; onView: (place: Place) => void }> = ({
  place,
  onView,
}) => (
  <div className="space-y-1.5 rounded-2xl border-2 border-miyeon-sub1/40 bg-miyeon-sub1/5 p-2">
    <AdBadge label="광고 · 추천" />
    <PlaceCard place={place} onView={onView} />
  </div>
);
