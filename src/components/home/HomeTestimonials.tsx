import React from 'react';
import { testimonials } from '../../data/home';

export const HomeTestimonials: React.FC = () => (
  <section className="px-5 py-12 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-miyeon-main/40">
        Used by 1,200+ travelers &amp; creators
      </p>
      <h2 className="mt-2 font-display text-2xl font-normal text-miyeon-main sm:text-3xl">
        They stopped guessing.
      </h2>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {testimonials.map((item) => (
          <blockquote
            key={item.id}
            className="min-w-[82%] snap-start rounded-[1.4rem] border border-miyeon-neutral bg-white p-5 md:min-w-0"
          >
            <div className="flex items-center gap-3">
              <span className={`h-9 w-9 rounded-full ${item.avatarClass}`} />
              <div>
                <p className="text-sm font-semibold text-miyeon-main">{item.name}</p>
                <p className="text-xs text-miyeon-main/45">{item.meta}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-miyeon-main/80">“{item.quote}”</p>
            <span className="mt-4 inline-block rounded-full bg-miyeon-neutral px-2.5 py-1 text-[11px] text-miyeon-main/70">
              {item.chip}
            </span>
          </blockquote>
        ))}
      </div>
    </div>
  </section>
);
