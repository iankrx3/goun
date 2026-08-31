import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MatchResult } from '../types';

interface ResultCardProps {
  result: MatchResult;
  rank: 1 | 2 | 3;
}

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' } as const;

// §2-5 — AI Recommendation result card with Match % (Bodoni, §15.3).
export const ResultCard: React.FC<ResultCardProps> = ({ result, rank }) => {
  const navigate = useNavigate();
  const { treatment, place, matchScore, reasons } = result;

  return (
    <div className="rounded-3xl border border-han-cream bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-warm-taupe/60">
          {medal[rank]} {rank === 1 ? 'Top Match' : `#${rank} Match`}
        </span>
        <span className="font-display text-3xl text-goun-rose">{matchScore}%</span>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-warm-taupe">{treatment.name}</h3>
      <p className="text-xs text-warm-taupe/60">{place.name} · {place.area}</p>
      {place.medicalTourismMatch && (
        <p className="mt-1 text-[11px] text-warm-taupe/50">Registered with Korea Medical Tourism Info (KTO)</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reasons.map((reason) => (
          <span key={reason} className="rounded-full bg-han-cream px-2.5 py-1 text-[11px] font-medium text-warm-taupe">
            {reason}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate(`/treatment/${treatment.id}`)}
          className="flex-1 rounded-full border border-warm-taupe/30 px-4 py-2.5 text-xs font-bold text-warm-taupe"
        >
          VIEW TREATMENT
        </button>
        <a
          href={treatment.creatripUrl || place.bookingUrl || 'https://www.creatrip.com/en'}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full bg-goun-rose px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm shadow-goun-rose/30"
        >
          BOOK WITH CREATRIP →
        </a>
      </div>
    </div>
  );
};
