import React from 'react';
import type { BeautyCategory } from '../../types';
import { categoryMeta } from '../../data/mock';

interface CategoryRadialProps {
  categories?: BeautyCategory[];
  centerLabel?: string;
  onSelect: (category: BeautyCategory) => void;
}

const ALL_CATEGORIES = Object.keys(categoryMeta) as BeautyCategory[];

// §02-2 — Beauty Category icons arranged around a central hub. Trimmed to Skin/Face
// under Treatments; the full 5-way set stays available for a future Salon build.
export const CategoryRadial: React.FC<CategoryRadialProps> = ({
  categories = ALL_CATEGORIES,
  centerLabel = 'Explore',
  onSelect,
}) => {
  const radius = 128;
  const angleStep = (2 * Math.PI) / categories.length;

  return (
    <div className="relative mx-auto flex h-[340px] w-[340px] max-w-full items-center justify-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-miyeon-sub1 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-miyeon-sub1/30">
        {centerLabel}
      </div>

      {categories.map((category, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const meta = categoryMeta[category];
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            className="group absolute flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full bg-miyeon-neutral text-miyeon-main shadow-sm transition-all hover:bg-miyeon-sub1 hover:text-white"
          >
            <span className="text-xl">{meta.icon}</span>
            <span className="text-[11px] font-semibold">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};
