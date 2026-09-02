import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MatchResult } from '../types';
import { withCreatripAffiliate, CREATRIP_BASE_URL } from '../lib/creatrip';

interface ResultCardProps {
  result: MatchResult;
  rank: 1 | 2 | 3;
  /** Rank-1 only — the personalized italic "why this" line, built from the quiz answers. */
  quote?: string;
}

const TIER = {
  1: { badge: '🥇', label: 'YOUR MATCH', fallbackTagline: "Miyeon's top pick for you." },
  2: { badge: '💎', label: 'GO BIGGER', fallbackTagline: 'Same direction — stronger effect.' },
  3: { badge: '🔄', label: 'THE OTHER ROUTE', fallbackTagline: 'A different way to get there.' },
} as const;

const DOWNTIME_LABEL: Record<string, string> = {
  none: 'No downtime',
  '1-3-days': '1–3 days downtime',
  '3-7-days': '3–7 days downtime',
  'no-mind': 'Flexible downtime',
};

function priceLabel(price: { min: number; max: number }): string {
  return price.min === price.max ? `$${price.min}` : `$${price.min}–${price.max}`;
}

// §02-7 — "Miyeon's Picks" result card, tiered by rank (YOUR MATCH / GO BIGGER / THE OTHER ROUTE).
export const ResultCard: React.FC<ResultCardProps> = ({ result, rank, quote }) => {
  const navigate = useNavigate();
  const { treatment, place, matchScore, reasons } = result;
  const tier = TIER[rank];
  const isPrimary = rank === 1;
  const bulletCount = isPrimary ? 3 : 2;

  return (
    <div
      className={`rounded-3xl border bg-white p-5 shadow-sm ${
        isPrimary ? 'border-miyeon-sub1/50' : 'border-miyeon-neutral'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-miyeon-main/60">
          {tier.badge} {tier.label}
        </span>
        <span className="text-xs font-semibold text-miyeon-sub1">Miyeon says: {matchScore}% Match</span>
      </div>

      {isPrimary && quote ? (
        <p className="mt-2 text-sm italic leading-snug text-miyeon-main/80">"{quote}"</p>
      ) : (
        <p className="mt-2 text-sm text-miyeon-main/70">{tier.fallbackTagline}</p>
      )}

      <h3 className="mt-2 text-lg font-semibold text-miyeon-main">{treatment.name}</h3>
      <p className="text-xs text-miyeon-main/60">
        {place.name} · {place.area}
      </p>

      <p className="mt-2 text-xs font-medium text-miyeon-main/70">
        {priceLabel(treatment.price)}
        {treatment.durationMinutes ? ` · ${treatment.durationMinutes} min` : ''} ·{' '}
        {DOWNTIME_LABEL[treatment.downtime] ?? treatment.downtime}
      </p>

      <div className="mt-3 space-y-1">
        {reasons.slice(0, bulletCount).map((reason) => (
          <p key={reason} className="flex items-start gap-1.5 text-xs text-miyeon-main/70">
            <span className="text-miyeon-sub1">✓</span> {reason}
          </p>
        ))}
      </div>

      {isPrimary && (
        <p className="mt-2 text-[11px] text-miyeon-main/50">{treatment.reviewCount} reviews from foreign visitors</p>
      )}
      {place.medicalTourismMatch && (
        <p className="mt-1 text-[11px] text-miyeon-main/50">Registered with Korea Medical Tourism Info (KTO)</p>
      )}

      <div className="mt-4 flex gap-2">
        {isPrimary && (
          <button
            onClick={() => navigate(`/treatment/${treatment.id}`)}
            className="flex-1 rounded-full border border-miyeon-main/30 px-4 py-2.5 text-xs font-bold text-miyeon-main"
          >
            VIEW TREATMENT
          </button>
        )}
        <a
          href={withCreatripAffiliate(treatment.creatripUrl || place.bookingUrl || CREATRIP_BASE_URL)}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full bg-miyeon-sub1 px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm shadow-miyeon-sub1/30"
        >
          CHECK AVAILABILITY →
        </a>
      </div>
    </div>
  );
};
