import React from 'react';
import type { VibePair } from '../../data/quiz';

interface PairChoiceProps {
  pair: VibePair;
  value?: string;
  onChange: (value: string) => void;
}

// §2-3 — "A vs B" vibe pair, three per screen.
export const PairChoice: React.FC<PairChoiceProps> = ({ pair, value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {[pair.a, pair.b].map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`rounded-2xl border px-3 py-4 text-sm font-medium transition-all ${
          value === option
            ? 'border-goun-rose bg-goun-rose text-white shadow-sm shadow-goun-rose/25'
            : 'border-han-cream bg-white text-warm-taupe hover:border-goun-rose/50'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);
