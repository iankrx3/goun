import React from 'react';
import { Link } from 'react-router-dom';
import type { MagazineArticle } from '../../types';

interface MagazineGridProps {
  articles: MagazineArticle[];
}

export const MagazineGrid: React.FC<MagazineGridProps> = ({ articles }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {articles.map((article) => (
      <Link key={article.id} to={`/magazine/${article.id}`} className="block">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="aspect-[5/3] w-full rounded-2xl object-cover"
        />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-miyeon-sub1">
          {article.kind}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug text-miyeon-main">{article.title}</h3>
        <p className="mt-1 text-sm text-miyeon-main/60">{article.excerpt}</p>
        <p className="mt-1 text-xs text-miyeon-main/45">
          by {article.authorName} · {article.minutes} min read
        </p>
      </Link>
    ))}
  </div>
);
