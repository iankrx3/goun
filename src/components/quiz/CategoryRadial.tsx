import React from 'react';
import type { BeautyCategory } from '../../types';
import { categoryMeta } from '../../data/mock';

interface CategoryRadialProps {
  onSelect: (category: BeautyCategory) => void;
}

const CATEGORIES = Object.keys(categoryMeta) as BeautyCategory[];

// Home — §2-1: 5 Beauty Category icons arranged around the central SNIFF interaction.
export const CategoryRadial: React.FC<CategoryRadialProps> = ({ onSelect }) => {
  const radius = 128;
  const angleStep = (2 * Math.PI) / CATEGORIES.length;

  return (
    <div className="relative mx-auto flex h-[340px] w-[340px] max-w-full items-center justify-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-goun-rose text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-goun-rose/30">
        Explore
      </div>

      {CATEGORIES.map((category, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const meta = categoryMeta[category];
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            className="group absolute flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full bg-han-cream text-warm-taupe shadow-sm transition-all hover:bg-goun-rose hover:text-white"
          >
            <span className="text-xl">{meta.icon}</span>
            <span className="text-[11px] font-semibold">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};
