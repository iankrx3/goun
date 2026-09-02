import React from 'react';
import type { VibePair } from '../../data/quiz';

interface PairChoiceProps {
  pair: VibePair;
  value?: string;
  onChange: (value: string) => void;
}

// §2-3 — "A vs B" vibe pair, three per screen.
export const PairChoice: React.FC<PairChoiceProps> = ({ pair, value, onChange }) => (
  <div className="relative grid grid-cols-2 gap-2">
    {[pair.a, pair.b].map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`rounded-2xl border px-3 py-4 text-sm font-medium transition-all ${
          value === option
            ? 'border-miyeon-sub1 bg-miyeon-sub1 text-white shadow-sm shadow-miyeon-sub1/25'
            : 'border-miyeon-neutral bg-white text-miyeon-main hover:border-miyeon-sub1/50'
        }`}
      >
        {option}
      </button>
    ))}
    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-miyeon-neutral bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-miyeon-main/50 shadow-sm">
      OR
    </span>
  </div>
);
