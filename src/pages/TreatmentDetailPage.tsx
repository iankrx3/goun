import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { Place, Treatment } from '../types';
import { fetchPlaceById, fetchTreatmentById } from '../services/places';

export default function TreatmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchTreatmentById(id)
      .then(async (t) => {
        setTreatment(t);
        if (t) setPlace(await fetchPlaceById(t.placeId));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="px-4 py-10 text-sm text-warm-taupe/60">Loading…</div>;
  if (!treatment) return <div className="px-4 py-10 text-sm text-warm-taupe/60">Treatment not found.</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <Link to="/" className="flex items-center gap-1 text-xs font-semibold text-warm-taupe/60">
        <ChevronLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-goun-rose">{treatment.category}</p>
        <h1 className="font-display text-3xl text-warm-taupe">{treatment.name}</h1>
        <p className="mt-2 text-sm text-warm-taupe/70">{treatment.expectedResult}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Fact label="Price" value={`$${treatment.price.min}–$${treatment.price.max}`} />
        <Fact label="Downtime" value={treatment.downtime.replace(/-/g, ' ')} />
        <Fact label="Result Timing" value={treatment.resultTiming.replace(/-/g, ' ')} />
        <Fact label="Intensity" value={treatment.intensity} />
        <Fact label="Languages" value={treatment.language.join(', ')} />
        <Fact label="Rating" value={`★ ${treatment.rating} (${treatment.reviewCount})`} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-warm-taupe">Best for</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {treatment.concern.map((c) => (
            <span key={c} className="rounded-full bg-han-cream px-2.5 py-1 text-[11px] font-medium text-warm-taupe">
              {c}
            </span>
          ))}
        </div>
      </div>

      {place && (
        <Link to={`/place/${place.id}`} className="block rounded-2xl border border-han-cream bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-taupe/50">Available at</p>
          <p className="mt-1 text-sm font-semibold text-warm-taupe">{place.name}</p>
          <p className="text-xs text-warm-taupe/60">{place.area}</p>
        </Link>
      )}

      <a
        href={treatment.creatripUrl || 'https://www.creatrip.com/en'}
        target="_blank"
        rel="noreferrer"
        className="block rounded-full bg-goun-rose py-3.5 text-center text-sm font-bold text-white shadow-sm shadow-goun-rose/30"
      >
        BOOK WITH CREATRIP →
      </a>
    </div>
  );
}

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-han-cream/40 px-3 py-2.5">
    <p className="text-[10px] uppercase tracking-wider text-warm-taupe/50">{label}</p>
    <p className="mt-0.5 font-medium capitalize text-warm-taupe">{value}</p>
  </div>
);
