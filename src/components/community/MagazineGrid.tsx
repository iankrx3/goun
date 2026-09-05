import React from 'react';
import { magazineArticles } from '../../data/magazine';

export const MagazineGrid: React.FC = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {magazineArticles.map((article) => (
      <div key={article.id} className="block">
        <div className={`aspect-[5/3] rounded-2xl bg-gradient-to-br ${article.gradient}`} />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-miyeon-sub1">
          {article.kind}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug text-miyeon-main">{article.title}</h3>
        <p className="mt-1 text-sm text-miyeon-main/60">{article.excerpt}</p>
        <p className="mt-1 text-xs text-miyeon-main/45">{article.minutes} min read</p>
      </div>
    ))}
  </div>
);
