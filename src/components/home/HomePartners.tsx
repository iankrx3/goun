import React from 'react';
import { partnerNames } from '../../data/home';

export const HomePartners: React.FC = () => (
  <section className="bg-miyeon-ink px-5 py-12 text-center sm:px-8 sm:py-14">
    <div className="mx-auto max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
        In partnership with
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
        {partnerNames.map((name) => (
          <span
            key={name}
            className={`text-white/80 ${
              name === 'amazon' || name === 'o3c' ? 'font-serif text-xl italic' : 'text-sm font-semibold tracking-wide sm:text-base'
            }`}
          >
            {name}
          </span>
        ))}
      </div>
      <p className="mt-8 text-xs text-white/40 sm:text-sm">
        Every treatment we show is actually bookable — no dead ends.
      </p>
    </div>
  </section>
);
