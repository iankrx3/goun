import React from 'react';
import { Link } from 'react-router-dom';
import { trendingItems } from '../../data/home';

export const HomeTrending: React.FC = () => (
  <section className="bg-miyeon-neutral/70 px-5 py-12 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-miyeon-main/40">
            What’s hot right now
          </p>
          <h2 className="mt-2 font-display text-2xl font-normal text-miyeon-main sm:text-3xl">
            Trending in Seoul
          </h2>
        </div>
        <Link
          to="/community"
          className="hidden text-sm text-miyeon-main/50 transition-colors hover:text-miyeon-main md:inline"
        >
          See all →
        </Link>
      </div>

      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {trendingItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="min-w-[70%] snap-start md:min-w-0"
          >
            <div className={`aspect-[5/3] rounded-2xl bg-gradient-to-br ${item.gradient}`} />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-miyeon-sub1">
              {item.kind}
            </p>
            <h3 className="mt-1 whitespace-pre-line font-display text-lg leading-snug text-miyeon-main">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-miyeon-main/45">{item.minutes} min read</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
